const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), ts = require('typescript');
const load = (name, deps = {}) => {
  const module = { exports: {} };
  const source = fs.readFileSync(path.join(__dirname, '../components/noces/' + name + '.ts'), 'utf8');
  new Function('module', 'exports', 'require', ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText)(module, module.exports, id => deps[id]);
  return module.exports;
};
const math = load('postcard-tilt');
const sample = (beta, gamma, alpha = 0) => math.orientationQuaternion({ alpha, beta, gamma });
const near = (actual, expected) => actual.forEach((v, i) => assert.ok(Math.abs(v - expected[i]) < 1e-8, `${actual} ≈ ${expected}`));

test('arbitrary load pose is neutral, with bounded portrait/landscape tilt', () => {
  for (const beta of [0, 45, 85, 100, 179]) {
    const neutral = sample(beta, 12, 137);
    near(math.relativeTilt(neutral, neutral, 0), [0, 0]);
  }
  near(math.relativeTilt(sample(65, 0, 30), sample(65, 25, 30), 0), [1, 0]);
  near(math.relativeTilt(sample(0, 0), sample(25, 0), 0), [0, 1]);
  near(math.relativeTilt(sample(0, 0), sample(0, 25), 90), [0, -1]);
  near(math.relativeTilt(sample(0, 0), sample(25, 0), 90), [1, 0]);
  near(math.relativeTilt(sample(0, 0), sample(0, -80), 0), [-1, 0]);
  near(math.relativeTilt(sample(179, 0), sample(-179, 0), 0), [0, 2 / 25]);
  assert.equal(sample(null, 0), null);
  assert.equal(sample(0, NaN), null);
});

// Exercise the real hook with deterministic React effects and browser events.
// No physical sensors, Firebase, or browser permissions are used by these tests.
function harness({ permission, coarse = true, reduced = false, secure = true, interactive = true } = {}) {
  const saved = new Map(['window','document','matchMedia','IntersectionObserver','requestAnimationFrame','cancelAnimationFrame'].map(key => [key, global[key]]));
  const events = () => { const listeners = new Map(); return { listeners,
    addEventListener(type, fn) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(fn); },
    removeEventListener(type, fn) { listeners.get(type)?.delete(fn); },
    emit(type, data) { for (const fn of [...listeners.get(type) || []]) fn(data); } }; };
  const touch = Object.assign(events(), { matches: coarse }), motion = Object.assign(events(), { matches: reduced });
  const orientation = Object.assign(events(), { angle: 0 });
  const frames = new Map(), timers = new Map(); let id = 0, observer;
  const win = Object.assign(events(), { isSecureContext: secure, DeviceOrientationEvent: permission ? { requestPermission: permission } : {}, screen: { orientation },
    setTimeout(fn) { const key = ++id; timers.set(key, fn); return key; } });
  // Hook uses the browser's global clearTimeout as well as window.setTimeout.
  const oldClear = global.clearTimeout; global.clearTimeout = key => timers.delete(key);
  const doc = Object.assign(events(), { hidden: false });
  Object.assign(global, { window: win, document: doc, matchMedia: query => query.includes('coarse') ? touch : motion,
    requestAnimationFrame: fn => { const key = ++id; frames.set(key, fn); return key; }, cancelAnimationFrame: key => frames.delete(key),
    IntersectionObserver: class { constructor(fn) { observer = this; this.fn = fn; } observe() {} disconnect() {} } });
  const cells = []; let index = 0, effects = [], result;
  const same = (a, b) => a && b && a.length === b.length && a.every((v, i) => v === b[i]);
  const react = {
    useState(initial) { const slot = index++; cells[slot] ??= { value: initial }; return [cells[slot].value, value => { cells[slot].value = value; }]; },
    useRef(initial) { const slot = index++; cells[slot] ??= { current: initial }; return cells[slot]; },
    useCallback(fn, deps) { const slot = index++; if (!same(cells[slot]?.deps, deps)) cells[slot] = { value: fn, deps }; return cells[slot].value; },
    useEffect(fn, deps) { const slot = index++; if (!same(cells[slot]?.deps, deps)) effects.push(() => { cells[slot]?.cleanup?.(); cells[slot] = { deps, cleanup: fn() }; }); }
  };
  const { usePostcardTilt } = load('usePostcardTilt', { react, './postcard-tilt': math });
  const updates = [], ref = { current: {} }, update = (x, y) => updates.push([x, y]);
  const render = (interactive = true) => { index = 0; result = usePostcardTilt(ref, update, interactive); for (const fn of effects) fn(); effects = []; return result; };
  render(interactive);
  return { win, doc, touch, motion, orientation, frames, timers, updates, render,
    sensor: (beta, gamma, alpha = 0) => win.emit('deviceorientation', { beta, gamma, alpha }),
    visible: value => observer.fn([{ isIntersecting: value }]),
    flush() { let steps = 0; while (frames.size) { assert.ok(++steps < 100); const tasks = [...frames.values()]; frames.clear(); tasks.forEach(fn => fn()); } },
    close() { cells.forEach(cell => cell?.cleanup?.()); for (const [key, value] of saved) if (value === undefined) delete global[key]; else global[key] = value; global.clearTimeout = oldClear; }
  };
}

test('first sensor sample calibrates offscreen; visible tilt settles, recenters and stops at rest', () => {
  const h = harness(); try {
    h.sensor(null, null); assert.equal(h.render().status, 'waiting');
    h.sensor(65, 8); h.sensor(65, 28); assert.equal(h.frames.size, 0);
    h.visible(true); h.flush(); assert.ok(h.updates.at(-1)[0] > .79);
    assert.equal(h.frames.size, 0); const count = h.updates.length;
    h.sensor(65, 28); h.flush(); assert.equal(h.updates.length, count);
    h.sensor(65, 28.01); h.flush(); assert.equal(h.updates.length, count, 'small sensor noise does not redraw');
    h.render().recenter(); near(h.updates.at(-1), [0, 0]); h.sensor(65, 28); h.flush(); near(h.updates.at(-1), [0, 0]);
    h.sensor(65, 8); h.flush(); assert.ok(h.updates.at(-1)[0] < -.79);
    h.visible(false); near(h.updates.at(-1), [0, 0]); h.sensor(65, 18); assert.equal(h.frames.size, 0);
    h.visible(true); h.doc.hidden = true; h.doc.emit('visibilitychange'); h.sensor(65, 20); assert.equal(h.frames.size, 0);
    h.doc.hidden = false; h.doc.emit('visibilitychange'); h.flush();
    h.orientation.angle = 90; h.orientation.emit('change'); h.sensor(60, 5); h.flush(); near(h.updates.at(-1), [0, 0]);
    h.motion.matches = true; h.motion.emit('change'); near(h.updates.at(-1), [0, 0]);
    assert.equal(h.win.listeners.get('deviceorientation').size, 0);
  } finally { h.close(); }
  assert.equal(h.win.listeners.get('deviceorientation').size, 0);
});

test('automatic sensors record neutral while the journey is still preparing', () => {
  const h = harness({ interactive: false }); try {
    h.sensor(65, 8); h.sensor(65, 28); assert.equal(h.frames.size, 0);
    h.render(true); h.visible(true); h.flush(); assert.ok(h.updates.at(-1)[0] > .79);
  } finally { h.close(); }
});

test('permission is requested only on activation, supports refusal, grant and late unmount', async () => {
  let calls = 0, response = 'denied';
  const h = harness({ permission: async () => { calls++; return response; } }); try {
    assert.equal(h.render().status, 'permission'); assert.equal(calls, 0);
    await h.render().enable(); assert.equal(h.render().status, 'denied');
    response = 'granted'; await h.render().enable(); h.render(); assert.equal(h.render().status, 'waiting');
    h.visible(true); h.sensor(50, 12); h.flush(); near(h.updates.at(-1), [0, 0]);
    assert.equal(h.render().status, 'active');
  } finally { h.close(); }
  let resolve; const late = harness({ permission: () => new Promise(done => { resolve = done; }) });
  const pending = late.render().enable(); late.close(); resolve('granted'); await pending;
  assert.equal(late.win.listeners.get('deviceorientation')?.size || 0, 0);
});

test('desktop, reduced motion, insecure context and absent samples have usable fallbacks', () => {
  for (const config of [{ coarse: false }, { reduced: true }, { secure: false }]) {
    const h = harness(config); try { assert.equal(h.win.listeners.get('deviceorientation')?.size || 0, 0); } finally { h.close(); }
  }
  const h = harness(); try { for (const fn of h.timers.values()) fn(); assert.equal(h.render().status, 'unavailable'); } finally { h.close(); }
});
