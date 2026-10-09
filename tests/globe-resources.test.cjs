const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
const source=fs.readFileSync(require('node:path').join(__dirname,'../components/noces/globe-resources.ts'),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const moduleObject={exports:{}};new Function('module','exports','require',compiled)(moduleObject,moduleObject.exports,()=>({GLOBE_TILE_CACHE_SIZE:2048}));
const {createGlobeResourceCache}=moduleObject.exports;
const tile='https://tiles-a.basemaps.cartocdn.com/vectortiles/carto.streets/v1/2/1/1.mvt';
test('recreated tiles and CDN subdomains reuse the same visit-local resource',async()=>{
 const original=global.fetch;let calls=0;global.fetch=async()=>{calls++;return new Response(new Uint8Array([1,2,3]));};const cache=createGlobeResourceCache();
 try{
  const [first,second]=await Promise.all([cache.transformRequest(tile,'Tile'),cache.transformRequest(tile.replace('tiles-a','tiles-c'),'Tile')]);
  assert.equal(calls,1);assert.equal(first.url,second.url);assert.ok(first.url.startsWith('blob:'));
  const resource=await original(first.url);assert.deepEqual([...new Uint8Array(await resource.arrayBuffer())],[1,2,3]);
  assert.equal((await cache.transformRequest(tile,'Tile')).url,first.url);assert.equal(calls,1);
  assert.deepEqual(await cache.transformRequest('https://example.com/style.json','Style'),{url:'https://example.com/style.json'});
 }finally{cache.dispose();global.fetch=original;}
});
test('a failed request is retryable and is not retained as a complete tile',async()=>{
 const original=global.fetch;let calls=0;global.fetch=async()=>new Response(new Uint8Array([4]),{status:++calls===1?503:200});const cache=createGlobeResourceCache();
 try{await assert.rejects(cache.transformRequest(tile,'Tile'),/resource failed/);assert.ok((await cache.transformRequest(tile,'Tile')).url.startsWith('blob:'));assert.equal(calls,2);}
 finally{cache.dispose();global.fetch=original;}
});
test('disposing a visit revokes its resource URLs and rejects further tile use',async()=>{
 const original=global.fetch;global.fetch=async()=>new Response(new Uint8Array([1]));const cache=createGlobeResourceCache();
 try{const resource=await cache.transformRequest(tile,'Tile');cache.dispose();await assert.rejects(original(resource.url));await assert.rejects(cache.transformRequest(tile,'Tile'),{name:'AbortError'});}
 finally{cache.dispose();global.fetch=original;}
});
