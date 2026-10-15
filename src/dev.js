import {CONFIG,LOCATIONS,PEOPLE,SPECIAL_CUSTOMERS,STAFF,RESEARCH,EVENTS,nextXP,capacity,money} from './config.js';
import {freshState} from './engine.js';
const button=(label,action,value='',cls='')=>`<button class="${cls}" data-dev-action="${action}" data-value="${value}">${label}</button>`;
export class DevTools{
 constructor(engine,renderer,ui,save){
  Object.assign(this,{e:engine,r:renderer,ui,save});
  try{const id=sessionStorage.getItem('tycoon-dev-location');if(LOCATIONS.some(l=>l.id===id))engine.devLocation=id;}catch{}
  ui.onDevMenu=()=>this.show();
  document.addEventListener('click',event=>{const b=event.target.closest('[data-dev-action]');if(b)this.action(b.dataset.devAction,b.dataset.value)});
  document.addEventListener('change',event=>{const field=event.target.closest('[data-dev-setting]');if(field)this.setting(field.dataset.devSetting,field.value)});
  renderer.resize();
 }
 show(){
  const s=this.e.s;
  this.ui.showModal(`<span class="eyebrow">DEVELOPER TOOLS</span><h2>Test your shop.</h2><p class="mininote">Testing controls change this shop’s save. Export a backup before changing progression. Location overrides preserve your layout and unlocks.</p>
   <div class="dev-section"><label class="setting"><span>Location override</span><select aria-label="Developer location" data-dev-setting="location"><option value="">Follow progression</option>${LOCATIONS.map(l=>`<option value="${l.id}" ${this.e.devLocation===l.id?'selected':''}>${l.shortName}</option>`).join('')}</select></label>
   <p class="mininote">Current: ${this.e.location.name} · ${this.e.width} columns · ${money(s.cash)} · level ${this.e.level}</p></div>
   <div class="dev-section"><h3>Progression & inventory</h3><div class="dev-grid">${button('+$1,000','cash',1000)}${button('+$10,000','cash',10000)}${button('Fill stock · test grant','stock','full')}${button('Empty all stock','stock','empty')}${button('Hire full team','team')}${button('Unlock research','research')}</div>
   <label class="setting"><span>Store level</span><select aria-label="Developer level" data-dev-setting="level">${[...new Set([1,2,3,4,6,10,16,24,50,this.e.level])].sort((a,b)=>a-b).map(n=>`<option value="${n}" ${this.e.level===n?'selected':''}>Level ${n}</option>`).join('')}</select></label></div>
   <div class="dev-section"><h3>Customers & conditions</h3><label class="setting"><span>Spawn shopper</span><select aria-label="Spawn customer type" data-dev-setting="customer"><option value="">Choose a visitor…</option>${PEOPLE.map((p,i)=>`<option value="${i}">${p.name}</option>`).join('')}${SPECIAL_CUSTOMERS.map(v=>`<option value="vip:${v.id}">${v.name}</option>`).join('')}</select></label>
   <div class="dev-grid">${button('Clear shoppers','clear')}${button(s.paused?'Resume simulation':'Pause simulation','pause')}</div>
   <label class="setting"><span>Weather</span><select aria-label="Developer weather" data-dev-setting="weather">${['sunny','rain'].map(w=>`<option value="${w}" ${s.weather===w?'selected':''}>${w==='rain'?'Heavy rain':'Sunny'}</option>`).join('')}</select></label>
   <label class="setting"><span>Trading event</span><select aria-label="Developer event" data-dev-setting="event">${EVENTS.map((e,i)=>`<option value="${i}" ${s.event===i?'selected':''}>${e.name}</option>`).join('')}</select></label></div>
   <div class="dev-section"><h3>Time & animation</h3><label class="setting"><span>Simulation speed</span><select aria-label="Developer speed" data-dev-setting="speed">${[1,2,3].map(n=>`<option value="${n}" ${this.ui.speed===n?'selected':''}>${n}×</option>`).join('')}</select></label>
   <div class="dev-grid">${button('Advance 60 seconds','advance',60)}${button('Advance one trading day','advance',CONFIG.dayLength)}${button('Waterfall running','environment',30)}${button('Waterfall stopped','environment',85)}${button('Far train · left','environment',8)}${button('Near train · right','environment',90)}</div><p class="mininote">Environment presets freeze the scene for inspection. Water and trains appear only at Jewel.</p></div>
   <div class="dev-section"><h3>Save & reset</h3><div class="dev-grid">${button('Export save backup','export')}${button('Clear location override','location-clear')}${button('Full reset…','reset-ask','','danger')}</div></div>
   ${button('Back to the shop','close','','primary full')}`);
 }
 refresh(){this.r.resize();this.ui.selection=null;this.r.selection=null;this.ui.cancelPlace(false);this.ui.render();document.querySelector('#pause').textContent=this.e.s.paused?'▶':'Ⅱ';this.save.save(this.e.s);this.show()}
 setting(key,value){
  const e=this.e;
  if(key==='location'){
   if(value&&!LOCATIONS.some(l=>l.id===value))return;
   e.devLocation=value||null;try{if(value)sessionStorage.setItem('tycoon-dev-location',value);else sessionStorage.removeItem('tycoon-dev-location')}catch{}
   this.r.center();
  }else if(key==='level'){
   const n=Number(value);if(!Number.isInteger(n)||n<1||n>50)return;e.s.xp=n===1?0:nextXP(n-1);
  }else if(key==='weather'&&['sunny','rain'].includes(value))e.s.weather=value;
  else if(key==='event'&&EVENTS[Number(value)])e.s.event=Number(value);
  else if(key==='speed'&&[1,2,3].includes(Number(value))){this.ui.speed=Number(value);document.querySelector('#speed').textContent='▶ '+value+'×'}
  else if(key==='customer'){
   if(value==='')return;
   const vip=value.startsWith('vip:')?SPECIAL_CUSTOMERS.find(v=>v.id===value.slice(4)):null;
   const kind=vip?Math.max(0,PEOPLE.findIndex(p=>p.likes===vip.likes)):Number(value);
   if(!Number.isInteger(kind)||!PEOPLE[kind])return;
   const before=e.s.customers.length;e.addCustomer(kind);const c=e.s.customers.at(-1);
   if(vip&&e.s.customers.length>before){Object.assign(c,{vip:vip.id,customQuote:vip.icon+' '+vip.quote,budget:5000});if(!e.s.discoveredVips.includes(vip.id))e.s.discoveredVips.push(vip.id)}
  }else return;
  this.refresh();
 }
 action(action,value){
  const e=this.e,s=e.s;
  if(action==='close'){document.querySelector('#modal').close();return}
  if(action==='export'){this.save.export(s);return}
  if(action==='reset-ask'){this.ui.showModal(`<span class="eyebrow">FULL GAME RESET</span><h2>Erase all game progress?</h2><p>This removes your cash, levels, shops, fixtures, staff, customer book, research, reports, recovery saves and developer location override. The game returns to Day 1. Downloaded artwork stays available offline.</p><div class="dev-grid">${button('Export save backup','export')}${button('Keep my shop','reset-cancel')}${button('Erase everything & restart','reset-confirm','','danger')}</div>`);return}
  if(action==='reset-cancel'){this.show();return}
  if(action==='reset-confirm'){
   // beforeunload saves engine.s: replace it before navigating so the old game cannot return.
   e.s=freshState();e.devLocation=null;
   try{for(const storage of [localStorage,sessionStorage])for(const key of Object.keys(storage))if(key===CONFIG.saveKey||key.startsWith(CONFIG.saveKey+'-')||key.startsWith('tycoon-dev-'))storage.removeItem(key)}catch{}
   this.save.save(e.s);location.assign('./');return;
  }
  if(action==='cash'&&[1000,10000].includes(Number(value)))s.cash+=Number(value);
  else if(action==='stock'){
   // Cancel and refund outstanding paid deliveries before a developer stock grant.
   for(const d of s.deliveries){s.cash+=d.cost;s.daily.expenses=Math.max(0,s.daily.expenses-d.cost)}s.deliveries=[];
   for(const f of s.fixtures)f.stock=value==='full'?capacity(f,s.researched):0;
  }else if(action==='team'){s.staff=STAFF.map(def=>s.staff.find(a=>a.id===def.id)||{id:def.id,xp:30,training:null});s.secondCheckout=true;}
  else if(action==='research'){s.researched=RESEARCH.map(r=>r.id);s.researchPoints=Math.max(200,s.researchPoints)}
  else if(action==='clear'){s.customers=[];e.request=null;e.checkouts.clocks.clear();this.r.previous.clear();this.r.characters.motion.clear()}
  else if(action==='pause')s.paused=!s.paused;
  else if(action==='environment'){this.r.animationTime=Number(value);s.paused=true;}
  else if(action==='advance'&&[60,CONFIG.dayLength].includes(Number(value))){const was=e.offlineMode;e.offlineMode=true;try{for(let t=0;t<Number(value);t+=.05)e.tick(.05)}finally{e.offlineMode=was}}
  else if(action==='location-clear'){this.setting('location','');return}
  else return;
  this.refresh();
 }
}
