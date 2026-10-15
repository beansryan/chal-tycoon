export const BUILD_VERSION='tycoon-v2.1.0';
export const CONFIG = Object.freeze({
  version: 3,
  saveKey: 'challenger-tycoon-v1',
  startingCash: 1000,
  dayLength: 480,
  offlineCap: 14400,
  tile: 24,
  gridWidth: 15,
  gridHeight: 15,
  maxCustomers: 24,
  secondCheckoutCost: 1200
});

export const LOCATIONS = Object.freeze([
  { id: 'heartland', name: 'Heartland Tech Shop', shortName: 'TOA PAYOH CENTRAL', unit: '#01-18', unlock: 1, cost: 0, footfall: 1.0, leftSign: 'AH SENG MAMA', rightSign: 'NANYANG KOPI', desc: 'Compact HDB town-centre shop with steady residential regulars.' },
  { id: 'plq', name: 'PLQ Mall Challenger', shortName: 'PLQ MALL', unit: '#04-01', unlock: 3, cost: 1200, footfall: 1.25, leftSign: 'KOPITIAM #04-11', rightSign: 'DON DON DONKI', desc: 'Bustling Paya Lebar regional mall flanked by Kopitiam and Don Don Donki.' },
  { id: 'basement', name: 'ION Orchard Basement', shortName: 'ION ORCHARD', unit: '#B3-15/16', unlock: 6, cost: 3500, footfall: 1.55, leftSign: 'CASETiFY STUDIO', rightSign: 'HOSHINO COFFEE', desc: 'High-traffic MRT underground concourse beside Casetify Studio and Hoshino Coffee.' },
  { id: 'jewel', name: 'Jewel Changi Superstore', shortName: 'JEWEL CHANGI AIRPORT', unit: '#B2-214/215/216', unlock: 10, cost: 9000, footfall: 1.95, leftSign: 'KOPI & TOAST', rightSign: 'THE EDIT', desc: 'Iconic destination store beneath the Rain Vortex waterfall and Changi Skytrain.' },
  { id: 'flagship', name: 'Funan Tech Store', shortName: 'FUNAN', unit: '#03-27/28', unlock: 16, cost: 24000, footfall: 2.4, leftSign: 'ESPORTS ARENA', rightSign: 'TIONG BAHRU BAKERY', desc: 'Civic-district tech flagship attracting Pro Gamers, Creators, and Corporate Buyers.' },
  { id: 'megastore', name: 'Singapore Tech Megastore', shortName: 'SG TECH MEGASTORE', unit: '#01-01', unlock: 24, cost: 65000, footfall: 3.0, leftSign: 'HAWKER HERITAGE', rightSign: '24H LIFESTYLE HUB', desc: 'The ultimate island-wide Challenger flagship and omnichannel hub.' }
]);

export const NETWORK_BRANCHES = Object.freeze([
  { id: 'net_jurong', name: 'Jurong Point Branch', archetype: 'Heartland Store', cost: 8000, passiveIncome: 420, repBonus: 2, desc: 'Steady West-side residential traffic (+$420/day, +2 Rep).' },
  { id: 'net_tampines', name: 'Tampines Regional Hub', archetype: 'Regional Mall', cost: 14000, passiveIncome: 780, repBonus: 4, desc: 'Heavy East-side family & weekend footfall (+$780/day, +4 Rep).' },
  { id: 'net_raffles', name: 'Raffles Place Express', archetype: 'CBD Express', cost: 19000, passiveIncome: 1120, repBonus: 5, desc: 'Intense lunchtime executive accessories rush (+$1,120/day, +5 Rep).' },
  { id: 'net_orchard', name: 'ION Orchard Boutique', archetype: 'Lifestyle Mall', cost: 28000, passiveIncome: 1650, repBonus: 8, desc: 'High-margin flagship & audio shoppers (+$1,650/day, +8 Rep).' },
  { id: 'net_dhoby', name: 'Dhoby Ghaut MRT Hub', archetype: 'Transit Interchange', cost: 35000, passiveIncome: 2150, repBonus: 10, desc: 'Triple-line MRT commuter surge (+$2,150/day, +10 Rep).' }
]);

export const RESEARCH = Object.freeze([
  { id: 'pos', name: 'Contactless PayNow & NFC POS', cost: 25, cash: 650, unlock: 6, description: 'Both checkouts process purchases 25% faster. Cuts queue walkouts during peak rushes.' },
  { id: 'bundles', name: 'Smarter Bundle Demos & ESL', cost: 25, cash: 750, unlock: 6, description: 'Accessory bundle attachment rises from 42% to 68% (+$39 per bundle) when Accessories are within 4 tiles.' },
  { id: 'reorder', name: 'Predictive ERP Auto-Supply', cost: 40, cash: 1000, unlock: 6, description: 'Every display gains +3 capacity and Ben/Chloe can trigger discounted supplier standing orders automatically.' },
  { id: 'routing', name: '24/7 Smart Parcel Lockers & Dispatch', cost: 45, cash: 1100, unlock: 7, description: 'Standard supplier deliveries take 20s instead of 35s, and Click & Collect orders pay +25% more.' }
]);

export const PRODUCTS = Object.freeze({
  mobile: {
    name: 'Mobile',
    fixture: 'Smartphone Island Display',
    category: 'Mobile',
    price: 249,
    cost: 205,
    capacity: 5,
    build: 450,
    unlock: 1,
    w: 2,
    h: 1,
    xp: 10,
    color: '#79b8ca',
    icon: '📱',
    atlasGroup: 'fixtures',
    atlasIndex: 0,
    description: 'Location-matched island display for smartphones & tablets. Your high-footfall anchor.'
  },
  mobile_compact: {
    name: 'Phone Pod',
    fixture: 'Compact Phone Pod',
    category: 'Mobile',
    price: 229,
    cost: 188,
    capacity: 3,
    build: 220,
    unlock: 2,
    w: 1,
    h: 1,
    xp: 9,
    color: '#60a5fa',
    icon: '📲',
    atlasGroup: 'fixturesExtra',
    atlasIndex: 0,
    description: 'Compact 1×1 single-tile phone pedestal—fits into tight corners while keeping margins healthy.'
  },
  computing: {
    name: 'Computing',
    fixture: 'Computing Display',
    category: 'Computing',
    price: 649,
    cost: 550,
    capacity: 5,
    build: 1100,
    unlock: 2,
    w: 2,
    h: 1,
    xp: 16,
    color: '#9e91c5',
    icon: '💻',
    atlasGroup: 'fixtures',
    atlasIndex: 1,
    description: 'Ultrabooks & creator laptops. High basket value; pairs with nearby Accessories for +$39 bundles.'
  },
  accessories: {
    name: 'Accessories',
    fixture: 'Accessories & Cases Rack',
    category: 'Accessories',
    price: 39,
    cost: 25,
    capacity: 12,
    build: 600,
    unlock: 3,
    w: 2,
    h: 1,
    xp: 7,
    color: '#e1b56c',
    icon: '🔌',
    atlasGroup: 'fixtures',
    atlasIndex: 4,
    description: 'GaN chargers, USB-C hubs & cases. Attaches +$39 bundle sales when placed within 4 tiles of main tables!'
  },
  gaming: {
    name: 'Gaming',
    fixture: 'Gaming & RGB Rig Showcase',
    category: 'Gaming',
    price: 179,
    cost: 140,
    capacity: 6,
    build: 1700,
    unlock: 4,
    w: 2,
    h: 1,
    xp: 22,
    color: '#cb8299',
    icon: '🎮',
    atlasGroup: 'fixtures',
    atlasIndex: 2,
    description: '240Hz monitors, mechanical keyboards & RGB PC rigs. Huge draw on weekends & School Holidays.'
  },
  online_station: {
    name: 'Click & Collect',
    fixture: 'Click & Collect Packing Desk',
    category: 'Fulfilment',
    isSupport: true,
    price: 275,
    cost: 145,
    capacity: 8,
    build: 420,
    unlock: 4,
    w: 2,
    h: 1,
    xp: 18,
    color: '#38bdf8',
    icon: '📦',
    atlasGroup: 'fixturesExtra',
    atlasIndex: 1,
    description: 'Dedicated omnichannel counter that boosts Click & Collect payouts (+20%) and enables automatic packing from the matching department stock.'
  },
  audio: {
    name: 'Audio',
    fixture: 'Smart Audio & Listening Bar',
    category: 'Lifestyle',
    price: 129,
    cost: 100,
    capacity: 6,
    build: 1400,
    unlock: 5,
    w: 2,
    h: 1,
    xp: 18,
    color: '#80b998',
    icon: '🎧',
    atlasGroup: 'fixtures',
    atlasIndex: 3,
    description: 'ANC headphones, studio monitors & portable speakers for commuters and audiophiles.'
  },
  stock_shelf: {
    name: 'Stock Rack',
    fixture: 'Backroom Smart Stock Rack',
    category: 'Logistics',
    isSupport: true,
    price: 189,
    cost: 95,
    capacity: 14,
    build: 340,
    unlock: 5,
    w: 2,
    h: 1,
    xp: 12,
    color: '#94a3b8',
    icon: '🏭',
    atlasGroup: 'fixturesExtra',
    atlasIndex: 3,
    description: 'Backroom logistics fitting. Reduces restock costs by 10%; all products still require their own paid stock.'
  },
  tv_audio_wall: {
    name: 'Home Theatre',
    fixture: '4K OLED & Soundbar Showcase',
    category: 'Lifestyle',
    price: 720,
    cost: 590,
    capacity: 5,
    build: 850,
    unlock: 6,
    w: 2,
    h: 1,
    xp: 28,
    color: '#f59e0b',
    icon: '🖥️',
    atlasGroup: 'fixturesExtra',
    atlasIndex: 5,
    description: 'Flagship widescreen 4K OLED displays & Dolby Atmos soundbars for premium home upgrades.'
  },
  service_desk: {
    name: 'Tech Service',
    fixture: 'Tech Repair & Setup Bar',
    category: 'Service',
    price: 185,
    cost: 110,
    capacity: 8,
    build: 620,
    unlock: 7,
    w: 2,
    h: 1,
    xp: 24,
    color: '#34d399',
    icon: '🔧',
    atlasGroup: 'fixturesExtra',
    atlasIndex: 2,
    description: 'High-margin PC assembly, warranty diagnostics & laptop setup bar. Ravi boosts payouts by +35%!'
  },
  decor_plant: {
    name: 'Indoor Planter',
    fixture: 'Tropical Monstera Planter',
    category: 'Cosmetic',
    price: 0,
    cost: 0,
    capacity: 0,
    build: 110,
    unlock: 2,
    w: 1,
    h: 1,
    xp: 10,
    isDecor: true,
    patienceBonus: 6,
    ratingBonus: 0.15,
    color: '#4ade80',
    icon: '🪴',
    atlasGroup: 'fixtures',
    atlasIndex: 7,
    description: '1×1 lush indoor palm planter that calms shopper queue impatience (+6s) and boosts Store Rating.'
  },
  decor_totem: {
    name: 'Promo Totem',
    fixture: 'Digital Promo Totem Pillar',
    category: 'Cosmetic',
    price: 0,
    cost: 0,
    capacity: 0,
    build: 180,
    unlock: 3,
    w: 1,
    h: 1,
    xp: 12,
    isDecor: true,
    trafficBonus: 0.12,
    ratingBonus: 0.2,
    color: '#22d3ee',
    icon: '✨',
    atlasGroup: 'fixturesExtra',
    atlasIndex: 4,
    description: '1×1 glowing cyan Challenger digital signage pillar that attracts +12% more walk-in shoppers!'
  }
});

export const PEOPLE = Object.freeze([
  { id: 'student', name: 'Poly / JC Student', quote: 'Need USB-C charger & earbuds also!', patience: 44, color: '#667f9f', likes: 'accessories', budget: 280 },
  { id: 'neighbour', name: 'Toa Payoh Neighbour', quote: 'Boss, this phone got stock?', patience: 50, color: '#dcb26e', likes: 'mobile', budget: 350 },
  { id: 'office_worker', name: 'CBD Office Executive', quote: 'Need a featherlight laptop for MRT.', patience: 34, color: '#6a9a91', likes: 'computing', budget: 680 },
  { id: 'gamer', name: 'PC & Console Gamer', quote: 'Wah, 240Hz RGB rig very shiok!', patience: 42, color: '#8e86ad', likes: 'gaming', budget: 720 },
  { id: 'tech_enthusiast', name: 'Early Adopter Geek', quote: 'Testing the ANC headphones!', patience: 38, color: '#bb8464', likes: 'audio', budget: 950 },
  { id: 'parent', name: 'Weekend Family Parent', quote: 'Buying tablet & router for home.', patience: 54, color: '#8bad73', likes: 'mobile', budget: 600 },
  { id: 'bargain_hunter', name: 'Heartland Lobang Hunter', quote: 'Got ValueClub member promo?', patience: 52, color: '#c4a05d', likes: 'accessories', budget: 260 },
  { id: 'premium_shopper', name: 'Orchard Lifestyle Shopper', quote: 'Looking at the 4K OLED soundbar.', patience: 36, color: '#c97a8e', likes: 'tv_audio_wall', budget: 1450 },
  { id: 'sme_buyer', name: 'Small-Business Owner', quote: 'Need office monitors & setup.', patience: 40, color: '#5c88a8', likes: 'computing', budget: 1600 },
  { id: 'photographer', name: 'Visual Content Creator', quote: 'Need colour-accurate laptop & SSD.', patience: 42, color: '#a57c65', likes: 'computing', budget: 980 },
  { id: 'senior', name: 'Retiree Uncle / Auntie', quote: 'Girl ah, help me setup new phone?', patience: 58, color: '#7a9e7e', likes: 'service_desk', budget: 340 },
  { id: 'valueclub', name: 'Loyal ValueClub Member', quote: 'Accumulating rebates on tech!', patience: 48, color: '#4d7ea8', likes: 'gaming', budget: 820 }
]);

export const SPECIAL_CUSTOMERS = Object.freeze([
  { id: 'vip_member', name: 'Titanium VIP Member', icon: '👑', quote: 'Top-spec flagship setup today!', likes: 'tv_audio_wall', bonusCash: 180, bonusRep: 5, palette: 'd4af37' },
  { id: 'pro_gamer', name: 'SG Esports Champion', icon: '🏆', quote: 'Tournament qualifiers tonight—need pro gear!', likes: 'gaming', bonusCash: 160, bonusRep: 6, palette: '9b5de5' },
  { id: 'creator', name: 'Tech YouTuber / Streamer', icon: '🎬', quote: 'Filming a Challenger Secret Shopper vlog!', likes: 'computing', bonusCash: 150, bonusRep: 7, palette: 'f15bb5' },
  { id: 'corporate_buyer', name: 'Changi Corporate Buyer', icon: '🏢', quote: 'Bulk ultrabooks & hubs for regional HQ!', likes: 'computing', bonusCash: 240, bonusRep: 8, palette: '00bbf9' },
  { id: 'collector', name: 'Launch Collector', icon: '💎', quote: 'Here for the day-one collector edition!', likes: 'mobile', bonusCash: 170, bonusRep: 6, palette: '00f5d4' },
  { id: 'tech_reviewer', name: 'Hardware Editor', icon: '📝', quote: 'Evaluating store layout, stock & service!', likes: 'service_desk', bonusCash: 140, bonusRep: 9, palette: '4ade80' }
]);

export const RECURRING_REGULARS = Object.freeze([
  {
    id: 'reg_weijie',
    name: 'Wei Jie (Poly Student)',
    kind: 0,
    stages: [
      { item: 'Budget Earbuds', likes: 'accessories', quote: 'First semester at Poly! Getting $59 earbuds first.' },
      { item: 'Wireless Gaming Mouse', likes: 'gaming', quote: 'Saved up from part-time work for a gaming mouse!' },
      { item: '27-inch Coding Monitor', likes: 'computing', quote: 'Final Year Project time—need a proper monitor!' },
      { item: 'Creator Laptop Pro', likes: 'computing', quote: 'Graduated & landed my first dev job! Flagship laptop time!' }
    ]
  },
  {
    id: 'reg_mdmtan',
    name: 'Mdm Tan (Toa Payoh Regular)',
    kind: 10,
    stages: [
      { item: 'Fast Charging Cable', likes: 'accessories', quote: 'Girl ah, got same oval charging cable as this one?' },
      { item: 'Large-Screen Smartphone', likes: 'mobile', quote: 'Your staff so patient—I upgrade my phone here!' },
      { item: '4K Smart Living Room TV', likes: 'tv_audio_wall', quote: 'For my grandchildren photos & weekend dramas!' }
    ]
  },
  {
    id: 'reg_faris',
    name: 'Faris (Indie Game Dev)',
    kind: 3,
    stages: [
      { item: 'Tactile Mechanical Keyboard', likes: 'gaming', quote: 'Building my first indie game—need tactile switches!' },
      { item: 'Dual Monitor Hub & SSD', likes: 'accessories', quote: 'Steam wishlists climbing—upgrading my dev desk!' },
      { item: 'Flagship Dev Workstation', likes: 'computing', quote: 'Our game launched! Back at Challenger for the full rig!' }
    ]
  }
]);

export const CUSTOMER_REQUESTS = Object.freeze([
  {
    id: 'req_laptop',
    name: 'CBD Consultant (MRT Commuter)',
    question: '“I commute daily on the MRT to Raffles Place and need a laptop with 18-hour battery life under 1.1kg. What do you recommend?”',
    options: [
      { text: '13-inch Featherlight Ultrabook (1.0kg, 18h battery)', cash: 220, rep: 4, xp: 25, reply: '“Perfect match! So light I won’t even feel it on the MRT!”' },
      { text: '15-inch Mainstream Office Notebook (1.8kg)', cash: 90, rep: 1, xp: 12, reply: '“Decent specs, though a bit heavier than I hoped.”' },
      { text: '17-inch Dual-Brick Gaming Monster (3.2kg)', cash: 0, rep: 0, xp: 5, reply: '“Boss, my shoulder will break carrying this on the train!”' }
    ],
    answer: 0
  },
  {
    id: 'req_uncle',
    name: 'Uncle Lim (5 mins before closing)',
    question: '“Boss ah, my phone charge very slow! I don’t know the model, only know the charging hole is oval shape one!”',
    options: [
      { text: 'Check his port + 30W USB-C GaN Fast Charger Bundle', cash: 140, rep: 4, xp: 22, reply: '“Wah, steady lah! Charge so fast now, thank you ah!”' },
      { text: 'Basic 5W USB-A Cable Only', cash: 60, rep: 1, xp: 10, reply: '“Can charge lah, safe choice.”' },
      { text: '140W MacBook MagSafe Power Brick', cash: 0, rep: 0, xp: 5, reply: '“Aiyo, this magnetic plug cannot fit my phone lah!”' }
    ],
    answer: 0
  },
  {
    id: 'req_esports',
    name: 'Poly Esports Team Captain',
    question: '“Tournament qualifiers tonight! I need zero motion blur for competitive FPS under $750. Which setup should I grab?”',
    options: [
      { text: '27-inch 240Hz IPS Gaming Monitor + 54g Wireless Mouse', cash: 260, rep: 5, xp: 30, reply: '“Silky smooth 240Hz—confirm rank up tonight!”' },
      { text: '24-inch 144Hz Entry Gaming Monitor', cash: 110, rep: 2, xp: 15, reply: '“Solid value, gets the job done.”' },
      { text: '32-inch 60Hz 4K Office Monitor', cash: 0, rep: 0, xp: 5, reply: '“60Hz for competitive Valorant?! Cannot lah Boss!”' }
    ],
    answer: 0
  },
  {
    id: 'req_traveller',
    name: 'Changi Transit Traveller',
    question: '“My 14-hour flight boards at Terminal 3 in 35 minutes! What flight essentials should I pick up right now?”',
    options: [
      { text: 'ANC Headphones + 20,000mAh Cabin-Safe Power Bank + Travel Adapter', cash: 240, rep: 5, xp: 28, reply: '“Lifesaver before my flight at T3! Thank you!”' },
      { text: 'Wired Earphones + Basic Wall Plug', cash: 95, rep: 2, xp: 12, reply: '“At least I have audio for the flight.”' },
      { text: 'Desktop Home Theatre Subwoofer', cash: 0, rep: 0, xp: 5, reply: '“How to fit a subwoofer in overhead cabin baggage?!”' }
    ],
    answer: 0
  }
]);

export const STAFF = Object.freeze([
  { id: 'jamie', name: 'Jamie Tan', role: 'Cashier', trait: 'Fast Learner · Patient', cost: 450, wage: 55, unlock: 2, shirt: '2b8a6e', description: 'Checkout takes 2.4s instead of 5s. Operates Till 02 when opened.', branches: { speed: 'Fast Service (1.7s checkout)', care: 'Customer Care (+12s queue patience)' } },
  { id: 'aisha', name: 'Aisha Rahman', role: 'Sales Specialist', trait: 'Upselling Pro · Warm', cost: 520, wage: 85, unlock: 3, shirt: '2563eb', description: 'Helps shoppers on the floor: faster browsing and +20% bundle attachment.', branches: { speed: 'Laptop Specialist (+20% Computing/OLED price)', care: 'Accessory Maestro (+65% bundle rate)' } },
  { id: 'ben', name: 'Ben Lim', role: 'Stockroom Staff', trait: 'Organised · Tech Nerd', cost: 480, wage: 75, unlock: 4, shirt: 'd97706', description: 'Restocks low displays automatically every 7s if cash allows, and keeps the shop running offline.', branches: { speed: 'Express Trolley (4.5s auto-restock)', care: 'Omnichannel Packer (Auto-packs Online Orders)' } },
  { id: 'ravi', name: 'Ravi Kumar', role: 'Technician', trait: 'PC Builder · Diagnostics Pro', cost: 680, wage: 105, unlock: 6, shirt: '7c3aed', description: 'Boosts Tech Repair & Setup Bar and Gaming Showcase payouts by +25%.', branches: { speed: 'Express Diagnostics (+35% Service payout)', care: 'Esports Rig Tuner (+25% Gaming & Audio value)' } },
  { id: 'hock', name: 'Uncle Hock', role: 'Security & Greeter', trait: 'Calm · Veteran Regular', cost: 600, wage: 90, unlock: 8, shirt: '0891b2', description: 'Welcomes shoppers at the entrance, adding +15s patience and smoothing crowd flow.', branches: { speed: 'Queue Marshal (+20% shopper walk speed)', care: 'VIP Greeter (2× Special VIP customer visits)' } },
  { id: 'chloe', name: 'Chloe Wong', role: 'Store Manager', trait: 'All-Rounder Leader', cost: 1250, wage: 160, unlock: 10, shirt: 'be185d', description: 'Store-wide leadership: +15% checkout speed and -15% restock costs across all displays.', branches: { speed: 'Operations Excellence (-25% restock & van cost)', care: 'Flagship Prestige (+30% XP & Reputation gain)' } }
]);

export const EVENTS = Object.freeze([
  { id: 'ordinary', name: 'Normal Trading Day', description: 'A steady stream of Singapore mall neighbours.', traffic: 1.0, spend: 1.0, category: null },
  { id: 'payday', name: 'Payday Weekend', description: 'End-of-month payday! +40% footfall and higher flagship baskets.', traffic: 1.4, spend: 1.2, category: 'tv_audio_wall' },
  { id: 'holidays', name: 'MOE School Holidays', description: 'Students & families pack the mall looking for Gaming & Audio gear.', traffic: 1.35, spend: 1.1, category: 'gaming' },
  { id: 'it_show', name: 'Singapore IT Show Week', description: 'Island-wide laptop and monitor fever! Keep Computing stocked.', traffic: 1.45, spend: 1.2, category: 'computing' },
  { id: 'comex', name: 'COMEX Tech Frenzy', description: 'Major electronics rush across all departments—keep cashiers ready!', traffic: 1.6, spend: 1.25, category: 'computing' },
  { id: 'launch', name: 'Flagship Phone Launch', description: '“Got stock? Got stock?” Massive Mobile & Accessories demand!', traffic: 1.55, spend: 1.25, category: 'mobile' },
  { id: 'mrt', name: 'Nearby MRT Track Fault', description: 'Slightly fewer walk-ins, but stranded commuters buy chargers & power banks!', traffic: 0.82, spend: 1.1, category: 'accessories' },
  { id: 'cny', name: 'CNY Mall Festivities', description: 'Lion dance drums in the atrium! High family & home theatre spending.', traffic: 1.45, spend: 1.25, category: 'tv_audio_wall' },
  { id: 'ndp', name: 'National Day Red & White Sale', description: 'SG festive celebrations! +40% traffic and bonus Reputation.', traffic: 1.4, spend: 1.2, category: 'mobile' }
]);

export const PROMOTIONS = Object.freeze([
  { id: 'flyer', name: 'Mall Flyer Campaign', cost: 220, duration: 90, traffic: 1.45, priceMult: 0.92, cat: null, desc: '+45% footfall for 90s across all departments (-8% promo discount).' },
  { id: 'laptop_wknd', name: 'Notebook & Creator Fair', cost: 280, duration: 90, traffic: 1.55, priceMult: 0.95, cat: 'computing', desc: '+55% Computing & Home Theatre rush for 90s!' },
  { id: 'gaming_arena', name: 'Esports Peripherals Drop', cost: 300, duration: 90, traffic: 1.6, priceMult: 0.95, cat: 'gaming', desc: '+60% Gaming & Audio traffic surge for 90s!' },
  { id: 'bundle_mania', name: 'ValueClub Bundle Mania', cost: 200, duration: 90, traffic: 1.35, priceMult: 1.0, cat: 'accessories', desc: 'Guarantees 80% Accessory bundle attachment for 90s!' }
]);

export const COSMETICS = Object.freeze([
  { id: 'floor_default', name: 'Jewel Warm Stone (Default)', cost: 0, tint: null, stroke: null, desc: 'Original hand-illustrated warm polished stone floor.' },
  { id: 'floor_wood', name: 'Peranakan Boutique Teak', cost: 450, tint: 'rgba(180, 124, 72, 0.26)', stroke: 'rgba(120, 74, 34, 0.22)', desc: 'Warm timber floor finish that adds cosy boutique charm.' },
  { id: 'floor_dark', name: 'Cyber Dark Slate', cost: 650, tint: 'rgba(22, 38, 56, 0.38)', stroke: 'rgba(56, 189, 248, 0.22)', desc: 'Sleek dark flagship flooring with subtle cyan grid accents.' },
  { id: 'floor_marble', name: 'Changi Crystal Terrazzo', cost: 900, tint: 'rgba(224, 242, 254, 0.25)', stroke: 'rgba(56, 189, 248, 0.28)', desc: 'Luminous cool terrazzo finish inspired by Jewel Changi.' }
]);

export const GOALS = Object.freeze([
  { id: 'first', title: 'The first of many', description: 'Complete your very first Challenger sale.', metric: 'sales', target: 1, reward: 150 },
  { id: 'ten', title: 'Getting the hang of it', description: 'Serve 10 happy customers.', metric: 'sales', target: 10, reward: 350 },
  { id: 'variety', title: 'A little more choice', description: 'Open 2 distinct product departments.', metric: 'departments', target: 2, reward: 500 },
  { id: 'team', title: 'Not doing this alone', description: 'Hire your first Challenger teammate.', metric: 'staff', target: 1, reward: 350 },
  { id: 'bundles', title: 'Need casing also?', description: 'Trigger 5 Accessory bundle attachments.', metric: 'bundles', target: 5, reward: 550 },
  { id: 'four_depts', title: 'Full-line electronics store', description: 'Operate 4 different fixture types on your floor.', metric: 'departments', target: 4, reward: 900 },
  { id: 'hundred', title: 'Neighbourhood favourite', description: 'Complete 100 customer purchases.', metric: 'sales', target: 100, reward: 1500 },
  { id: 'flagship', title: 'The bigger picture', description: 'Reach Store Level 10.', metric: 'level', target: 10, reward: 2500 }
]);

// Familiar first sale, then measured unlocks over several trading days.
export const nextXP = level => level * level * 60;
export const levelFor = xp => Math.min(50, 1 + Math.floor(Math.sqrt(Math.max(0, xp) / 60)));

export const capacity = (fixture, researched = []) => {
  const def=PRODUCTS[fixture.type];
  const base = def?.isSupport ? 0 : def?.capacity || 0;
  if (base === 0) return 0;
  return base + (fixture.level - 1) * 3 + (researched.includes('reorder') ? 3 : 0);
};

export const money = value => '$' + Math.round(value).toLocaleString('en-SG');
