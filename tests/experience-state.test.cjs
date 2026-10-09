const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const load=(name,deps={})=>{const module={exports:{}};new Function('module','exports','require',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../components/noces/'+name+'.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(module,module.exports,id=>deps[id]);return module.exports;};
const journey=load('journey'),{experienceState,restaurantPose,RESTAURANT_POSES,INTRO_FADE_END,FLIGHT_END}=load('experience-state',{'./journey':journey});

test('title finishes fading before Earth moves, in either scroll direction',()=>{
 for(const [width,height] of [[320,568],[820,1180],[1440,900]]) {
  const initial=journey.globeCamera(0,width,height);
  for(let i=0;i<=100;i++) {
   const p=INTRO_FADE_END*i/100;
   assert.deepEqual(journey.globeCamera(experienceState(p).flight,width,height),initial);
  }
  const moving=INTRO_FADE_END+(FLIGHT_END-INTRO_FADE_END)*.1;
  assert.equal(1-journey.phase(moving,0,INTRO_FADE_END),0);
  assert.notDeepEqual(journey.globeCamera(experienceState(moving).flight,width,height),initial);
 }
 assert.equal(experienceState(FLIGHT_END).flight,1,'cloud/model transition keeps its timing');
});
test('three restaurant chapters follow the cities and return outside before the postcard',()=>{
 assert.equal(experienceState(.31).model,'tokyo');assert.equal(experienceState(.46).restaurantChapter,'finding');assert.equal(experienceState(.72).restaurantChapter,'food');assert.equal(experienceState(.82).restaurantChapter,'kitchen');
 assert.deepEqual(restaurantPose(0),restaurantPose(1));assert.equal(experienceState(1).restaurant,1);
});
test('restaurant holds remain exact and camera seeks are reversible',()=>{
 for(const pose of RESTAURANT_POSES){const actual=restaurantPose(pose.at);for(const key of ['position','target'])for(let i=0;i<3;i++)assert.ok(Math.abs(actual[key][i]-pose[key][i])<1e-12);}
 const points=Array.from({length:501},(_,i)=>i/500),forward=points.map(p=>restaurantPose(p));
 for(let i=points.length-1;i>=0;i--)assert.deepEqual(restaurantPose(points[i]),forward[i]);
});
test('camera path has no discontinuity at doorway and hold boundaries',()=>{
 for(const pose of RESTAURANT_POSES.slice(1,-1)){const a=restaurantPose(pose.at-.00001),b=restaurantPose(pose.at+.00001);for(const key of ['position','target'])for(let i=0;i<3;i++)assert.ok(Math.abs(a[key][i]-b[key][i])<.001);}
});
test('camera crosses the doorway below the hanging entrance cloth in both directions',()=>{
 for(const range of [[.28,.36],[.84,.9]])for(let i=0;i<=100;i++){
  const pose=restaurantPose(range[0]+(range[1]-range[0])*i/100);
  assert.equal(pose.position[0],.75);assert.equal(pose.position[1],1.1);
  assert.ok(pose.position[2]>=1.7&&pose.position[2]<=4.88);
 }
});
