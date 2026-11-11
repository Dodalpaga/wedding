// Prépare les modèles des transitions 3D de /noces/ (shinkansen, torii, lanterne).
// Sources : assets/models/noces/ (hors Git, voir docs/NOCES_MODELS.md).
// Sorties : public/assets/models/noces/. Usage : node scripts/prepare-noces-models.mjs [nom]
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { NodeIO, getBounds } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, weld, meshopt, simplify, textureCompress } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';

const sources = path.resolve('assets/models/noces');
const folder = path.resolve('public/assets/models/noces');
await fs.mkdir(folder, { recursive: true });

/** name → { file, profiles: [[suffix, maxTexture]], prepare?(document) } */
const models = {
  shinkansen: {
    file: 'n700-3000_series_shinkansen.glb',
    profiles: [['', 0]],
    // Ne garde que la motrice avant (nez vers x négatif, jonction avec la voiture suivante à x ≈ 0,4) ;
    // la page la duplique dos à dos pour former une rame courte avec un nez à chaque bout.
    async prepare(document) {
      for (const node of document.getRoot().listNodes()) {
        if (!node.getMesh()) continue;
        const b = getBounds(node);
        if ((b.min[0] + b.max[0]) / 2 > 0.4) node.dispose();
      }
      await document.transform(prune(), weld(), simplify({ simplifier: MeshoptSimplifier, ratio: 0.7, error: 0.0003 }));
    },
  },
  torii: { file: 'torii_gate.glb', profiles: [['', 1024]] },
  lanterne: { file: 'japanese_stone_lantern.glb', profiles: [['', 512]] },
};

await MeshoptEncoder.ready; await MeshoptDecoder.ready; await MeshoptSimplifier.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder,
});

const report = {};
for (const [name, model] of Object.entries(models)) {
  if (process.argv[2] && process.argv[2] !== name) continue;
  const sourcePath = path.join(sources, model.file);
  const source = await fs.readFile(sourcePath);
  const variants = {};
  for (const [suffix, limit] of model.profiles) {
    const document = await io.read(sourcePath);
    await document.transform(dedup(), prune());
    if (model.prepare) await model.prepare(document);
    if (limit) {
      await document.transform(
        textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [limit, limit], quality: 85, effort: 70 }),
      );
    }
    await document.transform(dedup(), prune(),
      meshopt({ encoder: MeshoptEncoder, level: 'medium', quantizePosition: 16, quantizeNormal: 10, quantizeTexcoord: 14 }));
    const output = `${name}${suffix}.glb`;
    await io.write(path.join(folder, output), document);
    variants[suffix.replace('-', '') || 'all'] = { file: output, bytes: (await fs.stat(path.join(folder, output))).size, maxTexture: limit || null };
  }
  const json = JSON.parse(source.subarray(20, 20 + source.readUInt32LE(12)));
  report[name] = { source: model.file, sourceBytes: source.length, sourceSha256: createHash('sha256').update(source).digest('hex'), attribution: json.asset.extras, variants };
  console.log(JSON.stringify({ name, sourceBytes: source.length, variants }));
}
const manifest = path.join(sources, '..', 'noces-models.json');
const previous = process.argv[2] ? JSON.parse(await fs.readFile(manifest, 'utf8').catch(() => '{}')) : {};
await fs.writeFile(manifest, JSON.stringify({ ...previous, ...report }, null, 2) + '\n');
