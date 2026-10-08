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
    const orbit=Math.log2(Math.min(width,height)*.8/512);
    assert.ok(Math.abs(globeCamera(.3,width,height).zoom-orbit)<1e-10);
    // Both camera blends meet without a jump at the flight/zoom boundaries.
    for (const p of [.035,.19,.48,.64]) {
      const before=globeCamera(p-.000001,width,height),after=globeCamera(p+.000001,width,height);
      assert.ok(Math.abs(before.zoom-after.zoom)<.001);
      assert.ok(Math.hypot(...before.center.map((v,i)=>v-after.center[i]))<.001);
    }
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
