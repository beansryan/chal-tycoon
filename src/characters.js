// Procedural character rig: feet, legs, torso, arms and head are independent
// layers. Animation comes from poses, not translating a static character PNG.
export class CharacterAnimator {
 constructor(renderer){this.r=renderer}
 limb(ctx,x,y,angle,length,width,color,shoe=false){ctx.save();ctx.translate(x,y);ctx.rotate(angle);this.r.box(ctx,-width/2,0,width,length,color,width*.45);if(shoe){this.r.box(ctx,-width/2-2,length-4,width+6,8,'#f5efe0',3);this.r.line(ctx,-width/2-2,length+3,width/2+4,length+3,'#b8b4a3',1.5)}ctx.restore()}
 draw(ctx,c,time,staff=false,action=null){const r=this.r,T=r.tile,x=(c.x+.5)*T,y=(c.y+.7)*T;const reduced=r.engine.s.settings.reducedMotion;const moving=!reduced&&['walk','toQueue','leave'].includes(c.state)&&c.path?.length>0;const phase=moving?time*10+c.id*.41:0;const stride=Math.sin(phase);const idle=reduced?0:Math.sin(time*1.7+c.id)*.6;const next=c.path?.[0];const dx=next?next.x-c.x:0,dy=next?next.y-c.y:0;const back=dy<-.05&&Math.abs(dy)>Math.abs(dx),side=Math.abs(dx)>Math.abs(dy);const direction=side?(dx<0?-1:1):0;const skin=['#e5b68a','#ca926e','#b27c58','#f0c6a1'][c.skin||0];const hair=['#473d37','#645040','#34494c'][c.hair||0];const shirts=['#bf775f','#6d97a4','#7b8b99','#9386a5','#b58974','#7b9a76'];const shirt=staff?'#628675':shirts[c.kind||0];const browsing=c.state==='browse';const pose=!reduced&&browsing?Math.sin(time*2.2)*.13:0;const scan=staff&&action&&!reduced?Math.sin(action.progress*Math.PI)*.8:0;
 r.shadow(ctx,x,y+4,17,5);ctx.save();ctx.translate(x,y+(moving?Math.abs(stride)*-1.9:idle));
 this.limb(ctx,-8,-34,moving?stride*.38:0,33,11,'#53677a',true);this.limb(ctx,8,-34,moving?-stride*.38:0,33,11,'#475d70',true);
 const grad=ctx.createLinearGradient(-15,-67,18,-31);grad.addColorStop(0,shirt);grad.addColorStop(1,staff?'#4b7062':shirt);r.box(ctx,-18,-65,36,35,grad,10);r.box(ctx,-17,-36,34,6,'#4d5d67',3);r.box(ctx,-3,-36,6,5,'#d7c399',1);r.box(ctx,-6,-72,12,12,skin,5);
 const armLeft=moving?-stride*.32:staff?-.08:pose;const armRight=moving?stride*.32:staff?-scan-.08:browsing?-.65+pose:0;
 for(const [sx,angle]of [[-19,armLeft],[19,armRight]]){ctx.save();ctx.translate(sx,-61);ctx.rotate(angle);r.box(ctx,-5,0,10,13,shirt,4);r.box(ctx,-4,9,8,23,skin,4);r.ellipse(ctx,0,31,4.5,5,skin);ctx.restore()}
 r.ellipse(ctx,-17,-85,4,6,skin);r.ellipse(ctx,17,-85,4,6,skin);const face=ctx.createRadialGradient(-6,-90,3,0,-81,24);face.addColorStop(0,skin);face.addColorStop(1,skin);r.ellipse(ctx,0,-86,18,22,face);
 // Soft asymmetric hair silhouette avoids the identical round-head look.
 r.ellipse(ctx,-2,-104,18,11,hair);r.ellipse(ctx,-14,-96,7,11,hair);r.ellipse(ctx,11,-102,10,8,hair);r.ellipse(ctx,-7,-108,9,5,hair);
 if(back){r.ellipse(ctx,0,-88,18,20,hair);r.ellipse(ctx,2,-108,16,7,hair)}else{
 const offset=direction*5;for(const ex of [-7,7]){if(side&&ex*direction<0)continue;r.ellipse(ctx,ex+offset,-87,2,3,'#364549');r.ellipse(ctx,ex+offset-.6,-88,.6,.8,'#fff6e0')}r.line(ctx,-2+offset,-75,5+offset,-75,'#aa7162',1.5);r.ellipse(ctx,offset+1,-81,2,2,'#bc8d70');r.ellipse(ctx,-11,-80,4,2,'#d38d742c');r.ellipse(ctx,11,-80,4,2,'#d38d742c');
 if(c.kind===4&&!staff){r.box(ctx,-12+offset,-92,10,11,'#d6e0d933',3,'#526371');r.box(ctx,3+offset,-92,10,11,'#d6e0d933',3,'#526371');r.line(ctx,-2+offset,-86,3+offset,-86,'#526371',1.5)}}
 if(!back&&r.art?.ready){const key=staff||c.kind===5?'staffHead':'shopperHead';ctx.save();if(side&&direction<0){ctx.scale(-1,1)}ctx.filter=['brightness(.98)','brightness(.9)','brightness(.78)','brightness(1.04)'][c.skin||0];r.art.draw(ctx,key,-21,-112,42,42);ctx.restore()}
 if(staff){r.box(ctx,7,-58,7,6,'#f6e5bc',1);r.line(ctx,-4,-62,0,-53,'#d6ded0',2);r.line(ctx,4,-62,0,-53,'#d6ded0',2)}else if(c.kind===1||c.kind===5){r.line(ctx,-15,-65,-21,-35,'#dcbb83',3);r.box(ctx,-29,-44,17,21,'#e9d8b4',4)}else if(c.kind===2){r.box(ctx,-27,-34,18,22,'#5d7779',4);r.line(ctx,-25,-36,-13,-36,'#5d7779',3)}else if(c.kind===3){r.line(ctx,-13,-98,-18,-86,'#455971',4);r.line(ctx,13,-98,18,-86,'#455971',4);r.box(ctx,-21,-88,7,12,'#52687b',3);r.box(ctx,14,-88,7,12,'#52687b',3)}
 ctx.restore();if(c.bubble){const text=c.bubble==='!'?'Ready to pay':c.bubble;const width=Math.min(180,text.length*7+22);r.box(ctx,x-width/2,y-142,width,27,'#fff9e8',8,'#d4c5ad');r.text(ctx,text,x,y-124,13,'#465959','center',600)}
 }
}
