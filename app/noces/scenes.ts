/* Objets 3D intégrés aux transitions de /noces/ :
 * - le shinkansen traverse la jonction Tokyo → Nara et « essuie » la page derrière lui ;
 * - le torii se dresse sur le papier et s'ouvre, en passant dessous, sur la nuit d'Osaka. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { peel } from './peel';

export type SceneKind = 'train' | 'torii';
/** animated : la scène bouge aussi sans scroll (tissu), il faut la redessiner à chaque image. */
export type SceneHandle = { render: (p: number) => void; resize: () => void; dispose: () => void; animated?: boolean };

const base = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/assets/models/noces`;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = THREE.MathUtils.lerp;

/** Pose la base d'un modèle à y = 0, centré en x/z, à une hauteur donnée. */
function normalize(object: THREE.Object3D, height?: number) {
  const box = new THREE.Box3().setFromObject(object);
  if (height) object.scale.multiplyScalar(height / box.getSize(new THREE.Vector3()).y);
  box.setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  object.position.sub(new THREE.Vector3(center.x, box.min.y, center.z));
  const wrapper = new THREE.Group();
  wrapper.add(object);
  return wrapper;
}

function castShadows(object: THREE.Object3D) {
  object.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
}

type Engine = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  loader: GLTFLoader;
  resize: () => void;
  dispose: () => void;
};

function createEngine(canvas: HTMLCanvasElement, mobile: boolean, onResize?: (camera: THREE.PerspectiveCamera) => void): Engine {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  scene.environment = pmrem.fromScene(room, 0.04).texture;
  room.dispose();
  pmrem.dispose();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 400);
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  return {
    renderer, scene, camera, loader,
    resize: () => {
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      onResize?.(camera);
      camera.updateProjectionMatrix();
    },
    dispose: () => {
      scene.environment?.dispose();
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
        for (const m of mats) {
          for (const v of Object.values(m)) if (v instanceof THREE.Texture) v.dispose();
          m.dispose();
        }
      });
      renderer.dispose();
    },
  };
}

/** Plan invisible qui ne reçoit que l'ombre : l'objet semble posé sur la page. */
function shadowCatcher(size: number, opacity: number) {
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.ShadowMaterial({ opacity }));
  plane.rotation.x = -Math.PI / 2;
  plane.receiveShadow = true;
  return plane;
}

/* ---------- Shinkansen : traversée de la jonction Tokyo → Nara ---------- */

async function trainScene(canvas: HTMLCanvasElement, host: HTMLElement, mobile: boolean): Promise<SceneHandle> {
  const engine = createEngine(canvas, mobile, (camera) => {
    // Portrait : champ plus large pour que le train garde une hauteur lisible.
    camera.fov = camera.aspect < 0.8 ? 38 : 26;
  });
  const { scene, camera, loader, renderer } = engine;
  const gltf = await loader.loadAsync(`${base}/shinkansen.glb`);

  // Motrice orientée le long de x, nez vers les x négatifs : le train roule vers la gauche de l'écran.
  const car = normalize(gltf.scene);
  car.scale.setScalar(3.4 / new THREE.Box3().setFromObject(car).getSize(new THREE.Vector3()).z);
  const carBox = new THREE.Box3().setFromObject(car);
  car.position.x -= carBox.min.x; // nez en x = 0
  const carLength = carBox.max.x - carBox.min.x;
  car.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    for (const m of [mesh.material].flat() as THREE.MeshStandardMaterial[]) {
      if (m.color && m.color.r > 0.7 && m.color.g > 0.7) { m.roughness = 0.18; m.metalness = 0.05; m.envMapIntensity = 1.3; }
      else m.envMapIntensity = 0.9;
    }
  });
  castShadows(car);
  // Rame courte : deux motrices dos à dos, un nez à chaque extrémité.
  const GAP = -0.9; // les deux soufflets d'intercirculation se rejoignent
  const rear = new THREE.Group();
  rear.add(car.clone());
  rear.rotation.y = Math.PI;
  rear.position.x = 2 * carLength + GAP;
  const length = 2 * carLength + GAP;
  const rig = new THREE.Group();
  rig.add(car, rear);
  scene.add(rig);

  scene.add(shadowCatcher(800, 0.35));
  const hemi = new THREE.HemisphereLight(0xe4eef5, 0x2e3a33, 0.45);
  renderer.toneMappingExposure = 0.8;
  const key = new THREE.DirectionalLight(0xffffff, 2.1);
  key.position.set(-14, 30, 18);
  key.castShadow = true;
  key.shadow.mapSize.setScalar(mobile ? 1024 : 2048);
  // Assez large pour couvrir aussi le rideau : ses plis se font de l'ombre entre eux.
  Object.assign(key.shadow.camera, { left: -110, right: 110, top: 80, bottom: -80, near: 1, far: 260 });
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.6;
  key.shadow.radius = 5;
  const rim = new THREE.DirectionalLight(0xbfe6d0, 1.4);
  rim.position.set(30, 12, -26);
  scene.add(hemi, key, key.target, rim);

  const cool = new THREE.Color(0xd6e6f2);
  const warm = new THREE.Color(0xffe6c4);
  const point = new THREE.Vector3();
  const look = new THREE.Vector3(0, 1.8, 0);
  camera.position.set(-8, 10.5, 32);
  const screenX = (x: number) => point.set(x, 1.6, 0).project(camera).x * 50 + 50; // % de largeur
  /** Position x du monde qui se projette à une abscisse d'écran donnée (en %). */
  const solveX = (target: number) => {
    // Bornes devant la caméra uniquement (au-delà, la projection s'inverse).
    let lo = -160, hi = 800;
    for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (screenX(mid) < target) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  };
  // Autocollant « nuit de Tokyo » décollé par la ficelle du train, à partir du coin supérieur droit.
  const sticker = host.querySelector<HTMLElement>('.fx-sticker');
  const flap = host.querySelector<SVGPolygonElement>('.fx-flap');
  const grad = host.querySelector<SVGLinearGradientElement>('#fx-flap-grad');
  const cord = host.querySelector<SVGPathElement>('.fx-peel-cord');
  const ring = host.querySelector<SVGCircleElement>('.fx-peel-ring');
  const tip = new THREE.Vector3();
  const size = () => ({ w: canvas.clientWidth || window.innerWidth, h: canvas.clientHeight || window.innerHeight });
  /** Queue du train (bout du nez arrière) en pixels d'écran pour une position x du train. */
  const tailAt = (x: number) => {
    const { w, h } = size();
    tip.set(x + length - 0.3, 1.05, 0).project(camera);
    return { x: (tip.x * 0.5 + 0.5) * w, y: (0.5 - tip.y * 0.5) * h };
  };
  let cordLength = 1;
  let tailEndX = 0;
  let start = 0, end = 0;
  const frame = () => {
    camera.lookAt(look);
    camera.updateMatrixWorld();
    const { w, h } = size();
    // Le nez est déjà à l'écran quand on arrive sur la section (plus engagé sur téléphone, plus étroit).
    start = solveX(w < 700 ? 40 : 72);
    // Ficelle un peu plus longue que la hauteur du coin au-dessus de la queue : elle pend avant de se tendre.
    const ty = tailAt(solveX(50) - length).y;
    cordLength = ty * 1.25;
    // Le coin, traîné derrière la queue, doit dépasser le coin opposé pour que tout soit décollé.
    tailEndX = -Math.hypot(w, h) - cordLength - w * 0.15;
    end = solveX((tailEndX / w) * 100) - length;
  };

  /**
   * Coin tiré par une ficelle de longueur fixe : tant qu'elle est lâche, le coin reste collé ;
   * tendue, il est traîné derrière la queue (tractrice), toujours dans l'axe de la ficelle.
   * Recalculé depuis le point de tension à chaque image : identique en scrollant dans les deux sens.
   */
  const corner = (tx: number, ty: number) => {
    const { w } = size();
    const c = { x: w, y: 0 };
    const L = cordLength;
    const xTaut = w - Math.sqrt(Math.max(0, L * L - ty * ty));
    if (tx >= xTaut) return { q: c, taut: false, xTaut };
    const q = { ...c };
    const steps = Math.min(600, Math.max(8, Math.ceil((xTaut - tx) / 3)));
    for (let i = 1; i <= steps; i++) {
      const lx = xTaut - ((xTaut - tx) * i) / steps;
      const vx = q.x - lx, vy = q.y - ty;
      const d = Math.hypot(vx, vy);
      if (d > L) { q.x = lx + (vx * L) / d; q.y = ty + (vy * L) / d; }
    }
    return { q, taut: true, xTaut };
  };
  const pts = (list: { x: number; y: number }[]) => list.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const render = (p: number) => {
    if (start === end) frame();
    // Démarrage et arrêt doux.
    const t = range(p, 0, 0.86);
    const eased = 0.5 - Math.cos(Math.PI * t) / 2;
    const x = lerp(start, end, eased);
    rig.position.x = x;

    const { w, h } = size();
    const tail = tailAt(x);
    const { q, taut, xTaut } = corner(tail.x, tail.y);
    const s = Math.min(1, Math.max(0, (xTaut - tail.x) / Math.max(1, xTaut - tailEndX)));
    const result = peel(w, h, q);

    if (sticker) sticker.style.clipPath = result.keep.length
      ? `polygon(${result.keep.map((p2) => `${p2.x.toFixed(1)}px ${p2.y.toFixed(1)}px`).join(', ')})`
      : 'polygon(0 0, 0 0, 0 0)';
    if (flap) flap.setAttribute('points', pts(result.flap));
    if (grad) {
      grad.setAttribute('x1', result.fold.x.toFixed(1)); grad.setAttribute('y1', result.fold.y.toFixed(1));
      grad.setAttribute('x2', q.x.toFixed(1)); grad.setAttribute('y2', q.y.toFixed(1));
    }
    // La ficelle n'apparaît qu'une fois la queue du train à l'écran.
    const visible = tail.x < w + 4;
    if (ring) { ring.setAttribute('cx', q.x.toFixed(1)); ring.setAttribute('cy', q.y.toFixed(1)); ring.style.opacity = visible ? '1' : '0'; }
    if (cord) {
      const dist = Math.hypot(q.x - tail.x, q.y - tail.y);
      // Lâche : elle pend d'autant plus qu'il reste de longueur ; tendue : presque droite.
      const sag = taut ? 2 : Math.sqrt(Math.max(0, cordLength * cordLength - dist * dist)) * 0.55 + 2;
      cord.setAttribute('d', `M ${tail.x.toFixed(1)} ${tail.y.toFixed(1)} Q ${((tail.x + q.x) / 2).toFixed(1)} ${((tail.y + q.y) / 2 + sag).toFixed(1)} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`);
      cord.style.opacity = visible ? '1' : '0';
    }

    key.color.copy(cool).lerp(warm, s);
    hemi.intensity = lerp(0.45, 0.7, s);
    renderer.render(scene, camera);
  };
  const resize = () => { engine.resize(); frame(); };
  const dispose = () => engine.dispose();

  return { render, resize, dispose };
}

/* ---------- Torii : on passe dessous, la nuit d'Osaka apparaît dans l'ouverture ---------- */

async function toriiScene(canvas: HTMLCanvasElement, host: HTMLElement, mobile: boolean): Promise<SceneHandle> {
  const engine = createEngine(canvas, mobile, (camera) => {
    camera.fov = camera.aspect < 0.8 ? 58 : 40;
  });
  const { scene, camera, loader } = engine;
  const [toriiGltf, lanternGltf] = await Promise.all([
    loader.loadAsync(`${base}/torii.glb`),
    loader.loadAsync(`${base}/lanterne.glb`),
  ]);

  const torii = normalize(toriiGltf.scene, 7.2);
  castShadows(torii);
  scene.add(torii);
  const lantern = normalize(lanternGltf.scene, 1.8);
  castShadows(lantern);
  const glow = new THREE.MeshBasicMaterial({ color: 0xffc27a });
  for (const side of [-1, 1]) {
    const copy = lantern.clone();
    copy.position.set(side * 5.4, 0, 3.2);
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), glow);
    flame.position.y = 1.25;
    copy.add(flame);
    const light = new THREE.PointLight(0xffb066, 2.2, 6, 2);
    light.position.y = 1.25;
    copy.add(light);
    scene.add(copy);
  }

  scene.add(shadowCatcher(120, 0.28));
  const hemi = new THREE.HemisphereLight(0xfff3dc, 0x6f6450, 1.1);
  const sun = new THREE.DirectionalLight(0xffdcae, 2.4);
  // Soleil bas, derrière à gauche : l'ombre du torii s'allonge vers le lecteur, sur le papier.
  sun.position.set(-10, 9, -16);
  sun.castShadow = true;
  sun.shadow.mapSize.setScalar(mobile ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 60 });
  sun.shadow.bias = -0.0005;
  sun.shadow.radius = 5;
  scene.add(hemi, sun);

  // Mesure de l'ouverture réelle du modèle (piliers et traverse basse) par lancer de rayons.
  scene.updateMatrixWorld(true);
  const ray = new THREE.Raycaster();
  const meshes: THREE.Object3D[] = [];
  torii.traverse((o) => { if ((o as THREE.Mesh).isMesh) meshes.push(o); });
  const cast = (origin: THREE.Vector3, dir: THREE.Vector3, fallback: number, axis: 'x' | 'y') => {
    ray.set(origin, dir);
    const hit = ray.intersectObjects(meshes, false)[0];
    return hit ? hit.point[axis] : fallback;
  };
  const inner = Math.min(
    Math.abs(cast(new THREE.Vector3(0, 2, 0), new THREE.Vector3(1, 0, 0), 2.6, 'x')),
    Math.abs(cast(new THREE.Vector3(0, 2, 0), new THREE.Vector3(-1, 0, 0), -2.6, 'x')),
  ) - 0.05;
  // Traverse basse (nuki) : seule surface touchée à la même hauteur par des rayons répartis sur
  // toute la largeur (la corde shimenawa, elle, pend plus bas au centre qu'aux extrémités).
  const XS = [-2, -1.3, -0.6, 0.6, 1.3, 2];
  const commonHeight = (from: number, dir: 1 | -1, above: number) => {
    const lists = XS.map((x) => {
      ray.set(new THREE.Vector3(x, from, 0), new THREE.Vector3(0, dir, 0));
      return ray.intersectObjects(meshes, false).map((h) => h.point.y).filter((y) => (dir > 0 ? y > above : y < above));
    });
    const candidates = [...lists[0]].sort((a2, b2) => (dir > 0 ? a2 - b2 : b2 - a2));
    return candidates.find((y) => lists.every((list) => list.some((v) => Math.abs(v - y) < 0.08)));
  };
  const lintel = commonHeight(1, 1, 3) ?? 5.2;

  // Découpe un peu plus large que l'ouverture : ses bords restent cachés derrière les piliers et la traverse.
  const W = inner + 0.24;
  // Dessus de la traverse basse : rayons descendants depuis l'espace entre les deux traverses.
  const nukiTop = commonHeight(lintel + 0.9, -1, lintel + 1.2) ?? lintel + 0.35;
  // Le haut de la nuit passe derrière la traverse basse : il s'arrête au milieu de son épaisseur, caché par le bois.
  const H = (lintel + nukiTop) / 2;
  const corners = [
    new THREE.Vector3(-W, -0.02, 0.3), new THREE.Vector3(W, -0.02, 0.3),
    new THREE.Vector3(W, H, 0), new THREE.Vector3(-W, H, 0),
  ];
  const tmp = new THREE.Vector3();
  const look = new THREE.Vector3();

  const render = (p: number) => {
    // Approche puis passage ; le regard monte vers le linteau au moment de passer dessous.
    const t = smooth(range(p, 0.02, 0.8));
    const z = lerp(24, -1.5, t);
    camera.position.set(0, lerp(1.7, 1.6, t), z);
    look.set(0, lerp(3.4, 4.6, t * t), z - 12);
    camera.lookAt(look);
    camera.updateMatrixWorld();

    // Portail : l'ouverture projetée découpe le calque « nuit d'Osaka ».
    let clip = 'inset(0 0 0 0)';
    if (z > 0.6) {
      const pts = corners.map((c) => {
        tmp.copy(c).project(camera);
        return `${(tmp.x * 50 + 50).toFixed(2)}% ${(50 - tmp.y * 50).toFixed(2)}%`;
      });
      clip = `polygon(${pts.join(', ')})`;
    }
    host.style.setProperty('--portal', clip);
    engine.renderer.render(scene, camera);
  };

  return { render, resize: engine.resize, dispose: engine.dispose };
}

export async function createScene(kind: SceneKind, canvas: HTMLCanvasElement, host: HTMLElement, options: { mobile: boolean }): Promise<SceneHandle> {
  return kind === 'train' ? trainScene(canvas, host, options.mobile) : toriiScene(canvas, host, options.mobile);
}
