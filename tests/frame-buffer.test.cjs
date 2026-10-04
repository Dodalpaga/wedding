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
const settings = {
  cacheSize: 4, decodeAhead: 2, downloadAhead: 8, downloadMaxAhead: 10,
  downloadBehind: 2, fetchConcurrency: 3, decodeConcurrency: 1, blobCacheBytes: 100, preloadAll: false,
};
const flush = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };
function controlled(reducedMotion = false) {
  const network = new Map(); const decoders = new Map();
  const started = []; const released = []; const ready = [];
  const indices = new WeakMap();
  const buffer = new JourneyFrameBuffer({
    settings, frameCount: 12, reducedMotion,
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
  return { buffer, network, decoders, started, released, ready };
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
