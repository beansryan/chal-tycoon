// One authored coordinate system for scenery, world objects and pointer picking.
const sourcePath=points=>points.map(([x,y])=>[x/1536,y/1024]);
export const GRAPHICS={
 personHeight:48,
 floor:{back:.560,front:.768,backLeft:.335,frontLeft:.285,backWidth:.330,frontWidth:.430},
 water:{center:.500,top:.051,bottom:.386,width:.132},
 sign:{left:416/1536,right:1120/1536,top:393/1024,bottom:449/1024,postWidth:19/1536,postBottom:785/1024,cafeLeft:0,fashionRight:1456/1536},
 rails:[{id:'far',y:.187,deckBottom:.235,height:.031,speed:31,offset:0},{id:'near',y:.313,deckBottom:.358,height:.039,speed:37,offset:48}],
 // Solid foreground masses traced from the source. Interior flowers, stone,
 // shadow and bark are all opaque. Background palms are NOT foreground masks:
 // the open near guideway runs in front of them.
 foliage:[
  sourcePath([[0,0],[292,0],[292,130],[303,138],[299,145],[313,147],[313,155],[326,155],[323,166],[335,173],[330,180],[340,185],[330,194],[318,202],[0,202]]),
  sourcePath([[1188,0],[1536,0],[1536,204],[1193,204],[1198,194],[1207,183],[1204,170],[1201,150],[1196,128],[1192,108]]),
  sourcePath([[0,236],[91,236],[97,253],[98,269],[108,276],[110,287],[120,291],[115,303],[123,310],[120,322],[130,330],[127,344],[140,362],[0,362]]),
  sourcePath([[1536,205],[1418,205],[1398,220],[1402,232],[1387,242],[1377,258],[1388,267],[1382,279],[1394,289],[1389,298],[1404,309],[1400,322],[1410,334],[1403,349],[1411,370],[1536,370]]),
  // The splash landing remains behind the retail parapet.
  sourcePath([[0,388],[1536,388],[1536,400],[0,400]])
 ]
};
export class FloorProjection{
 constructor(width){this.resize(width)}
 resize(width,floor){this.floor=floor?{...GRAPHICS.floor,...floor}:GRAPHICS.floor;this.width=width;const sceneWidth=1200*(width-4)/11;this.scene={x:width*20-sceneWidth/2,y:-350,width:sceneWidth,height:800}}
 point(x,y){const f=this.floor||GRAPHICS.floor,s=this.scene,v=(y-3)/10,u=(x-2)/(this.width-4),left=f.backLeft+(f.frontLeft-f.backLeft)*v,wide=f.backWidth+(f.frontWidth-f.backWidth)*v;return{x:s.x+s.width*(left+wide*u),y:s.y+s.height*(f.back+(f.front-f.back)*v),size:this.scaleAt(y)}}
 inverse(px,py){const f=this.floor||GRAPHICS.floor,s=this.scene,v=((py-s.y)/s.height-f.back)/(f.front-f.back),left=f.backLeft+(f.frontLeft-f.backLeft)*v,wide=f.backWidth+(f.frontWidth-f.backWidth)*v;return{x:2+((px-s.x)/s.width-left)/wide*(this.width-4),y:3+v*10}}
 scaleAt(y){const f=this.floor||GRAPHICS.floor,v=(y-3)/10;return Math.max(.9,Math.min(1.12,(f.backWidth+(f.frontWidth-f.backWidth)*v)/.38))}
 footprint(x,y,w=2,h=1){return[[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(([a,b])=>this.point(a,b))}
}
export function waterfallState(time,reduced=false){if(reduced)return{flow:.8,top:0,bottom:1};const phase=((time%100)+100)%100,smooth=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v)};return{flow:smooth(phase/6)*(1-smooth((phase-65)/10)),top:phase>=65?Math.min(1,(phase-65)/2):0,bottom:Math.min(1,phase/2)}}
export function transitState(time,scene,aspect=7.72){return GRAPHICS.rails.flatMap((rail,direction)=>{const phase=(time+rail.offset)%116;if(phase>30)return[];const height=scene.height*rail.height,width=height*aspect,from=scene.x-width-24,to=scene.x+scene.width+24,progress=phase/30;return[{...rail,direction,x:direction?to-(to-from)*progress:from+(to-from)*progress,y:scene.y+scene.height*rail.y,height,width,visible:true}]})}
