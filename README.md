# Challenger Store Tycoon

A playable, animated, offline-first PWA of a Singapore electronics shop in a Jewel-inspired mall. Start with one phone display, serve the neighbourhood, and decide how your shop grows. All money is **fictional Store Cash**. No account, payment, loyalty task or energy gate is needed.

## Release 1.9.2: camera stays inside the mall

Pan, scroll and zoom stop at the illustrated environment edges. The minimum zoom fills both viewport dimensions, with bounds reapplied during smooth zooms, resizing and orientation changes.

The graphics now use a shared floor projection, explicit scenery layers and solid foreground silhouettes, native pixel character poses, depth-based size rules and a flowing water material. Walking sprites are smaller, customer and employee artwork stay separate, and all views use one native pixel unit. Stable crown anchors remove frame-height bouncing; the side cycle excludes frames that lose the customer’s bag. The cashier stands further behind the counter with the upper body visible. The entire three-tenant beam now uses the front column boundaries. Challenger’s sign connects to two matching posts down to the floor; the adjacent wood and ivory signs fit the remaining spans. Gameplay and save format are unchanged.

- Characters use the exact supplied `character-atlas.png` artwork, with compatible directional walk poses. The renderer preserves each view’s scale and anchors frames by the head centre and foot baseline. Actual row separators prevent the old walk sheet from cutting off feet or including pixels from a neighbouring frame. Outfit palette changes preserve the head artwork.
- Furniture width follows its actual two-cell footprint and keeps the image’s aspect ratio. Characters and fixtures share a bounded depth scale; near-camera growth is capped.
- An analytical annular water curtain uses advected noise strands and an accelerated falling profile. It begins at the inner oculus lip, with an eased supply cycle and top-to-bottom draining. No waterfall PNG is loaded. The oculus rim, guideways and foreground garden cover it in the correct order. WebGL renders the material; Canvas 2D provides a fallback. Both train services, the water and corridor passers follow the selected 1×/2×/3× speed. Camera easing stays at normal speed.
- Near and far trains use separate sizes, the complete three-car image keeps its proportions, and running wheels align to the guideway. Foreground foliage and bridge faces occlude passing trains.
- Challenger’s charcoal fascia and cyan strip stop at its two tenant boundaries. The cafe and fashion shop have different fascias and their own signs.

See `docs/GRAPHICS_REBUILD.md` for research sources, implementation decisions and validation limits. Phone and desktop rendering, visible train occlusion, texture motion, placement and offline loading are checked. Physical-device testing remains outstanding.

## Put it on GitHub Pages

1. Unzip the package.
2. Create a GitHub repository, for example `challenger-store-tycoon`.
3. Upload the **contents of the `challenger-store-tycoon` folder** into the repository root. `index.html`, `style.css`, `manifest.webmanifest`, `sw.js`, `game-theme.css`, `src/`, `assets/`, and `icons/` must be at the top level. Do not upload the ZIP itself or put the entire enclosing folder inside another folder.
4. Open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, select **main**, and choose **/(root)**. Save.
5. Once GitHub finishes publishing, open `https://YOUR-USERNAME.github.io/challenger-store-tycoon/`.

Everything uses relative URLs, so repository subpaths and custom domains both work. The game has **no build step, CDN dependency or production package installation**.

An optional `.github/workflows/pages.yml` is included. To use that instead, upload the hidden `.github` directory too and set the Pages source to **GitHub Actions**. Choose either branch deployment or the workflow, not both.

GitHub may restrict Pages availability for private repositories depending on your account plan. A public Pages URL allows anyone with the URL to play; it is not an authenticated member experience.

## Install on a phone or tablet

- **iPhone / iPad:** open the published URL in Safari, use Share → Add to Home Screen. Browser menu wording can vary.
- **Android:** open in Chrome and use the browser’s Install app / Add to Home screen action.
- **Desktop Chromium:** use the browser install button or the install option in game settings.

Visit once online and let the game finish loading before relying on offline play. The manifest includes ordinary and maskable icons; the service worker caches the entire game, including the JavaScript modules. HTTPS is required outside localhost. Double-clicking `index.html` is not a supported way to run an ES-module PWA.

## Play

1. Tap **Open the store**. The first customer buys a phone within about 45 seconds at normal speed.
2. Tap the phone display. **Restock** buys as many units as your cash allows; **Upgrade** increases capacity by three.
3. Use **Goals** to collect completed shop milestones.
4. At level 3, choose Computing or strengthen Mobile, and hire your first teammate.
5. Enter **Build**, choose a display, drag its preview to a clear spot, then confirm. A green outline means routes remain open. Moving furniture is an explicit action; dragging empty floor pans the camera.
6. Computing and Gaming can attach an accessory sale when an Accessories display is within four tiles and has stock.
7. At level 5, click-and-collect orders and promotions add pressure. Orders use the same inventory as your store.
8. Trading days last eight real minutes at 1× speed. Wages are charged at closing. The report points out whether stock or queues cost you sales.

Drag to pan; pinch or use +/− to zoom; use the centre button to reset the camera. Arrow keys pan the focused canvas. Every display also has a labelled button in the Shop menu, so inspecting tiny sprites is optional.

Phones are portrait-first. Tablets and unfolded screens support both orientations. All screens use a compact action tray and contextual management windows. The browser PWA does not force an orientation lock.

## What is included

- Original detailed illustrated mall scene and transparent fixture atlas, created for this game; reference-style pixel characters.
- Directional walk cycles, continuous corridor arrivals/departures, passing mall shoppers, browsing/reaching, cashier service, waterfall movement and delivery feedback.
- Two checkouts with distinct queue slots and route/wait-aware lane choices.
- Standard discounted deliveries, express deliveries and capacity reservations.
- Four research projects, earned research points, and Aisha’s configurable reorder policy.
- Customer browsing, walkable tile routes, checkout queues, impatience, purchases and lost sales.
- Five progressively unlocked departments: Mobile, Computing, Accessories, Gaming and Audio.
- Cash, stock costs, display upgrades, positioning strategies, accessory attachment and three floor expansions.
- Three staff members with daily wages, XP and speed/customer-care training.
- Singapore events, payday/weekend demand, phone launches, COMEX season and rainy-day footfall shifts.
- Shared-stock online orders, promotions, customer discovery, occasional product recommendation requests, milestones and daily reports.
- An original optional synthesised music loop and action sounds. Audio starts only after interaction. Music, SFX and haptics have separate switches.
- Versioned local saves, validated import/export, corrupt-save recovery, background handling and staffed offline simulation capped at four hours.
- Reduced motion, stronger contrast, larger panel text, low-detail weather mode and touch targets separated from sprite size.
- An install manifest, offline cache, GitHub Pages workflow and opt-in debug tools.

## Honest release scope

This is a **substantial playable first release**, not the completed 187-section production roadmap. Later releases still need repairs, more advanced supplier contracts, multiple-store network/postgame, richer staff stories, cosmetics, seasonal content, expanded requests and late-game prestige balancing. The music is one original loop with SFX, rather than the proposed multi-theme soundtrack. No real vouchers, cashback, CRM backend, cloud sync, account service or marketing console is connected.

This release passes automated Chromium layout and gameplay checks. Real iOS Safari/Android devices, hardware folding transitions, battery/thermal testing, long-session balancing and new-player playtesting remain release gates before putting this inside ValueClub. There is no evidence yet for an “award-winning” quality claim.

## Growing the operation

At level 4, open **Checkouts & queues** from Store. Hire Jamie, then buy the second checkout for $1,200. Jamie operates Till 02; you operate Till 01. Each lane has ten distinct holding positions, leaving the entrance clear. Customers account for travel distance and expected service time when choosing a lane.

At level 6, select a display to choose a supplier shipment. Standard deliveries cost roughly 12% less than local restock and take 35 seconds; rain adds 15 seconds to new standard shipments. Express stock costs roughly 15% more and arrives in 8 seconds. Unit prices are rounded to whole Store Cash. Delivery spaces are reserved so inventory can never be ordered twice into the same shelf capacity. Existing shipments retain the ETA quoted when ordered.

Store purchases from level 6 earn one Research Point. Open **Stockroom & research** from Store to choose quick-scan checkout, better bundle demos, standing supplier orders or rain-ready dispatch. Each project also costs cash. Supplier standing orders let Aisha use a cheaper delayed delivery instead of instant local restock; the reorder threshold makes you choose how much stock to keep ahead of the van. Delaying too long can lose sales, while ordering early ties up cash.

## Saves and offline trading

Progress is local to this browser, this device and this site origin. It is not synced through GitHub. Use Settings → **Export save backup** before clearing browser data, changing devices or moving to a different URL/domain.

If no teammate is hired, the store closes while you are away. With a teammate, the same simulation runs for up to four hours of elapsed time, using actual stock and charging wages. Aisha can replenish stock only when you have cash. A paused shop does not earn offline sales. There are no offline order autofulfilment claims; unfilled orders expire. Offline reports show purchases, sales and lost customers.

A supplier advance is available when all displays are empty and cash cannot afford stock. It is repaid at $20 per in-store purchase. This provides recovery without a Game Over. In this prototype, wages beyond available cash are waived and shown in the daily report.

The save import accepts version 1 (migrated automatically) and version 2. The local storage key remains `challenger-tycoon-v1` so existing shops are found. Invalid amounts, product IDs, overlapping fixtures, blocked routes and oversized inputs are rejected. This guards accidental corruption; it is **not anti-cheat protection**. All gameplay cash and XP are client-side and editable. They must never authorize real rewards.

## Run and test locally

From the project folder:

```sh
python3 -m http.server 8080
```

Open `http://localhost:8080/`. To run the dependency-free simulation tests, install Node.js 18 or newer, then:

```sh
npm test
```

Optional browser integration tests:

```sh
npm install --no-save playwright
npx playwright install chromium
node tests/browser.cjs
```

`CHROME_PATH` can point to an existing Chrome binary. The optional test suite checks gameplay UI, save/reload, ten viewport sizes, host-provided book/tabletop hinges and actual offline reload under a repository subpath. Screenshots go into the ignored `test-results/` folder. The suite is included and passes for this renderer. No development dependency is needed for hosting or playing.

## Debug playtesting

Add `?debug=1` to the URL. A small DEBUG button provides progression jumps and event triggers. These changes **use the same save**, so export a real shop first or use another browser profile.

The browser console also exposes:

```js
tycoonDebug.jump('15m');
tycoonDebug.event('rain');
tycoonDebug.advance(60);
```

Jump names: `new`, `5m`, `15m`, `1h`, `early`, `mid`, `late`, `flagship`. These set test states; they do not assert that real players progress at those exact times.

## WebView integration

`window.gameBridge` has pause/resume and validated display-environment input. `setPlayerProfile` and `setCampaigns` are reserved validation-only hooks. Authoritative sync and reward result methods return false until a backend integration is implemented.

See [docs/WEBVIEW.md](docs/WEBVIEW.md). Core play works without any native host.

## Updating the game

Upload the changed source and increment `VERSION` in `sw.js` for each published release. The new service worker caches a coherent version and waits while older tabs are active. Settings offers **Load the new version** once the update is ready; this saves progress, activates the waiting worker and reloads. Closing all tabs also allows an update to activate naturally. Do not change save schema fields without adding a migration and increasing the schema version.

## Architecture and design

`src/config.js` holds economy and unlock tuning; `engine.js` contains simulation and route finding; `renderer.js` owns camera and gameplay drawing; `graphics.js` defines floor projection and shared scale; `scene.js` composites scene layers; `water.js` renders the flowing water material; `art.js` loads the mall and fixture images and trims the fixture atlas; `characters.js` selects and anchors native character poses; `checkouts.js` routes queues; `operations.js` handles suppliers and research; `input.js` classifies tap/pan/pinch; `ui.js` owns accessible DOM panels; `save.js` validates persistence; `audio.js` synthesises the score; `app.js` handles lifecycle, bridge and PWA registration.

The game runs fixed 50ms simulation steps separately from rendering. NPCs recalculate paths after layout changes, not every frame. Saves happen on actions, periodic checkpoints and lifecycle changes.

See [docs/DESIGN.md](docs/DESIGN.md) for design reasoning, art bible, source references and deferred roadmap. See [docs/QA.md](docs/QA.md) for validation and physical-device playtesting.
