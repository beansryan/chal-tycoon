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

## Art and animation direction (release 1.8)

The renderer is split into shared geometry (`graphics.js`), scenery compositing (`scene.js`), water material (`water.js`), native sprite playback (`characters.js`) and gameplay drawing/camera (`renderer.js`). All projected footprints, sizes and pointer inverses come from one floor projection.

The scene uses `jewel-mall-tenants.png`. The original painted fascia occupied x481–1055, although the front structural columns are at x416–435 and x1101–1120. The rebuilt central beam spans x416–1120, y393–449, with 19px posts down to y785. The adjacent wood/ivory panels fit the remaining widths. Its playable floor retains the calibrated back and threshold edges. The actual logo is drawn separately inside the central fascia.

`character-atlas.png` is byte-for-byte the supplied style reference. `character-walk.png` provides side/back poses. Its true row separators are 0/236/449/672/887; equal quarters cut through some feet. Frames share a scale within each actor/view and use head-centred horizontal registration with sole-based vertical pivots. Motion advances with travel distance and holds while paused. The customer back cycle skips two inconsistent tote poses. Palette variants are cached per cropped frame and affect torso clothing only. Browsing characters do not turn front-facing just to gesture.

World person height is 54 at the reference depth. A shared depth factor is limited to 0.90–1.12. Furniture width follows the projected two-cell footprint, and height follows native aspect ratio. Stock level and fixture moves retain their existing engine behaviour.

`skytrain-crystal.png` has visible bounds x10/y218/w2124/h275. Wheel baseline anchoring removes transparent-padding hover. Separate far/near height ratios give consistent apparent depth. Static foreground layers are extracted with source-coordinate clipping and redrawn after their moving layers; a train continues moving while hidden.

The water is generated analytically in `water.js`: an elliptical inner-lip attachment, tapering annular curtain, gravity-adapted advected noise strands, edge density and restrained spray. The oculus aperture stays clear. No waterfall PNG is loaded or shipped. A Canvas 2D fallback retains the silhouette and moving strands. Supply opening and draining are eased; the fictional 100-second cycle does not represent Jewel’s real operating schedule. `app.js` passes the same clamped real-frame delta and selected speed to the renderer that it uses for simulation. Train services, water, passers and service effects share game time. Camera smoothing uses real time. Reduced motion displays a still fall; pause and management modals freeze ambient animation.

Detailed research and pixel verification are recorded in `GRAPHICS_REBUILD.md`.

The foliage layer contains solid, traced foreground garden silhouettes. Stone, flowers, bark and shadows are equally opaque inside these masses. No RGB classification cuts holes through the garden walls. The near guideway runs in front of background palms, so those trunks do not slice passing carriages. Train artwork is cropped to its measured complete alpha bounds. The shared storefront beam and posts use the same source anchors, with a charcoal ribbed central fascia, cyan edge lighting and the supplied logo. The two posts enclose the playable floor threshold.
