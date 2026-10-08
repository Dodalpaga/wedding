import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, weld, meshopt, textureCompress } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import sharp from 'sharp';

const folder = path.resolve('public/assets/models');
const inputs = {
  tokyo: 'littlest_tokyo.glb',
  restaurant: 'japanese_restaurant_inakaya.glb',
  temple: 'inubeko_ukiyo_-_kinkakuji_temple.glb',
};
await MeshoptEncoder.ready; await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder,
});
const report = {};
for (const [name, file] of Object.entries(inputs)) {
  if (process.argv[2] && process.argv[2] !== name) continue;
  const source = await fs.readFile(path.join(folder, file));
  const variants = {};
  for (const [profile, limit] of [['desktop', 2048], ['mobile', 1024]]) {
    const document = await io.read(path.join(folder, file));
    const colorLimit = name === 'restaurant' ? limit * 2 : limit;
    await document.transform(dedup(), weld(), prune(),
      textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [colorLimit, colorLimit], quality: 92, effort: 70, slots: /^baseColorTexture$/ }),
      textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [limit, limit], quality: 92, effort: 70, slots: /^(?!baseColorTexture$).*$/ }),
      meshopt({ encoder: MeshoptEncoder, level: 'medium', quantizePosition: 16, quantizeNormal: 12, quantizeTexcoord: 16 }),
    );
    const output = `${name}-${profile}.glb`;
    await io.write(path.join(folder, output), document);
    variants[profile] = { file: output, bytes: (await fs.stat(path.join(folder, output))).size, maxTextureDimension: colorLimit, maxOtherTextureDimension: limit };
  }
  const original = JSON.parse(source.subarray(20, 20 + source.readUInt32LE(12)));
  report[name] = { source: file, sourceBytes: source.length, sourceSha256: createHash('sha256').update(source).digest('hex'), attribution: original.asset.extras, variants };
  console.log(JSON.stringify({ name, sourceBytes: source.length, variants }));
}
const manifest = path.join(folder, 'motion-models.json');
const previous = process.argv[2] ? JSON.parse(await fs.readFile(manifest, 'utf8')) : {};
await fs.writeFile(manifest, JSON.stringify({ ...previous, ...report }, null, 2) + '\n');
