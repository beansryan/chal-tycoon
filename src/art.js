import {FITTING_INDEX,FITTING_CROPS,STORE_IDS} from './store-designs.js';
export const ATLAS_RECTS = {
  mobile: 0,
  computing: 1,
  gaming: 2,
  audio: 3,
  accessories: 4,
  checkout: 5,
  empty: 6,
  plant: 7,
  decor_plant: 7,
  boxes: 8
};

export const EXTRA_ATLAS_RECTS = {
  mobile_compact: 0,
  online_station: 1,
  service_desk: 2,
  stock_shelf: 3,
  decor_totem: 4,
  tv_audio_wall: 5
};

const ASSETS = [
  ['fixtures', 'fixtures-detailed.png', 3, 3],
  ['fixturesExtra', 'fixtures-extra.png', 3, 2],
  ['characters', 'character-atlas.png', 4, 4],
  ['walk', 'character-walk.png', 8, 4],
  ['environment', 'jewel-mall-tenants.png'],
  ['location_heartland','location-heartland.png'],['location_plq','location-plq.png'],['location_basement','location-basement.png'],['location_flagship','location-flagship.png'],['location_megastore','location-megastore.png'],
  ['customerTypes','customer-types.png',12,6],
  ['customerSpecialists','customer-specialists.png',12,6],
  ['staffTeam','staff-team.png',12,6],
  ...STORE_IDS.map(id=>['fittings_'+id,'fittings-'+id+'.png',5,3]),
  ['store_jewel','store-jewel.png'],
  ['logo', 'challenger-logo.png'],
  ['train', 'skytrain-crystal.png']
];

export class ArtManager {
  constructor() {
    this.theme='heartland';
    this.ready = false;
    this.failed = false;
    this.images = {};
    this.crops = {};
    this.frames = {};
    this.variants = new Map();
    let loaded = 0;
    for (const [key, file, cols, rows] of ASSETS) {
      const image = new Image();
      this.images[key] = image;
      image.onload = () => {
        if (cols) {
          const data = this.analyze(image, cols, rows, key);
          this.crops[key] = data.map(f => f.rect);
          this.frames[key] = data;
        }
        if (key === 'train') {
          this.crops.train = this.analyze(image, 1, 1, 'train').map(f => f.rect);
        }
        if (++loaded === ASSETS.length) this.ready = true;
      };
      image.onerror = () => { this.failed = true; };
      const inline = typeof window !== 'undefined' && window.__INLINE_ASSETS__ && window.__INLINE_ASSETS__[file];
      image.src = inline || ('./assets/' + file);
    }
  }

  analyze(image, cols, rows, key) {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(image, 0, 0);
    const { data } = ctx.getImageData(0, 0, image.width, image.height);
    if(key.startsWith('fittings_'))return FITTING_CROPS[key.slice(9)].map(([x,y,w,h])=>{
      let l=x+w,t=y+h,r=x,b=y;
      for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if(data[(yy*image.width+xx)*4+3]>160){l=Math.min(l,xx);t=Math.min(t,yy);r=Math.max(r,xx);b=Math.max(b,yy);}
      return {rect:[l,t,r-l+1,b-t+1],pivotX:(l+r)/2,pivotY:b+1,cell:{left:x,top:y}};
    });
    const frames = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const xs = key === 'fixtures'
          ? [0, 431, 826, image.width]
          : key === 'fixturesExtra'
            ? [0, 335, 675, image.width]
            : Array.from({ length: cols + 1 }, (_, i) => Math.round(i * image.width / cols));
        const ys = key === 'fixtures'
          ? [0, 450, 850, image.height]
          : key === 'fixturesExtra'
            ? [0, 355, 710]
            : key === 'walk'
              ? [0, 236, 449, 672, image.height]
              : Array.from({ length: rows + 1 }, (_, i) => Math.round(i * image.height / rows));
        let left = xs[col + 1], top = ys[row + 1], right = xs[col], bottom = ys[row];
        for (let y = ys[row]; y < ys[row + 1]; y++) {
          for (let x = xs[col]; x < xs[col + 1]; x++) {
            if (data[(y * image.width + x) * 4 + 3] > 160) {
              left = Math.min(left, x);
              top = Math.min(top, y);
              right = Math.max(right, x);
              bottom = Math.max(bottom, y);
            }
          }
        }
        if(['customerTypes','customerSpecialists','staffTeam'].includes(key)){
          // Reject tiny marks leaking from neighboring generated cells. Keep the connected actor.
          const x0=xs[col],y0=ys[row],cw=xs[col+1]-x0,ch=ys[row+1]-y0,seen=new Uint8Array(cw*ch);let best=null;
          for(let sy=0;sy<ch;sy++)for(let sx=0;sx<cw;sx++){
            const start=sy*cw+sx;if(seen[start]||data[((y0+sy)*image.width+x0+sx)*4+3]<=160)continue;
            const stack=[start];seen[start]=1;let n=0,l=cw,t=ch,rr=0,bb=0;
            while(stack.length){const k=stack.pop(),x=k%cw,y=Math.floor(k/cw);n++;l=Math.min(l,x);t=Math.min(t,y);rr=Math.max(rr,x);bb=Math.max(bb,y);for(const [nx,ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]){if(nx<0||ny<0||nx>=cw||ny>=ch)continue;const q=ny*cw+nx;if(!seen[q]&&data[((y0+ny)*image.width+x0+nx)*4+3]>160){seen[q]=1;stack.push(q)}}}
            if(!best||n>best.n)best={n,l,t,rr,bb};
          }
          if(best){left=x0+Math.max(0,best.l-2);top=y0+Math.max(0,best.t-1);right=x0+Math.min(cw-1,best.rr+2);bottom=y0+Math.min(ch-1,best.bb+1);}
        }
        let headX = 0, weight = 0;
        for (let y = top; y < top + (bottom - top) * 0.38; y++) {
          for (let x = left; x <= right; x++) {
            if (data[(y * image.width + x) * 4 + 3] > 160) {
              headX += x;
              weight++;
            }
          }
        }
        frames.push({
          rect: [left, top, right - left + 1, bottom - top + 1],
          pivotX: weight ? headX / weight : (left + right) / 2,
          pivotY: bottom + 1,
          cell: { left: xs[col], top: ys[row] }
        });
      }
    }
    if(key==='customerTypes'||key==='customerSpecialists'||key==='staffTeam'){
      // A shared native unit keeps every role the same physical size; feet anchor independently of pose.
      const unit=Math.max(...frames.map(f=>f.rect[3]));
      for(const frame of frames){frame.referenceHeight=unit;frame.pivotX=frame.cell.left+image.width/cols/2;frame.pivotY=frame.rect[1]+frame.rect[3];}
    }
    if (key === 'characters' || key === 'walk') {
      for (const frame of frames) {
        frame.referenceHeight = 240;
        frame.pivotY = frame.rect[1] + 240;
      }
    }
    return frames;
  }

  variant(group, family, color, index) {
    const key = `${group}:${family}:${color}:${index}`;
    if (this.variants.has(key)) return this.variants.get(key);
    const image = this.images[group];
    const frame = this.frames[group]?.[index];
    if (!frame) return image;
    const [x, y, w, h] = frame.rect;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(image, x, y, w, h, 0, 0, w, h);
    const pixels = ctx.getImageData(0, 0, w, h);
    const d = pixels.data;
    const target = color.match(/../g).map(s => parseInt(s, 16));
    for (let i = 0; i < d.length; i += 4) {
      const py = Math.floor(i / 4 / w), bodyY = py / h;
      if (d[i + 3] < 100 || bodyY < 0.53 || bodyY > 0.79) continue;
      const red = d[i], green = d[i + 1], blue = d[i + 2];
      const match = family === 'green'
        ? green > red * 1.22 && green > blue * 1.10 && green > 65
        : red > green * 1.52 && red > blue * 1.32 && red > 115 && green < 132;
      if (match) {
        const shade = (family === 'green' ? green : red) / (family === 'green' ? 145 : 220);
        for (let c = 0; c < 3; c++) d[i + c] = Math.min(255, target[c] * shade);
      }
    }
    ctx.putImageData(pixels, 0, 0);
    this.variants.set(key, canvas);
    return canvas;
  }

  setLocation(id){this.theme=id;}

  getFixtureRect(key) {
    const themed=this.crops['fittings_'+this.theme]?.[FITTING_INDEX[key]];if(themed)return themed;
    if (key in EXTRA_ATLAS_RECTS) {
      return this.crops.fixturesExtra?.[EXTRA_ATLAS_RECTS[key]] || null;
    }
    return this.crops.fixtures?.[ATLAS_RECTS[key]] || null;
  }

  sprite(ctx, group, index, x, y, width, height) {
    const image = this.images[group];
    const rect = this.crops[group]?.[index];
    if (!rect || !image?.complete) return false;
    ctx.drawImage(image, ...rect, x, y, width, height);
    return true;
  }

  draw(ctx, key, x, y, width, height) {
    const group='fittings_'+this.theme;if(this.crops[group]?.[FITTING_INDEX[key]])return this.sprite(ctx,group,FITTING_INDEX[key],x,y,width,height);
    if (key in EXTRA_ATLAS_RECTS) {
      return this.sprite(ctx, 'fixturesExtra', EXTRA_ATLAS_RECTS[key], x, y, width, height);
    }
    return this.sprite(ctx, 'fixtures', ATLAS_RECTS[key] ?? 0, x, y, width, height);
  }
}
