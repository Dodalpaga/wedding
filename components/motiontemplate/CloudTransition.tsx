'use client';
import { useEffect, useRef, type MutableRefObject } from 'react';
import { Mesh, Program, Renderer, Transform, Triangle } from 'ogl';
import { journeyState } from './journey';

const vertex = `attribute vec2 position,uv;varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,0.,1.);}`;
const fragment = `precision highp float;uniform float uTravel,uAspect;varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,w=.5;for(int i=0;i<5;i++){v+=noise(p)*w;p=p*2.03+vec2(3.1,7.8);w*=.5;}return v;}
void main(){vec2 p=vec2(vUv.x*uAspect,vUv.y)*4.+vec2(uTravel*1.7,0.);float n=fbm(p),detail=fbm(p*3.);float center=uTravel*2.1-.55;float d=abs(vUv.y-center+(n-.5)*.27);float density=1.-smoothstep(.17,.38,d);vec3 color=mix(vec3(.64,.75,.79),vec3(.98,.97,.91),smoothstep(.15,.8,n+detail*.24));color+=vec3(.04)*smoothstep(.08,.32,vUv.y-center);gl_FragColor=vec4(color,clamp(density*1.65,0.,1.));}`;

export default function CloudTransition({ progressRef }: { progressRef: MutableRefObject<number> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    let frame = 0, disposed = false;
    let renderer: Renderer, program: Program, geometry: Triangle;
    const draw = () => {
      frame = 0;
      if (disposed || document.hidden) return;
      program.uniforms.uTravel.value = journeyState(progressRef.current).clouds;
      program.uniforms.uAspect.value = canvas.clientWidth / Math.max(1, canvas.clientHeight);
      renderer.render({ scene, frustumCull: false });
    };
    const schedule = () => { if (!frame && !disposed) frame = requestAnimationFrame(draw); };
    const scene = new Transform();
    try {
      renderer = new Renderer({ canvas, alpha: true, antialias: false, dpr: 1 });
      geometry = new Triangle(renderer.gl);
      program = new Program(renderer.gl, { vertex, fragment, transparent: true, depthTest: false, depthWrite: false,
        uniforms: { uTravel: { value: 0 }, uAspect: { value: 1 } } });
      new Mesh(renderer.gl, { geometry, program }).setParent(scene);
    } catch { return; }
    const resize = () => { renderer.setSize(Math.max(1, canvas.clientWidth), Math.max(1, canvas.clientHeight)); schedule(); };
    const observer = new ResizeObserver(resize); observer.observe(canvas); resize();
    window.addEventListener('motionjourneyupdate', schedule); document.addEventListener('visibilitychange', schedule);
    return () => { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('motionjourneyupdate', schedule); document.removeEventListener('visibilitychange', schedule); geometry.remove(); program.remove(); };
  }, [progressRef]);
  return <canvas ref={ref} className="motion-cloud-canvas" aria-hidden="true" />;
}
