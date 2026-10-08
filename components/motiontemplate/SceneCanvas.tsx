'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { sceneOcclusion } from './scene-occlusion';
import { experienceState, restaurantPose } from './experience-state';
import type { GlobePreparation } from './globe-preload';

export type ModelKind = 'tokyo' | 'restaurant' | 'temple';
type Props = {
  kind: ModelKind;
  progressRef: MutableRefObject<number>;
  parallaxRef?: MutableRefObject<[number, number]>;
  onPreparation: (status: GlobePreparation) => void;
};

function disposeModel(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>(), images = new Set<ImageBitmap>(), skeletons = new Set<THREE.Skeleton>();
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.add(object.geometry);
    (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material));
    if (object instanceof THREE.SkinnedMesh) skeletons.add(object.skeleton);
  });
  materials.forEach(material => Object.values(material).forEach(value => {
    if (!(value instanceof THREE.Texture)) return;
    textures.add(value);
    if (typeof ImageBitmap !== 'undefined' && value.source.data instanceof ImageBitmap) images.add(value.source.data);
  }));
  geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose());
  textures.forEach(texture => texture.dispose()); images.forEach(image => image.close()); skeletons.forEach(skeleton => skeleton.dispose());
}

export default function SceneCanvas({ kind, progressRef, parallaxRef, onPreparation }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const controller = new AbortController(), reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false, frame = 0, visible = false, ready = false, lastKey = '', draws = 0;
    let renderer: THREE.WebGLRenderer | undefined, model: THREE.Object3D | undefined;
    let mixer: THREE.AnimationMixer | undefined, environment: THREE.WebGLRenderTarget | undefined, draw: (() => void) | undefined;
    let resizeObserver: ResizeObserver | undefined, visibilityObserver: IntersectionObserver | undefined;
    let shading: ReturnType<typeof sceneOcclusion> | undefined, sun: THREE.DirectionalLight | undefined;
    const notify = (state: GlobePreparation['state'], progress = 0) => { if (!disposed) onPreparation({ state, progress }); };
    const schedule = () => {
      if (!frame && ready && visible && !document.hidden && !disposed) frame = requestAnimationFrame(() => { frame = 0; draw?.(); });
    };
    const onLost = (event: Event) => { event.preventDefault(); canvas.dataset.model = 'unavailable'; ready = false; notify('error'); };
    canvas.addEventListener('webglcontextlost', onLost);
    notify('loading', 0);

    const initialize = async () => {
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
      } catch {
        canvas.dataset.model = 'unavailable'; notify('disabled', 1); return;
      }
      try {
        renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth <= 700 ? 1.25 : 1.5));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = kind === 'temple' ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1;
        renderer.setClearColor(0xffffff, 0);
        const scene = new THREE.Scene();
        const camera = kind === 'temple' ? new THREE.OrthographicCamera(-6, 6, 6, -6, .05, 100) : new THREE.PerspectiveCamera(40, 1, .03, 200);
        if (kind !== 'temple') {
          const room = new RoomEnvironment(), pmrem = new THREE.PMREMGenerator(renderer);
          environment = pmrem.fromScene(room, .04); scene.environment = environment.texture;
          room.dispose(); pmrem.dispose();
          scene.add(new THREE.HemisphereLight(0xe8f3ff, 0xa18c66, .55));
          sun = new THREE.DirectionalLight(0xffedce, 1.8);
          sun.position.set(5, 12, 9); sun.castShadow = true;
          sun.shadow.mapSize.setScalar(innerWidth <= 700 ? 1024 : 2048);
          Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: .1, far: 45 });
          sun.shadow.normalBias = .025; sun.shadow.bias = -.00015;
          scene.add(sun, sun.target);
          renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
          shading = sceneOcclusion(renderer, scene, camera, innerWidth <= 700);
          canvas.dataset.shading = 'ssao-and-sun-shadows';
        }
        const profile = innerWidth <= 700 ? 'mobile' : 'desktop';
        canvas.dataset.profile = profile;
        const url = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/assets/models/${kind}-${profile}.glb`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error('Model unavailable');
        const total = Number(response.headers.get('content-length'));
        let buffer: ArrayBuffer;
        if (response.body && total > 0) {
          const reader = response.body.getReader(), chunks: Uint8Array[] = []; let loaded = 0, lastPercent = -1;
          for (;;) {
            const { done, value } = await reader.read(); if (done) break;
            chunks.push(value); loaded += value.length;
            const percent = Math.floor(loaded / total * 60);
            if (percent !== lastPercent) { lastPercent = percent; notify('loading', Math.min(.6, loaded / total * .6)); }
          }
          const data = new Uint8Array(loaded); let offset = 0;
          chunks.forEach(chunk => { data.set(chunk, offset); offset += chunk.length; }); buffer = data.buffer;
        } else { buffer = await response.arrayBuffer(); }
        controller.signal.throwIfAborted(); notify('loading', .65);
        const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
        const gltf = await loader.parseAsync(buffer, url.slice(0, url.lastIndexOf('/') + 1));
        model = gltf.scene;
        if (disposed) { disposeModel(model); model = undefined; return; }
        if (kind === 'tokyo') {
          if (!gltf.animations.length) throw new Error('Train animation missing');
          mixer = new THREE.AnimationMixer(model);
          const action = mixer.clipAction(gltf.animations[0]); action.setLoop(THREE.LoopOnce, 1); action.clampWhenFinished = true; action.play();
          mixer.setTime(0);
        }
        model.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(model), center = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3());
        const group = new THREE.Group(); group.add(model); scene.add(group);
        if (kind !== 'restaurant') { model.position.sub(center); group.scale.setScalar(8 / Math.max(size.x, size.y, size.z)); }
        const modelTextures = new Set<THREE.Texture>(), culling = new Map<THREE.Mesh, boolean>();
        model.traverse(object => {
          if (!(object instanceof THREE.Mesh)) return;
          if (kind !== 'temple') {
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            object.castShadow = materials.every(material => !material.transparent);
            object.receiveShadow = true;
          }
          culling.set(object, object.frustumCulled); object.frustumCulled = false;
          (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => {
            if (material instanceof THREE.MeshStandardMaterial) material.envMapIntensity = .45;
            Object.values(material).forEach(value => { if (value instanceof THREE.Texture) modelTextures.add(value); });
          });
        });
        modelTextures.forEach(texture => renderer!.initTexture(texture));

        const pose = (amount: number) => {
          if (kind === 'restaurant') {
            const next = restaurantPose(amount); camera.position.fromArray(next.position); camera.lookAt(new THREE.Vector3().fromArray(next.target));
          } else if (kind === 'tokyo') {
            camera.position.set(-10, 6, -13).multiplyScalar(camera instanceof THREE.PerspectiveCamera ? Math.max(1, .8 / camera.aspect) : 1); camera.lookAt(0, .1, 0);
            const time = Math.min(gltf.animations[0].duration - .00001, Math.max(0, amount) * gltf.animations[0].duration);
            // Reset the one-shot action before each seek, including reverse scroll.
            const action = mixer!.clipAction(gltf.animations[0]); action.enabled = true; action.paused = false;
            mixer!.setTime(time); model!.updateMatrixWorld(true);
            canvas.dataset.animationTime = time.toFixed(5);
          } else {
            const [x, y] = reduced.matches ? [0, 0] : parallaxRef?.current || [0, 0];
            // The artwork is a depth-filled box. Rotate that box in world space,
            // around its centre, while the camera and paper frame stay fixed.
            camera.position.set(-17.2, .45, -6.83); camera.lookAt(-.486, -.175, -.216);
            const yaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), x * .18);
            const pitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(-.369, 0, .929).normalize(), y * .12);
            group.quaternion.copy(yaw).multiply(pitch);
            canvas.dataset.rotation = `${(x * .18).toFixed(4)},${(y * .12).toFixed(4)}`;
          }
        };
        const render = () => { if (shading) shading.render(); else renderer!.render(scene, camera); canvas.dataset.draws = String(++draws); canvas.dataset.camera = camera.position.toArray().map(value => value.toFixed(4)).join(','); };
        const resize = () => {
          const width = Math.max(1, canvas.clientWidth), height = Math.max(1, canvas.clientHeight), aspect = width / height;
          renderer!.setSize(width, height, false);
          if (camera instanceof THREE.PerspectiveCamera) {
            camera.aspect = aspect;
            camera.fov = kind === 'restaurant' ? THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(24)) / Math.min(1, aspect))) : 40;
          }
          else {
            const halfHeight = 2.45; camera.left = -halfHeight * aspect; camera.right = halfHeight * aspect; camera.top = halfHeight; camera.bottom = -halfHeight;
          }
          camera.updateProjectionMatrix(); shading?.resize(width, height); lastKey = ''; schedule();
        };
        draw = () => {
          if (!ready || disposed || document.hidden || !visible) return;
          const state = experienceState(progressRef.current);
          const amount = reduced.matches ? 0 : kind === 'tokyo' ? state.train : state.restaurant;
          const key = kind === 'temple' ? `${reduced.matches}:${parallaxRef?.current.join(',')}` : `${amount.toFixed(6)}:${reduced.matches}`;
          if (key === lastKey) return; lastKey = key; pose(amount); render();
        };
        resize(); pose(0); notify('loading', .8);
        await renderer.compileAsync(scene, camera);
        controller.signal.throwIfAborted();
        // Upload textures and buffers for the actual views, behind the preparation screen.
        for (const sample of kind === 'restaurant' ? [0, .46, .67, 1] : kind === 'tokyo' ? [0, .5, 1] : [0]) { pose(sample); render(); }
        pose(0); render();
        culling.forEach((original, mesh) => { mesh.frustumCulled = original; });
        ready = true; canvas.dataset.model = 'ready'; notify('ready', 1);
        resizeObserver = new ResizeObserver(resize); resizeObserver.observe(canvas);
        visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) schedule(); }); visibilityObserver.observe(canvas);
        schedule();
      } catch (error) {
        if (!disposed && !controller.signal.aborted) { canvas.dataset.model = 'unavailable'; notify('error'); }
      }
    };
    void initialize();
    window.addEventListener('motionjourneyupdate', schedule); window.addEventListener('motionpostcardupdate', schedule);
    document.addEventListener('visibilitychange', schedule);
    const motionChange = () => { lastKey = ''; schedule(); };
    reduced.addEventListener('change', motionChange);
    return () => {
      disposed = true; controller.abort(); cancelAnimationFrame(frame); resizeObserver?.disconnect(); visibilityObserver?.disconnect();
      window.removeEventListener('motionjourneyupdate', schedule); window.removeEventListener('motionpostcardupdate', schedule);
      document.removeEventListener('visibilitychange', schedule); reduced.removeEventListener('change', motionChange); canvas.removeEventListener('webglcontextlost', onLost);
      if (model) { mixer?.stopAllAction(); mixer?.uncacheRoot(model); disposeModel(model); }
      shading?.dispose(); sun?.shadow.dispose(); environment?.dispose(); renderer?.dispose();
      // A removed canvas can release its context. Strict Mode reuses a connected
      // canvas during its second setup, so keep that context available.
      if (!canvas.isConnected) renderer?.forceContextLoss();
    };
  }, [kind, progressRef, parallaxRef, onPreparation]);
  return <canvas ref={ref} className={`motion-model-canvas motion-model-${kind}`} role="img"
    aria-label={kind === 'tokyo' ? 'Littlest Tokyo : quartier miniature et train animé au défilement' : kind === 'restaurant' ? 'Restaurant Inakaya : façade, plats et cuisine en trois dimensions' : 'Carte illustrée en trois dimensions du pavillon d’or Kinkakuji'} />;
}
