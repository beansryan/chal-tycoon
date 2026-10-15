import test from 'node:test';
import assert from 'node:assert/strict';
import {spritePose,facing} from '../src/characters.js';
test('reference atlas chooses front, side and back cycles without geometric substitutes',()=>{const c={x:4,y:5,state:'walk',path:[{x:8,y:5}]};assert.equal(facing(c),'right');assert.deepEqual(spritePose(c,0,{moving:true,direction:'right'}),{group:'walk',index:0,flip:false});assert.equal(spritePose(c,18,{moving:true,direction:'left'}).flip,true);assert.equal(spritePose(c,12,{moving:true,direction:'front'}).index,9);assert.equal(spritePose(c,6,{moving:true,direction:'right',staff:true}).index,17);assert.equal(spritePose(c,0,{moving:true,direction:'back',staff:true}).index,24)});
test('reduced motion and idle use reference standing poses, not walking frames',()=>{const c={state:'browse'};assert.equal(facing(c),'back');for(const d of [0,6,12,18,24,30,36])assert.deepEqual(spritePose(c,d,{moving:true,reduced:true,direction:'front'}),{group:'characters',index:8,flip:false});assert.equal(spritePose(c,30,{staff:true,direction:'front'}).index,0)});
test('customer rear cycle excludes the frames that switch the tote to the wrong shoulder',()=>{for(let d=0;d<100;d+=.5){const p=spritePose({},d,{moving:true,direction:'back'});assert.notEqual(p.index,11);assert.notEqual(p.index,15)}});

test('customer side cycles keep the tote visible in every pose',()=>{for(let d=0;d<150;d+=.5){const p=spritePose({},d,{moving:true,direction:'right'});assert.ok([0,2,4,6].includes(p.index));assert.equal(spritePose({},d,{direction:'right'}).group,'walk')}});
test('staff and customer banks remain separate for every direction and phase',()=>{for(const direction of ['front','back','left','right'])for(const moving of [true,false])for(let d=0;d<100;d+=3){const customer=spritePose({},d,{direction,moving}),staff=spritePose({},d,{direction,moving,staff:true});assert.ok(customer.group==='walk'?customer.index<16:customer.index>=8);assert.ok(staff.group==='walk'?staff.index>=16:staff.index<8)}});

test('renderer never assigns staff artwork to any customer archetype',async()=>{
 const {CharacterAnimator}=await import('../src/characters.js');
 const frame={rect:[0,0,120,240],pivotX:60,pivotY:240,referenceHeight:240};
 const r={tile:40,paused:false,engine:{s:{settings:{reducedMotion:false},customers:[]}},ground:()=>({x:0,y:0,size:1}),shadow(){},art:{frames:{characters:Array(16).fill(frame),walk:Array(32).fill(frame)},images:{characters:{},walk:{}},variant:()=>({})}};
 const ctx={save(){},restore(){},translate(){},scale(){},drawImage(){}};
 const animator=new CharacterAnimator(r);
 for(let kind=0;kind<6;kind++)for(const [x,y] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const c={id:kind*10+x*2+y,kind,x:0,y:0,state:'walk',path:[{x,y}]};
  animator.draw(ctx,c,0);
  const pose=animator.motion.get(c.id).pose;
  assert.ok(pose.group==='walk'?pose.index<16:pose.index>=8,`customer kind ${kind} selected ${pose.group}/${pose.index}`);
 }
 const c={id:999,kind:3,x:0,y:0,state:'walk',path:[{x:3,y:0}]};
 animator.draw(ctx,c,0);animator.draw(ctx,c,9);
 assert.equal(animator.motion.get(c.id).distance,0,'stationary actors must not walk in place');
 c.x=.4;c.path=[{x:.4,y:2}];animator.draw(ctx,c,10);
 assert.equal(animator.motion.get(c.id).direction,'right','finish the interpolated movement before turning toward the next waypoint');
});
