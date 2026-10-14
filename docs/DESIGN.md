# Design notes and release boundaries

## The experience

The first session should move from curiosity to understanding, then to a small success and an independent decision. A customer walks in, buys, and leaves a visible gap in stock. Restocking solves a problem the player has seen. Upgrades compete with working capital. A new department creates a different cash/volume strategy, rather than another currency.

This is an implementation hypothesis, not validated player research. The balance needs observation with new players before additional layers are added.

## Focused research used

The sources below grounded the design and technical approach. Design choices are our interpretation of their principles, not copied systems or a claim that academic models guarantee fun.

- [Hunicke, LeBlanc and Zubek: MDA](https://aaai.org/papers/ws04-04-001-mda-a-formal-approach-to-game-design-and-game-research/): connect mechanics, emergent dynamics and intended experience. Here, stock cost and queue pressure should produce satisfying operational decisions.
- [Przybylski, Rigby and Ryan: A Motivational Model of Video Game Engagement](https://selfdeterminationtheory.org/SDT/documents/2010_PrzybylskiRigbyRyan_ROGP.pdf): competence, autonomy and intuitive controls informed simple onboarding, player-chosen departments and explicit move mode.
- [Nintendo: Harvest Moon, Friends of Mineral Town](https://www.nintendo.com/en-gb/Games/Game-Boy-Advance/Harvest-Moon-Friends-of-Mineral-Town-266859.html): a handheld life-simulation reference for daily rhythm and attachment to a small place.
- [Nintendo: The Minish Cap](https://www.nintendo.com/en-gb/Games/Game-Boy-Advance/The-Legend-of-Zelda-The-Minish-Cap-267486.html) and [Pokémon Emerald](https://www.nintendo.com/en-gb/Games/Game-Boy-Advance/Pokemon-Emerald-Version-267112.html): broad era references for compact readable worlds and character silhouettes. No assets, maps, interface layouts or music are extracted or reproduced.
- [Meteorological Service Singapore: Climate of Singapore](https://www.weather.gov.sg/climate-climate-of-singapore/): tropical rain and common afternoon showers informed rainy-day ambience. Rain changing store footfall and online orders is a fictional gameplay assumption, not an empirical retail forecast.
- [web.dev: Service workers](https://web.dev/learn/pwa/service-workers): offline caching and lifecycle guidance for the installable package.

Research into cognitive load, flow, telemetry-assisted balancing and multi-week progression should continue during playtesting. This initial research pass does not exhaust the master brief’s research agenda.

## Art and animation direction (updated)

The user superseded the original GBA/pixel-art requirement with **contemporary cozy illustrated 2.5D**. Game-design research about agency, daily rhythm and touch remains relevant; the prior handheld references no longer define the artwork.

The world uses smooth high-DPI Canvas rendering, a warm cutaway shop, soft shadows, maple-and-cream fixtures, coral signage, tropical plants and HDB surroundings. `assets/shop-atlas.png` is an original generated asset atlas made specifically for this game, with no third-party sprite packs. The renderer selects known crop rectangles from the atlas at runtime. Iconography and the SVG install icon are hand-authored locally.

Characters use a procedural rig with independent legs, arms, torso and head. Front-facing head illustrations come from the original atlas; back/side treatment and pose articulation come from the rig. There are walking strides, subtle idle motion, browsing/reaching and cashier scan poses. The current rig is lightweight 2D articulation inside a 2.5D environment, not a full skeletal 3D character system or a bespoke frame-by-frame animation set. The avatar variants and motion can be refined further with player feedback.

Deliveries trigger a stock van arriving at the frontage and upgrades trigger a restrained display bounce. Reduced motion removes decorative articulation, weather streaks, arrival movement and bounce while retaining stock changes, text and selection. Rendering quality never changes the economy.

The underlying navigation grid remains integer tile-based. The renderer now maps a tile to 72 world units; camera pan/zoom and touch placement use that renderer tile size. Art smoothing is enabled; pixel filtering and hard retro menu ornament were removed.

## Audio bible

“Block One Morning” is an original 32-step melody with a slower bass pattern, played with Web Audio triangle/pulse-like tones. The opening chime, purchase cue and level fanfare are newly synthesised. No proprietary recordings, samples or transport announcements are used.

The opening release uses one tune; morning/rush/rain/closing themes and richer percussion are deferred. Music is off initially and optional. Important events also have text or visual feedback.

## Economy

Phones sell for $249 and cost $155 to replenish. Initial five-unit inventory is already owned. Cash receipts are gross sales; the daily report separately includes stock purchases, hiring, upgrades and wages as cash outflows. Cash flow is not a full accrual profit-and-loss statement.

Premium raises selling price but rejects some budget shoppers. Budget lowers prices and avoids that premium rejection; it does not yet introduce a fully demand-elastic market. Accessory attachment depends on distance and available stock. Promotion traffic costs working capital and lowers sale prices.

The level curve is `1 + floor(sqrt(XP / 60))`, capped at 50. Level jumps in debug tools are accelerated test fixtures. Real early-session timing, strategy balance and endgame longevity still need playtests.

## Implemented depth

Inventory interacts with cash, promotions, online orders and department adjacency. Staff interact with queues, cash/wages, browsing, offline work and development. Weather interacts with traffic and orders. Layout affects routes and bundle eligibility. Daily reports identify stock/queue losses. Milestones offer direction without marketing chores.

Queue customers now have distinct reserved positions and two independently served lanes. Other browsing/moving customers can still visually overlap; this version does not have general crowd collision, multiple service zones or an advanced congestion model. The pacing director is a lightweight traffic rhythm and recovery adjustment, not the complete dramatic event director described in the source brief.

## Next releases

1. Observe new players for 15 minutes, without coaching. Tune the first stock gap and strategic fork.
2. Test returning staffed/unattended shops and daily report clarity.
3. Playtest the implemented second checkout and visible queue layout before adding general crowd congestion.
4. Playtest the implemented research/automation and delivery tradeoffs, then expand customer-specific recommendations.
5. Add repairs and supplier strategy only once their interactions improve the core loop.
6. Build varied locations, long-term prestige and a multi-store network with distinct operating conditions.
7. Expand original art, seasonal Singapore content, recurring staff/customer stories and the soundtrack.
8. Add a native/cloud account save service and a secure optional marketing event console.
9. Consider real rewards only after the standalone game earns return desire; reward authority remains on the backend.

No real-world reward is necessary to play. No task requires sharing, browsing the real store, purchasing products or opening a campaign.

## Supplier and research decisions

Shipment cost is charged when ordered, and pending quantities reserve capacity. Standard deliveries discount per-unit cost by 12% (rounded); express costs 15% more (rounded). Research changes service time, attachment probability, reorder automation or standard ETA. Existing shipments are not retrospectively repriced or sped up. Both live and offline trading use the same operations logic.

Two tills add throughput but increase stock pressure. They do not add free revenue or ignore inventory. Jamie moves to the second till, while the owner covers the original; there is no second wage charge. The visible queue system is bounded to ten positions per lane. If all positions are full, the shopper leaves with an understandable queue loss.
