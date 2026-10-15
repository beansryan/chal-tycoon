import test from 'node:test';
import assert from 'node:assert/strict';
import {Renderer} from '../src/renderer.js';
import {Engine} from '../src/engine.js';
import {GRAPHICS,FloorProjection,transitState,waterfallState} from '../src/graphics.js';
test('tile drawing and pointer inverse agree across pan, zoom and expansion',()=>{const r=Object.create(Renderer.prototype);Object.assign(r,{tile:40,depth:.72,w:390,h:844,viewCenterY:472,engine:new Engine()});r.layout();for(const scale of [.8,1.1,2])for(const pan of [0,80,320]){r.scale=scale;r.camera={x:pan,y:256};for(const [x,y] of [[2,3],[7,8],[11,10.9],[-8,14.65],[23,14.65]]){const p=r.screenPoint(x,y),q=r.worldPoint(p.x,p.y);assert.ok(Math.abs(q.x/r.tile-x)<1e-8&&Math.abs(q.y/r.tile-y)<1e-8)}}});
test('both cashier footprints and waiting customers sit inside the shop threshold',()=>{const e=new Engine();e.s.secondCheckout=true;for(const lane of e.checkouts.lanes){assert.ok(lane.y+.9<13&&lane.y>3);for(const slot of e.checkouts.slots(lane))assert.ok(slot.y+.85<13)}assert.ok(e.corridor.y+.85>13)});
test('people and furniture share a bounded depth scale and expansion preserves tile width',()=>{const a=new FloorProjection(15),b=new FloorProjection(21);for(const y of [3,5,8,10.9,14.8]){const delta=p=>p.point(5,y).x-p.point(4,y).x;assert.ok(Math.abs(delta(a)-delta(b))<1e-8);assert.ok(a.scaleAt(y)>=.9&&a.scaleAt(y)<=1.12)}assert.ok(GRAPHICS.personHeight<50)});
test('train wheels stay on their guideway and the near service uses the larger depth scale',()=>{const p=new FloorProjection(15),near=transitState(70,p.scene)[0],far=transitState(12,p.scene)[0];assert.equal(near.id,'near');assert.equal(far.id,'far');assert.ok(near.height>far.height);assert.equal(far.y,p.scene.y+p.scene.height*GRAPHICS.rails[0].y)});
test('water supply eases in and drains from top to bottom before fully stopping',()=>{assert.equal(waterfallState(0).flow,0);assert.equal(waterfallState(30).flow,1);assert.equal(waterfallState(85).flow,0);assert.ok(waterfallState(66).top>0);assert.equal(waterfallState(68).top,1);assert.equal(waterfallState(30,true).flow,.8)});

test('front beam and posts enclose the playable threshold at every expansion',()=>{for(const width of [15,21]){const p=new FloorProjection(width),s=p.scene,a=GRAPHICS.sign,left=s.x+s.width*(a.left+a.postWidth),right=s.x+s.width*(a.right-a.postWidth),floorLeft=p.point(2,13).x,floorRight=p.point(width-2,13).x;assert.ok(floorLeft>=left&&floorLeft-left<s.width*.005);assert.ok(floorRight<=right&&right-floorRight<s.width*.005);assert.ok(Math.abs(s.y+s.height*a.postBottom-p.point(2,13).y)<s.height*.002);assert.ok(Math.abs((a.left+a.right)/2-.5)<1e-8)}});

// Assert the actual projected image contains the screen, rather than checking camera constants.
test('camera cannot expose outside artwork through pan, zoom easing or viewport changes',()=>{
 const r=Object.create(Renderer.prototype);Object.assign(r,{tile:40,depth:.72,engine:new Engine(),camera:{x:300,y:230,zoom:1},canvas:{getBoundingClientRect:()=>({width:r.testW,height:r.testH})}});
 globalThis.devicePixelRatio=2;
 try{for(const width of [15,21]){r.engine.s.level=width===15?1:4;for(const [w,h] of [[320,568],[390,844],[820,1180],[1366,900],[844,390],[2560,600]]){r.testW=w;r.testH=h;r.scale=.1;r.resize();for(const zoom of [-20,20,-20]){r.zoom(zoom);for(const blend of [0,.25,.75,1]){r.scale=r.coverScale+(r.targetScale-r.coverScale)*blend;for(const x of [-1e6,1e6])for(const y of [-1e6,1e6]){Object.assign(r.camera,{x,y});r.clamp();const left=r.w/2+(r.scene.x-r.camera.x)*r.scale,top=r.viewCenterY+(r.scene.y-r.camera.y*r.depth)*r.scale;assert.ok(left<=-.99&&top<=-.99);assert.ok(left+r.scene.width*r.scale>=w+.99);assert.ok(top+r.scene.height*r.scale>=h+.99)}}}}}
 }finally{delete globalThis.devicePixelRatio}
});
