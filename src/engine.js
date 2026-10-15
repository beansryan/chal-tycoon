import { Operations } from './operations.js';
import { CheckoutManager } from './checkouts.js';
import {
  CONFIG, LOCATIONS, NETWORK_BRANCHES, PRODUCTS, PEOPLE, SPECIAL_CUSTOMERS,
  RECURRING_REGULARS, CUSTOMER_REQUESTS, STAFF, EVENTS, PROMOTIONS, COSMETICS,
  GOALS, levelFor, capacity
} from './config.js';

export function freshState() {
  return {
    version: CONFIG.version,
    savedAt: Date.now(),
    cash: CONFIG.startingCash,
    xp: 0,
    reputation: 0,
    day: 1,
    time: 0,
    totalTime: 0,
    opened: false,
    paused: false,
    researchPoints: 0,
    researched: [],
    deliveries: [],
    reorderPolicy: 'instant',
    reorderThreshold: 1,
    onlinePolicy: 'balanced',
    secondCheckout: false,
    weather: 'sunny',
    event: 0,
    expansion: 0,
    promo: 0,
    promoId: 'flyer',
    loan: 0,
    floorCosmetic: 'floor_default',
    unlockedCosmetics: ['floor_default'],
    branches: [],
    regularStages: { reg_weijie: 0, reg_mdmtan: 0, reg_faris: 0 },
    fixtures: [
      { id: 'display-1', type: 'mobile', x: 4, y: 5, level: 1, stock: 5, strategy: 'mainstream' }
    ],
    staff: [],
    customers: [],
    discovered: [],
    discoveredVips: [],
    claimed: [],
    orders: [],
    orderClock: 0,
    spawnClock: 3.5,
    restockClock: 0,
    stats: {
      sales: 0,
      revenue: 0,
      lost: 0,
      online: 0,
      restocks: 0,
      bundles: 0,
      satisfaction: 92,
      supplierOrders: 0,
      unitsDelivered: 0
    },
    daily: {
      sales: 0,
      revenue: 0,
      lostStock: 0,
      lostQueue: 0,
      lostPrice: 0,
      online: 0,
      bundles: 0,
      expenses: 0
    },
    reports: [],
    settings: {
      music: false,
      sfx: true,
      haptics: true,
      reducedMotion: false,
      highContrast: false,
      largeText: false,
      quality: 'auto'
    },
    rng: 75642
  };
}

export class Engine {
  constructor(state = freshState()) {
    this.s = state;
    this.listeners = new Set();
    this.checkoutClock = 0;
    this.orderId = 0;
    this.customerId = 0;
    this.effects = [];
    this.offlineMode = false;
    this.request = null;
    this.corridorEdges = null;
    this.ops = new Operations(this);
    this.checkouts = new CheckoutManager(this);
  }

  get level() { return levelFor(this.s.xp); }
  get width() { return CONFIG.gridWidth + this.s.expansion * 2; }
  get maxFixtures() { return 10 + this.s.expansion * 2; }
  get entrance() { return { x: 7, y: 12 }; }
  get corridor() { return { y: 13.8, left: this.corridorEdges?.left ?? -3, right: this.corridorEdges?.right ?? this.width + 3 }; }
  get till() { return { x: this.width - 5, y: 10 }; }
  get location() { return LOCATIONS.find(l=>l.id===this.devLocation)||LOCATIONS[this.s.expansion]||LOCATIONS[0]; }

  on(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit(type, data = {}) {
    if (this.offlineMode) return;
    for (const fn of this.listeners) fn(type, data);
  }

  random() {
    let x = this.s.rng | 0;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.s.rng = x >>> 0;
    return this.s.rng / 4294967296;
  }

  hasStaff(id) {
    return this.s.staff.some(a => a.id === id);
  }

  staffMember(id) {
    return this.s.staff.find(a => a.id === id) || null;
  }

  computeRating() {
    const displays = this.s.fixtures.filter(f => !(PRODUCTS[f.type]?.isDecor || PRODUCTS[f.type]?.isSupport));
    if (!displays.length) return 3.0;
    const stockedRatio = displays.filter(f => f.stock > 0).length / displays.length;
    const depts = new Set(displays.map(f => f.type)).size;
    const decorBonus = this.s.fixtures.reduce((sum, f) => sum + (PRODUCTS[f.type]?.ratingBonus || 0), 0);
    const staffBonus = Math.min(0.8, this.s.staff.length * 0.14);
    const queueCount = this.s.customers.filter(c => c.state === 'queue').length;
    const queuePenalty = Math.min(1.0, queueCount * 0.16);
    const raw = 2.5 + stockedRatio * 1.15 + Math.min(0.8, depts * 0.14) + staffBonus + Math.min(0.45, decorBonus) - queuePenalty;
    return Math.max(1.0, Math.min(5.0, Math.round(raw * 10) / 10));
  }

  open() {
    if (this.s.opened) return;
    this.s.opened = true;
    this.s.spawnClock = 0;
    this.emit('message', { text: 'Doors open! Let’s make this Challenger outlet shine.' });
    this.emit('change');
  }

  spend(amount) {
    if (!Number.isFinite(amount) || amount < 0 || this.s.cash < amount) return false;
    this.s.cash -= amount;
    this.s.daily.expenses += amount;
    return true;
  }

  restock(id, auto = false) {
    const f = this.s.fixtures.find(a => a.id === id);
    if (!f || (PRODUCTS[f.type]?.isDecor || PRODUCTS[f.type]?.isSupport)) return false;
    const unitCost = this.ops.unitCost(f, 'local');
    let n = Math.min(this.ops.room(f), Math.floor(this.s.cash / Math.max(1, unitCost)));
    if (n <= 0) return false;
    const expense = n * unitCost;
    if (!this.spend(expense)) return false;
    f.stock += n;
    this.s.stats.restocks++;
    const cap = capacity(f, this.s.researched);
    if (!auto) {
      this.emit('message', { text: `${PRODUCTS[f.type].name}: +${n} stock (${f.stock}/${cap}).` });
    }
    this.emit('change');
    return true;
  }

  upgrade(id) {
    const f = this.s.fixtures.find(a => a.id === id);
    if (!f || f.level >= 5 || (PRODUCTS[f.type]?.isDecor || PRODUCTS[f.type]?.isSupport)) return false;
    const cost = f.level * 300;
    if (!this.spend(cost)) return false;
    f.level++;
    const cap = capacity(f, this.s.researched);
    // Existing paid stock and incoming reservations remain untouched.
    this.s.xp += 12;
    this.emit('upgrade', { id: f.id });
    this.emit('message', { text: `${PRODUCTS[f.type].fixture} upgraded to Lv.${f.level}! Capacity is now ${cap} (existing stock retained).` });
    this.emit('change');
    return true;
  }

  setStrategy(id, strategy) {
    if (!['budget', 'mainstream', 'premium'].includes(strategy) || this.level < 2) return false;
    const f = this.s.fixtures.find(a => a.id === id);
    if (!f || (PRODUCTS[f.type]?.isDecor || PRODUCTS[f.type]?.isSupport)) return false;
    f.strategy = strategy;
    this.emit('change');
    return true;
  }

  setOnlinePolicy(policy) {
    if (!['balanced', 'instore_first', 'online_priority'].includes(policy)) return false;
    this.s.onlinePolicy = policy;
    this.emit('change');
    return true;
  }

  equipCosmetic(id) {
    const cos = COSMETICS.find(c => c.id === id);
    if (!cos) return false;
    if (!this.s.unlockedCosmetics.includes(id)) {
      if (!this.spend(cos.cost)) return false;
      this.s.unlockedCosmetics.push(id);
    }
    this.s.floorCosmetic = id;
    this.emit('message', { text: `Floor style updated: ${cos.name}.` });
    this.emit('change');
    return true;
  }

  openBranch(id) {
    const br = NETWORK_BRANCHES.find(b => b.id === id);
    if (!br || this.s.branches.includes(id) || this.level < 8 || !this.spend(br.cost)) return false;
    this.s.branches.push(id);
    this.s.reputation += br.repBonus;
    this.emit('level', { level: this.level });
    this.emit('message', { text: `${br.name} opened in the Challenger Network! +$${br.passiveIncome}/day.` });
    this.emit('change');
    return true;
  }

  occupied(x, y, ignore = null) {
    return this.s.fixtures.some(f => {
      if (f.id === ignore) return false;
      const fw = PRODUCTS[f.type]?.w || 2;
      return y === f.y && x >= f.x && x < f.x + fw;
    }) || this.checkouts.lanes.some(lane => (x === lane.x || x === lane.x + 1) && y === lane.y);
  }

  walkable(x, y, ignore = null) {
    return x >= 2 && x <= this.width - 3 && y >= 3 && y <= 12 && !this.occupied(x, y, ignore);
  }

  path(from, to, ignore = null) {
    const a = { x: Math.round(from.x), y: Math.round(from.y) };
    const target = { x: Math.round(to.x), y: Math.round(to.y) };
    if (!this.walkable(target.x, target.y, ignore)) return null;
    const queue = [a], parents = new Map([[a.x + ',' + a.y, null]]);
    for (let i = 0; i < queue.length; i++) {
      const p = queue[i];
      if (p.x === target.x && p.y === target.y) {
        const result = [];
        let key = p.x + ',' + p.y;
        while (parents.get(key) !== null) {
          const [x, y] = key.split(',').map(Number);
          result.unshift({ x, y });
          key = parents.get(key);
        }
        return result;
      }
      for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) {
        const n = { x: p.x + dx, y: p.y + dy }, key = n.x + ',' + n.y;
        if (this.walkable(n.x, n.y, ignore) && !parents.has(key)) {
          parents.set(key, p.x + ',' + p.y);
          queue.push(n);
        }
      }
    }
    return null;
  }

  hasSynergyAt(type, x, y, ignore = null) {
    const partnerTypes = ['mobile', 'mobile_compact', 'computing', 'gaming', 'audio', 'tv_audio_wall'];
    if (type === 'accessories') {
      return this.s.fixtures.some(f => f.id !== ignore && partnerTypes.includes(f.type) && Math.abs(f.x - x) + Math.abs(f.y - y) <= 4);
    }
    if (partnerTypes.includes(type)) {
      return this.s.fixtures.some(f => f.id !== ignore && f.type === 'accessories' && Math.abs(f.x - x) + Math.abs(f.y - y) <= 4);
    }
    return false;
  }

  validPlacement(x, y, ignore = null, typeOverride = null) {
    const existing = ignore ? this.s.fixtures.find(f => f.id === ignore) : null;
    const type = typeOverride || existing?.type || 'mobile';
    const fw = PRODUCTS[type]?.w || 2;
    if (!Number.isInteger(x) || !Number.isInteger(y) || x < 2 || x + fw - 1 > this.width - 3 || y < 4 || y > 9) return false;
    for (let dx = 0; dx < fw; dx++) {
      if (this.occupied(x + dx, y, ignore)) return false;
    }
    const pretend = { id: 'preview', type, x, y };
    const old = this.s.fixtures;
    this.s.fixtures = [...old.filter(f => f.id !== ignore), pretend];
    const valid = this.checkouts.lanes.every(lane => this.path(this.entrance, { x: lane.x, y: 11 }) !== null) &&
      this.s.fixtures.every(f => this.path(this.entrance, { x: f.x, y: f.y + 1 }) !== null);
    this.s.fixtures = old;
    return valid;
  }

  build(type, x, y) {
    const def = PRODUCTS[type];
    if (!def || this.level < def.unlock || this.s.fixtures.length >= this.maxFixtures || !this.validPlacement(x, y, null, type)) return false;
    if (!this.spend(def.build)) return false;
    const initialStock = 0;
    this.s.fixtures.push({
      id: 'display-' + Date.now() + '-' + Math.floor(this.random() * 1000),
      type,
      x,
      y,
      level: 1,
      stock: initialStock,
      strategy: 'mainstream'
    });
    this.s.xp += 4;
    this.repath();
    this.emit('message', {
      text: def.isDecor
        ? `${def.fixture} placed! Store ambience and rating boosted.`
        : `${def.fixture} placed. Restock it with paid inventory to open the department.`
    });
    this.emit('change');
    return true;
  }

  move(id, x, y) {
    const f = this.s.fixtures.find(a => a.id === id);
    if (!f || !this.validPlacement(x, y, id, f.type)) return false;
    f.x = x;
    f.y = y;
    this.repath();
    this.emit('change');
    return true;
  }

  repath() {
    for (const c of this.s.customers) {
      if (c.state === 'approach') {
        const f = this.s.fixtures.find(a => a.id === c.fixture);
        const inside = f ? this.path(this.entrance, { x: f.x, y: f.y + 1 }) : null;
        c.path = [...(Math.abs(c.x - this.entrance.x) > 0.1 ? [{ x: this.entrance.x, y: this.corridor.y }] : []), { ...this.entrance }, ...(inside || [])];
        if (!inside) this.leave(c);
      } else if (c.state === 'leave' && c.y <= 12) {
        c.path = [...(this.path(c, this.entrance) || []), { x: this.entrance.x, y: this.corridor.y }, { x: c.exitSide === 1 ? this.corridor.right : this.corridor.left, y: this.corridor.y }];
      } else if (c.state === 'walk') {
        const f = this.s.fixtures.find(a => a.id === c.fixture);
        c.path = f ? this.path(c, { x: f.x, y: f.y + 1 }) : null;
        if (!c.path) c.state = 'leave';
      } else if (['toQueue', 'queue'].includes(c.state)) {
        c.queueTarget = null;
      }
    }
    this.checkouts.rebalance();
  }

  addCheckout() {
    if (this.level < 3 || this.s.secondCheckout || !this.hasStaff('jamie') || !this.spend(CONFIG.secondCheckoutCost)) return false;
    this.s.secondCheckout = true;
    this.repath();
    this.emit('message', { text: 'Two tills, two lanes! Jamie takes Till 02 while you cover Till 01.' });
    this.emit('change');
    return true;
  }

  hire(id) {
    const def = STAFF.find(a => a.id === id);
    if (!def || this.level < (def.unlock || 2) || this.hasStaff(id) || !this.spend(def.cost)) return false;
    this.s.staff.push({ id, xp: 0, training: null });
    this.s.xp += 18;
    this.emit('message', { text: `${def.name} (${def.role}): “Morning, Boss! Ready to help on the floor.”` });
    this.emit('change');
    return true;
  }

  train(id, branch) {
    const f = this.s.staff.find(a => a.id === id);
    if (!f || f.xp < 15 || f.training || !['speed', 'care'].includes(branch) || !this.spend(450)) return false;
    f.training = branch;
    const def = STAFF.find(a => a.id === id);
    this.emit('message', { text: `${def?.name || 'Staff'} trained in ${def?.branches?.[branch] || branch}!` });
    this.emit('change');
    return true;
  }

  expand() {
    const nextLoc = LOCATIONS[this.s.expansion + 1];
    if (!nextLoc || this.level < nextLoc.unlock || !this.spend(nextLoc.cost)) return false;
    this.s.expansion++;
    this.s.reputation += 8;
    this.repath();
    this.emit('message', { text: `Expanded to ${nextLoc.name} (${nextLoc.unit})! More floor space and ${nextLoc.footfall}× mall footfall.` });
    this.emit('expansion');
    this.emit('change');
    return true;
  }

  promote(promoId = 'flyer') {
    const pr = PROMOTIONS.find(p => p.id === promoId) || PROMOTIONS[0];
    if (this.level < 4 || this.s.promo > 0 || !this.spend(pr.cost)) return false;
    this.s.promo = pr.duration;
    this.s.promoId = pr.id;
    this.emit('message', { text: `${pr.name} live! ${pr.desc}` });
    this.emit('change');
    return true;
  }

  goalValue(metric) {
    if (metric === 'departments') return new Set(this.s.fixtures.filter(f => !(PRODUCTS[f.type]?.isDecor || PRODUCTS[f.type]?.isSupport)).map(a => a.type)).size;
    if (metric === 'staff') return this.s.staff.length;
    if (metric === 'level') return this.level;
    return this.s.stats[metric] || 0;
  }

  claim(id) {
    const g = GOALS.find(a => a.id === id);
    if (!g || this.s.claimed.includes(id) || this.goalValue(g.metric) < g.target) return false;
    this.s.claimed.push(id);
    this.s.cash += g.reward;
    this.s.reputation += 3;
    this.emit('message', { text: `Milestone complete: ${g.title}! +$${g.reward} Store Cash.` });
    this.emit('change');
    return true;
  }

  rescue() {
    const stockedDisplays = this.s.fixtures.filter(f => !(PRODUCTS[f.type]?.isDecor || PRODUCTS[f.type]?.isSupport));
    const cheapest = Math.min(...stockedDisplays.map(f => PRODUCTS[f.type].cost));
    if (this.s.cash >= cheapest || stockedDisplays.some(f => f.stock > 0)) return false;
    this.s.cash += 300;
    this.s.loan += 300;
    this.emit('message', { text: 'Supplier advance: +$300. Repaid at $20 per sale. You’ve got this!' });
    this.emit('change');
    return true;
  }

  addCustomer(forceType = null) {
    if (this.s.customers.length >= CONFIG.maxCustomers) return;
    const shopDisplays = this.s.fixtures.filter(f => !(PRODUCTS[f.type]?.isDecor || PRODUCTS[f.type]?.isSupport));
    if (!shopDisplays.length) return;

    // Check for Special VIP or Recurring Regular
    const hock = this.staffMember('hock');
    const vipChance = this.level >= 3 ? (hock?.training === 'care' ? 0.16 : 0.09) : 0;
    let vip = null;
    let regularId = null;
    let customQuote = null;
    let regularType = null;
    let regularBudget = null;
    let index = forceType ?? Math.floor(this.random() * Math.min(PEOPLE.length, 3 + this.level));

    if (forceType === null && this.random() < vipChance) {
      vip = SPECIAL_CUSTOMERS[Math.floor(this.random() * SPECIAL_CUSTOMERS.length)];
      customQuote = `${vip.icon} ${vip.quote}`;
      if (!this.s.discoveredVips.includes(vip.id)) {
        this.s.discoveredVips.push(vip.id);
      }
    } else if (forceType === null && this.level >= 2 && this.random() < 0.14) {
      const reg = RECURRING_REGULARS[Math.floor(this.random() * RECURRING_REGULARS.length)];
      const stageIdx = Math.min(reg.stages.length - 1, this.s.regularStages?.[reg.id] || 0);
      const st = reg.stages[stageIdx];
      regularId = reg.id;
      regularType = st.likes;
      regularBudget=Math.round((PRODUCTS[st.likes]?.price||300)*1.15);
      index = reg.kind;
      customQuote = `★ ${reg.name.split(' ')[0]}: “${st.quote}”`;
    }

    const archetype = PEOPLE[index] || PEOPLE[0];
    const activePromo = this.s.promo > 0 ? PROMOTIONS.find(p => p.id === this.s.promoId) : null;
    const preferredType = regularType || vip?.likes || activePromo?.cat || EVENTS[this.s.event]?.category || archetype.likes;

    let choices = shopDisplays;
    const preferred = choices.filter(f => f.type === preferredType || (preferredType === 'mobile' && f.type === 'mobile_compact'));
    if (preferred.length && (regularId || this.random() < 0.68)) choices = preferred;
    const f = choices[Math.floor(this.random() * choices.length)];
    const path = this.path(this.entrance, { x: f.x, y: f.y + 1 });
    if (!path) return;

    const side = this.random() < 0.5 ? -1 : 1;
    const approach = [{ x: this.entrance.x, y: this.corridor.y }, { ...this.entrance }, ...path];
    const plantBonus = this.s.fixtures.filter(a => a.type === 'decor_plant').length * 6;
    const patience = archetype.patience +
      (this.hasStaff('aisha') ? 10 : 0) +
      (this.hasStaff('hock') ? 15 : 0) +
      plantBonus +
      this.s.staff.filter(a => a.training === 'care').length * 10;

    const c = {
      id: ++this.customerId + Date.now(),
      kind: index,
      fixture: f.id,
      x: side === -1 ? this.corridor.left : this.corridor.right,
      y: this.corridor.y,
      exitSide: side,
      path: approach,
      state: 'approach',
      timer: 0,
      wait: 0,
      patience,
      skin: Math.floor(this.random() * 4),
      hair: Math.floor(this.random() * 3),
      bubble: null,
      customQuote,
      vip: vip ? vip.id : null,
      vipPalette: vip ? vip.palette : null,
      regularId,
      wantedType: regularType || preferredType,
      budget: regularBudget || (vip ? 5000 : Math.round((archetype.budget || 700) * (.85 + this.random() * .3))),
      helped: false
    };
    this.s.customers.push(c);
    if (!this.s.discovered.includes(index)) {
      this.s.discovered.push(index);
      if (this.s.stats.sales > 1) {
        this.emit('discovery', { text: `New in Customer Book: ${archetype.name}.` });
      }
    }
  }

  leave(c, reason) {
    c.state = 'leave';
    c.path = [
      ...(c.y <= 12 ? this.path(c, this.entrance) || [] : []),
      { x: this.entrance.x, y: this.corridor.y },
      { x: c.exitSide === 1 ? this.corridor.right : this.corridor.left, y: this.corridor.y }
    ];
    c.bubble = reason === 'stock' ? 'No stock!' : reason === 'price' ? 'Over my budget' : reason === 'queue' ? 'Queue too long!' : null;
    if (reason) {
      this.s.stats.lost++;
      const key=reason==='stock'?'lostStock':reason==='price'?'lostPrice':'lostQueue';
      this.s.daily[key]=(this.s.daily[key]||0)+1;
      this.s.stats.satisfaction = Math.max(35, this.s.stats.satisfaction - 2);
    }
  }

  salePrice(f) {
    const def=PRODUCTS[f.type],promo=this.s.promo>0?PROMOTIONS.find(p=>p.id===this.s.promoId):null;
    let staff=1;const aisha=this.staffMember('aisha'),ravi=this.staffMember('ravi');
    if(aisha?.training==='speed'&&['computing','tv_audio_wall'].includes(f.type))staff+=.2;
    if(ravi){if(f.type==='service_desk')staff+=ravi.training==='speed'?.35:.25;else if(['gaming','audio'].includes(f.type))staff+=ravi.training==='care'?.25:.15;}
    return Math.round(def.price*(f.strategy==='budget'?.88:f.strategy==='premium'?1.24:1)*(promo?.priceMult||1)*(EVENTS[this.s.event]?.spend||1)*staff);
  }

  sale(c, f) {
    const def = PRODUCTS[f.type];
    const activePromo = this.s.promo > 0 ? PROMOTIONS.find(p => p.id === this.s.promoId) : null;
    const aisha = this.staffMember('aisha');
    let price = this.salePrice(f);
    f.stock--;

    // Accessory Bundle Synergy check (within 4 tiles of any main department)
    let attached = false;
    const accessory = this.s.fixtures.find(a => a.type === 'accessories' && a.stock > 0 && Math.abs(a.x - f.x) + Math.abs(a.y - f.y) <= 4);
    const bundleChance = (activePromo?.id === 'bundle_mania' ? 0.80 : this.ops.has('bundles') ? 0.68 : 0.42) +
      (aisha ? (aisha.training === 'care' ? 0.25 : 0.15) : 0);
    if (accessory && f.type !== 'accessories' && this.random() < bundleChance) {
      accessory.stock--;
      price += PRODUCTS.accessories.price;
      attached = true;
      this.s.stats.bundles = (this.s.stats.bundles || 0) + 1;
      this.s.daily.bundles = (this.s.daily.bundles || 0) + 1;
    }

    // VIP & Regular bonuses
    if (c.vip) {
      const vipDef = SPECIAL_CUSTOMERS.find(v => v.id === c.vip);
      if (vipDef) {
        price += vipDef.bonusCash;
        this.s.reputation += vipDef.bonusRep;
      }
    }
    if (c.regularId) {
      const regDef = RECURRING_REGULARS.find(r => r.id === c.regularId);
      if (regDef) {
        const curStage = this.s.regularStages[c.regularId] || 0;
        if (f.type === regDef.stages[Math.min(curStage,regDef.stages.length-1)].likes && curStage < regDef.stages.length - 1) {
          this.s.regularStages[c.regularId] = curStage + 1;
        }
        this.s.reputation += 2;
      }
    }

    let repayment = Math.min(20, this.s.loan);
    this.s.loan -= repayment;
    this.s.cash += price - repayment;

    const old = this.level;
    const chloe = this.staffMember('chloe');
    const xpMult = chloe?.training === 'care' ? 1.3 : 1;
    const xpEarned = Math.round((4 + (attached ? 2 : 0) + (c.vip ? 3 : 0)) * xpMult);
    this.s.xp += xpEarned;
    this.s.reputation += 0.25 * xpMult;
    this.s.stats.sales++;
    if (this.level >= 6) this.s.researchPoints += (c.vip ? 2 : 1);
    this.s.stats.revenue += price;
    this.s.daily.sales++;
    this.s.daily.revenue += price;
    this.s.stats.satisfaction = Math.min(100, this.s.stats.satisfaction + 0.6);

    for (const staff of this.s.staff) staff.xp++;
    const lane = this.checkouts.lanes.find(a => a.id === c.lane) || this.checkouts.lanes[0];
    this.effects.push({
      x: lane.x * 24,
      y: lane.y * 24,
      text: attached ? `+$${price} ⚡BUNDLE` : c.vip ? `+$${price} 👑VIP` : `+$${price}`,
      ttl: 2.2
    });
    this.leave(c);
    this.emit('sale', { price, attached, lane: lane.id });
    if (this.level > old) {
      this.s.reputation += 3;
      this.emit('level', { level: this.level });
    }
    if (this.s.stats.sales === 1) {
      this.emit('message', { text: 'First sale complete! Tap your display to restock or upgrade as cash grows.' });
    }
    this.emit('change');
  }

  tick(dt) {
    if (!this.s.opened) return;
    this.s.time += dt;
    this.s.totalTime += dt;
    this.s.promo = Math.max(0, this.s.promo - dt);
    this.s.spawnClock -= dt;
    this.s.restockClock += dt;
    this.s.orderClock += dt;
    this.ops.tick(dt);

    if (this.s.spawnClock <= 0) {
      this.addCustomer();
      const phase = this.s.time / CONFIG.dayLength;
      const rhythm = phase < 0.18 ? 1.15 : phase < 0.55 ? 0.92 : phase < 0.82 ? 0.75 : 1.45;
      const queued=this.s.customers.filter(c=>['queue','toQueue'].includes(c.state)).length;
      if(queued>=5)this.recoveryUntil=this.s.totalTime+25;
      const pressure = this.s.totalTime < (this.recoveryUntil||0) ? 1.8 : 1;
      const locFootfall = this.location.footfall || 1;
      const totemMult = 1 + this.s.fixtures.filter(f => f.type === 'decor_totem').length * 0.12;
      const activePromo = this.s.promo > 0 ? PROMOTIONS.find(p => p.id === this.s.promoId) : null;
      const promoMult = activePromo ? activePromo.traffic : 1;
      const eventMult = EVENTS[this.s.event]?.traffic || 1;
      const weatherMult = this.s.weather === 'rain' ? 0.72 : 1;

      const baseInterval = this.s.stats.sales < 3 ? 5.5 : Math.max(2.6, 8.5 - this.level * 0.35);
      this.s.spawnClock = (baseInterval * rhythm * pressure) / (locFootfall * totemMult * promoMult * eventMult * weatherMult);
    }

    // Auto-restock by Ben or Aisha/Chloe
    const autoStaff = this.staffMember('ben') || this.staffMember('chloe');
    if (autoStaff) {
      const restockInterval = autoStaff.training === 'speed' ? 4.5 : 7.0;
      if (this.s.restockClock >= restockInterval) {
        this.s.restockClock = 0;
        const supplier = this.ops.has('reorder') && this.s.reorderPolicy === 'supplier';
        const f = this.s.fixtures.find(a =>
          !(PRODUCTS[a.type]?.isDecor || PRODUCTS[a.type]?.isSupport) &&
          a.stock <= (supplier ? this.s.reorderThreshold : 1) &&
          !this.ops.pending(a.id) &&
          this.s.cash >= PRODUCTS[a.type].cost * 2
        );
        if (f) {
          if (supplier) this.ops.order(f.id, 'standard', true);
          else this.restock(f.id, true);
        }
      }
    }

    // Click & Collect Online Orders (available from Level 4+ or when online_station is built)
    const hasOnlineDesk = this.s.fixtures.some(f => f.type === 'online_station');
    if (this.level >= 4 || hasOnlineDesk) {
      const orderInterval = (this.s.weather === 'rain' ? 16 : 32) * (hasOnlineDesk ? 0.78 : 1);
      const maxOrders = hasOnlineDesk ? 5 : 3;
      if (this.s.orderClock >= orderInterval) {
        this.s.orderClock = 0;
        const stockedTypes = this.s.fixtures.filter(f => !(PRODUCTS[f.type]?.isDecor || PRODUCTS[f.type]?.isSupport));
        if (this.s.orders.length < maxOrders && stockedTypes.length) {
          const pick = stockedTypes[Math.floor(this.random() * stockedTypes.length)];
          this.s.orders.push({ id: 'order-' + Math.floor(this.s.totalTime * 10), type: pick.type, remaining: 75 });
          this.emit('order');
          this.emit('change');
        }
      }
    }

    // Auto-pack online orders if Ben has Omnichannel Packer ('care') or onlinePolicy === 'online_priority' with online_station
    const ben = this.staffMember('ben');
    for (const order of [...this.s.orders]) {
      order.remaining -= dt;
      if ((ben?.training === 'care' || (hasOnlineDesk && this.s.onlinePolicy === 'online_priority')) && order.remaining < 68) {
        this.fulfil(order.id, true);
      }
    }
    this.s.orders = this.s.orders.filter(a => a.remaining > 0);

    // Interactive Customer Request Consultation (from Level 2+)
    if (this.level >= 2 && !this.request && this.s.totalTime > 55 && this.random() < dt / 110 && !this.offlineMode) {
      const req = CUSTOMER_REQUESTS[Math.floor(this.random() * CUSTOMER_REQUESTS.length)];
      this.request = {
        id: req.id,
        name: req.name,
        question: req.question,
        options: req.options.map(o => o.text),
        outcomes: req.options,
        answer: req.answer
      };
      this.emit('request');
    }

    const walkBoost = this.staffMember('hock')?.training === 'speed' ? 1.2 : 1.0;
    for (const c of this.s.customers) {
      if (['toQueue', 'queue'].includes(c.state)) {
        c.wait += dt;
        if (c.wait > c.patience) {
          this.leave(c, 'queue');
          continue;
        }
      }
      if (['approach', 'walk', 'toQueue', 'leave'].includes(c.state)) {
        const target = c.path?.[0];
        if (target) {
          const dx = target.x - c.x, dy = target.y - c.y, dist = Math.hypot(dx, dy);
          const step = dt * (c.y > 12.1 ? 2.0 : 1.55) * walkBoost;
          if (dist <= step) {
            c.x = target.x;
            c.y = target.y;
            c.path.shift();
            if (c.state === 'approach' && c.x === this.entrance.x && c.y === this.entrance.y) c.state = 'walk';
          } else {
            c.x += (dx / dist) * step;
            c.y += (dy / dist) * step;
          }
        } else if (c.state === 'approach') {
          c.state = 'walk';
        } else if (c.state === 'walk') {
          c.state = 'browse';
          c.timer = this.hasStaff('aisha') ? 1.5 : 2.6;
          c.bubble = c.customQuote || PEOPLE[c.kind]?.quote || 'Got stock?';
        } else if (c.state === 'toQueue') {
          c.state = 'queue';
          c.bubble = null;
        } else {
          const edge = c.exitSide === 1 ? this.corridor.right : this.corridor.left;
          if (c.exitSide === 1 ? c.x < edge : c.x > edge) c.path = [{ x: edge, y: this.corridor.y }];
          else c.state = 'gone';
        }
      } else if (c.state === 'browse') {
        c.timer -= dt;
        if (c.timer <= 0) {
          const f = this.s.fixtures.find(a => a.id === c.fixture);
          if (!f || f.stock <= 0) {
            // Missing products cannot be substituted with generic cartons.
          }
          if (!f || f.stock <= 0) this.leave(c, 'stock');
          else if (Number.isFinite(c.budget) && this.salePrice(f) > c.budget * (this.hasStaff('aisha') ? 1.15 : 1)) this.leave(c,'price');
          else {
            if (!this.checkouts.assign(c)) this.leave(c, 'queue');
          }
        }
      }
    }
    this.checkouts.tick(dt);
    this.s.customers = this.s.customers.filter(c => c.state !== 'gone');
    for (const e of this.effects) {
      e.ttl -= dt;
      e.y -= dt * 8;
    }
    this.effects = this.effects.filter(e => e.ttl > 0);
    if (this.s.time >= CONFIG.dayLength) this.closeDay();
  }

  closeDay() {
    const wages = this.s.staff.reduce((sum, a) => sum + (STAFF.find(b => b.id === a.id)?.wage || 65), 0);
    let paid = Math.min(wages, this.s.cash);
    this.s.cash -= paid;
    this.s.daily.expenses += paid;

    // Challenger Network passive branch income
    let branchIncome = 0;
    for (const bId of this.s.branches) {
      const br = NETWORK_BRANCHES.find(b => b.id === bId);
      if (br) {
        branchIncome += br.passiveIncome;
        this.s.reputation += br.repBonus;
      }
    }
    this.s.cash += branchIncome;
    this.s.daily.revenue += branchIncome;

    const d = this.s.daily;
    const note = d.lostQueue > d.lostStock
      ? 'Checkout queues cost you sales today. Hire Jamie, open a second till, or research Contactless PayNow POS!'
      : d.lostStock > 0
        ? 'Some shoppers found empty displays. Hire Ben for auto-restock or keep working capital ready.'
        : d.bundles > 0
          ? `Great layout synergy! You attached ${d.bundles} Accessory bundles (+$${d.bundles * 39}) today.`
          : 'A smooth trading day! Place an Accessories Rack near Computing or Mobile to trigger +$39 bundle sales.';

    const report = {
      day: this.s.day,
      ...d,
      wages: paid,
      branchIncome,
      unpaid: wages - paid,
      satisfaction: Math.round(this.s.stats.satisfaction),
      rating: this.computeRating(),
      note
    };
    this.s.reports.unshift(report);
    this.s.reports = this.s.reports.slice(0, 7);
    this.s.day++;
    this.s.time -= CONFIG.dayLength;
    this.s.daily = { sales: 0, revenue: 0, lostStock: 0, lostQueue: 0,
      lostPrice: 0, online: 0, bundles: 0, expenses: 0 };
    this.s.weather = this.s.day > 1 && this.random() < 0.35 ? 'rain' : 'sunny';
    this.s.event = this.s.day < 2 ? 0 : Math.floor(this.random() * EVENTS.length);
    report.tomorrow={weather:this.s.weather,event:this.s.event};
    report.lostPrice=d.lostPrice||0;
    report.insights=[d.lostStock?`${d.lostStock} shoppers found empty displays. Restock before promoting.`:null,d.lostQueue?`${d.lostQueue} shoppers gave up at checkout. Improve service before increasing traffic.`:null,d.lostPrice?`${d.lostPrice} shoppers could not afford their selection. Try budget pricing or a cheaper department.`:null,d.bundles?`${d.bundles} accessory bundles came from nearby displays. Keep complementary stock together.`:null].filter(Boolean).slice(0,3);
    this.emit('report', report);
    this.emit('change');
  }

  fulfil(id, auto = false) {
    const order = this.s.orders.find(a => a.id === id);
    if (!order) return false;
    const minKeep = this.s.onlinePolicy === 'instore_first' ? 1 : 0;
    let f = this.s.fixtures.find(a => a.type === order.type && a.stock > minKeep);

    if (!f) return false;
    f.stock--;
    const hasOnlineDesk = this.s.fixtures.some(a => a.type === 'online_station');
    const routingMult = this.ops.has('routing') ? 1.25 : 1;
    const deskMult = hasOnlineDesk ? 1.20 : 1;
    const price = Math.round((PRODUCTS[order.type]?.price || 249) * routingMult * deskMult);
    this.s.cash += price;
    this.s.stats.online++;
    this.s.stats.revenue += price;
    this.s.daily.online++;
    this.s.daily.revenue += price;
    const old = this.level;
    this.s.xp += 3;
    this.s.orders = this.s.orders.filter(a => a.id !== id);
    if (this.level > old) this.emit('level', { level: this.level });
    if (!auto) this.emit('message', { text: `Click & Collect order packed! +$${price}` });
    this.emit('change');
    return true;
  }

  answer(index) {
    if (!this.request) return false;
    const outcome = this.request.outcomes?.[index];
    const good = index === this.request.answer;
    this.request = null;
    if (outcome) {
      this.s.cash += outcome.cash || 0;
      this.s.reputation += outcome.rep || 0;
      const old = this.level;
      this.s.xp += outcome.xp || 6;
      if (this.level > old) this.emit('level', { level: this.level });
      this.emit('message', { text: `${outcome.reply} ${outcome.cash ? `(+$${outcome.cash}, +${outcome.xp} XP)` : `(+${outcome.xp} XP)`}` });
    } else {
      if (good) {
        this.s.reputation += 3;
        this.s.xp += 4;
      }
      this.emit('message', { text: good ? '“Exactly what I needed!” +3 reputation.' : '“Hmm, I meant something portable for work.”' });
    }
    this.emit('change');
    return good;
  }

  offline(seconds) {
    if (!this.s.opened || seconds < 60) return null;
    const elapsed = Math.min(CONFIG.offlineCap, seconds);
    if (!this.s.staff.length) return { duration: elapsed, closed: true, sales: 0, revenue: 0, lost: 0 };
    const before = { ...this.s.stats };
    this.offlineMode = true;
    for (let t = 0; t < elapsed; t += 0.5) this.tick(Math.min(0.5, elapsed - t));
    this.offlineMode = false;
    this.effects = [];
    return {
      duration: elapsed,
      sales: this.s.stats.sales - before.sales,
      revenue: this.s.stats.revenue - before.revenue,
      lost: this.s.stats.lost - before.lost,
      closed: false
    };
  }
}
