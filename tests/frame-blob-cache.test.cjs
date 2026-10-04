const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const exportsObject = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('components/noces/frame-blob-cache.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, { exports: exportsObject, Blob, Map });
const { FrameBlobCache } = exportsObject;
const blob = size => new Blob([new Uint8Array(size)]);

test('evicts the least recently read frame, retaining recent reverse-scroll frames', () => {
  const cache = new FrameBlobCache(10);
  cache.set(0, blob(4)); cache.set(1, blob(4));
  assert.equal(cache.get(0).size, 4);
  cache.set(2, blob(4));
  assert.equal(cache.get(1), undefined);
  assert.equal(cache.get(0).size, 4);
  assert.equal(cache.get(2).size, 4);
});

test('replacement, oversized frames and clear do not consume stale capacity', () => {
  const cache = new FrameBlobCache(10);
  cache.set(0, blob(8)); cache.set(0, blob(2)); cache.set(1, blob(8));
  assert.equal(cache.get(0).size, 2);
  cache.set(2, blob(11));
  assert.equal(cache.get(2), undefined);
  assert.equal(cache.get(1).size, 8);
  cache.clear(); cache.set(3, blob(10));
  assert.equal(cache.get(0), undefined);
  assert.equal(cache.get(1), undefined);
  assert.equal(cache.get(3).size, 10);
});

test('traversing all 597 frames respects the mobile and desktop byte budgets', () => {
  for (const budget of [32, 48, 96]) {
    const cache = new FrameBlobCache(budget * 1024 * 1024);
    for (let i = 0; i < 597; i++) cache.set(i, blob(128 * 1024));
    let retained = 0;
    for (let i = 0; i < 597; i++) retained += cache.get(i)?.size || 0;
    assert.equal(retained, Math.min(budget * 1024 * 1024, 597 * 128 * 1024));
    assert.equal(cache.get(596).size, 128 * 1024);
    assert.equal(Boolean(cache.get(0)), budget === 96);
  }
});
