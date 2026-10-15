// One authored coordinate system for scenery, world objects and pointer picking.
export const GRAPHICS={
 personHeight:48,
 floor:{back:.560,front:.768,backLeft:.335,frontLeft:.285,backWidth:.330,frontWidth:.430},
 water:{center:.500,top:.051,bottom:.386,width:.132},
 sign:{left:481/1536,right:1056/1536,top:393/1024,bottom:449/1024},
 rails:[{id:'far',y:.187,deckBottom:.235,height:.031,speed:31,offset:0},{id:'near',y:.313,deckBottom:.358,height:.039,speed:37,offset:48}],
 // Native art contours in normalized source coordinates. These are occluders,
 // not bounds of the train: a train continues moving while it is hidden.
 foliage:[
  [[0,.10],[.185,.10],[.185,.137],[.202,.142],[.209,.158],[.225,.168],[.222,.186],[.205,.193],[0,.193]],
  [[.79,.08],[1,.08],[1,.193],[.817,.193],[.811,.178],[.777,.176],[.762,.164],[.749,.162],[.766,.150],[.784,.146]],
  [[0,.263],[.057,.263],[.067,.280],[.076,.292],[.079,.316],[0,.316]],
  [[.908,.26],[1,.26],[1,.361],[.919,.361],[.907,.342],[.897,.323],[.905,.303]],
  [[.794,.105],[.807,.105],[.825,.317],[.811,.317]],
  [[.145,.105],[.159,.105],[.176,.317],[.162,.317]],
  // Splash landing is inside the garden and behind the retail parapet.
  [[0,.379],[1,.379],[1,.390],[0,.390]]
 ]
};
export class FloorProjection{
 constructor(width){this.resize(width)}
 resize(width){this.width=width;const sceneWidth=1200*(width-4)/11;this.scene={x:width*20-sceneWidth/2,y:-350,width:sceneWidth,height:800}}
 point(x,y){const f=GRAPHICS.floor,s=this.scene,v=(y-3)/10,u=(x-2)/(this.width-4),left=f.backLeft+(f.frontLeft-f.backLeft)*v,wide=f.backWidth+(f.frontWidth-f.backWidth)*v;return{x:s.x+s.width*(left+wide*u),y:s.y+s.height*(f.back+(f.front-f.back)*v),size:this.scaleAt(y)}}
 inverse(px,py){const f=GRAPHICS.floor,s=this.scene,v=((py-s.y)/s.height-f.back)/(f.front-f.back),left=f.backLeft+(f.frontLeft-f.backLeft)*v,wide=f.backWidth+(f.frontWidth-f.backWidth)*v;return{x:2+((px-s.x)/s.width-left)/wide*(this.width-4),y:3+v*10}}
 scaleAt(y){const f=GRAPHICS.floor,v=(y-3)/10;return Math.max(.9,Math.min(1.12,(f.backWidth+(f.frontWidth-f.backWidth)*v)/.38))}
 footprint(x,y,w=2,h=1){return[[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(([a,b])=>this.point(a,b))}
}
export function waterfallState(time,reduced=false){if(reduced)return{flow:.8,top:0,bottom:1};const phase=((time%100)+100)%100,smooth=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v)};return{flow:smooth(phase/6)*(1-smooth((phase-65)/10)),top:phase>=65?Math.min(1,(phase-65)/2):0,bottom:Math.min(1,phase/2)}}
export function transitState(time,scene,aspect=7.72){return GRAPHICS.rails.flatMap((rail,direction)=>{const phase=(time+rail.offset)%116;if(phase>30)return[];const height=scene.height*rail.height,width=height*aspect,from=scene.x-width-24,to=scene.x+scene.width+24,progress=phase/30;return[{...rail,direction,x:direction?to-(to-from)*progress:from+(to-from)*progress,y:scene.y+scene.height*rail.y,height,width,visible:true}]})}
