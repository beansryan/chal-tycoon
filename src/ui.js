import {
  BUILD_VERSION, CONFIG, LOCATIONS, NETWORK_BRANCHES, PRODUCTS, STAFF, PEOPLE, SPECIAL_CUSTOMERS,
  RECURRING_REGULARS, EVENTS, PROMOTIONS, COSMETICS, GOALS, RESEARCH, capacity, money, nextXP
} from './config.js';
import { EXTRA_ATLAS_RECTS } from './art.js';
import {FITTING_INDEX,FITTING_CROPS,STORE_DESIGNS} from './store-designs.js';

const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const button = (text, action, extra = '', cls = '') => `<button class="${cls}" data-action="${action}" ${extra}>${text}</button>`;

export class UI {
  constructor(engine, renderer, save, audio) {
    this.e = engine;
    this.r = renderer;
    this.save = save;
    this.audio = audio;
    this.tab = 'store';
    this.panelOpen = !engine.s.opened;
    this.selection = null;
    this.panel = document.querySelector('#panel');
    this.pointerDown = false;
    this.pending = false;
    this.toastTimer = null;
    this.modalPause = false;
    this.installPrompt = null;
    this.updated = false;

    document.addEventListener('pointerdown', () => { this.pointerDown = true; }, { passive: true });
    document.addEventListener('pointerup', () => {
      this.pointerDown = false;
      if (this.pending) {
        this.pending = false;
        setTimeout(() => this.render(), 100);
      }
    }, { passive: true });
    document.addEventListener('pointercancel', () => { this.pointerDown = false; }, { passive: true });
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-action]');
      if (b && !b.disabled) this.action(b.dataset.action, b.dataset);
    });
    document.querySelector('#settings').onclick = () => this.settings();
    document.querySelector('#panel-close').onclick = () => {
      this.panelOpen = false;
      this.selection = null;
      this.r.selection = null;
      this.tab = 'store';
      this.render();
    };
    document.querySelector('#place-cancel').onclick = () => this.cancelPlace();
    document.querySelector('#place-confirm').onclick = () => this.confirmPlace();
    document.querySelector('#zoom-in').onclick = () => this.r.zoom(0.15);
    document.querySelector('#zoom-out').onclick = () => this.r.zoom(-0.15);
    document.querySelector('#recenter').onclick = () => this.r.center();
    document.querySelector('#pause').onclick = () => {
      this.e.s.paused = !this.e.s.paused;
      document.querySelector('#pause').textContent = this.e.s.paused ? '▶' : 'Ⅱ';
      this.save.save(this.e.s);
      this.live();
    };
    document.querySelector('#speed').onclick = () => {
      this.speed = this.speed === 3 ? 1 : (this.speed || 1) + 1;
      document.querySelector('#speed').textContent = '▶ ' + this.speed + '×';
      this.toast('Simulation speed: ' + this.speed + '×');
    };
    document.querySelector('#modal').addEventListener('close', () => {
      this.modalPause = false;
      this.audio.sync();
    });
    window.addEventListener('beforeinstallprompt', event => {
      event.preventDefault();
      this.installPrompt = event;
    });
    this.speed = 1;
    this.render();
  }

  assetHref(file) {
    return (typeof window !== 'undefined' && window.__INLINE_ASSETS__ && window.__INLINE_ASSETS__[file]) || ('./assets/' + file);
  }

  toast(text) {
    const el = document.querySelector('#toast');
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => el.classList.remove('show'), 3600);
  }

  thumb(key, cls = 'item-image') {
    if(key in FITTING_INDEX){const [x,y,w,h]=FITTING_CROPS[this.e.location.id][FITTING_INDEX[key]];return `<svg class="${cls}" style="overflow:hidden" viewBox="${x} ${y} ${w} ${h}" aria-hidden="true"><image href="${this.assetHref('fittings-'+this.e.location.id+'.png')}" width="1536" height="1024"/></svg>`;}
    if (key in EXTRA_ATLAS_RECTS) {
      const index = EXTRA_ATLAS_RECTS[key];
      const col = index % 3, row = Math.floor(index / 3);
      const xs = [0, 335, 675, 1024], ys = [0, 355, 710];
      return `<svg class="${cls}" style="overflow:hidden" viewBox="${xs[col]} ${ys[row]} ${xs[col + 1] - xs[col]} ${ys[row + 1] - ys[row]}" aria-hidden="true"><image href="${this.assetHref('fixtures-extra.png')}" width="1024" height="1024"/></svg>`;
    }
    const index = { mobile: 0, computing: 1, gaming: 2, audio: 3, accessories: 4, checkout: 5, decor_plant: 7 }[key] ?? 0;
    const col = index % 3, row = Math.floor(index / 3);
    const xs = [0, 431, 826, 1254], ys = [0, 450, 850, 1254];
    return `<svg class="${cls}" style="overflow:hidden" viewBox="${xs[col]} ${ys[row]} ${xs[col + 1] - xs[col]} ${ys[row + 1] - ys[row]}" aria-hidden="true"><image href="${this.assetHref('fixtures-detailed.png')}" width="1254" height="1254"/></svg>`;
  }

  portrait(staff = true) {
    return `<svg class="portrait" style="overflow:hidden" viewBox="80 ${staff ? 42 : 665} 180 255" aria-hidden="true"><image href="${this.assetHref('character-atlas.png')}" width="1254" height="1254"/></svg>`;
  }

  guide(text) {
    return `<div class="guide">${this.portrait()}<div><strong>Jamie · Challenger Team</strong><p>${text}</p></div></div>`;
  }

  nav() {
    const icons = {
      store: '<path d="M4 10v11h16V10M3 4h18l1 6H2zM8 21v-7h5v7M5 4v6m5-6v6m5-6v6m5-6v6"/>',
      build: '<path d="m5 20 10-10 3 3L8 23H4zM12 3h7v3l3 3-3 4-5-5h-4V3z"/>',
      staff: '<circle cx="12" cy="7" r="4"/><path d="M4 22v-4q0-6 8-6t8 6v4M8 19v3m8-3v3"/>',
      goals: '<path d="M8 5H4v17h16V5h-4M8 3h8v5H8zM7 15l3 3 7-7"/>',
      book: '<path d="M12 6Q8 2 2 4v17q6-2 10 1 4-3 10-1V4q-6-2-10 2v16M5 8h4m-4 4h4m6-4h4m-4 4h4"/>'
    };
    const tabs = [['store', 'Shop'], ['build', 'Build'], ['staff', 'Staff'], ['goals', 'Goals'], ['book', 'Book']];
    const html = tabs.map(([id, name]) =>
      `<button data-action="tab" data-tab="${id}" class="${this.panelOpen && this.tab === id ? 'active' : ''}" aria-current="${this.panelOpen && this.tab === id ? 'page' : 'false'}"><span class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[id]}</svg></span><span>${name}</span></button>`
    ).join('');
    document.querySelector('#railnav').innerHTML = html;
    document.querySelector('.bottom-nav').innerHTML = html;
  }

  render() {
    document.querySelector('.inspector').hidden = !this.panelOpen;
    document.body.classList.toggle('panel-open', this.panelOpen);
    if (this.pointerDown) {
      this.pending = true;
      return;
    }
    const oldScroll = document.querySelector('.inspector').scrollTop;
    const focused = document.activeElement?.dataset?.action;
    const id = document.activeElement?.dataset?.id;
    this.nav();
    if (!this.panelOpen) {
      this.live();
      return;
    }
    if (this.r.placement) this.placementPanel();
    else if (this.selection?.kind === 'fixture') this.fixturePanel();
    else if (this.selection?.kind === 'checkout') this.checkoutPanel();
    else if (this.selection?.kind === 'customer') this.customerPanel();
    else if (this.tab === 'build') this.buildPanel();
    else if (this.tab === 'staff') this.staffPanel();
    else if (this.tab === 'goals') this.goalsPanel();
    else if (this.tab === 'book') this.bookPanel();
    else if (this.tab === 'operations') this.operationsPanel();
    else if (this.tab === 'locations') this.locationsPanel();
    else if (this.tab === 'promos') this.promosPanel();
    else if (this.tab === 'orders') {
      this.kicker('OMNICHANNEL ORDERS');
      this.panel.innerHTML = '<h2>Click & collect</h2>' + this.ordersHTML();
    } else this.storePanel();

    document.querySelector('.inspector').scrollTop = oldScroll;
    if (focused) {
      const target = [...this.panel.querySelectorAll('[data-action]')].find(x => x.dataset.action === focused && x.dataset.id === id);
      target?.focus({ preventScroll: true });
    }
    this.live();
  }

  kicker(text) {
    document.querySelector('#panel-kicker').textContent = text;
  }

  storePanel() {
    const s = this.e.s;
    this.kicker(s.opened ? 'SHOP OVERVIEW' : 'OPENING DAY');
    if (!s.opened) {
      this.panel.innerHTML = `${this.guide('Morning, boss! Five smartphones are on the island table. Shall we raise the shutters?')}${button('Open the store', 'open', '', 'primary full')}`;
      return;
    }
    const ev = EVENTS[s.event] || EVENTS[0];
    const rating = this.e.computeRating().toFixed(1);
    const stockedDisplays = s.fixtures.filter(f => !(PRODUCTS[f.type]?.isDecor || PRODUCTS[f.type]?.isSupport));
    this.panel.innerHTML = `
      <h2>${this.e.location.name}</h2><p class="mininote">${STORE_DESIGNS[this.e.location.id].name} · ${STORE_DESIGNS[this.e.location.id].finish}</p>
      <div class="store-stats">
        <span><small>Purchases</small><strong data-live="sales">${s.stats.sales}</strong></span>
        <span><small>Today</small><strong data-live="daily-revenue">${money(s.daily.revenue)}</strong></span>
        <span><small>Rating</small><strong data-live="rating">★ ${rating}</strong></span>
      </div>
      <div class="help-box"><p><strong>${ev.name}:</strong> ${ev.description}</p></div>
      <div class="section-title"><span>DISPLAYS & FITTINGS (${s.fixtures.length}/${this.e.maxFixtures})</span><span>STOCK</span></div>
      ${s.fixtures.map(f => {
        const def = PRODUCTS[f.type];
        const cap = capacity(f, s.researched);
        return `<button class="store-row full" data-action="select-fixture" data-id="${f.id}">${this.thumb(f.type)}<span>${def.fixture} <small style="display:block;color:#627681">${def.isDecor ? 'Ambience' : `Lv.${f.level} · ${def.name}`}</small></span><strong data-stock="${f.id}">${def.isDecor ? 'ACTIVE' : `${f.stock}/${cap}`}</strong></button>`;
      }).join('')}
      <div class="menu-links">
        ${button('Checkouts & queues', 'select-checkout', 'data-id="checkout"', 'full')}
        ${button('Mall locations', 'tab', 'data-tab="locations"', 'full')}
        ${this.e.level >= 4 ? button('Online orders', 'tab', 'data-tab="orders"', 'full') : ''}
        ${this.e.level >= 4 ? button('Promotions', 'tab', 'data-tab="promos"', 'full') : ''}
        ${this.e.level >= 5 ? button('Stockroom & research', 'tab', 'data-tab="operations"', 'full') : ''}
        ${s.reports.length ? button('Last closing report', 'last-report', '', 'full') : ''}
      </div>
      ${!stockedDisplays.some(f => f.stock > 0) && s.cash < Math.min(...stockedDisplays.map(f => PRODUCTS[f.type].cost)) ? button('Supplier advance · $300', 'rescue', '', 'primary full') : ''}
    `;
  }

  fixturePanel() {
    const f = this.e.s.fixtures.find(a => a.id === this.selection.id);
    if (!f) {
      this.selection = null;
      this.storePanel();
      return;
    }
    const p = PRODUCTS[f.type];
    const cap = capacity(f, this.e.s.researched);
    if (p.isDecor || p.isSupport) {
      this.kicker('STORE AMBIENCE · ' + p.w + '×' + p.h);
      this.panel.innerHTML = `
        <div class="item-detail">${this.thumb(f.type)}<div><h2>${p.fixture}</h2><span class="chip">Active on floor</span></div></div>
        <p>${p.description}</p>
        ${button('Move fitting on grid', 'move', `data-id="${f.id}"`, 'primary full')}
        ${button('Back to shop', 'tab', 'data-tab="store"', 'full')}
      `;
      return;
    }
    const unitCost = this.e.ops.unitCost(f, 'local');
    const cost = this.e.ops.room(f) * unitCost;
    const hasSynergy = this.e.hasSynergyAt(f.type, f.x, f.y, f.id);
    const salePrice = Math.round(p.price * (f.strategy === 'premium' ? 1.24 : f.strategy === 'budget' ? 0.88 : 1));
    this.kicker(`DISPLAY · LV ${f.level} · ${p.w}×${p.h}`);
    this.panel.innerHTML = `
      <div class="item-detail">${this.thumb(f.type)}<div><h2>${p.fixture}</h2><span class="stock-large" data-live="selected-stock">${f.stock} / ${cap}</span><small>in stock</small></div></div>
      <div class="bar"><span id="stock-bar" style="width:${(f.stock / Math.max(1, cap)) * 100}%"></span></div>
      <div class="metric"><span>Sale / unit restock cost</span><strong>${money(salePrice)} / ${money(unitCost)}</strong></div>
      <div class="help-box"><p>${hasSynergy ? '⚡ <strong>+$39 Bundle Synergy Active!</strong> Nearby Accessories rack attaches high-margin bundles.' : 'Tip: Place an Accessories & Cases Rack within 4 tiles to attach +$39 bundle sales!'}</p></div>
      <div class="actions">
        ${button('Restock · ' + money(cost), 'restock', `data-id="${f.id}" data-afford="${unitCost}"`, 'primary')}
        ${button(f.level >= 5 ? 'Max level' : 'Upgrade · ' + money(f.level * 300), 'upgrade', `data-id="${f.id}" data-afford="${f.level * 300}" ${f.level >= 5 ? 'disabled' : ''}`)}
      </div>
      ${button('Move display on grid', 'move', `data-id="${f.id}"`, 'full')}
      ${this.e.level >= 5 ? this.supplierHTML(f) : ''}
      ${this.e.level >= 2 ? `<details open><summary>Pricing strategy · ${f.strategy}</summary><p>Budget −12% (fast volume) · Premium +24% (needs Aisha or VIPs).</p><div class="pill-row">${['budget', 'mainstream', 'premium'].map(v => button(v, 'strategy', `data-id="${f.id}" data-value="${v}"`, f.strategy === v ? 'gold' : '')).join('')}</div></details>` : ''}
    `;
  }

  checkoutPanel() {
    this.kicker('CHECKOUTS & QUEUES');
    const lanes = this.e.checkouts.lanes;
    this.panel.innerHTML = `
      <h2>Keep the line moving.</h2>
      ${lanes.map(lane => `<div class="card"><div class="card-title"><h3>${lane.id === 'checkout-2' ? 'Till 02 · Jamie' : this.e.s.secondCheckout ? 'Till 01 · You' : 'Till 01'}</h3><span class="tag">${this.e.checkouts.duration(lane.id).toFixed(1)}s / SALE</span></div><div class="metric"><span>In this lane</span><strong data-lane="${lane.id}">${this.e.checkouts.customers(lane.id).length}</strong></div></div>`).join('')}
      ${!this.e.s.secondCheckout && this.e.level >= 3 ? `<div class="card"><h3>Open a second till</h3><p>Jamie takes Till 02 while you run Till 01. Shoppers pick the fastest lane automatically.</p>${button('Second checkout · ' + money(CONFIG.secondCheckoutCost), 'second-checkout', `data-afford="${CONFIG.secondCheckoutCost}" ${this.e.hasStaff('jamie') ? '' : 'disabled'}`, 'primary full')}<p class="mininote">Hire Jamie first in Staff. No extra daily wage.</p></div>` : ''}
      ${button('View your team', 'tab', 'data-tab="staff"', 'full')}
    `;
  }

  supplierHTML(f) {
    const pending = this.e.s.deliveries.find(d => d.fixture === f.id);
    const q = this.e.ops.quote(f.id);
    return `
      <div class="divider"></div>
      <h3>Supplier van delivery</h3>
      <p class="subtle">Reserve shelf space and pay now. Standard stock costs 12% less, arriving by delivery van.</p>
      <p class="delivery-status" data-delivery="${f.id}">${pending ? `${pending.quantity} units on the way · ${Math.ceil(pending.remaining)}s` : 'No delivery on the way.'}</p>
      <div class="actions">
        ${button('Standard · ' + money(q?.cost || 0), 'delivery', `data-id="${f.id}" data-mode="standard" ${pending || !q?.quantity ? 'disabled' : ''}`)}
        ${button('Express · 8s', 'delivery', `data-id="${f.id}" data-mode="express" ${pending || !this.e.ops.quote(f.id, 'express')?.quantity ? 'disabled' : ''}`)}
      </div>
      <p class="mininote">Standard: ${q?.eta || 32}s · Express costs 15% more than local restock. Rain adds 12s to standard vans.</p>
    `;
  }

  operationsPanel() {
    const s = this.e.s;
    this.kicker('STOCKROOM & RESEARCH');
    if (this.e.level < 5) {
      this.panel.innerHTML = '<h2>Stockroom systems</h2><p>Supplier deliveries and R&D open at Level 5. Keep growing your store!</p>';
      return;
    }
    this.panel.innerHTML = `
      <h2>Logistics & R&D</h2>
      <div class="metric"><span>Research points (RP)</span><strong data-live="research">${s.researchPoints}</strong></div>
      <p class="subtle">Earn 1 RP per sale (2 RP per VIP) from Level 6.</p>
      ${s.deliveries.length ? `<div class="section-title">ON THE WAY</div>${s.deliveries.map(d => {
        const f = s.fixtures.find(a => a.id === d.fixture);
        return `<div class="card"><h3>${PRODUCTS[f?.type || 'mobile'].name} · ${d.quantity} units</h3><p data-delivery="${f?.id}">${Math.ceil(d.remaining)}s until arrival</p><p class="mininote">Paid ${money(d.cost)} · shelf spaces reserved</p></div>`;
      }).join('')}` : '<p class="subtle">No vans on the way. Order from any display’s panel.</p>'}
      <div class="section-title">RESEARCH PROJECTS</div>
      ${RESEARCH.map(r => `<div class="card"><div class="card-title"><h3>${r.name}</h3><span class="tag">${s.researched.includes(r.id) ? 'READY' : 'LV ' + r.unlock}</span></div><p>${r.description}</p>${button(s.researched.includes(r.id) ? 'Researched' : `${r.cost} RP + ${money(r.cash)}`, 'research', `data-id="${r.id}" ${s.researched.includes(r.id) || s.researchPoints < r.cost || s.cash < r.cash || this.e.level < r.unlock ? 'disabled' : ''}`, 'full')}</div>`).join('')}
      ${this.e.ops.has('reorder') ? `<div class="card"><h3>Auto-restock plan (Ben / Chloe)</h3><p>${this.e.hasStaff('ben') || this.e.hasStaff('chloe') ? 'Your team will follow this restock plan automatically.' : 'Hire Ben or Chloe to automate restocking.'}</p><div class="actions">${['instant', 'supplier'].map(policy => button(policy === 'instant' ? 'Local · instant' : 'Supplier · cheaper', 'reorder-policy', `data-value="${policy}"`, s.reorderPolicy === policy ? 'gold' : '')).join('')}</div><p>Supplier reorder threshold</p><div class="pill-row">${[1, 3, 5].map(n => button(n + ' units left', 'reorder-threshold', `data-value="${n}"`, s.reorderThreshold === n ? 'gold' : '')).join('')}</div></div>` : ''}
    `;
  }

  locationsPanel() {
    const s = this.e.s;
    this.kicker('SINGAPORE MALLS & NETWORK');
    const nextLoc = LOCATIONS[s.expansion + 1];
    this.panel.innerHTML = `
      <h2>Store locations</h2>
      <p class="subtle">Each expansion widens your playable floor by +2 columns, increases max fixtures, and brings higher Singapore mall footfall.</p>
      ${LOCATIONS.map((loc, idx) => {
        const current = idx === s.expansion;
        const unlocked = idx <= s.expansion;
        const isNext = idx === s.expansion + 1;
        return `<div class="card"><div class="card-title"><h3>${loc.name} (${loc.unit})</h3><span class="tag">${current ? 'CURRENT' : unlocked ? 'OPENED' : 'LV ' + loc.unlock}</span></div><p>${loc.desc}</p><div class="metric"><span>Footfall multiplier</span><strong>${loc.footfall}×</strong></div>${isNext ? button(`Expand to ${loc.shortName} · ${money(loc.cost)}`, 'expand', `data-afford="${loc.cost}" ${this.e.level < loc.unlock || s.cash < loc.cost ? 'disabled' : ''}`, 'primary full') : ''}</div>`;
      }).join('')}
      <div class="section-title">CHALLENGER NETWORK (LV 8+)</div>
      <p class="subtle">Open satellite branches across Singapore for daily passive revenue and Reputation.</p>
      ${NETWORK_BRANCHES.map(br => {
        const owned = s.branches.includes(br.id);
        return `<div class="card"><div class="card-title"><h3>${br.name}</h3><span class="tag">${owned ? 'OPERATING' : br.archetype}</span></div><p>${br.desc}</p>${button(owned ? 'Branch operating' : `Open branch · ${money(br.cost)}`, 'branch', `data-id="${br.id}" data-afford="${br.cost}" ${owned || this.e.level < 8 || s.cash < br.cost ? 'disabled' : ''}`, owned ? 'full' : 'primary full')}</div>`;
      }).join('')}
    `;
  }

  promosPanel() {
    const s = this.e.s;
    this.kicker('PROMOTIONS & EVENTS');
    const ev = EVENTS[s.event] || EVENTS[0];
    this.panel.innerHTML = `
      <h2>Boost store traffic</h2>
      <div class="help-box"><p><strong>Today’s Mall Event: ${ev.name}</strong><br>${ev.description}</p></div>
      <p class="subtle">${s.promo > 0 ? `Promotion active: ${Math.ceil(s.promo)}s remaining!` : 'Launch a 90-second promotion to surge shopper footfall.'}</p>
      ${PROMOTIONS.map(pr => `<div class="card"><div class="card-title"><h3>${pr.name}</h3><span class="tag">${money(pr.cost)}</span></div><p>${pr.desc}</p>${button(s.promo > 0 ? `Promo running (${Math.ceil(s.promo)}s)` : `Launch · ${money(pr.cost)}`, 'promote', `data-id="${pr.id}" data-afford="${pr.cost}" ${s.promo > 0 || this.e.level < 4 || s.cash < pr.cost ? 'disabled' : ''}`, 'primary full')}</div>`).join('')}
    `;
  }

  customerPanel() {
    const c = this.e.s.customers.find(a => a.id === this.selection.id);
    this.kicker('SHOPPER');
    if (!c) {
      this.panel.innerHTML = '<h2>See you next time!</h2><p>That shopper has headed back into the mall.</p>';
      return;
    }
    const p = PEOPLE[c.kind] || PEOPLE[0];
    const vip = c.vip ? SPECIAL_CUSTOMERS.find(v => v.id === c.vip) : null;
    const reg = c.regularId ? RECURRING_REGULARS.find(r => r.id === c.regularId) : null;
    const title = vip ? `${vip.icon} ${vip.name}` : reg ? `★ ${reg.name}` : p.name;
    const quote = c.customQuote || `“${p.quote}”`;
    this.panel.innerHTML = `
      <h2>${escapeHTML(title)}</h2>
      <p>${escapeHTML(quote)}</p>
      <div class="metric"><span>Browsing</span><strong>${PRODUCTS[this.e.s.fixtures.find(f => f.id === c.fixture)?.type || 'mobile'].name}</strong></div>
      <div class="metric"><span>Status</span><strong data-live="customer-state">${c.state}</strong></div>
      <div class="help-box"><p>${vip ? 'Special VIP visitor! Completing their purchase awards bonus Cash and Reputation.' : reg ? 'Recurring regular! Each fulfilled visit advances their personal story in your Book.' : 'Different shoppers bring different budgets, favourite departments, and queue patience.'}</p></div>
      ${button('Open Customer Book', 'tab', 'data-tab="book"', 'full')}
    `;
  }

  buildPanel() {
    const s = this.e.s;
    this.kicker('BUILD & FLOOR STUDIO');
    const nextLoc = LOCATIONS[s.expansion + 1];
    this.panel.innerHTML = `
      <h2>Build a display (${s.fixtures.length}/${this.e.maxFixtures})</h2><p class="mininote">${STORE_DESIGNS[this.e.location.id].name} collection · ${STORE_DESIGNS[this.e.location.id].finish}</p>
      <p class="mininote">Tap a fitting to preview it on the perspective placement grid. Drag to position (green = clear path, ⚡ = bundle synergy) and tap ✓ Place.</p>
      <div class="inventory-grid">
        ${Object.entries(PRODUCTS).map(([id, p]) => `<button class="inventory-item ${this.e.level < p.unlock ? 'locked' : ''}" data-action="build" data-type="${id}" data-afford="${p.build}" ${this.e.level < p.unlock || s.fixtures.length >= this.e.maxFixtures ? 'disabled' : ''}>${this.thumb(id)}<strong>${p.name} <small style="font-weight:600;opacity:.75">(${p.w}×${p.h})</small></strong><span class="price">${this.e.level < p.unlock ? 'Level ' + p.unlock : money(p.build)}</span></button>`).join('')}
      </div>
      ${nextLoc ? `<div class="divider"></div><h3>Expand store floor</h3><p class="subtle">Next: <strong>${nextLoc.name} (${nextLoc.unit})</strong> · +2 floor columns & ${nextLoc.footfall}× footfall.</p>${button(`Expand floor · ${money(nextLoc.cost)} (Lv.${nextLoc.unlock})`, 'expand', `data-afford="${nextLoc.cost}" ${this.e.level < nextLoc.unlock || s.cash < nextLoc.cost ? 'disabled' : ''}`, 'primary full')}` : ''}
      <div class="divider"></div>
      <h3>Store floor finish</h3>
      <div class="pill-row">
        ${COSMETICS.map(c => {
          const unlocked = s.unlockedCosmetics.includes(c.id);
          const active = s.floorCosmetic === c.id;
          return button(active ? `✓ ${c.name}` : unlocked ? c.name : `${c.name} · ${money(c.cost)}`, 'cosmetic', `data-id="${c.id}" ${!unlocked && s.cash < c.cost ? 'disabled' : ''}`, active ? 'gold' : '');
        }).join('')}
      </div>
    `;
  }

  staffPanel() {
    this.kicker('CHALLENGER TEAM');
    if (this.e.level < 2) {
      this.panel.innerHTML = `<h2>Help wanted</h2>${this.guide('Serve a couple more shoppers to reach Level 2—then I can officially join your checkout team!')}<p class="subtle">Keep smartphones stocked so every visitor converts.</p>`;
      return;
    }
    this.panel.innerHTML = `
      <h2>Staff roster (${this.e.s.staff.length}/${STAFF.length})</h2>
      <p class="subtle">One-time hire fee, then daily wages at closing. At 15 Staff XP, choose a 2-branch specialization.</p>
      ${STAFF.map(p => {
        const s = this.e.s.staff.find(a => a.id === p.id);
        const locked = this.e.level < (p.unlock || 2);
        return `<div class="card ${locked ? 'locked' : ''}"><div class="staff-row">${this.portrait()}<div><h3>${p.name}</h3><small>${p.role} · Lv.${p.unlock} Unlock</small><p>${p.trait}</p></div></div><p>${p.description}</p><div class="metric"><span>Daily wage</span><strong>${money(p.wage)}</strong></div>${s ? `<div class="metric"><span>Staff XP</span><strong>${s.xp} / 15</strong></div><span class="chip">${s.training ? p.branches[s.training] : 'On duty'}</span>${s.xp >= 15 && !s.training ? `<p>Choose a specialization · $450</p><div class="actions">${button('Branch A · Speed', 'train', `data-id="${p.id}" data-value="speed" data-afford="450"`)}${button('Branch B · Care', 'train', `data-id="${p.id}" data-value="care" data-afford="450"`)}</div><p class="mininote">Speed: ${p.branches.speed}<br>Care: ${p.branches.care}</p>` : ''}` : button(locked ? `Unlocks at Level ${p.unlock}` : `Hire ${p.name} · ${money(p.cost)}`, 'hire', `data-id="${p.id}" data-afford="${p.cost}" ${locked ? 'disabled' : ''}`, 'primary full')}</div>`;
      }).join('')}
    `;
  }

  goalsPanel() {
    this.kicker('GOALS & MILESTONES');
    this.panel.innerHTML = `
      <h2>Store milestones</h2>
      <p class="subtle">Complete milestones to earn Store Cash and Reputation.</p>
      ${GOALS.filter(g => g.id === 'first' || this.e.s.stats.sales >= 1).map(g => {
        const n = this.e.goalValue(g.metric), done = this.e.s.claimed.includes(g.id);
        return `<div class="card"><div class="card-title"><h3>${g.title}</h3><span class="tag">${done ? '✓ DONE' : money(g.reward)}</span></div><p>${g.description}</p><div class="bar"><span style="width:${Math.min(100, (n / g.target) * 100)}%"></span></div><div class="list-row"><span>${Math.min(n, g.target)} / ${g.target}</span><span>Store Cash</span></div>${button(done ? 'Milestone collected' : n >= g.target ? 'Collect reward' : 'In progress', 'claim', `data-id="${g.id}" ${done || n < g.target ? 'disabled' : ''}`, n >= g.target && !done ? 'primary full' : 'full')}</div>`;
      }).join('')}
    `;
  }

  bookPanel() {
    const s = this.e.s;
    this.kicker('CUSTOMER BOOK');
    this.panel.innerHTML = `
      <h2>Singapore shoppers (${s.discovered.length}/${PEOPLE.length})</h2>
      <div class="section-title">RECURRING REGULARS</div>
      ${RECURRING_REGULARS.map(reg => {
        const stIdx = s.regularStages?.[reg.id] || 0;
        const st = reg.stages[stIdx];
        return `<div class="card"><div class="card-title"><h3>★ ${reg.name}</h3><span class="tag">STAGE ${stIdx + 1}/${reg.stages.length}</span></div><p>“${st.quote}”</p><div class="metric"><span>Current interest</span><strong>${PRODUCTS[st.likes]?.name || st.item}</strong></div></div>`;
      }).join('')}
      <div class="section-title">VIP VISITORS (${s.discoveredVips.length}/${SPECIAL_CUSTOMERS.length})</div>
      ${SPECIAL_CUSTOMERS.map(v => s.discoveredVips.includes(v.id)
        ? `<div class="card"><div class="card-title"><h3>${v.icon} ${v.name}</h3><span class="tag">+$${v.bonusCash} · +${v.bonusRep} REP</span></div><p>“${v.quote}”</p><div class="metric"><span>Favourite</span><strong>${PRODUCTS[v.likes]?.name || v.likes}</strong></div></div>`
        : `<div class="card locked"><h3>${v.icon} Mystery VIP</h3><p>Keep high store ratings or train Uncle Hock as VIP Greeter to spot them.</p></div>`
      ).join('')}
      <div class="section-title">NEIGHBOURHOOD ARCHETYPES</div>
      ${PEOPLE.map((p, i) => s.discovered.includes(i)
        ? `<div class="card"><div class="card-title"><h3>${p.name}</h3><span class="tag">DISCOVERED</span></div><p>“${p.quote}”</p><div class="metric"><span>Favourite department</span><strong>${PRODUCTS[p.likes]?.name || p.likes}</strong></div><p class="mininote">${p.patience < 40 ? 'Often in a hurry—keep checkout queues short.' : 'Happy to browse your displays.'}</p></div>`
        : '<div class="card locked"><h3>Unknown neighbour</h3><p>Open new departments and grow your store to meet them.</p></div>'
      ).join('')}
    `;
  }

  ordersHTML() {
    const s = this.e.s;
    return `
      <div class="help-box">
        <p><strong>Fulfilment Policy:</strong> Choose how Click & Collect orders share shelf stock with walk-in shoppers.</p>
        <div class="pill-row">
          ${[['balanced', 'Balanced'], ['instore_first', 'Keep ≥1 for Walk-Ins'], ['online_priority', 'Online Priority']].map(([id, label]) => button(label, 'online-policy', `data-value="${id}"`, s.onlinePolicy === id ? 'gold' : '')).join('')}
        </div>
      </div>
      <div class="section-title"><span>PENDING ORDERS</span><span>SHARED STOCK</span></div>
      ${s.orders.length ? s.orders.map(o => {
        const minKeep = s.onlinePolicy === 'instore_first' ? 1 : 0;
        const canPack = s.fixtures.some(f => (f.type === o.type && f.stock > minKeep));
        return `<div class="card"><div class="card-title"><h3>${PRODUCTS[o.type]?.name || 'Tech'} Click & Collect</h3><span class="tag" data-order="${o.id}">${Math.ceil(o.remaining)}s</span></div><p>Packs 1 unit from your ${PRODUCTS[o.type]?.fixture || 'display'}.</p>${button('Pack order · ' + money(PRODUCTS[o.type]?.price || 249), 'fulfil', `data-id="${o.id}" ${canPack ? '' : 'disabled'}`, 'primary full')}</div>`;
      }).join('') : '<p class="subtle">No orders waiting right now. Rainy afternoons and Click & Collect Desks bring more orders!</p>'}
    `;
  }

  live() {
    const s = this.e.s;
    const prev = this.e.level <= 1 ? 0 : nextXP(this.e.level - 1);
    const next = nextXP(this.e.level);
    document.querySelector('#hud-xp').style.width = Math.max(0, Math.min(100, ((s.xp - prev) / Math.max(1, next - prev)) * 100)) + '%';
    const goal = GOALS.find(g => !s.claimed.includes(g.id)), ticket = document.querySelector('#goal-ticket');
    ticket.hidden = !goal;
    if (goal) {
      const n = this.e.goalValue(goal.metric), ready = n >= goal.target;
      document.querySelector('#goal-title').textContent = goal.title;
      document.querySelector('#goal-progress').textContent = ready ? 'Collect ' + money(goal.reward) : Math.min(n, goal.target) + ' / ' + goal.target;
      ticket.classList.toggle('ready', ready);
      ticket.dataset.action = ready ? 'claim' : 'tab';
      ticket.dataset.id = goal.id;
    }
    const orders = document.querySelector('#order-ticket');
    orders.hidden = (this.e.level < 4 && !s.fixtures.some(f => f.type === 'online_station')) || !s.orders.length;
    orders.textContent = s.orders.length + ' order' + (s.orders.length === 1 ? '' : 's') + ' waiting';
    document.querySelector('#cash').textContent = money(s.cash);
    document.querySelector('#level').textContent = String(this.e.level).padStart(2, '0');
    document.querySelector('#reputation').textContent = Math.floor(s.reputation);

    const loc = this.e.location;
    document.querySelector('#location').textContent = `${loc.name} · ${loc.unit}`;
    const mallLabel = document.querySelector('.mall-label');
    if (mallLabel) {
      mallLabel.innerHTML = `${escapeHTML(loc.shortName)}<small>UNIT ${escapeHTML(loc.unit)} · ★ ${this.e.computeRating().toFixed(1)}</small>`;
    }

    const weekdays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    document.querySelector('#day-label').textContent = `DAY ${String(s.day).padStart(2, '0')} · ${weekdays[(s.day - 1) % 7]}`;
    const minutes = Math.floor((s.time / CONFIG.dayLength) * 720) + 600;
    document.querySelector('#time-label').textContent = !s.opened
      ? 'Getting ready'
      : s.paused
        ? 'Paused · take your time'
        : `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')} · ${s.time < CONFIG.dayLength * 0.25 ? 'Morning' : s.time < CONFIG.dayLength * 0.5 ? 'Lunch' : s.time < CONFIG.dayLength * 0.78 ? 'Afternoon' : 'Evening'}`;

    const ev = EVENTS[s.event];
    const weatherStr = s.weather === 'rain' ? '☂ Heavy rain' : '☀ Sunny SG';
    document.querySelector('#weather-label').textContent = ev && s.event > 0 ? `${weatherStr} · ${ev.name}` : weatherStr;
    document.querySelector('#save-status').textContent = this.save.available ? 'Autosave on' : 'Export to save';
    document.querySelector('#world-hint').textContent = this.r.placement
      ? 'Drag display on grid · green means clear · confirm to place'
      : !s.opened
        ? 'Open when you’re ready.'
        : s.weather === 'rain'
          ? 'Rain: fewer walk-ins, more Click & Collect orders.'
          : 'Tap a display · drag to pan';

    for (const el of this.panel.querySelectorAll('[data-live]')) {
      const v = el.dataset.live;
      if (v === 'research') el.textContent = s.researchPoints;
      if (v === 'sales') el.textContent = s.stats.sales;
      if (v === 'daily-revenue') el.textContent = money(s.daily.revenue);
      if (v === 'rating') el.textContent = '★ ' + this.e.computeRating().toFixed(1);
      if (v === 'xp') el.textContent = `${s.xp} / ${next}`;
      if (v === 'queue') el.textContent = s.customers.filter(c => c.state === 'queue').length;
      if (v === 'selected-stock') {
        const f = s.fixtures.find(a => a.id === this.selection?.id);
        if (f) el.textContent = `${f.stock} / ${capacity(f, s.researched)}`;
      }
      if (v === 'customer-state') {
        const c = s.customers.find(a => a.id === this.selection?.id);
        el.textContent = c ? ({
          approach: 'Walking in from the mall concourse',
          walk: 'Walking across the shop floor',
          browse: 'Comparing products at display',
          toQueue: 'Heading to checkout',
          queue: 'Waiting at checkout counter',
          leave: 'Heading back into the mall'
        }[c.state]) : 'Heading home';
      }
    }
    for (const el of this.panel.querySelectorAll('[data-stock]')) {
      const f = s.fixtures.find(a => a.id === el.dataset.stock);
      if (f) el.textContent = (PRODUCTS[f.type]?.isDecor || PRODUCTS[f.type]?.isSupport) ? 'ACTIVE' : f.stock + '/' + capacity(f, s.researched);
    }
    for (const el of this.panel.querySelectorAll('[data-order]')) {
      const o = s.orders.find(a => a.id === el.dataset.order);
      el.textContent = o ? Math.ceil(o.remaining) + 's' : 'Expired';
    }
    for (const el of this.panel.querySelectorAll('[data-afford]')) {
      let disabled = s.cash < Number(el.dataset.afford);
      const act = el.dataset.action;
      if (act === 'restock') {
        const f = s.fixtures.find(a => a.id === el.dataset.id);
        const cap = f ? capacity(f, s.researched) : 0;
        const unitCost = f ? this.e.ops.unitCost(f, 'local') : 0;
        disabled = s.cash < unitCost || !f || f.stock >= cap;
        if (f) {
          disabled = disabled || this.e.ops.room(f) === 0;
          el.textContent = 'Restock · ' + money(this.e.ops.room(f) * unitCost);
        }
      }
      if (act === 'upgrade') {
        const f = s.fixtures.find(a => a.id === el.dataset.id);
        disabled = disabled || f?.level >= 5;
      }
      if (act === 'build') disabled = disabled || this.e.level < PRODUCTS[el.dataset.type].unlock || s.fixtures.length >= this.e.maxFixtures;
      if (act === 'expand') {
        const nextLoc = LOCATIONS[s.expansion + 1];
        disabled = disabled || !nextLoc || this.e.level < nextLoc.unlock;
      }
      if (act === 'promote') disabled = disabled || s.promo > 0 || this.e.level < 4;
      if (act === 'second-checkout') disabled = disabled || s.secondCheckout || !this.e.hasStaff('jamie');
      el.disabled = disabled;
    }
    for (const el of this.panel.querySelectorAll('[data-action="delivery"]')) {
      const q = this.e.ops.quote(el.dataset.id, el.dataset.mode);
      el.disabled = Boolean(s.deliveries.some(d => d.fixture === el.dataset.id) || !q?.quantity);
      el.textContent = el.dataset.mode === 'express' ? `Express · ${money(q?.cost || 0)} · 8s` : `Standard · ${money(q?.cost || 0)}`;
    }
    for (const el of this.panel.querySelectorAll('[data-action="research"]')) {
      const r = RESEARCH.find(a => a.id === el.dataset.id);
      if (r) el.disabled = s.researched.includes(r.id) || s.researchPoints < r.cost || s.cash < r.cash || this.e.level < r.unlock;
    }
    for (const el of this.panel.querySelectorAll('[data-lane]')) {
      el.textContent = this.e.checkouts.customers(el.dataset.lane).length;
    }
    for (const el of this.panel.querySelectorAll('[data-delivery]')) {
      const d = s.deliveries.find(a => a.fixture === el.dataset.delivery);
      el.textContent = d ? `${d.quantity} units on the way · ${Math.ceil(d.remaining)}s` : 'No delivery on the way.';
    }
    const stockbar = document.querySelector('#stock-bar');
    const f = s.fixtures.find(a => a.id === this.selection?.id);
    if (stockbar && f) stockbar.style.width = (f.stock / Math.max(1, capacity(f, s.researched))) * 100 + '%';
  }

  select(hit) {
    if (this.r.placement) return;
    this.panelOpen = Boolean(hit);
    this.selection = hit;
    this.r.selection = hit;
    this.tab = 'store';
    this.render();
    if (hit) this.audio.sfx('tap');
  }

  action(action, d) {
    this.audio.unlock().catch(() => {});
    this.audio.sfx('tap');
    let success = true;
    switch (action) {
      case 'developer-menu':
        this.onDevMenu?.();
        return;
      case 'open':
        this.panelOpen = false;
        this.e.open();
        this.audio.sfx('open');
        break;
      case 'tab':
        this.panelOpen = true;
        this.cancelPlace(false);
        this.selection = null;
        this.r.selection = null;
        this.tab = d.tab;
        document.querySelector('.inspector').scrollTop = 0;
        break;
      case 'select-fixture':
        this.select({ kind: 'fixture', id: d.id });
        return;
      case 'select-checkout':
        this.select({ kind: 'checkout', id: d.id });
        return;
      case 'second-checkout':
        success = this.e.addCheckout();
        break;
      case 'delivery':
        success = this.e.ops.order(d.id, d.mode);
        break;
      case 'research':
        success = this.e.ops.research(d.id);
        break;
      case 'reorder-policy':
        success = this.e.ops.policy(d.value);
        break;
      case 'reorder-threshold':
        success = this.e.ops.threshold(Number(d.value));
        break;
      case 'online-policy':
        success = this.e.setOnlinePolicy(d.value);
        break;
      case 'cosmetic':
        success = this.e.equipCosmetic(d.id);
        break;
      case 'branch':
        success = this.e.openBranch(d.id);
        break;
      case 'restock':
        success = this.e.restock(d.id);
        if (success) this.audio.sfx('restock');
        break;
      case 'upgrade':
        success = this.e.upgrade(d.id);
        if (success) this.audio.sfx('upgrade');
        break;
      case 'build':
        this.startPlace({ type: d.type });
        return;
      case 'move':
        this.startPlace({ id: d.id, type: this.e.s.fixtures.find(f => f.id === d.id).type });
        return;
      case 'hire':
        success = this.e.hire(d.id);
        break;
      case 'train':
        success = this.e.train(d.id, d.value);
        break;
      case 'expand':
        success = this.e.expand();
        this.r.center();
        break;
      case 'claim':
        success = this.e.claim(d.id);
        break;
      case 'strategy':
        success = this.e.setStrategy(d.id, d.value);
        break;
      case 'promote':
        success = this.e.promote(d.id || 'flyer');
        break;
      case 'fulfil':
        success = this.e.fulfil(d.id);
        if (success) this.audio.sfx('sale');
        break;
      case 'rescue':
        success = this.e.rescue();
        break;
      case 'last-report':
        this.showReport(this.e.s.reports[0]);
        return;
      case 'close-modal':
        document.querySelector('#modal').close();
        return;
      case 'export':
        this.save.export(this.e.s);
        return;
      case 'install':
        if (this.installPrompt) {
          this.installPrompt.prompt();
          this.installPrompt = null;
        } else {
          this.toast('On iPhone/iPad: Safari → Share → Add to Home Screen. On Android: Chrome menu → Install app.');
        }
        return;
      case 'request':
        this.e.answer(Number(d.value));
        document.querySelector('#modal').close();
        break;
      case 'reset-ask':
        this.showModal(`<h2>Start a new shop?</h2><p>Export your save first if you want to keep this shop. This clears your local progress.</p>${button('Export current save', 'export', '', 'full')}${button('Yes, start again', 'reset-confirm', '', 'danger full')}${button('Keep my shop', 'close-modal', '', 'full')}`);
        return;
      case 'reset-confirm':
        try {
          localStorage.removeItem('challenger-tycoon-v1');
          localStorage.removeItem('challenger-tycoon-v1-recovery');
        } catch {}
        location.reload();
        return;
      case 'update':
        this.save.save(this.e.s);
        navigator.serviceWorker.getRegistration('./').then(reg => {
          if (reg?.waiting) {
            navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once: true });
            reg.waiting.postMessage({ type: 'ACTIVATE_UPDATE' });
          } else location.reload();
        });
        return;
      default:
        return;
    }
    if (!success) this.toast('Not enough cash, stock or floor space yet.');
    this.save.save(this.e.s);
    this.render();
  }

  startPlace(p) {
    this.panelOpen = false;
    const existing = this.e.s.fixtures.find(f => f.id === p.id);
    const fw = PRODUCTS[p.type]?.w || 2;
    let spot = existing ? { x: existing.x, y: existing.y } : null;
    if (!spot) {
      const choices = [];
      for (let y = 4; y <= 9; y++) {
        for (let x = 2; x <= this.e.width - 2 - fw; x++) {
          if (this.e.validPlacement(x, y, null, p.type)) choices.push({ x, y });
        }
      }
      choices.sort((a, b) => Math.hypot(a.x - this.e.width / 2, a.y - 6) - Math.hypot(b.x - this.e.width / 2, b.y - 6));
      spot = choices[0] || { x: 4, y: 5 };
    }
    this.r.placement = { ...p, ...spot };
    document.querySelector('#placement-bar').hidden = false;
    document.querySelector('#place-confirm').disabled = true;
    this.place(spot.x, spot.y);
    this.render();
    this.toast('Drag the preview on the placement grid. ✓ places it; × cancels.');
  }

  placementPanel() {
    this.kicker('BUILD MODE');
    this.panel.innerHTML = `<h2>${this.r.placement.id ? 'Move display' : 'Place display'}</h2><p>Drag the preview to position your ${PRODUCTS[this.r.placement.type].fixture.toLowerCase()}. Confirm when the grid outline is green.</p><div class="help-box"><p>Clear paths matter. You cannot block the entrance, checkout or a display’s browsing space.</p></div>${button('Cancel placement', 'tab', 'data-tab="build"', 'full')}`;
  }

  place(x, y) {
    if (!this.r.placement) return;
    this.r.placement.x = x;
    this.r.placement.y = y;
    const valid = this.e.validPlacement(x, y, this.r.placement.id, this.r.placement.type);
    const hasSynergy = valid && this.e.hasSynergyAt(this.r.placement.type, x, y, this.r.placement.id);
    document.querySelector('#place-confirm').disabled = !valid;
    document.querySelector('#placement-hint').textContent = valid
      ? (hasSynergy ? '✓ Clear path · ⚡ +$39 Bundle Synergy!' : '✓ Clear path · ready to place')
      : '× Blocked · choose a clear tile';
  }

  confirmPlace() {
    const p = this.r.placement;
    if (!p || p.x == null) return;
    const success = p.id ? this.e.move(p.id, p.x, p.y) : this.e.build(p.type, p.x, p.y);
    if (success) {
      this.audio.sfx('upgrade');
      this.panelOpen = false;
      this.cancelPlace(false);
      this.selection = null;
      this.r.selection = null;
      this.tab = 'store';
      this.save.save(this.e.s);
      this.render();
    } else {
      this.toast('That placement is blocked, or cash is short.');
    }
  }

  cancelPlace(render = true) {
    this.r.placement = null;
    document.querySelector('#placement-bar').hidden = true;
    if (render) this.render();
  }

  showModal(html, pause = true) {
    document.querySelector('#modal-content').innerHTML = html;
    this.modalPause = pause;
    const d = document.querySelector('#modal');
    if (!d.open) d.showModal();
  }

  showReport(report) {
    if (!report) return;
    this.showModal(`
      <span class="eyebrow">TRADING DAY ${report.day} · ALL WRAPPED UP</span>
      <h2 style="margin-top:12px">Closing report</h2>
      <div class="report-grid">
        <div><small>SALES REVENUE</small><strong>${money(report.revenue)}</strong></div>
        <div><small>PURCHASES</small><strong>${report.sales}</strong></div>
        <div><small>BUNDLES (+$39)</small><strong>${report.bundles || 0}</strong></div>
        <div><small>ONLINE ORDERS</small><strong>${report.online}</strong></div>
      </div>
      <div class="metric"><span>Stock, hires, upgrades & wages</span><strong>${money(report.expenses)}</strong></div>
      ${report.branchIncome ? `<div class="metric"><span>Challenger Network income</span><strong>+${money(report.branchIncome)}</strong></div>` : ''}
      <div class="metric"><span>Net cash flow today</span><strong>${money(report.revenue - report.expenses)}</strong></div>
      <div class="metric"><span>Lost to stockouts / queues</span><strong>${report.lostStock} / ${report.lostQueue}</strong></div>
      ${report.unpaid ? `<p>Cash was tight: ${money(report.unpaid)} of wages was waived.</p>` : ''}
      <div class="help-box"><p>${escapeHTML(report.note)}</p></div>
      ${(report.insights||[]).map(t=>`<p>${escapeHTML(t)}</p>`).join('')}
      ${report.tomorrow?`<div class="help-box"><strong>Next trading day</strong><p>${report.tomorrow.weather==='rain'?'Heavy rain: plan for fewer walk-ins and more online orders.':'Sunny: regular mall traffic.'} ${escapeHTML(EVENTS[report.tomorrow.event]?.name||'')}</p></div>`:''}
      ${button('A new day', 'close-modal', '', 'primary full')}
    `);
  }

  showOffline(report) {
    if (!report) return;
    const minutes = Math.round(report.duration / 60);
    this.showModal(`
      <span class="eyebrow">WELCOME BACK, BOSS</span>
      <h2 style="margin-top:12px">While you were away</h2>
      <p>${report.closed ? 'Without a teammate on roster, the store stayed closed while you were away. Your stock is safe.' : `Your team covered ${minutes} minutes (capped at 4 hours). Inventory and wages counted.`}</p>
      ${report.closed ? '' : `<div class="report-grid"><div><small>PURCHASES</small><strong>${report.sales}</strong></div><div><small>REVENUE</small><strong>${money(report.revenue)}</strong></div></div><p>${report.lost} shoppers left when stock or queues couldn’t keep up.</p>`}
      ${button('Back to the shop →', 'close-modal', '', 'primary full')}
    `);
  }

  showRequest() {
    const q = this.e.request;
    if (!q) return;
    this.showModal(`
      <span class="eyebrow">CUSTOMER CONSULTATION</span>
      <h2 style="margin-top:12px">${escapeHTML(q.name)}</h2>
      <p>${escapeHTML(q.question)}</p>
      ${q.options.map((opt, i) => button(escapeHTML(opt), 'request', `data-value="${i}"`, 'full')).join('')}
    `);
  }

  offerUpdate(message){
    this.updated=true;
    this.toast(message);
    const modal=document.querySelector('#modal');
    if(modal.open&&modal.querySelector('[data-action="install"]'))this.settings();
  }

  async settings() {
    if('serviceWorker' in navigator){try{const reg=await navigator.serviceWorker.getRegistration();if(reg?.waiting)this.updated=true;else if(reg?.active){const version=await new Promise(resolve=>{const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();resolve(null)},500);channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();resolve(e.data?.version)};reg.active.postMessage({type:'GET_VERSION'},[channel.port2])});if(version&&version!==BUILD_VERSION)this.updated=true;}}catch{}}
    this.showModal(`
      <span class="eyebrow">SETTLE IN</span>
      <h2 style="margin-top:12px">Your way to play.</h2>
      ${[['music', 'Music · original handheld loop'], ['sfx', 'Sound effects'], ['haptics', 'Haptics where supported'], ['reducedMotion', 'Reduce motion'], ['highContrast', 'Stronger contrast'], ['largeText', 'Larger management text']].map(([id, name]) => `<label class="setting"><span>${name}</span><input type="checkbox" data-setting="${id}" ${this.e.s.settings[id] ? 'checked' : ''}></label>`).join('')}
      <label class="setting"><span>Visual quality</span><select id="quality"><option value="auto">Auto</option><option value="low">Low · less weather detail</option><option value="high">High</option></select></label>
      <div class="divider"></div>
      ${button('Install on your home screen', 'install', '', 'full')}
      ${button('Export save backup', 'export', '', 'full')}
      ${button('Developer tools', 'developer-menu', '', 'full')}
      <label class="subtle">Restore a save file<input type="file" id="import-save" accept=".json,application/json"></label>
      ${this.updated ? button('Load the new version', 'update', '', 'gold full') : ''}
      <p class="mininote">Saves live in this browser on this device. Real vouchers and cashback are not connected.</p>
      ${button('Start a new shop', 'reset-ask', '', 'danger full')}
      ${button('Back to the shop', 'close-modal', '', 'primary full')}
    `);
    document.querySelector('#quality').value = this.e.s.settings.quality;
    document.querySelector('#quality').onchange = e => {
      this.e.s.settings.quality = e.target.value;
      this.save.save(this.e.s);
    };
    for (const el of document.querySelectorAll('[data-setting]')) {
      el.onchange = () => {
        this.e.s.settings[el.dataset.setting] = el.checked;
        this.audio.unlock().then(() => this.audio.sync()).catch(() => {});
        this.applySettings();
        this.save.save(this.e.s);
      };
    }
    document.querySelector('#import-save').onchange = async e => {
      try {
        const f = e.target.files[0];
        if (!f) return;
        const state = this.save.import(await f.text());
        if (!this.save.save(state)) throw Error('Browser storage is unavailable.');
        location.reload();
      } catch (err) {
        this.toast('Could not restore save: ' + err.message);
      }
    };
  }

  applySettings() {
    const s = this.e.s.settings;
    document.body.classList.toggle('high-contrast', s.highContrast);
    document.body.classList.toggle('large-text', s.largeText);
    this.e.s.settings.reducedMotion = s.reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
