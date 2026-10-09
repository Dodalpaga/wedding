import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import { NodeIO } from '@gltf-transform/core';import { ALL_EXTENSIONS } from '@gltf-transform/extensions';import { MeshoptDecoder } from 'meshoptimizer';
import sharp from 'sharp';import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
await MeshoptDecoder.ready;const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
const folder=new URL('../public/assets/models/',import.meta.url),manifest=JSON.parse(await fs.readFile(new URL('noces-models.json',folder),'utf8'));
test('prepared GLBs preserve source files, embedded resources, materials and the train animation',async()=>{
 for(const [name,entry]of Object.entries(manifest)){
  const source=await fs.readFile(new URL(entry.source,folder));assert.equal(createHash('sha256').update(source).digest('hex'),entry.sourceSha256);
  for(const [profile,variant]of Object.entries(entry.variants)){
   const file=new URL(variant.file,folder),bytes=await fs.readFile(file);assert.equal(bytes.length,variant.bytes);assert.ok(bytes.length<source.length*.5);
   const document=await io.read(fileURLToPath(file));assert.ok(document.getRoot().listMeshes().length>0);
   for(const texture of document.getRoot().listTextures()){assert.ok(texture.getImage().length>0);const info=await sharp(texture.getImage()).metadata();assert.ok(Math.max(info.width,info.height)<=variant.maxTextureDimension);}
   if(name==='tokyo'){const animation=document.getRoot().listAnimations()[0];assert.equal(animation.getName(),'Take 001');assert.equal(animation.listChannels().length,107);assert.equal(Math.max(...animation.listSamplers().map(s=>Math.max(...s.getInput().getArray()))),10);}
   if(name==='temple')assert.ok(document.getRoot().listMaterials().every(m=>m.getExtension('KHR_materials_unlit')));
  }
 }
});
