/* Optional integration suite. Install playwright as a development tool.
   Run: npm install --no-save playwright && npx playwright install chromium
        node tests/browser.cjs
   CHROME_PATH may point at an existing Chromium/Chrome binary. */
const fs=require('node:fs/promises');
const http=require('node:http');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..');
const screenshotDir=path.join(root,'test-results');
let swRevision=0;
const server=http.createServer(async(req,res)=>{try{let p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(p.startsWith('/repo/'))p=p.slice(5);if(p==='/')p='/index.html';const file=path.resolve(root,'.'+p);if(!file.startsWith(root+path.sep))throw Error();const types={html:'text/html',js:'application/javascript',css:'text/css',webmanifest:'application/manifest+json',png:'image/png'};res.setHeader('Content-Type',types[p.split('.').pop()]||'text/plain');let bytes=await fs.readFile(file);if(p==='/sw.js'&&swRevision)bytes=Buffer.from(bytes.toString().replace("tycoon-v1.1.0","tycoon-v1.1."+swRevision));res.end(bytes)}catch{res.writeHead(404);res.end('Not found')}});
async function run(){
 await new Promise((resolve,reject)=>{server.on('error',reject);server.listen(0,'127.0.0.1',resolve)});
 const origin=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 let count=0;const check=(name)=>{count++;console.log('PASS '+name)};
 try{
  await fs.mkdir(screenshotDir,{recursive:true});
  const context=await browser.newContext({serviceWorkers:'block'});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/repo/?debug');await page.waitForFunction(()=>window.tycoonDebug.renderer.art.ready);
  await page.getByRole('button',{name:'Open the store'}).click();
  await page.evaluate(()=>{window.tycoonDebug.engine.s.paused=true;window.tycoonDebug.advance(25)});
  assert.ok(await page.evaluate(()=>window.tycoonDebug.engine.s.stats.sales>=1));check('first sale through UI');
  await page.locator('#panel [data-action="select-fixture"]').first().click();
  const before=await page.evaluate(()=>window.tycoonDebug.engine.s.fixtures[0].stock);
  await page.locator('#panel [data-action="restock"]').click();
  assert.ok(await page.evaluate(()=>window.tycoonDebug.engine.s.fixtures[0].stock)>before);check('restock through UI');
  await page.locator('#panel [data-action="upgrade"]').click();assert.equal(await page.evaluate(()=>window.tycoonDebug.engine.s.fixtures[0].level),2);check('upgrade through UI');
  // An ordinary pan cannot select or move a fixture.
  await page.locator('#panel-close').click();
  const point=await page.evaluate(()=>{const r=window.tycoonDebug.renderer,b=r.canvas.getBoundingClientRect();return{x:b.left+r.w/2+(5*r.tile-r.camera.x)*r.scale,y:b.top+r.h/2+(5.3*r.tile-r.camera.y)*r.scale}});
  await page.mouse.move(point.x,point.y);await page.mouse.down();await page.mouse.move(point.x+60,point.y+35,{steps:6});await page.mouse.up();
  assert.equal(await page.evaluate(()=>window.tycoonDebug.ui.selection),null);assert.equal(await page.evaluate(()=>window.tycoonDebug.engine.s.fixtures[0].x),4);check('pan does not ghost tap or move furniture');
  await page.evaluate(()=>{window.tycoonDebug.jump('15m');window.tycoonDebug.engine.s.paused=true});
  const nav=page.locator('#railnav:visible,.bottom-nav:visible');
  await nav.locator('[data-tab="build"]').click();
  await page.locator('#panel [data-action="build"][data-type="computing"]').click();
  const tile=await page.evaluate(()=>{const r=window.tycoonDebug.renderer,b=r.canvas.getBoundingClientRect();return{x:b.left+r.w/2+(8.5*r.tile-r.camera.x)*r.scale,y:b.top+r.h/2+(5.5*r.tile-r.camera.y)*r.scale}});
  await page.mouse.click(tile.x,tile.y);await page.locator('#place-confirm').click();assert.equal(await page.evaluate(()=>window.tycoonDebug.engine.s.fixtures.length),2);check('build preview and confirm');
  await page.locator('#panel [data-action="select-fixture"]').last().click();await page.locator('#panel [data-action="restock"]').click();
  await nav.locator('[data-tab="staff"]').click();await page.locator('#panel [data-action="hire"][data-id="jamie"]').click();assert.ok(await page.evaluate(()=>window.tycoonDebug.engine.hasStaff('jamie')));check('hire a cashier');
  await page.locator('#panel-close').click();
  await page.evaluate(()=>{window.tycoonDebug.engine.s.xp=1200;window.tycoonDebug.engine.s.orders=[{id:'order-9',type:'computing',remaining:80}];window.tycoonDebug.ui.render()});
  await page.locator('#panel [data-action="fulfil"]').click();assert.equal(await page.evaluate(()=>window.tycoonDebug.engine.s.stats.online),1);check('online order uses shared stock');
  await page.evaluate(()=>{window.tycoonDebug.engine.s.requestUnused=undefined;window.tycoonDebug.save.save(window.tycoonDebug.engine.s)});const expected=await page.evaluate(()=>window.tycoonDebug.engine.s.cash);await page.reload();assert.equal(await page.evaluate(()=>window.tycoonDebug.engine.s.cash),expected);check('save survives reload');await page.evaluate(()=>{window.tycoonDebug.jump('1h');window.tycoonDebug.engine.s.paused=true;window.tycoonDebug.engine.s.researchPoints=100;window.tycoonDebug.ui.render()});await page.locator('#panel [data-action="select-checkout"]').click();await page.locator('#panel [data-action="second-checkout"]').click();assert.equal(await page.evaluate(()=>tycoonDebug.engine.s.secondCheckout),true);check('second checkout through UI');await page.locator('#panel-close').click();await page.locator('#panel [data-action="select-fixture"]').first().click();await page.evaluate(()=>{tycoonDebug.engine.s.fixtures[0].stock=0;tycoonDebug.ui.render()});await page.locator('#panel [data-action="delivery"][data-mode="standard"]').click();assert.equal(await page.evaluate(()=>tycoonDebug.engine.s.deliveries.length),1);await page.evaluate(()=>tycoonDebug.advance(35));assert.equal(await page.evaluate(()=>tycoonDebug.engine.s.deliveries.length),0);check('supplier order and arrival through UI');await page.locator('#panel-close').click();await page.locator('#panel [data-action="tab"][data-tab="operations"]').click();await page.locator('#panel [data-action="research"][data-id="pos"]').click();assert.ok(await page.evaluate(()=>tycoonDebug.engine.s.researched.includes('pos')));check('research through UI');
  const sizes=[[320,568],[390,844],[430,932],[768,1024],[820,1180],[1024,1366],[1024,768],[1366,1024],[844,390],[700,600]];
  for(const [width,height] of sizes){await page.setViewportSize({width,height});await page.locator('#world').waitFor({state:'visible'});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));const result=await page.evaluate(()=>{const c=document.querySelector('#world').getBoundingClientRect();return{overflow:document.documentElement.scrollWidth>innerWidth+1,vertical:document.documentElement.scrollHeight>innerHeight+1,nav:[...document.querySelectorAll('.bottom-nav button')].map(b=>b.getBoundingClientRect().toJSON()),canvas:c.width>0&&c.height>0,selection:window.tycoonDebug.ui.selection,fixtures:window.tycoonDebug.engine.s.fixtures.length}});assert.equal(result.overflow,false,`${width}x${height} horizontal overflow`);assert.equal(result.vertical,false,`${width}x${height} vertical overflow`);assert.ok(result.canvas);assert.equal(result.fixtures,2);if(width<840)for(const b of result.nav){assert.ok(b.bottom<=height+1&&b.height>=48&&b.width>=48)}check(`responsive ${width}x${height}`);if(width===390||width===1366)await page.screenshot({path:path.join(screenshotDir,`game-${width}x${height}.png`)})}
  await page.setViewportSize({width:1320,height:980});
  await page.evaluate(()=>window.gameBridge.setDisplayEnvironment({posture:'book',hinge:{x:654,y:0,width:12,height:980,occludes:true}}));
  let panes=await page.evaluate(()=>({world:document.querySelector('.world-wrap').getBoundingClientRect().toJSON(),panel:document.querySelector('.inspector').getBoundingClientRect().toJSON()}));assert.ok(panes.world.right<=654);assert.ok(panes.panel.left>=666);check('book hinge separates world and controls');
  await page.setViewportSize({width:900,height:1200});
  await page.evaluate(()=>window.gameBridge.setDisplayEnvironment({posture:'tabletop',hinge:{x:0,y:590,width:900,height:20,occludes:true}}));panes=await page.evaluate(()=>({world:document.querySelector('.world-wrap').getBoundingClientRect().toJSON(),panel:document.querySelector('.inspector').getBoundingClientRect().toJSON()}));assert.ok(panes.world.bottom<=590);assert.ok(panes.panel.top>=610);check('tabletop hinge stays clear');
  await page.evaluate(()=>window.gameBridge.setDisplayEnvironment({posture:'flat'}));
  await page.evaluate(()=>{const state=window.tycoonDebug.engine.s;state.xp=0;state.time=0;state.opened=true;state.customers=[];window.tycoonDebug.advance(480)});assert.ok(await page.locator('#modal').isVisible());await page.getByRole('button',{name:'A new day'}).click();check('daily report and continue');
  assert.deepEqual(errors,[]);check('no browser runtime errors');await context.close();
  // A fresh browser verifies project-subpath install and actual offline reload.
  const offlineContext=await browser.newContext();const offlinePage=await offlineContext.newPage();await offlinePage.goto(origin+'/repo/');await offlinePage.evaluate(()=>navigator.serviceWorker.ready);await offlinePage.reload();await offlinePage.waitForFunction(()=>navigator.serviceWorker.controller!==null);const manifest=await offlinePage.evaluate(async()=>await (await fetch('./manifest.webmanifest')).json());assert.equal(manifest.start_url,'./');assert.equal(manifest.icons.length,3);check('install manifest at repository subpath');await offlineContext.setOffline(true);await offlinePage.reload();await offlinePage.getByRole('button',{name:'Open the store'}).waitFor();assert.ok(await offlinePage.locator('#world').isVisible());check('fully cached offline reload at project subpath');await offlineContext.setOffline(false);swRevision=1;await offlinePage.evaluate(async()=>{const reg=await navigator.serviceWorker.getRegistration();await reg.update()});await offlinePage.waitForFunction(async()=>Boolean((await navigator.serviceWorker.getRegistration()).waiting));await offlinePage.locator('#settings').click();await offlinePage.getByRole('button',{name:'Load the new version'}).waitFor();await Promise.all([offlinePage.waitForEvent('load'),offlinePage.getByRole('button',{name:'Load the new version'}).click()]);await offlinePage.waitForFunction(async()=> (await caches.keys()).some(k=>k.startsWith('tycoon-v1.1.1-')));assert.ok(await offlinePage.locator('#world').isVisible());check('explicit service-worker update activates and reloads');await offlineContext.close();
  console.log(`All ${count} browser checks passed.`);
 }finally{await browser.close();server.close()}
}
run().catch(err=>{console.error(err);server.close();process.exitCode=1});
