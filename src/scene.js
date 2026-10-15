import { GRAPHICS, transitState, waterfallState } from './graphics.js';
import { WaterMaterial } from './water.js';
import { COSMETICS, LOCATIONS } from './config.js';
import {STORE_DESIGNS} from './store-designs.js';

export class SceneCompositor {
  constructor(renderer) {
    this.r = renderer;
    this.waterMaterial = new WaterMaterial();
    this.layers = null;
    this.layerSource = null;
  }

  path(ctx, points, w, h) {
    ctx.beginPath();
    points.forEach(([x, y], i) => i ? ctx.lineTo(x * w, y * h) : ctx.moveTo(x * w, y * h));
    ctx.closePath();
  }

  buildLayers(image) {
    if (this.layerSource === image) return;
    const layers = {};
    const create = (name, polygons) => {
      const c = document.createElement('canvas');
      c.width = image.width;
      c.height = image.height;
      const ctx = c.getContext('2d');
      for (const polygon of polygons) {
        ctx.save();
        this.path(ctx, polygon, c.width, c.height);
        ctx.clip();
        ctx.drawImage(image, 0, 0);
        ctx.restore();
      }
      layers[name] = c;
    };
    create('farRail', [[[0, 0.187], [1, 0.187], [1, 0.235], [0, 0.235]]]);
    create('nearRail', [[[0, 0.313], [1, 0.313], [1, 0.358], [0, 0.358]]]);
    this.foliageLayer(image, layers);
    const rim = document.createElement('canvas');
    rim.width = image.width;
    rim.height = image.height;
    const rc = rim.getContext('2d');
    rc.beginPath();
    rc.rect(0.418 * image.width, 0.032 * image.height, 0.164 * image.width, 0.066 * image.height);
    rc.ellipse(0.5 * image.width, 0.068 * image.height, 0.0645 * image.width, 0.017 * image.height, 0, 0, Math.PI * 2);
    rc.clip('evenodd');
    rc.drawImage(image, 0, 0);
    layers.rim = rim;
    this.layers = layers;
    this.layerSource = image;
  }

  foliageLayer(image, layers) {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    for (const polygon of GRAPHICS.foliage) {
      ctx.save();
      this.path(ctx, polygon, canvas.width, canvas.height);
      ctx.clip();
      ctx.drawImage(image, 0, 0);
      ctx.restore();
    }
    layers.foliage = canvas;
  }

  drawLayer(ctx, name) {
    const s = this.r.scene;
    ctx.drawImage(this.layers[name], s.x, s.y, s.width, s.height);
  }

  render(ctx, time) {
    const r = this.r, s = r.scene, art = r.art, image = art.images['location_'+r.engine.location.id] || art.images.environment;
    r.environmentImage=image;
    if (!image.complete || !image.naturalWidth) return;
    r.box(ctx, r.worldBounds.left, -500, r.worldBounds.right - r.worldBounds.left, 1100, '#bcc9c2');
    ctx.drawImage(image, s.x, s.y, s.width, s.height);
    if(r.engine.location.id==='jewel'){
      // Preserve the authored waterfall and transit occlusion pixels above the store.
      const interior=art.images.store_jewel;if(interior?.complete&&interior.naturalWidth){ctx.save();ctx.beginPath();ctx.rect(s.x+s.width*416/1536,s.y+s.height*393/1024,s.width*704/1536,s.height*392/1024);ctx.clip();ctx.drawImage(interior,s.x,s.y,s.width,s.height);ctx.restore();}
      this.buildLayers(image);
    }

    this.floorFinish(ctx);
    if(r.engine.location.id==='jewel'){
    this.water(ctx, time);
    const positions = r.engine.s.settings.reducedMotion
      ? []
      : transitState(time, s, (art.crops.train?.[0] ? art.crops.train[0][2] / art.crops.train[0][3] : 7.72));
    r.trainPositions = positions;
    for (const direction of [0, 1]) {
      for (const train of positions.filter(t => t.direction === direction)) this.train(ctx, train);
      this.drawLayer(ctx, direction ? 'nearRail' : 'farRail');
    }
    this.drawLayer(ctx, 'foliage');
    this.drawLayer(ctx, 'rim');
    }else{r.waterFlow=0;r.trainPositions=[];}
    this.ambientLights(ctx,time);
    this.signs(ctx);
  }

  ambientLights(ctx,time){
    if(this.r.engine.s.settings.reducedMotion)return;
    const r=this.r,s=r.scene;ctx.save();
    ctx.globalAlpha=.025+.015*Math.sin(time*.7);
    const glow=ctx.createLinearGradient(0,s.y+s.height*.44,0,s.y+s.height*.68);glow.addColorStop(0,'#fff4bd');glow.addColorStop(1,'#fff4bd00');ctx.fillStyle=glow;
    ctx.fillRect(s.x+s.width*.34,s.y+s.height*.44,s.width*.32,s.height*.24);ctx.restore();
  }

  floorFinish(ctx) {
    const r = this.r, cosId = r.engine.s.floorCosmetic || 'floor_default';
    const cos = COSMETICS.find(c => c.id === cosId);
    if (!cos || !cos.tint) return;
    const w = r.engine.width - 4;
    r.polygon(ctx, 2, 3, w, 10, cos.tint, cos.stroke);
    if (cos.stroke) {
      ctx.save();
      ctx.lineWidth = 0.8;
      for (let y = 4; y <= 12; y += 2) {
        const a = r.ground(2, y), b = r.ground(r.engine.width - 2, y);
        r.line(ctx, a.x, a.y, b.x, b.y, cos.stroke, 0.8);
      }
      ctx.restore();
    }
  }

  water(ctx, time) {
    const r = this.r, s = r.scene, w = GRAPHICS.water, state = waterfallState(time, r.engine.s.settings.reducedMotion);
    r.waterFlow = state.flow;
    if (state.flow <= 0) return;
    const material = this.waterMaterial.render(r.engine.s.settings.reducedMotion ? 0 : time, state);
    const left = s.x + s.width * (w.center - w.width / 2), top = s.y + s.height * w.top;
    const width = s.width * w.width, height = s.height * (w.bottom - w.top);
    ctx.save();
    ctx.globalAlpha = state.flow;
    ctx.drawImage(material, left, top, width, height);
    ctx.restore();
  }

  train(ctx, train) {
    const r = this.r, s = r.scene, rect = r.art.crops.train?.[0], image = r.art.images.train;
    if (!rect || !image.complete) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(s.x, s.y, s.width, s.height * 0.39);
    ctx.clip();
    const y = train.y - train.height + 1.5;
    if (train.direction) {
      ctx.translate(train.x + train.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(image, ...rect, 0, y, train.width, train.height);
    } else {
      ctx.drawImage(image, ...rect, train.x, y, train.width, train.height);
    }
    ctx.restore();
  }

  signs(ctx) {
    const r = this.r, s = r.scene, logo = r.art.images.logo, image = r.environmentImage || r.art.images.environment, a = GRAPHICS.sign;
    const x = s.x + s.width * a.left, y = s.y + s.height * a.top, w = s.width * (a.right - a.left), h = s.height * (a.bottom - a.top);
    const postW = s.width * a.postWidth, postBottom = s.y + s.height * a.postBottom;
    const loc=r.engine.location,design=STORE_DESIGNS[loc.id];
    ctx.save();
    const panel = (sx, sw, left, right) => ctx.drawImage(image, sx, 393, sw, 56, s.x + s.width * left, y, s.width * (right - left), h);
    panel(0, 481, a.cafeLeft, a.left);
    panel(1056, 400, a.right, a.fashionRight);

    for (const [px, side] of [[x, 1], [x + w - postW, -1]]) {
      const metal = ctx.createLinearGradient(px, 0, px + postW, 0);
      metal.addColorStop(0, design.post[0]);
      metal.addColorStop(0.28, design.post[1]);
      metal.addColorStop(0.7, design.post[0]);
      metal.addColorStop(1, design.post[2]);
      ctx.fillStyle = metal;
      ctx.fillRect(px, y + h, postW, postBottom - y - h);
      const inner = side === 1 ? px + postW - 1 : px + 1;
      r.line(ctx, inner, y + h, inner, postBottom, design.edge, 1.5);
      r.line(ctx, px, postBottom, px + postW, postBottom, '#253a43', 2);
    }
    const metal = ctx.createLinearGradient(0, y, 0, y + h);
    metal.addColorStop(0, design.fascia[0]);
    metal.addColorStop(0.45, design.fascia[1]);
    metal.addColorStop(1, design.fascia[2]);
    ctx.fillStyle = metal;
    ctx.fillRect(x, y, w, h);
    ctx.lineWidth = 0.7;
    for (let rib = x + 3; ['heartland','jewel','flagship'].includes(loc.id)&&rib < x + w; rib += loc.id==='flagship'?8:3) {
      ctx.strokeStyle = '#0e18246b';
      ctx.beginPath();
      ctx.moveTo(rib, y + 2);
      ctx.lineTo(rib, y + h - 4);
      ctx.stroke();
      ctx.strokeStyle = '#6e7e852c';
      ctx.beginPath();
      ctx.moveTo(rib + 0.8, y + 2);
      ctx.lineTo(rib + 0.8, y + h - 4);
      ctx.stroke();
    }
    r.line(ctx, x, y, x + w, y, '#8e9698', 1.5);
    r.line(ctx, x, y + h - 2, x + w, y + h - 2, design.edge, loc.id==='basement'?3:1.6);
    r.line(ctx, x, y + h, x + w, y + h, '#182d38', 2);
    r.line(ctx, x, y, x, y + h, '#707f84', 1.5);
    r.line(ctx, x + w, y, x + w, y + h, '#707f84', 1.5);
    if (logo.complete && logo.naturalWidth) {
      const height = h * 0.79, width = height * logo.naturalWidth / logo.naturalHeight;
      ctx.shadowColor = design.edge;
      ctx.shadowBlur = 2.5;
      this.logoVariants??=new Map();let painted=this.logoVariants.get(design.logo);if(!painted){painted=document.createElement('canvas');painted.width=logo.naturalWidth;painted.height=logo.naturalHeight;const c=painted.getContext('2d');c.drawImage(logo,0,0);c.globalCompositeOperation='source-in';c.fillStyle=design.logo;c.fillRect(0,0,painted.width,painted.height);this.logoVariants.set(design.logo,painted);}
      ctx.drawImage(painted, x + (w - width) / 2, y + (h - height) / 2 - 1, width, height);
    }
    ctx.restore();

    r.text(ctx, loc.leftSign || 'KOPI & TOAST', s.x + s.width * (a.cafeLeft + a.left) / 2, y + h * 0.60, 13, '#f6e9d1', 'center', 800);
    r.text(ctx, loc.rightSign || 'THE EDIT', s.x + s.width * (a.right + a.fashionRight) / 2, y + h * 0.60, 14, loc.id==='heartland'?'#fff4d9':'#70644e', 'center', 700);
  }
}
