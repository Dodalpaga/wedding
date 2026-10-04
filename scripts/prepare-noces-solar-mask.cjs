// Offline occlusion atlas. Originals are read only; normal builds need no Sharp.
// node scripts/prepare-noces-solar-mask.cjs --sharp-module <path-to-sharp>
const fs = require('node:fs/promises');
const path = require('node:path');
const option = process.argv.indexOf('--sharp-module');
const sharp = require(option < 0 ? 'sharp' : process.argv[option + 1]);
const root = path.resolve(__dirname, '..');
const width = 80, height = 45, columns = 20, count = 597;
async function main() {
  sharp.concurrency(2);
  const atlasWidth = columns * width;
  const atlasHeight = Math.ceil(count / columns) * height;
  const atlas = Buffer.alloc(atlasWidth * atlasHeight * 4, 255);
  const transmission = Array.from({length:256}, (_, value) => {
    const opening = Math.max(0, Math.min(1, (value / 255 - .09) / .48));
    return Math.round(255 * opening * opening * (3 - 2 * opening));
  });
  for(let index=0;index<count;index++) {
    const source = path.join(root, 'public/assets/torii-better-fps-frames', `frame-${String(index+1).padStart(6,'0')}.webp`);
    const pixels = await sharp(source).resize(width,height).removeAlpha().raw().toBuffer();
    const xOffset = index % columns * width, yOffset = Math.floor(index / columns) * height;
    for(let y=0;y<height;y++)for(let x=0;x<width;x++) {
      const sourceOffset=(y*width+x)*3;
      const luminance=(pixels[sourceOffset]*54+pixels[sourceOffset+1]*183+pixels[sourceOffset+2]*19)>>8;
      atlas[((y+yOffset)*atlasWidth+x+xOffset)*4+3]=transmission[luminance];
    }
  }
  const file = path.join(root,'public/assets/noces-solar-mask.webp');
  const result = await sharp(atlas,{raw:{width:atlasWidth,height:atlasHeight,channels:4}}).webp({lossless:true,effort:6}).toFile(file);
  console.log(JSON.stringify({frames:count,width:atlasWidth,height:atlasHeight,bytes:result.size}));
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
