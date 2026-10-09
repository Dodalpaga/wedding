const test=require('node:test'),assert=require('node:assert/strict'),{EventEmitter}=require('node:events');
const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
function load(name,dependencies={}){const file=path.join(__dirname,'../components/noces',name+'.ts');const compiled=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}});const module={exports:{}};new Function('module','exports','require',compiled.outputText)(module,module.exports,id=>dependencies[id]);return module.exports;}
const journey=load('journey'),{waitForGlobeIdle,waitForGlobeView,globePreloadViews,prepareGlobe}=load('globe-preload',{'./journey':journey});
class MapDouble extends EventEmitter{
 constructor(){super();this.camera=journey.globeCamera(0,320,568);}
 getStyle(){return {sources:{carto:{type:'vector'}}};}
 getSource(){return {tileSize:512,minzoom:0,maxzoom:14};}
 jumpTo(camera){this.camera=camera;return this;}
 coveringTiles(){const z=Math.max(0,Math.floor(this.camera.zoom)),x=Math.floor(this.camera.center[0]/8)+1;return [{overscaledZ:z,canonical:{z,x,y:0}}];}
 triggerRepaint(){queueMicrotask(()=>{this.emit('data');this.emit('render');this.emit('idle');});}
 isStyleLoaded(){return true;}
 areTilesLoaded(){return true;}
 resize(){return this;}
}
test('the globe is not released on load/data, only on final idle',async()=>{
 const map=new MapDouble(),controller=new AbortController();map.triggerRepaint=()=>{};
 let released=false;const ready=waitForGlobeIdle(map,controller.signal).then(()=>released=true);
 map.emit('load');map.emit('data');await Promise.resolve();assert.equal(released,false);
 map.emit('idle');await ready;assert.equal(released,true);assert.equal(map.listenerCount('idle'),0);assert.equal(map.listenerCount('error'),0);
});
test('resource errors and cancellation reject readiness and release listeners',async()=>{
 const map=new MapDouble();map.triggerRepaint=()=>{};const controller=new AbortController();
 const failed=waitForGlobeIdle(map,controller.signal);map.emit('error',new Error('tile failed'));await assert.rejects(failed,/resource failed/);
 const cancelled=waitForGlobeIdle(map,controller.signal);controller.abort();await assert.rejects(cancelled,{name:'AbortError'});assert.equal(map.listenerCount('idle'),0);assert.equal(map.listenerCount('error'),0);
});
test('the preparation selects every camera coverage, not only the cities',()=>{
 const map=new MapDouble(),plan=globePreloadViews(map,320,568);const covered=new Set();
 for(const p of plan.views){map.jumpTo(journey.globeCamera(p,320,568));for(const t of map.coveringTiles())covered.add(`${t.canonical.z}/${t.canonical.x}`);}
 for(let i=0;i<=768;i++){map.jumpTo(journey.globeCamera(i/768*.64,320,568));for(const t of map.coveringTiles())assert.ok(covered.has(`${t.canonical.z}/${t.canonical.x}`));}
 assert.equal(plan.views[0],0);assert.equal(plan.views.at(-1),.64);assert.ok(plan.views.some(p=>p>.19&&p<.48));assert.ok(plan.views.length<100);
});
test('preparation restores the viewport and departure only after all views are ready',async()=>{
 const map=new MapDouble(),controller=new AbortController();const style={width:'',height:'',left:'',top:''};const container={style,parentElement:{clientWidth:320,clientHeight:568},dataset:{}};const progress=[];
 await prepareGlobe(map,container,controller.signal,value=>progress.push(value));
 assert.deepEqual(style,{width:'',height:'',left:'',top:''});assert.deepEqual(map.camera,journey.globeCamera(0,320,568));assert.equal(progress.at(-1),1);assert.ok(Number(container.dataset.preloadViews)>2);
});
test('preparation also covers tile levels specific to the visible viewport',async()=>{
 const map=new MapDouble(),controller=new AbortController();
 const container={style:{width:'',height:'',left:'',top:''},parentElement:{clientWidth:320,clientHeight:568},dataset:{}};
 const originalCoverage=map.coveringTiles.bind(map);let visibleOnlyPrepared=false;
 map.coveringTiles=()=>{
  const tiles=originalCoverage();
  if(!container.style.width&&map.camera.center[0]>110&&map.camera.zoom>2.4&&map.camera.zoom<2.8)
   tiles.push({overscaledZ:2,canonical:{z:2,x:777,y:1}});
  return tiles;
 };
 map.triggerRepaint=()=>{if(map.coveringTiles().some(tile=>tile.canonical.x===777))visibleOnlyPrepared=true;queueMicrotask(()=>map.emit('idle'));};
 await prepareGlobe(map,container,controller.signal,()=>{});
 assert.ok(visibleOnlyPrepared,'visible-size LOD must be loaded, even when overscan does not use it');
});

test('hidden views wait for decoded tiles and their render, rather than a partial frame',async()=>{
 const map=new MapDouble();map.triggerRepaint=()=>{};let decoded=false,released=false;map.areTilesLoaded=()=>decoded;
 const ready=waitForGlobeView(map,new AbortController().signal).then(()=>released=true);
 map.emit('render');await Promise.resolve();assert.equal(released,false);
 decoded=true;map.emit('render');await ready;assert.equal(released,true);assert.equal(map.listenerCount('render'),0);
});
test('a hidden tab pauses preparation waiting and resumes when visible',async()=>{
 const previous=global.document;const page=new EventTarget();page.hidden=true;global.document=page;
 try{const map=new MapDouble();let released=false;const ready=waitForGlobeIdle(map,new AbortController().signal).then(()=>released=true);
 await Promise.resolve();assert.equal(released,false);page.hidden=false;page.dispatchEvent(new Event('visibilitychange'));await ready;assert.equal(released,true);
 }finally{if(previous===undefined)delete global.document;else global.document=previous;}
});
