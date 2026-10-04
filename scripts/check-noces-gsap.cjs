// Compare two static exports. Pass --before/--after, and optionally
// --playwright-module, --chrome-path and --report for the local test runtime.
const option = (name, fallback) => { const index=process.argv.indexOf(name); return index<0?fallback:process.argv[index+1]; };
const { chromium } = require(option('--playwright-module','playwright'));
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const directory = path.resolve(option('--report','docs/screenshots/noces-fluidity'));
const cpuRate = Number(option('--cpu-rate','4'));
const fastSteps = Number(option('--fast-steps','60'));
fs.mkdirSync(directory, { recursive: true });
function serve(root, port) {
  const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.webp':'image/webp', '.svg':'image/svg+xml', '.otf':'font/otf' };
  const server = http.createServer((req,res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = path.resolve(root, '.' + pathname.replace(/^\/wedding(?=\/)/, ''));
    if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file,'index.html');
    if (!fs.existsSync(file)) return res.writeHead(404).end();
    res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    res.setHeader('Cache-Control','no-store');
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(resolve => server.listen(port,'127.0.0.1',() => resolve(server)));
}
function instrument() {
  const probe = window.probe = { recording:false, callbacks:[], draws:[], longTasks:[], readbacksInRaf:0, readbacks:0, decoded:0, peakDecoded:0, frame:-1, bytes:0, rafDepth:0 };
  const originalRaf = requestAnimationFrame;
  window.requestAnimationFrame = cb => originalRaf(now => {
    const start=performance.now(); probe.rafDepth++;
    try { cb(now); } finally { probe.rafDepth--; if(probe.recording) probe.callbacks.push(performance.now()-start); }
  });
  const blobIds=new WeakMap(), frameIds=new WeakMap(), previews=new WeakSet(), previewBlobs=new WeakSet();
  const originalFetch=fetch;
  window.fetch=async(...args) => {
    const response=await originalFetch(...args);
    const match=String(args[0]).match(/frame-(\d+)/);
    if(String(args[0]).includes('noces-preview.webp')) {
      const originalBlob=response.blob.bind(response);
      response.blob=async()=>{const blob=await originalBlob();previewBlobs.add(blob);return blob;};
    }
    if(match) { const originalBlob=response.blob.bind(response); response.blob=async() => {
      const blob=await originalBlob(); blobIds.set(blob,Number(match[1])-1); probe.bytes+=blob.size; return blob;
    }; }
    return response;
  };
  const originalBitmap=createImageBitmap;
  probe.pendingDecodes=0;
  const originalImageDecode=HTMLImageElement.prototype.decode;
  HTMLImageElement.prototype.decode=function(...args) {
    probe.pendingDecodes++;
    return originalImageDecode.apply(this,args).then(value=>{
      if(/frame-\d/.test(this.src))probe.decodedImages=(probe.decodedImages||0)+1;
      return value;
    }).finally(()=>probe.pendingDecodes--);
  };
  window.createImageBitmap=async(...args) => {
    probe.pendingDecodes++;
    let frame;
    try { frame=await originalBitmap(...args); } finally { probe.pendingDecodes--; }
    if(args[0] instanceof HTMLImageElement && /noces-preview\.webp/.test(args[0].src)) previews.add(frame);
    if(previewBlobs.has(args[0]))previews.add(frame);
    if(blobIds.has(args[0])) { frameIds.set(frame,blobIds.get(args[0])); probe.decoded++; probe.peakDecoded=Math.max(probe.peakDecoded,probe.decoded); }
    return frame;
  };
  const originalClose=ImageBitmap.prototype.close;
  ImageBitmap.prototype.close=function() { if(frameIds.has(this)){probe.decoded--;frameIds.delete(this);} return originalClose.call(this); };
  const originalDraw=CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage=function(...args) {
    const nativeImage=args[0] instanceof HTMLImageElement && args[0].src.match(/frame-(\d+)/);
    const previewTile=(previews.has(args[0]) || args[0] instanceof HTMLImageElement && /noces-preview\.webp/.test(args[0].src)) && args.length===9;
    if(previewTile) probe.previewPresented=true;
    if(this.canvas.className==='noces-canvas' && (nativeImage || frameIds.has(args[0]) || previewTile)) {
      probe.lastDraw=performance.now();
      probe.frame=previewTile ? args[1]/128+args[2]/72*20 : nativeImage ? Number(nativeImage[1])-1 : frameIds.get(args[0]);
      probe.sourceWidth=args[0].naturalWidth || args[0].width;
      if(probe.recording)probe.draws.push({time:performance.now(),frame:probe.frame,scrollY,quality:previewTile?'preview':'native'});
    }
    return originalDraw.apply(this,args);
  };
  const originalRead=CanvasRenderingContext2D.prototype.getImageData;
  CanvasRenderingContext2D.prototype.getImageData=function(...args) {
    if(probe.recording) { probe.readbacks++; if(probe.rafDepth)probe.readbacksInRaf++; }
    return originalRead.apply(this,args);
  };
  new PerformanceObserver(list => { if(probe.recording) probe.longTasks.push(...list.getEntries().map(e => ({start:e.startTime,duration:e.duration}))); }).observe({type:'longtask',buffered:true});
}
async function phase(page, start, end, steps) {
  return page.evaluate(async ({start,end,steps}) => {
    const root=document.querySelector('.noces-journey'), stage=document.querySelector('.noces-stage');
    const distance=root.offsetHeight-stage.clientHeight;
    const samples=[];
    probe.callbacks=[];probe.draws=[];probe.longTasks=[];probe.readbacks=0;probe.readbacksInRaf=0;probe.recording=true;
    for(let i=0;i<=steps;i++) {
      const target=start+(end-start)*i/steps;
      scrollTo({top:root.offsetTop+distance*target/596,behavior:'instant'});
      // Sample after all callbacks of this refresh. A microtask resumed inside
      // the first callback would otherwise report the previous camera frame.
      await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve,0)));
      const scenes=[...root.querySelectorAll('[data-scene]')];
      const opacitySum=scenes.reduce((sum,scene)=>sum+Number(scene.style.opacity),0);
      samples.push({target,frame:probe.frame,time:performance.now(),opacitySum});
    }
    probe.recording=false;
    const stats=values=>{values.sort((a,b)=>a-b);return{p50:values[Math.floor(values.length*.5)]??0,p95:values[Math.floor(values.length*.95)]??0,p99:values[Math.floor(values.length*.99)]??0};};
    const direction=Math.sign(end-start);
    let wrongWay=0;const directionErrors=[],boundaryCatchUps=[];
    for(let i=1;i<probe.draws.length;i++)if((probe.draws[i].frame-probe.draws[i-1].frame)*direction<0){
      const previous=probe.draws[i-1],current=probe.draws[i];
      const target=(current.scrollY-root.offsetTop)/distance*596;
      // At the first reversal, a delayed image may be on the wrong side of the
      // new camera. Allow one closer catch-up at this boundary, never a rewind
      // later in the same direction. Record it separately instead of hiding it.
      const catchesUp=i===1 && Math.abs(previous.scrollY-(root.offsetTop+distance*start/596))<1
        && Math.sign(current.scrollY-previous.scrollY)===direction
        && Math.abs(current.frame-target)<Math.abs(previous.frame-target);
      if(catchesUp)boundaryCatchUps.push({previous,current,target});
      else {wrongWay++;directionErrors.push({previous,current});}
    }
    return {start,end,steps,drawCount:probe.draws.length,nativeDrawCount:probe.draws.filter(d=>d.quality==='native').length,previewDrawCount:probe.draws.filter(d=>d.quality==='preview').length,wrongWay,callbackMs:stats(probe.callbacks),frameGap:stats(samples.map(s=>Math.abs(s.target-s.frame))),
      drawingIntervalMs:stats(probe.draws.slice(1).map((d,i)=>d.time-probe.draws[i].time)),longTasks:probe.longTasks,
      readbacksInRaf:probe.readbacksInRaf,totalReadbacks:probe.readbacks,minOpacitySum:Math.min(...samples.map(s=>s.opacitySum)),
      bytes:probe.bytes,peakDecoded:probe.peakDecoded,sourceWidth:probe.sourceWidth,finalFrame:probe.frame,directionErrors,boundaryCatchUps};
  },{start,end,steps});
}
(async()=>{
  const servers=await Promise.all([serve(path.resolve(option('--before','build/noces-network-validation/out')),4196),serve(path.resolve(option('--after','build/noces-fluidity-validation/out')),4197)]);
  const browser=await chromium.launch({headless:true,...(option('--chrome-path')?{executablePath:option('--chrome-path')}:{})});
  const browserSession=await browser.newBrowserCDPSession();
  const system=await browserSession.send('SystemInfo.getInfo');
  fs.writeFileSync(path.join(directory,'gpu.json'),JSON.stringify({devices:system.gpu.devices,features:system.gpu.featureStatus,aux:system.gpu.auxAttributes},null,2));
  const report=[];
  const traces=[];
  const versions=process.argv.includes('--only-after')?[['after',4197]]:[['before',4196],['after',4197]];
  try {
    for(const [width,height] of (process.argv.includes('--only-network')?[]:[[320,568],[820,1180],[1440,900]]).filter(([width])=>!option('--viewport')||width===Number(option('--viewport')))) for(const [label,port] of versions) {
      const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:2,isMobile:width<1024});
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.route(/firestore|identitytoolkit/,route=>route.abort());
      await page.addInitScript(instrument);
      const cdp=await page.context().newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpuRate});
      await page.goto(`http://127.0.0.1:${port}/wedding/noces/`,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>document.querySelector('.noces-canvas')?.style.opacity==='1');
      if(label==='after'||process.argv.includes('--warm-both'))await page.waitForFunction(()=>document.querySelector('.noces-canvas')?.dataset.sequenceLoaded==='true',{},{timeout:90000});
      else await page.waitForTimeout(1800);
      if(width===Number(option('--trace-width','320'))) await cdp.send('Tracing.start',{categories:'devtools.timeline,disabled-by-default-devtools.timeline,disabled-by-default-devtools.timeline.frame,blink.user_timing',transferMode:'ReturnAsStream'});
      const phases=[];
      for(let repeat=0;repeat<3;repeat++) {
        phases.push({repeat,name:'regular',...await phase(page,0,90,90)});
        phases.push({repeat,name:'fast',...await phase(page,90,596,fastSteps)});
        phases.push({repeat,name:'reverse',...await phase(page,596,0,fastSteps)});
        await page.waitForTimeout(200);
      }
      if(width===Number(option('--trace-width','320'))) {
        const done=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));
        await cdp.send('Tracing.end');const {stream}=await done;
        let trace='';while(true){const chunk=await cdp.send('IO.read',{handle:stream});trace+=chunk.base64Encoded?Buffer.from(chunk.data,'base64').toString():chunk.data;if(chunk.eof)break;}
        await cdp.send('IO.close',{handle:stream});
        fs.writeFileSync(`build/noces-fluidity-trace-${label}.json`,trace);
        const events=JSON.parse(trace).traceEvents;
        const durations={};for(const e of events){if(e.ph==='X'&&typeof e.dur==='number'){const stats=durations[e.name]??={count:0,totalMs:0,maxMs:0};stats.count++;stats.totalMs+=e.dur/1000;stats.maxMs=Math.max(stats.maxMs,e.dur/1000);}}
        traces.push({label,width,eventCount:events.length,durations});fs.writeFileSync(path.join(directory,'trace-stats.json'),JSON.stringify(traces,null,2));
      }
      const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,canvasWidth:document.querySelector('.noces-canvas').width}));
      if(label==='after') {
        if(phases.some(p=>p.wrongWay))fs.writeFileSync(path.join(directory,`direction-errors-${width}.json`),JSON.stringify(phases,null,2));
        assert.equal(errors.length,0);assert.equal(layout.overflow,false);
        for(const p of phases) { assert.equal(p.wrongWay,0,'presentation must follow scroll direction'); assert.equal(p.sourceWidth,1280); assert.equal(p.readbacksInRaf,0); assert(p.minOpacitySum>=.999); }
        await page.evaluate(()=>{history.replaceState(null,'','#escale-1');dispatchEvent(new HashChangeEvent('hashchange'));});
        await page.waitForTimeout(250);
        if(width<768) { await page.locator('#escale-1 summary').click(); assert(await page.locator('#escale-1 details').getAttribute('open')!==null); }
        await page.screenshot({path:path.join(directory,`after-${width}.png`)});
        await page.locator('[data-next]').focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(1200);
        assert(await page.evaluate(()=>document.activeElement?.closest('[data-scene]')?.id==='escale-2'));
        await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);
        assert.equal(await page.locator('.noces-journey').getAttribute('data-enhanced'),null);
        await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(300);
        // Allow image recovery to settle before checking idle work.
        const recoveryStarted=Date.now();
        await page.waitForFunction(()=>probe.pendingDecodes===0,{},{timeout:30000});
        await page.waitForFunction(()=>performance.now()-(probe.lastDraw||0)>1500,{},{timeout:20000});
        const idleBefore=await page.evaluate(()=>{probe.callbacks=[];probe.draws=[];probe.recording=true;return probe.frame;});
        await page.waitForTimeout(1500);
        const idle=await page.evaluate(()=>{probe.recording=false;return{callbacks:probe.callbacks.length,draws:probe.draws.length,frame:probe.frame};});
        layout.idle=idle;layout.idleBefore=idleBefore;layout.recoveryMs=Date.now()-recoveryStarted-1500;
        assert.equal(idle.draws,0,'no drawings once resources and scroll settle');
        await page.setViewportSize({width:844,height:390});
        await page.waitForTimeout(150);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
        assert(await page.locator('.noces-canvas').evaluate(canvas=>canvas.style.opacity==='1'));
      }
      report.push({label,width,height,cpuRate,phases,layout,errors});
      console.log(JSON.stringify({label,width,regular:phases[0],fast:phases[1],layout}));
      fs.writeFileSync(path.join(directory,'runtime.json'),JSON.stringify(report,null,2));
      await page.close();
    }
    // Separate cold/network-limited run. No pre-scroll warmup.
    for(const [label,port] of versions) {
      const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:2});
      await page.addInitScript(instrument);
      await page.route(/firestore|identitytoolkit/,route=>route.abort());
      const cdp=await page.context().newCDPSession(page);await cdp.send('Network.enable');
      await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:10*1024*1024/8,uploadThroughput:1024*1024});
      await page.goto(`http://127.0.0.1:${port}/wedding/noces/`,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>document.querySelector('.noces-canvas')?.style.opacity==='1');
      const phases=[await phase(page,0,596,90),await phase(page,596,0,90)];
      let afterReserve;
      report.push({label,network:'10 Mbit/s, 150ms, cold',width:390,phases,afterReserve});
      fs.writeFileSync(path.join(directory,'runtime.json'),JSON.stringify(report,null,2));await page.close();
    }
    for(const mode of ['no-js','reduced']) {
      const page=await browser.newPage({viewport:{width:320,height:568},javaScriptEnabled:mode!=='no-js',reducedMotion:mode==='reduced'?'reduce':'no-preference'});
      let frameRequests=0;page.on('request',req=>{if(/frame-\d/.test(req.url()))frameRequests++;});
      await page.goto('http://127.0.0.1:4197/wedding/noces/',{waitUntil:'load'});
      assert.equal(await page.locator('.noces-journey').getAttribute('data-enhanced'),null);
      assert(await page.locator('#cadeau').isVisible());
      if(mode==='reduced')assert(frameRequests<=2);
      report.push({mode,frameRequests,allContentInFlow:true});await page.close();
    }
    fs.writeFileSync(path.join(directory,'runtime.json'),JSON.stringify(report,null,2));
    console.log('Browser validation complete');
  } finally { await browser.close();servers.forEach(server=>{server.closeAllConnections();server.close();}); }
})().catch(error=>{console.error(error);process.exitCode=1;});
