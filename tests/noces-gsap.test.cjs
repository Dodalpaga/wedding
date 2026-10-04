const test=require('node:test'),assert=require('node:assert/strict');
const ts=require('typescript'),vm=require('node:vm'),fs=require('node:fs');
const exportsObject={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('components/noces/SequenceBackdrop.tsx','utf8'),{
  compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020},
}).outputText,{exports:exportsObject,require:name=>({
  gsap:{gsap:{registerPlugin(){}}},'./frame-sequence':{FRAME_SEQUENCE:{count:597}},
}[name]||{})});
test('both profiles preserve source endpoints and never request nonexistent frames',()=>{
 for(const count of [300,474,597]){
  const indices=Array.from(exportsObject.sequenceIndices(count));
  assert.equal(indices[0],0);assert.equal(indices.at(-1),596);
  assert.equal(new Set(indices).size,count);
  assert(indices.every((value,i)=>Number.isInteger(value)&&value>=0&&value<597&&(!i||value>indices[i-1])));
 }
});
test('progressive preload covers both ends and middle before refining, without duplicate downloads',()=>{
 for(const count of [300,474,597]){
  const order=Array.from(exportsObject.preloadOrder(count));
  assert.deepEqual(order.slice(0,3),[0,count-1,Math.floor((count-1)/2)]);
  assert.equal(order.length,count);assert.equal(new Set(order).size,count);
 }
});
