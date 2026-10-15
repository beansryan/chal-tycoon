import {GRAPHICS,transitState,waterfallState} from './graphics.js';
import {WaterMaterial} from './water.js';
export class SceneCompositor{
 constructor(renderer){this.r=renderer;this.waterMaterial=new WaterMaterial();this.layers=null;this.layerSource=null}
 path(ctx,points,w,h){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x*w,y*h):ctx.moveTo(x*w,y*h));ctx.closePath()}
 buildLayers(image){if(this.layerSource===image)return;const layers={};const create=(name,polygons)=>{const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const ctx=c.getContext('2d');for(const polygon of polygons){ctx.save();this.path(ctx,polygon,c.width,c.height);ctx.clip();ctx.drawImage(image,0,0);ctx.restore()}layers[name]=c};
 create('farRail',[[[0,.187],[1,.187],[1,.235],[0,.235]]]);create('nearRail',[[[0,.313],[1,.313],[1,.358],[0,.358]]]);this.foliageLayer(image,layers);const rim=document.createElement('canvas');rim.width=image.width;rim.height=image.height;const rc=rim.getContext('2d');rc.beginPath();rc.rect(.418*image.width,.032*image.height,.164*image.width,.066*image.height);rc.ellipse(.5*image.width,.068*image.height,.0645*image.width,.017*image.height,0,0,Math.PI*2);rc.clip('evenodd');rc.drawImage(image,0,0);layers.rim=rim;this.layers=layers;this.layerSource=image}
 // Copy whole foreground silhouettes. Classifying individual colours punched
 // holes through solid stone, flowers and shadows, exposing stray train windows.
 foliageLayer(image,layers){
  const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
  const ctx=canvas.getContext('2d');
  for(const polygon of GRAPHICS.foliage){ctx.save();this.path(ctx,polygon,canvas.width,canvas.height);ctx.clip();ctx.drawImage(image,0,0);ctx.restore()}
  layers.foliage=canvas;
 }
 drawLayer(ctx,name){const s=this.r.scene;ctx.drawImage(this.layers[name],s.x,s.y,s.width,s.height)}
 render(ctx,time){const r=this.r,s=r.scene,art=r.art,image=art.images.environment;if(!image.complete||!image.naturalWidth)return;r.box(ctx,r.worldBounds.left,-500,r.worldBounds.right-r.worldBounds.left,1100,'#bcc9c2');ctx.drawImage(image,s.x,s.y,s.width,s.height);this.buildLayers(image);
 this.water(ctx,time);const positions=r.engine.s.settings.reducedMotion?[]:transitState(time,s,(art.crops.train?.[0]?art.crops.train[0][2]/art.crops.train[0][3]:7.72));r.trainPositions=positions;for(const direction of [0,1]){for(const train of positions.filter(t=>t.direction===direction))this.train(ctx,train);this.drawLayer(ctx,direction?'nearRail':'farRail')}
 this.drawLayer(ctx,'foliage');this.drawLayer(ctx,'rim');this.signs(ctx)}
 water(ctx,time){const r=this.r,s=r.scene,w=GRAPHICS.water,state=waterfallState(time,r.engine.s.settings.reducedMotion);r.waterFlow=state.flow;if(state.flow<=0)return;const material=this.waterMaterial.render(r.engine.s.settings.reducedMotion?0:time,state);const left=s.x+s.width*(w.center-w.width/2),top=s.y+s.height*w.top,width=s.width*w.width,height=s.height*(w.bottom-w.top);ctx.save();ctx.globalAlpha=state.flow;ctx.drawImage(material,left,top,width,height);ctx.restore()}
 train(ctx,train){const r=this.r,s=r.scene,rect=r.art.crops.train?.[0],image=r.art.images.train;if(!rect||!image.complete)return;ctx.save();ctx.beginPath();ctx.rect(s.x,s.y,s.width,s.height*.39);ctx.clip();const y=train.y-train.height+1.5;if(train.direction){ctx.translate(train.x+train.width,0);ctx.scale(-1,1);ctx.drawImage(image,...rect,0,y,train.width,train.height)}else ctx.drawImage(image,...rect,train.x,y,train.width,train.height);ctx.restore()}
 signs(ctx){
  const r=this.r,s=r.scene,logo=r.art.images.logo,image=r.art.images.environment,a=GRAPHICS.sign;
  const x=s.x+s.width*a.left,y=s.y+s.height*a.top,w=s.width*(a.right-a.left),h=s.height*(a.bottom-a.top),postW=s.width*a.postWidth,postBottom=s.y+s.height*a.postBottom;
  ctx.save();
  // Rebuild the entire shared beam. The old painted tenant dividers were 65px
  // inside the actual front columns, so moving only the central sign left gaps.
  const panel=(sx,sw,left,right)=>ctx.drawImage(image,sx,393,sw,56,s.x+s.width*left,y,s.width*(right-left),h);
  panel(0,481,a.cafeLeft,a.left);panel(1056,400,a.right,a.fashionRight);
  // Two matching front posts physically carry the beam down to the threshold.
  // Existing sloping poster/glass partitions remain behind this front frame.
  for(const [px,side] of [[x,1],[x+w-postW,-1]]){
   const metal=ctx.createLinearGradient(px,0,px+postW,0);metal.addColorStop(0,'#344650');metal.addColorStop(.28,'#71828a');metal.addColorStop(.7,'#4b5e67');metal.addColorStop(1,'#243e49');ctx.fillStyle=metal;ctx.fillRect(px,y+h,postW,postBottom-y-h);
   const inner=side===1?px+postW-1:px+1;r.line(ctx,inner,y+h,inner,postBottom,'#41bfe4',1.5);
   r.line(ctx,px,postBottom,px+postW,postBottom,'#253a43',2);
  }
  const metal=ctx.createLinearGradient(0,y,0,y+h);metal.addColorStop(0,'#25313a');metal.addColorStop(.45,'#17252f');metal.addColorStop(1,'#263842');ctx.fillStyle=metal;ctx.fillRect(x,y,w,h);
  ctx.lineWidth=.7;for(let rib=x+3;rib<x+w;rib+=3){ctx.strokeStyle='#0e18246b';ctx.beginPath();ctx.moveTo(rib,y+2);ctx.lineTo(rib,y+h-4);ctx.stroke();ctx.strokeStyle='#6e7e852c';ctx.beginPath();ctx.moveTo(rib+.8,y+2);ctx.lineTo(rib+.8,y+h-4);ctx.stroke()}
  r.line(ctx,x,y,x+w,y,'#8e9698',1.5);r.line(ctx,x,y+h-2,x+w,y+h-2,'#42ccf2',1.6);r.line(ctx,x,y+h,x+w,y+h,'#182d38',2);
  r.line(ctx,x,y,x,y+h,'#707f84',1.5);r.line(ctx,x+w,y,x+w,y+h,'#707f84',1.5);
  if(logo.complete&&logo.naturalWidth){const height=h*.79,width=height*logo.naturalWidth/logo.naturalHeight;ctx.shadowColor='#9adff3';ctx.shadowBlur=2.5;ctx.drawImage(logo,x+(w-width)/2,y+(h-height)/2-1,width,height)}
  ctx.restore();
  r.text(ctx,'KOPI & TOAST',s.x+s.width*(a.cafeLeft+a.left)/2,y+h*.60,14,'#f6e9d1','center',800);
  r.text(ctx,'THE EDIT',s.x+s.width*(a.right+a.fashionRight)/2,y+h*.60,16,'#70644e','center',700);
 }
}
