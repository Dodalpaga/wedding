const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const load=(name,deps={})=>{const module={exports:{}};new Function('module','exports','require',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../components/noces/'+name+'.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(module,module.exports,id=>deps[id]);return module.exports;};
const journey=load('journey'),{experienceState,restaurantPose,RESTAURANT_POSES,HERO_SCROLL_END,INTRO_FADE_END,FLIGHT_END,EXPERIENCE_START,RESTAURANT_REVEAL_END,RESTAURANT_END,SOUVENIR_START,SOUVENIR_END,journeyProgress,videoInterludeActive}=load('experience-state',{'./journey':journey});

test('the neutral hero completes before the globe journey begins',()=>{
 assert.equal(journeyProgress(0),0);
 assert.equal(journeyProgress(HERO_SCROLL_END),0);
 assert.ok(journeyProgress(HERO_SCROLL_END+.01)>0);
 assert.equal(journeyProgress(1),1);
 for(let i=0;i<=100;i++)assert.equal(journeyProgress(HERO_SCROLL_END*i/100),0);
});

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
test('three restaurant chapters finish inside before the souvenir carousel',()=>{
 assert.equal(videoInterludeActive(EXPERIENCE_START),true);assert.equal(videoInterludeActive(RESTAURANT_REVEAL_END-.0001),true);assert.equal(videoInterludeActive(RESTAURANT_REVEAL_END),false);
 assert.equal(experienceState(.31).visible,true);assert.equal(experienceState(.46).restaurantChapter,'finding');assert.equal(experienceState(.54).restaurantChapter,'food');assert.equal(experienceState(.64).restaurantChapter,'kitchen');
 assert.equal(RESTAURANT_END,.64);assert.equal(SOUVENIR_START,.68);
 assert.equal(experienceState(RESTAURANT_END).restaurant,1);assert.equal(experienceState(SOUVENIR_START).restaurant,1);
 assert.equal(SOUVENIR_END,.99,'the final souvenir finishes just before the sticky journey ends');
 assert.deepEqual(restaurantPose(.9),restaurantPose(1));
 assert.deepEqual(restaurantPose(1),{position:[.75,1.4,.8],target:[-1.3,.85,-1.6]});
 assert.equal(experienceState(1).restaurant,1);
});
test('restaurant camera starts at the current 10% framing and finishes on an interior view',()=>{
 const first=RESTAURANT_POSES[0],next=RESTAURANT_POSES[1],t=journey.phase(.1,first.at,next.at),initial=restaurantPose(0);
 for(const key of ['position','target'])for(let i=0;i<3;i++)assert.ok(Math.abs(initial[key][i]-(first[key][i]+(next[key][i]-first[key][i])*t))<1e-12);
 const finalPose=restaurantPose(1);
 assert.ok(finalPose.position[2]<1.7,'the final camera stays inside the doorway');
 assert.deepEqual(restaurantPose(.9),finalPose);
});
test('restaurant holds remain exact and camera seeks are reversible',()=>{
 for(const pose of RESTAURANT_POSES.filter(({at})=>at>=.1)){const actual=restaurantPose(pose.at-.1);for(const key of ['position','target'])for(let i=0;i<3;i++)assert.ok(Math.abs(actual[key][i]-pose[key][i])<1e-12);}
 const points=Array.from({length:501},(_,i)=>i/500),forward=points.map(p=>restaurantPose(p));
 for(let i=points.length-1;i>=0;i--)assert.deepEqual(restaurantPose(points[i]),forward[i]);
});
test('camera path has no discontinuity at doorway and hold boundaries',()=>{
 for(const pose of RESTAURANT_POSES.slice(1,-1)){const a=restaurantPose(pose.at-.1-.00001),b=restaurantPose(pose.at-.1+.00001);for(const key of ['position','target'])for(let i=0;i<3;i++)assert.ok(Math.abs(a[key][i]-b[key][i])<.001);}
});
test('camera enters below the hanging entrance cloth without backing out',()=>{
 for(const range of [[.18,.26]])for(let i=0;i<=100;i++){
  const pose=restaurantPose(range[0]+(range[1]-range[0])*i/100);
  assert.equal(pose.position[0],.75);assert.equal(pose.position[1],1.1);
  assert.ok(pose.position[2]>=1.7&&pose.position[2]<=4.88);
 }
 for(let i=0;i<=100;i++)assert.ok(restaurantPose(.82+i*.0018).position[2]<1.7);
});
