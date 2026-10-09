const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../components/motiontemplate/journey.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
const loaded = { exports: {} };
new Function('module', 'exports', compiled.outputText)(loaded, loaded.exports);
const { flightPoint, journeyState, globeCamera, mercatorY, COUNTRY_BOUNDS, TOULOUSE, TOKYO } = loaded.exports;

test('country views contain mainland France/Corsica and Japan including Okinawa at each screen size', () => {
  assert.equal(journeyState(0.66).flight, 1);
  assert.equal(journeyState(0.66).clouds, 0);
  for (const [width,height] of [[320,568],[820,1180],[1440,900],[844,390]]) {
    for (const [progress,bounds] of [[0,COUNTRY_BOUNDS.france],[.66,COUNTRY_BOUNDS.japan]]) {
      const camera=globeCamera(progress,width,height), scale=512*2**camera.zoom;
      const [west,south,east,north]=bounds;
      assert.ok((east-west)/360*scale<=width*.76001);
      assert.ok((mercatorY(south)-mercatorY(north))*scale<=height*.61001);
      assert.ok(camera.center[0]>west&&camera.center[0]<east);
      assert.ok(camera.center[1]>south&&camera.center[1]<north);
    }
    // Both camera blends meet without a jump at the flight/zoom boundaries.
    for (const p of [.035,.19,.48,.64]) {
      const before=globeCamera(p-.000001,width,height),after=globeCamera(p+.000001,width,height);
      assert.ok(Math.abs(before.zoom-after.zoom)<.001);
      assert.ok(Math.hypot(...before.center.map((v,i)=>v-after.center[i]))<.001);
    }
  }
});

test('Earth holds its apparent scale throughout the northern flight, with closer framing', () => {
  // Same radius calculation used by MapLibre's globe projection, independent
  // of latitude. A constant numeric zoom would fail this at the northern apex.
  const radius = camera => 512 * 2 ** camera.zoom / (2 * Math.PI * Math.cos(camera.center[1] * Math.PI / 180));
  for (const [width, height] of [[320,568],[820,1180],[1440,900],[844,390]]) {
    const target = Math.min(width, height) * 1.8 / (2 * Math.PI);
    for (let i = 0; i <= 100; i++) {
      assert.ok(Math.abs(radius(globeCamera(.19 + .29 * i / 100, width, height)) - target) < 1e-8);
    }
    let previous = radius(globeCamera(0, width, height));
    for (let i = 1; i <= 100; i++) {
      const next = radius(globeCamera(.19 * i / 100, width, height));
      assert.ok(next <= previous + 1e-8, 'departure only zooms out');
      previous = next;
    }
    for (let i = 0; i <= 100; i++) {
      const next = radius(globeCamera(.48 + .18 * i / 100, width, height));
      assert.ok(next >= previous - 1e-8, 'arrival only zooms in');
      previous = next;
    }
    const oldDepartureRadius = Math.min(width, height) * .8 / (2 * Math.PI * Math.cos(TOULOUSE[1] * Math.PI / 180));
    assert.ok(target > oldDepartureRadius * 1.3, 'minimum globe size is visibly larger');
  }
});

test('the flight follows the northern great circle from Toulouse to Tokyo', () => {
  const near = (actual, expected) => expected.forEach((v, i) => assert.ok(Math.abs(actual[i] - v) < 0.00001));
  near(flightPoint(0), TOULOUSE);
  near(flightPoint(1), TOKYO);
  assert.ok(flightPoint(0.5)[1] > 60, 'northern great-circle route');
  const positions = Array.from({length: 101}, (_, i) => flightPoint(i / 100));
  for (let i = 1; i < positions.length; i++) {
    assert.ok(positions[i][0] > positions[i-1][0], 'eastward route without date-line jump');
    assert.ok(positions[i].every(Number.isFinite));
  }
});

test('fast jumps and reverse scrolling give exactly the same scene at the same progress', () => {
  const forward = Array.from({length: 101}, (_, i) => journeyState(i / 100));
  const reverse = Array.from({length: 101}, (_, i) => journeyState((100 - i) / 100)).reverse();
  assert.deepEqual(reverse, forward);
  assert.equal(journeyState(0.5).flight, 1);
  assert.equal(journeyState(0.69).clouds, 0);
  assert.equal(journeyState(0.87).clouds, 1);
});
