/* Generate delivery copies; the original PNG files are never written or cropped.
 * node scripts/prepare-noces-frames.cjs --sharp-module <path-to-sharp>
 * The option is unnecessary when sharp is available in the local Node runtime.
 */
const fs = require('node:fs/promises');
const path = require('node:path');
const sharpOption = process.argv.indexOf('--sharp-module');
const sharp = require(sharpOption === -1 ? 'sharp' : process.argv[sharpOption + 1]);
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'public/assets/frames');
const variants = [{ directory: 'mobile', width: 1280 }, { directory: 'desktop', width: 1920 }];

async function main() {
  const names = (await fs.readdir(source)).filter(name => /^ezgif-frame-\d+\.png$/.test(name)).sort();
  if (!names.length) throw new Error('No original frames found');
  sharp.concurrency(2);
  for (const variant of variants) {
    const destination = path.join(source, 'optimized', variant.directory);
    await fs.mkdir(destination, { recursive: true });
    let total = 0;
    for (const name of names) {
      const output = path.join(destination, name.replace(/\.png$/, '.webp'));
      const info = await sharp(path.join(source, name))
        .resize({ width: variant.width, withoutEnlargement: true })
        .webp({ quality: 78, effort: 4 })
        .toFile(output);
      total += info.size;
    }
    console.log(`${variant.directory}: ${names.length} frames, ${(total / 1024 / 1024).toFixed(2)} MiB, width ${variant.width}`);
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
