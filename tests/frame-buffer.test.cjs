const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, dependencies = {}) {
  const exportsObject = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, { exports: exportsObject, require: name => dependencies[name], Blob, Map, Set, AbortController, performance });
  return exportsObject;
}
const { FrameBlobCache } = load('components/noces/frame-blob-cache.ts');
const { JourneyFrameBuffer } = load('components/noces/frame-buffer.ts', { './frame-blob-cache': { FrameBlobCache } });
const { sceneBlend } = load('components/noces/scene-blend.ts');
const settings = {
  cacheSize: 4, decodeAhead: 2, downloadAhead: 8, downloadMaxAhead: 10,
  downloadBehind: 2, fetchConcurrency: 3, decodeConcurrency: 1, blobCacheBytes: 100, preloadAll: false,
};
const flush = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };
function controlled(reducedMotion = false, overrides = {}) {
  const network = new Map(); const decoders = new Map();
  const started = []; const released = []; const ready = [];
  const indices = new WeakMap();
  const buffer = new JourneyFrameBuffer({
    settings: { ...settings, ...overrides }, frameCount: 12, reducedMotion,
    fetchFrame: (index, signal) => new Promise((resolve, reject) => {
      started.push(index);
      signal.addEventListener('abort', () => { network.delete(index); reject(Error('aborted')); }, { once: true });
      network.set(index, () => { network.delete(index); const blob = new Blob(['x']); indices.set(blob, index); resolve(blob); });
    }),
    decode: blob => new Promise(resolve => { const index = indices.get(blob); decoders.set(index, () => {
      decoders.delete(index); resolve({ index, closed: false });
    }); }),
    release: frame => { assert.equal(frame.closed, false); frame.closed = true; released.push(frame.index); },
    onReady: () => ready.push(true),
  });
  return { buffer, network, decoders, started, released, ready, indices };
}

test('downloads ahead while decoding is busy, without exceeding either concurrency limit', async () => {
  const c = controlled(); c.buffer.seek(0, 1);
  assert.equal(c.network.size, 3);
  c.network.get(0)(); await flush();
  assert.equal(c.decoders.size, 1);
  c.network.get(1)(); await flush();
  c.network.get(2)(); await flush();
  assert(c.started.some(index => index >= 3));
  assert(c.network.size <= settings.fetchConcurrency);
  assert.equal(c.decoders.size, 1);
  c.buffer.dispose(); c.decoders.get(0)(); await flush();
  assert.deepEqual(c.released, [0]);
});

test('a new camera frame starts decoding without waiting for speculative decoders', async () => {
  const c = controlled(false, { decodeConcurrency: 4 });
  for (let index = 0; index < 12; index++) {
    const blob = new Blob(['x']); c.indices.set(blob, index); c.buffer.blobs.set(index, blob);
  }
  c.buffer.seek(0, 1);
  assert.equal(c.decoders.size, 3, 'speculation leaves one lane free');
  c.buffer.seek(8, 1, 500);
  assert(c.decoders.has(8), 'current image starts before old decoders finish');
  assert.equal(c.decoders.size, 4);
  c.buffer.dispose();
  for (const finish of Array.from(c.decoders.values())) finish();
  await flush();
  assert.equal(c.released.length, 4, 'all outstanding images are released on disposal');
});

test('a large jump prioritises the new current frame and releases obsolete late decodes', async () => {
  const c = controlled(); c.buffer.seek(0, 1);
  c.network.get(0)(); await flush();
  c.buffer.seek(8, 1, 100); await flush();
  assert(c.network.has(8));
  c.decoders.get(0)(); await flush();
  assert.deepEqual(c.released, [0]);
  c.network.get(8)(); await flush(); c.decoders.get(8)(); await flush();
  assert.equal(c.buffer.nearest(8).index, 8);
  c.buffer.dispose();
});

test('reduced motion only downloads/decodes frame zero; hidden tabs pause new work', async () => {
  const c = controlled(true); c.buffer.seek(8, 1, 100);
  assert.deepEqual(c.started, [0]);
  c.network.get(0)(); await flush(); c.decoders.get(0)(); await flush();
  assert.deepEqual(c.started, [0]);
  c.buffer.setReducedMotion(false); c.buffer.setVisible(false); await flush();
  assert.equal(c.network.size, 0);
  const count = c.started.length; c.buffer.seek(6, 1); await flush();
  assert.equal(c.started.length, count);
  c.buffer.setVisible(true); assert(c.network.has(6));
  c.buffer.dispose(); await flush();
});

test('an eased jump fetches its destination early and keeps that transfer as the camera catches up', async () => {
  const c = controlled();
  c.buffer.seek(0, 1, 100, 10);
  assert(c.network.has(10));
  c.buffer.seek(4, 1, 100, 10);
  assert(c.network.has(10));
  assert.equal(c.started.filter(index => index === 10).length, 1);
  c.buffer.dispose(); await flush();
});

test('decoded cache stays bounded and speculative prefetch does not loop after compressed eviction', async () => {
  const released = []; let fetches = 0;
  const buffer = new JourneyFrameBuffer({
    settings: { ...settings, blobCacheBytes: 3, preloadAll: true }, frameCount: 12, reducedMotion: false,
    fetchFrame: async index => { fetches++; return new Blob([String.fromCharCode(index)]); },
    decode: async blob => ({ index: (await blob.text()).charCodeAt(0) }),
    release: frame => released.push(frame.index), onReady: () => {},
  });
  buffer.seek(0, 1); await flush();
  for (let i = 0; i < 30; i++) await flush();
  const settledFetches = fetches; await flush();
  assert.equal(fetches, settledFetches);
  assert(fetches < 30);
  for (const position of [4, 8, 11, 4, 0]) {
    buffer.seek(position, position < 8 ? -1 : 1);
    for (let i = 0; i < 30; i++) await flush();
    assert(buffer.bitmaps.size <= settings.cacheSize);
    assert.equal(buffer.nearest(position).index, position);
  }
  assert(released.length > 0); buffer.dispose(); await flush();
});

test('late decodes never rewind a forward presentation or overshoot the camera', () => {
  const c = controlled();
  const add = index => c.buffer.bitmaps.set(index, { index, closed: false });
  add(12);
  assert.equal(c.buffer.presentation(10, 1), undefined, 'retain the poster rather than overshoot');
  add(8); c.buffer.markPresented(8);
  add(9);
  assert.equal(c.buffer.presentation(10, 1).index, 9);
  c.buffer.markPresented(9); add(7);
  assert.equal(c.buffer.presentation(10, 1).index, 9, 'late old images do not rewind');
  add(10);
  assert.equal(c.buffer.presentation(10, 1).index, 10);
  c.buffer.markPresented(10);
  assert.equal(c.buffer.presentation(12, 1).index, 12);
  c.buffer.dispose();
});

test('reverse scroll is immediate, holds its last image and cannot advance after a late decode', () => {
  const c = controlled();
  for (const index of [2, 7, 9, 10]) c.buffer.bitmaps.set(index, { index, closed: false });
  c.buffer.markPresented(10);
  assert.equal(c.buffer.presentation(8, -1).index, 9);
  c.buffer.markPresented(9);
  assert.equal(c.buffer.presentation(8, -1).index, 9, 'do not overshoot to frame 7');
  c.buffer.bitmaps.set(8, { index: 8, closed: false });
  assert.equal(c.buffer.presentation(8, -1).index, 8);
  c.buffer.markPresented(8);
  assert.equal(c.buffer.presentation(9, 1).index, 9, 'a real reversal is allowed');
  c.buffer.dispose();
});

test('reversing while the displayed image lags catches up instead of holding until the camera returns', async () => {
  const c = controlled();
  for (const index of [2, 7, 8]) c.buffer.bitmaps.set(index, { index, closed: false });
  c.buffer.seek(8, 1); c.buffer.markPresented(2);
  c.buffer.seek(7, -1);
  assert.equal(c.buffer.presentation(7, -1).index, 7, 'ready image must display immediately on reversal');
  c.buffer.markPresented(7);
  c.buffer.bitmaps.set(6, { index: 6, closed: false });
  assert.equal(c.buffer.presentation(6, -1).index, 6, 'new direction stays monotonic after catching up');
  c.buffer.dispose(); await flush();
});

test('reversing upward lag into a forward scroll resets the old monotonic bound too', async () => {
  const c = controlled();
  for (const index of [2, 3, 8]) c.buffer.bitmaps.set(index, { index, closed: false });
  c.buffer.seek(2, -1); c.buffer.markPresented(8);
  c.buffer.seek(3, 1);
  assert.equal(c.buffer.presentation(3, 1).index, 3);
  c.buffer.markPresented(3);
  c.buffer.bitmaps.set(4, { index: 4, closed: false });
  assert.equal(c.buffer.presentation(4, 1).index, 4);
  c.buffer.dispose(); await flush();
});

test('the presented bitmap survives cache eviction and is released after replacement', async () => {
  const c = controlled();
  for (const index of [0, 1, 2, 3, 4]) c.buffer.bitmaps.set(index, { index, closed: false });
  c.buffer.markPresented(0); c.buffer.seek(8, 1);
  assert(c.buffer.bitmaps.has(0));
  assert(c.buffer.bitmaps.size <= settings.cacheSize);
  c.buffer.bitmaps.set(8, { index: 8, closed: false });
  c.buffer.markPresented(8); c.buffer.seek(8, 1);
  assert(!c.buffer.bitmaps.has(0));
  assert(c.released.includes(0));
  c.buffer.dispose(); await flush();
});

test('an anchor destination is prioritised for decode as well as download', async () => {
  const c = controlled(); c.buffer.seek(0, 1, 100, 10);
  c.network.get(10)(); await flush();
  assert(c.decoders.has(10));
  c.buffer.dispose(); c.decoders.get(10)(); await flush();
});

test('scene fades always sum to one across all transitions in either direction', () => {
  for (let p = 0; p <= 700; p++) {
    const position = p / 100;
    const { from, to, weight } = sceneBlend(position, 8);
    assert(from >= 0 && to < 8);
    assert(weight >= 0 && weight <= 1);
    const opacities = Array.from({length:8}, (_, i) => from === to && i === from ? 1
      : i === from ? 1 - weight : i === to ? weight : 0);
    assert(Math.abs(opacities.reduce((a,b) => a+b,0) - 1) < 1e-9);
    assert(opacities[Math.round(position)] >= .5 - 1e-9, 'the interactive scene stays visible');
  }
});

test('a held bitmap never causes speculative decoding to loop at rest', async () => {
  let decodes = 0;
  const buffer = new JourneyFrameBuffer({
    settings, frameCount: 12, reducedMotion: false,
    fetchFrame: async index => new Blob([String.fromCharCode(index)]),
    decode: async blob => { decodes++; return { index: (await blob.text()).charCodeAt(0) }; },
    release: () => {}, onReady: () => {},
  });
  buffer.bitmaps.set(0, { index: 0 }); buffer.markPresented(0);
  buffer.seek(8, 1, 100, 10);
  for (let i=0;i<30;i++) await flush();
  const settled = decodes;
  for (let i=0;i<30;i++) await flush();
  assert.equal(decodes, settled);
  assert(buffer.bitmaps.size <= settings.cacheSize);
  assert(buffer.bitmaps.has(0));
  buffer.dispose();
});

test('a rapid reversal can recover even when the held image is beyond the new camera', async () => {
  const c = controlled();
  c.buffer.seek(10,1);
  c.buffer.bitmaps.set(10, {index:10,closed:false}); c.buffer.markPresented(10);
  c.buffer.seek(2, -1);
  c.buffer.seek(3, 1);
  c.buffer.bitmaps.set(3, {index:3,closed:false});
  assert.equal(c.buffer.presentation(3,1).index,3,'the old image must not pin the camera until frame 10');
  c.buffer.dispose(); await flush();
});

test('scroll outrunning decode retains a late image that advances the presentation', async () => {
  const c=controlled();
  c.buffer.bitmaps.set(0,{index:0,closed:false});c.buffer.markPresented(0);
  c.buffer.seek(8,1,1200);
  c.network.get(8)();await flush();
  assert(c.decoders.has(8));
  c.buffer.seek(11,1,1200);
  c.decoders.get(8)();await flush();
  assert.equal(c.buffer.presentation(11,1).index,8);
  assert(!c.released.includes(8));assert(c.ready.length>0);
  c.buffer.dispose();await flush();
});

test('cold fast scroll decodes the latest downloaded image outside the future window', async () => {
  const c=controlled();
  c.buffer.bitmaps.set(0,{index:0,closed:false});c.buffer.markPresented(0);
  c.buffer.seek(4,1,1200);c.network.get(4)();await flush();
  c.buffer.seek(11,1,1200);
  // Completing the old decode leaves a presentable image, and later received
  // blobs behind the camera are eligible for the next decode slot too.
  c.decoders.get(4)();await flush();
  assert.equal(c.buffer.presentation(11,1).index,4);
  c.buffer.markPresented(4);
  const blob=new Blob(['x']);
  c.indices.set(blob,7);
  c.buffer.blobs.set(7,blob);
  // A repeat seek exercises the fallback without a frame-11 network response.
  c.buffer.seek(11,1,1200);await flush();
  assert(c.decoders.has(7));
  c.decoders.get(7)();await flush();
  c.buffer.seek(11,1,1200);await flush();
  assert.equal(c.buffer.presentation(11,1).index,7,'the next ready presentation survives speculative pruning');
  assert(c.buffer.bitmaps.size<=settings.cacheSize);
  c.buffer.dispose();for(const finish of [...c.decoders.values()])finish();await flush();
});
