// An annular curtain attached to the front inner lip of the oculus. The water
// is generated in motion; there is no scrolling or cross-fading waterfall PNG.
const FRAGMENT=`precision highp float;
varying vec2 uv;uniform float clock;uniform vec2 extent;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);}
void main(){
 float y=uv.y,d=clamp((y-.10)/.90,0.,1.);
 float radius=.49-.275*pow(d,.72);
 float wobble=.003*sin(y*14.-clock*.7)*d;
 float x=(uv.x-.5-wobble)/radius,ax=abs(x);
 float surface=1.-smoothstep(.965,1.,ax);
 // Front ellipse: the water begins at the inner lip, leaving the sky aperture open.
 float lip=.05+.045*sqrt(max(0.,1.-pow((uv.x-.5)/.49,2.)));
 surface*=smoothstep(lip-.006,lip+.006,y);
 // Gravity accelerates the advected strands as they descend; no horizontal bands.
 float fall=sqrt(y+.035)*3.2-clock*1.35;
 float column=noise(vec2(x*27.,fall*5.));
 float fine=noise(vec2(x*91.+column*1.8,fall*13.));
 float silk=noise(vec2(x*13.,fall*2.5));
 float threads=smoothstep(.34,.73,column)*(.48+.52*fine);
 float edges=pow(clamp(ax,0.,1.),4.);
 float opacity=(.34+.12*silk+.22*edges+.43*threads)*surface;
 float start=smoothstep(extent.x-.025,extent.x+.015,y);
 float end=1.-smoothstep(extent.y-.015,extent.y+.025,y);
 opacity*=start*end;
 vec3 shade=mix(vec3(.73,.83,.85),vec3(.98,1.,1.),.36+.44*threads+.15*edges);
 // The bottom breaks into a small local spray; it does not acquire a glowing halo.
 float spray=smoothstep(.91,1.,y)*noise(vec2(x*43.,fall*21.))*.10;
 opacity=clamp(opacity+spray*surface*start*end,0.,.94);
 gl_FragColor=vec4(shade*opacity,opacity);
}`;
export class WaterMaterial{
 constructor(){
  this.canvas=document.createElement('canvas');this.canvas.width=320;this.canvas.height=640;this.frame=null;
  this.gl=this.canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,preserveDrawingBuffer:true});
  if(this.gl){try{this.setup()}catch{this.gl=null}}
  if(!this.gl)this.ctx=this.canvas.getContext('2d');
  // A canvas cannot change context type after a failed WebGL setup.
  if(!this.gl&&!this.ctx){this.canvas=document.createElement('canvas');this.canvas.width=320;this.canvas.height=640;this.ctx=this.canvas.getContext('2d')}
 }
 setup(){
  const gl=this.gl,shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};
  this.program=gl.createProgram();gl.attachShader(this.program,shader(gl.VERTEX_SHADER,'attribute vec2 a;varying vec2 uv;void main(){uv=vec2((a.x+1.)*.5,(1.-a.y)*.5);gl_Position=vec4(a,0.,1.);}'));
  gl.attachShader(this.program,shader(gl.FRAGMENT_SHADER,FRAGMENT));gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.program));gl.useProgram(this.program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const a=gl.getAttribLocation(this.program,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
  this.clock=gl.getUniformLocation(this.program,'clock');this.extent=gl.getUniformLocation(this.program,'extent');gl.disable(gl.BLEND);
 }
 render(time,extent={top:0,bottom:1}){
  const key=`${Math.floor(time*60)}:${extent.top}:${extent.bottom}`;if(this.frame===key)return this.canvas;this.frame=key;
  if(this.gl){const gl=this.gl;gl.useProgram(this.program);gl.viewport(0,0,320,640);gl.uniform1f(this.clock,time%100);gl.uniform2f(this.extent,extent.top,extent.bottom);gl.drawArrays(gl.TRIANGLES,0,6)}
  else this.drawFallback(time,extent);
  return this.canvas;
 }
 drawFallback(time,extent){
  const c=this.ctx,w=320,h=640;c.clearRect(0,0,w,h);c.save();
  c.beginPath();for(let i=0;i<=60;i++){const y=i/60,d=Math.max(0,(y-.1)/.9),r=.49-.275*Math.pow(d,.72);i?c.lineTo((.5-r)*w,y*h):c.moveTo((.5-r)*w,y*h)}for(let i=60;i>=0;i--){const y=i/60,d=Math.max(0,(y-.1)/.9),r=.49-.275*Math.pow(d,.72);c.lineTo((.5+r)*w,y*h)}c.closePath();c.clip();
  c.beginPath();c.rect(0,extent.top*h,w,(extent.bottom-extent.top)*h);c.clip();
  const fill=c.createLinearGradient(0,0,w,0);fill.addColorStop(0,'#cdeaf3c0');fill.addColorStop(.5,'#cde8ed80');fill.addColorStop(1,'#edfaffc0');c.fillStyle=fill;c.fillRect(0,64,w,h);
  for(let i=0;i<72;i++){const lane=(i+.5)/72,phase=(time*(.48+(i%7)*.025)+i*.618)%1;c.strokeStyle=`rgba(238,253,255,${.18+(i%5)*.04})`;c.lineWidth=.7+i%3*.3;c.beginPath();for(let j=0;j<=12;j++){const y=phase+j*.014,d=Math.max(0,(y-.1)/.9),r=.49-.275*Math.pow(d,.72),x=(.5+(lane-.5)*2*r)*w;j?c.lineTo(x,y*h):c.moveTo(x,y*h)}c.stroke()}
  c.restore();
 }
}
