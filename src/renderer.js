import {STORE_DESIGNS} from './store-designs.js';
import { ArtManager } from './art.js';
import { CharacterAnimator } from './characters.js';
import { GRAPHICS, FloorProjection } from './graphics.js';
import { SceneCompositor } from './scene.js';
import { PRODUCTS, STAFF } from './config.js';

export class Renderer {
  constructor(canvas, engine) {
    this.canvas = canvas;
    this.engine = engine;
    this.tile = 40;
    this.depth = 0.72;
    this.art = new ArtManager();
    this.projection = new FloorProjection(engine.width);
    this.compositor = new SceneCompositor(this);
    this.characters = new CharacterAnimator(this);
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.camera = { x: engine.width * 20, y: 230, zoom: 1 };
    this.selection = null;
    this.placement = null;
    this.animations = [];
    this.last = 0;
    this.animationTime = 0;
    this.previous = new Map();
    this.alpha = 1;
    this.mallShoppers = [];
    this.resize();
    new ResizeObserver(() => this.resize()).observe(canvas);
    engine.on((type, data) => {
      if (type === 'sale') this.animations.push({ type: 'scan', lane: data.lane || 'checkout', remaining: 0.8 });
      if (type === 'arrival') this.animations.push({ type: 'delivery', remaining: 3 });
    });
  }

  layout() {
    this.projection ??= new FloorProjection(this.engine.width);
    this.projection.resize(this.engine.width,STORE_DESIGNS[this.engine.location.id]?.floor);this.art?.setLocation(this.engine.location.id);
    this.scene = this.projection.scene;
    const back = this.projection.point(2, 3), front = this.projection.point(this.engine.width - 2, 13);
    this.shopBounds = { left: back.x, right: front.x, back: back.y, front: front.y };
    this.worldBounds = { left: this.scene.x - 240, right: this.scene.x + this.scene.width + 240 };
  }

  resize() {
    this.layout();
    const r = this.canvas.getBoundingClientRect();
    this.w = Math.max(1, r.width);
    this.h = Math.max(1, r.height);
    this.dpr = Math.min(devicePixelRatio || 1, 2);
    const cw = Math.round(this.w * this.dpr), ch = Math.round(this.h * this.dpr);
    if (this.canvas.width !== cw) this.canvas.width = cw;
    if (this.canvas.height !== ch) this.canvas.height = ch;
    this.coverScale = Math.max((this.w + 2) / this.scene.width, (this.h + 2) / this.scene.height);
    this.base = Math.max(0.56, this.coverScale, Math.min(1.1, this.w / (this.scene.width * 0.43 + 24), (this.h - 110) / 760));
    this.camera.zoom = Math.max(this.coverScale / this.base, Math.min(2.2, this.camera.zoom));
    this.targetScale = this.base * this.camera.zoom;
    if (!this.scale) this.scale = this.targetScale;
    this.viewCenterY = this.h * (this.w >= 900 ? 0.66 : 0.60);
    this.clamp();
  }

  clamp() {
    this.scale = Math.max(this.scale, this.coverScale || Math.max((this.w + 2) / this.scene.width, (this.h + 2) / this.scene.height));
    const s = this.scene, half = (this.w / 2 + 1) / this.scale, top = (this.viewCenterY + 1) / this.scale, bottom = (this.h - this.viewCenterY + 1) / this.scale, depth = this.depth || 1;
    this.camera.x = Math.max(s.x + half, Math.min(s.x + s.width - half, this.camera.x));
    this.camera.y = Math.max((s.y + top) / depth, Math.min((s.y + s.height - bottom) / depth, this.camera.y));
    if (this.w && this.scale) {
      const cy = this.screenPoint(7, 13.8).y;
      this.engine.corridorEdges = {
        left: Math.min(-3, Math.floor(this.worldPoint(0, cy).x / this.tile) - 3),
        right: Math.max(this.engine.width + 3, Math.ceil(this.worldPoint(this.w, cy).x / this.tile) + 3)
      };
    }
  }

  center() {
    this.camera.x = this.engine.width * this.tile / 2;
    this.camera.y = 230;
    this.camera.zoom = 1;
    this.resize();
  }

  zoom(delta) {
    this.camera.zoom = Math.max(this.coverScale / this.base, Math.min(2.2, this.camera.zoom + delta));
    this.resize();
  }

  ground(x, y) {
    return this.projection ? this.projection.point(x, y) : { x: x * this.tile, y: y * this.tile * (this.depth || 1), size: 1 };
  }

  screenPoint(x, y) {
    const p = this.ground(x, y);
    return { x: this.w / 2 + (p.x - this.camera.x) * this.scale, y: this.viewCenterY + (p.y - this.camera.y * (this.depth || 1)) * this.scale };
  }

  worldPoint(x, y) {
    const px = (x - this.w / 2) / this.scale + this.camera.x, py = (y - this.viewCenterY) / this.scale + this.camera.y * (this.depth || 1);
    if (!this.projection) return { x: px, y: py / (this.depth || 1) };
    const p = this.projection.inverse(px, py);
    return { x: p.x * this.tile, y: p.y * this.tile };
  }

  placementHit(x, y) {
    const p = this.placement;
    if (!p) return false;
    const fw = PRODUCTS[p.type]?.w || 2;
    const foot = this.screenPoint(p.x + fw / 2, p.y + 0.9), s = this.fixtureSize(p, true);
    return Math.abs(x - foot.x) <= s.w * this.scale / 2 + 12 && y >= foot.y - s.h * this.scale - 12 && y <= foot.y + 10;
  }

  hit(x, y) {
    const candidates = [];
    for (const f of this.engine.s.fixtures) {
      const fw = PRODUCTS[f.type]?.w || 2;
      candidates.push({ kind: 'fixture', id: f.id, x: f.x + fw / 2, y: f.y + 0.9, ...this.fixtureSize(f) });
    }
    for (const l of this.engine.checkouts.lanes) {
      candidates.push({ kind: 'checkout', id: l.id, x: l.x + 1, y: l.y + 0.9, ...this.fixtureSize({ ...l, type: 'checkout' }) });
    }
    for (const c of this.engine.s.customers) {
      candidates.push({ kind: 'customer', id: c.id, x: c.x + 0.5, y: c.y + 0.85, w: 28, h: GRAPHICS.personHeight * this.ground(c.x, c.y).size });
    }
    return candidates.filter(o => {
      const p = this.screenPoint(o.x, o.y);
      return Math.abs(x - p.x) <= Math.max(20, o.w * this.scale / 2) && y >= p.y - o.h * this.scale - 4 && y <= p.y + 12;
    }).sort((a, b) => b.y - a.y)[0] || null;
  }

  box(ctx, x, y, w, h, fill, r = 0, stroke = null) {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);
    }
  }

  line(ctx, x, y, x2, y2, color, width = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  text(ctx, text, x, y, size = 8, color = '#35444b', align = 'left', weight = 700) {
    ctx.font = `${weight} ${size}px Trebuchet MS,sans-serif`;
    ctx.textAlign = align;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.textAlign = 'left';
  }

  badge(ctx, text, x, y, fill = '#254657', ink = '#fff') {
    const w = Math.max(12, text.length * 5 + 9);
    this.box(ctx, x - w / 2, y - 12, w, 12, fill, 0, '#7b919a');
    this.text(ctx, text, x, y - 3, 8, ink, 'center');
  }

  shadow(ctx, x, y, w, h = 3) {
    ctx.fillStyle = '#283c4126';
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  capturePositions() {
    this.previous = new Map(this.engine.s.customers.map(c => [c.id, { x: c.x, y: c.y }]));
  }

  position(c) {
    const old = this.previous.get(c.id);
    return old ? { ...c, x: old.x + (c.x - old.x) * this.alpha, y: old.y + (c.y - old.y) * this.alpha } : c;
  }

  scenery(ctx) {
    this.compositor.render(ctx, this.animationTime);
  }

  polygon(ctx, x, y, w, h, fill, stroke) {
    const points = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map(([a, b]) => this.ground(a, b));
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.beginPath();
    points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.closePath();
    ctx.fill();
    if (stroke) ctx.stroke();
  }

  fixtureSize(f, ghost = false) {
    const def = PRODUCTS[f.type];
    const fw = def?.w || 2;
    const isDecor = Boolean(def?.isDecor || def?.isSupport);
    const type = f.stock === 0 && !ghost && !isDecor && f.type !== 'checkout' ? 'empty' : f.type;
    const rect = this.art.getFixtureRect(type);
    const a = this.ground(f.x, f.y + 0.9), b = this.ground(f.x + fw, f.y + 0.9);
    const w = (b.x - a.x) * (fw === 1 ? 0.98 : 0.90);
    return { w, h: rect ? w * rect[3] / rect[2] : 42 * a.size, fw };
  }

  fixture(ctx, f, ghost = false) {
    const def = PRODUCTS[f.type];
    const fw = def?.w || 2;
    const isDecor = Boolean(def?.isDecor || def?.isSupport);
    const p = this.ground(f.x + fw / 2, f.y + 0.9), size = this.fixtureSize(f, ghost);
    this.shadow(ctx, p.x, p.y, size.w * 0.42, 3 * p.size);
    const drawType = f.stock === 0 && !ghost && !isDecor ? 'empty' : f.type;
    this.art.draw(ctx, drawType, p.x - size.w / 2, p.y - size.h, size.w, size.h);
    if (!ghost) {
      if (this.selection?.id === f.id) this.polygon(ctx, f.x, f.y, fw, 1, '#8de5f62b', '#3fbadb');
      if (!isDecor && (this.selection?.id === f.id || f.stock === 0)) {
        this.badge(ctx, f.stock ? `${f.stock} IN STOCK` : 'RESTOCK', p.x, p.y - size.h - 2, f.stock ? '#254b5a' : '#a65346');
      } else if (isDecor && this.selection?.id === f.id) {
        this.badge(ctx, def.name.toUpperCase(), p.x, p.y - size.h - 2, '#1f5e5b');
      }
      if (this.engine.ops.pending(f.id)) this.art.draw(ctx, 'boxes', p.x + size.w * 0.35, p.y - 18, 20, 18);
    }
  }

  till(ctx, lane, time) {
    const p = this.ground(lane.x + 1, lane.y + 0.9), size = this.fixtureSize({ ...lane, type: 'checkout' });
    const scan = this.animations.some(a => a.type === 'scan' && a.lane === lane.id);
    this.characters.draw(ctx, { id: lane.id === 'checkout' ? 0 : 1, x: lane.x - 0.05, y: lane.y - 1.9, state: 'staff',staffId:'jamie' }, time, true, scan);
    this.shadow(ctx, p.x, p.y, size.w * 0.43, 4 * p.size);
    this.art.draw(ctx, 'checkout', p.x - size.w / 2, p.y - size.h, size.w, size.h);
    if (this.selection?.id === lane.id) this.polygon(ctx, lane.x, lane.y, 2, 1, '#8de5f62b', '#3fbadb');
  }

  passers(ctx, time) {
    if (!this.mallShoppers.length) {
      this.mallShoppers = [0, 1, 2, 3, 4].map(i => ({
        id: 1800 + i,
        x: this.engine.width * (-0.2 + i * 0.36),
        y: 13.5 + (i % 3) * 0.7,
        direction: i % 2 ? -1 : 1,
        state: 'walk',
        path: []
      }));
    }
    const { left, right } = this.engine.corridor;
    for (const c of this.mallShoppers) {
      if (!this.engine.s.paused && !this.engine.s.settings.reducedMotion) {
        c.x += this.ambientDT * c.direction * 0.95;
        if (c.direction > 0 && c.x > right + 2) c.x = left - 2;
        else if (c.direction < 0 && c.x < left - 2) c.x = right + 2;
      }
      c.path = [{ x: c.direction > 0 ? right + 3 : left - 3, y: c.y }];
      this.characters.draw(ctx, c, time);
    }
  }

  floorStaffDrawables(ctx) {
    const list = [];
    const w = this.engine.width;
    const spots = {
      aisha: { id: 500, x: 2.2, y: 8.25, shirt: '2563eb', roleTag: 'Aisha' },
      ben:   { id: 501, x: w - 3.5, y: 6.25, shirt: 'd97706', roleTag: 'Ben' },
      ravi:  { id: 502, x: w - 3.6, y: 8.25, shirt: '7c3aed', roleTag: 'Ravi' },
      hock:  { id: 503, x: 5.5, y: 11.4, shirt: '0891b2', roleTag: 'Hock' },
      chloe: { id: 504, x: 2.3, y: 6.15, shirt: 'be185d', roleTag: 'Chloe' }
    };
    for (const [staffId, actor] of Object.entries(spots)) {
      if (this.engine.hasStaff(staffId)) {
        list.push({
          y: actor.y + 0.85,
          draw: () => this.characters.draw(ctx, { ...actor,staffId, state: 'staff' }, this.animationTime, true)
        });
      }
    }
    return list;
  }

  render(now, alpha = 1, externalPause = false, speed = 1, frameDT = null) {
    if(this.projection.width!==this.engine.width||this.art.theme!==this.engine.location.id)this.resize();
    this.alpha = Math.max(0, Math.min(1, alpha));
    const ctx = this.ctx, s = this.engine.s;
    const dt = frameDT === null ? (this.last ? Math.max(0, Math.min(0.25, now - this.last)) : 0) : Math.max(0, Math.min(0.25, frameDT));
    this.last = now;
    this.paused = s.paused || externalPause;
    this.ambientDT = this.paused ? 0 : dt * Math.max(1, Math.min(3, speed));
    this.scale = s.settings.reducedMotion ? this.targetScale : this.scale + (this.targetScale - this.scale) * (1 - Math.exp(-dt * 14));
    if (Math.abs(this.targetScale - this.scale) < 0.001) this.scale = this.targetScale;
    this.clamp();
    if (!this.paused) {
      this.animationTime += this.ambientDT;
      for (const a of this.animations) a.remaining -= this.ambientDT;
      this.animations = this.animations.filter(a => a.remaining > 0);
    }
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#b8cbca';
    ctx.fillRect(0, 0, this.w, this.h);
    ctx.save();
    ctx.translate(this.w / 2, this.viewCenterY);
    ctx.scale(this.scale, this.scale);
    ctx.translate(-this.camera.x, -this.camera.y * (this.depth || 1));
    this.scenery(ctx);

    const drawables = [
      ...s.fixtures.filter(f => f.id !== this.placement?.id).map(f => ({ y: f.y + 0.9, draw: () => this.fixture(ctx, f) })),
      ...this.engine.checkouts.lanes.map(l => ({ y: l.y + 0.9, draw: () => this.till(ctx, l, this.animationTime) })),
      ...s.customers.map(c => {
        const p = this.position(c);
        return { y: p.y + 0.85, draw: () => this.characters.draw(ctx, p, this.animationTime) };
      }),
      ...this.floorStaffDrawables(ctx)
    ];
    drawables.sort((a, b) => a.y - b.y);
    for (const d of drawables) d.draw();

    if (this.placement) {
      const p = this.placement, fw = PRODUCTS[p.type]?.w || 2;
      ctx.lineWidth = 1 / this.scale;
      for (let y = 4; y <= 9; y++) {
        for (let x = 2; x < this.engine.width - 2; x++) {
          this.polygon(ctx, x, y, 1, 1, this.engine.occupied(x, y, p.id) ? '#e7675b40' : '#e7faff20', '#a1d9ea90');
        }
      }
      const valid = this.engine.validPlacement(p.x, p.y, p.id, p.type);
      this.polygon(ctx, p.x, p.y, fw, 1, valid ? '#43d58b70' : '#ff676770', valid ? '#43d58b' : '#ff6767');

      // Highlight nearby Accessory Bundle synergy partners on the placement grid
      const hasSynergy = valid && this.engine.hasSynergyAt(p.type, p.x, p.y, p.id);
      ctx.globalAlpha = 0.88;
      this.fixture(ctx, p, true);
      ctx.globalAlpha = 1;
      const foot = this.ground(p.x + fw / 2, p.y + 0.9);
      const label = valid ? (hasSynergy ? '✓ PLACE · ⚡ BUNDLE SYNERGY' : '✓ PLACE') : '× BLOCKED';
      this.badge(ctx, label, foot.x, foot.y - this.fixtureSize(p, true).h - 6, valid ? '#186947' : '#8c2934');
    }

    for (const e of this.engine.effects) {
      const p = this.ground(e.x / 24, e.y / 24);
      ctx.globalAlpha = Math.min(1, e.ttl);
      this.badge(ctx, e.text, p.x, p.y);
      ctx.globalAlpha = 1;
    }
    if (this.animations.some(a => a.type === 'delivery')) {
      const p = this.ground(2.5, 14.2);
      this.art.draw(ctx, 'boxes', p.x, p.y - 20, 25, 22);
      this.badge(ctx, 'DELIVERED', p.x + 12, p.y - 21);
    }
    this.passers(ctx, this.animationTime);
    ctx.restore();
    if (!this.art.ready) {
      this.text(ctx, this.art.failed ? 'Artwork unavailable · refresh' : 'Opening the shutters…', 20, this.h - 105, 12);
    }
  }
}
