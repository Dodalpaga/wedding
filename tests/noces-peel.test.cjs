const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../app/noces/peel.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
const loaded = { exports: {} };
new Function('module', 'exports', compiled.outputText)(loaded, loaded.exports);
const { peel } = loaded.exports;

const area = (points) => Math.abs(points.reduce((sum, p, i) => {
  const q = points[(i + 1) % points.length];
  return sum + p.x * q.y - q.x * p.y;
}, 0)) / 2;

test('un coin non tiré laisse l’autocollant entier, sans rabat', () => {
  const result = peel(800, 600, { x: 800, y: 0 });
  assert.equal(area(result.keep), 800 * 600);
  assert.equal(result.flap.length, 0);
});

test('le rabat est le reflet exact de la partie décollée et rejoint le point tiré', () => {
  const w = 800, h = 600, q = { x: 520, y: 260 };
  const result = peel(w, h, q);
  assert.ok(Math.abs(area(result.keep) + area(result.flap) - w * h) < 1e-6);
  // Le coin supérieur droit, replié, se retrouve exactement sur le point tiré.
  assert.ok(result.flap.some((p) => Math.hypot(p.x - q.x, p.y - q.y) < 1e-6));
  // Le pli passe par le milieu du segment coin → point tiré.
  assert.deepEqual(result.fold, { x: (w + q.x) / 2, y: q.y / 2 });
});

test('tiré assez loin, l’autocollant est entièrement décollé', () => {
  const result = peel(800, 600, { x: -1100, y: 300 });
  assert.equal(result.keep.length, 0);
});
