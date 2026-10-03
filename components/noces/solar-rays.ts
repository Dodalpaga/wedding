type Frame = ImageBitmap | HTMLImageElement;

// A small, soft light shaft, generated once rather than blurred each scroll frame.
function beamSprite() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const pixels = ctx.createImageData(canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y++) {
    const v = y / (canvas.height - 1);
    const longitudinal = Math.sin(Math.PI * v) ** .65;
    for (let x = 0; x < canvas.width; x++) {
      const u = (x / (canvas.width - 1) - .5) * 2;
      // Narrow at the canopy, spreading through the humid air below.
      const edge = Math.exp(-((u / (.18 + v * .65)) ** 2) * 3);
      const offset = (y * canvas.width + x) * 4;
      pixels.data[offset] = 255;
      pixels.data[offset + 1] = 239;
      pixels.data[offset + 2] = 195;
      pixels.data[offset + 3] = Math.round(255 * edge * longitudinal);
    }
  }
  ctx.putImageData(pixels, 0, 0);
  return canvas;
}

export function createSolarRays(canvas: HTMLCanvasElement, mobile: boolean) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const sprite = beamSprite();
  // CPU readback stays here, never on the full-resolution sequence canvas.
  const mask = document.createElement('canvas');
  const maskCtx = mask.getContext('2d', { willReadFrequently: true });
  if (!maskCtx) return null;
  // Lookup the light transmission instead of repeating clamp/divide/smoothstep
  // arithmetic for every pixel of every frame.
  const transmission = new Uint8ClampedArray(256);
  for (let value = 0; value < transmission.length; value++) {
    const opening = Math.max(0, Math.min(1, (value / 255 - .09) / .48));
    transmission[value] = Math.round(255 * opening * opening * (3 - 2 * opening));
  }
  let width = 1;
  let height = 1;
  let cssWidth = 1;
  let cssHeight = 1;

  function resize(w: number, h: number) {
    if (cssWidth === w && cssHeight === h) return false;
    cssWidth = w;
    cssHeight = h;
    const scale = Math.min(1, (mobile ? 480 : 720) / Math.max(w, h));
    width = canvas.width = Math.max(1, Math.round(w * scale));
    height = canvas.height = Math.max(1, Math.round(h * scale));
    const maskScale = (mobile ? 128 : 160) / Math.max(w, h);
    mask.width = Math.max(1, Math.round(w * maskScale));
    mask.height = Math.max(1, Math.round(h * maskScale));
    return true;
  }

  function paint(frame: Frame, progress: number) {
    ctx!.clearRect(0, 0, width, height);
    const fw = 'naturalWidth' in frame ? frame.naturalWidth : frame.width;
    const fh = 'naturalHeight' in frame ? frame.naturalHeight : frame.height;
    const cover = Math.max(cssWidth / fw, cssHeight / fh);
    const xOffset = (cssWidth - fw * cover) / 2;
    const yOffset = (cssHeight - fh * cover) / 2;
    // Exactly the same cover crop as the video, including narrow portrait screens.
    maskCtx!.drawImage(frame, xOffset * mask.width / cssWidth, yOffset * mask.height / cssHeight,
      fw * cover * mask.width / cssWidth, fh * cover * mask.height / cssHeight);
    const pixels = maskCtx!.getImageData(0, 0, mask.width, mask.height);
    for (let i = 0; i < pixels.data.length; i += 4) {
      const luminance = (pixels.data[i] * 54 + pixels.data[i + 1] * 183 + pixels.data[i + 2] * 19) >> 8;
      pixels.data[i + 3] = transmission[luminance];
    }
    maskCtx!.putImageData(pixels, 0, 0);

    // Project from the image's canopy/vanishing point, rather than screen corners.
    const projectX = (x: number) => (xOffset + x * fw * cover) * width / cssWidth;
    const projectY = (y: number) => (yOffset + y * fh * cover) * height / cssHeight;
    ctx!.globalCompositeOperation = 'lighter';
    const count = mobile ? 9 : 14;
    for (let i = 0; i < count; i++) {
      const seed = i * 2.399963;
      // Reversible world depth: approaching shafts widen and pass out of view.
      const depth = (i / count + progress * 1.45) % 1;
      const perspective = .45 + depth * depth * 2.8;
      const spread = Math.sin(seed) * .34;
      const topX = projectX(.54 + spread * perspective * .42);
      const topY = projectY(.04 + .12 * Math.cos(seed));
      const bottomX = projectX(.51 + spread * perspective - .15 * perspective);
      const bottomY = projectY(.58 + perspective * .28);
      const dx = bottomX - topX;
      const dy = bottomY - topY;
      // Occasional openings in the canopy create broad, bright shafts. Keep a
      // third of the beams narrow so the forest retains fine streaks of light.
      const opening = ((1 + Math.sin(seed + progress * 16)) / 2) ** 3;
      const widthGain = 1 + (i % 3 === 0 ? .5 : 3) * opening;
      const lightGain = 1 + 2 * opening;
      const shaftWidth = fw * cover * width / cssWidth * (.032 + (i % 3) * .016) * perspective * widthGain;
      const fade = Math.sin(Math.PI * depth) ** .7;
      const canopy = .65 + .35 * Math.sin(seed + progress * 24) ** 2;
      ctx!.save();
      // Canvas alpha must stay within [0, 1]; bright cores naturally saturate.
      ctx!.globalAlpha = Math.min(1, .48 * fade * canopy * lightGain);
      ctx!.translate(topX, topY);
      ctx!.rotate(-Math.atan2(dx, dy));
      ctx!.drawImage(sprite, -shaftWidth / 2, 0, shaftWidth, Math.hypot(dx, dy));
      ctx!.restore();
    }
    // Approximate occlusion by dark trunks/leaves; no geometry or GPU ray tracing.
    ctx!.globalCompositeOperation = 'destination-in';
    ctx!.drawImage(mask, 0, 0, width, height);
    ctx!.globalCompositeOperation = 'source-over';
  }

  return { resize, paint, clear: () => ctx.clearRect(0, 0, width, height) };
}
