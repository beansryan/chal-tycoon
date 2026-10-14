import {PRODUCTS,RESEARCH,capacity} from './config.js';
// Stock that is paid for but not yet on a shelf is reserved separately.
// All displayed quantities use the same reservation logic as the simulation.
export class Operations {
 constructor(engine){this.e=engine}
 has(id){return this.e.s.researched.includes(id)}
 pending(id){return this.e.s.deliveries.filter(d=>d.fixture===id).reduce((sum,d)=>sum+d.quantity,0)}
 room(f){return Math.max(0,capacity(f)-f.stock-this.pending(f.id))}
 quote(id,mode='standard'){
  const f=this.e.s.fixtures.find(a=>a.id===id);if(!f||!['standard','express'].includes(mode))return null;
  const unit=Math.round(PRODUCTS[f.type].cost*(mode==='standard'?.88:1.15));
  const quantity=Math.min(this.room(f),Math.floor(this.e.s.cash/unit));
  const eta=mode==='express'?8:(this.has('routing')?20:35)+(this.e.s.weather==='rain'?15:0);
  return {unit,quantity,cost:unit*quantity,eta,mode};
 }
 order(id,mode='standard',auto=false){
  if(this.e.level<6||this.e.s.deliveries.some(d=>d.fixture===id))return false;
  const q=this.quote(id,mode);if(!q||q.quantity<1||!this.e.spend(q.cost))return false;
  this.e.s.deliveries.push({id:'delivery-'+Math.floor(this.e.s.totalTime*100)+'-'+Math.floor(this.e.random()*1e6),fixture:id,quantity:q.quantity,remaining:q.eta,mode,cost:q.cost});
  this.e.s.stats.supplierOrders++;if(!auto)this.e.emit('message',{text:`${q.quantity} units ordered. ${mode==='standard'?'Supplier discount':'Express van'} · arriving in ${q.eta}s.`});
  this.e.emit('deliveries');this.e.emit('change');return true;
 }
 research(id){const def=RESEARCH.find(a=>a.id===id);if(!def||this.has(id)||this.e.level<def.unlock||this.e.s.researchPoints<def.cost||!this.e.spend(def.cash))return false;this.e.s.researchPoints-=def.cost;this.e.s.researched.push(id);this.e.emit('message',{text:`${def.name} is ready. Put it to work.`});this.e.emit('change');return true}
 policy(value){if(!this.has('reorder')||!['instant','supplier'].includes(value))return false;this.e.s.reorderPolicy=value;this.e.emit('change');return true}
 threshold(value){if(!this.has('reorder')||![1,3,5].includes(value))return false;this.e.s.reorderThreshold=value;this.e.emit('change');return true}
 tick(dt){for(const d of this.e.s.deliveries)d.remaining-=dt;const arrived=this.e.s.deliveries.filter(d=>d.remaining<=0);this.e.s.deliveries=this.e.s.deliveries.filter(d=>d.remaining>0);for(const d of arrived){const f=this.e.s.fixtures.find(a=>a.id===d.fixture);if(f){f.stock+=d.quantity;this.e.s.stats.unitsDelivered+=d.quantity;this.e.emit('arrival',{quantity:d.quantity});this.e.emit('message',{text:`Delivery arrived: +${d.quantity} ${PRODUCTS[f.type].name}.`})}}if(arrived.length){this.e.emit('deliveries');this.e.emit('change')}}
}
