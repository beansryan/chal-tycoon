import { GRAPHICS } from './graphics.js';
const WALK_STATES = new Set(['approach', 'walk', 'toQueue', 'leave']);

export function facing(c, fallback = 'front') {
  const next = c.path?.[0];
  if (!next) return c.state === 'browse' ? 'back' : fallback;
  const dx = next.x - c.x, dy = next.y - c.y;
  if (Math.hypot(dx, dy) < 0.015) return fallback;
  return Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'back' : 'front');
}

export function spritePose(c, distance, { staff = false, moving = false, reduced = false, direction = 'front', action = false, time = 0 } = {}) {
  const base = staff ? 0 : 8;
  const side = direction === 'left' || direction === 'right';
  if (!moving || reduced) {
    if (side) return { group: 'walk', index: (staff ? 16 : 0) + 2, flip: direction === 'left' };
    if (action && !reduced && direction === 'front' && Math.sin(time * 3) > 0.55) {
      return { group: 'characters', index: base + 3, flip: false };
    }
    return { group: 'characters', index: base + (direction === 'back' ? 4 : direction === 'left' ? 6 : direction === 'right' ? 7 : 0), flip: false };
  }
  if (side) {
    const phases = staff ? [0, 1, 2, 3, 4, 5, 6, 7] : [0, 2, 4, 6];
    return { group: 'walk', index: (staff ? 16 : 0) + phases[Math.floor(distance / (48 / phases.length)) % phases.length], flip: direction === 'left' };
  }
  if (direction === 'back') {
    const phases = staff ? [0, 1, 2, 3, 4, 5, 6, 7] : [0, 1, 2, 4, 5, 6];
    return { group: 'walk', index: (staff ? 24 : 8) + phases[Math.floor(distance / (48 / phases.length)) % phases.length], flip: false };
  }
  return { group: 'characters', index: base + [0, 1, 0, 2][Math.floor(distance / 12) % 4], flip: false };
}

// Each customer archetype has a native outfit; staff use an entirely separate sheet.
const CUSTOMER_ROLES=[[0,0],[0,1],[0,2],[0,3],[1,0],[0,4],[1,1],[1,2],[1,3],[1,4],[0,5],[1,5]];
const STAFF_ROWS={jamie:0,aisha:1,ben:2,ravi:3,hock:4,chloe:5};
export function rolePose(c,distance,{staff=false,moving=false,reduced=false,direction='front'}={}){
 const kind=Math.abs(Number(c.kind??c.id)||0)%CUSTOMER_ROLES.length;
 const [bank,row]=staff?[0,STAFF_ROWS[c.staffId]??0]:CUSTOMER_ROLES[kind];
 const group=staff?'staffTeam':bank?'customerSpecialists':'customerTypes';
 const base=direction==='back'?4:direction==='left'||direction==='right'?8:0;
 let phases=[base,base+1,base+2,base+3];
 // Exclude generated prop swaps so a shopper's bag stays on the same shoulder.
 if(!staff&&!bank&&base===4){if(row===1||row===2)phases=[5,7,5,7];if(row===4)phases=[4,5,4,5];}
 if(!staff&&bank&&base===4&&(row===0||row===3))phases=[4,6,4,6];
 const phase=moving&&!reduced?Math.floor(distance/12)%4:0;
 return {group,index:row*12+phases[phase],flip:direction==='left'};
}

const CUSTOMER_PALETTES = ['667f9f', null, '6a9a91', '8e86ad', 'bb8464', '8bad73', 'c4a05d', 'c97a8e', '5c88a8', 'a57c65', '7a9e7e', '4d7ea8'];

export class CharacterAnimator {
  constructor(renderer) {
    this.r = renderer;
    this.motion = new Map();
  }

  draw(ctx, c, time, staff = false, action = null) {
    const r = this.r, p = r.ground(c.x + 0.5, c.y + 0.85), reduced = r.engine.s.settings.reducedMotion;
    const variant = (Number(c.kind ?? c.id) || 0) % CUSTOMER_PALETTES.length;
    let track = this.motion.get(c.id);
    if (!track) {
      track = { x: c.x, y: c.y, distance: 0, direction: staff ? 'front' : facing(c), pose: null };
      this.motion.set(c.id, track);
    }
    const distance = Math.hypot(c.x - track.x, c.y - track.y);
    if (distance < 1) track.distance += distance * r.tile;
    track.previousX = track.x;
    track.previousY = track.y;
    track.x = c.x;
    track.y = c.y;
    const moving = WALK_STATES.has(c.state) && c.path?.length > 0;
    if (!r.paused) {
      if (moving && distance > 0.0001) {
        const dx = c.x - track.previousX, dy = c.y - track.previousY;
        track.direction = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'back' : 'front');
      } else if (!moving && c.state === 'browse') {
        track.direction = 'back';
      }
      track.pose = spritePose(c, track.distance, { staff, moving, reduced, direction: track.direction, action: action || c.state === 'browse', time });
    }
    if(!r.paused||!track.nativePose)track.nativePose=rolePose(c,track.distance,{staff,moving,reduced,direction:track.direction});
    const native=track.nativePose;
    const pose = r.art.frames[native.group]?.length ? native : track.pose || spritePose(c, 0, { staff, direction: track.direction, reduced: true });
    const frame = r.art.frames[pose.group]?.[pose.index];
    if (!frame) return;

    const scale = GRAPHICS.personHeight * p.size / frame.referenceHeight;
    const [x, y, w, h] = frame.rect;
    const left = (x - frame.pivotX) * scale, top = (y - frame.pivotY) * scale;
    r.shadow(ctx, p.x, p.y, 9 * p.size, 2.4 * p.size);
    ctx.save();
    ctx.translate(p.x, p.y);
    if (pose.flip) ctx.scale(-1, 1);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const isNative=['customerTypes','customerSpecialists','staffTeam'].includes(pose.group);
    const tint = isNative ? null : staff ? c.shirt : (c.vipPalette || CUSTOMER_PALETTES[variant]);
    const sheet = tint ? r.art.variant(pose.group, staff ? 'green' : 'red', tint, pose.index) : r.art.images[pose.group];
    ctx.drawImage(sheet, tint ? 0 : x, tint ? 0 : y, w, h, left, top, w * scale, h * scale);
    ctx.restore();

    if (c.bubble) {
      const isSpecial = Boolean(c.vip || c.regularId);
      r.badge(
        ctx,
        c.bubble === '!' ? 'Paying' : c.bubble,
        p.x,
        p.y - GRAPHICS.personHeight * p.size - 6,
        isSpecial ? '#243e51' : '#f7f4ea',
        isSpecial ? '#9adff3' : '#35454e'
      );
    } else if (c.roleTag) {
      r.badge(ctx, c.roleTag, p.x, p.y - GRAPHICS.personHeight * p.size - 4, '#243e51d9', '#d9f2fa');
    }

    if (this.motion.size > 110) {
      const alive = new Set([...r.engine.s.customers, ...(r.mallShoppers || [])].map(a => a.id));
      for (const key of this.motion.keys()) {
        if (!alive.has(key) && ![0, 1, 500, 501, 502, 503, 504].includes(key)) this.motion.delete(key);
      }
    }
  }
}
