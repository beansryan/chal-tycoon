import { CONFIG, PRODUCTS, STAFF, RESEARCH, GOALS, COSMETICS, NETWORK_BRANCHES, PEOPLE, EVENTS, RECURRING_REGULARS, capacity } from './config.js';
import { Engine, freshState } from './engine.js';

const finite = (v, min, max) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;

export function validateSave(raw) {
  if (!raw || typeof raw !== 'object' || ![1, 2, 3].includes(raw.version)) throw Error('This save version is not supported.');
  // Repair the previous rebuild's over-reserved deliveries before strict validation.
  // Refund only the cancelled portion of a paid order; ordinary v3 saves stay strict.
  if(raw.version===2&&Array.isArray(raw.fixtures)&&Array.isArray(raw.deliveries)){
    raw={...raw,fixtures:raw.fixtures.map(f=>({...f})),deliveries:raw.deliveries.map(d=>({...d}))};
    for(const f of raw.fixtures){
      if(PRODUCTS[f.type]?.isSupport&&finite(f.stock,0,35)&&Number.isInteger(f.stock)){
        raw.cash+=f.stock*PRODUCTS[f.type].cost;f.stock=0;
      }
      for(const d of raw.deliveries.filter(d=>d.fixture===f.id)){
        if(!PRODUCTS[f.type]||!finite(d.quantity,1,35)||!Number.isInteger(d.quantity)||!finite(d.cost,1,1e6))continue;
        const room=Math.max(0,capacity(f,Array.isArray(raw.researched)?raw.researched:[])-f.stock);
        if(d.quantity>room){const cost=room?Math.round(d.cost*room/d.quantity):0;raw.cash+=d.cost-cost;d.cost=cost;d.quantity=room;}
      }
    }
    raw.deliveries=raw.deliveries.filter(d=>d.quantity!==0);
  }
  for (const key of ['cash', 'xp', 'reputation', 'time', 'totalTime', 'day', 'expansion', 'loan', 'rng']) {
    if (!finite(raw[key], 0, key === 'expansion' ? 5 : 1e12)) throw Error('Invalid save: ' + key);
  }
  if (!Number.isInteger(raw.day) || raw.day < 1 || !Number.isInteger(raw.expansion) || raw.time >= CONFIG.dayLength * 4) {
    throw Error('Invalid trading day.');
  }
  const maxFixtures = 10 + raw.expansion * 2;
  if (!Array.isArray(raw.fixtures) || !raw.fixtures.length || raw.fixtures.length > maxFixtures) {
    throw Error('Invalid shop layout.');
  }
  const researched = Array.isArray(raw.researched) ? raw.researched.filter(id => RESEARCH.some(r => r.id === id)) : [];
  const ids = new Set();
  const gridWidth = CONFIG.gridWidth + raw.expansion * 2;
  for (const f of raw.fixtures) {
    const def = PRODUCTS[f?.type];
    const fw = def?.w || 2;
    if (!f || !def || typeof f.id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(f.id) || ids.has(f.id) ||
        !finite(f.x, 2, gridWidth - 2 - fw) || !finite(f.y, 4, 9) || !finite(f.level, 1, 5) ||
        !finite(f.stock, 0, 35) || !['budget', 'premium', 'mainstream'].includes(f.strategy) ||
        ![f.x, f.y, f.level, f.stock].every(Number.isInteger)) {
      throw Error('Invalid display.');
    }
    ids.add(f.id);
    if (!def.isDecor && !def.isSupport && f.stock > capacity(f, researched)) throw Error('Invalid stock.');
  }

  const state = freshState();
  Object.assign(state, {
    cash: raw.cash,
    xp: raw.xp,
    reputation: raw.reputation,
    time: Math.min(CONFIG.dayLength - 1, raw.time),
    totalTime: raw.totalTime,
    day: raw.day,
    expansion: raw.expansion,
    loan: raw.loan,
    rng: raw.rng,
    opened: raw.opened === true,
    paused: raw.paused === true,
    savedAt: finite(raw.savedAt, 0, Date.now() + 60000) ? raw.savedAt : Date.now(),
    weather: raw.weather === 'rain' ? 'rain' : 'sunny',
    event: Number.isInteger(raw.event) && raw.event >= 0 && raw.event < EVENTS.length ? raw.event : 0,
    fixtures: raw.fixtures.map(f => ({ ...f,stock:PRODUCTS[f.type].isSupport?0:f.stock })),
    promo: finite(raw.promo, 0, 120) ? raw.promo : 0,
    promoId: typeof raw.promoId === 'string' ? raw.promoId : 'flyer',
    onlinePolicy: ['balanced', 'instore_first', 'online_priority'].includes(raw.onlinePolicy) ? raw.onlinePolicy : 'balanced',
    floorCosmetic: COSMETICS.some(c => c.id === raw.floorCosmetic) ? raw.floorCosmetic : 'floor_default',
    unlockedCosmetics: Array.isArray(raw.unlockedCosmetics) ? [...new Set(['floor_default', ...raw.unlockedCosmetics.filter(id => COSMETICS.some(c => c.id === id))])] : ['floor_default'],
    branches: Array.isArray(raw.branches) ? [...new Set(raw.branches.filter(id => NETWORK_BRANCHES.some(b => b.id === id)))] : []
  });

  if (raw.regularStages && typeof raw.regularStages === 'object') {
    for (const k of ['reg_weijie', 'reg_mdmtan', 'reg_faris']) {
      if (Number.isInteger(raw.regularStages[k]) && raw.regularStages[k] >= 0 && raw.regularStages[k] <= 4) {
        state.regularStages[k] = Math.min(raw.regularStages[k],RECURRING_REGULARS.find(r=>r.id===k).stages.length-1);
      }
    }
  }

  if (Array.isArray(raw.staff)) {
    const seen = new Set();
    state.staff = raw.staff
      .filter(a => a && STAFF.some(b => b.id === a.id) && !seen.has(a.id) && seen.add(a.id))
      .slice(0, STAFF.length)
      .map(a => ({ id: a.id, xp: finite(a.xp, 0, 1e9) ? a.xp : 0, training: ['speed', 'care'].includes(a.training) ? a.training : null }));
  }
  for (const key of Object.keys(state.stats)) if (finite(raw.stats?.[key], 0, 1e12)) state.stats[key] = raw.stats[key];
  state.stats.satisfaction = Math.min(100, state.stats.satisfaction);
  for (const key of Object.keys(state.daily)) if (finite(raw.daily?.[key], 0, 1e12)) state.daily[key] = raw.daily[key];

  const validGoals = new Set(GOALS.map(g => g.id));
  state.claimed = Array.isArray(raw.claimed) ? raw.claimed.filter(x => validGoals.has(x)) : [];
  state.discovered = Array.isArray(raw.discovered) ? [...new Set(raw.discovered.filter(x => Number.isInteger(x) && x >= 0 && x < PEOPLE.length))] : [];
  state.discoveredVips = Array.isArray(raw.discoveredVips) ? [...new Set(raw.discoveredVips.filter(x => typeof x === 'string'))] : [];

  state.reports = Array.isArray(raw.reports) ? raw.reports.slice(0, 7).filter(r => r && finite(r.day, 1, 1e9)).map(r => {
    const report = { note: typeof r.note === 'string' ? r.note.slice(0, 300) : '' };
    for (const k of ['day', 'sales', 'revenue', 'lostStock', 'lostQueue', 'online', 'bundles', 'expenses', 'wages', 'branchIncome', 'unpaid', 'satisfaction', 'rating', 'lostPrice']) {
      report[k] = finite(r[k], 0, 1e12) ? r[k] : 0;
    }
    report.insights=Array.isArray(r.insights)?r.insights.filter(t=>typeof t==='string').slice(0,3).map(t=>t.slice(0,220)):[];
    if(r.tomorrow&&['rain','sunny'].includes(r.tomorrow.weather)&&Number.isInteger(r.tomorrow.event)&&EVENTS[r.tomorrow.event])report.tomorrow={weather:r.tomorrow.weather,event:r.tomorrow.event};
    return report;
  }) : [];

  for (const key of ['music', 'sfx', 'haptics', 'reducedMotion', 'highContrast', 'largeText']) {
    if (typeof raw.settings?.[key] === 'boolean') state.settings[key] = raw.settings[key];
  }
  state.settings.quality = ['auto', 'low', 'high'].includes(raw.settings?.quality) ? raw.settings.quality : 'auto';
  if (Array.isArray(raw.orders)) {
    state.orders = raw.orders.filter(o => o && PRODUCTS[o.type] && typeof o.id === 'string' && /^order-[\d.]+$/.test(o.id) && finite(o.remaining, 0, 90)).slice(0, 5).map(o => ({ ...o }));
  }
  if (Array.isArray(raw.customers)) {
    state.customers = raw.customers.filter(c =>
      c && finite(c.kind, 0, PEOPLE.length - 1) && Number.isInteger(c.kind) &&
      finite(c.x, -100, 100) && finite(c.y, 0, 20) && finite(c.id, 0, 1e15) &&
      ids.has(c.fixture) && ['approach', 'walk', 'browse', 'toQueue', 'queue', 'leave'].includes(c.state) &&
      finite(c.timer, 0, 20) && finite(c.wait, 0, 300) && finite(c.patience, 1, 250) &&
      Array.isArray(c.path) && c.path.length < 200 && c.path.every(p => finite(p.x, -100, 100) && finite(p.y, 0, 20))
    ).slice(0, 24).map(c => ({
      ...c,
      exitSide: c.exitSide === 1 ? 1 : -1,
      skin: Number.isInteger(c.skin) && c.skin >= 0 && c.skin < 4 ? c.skin : 0,
      hair: Number.isInteger(c.hair) && c.hair >= 0 && c.hair < 3 ? c.hair : 0,
      bubble: typeof c.bubble === 'string' ? c.bubble.slice(0, 80) : null
    }));
  }

  if (raw.version >= 2) {
    if (!finite(raw.researchPoints, 0, 1e9) || !Number.isInteger(raw.researchPoints) || typeof raw.secondCheckout !== 'boolean' ||
        !Array.isArray(raw.researched) || !raw.researched.every(id => RESEARCH.some(r => r.id === id)) ||
        new Set(raw.researched).size !== raw.researched.length) {
      throw Error('Invalid operations data.');
    }
    state.researchPoints = raw.researchPoints;
    state.researched = [...raw.researched];
    state.secondCheckout = raw.secondCheckout;
    state.reorderPolicy = raw.reorderPolicy === 'supplier' ? 'supplier' : 'instant';
    state.reorderThreshold = [1, 3, 5].includes(raw.reorderThreshold) ? raw.reorderThreshold : 1;
    if (!Array.isArray(raw.deliveries) || raw.deliveries.length > 14) throw Error('Invalid deliveries.');
    const deliveryIds = new Set(), deliveryFixtures = new Set();
    state.deliveries = raw.deliveries.map(d => {
      if (!d || typeof d.id !== 'string' || !/^delivery-[\d-]+$/.test(d.id) || deliveryIds.has(d.id) ||
          deliveryFixtures.has(d.fixture) || !ids.has(d.fixture) || !finite(d.quantity, 1, 35) ||
          !Number.isInteger(d.quantity) || !finite(d.remaining, 0, 120) || !finite(d.cost, 1, 1e6) ||
          !['standard', 'express'].includes(d.mode)) {
        throw Error('Invalid delivery.');
      }
      deliveryIds.add(d.id);
      deliveryFixtures.add(d.fixture);
      return { id: d.id, fixture: d.fixture, quantity: d.quantity, remaining: d.remaining, cost: d.cost, mode: d.mode };
    });
    if (state.secondCheckout && !state.staff.some(a => a.id === 'jamie')) throw Error('Second checkout needs its cashier.');
    for (const f of state.fixtures) {
      if (!PRODUCTS[f.type]?.isDecor && !PRODUCTS[f.type]?.isSupport && f.stock + state.deliveries.filter(d => d.fixture === f.id).reduce((sum, d) => sum + d.quantity, 0) > capacity(f, state.researched)) {
        throw Error('Stock and reserved delivery exceed capacity.');
      }
    }
  }
  for (const c of state.customers) {
    c.lane = state.secondCheckout && c.lane === 'checkout-2' ? 'checkout-2' : 'checkout';
    c.queueTarget = null;
  }
  const check = new Engine(state);
  for (const f of state.fixtures) if (!check.validPlacement(f.x, f.y, f.id, f.type)) throw Error('Invalid or blocked shop layout.');
  return state;
}

export class SaveManager {
  constructor() {
    this.available = true;
    this.warning = null;
  }
  load() {
    try {
      const raw = localStorage.getItem(CONFIG.saveKey);
      if (!raw) return freshState();
      try {
        return validateSave(JSON.parse(raw));
      } catch (e) {
        try { localStorage.setItem(CONFIG.saveKey + '-recovery', raw); } catch {}
        this.warning = 'The old save could not be loaded. A recovery copy was kept where storage is available.';
        return freshState();
      }
    } catch {
      this.available = false;
      this.warning = 'Browser storage is unavailable. Export a backup to keep your progress.';
      return freshState();
    }
  }
  save(state) {
    state.savedAt = Date.now();
    try {
      localStorage.setItem(CONFIG.saveKey, JSON.stringify(state));
      this.available = true;
      return true;
    } catch {
      this.available = false;
      return false;
    }
  }
  export(state) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ ...state, savedAt: Date.now() }, null, 2)], { type: 'application/json' }));
    a.download = 'challenger-tycoon-save.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  import(text) {
    if (text.length > 1e6) throw Error('Save file is too large.');
    return validateSave(JSON.parse(text));
  }
}
