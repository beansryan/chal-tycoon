# Native integration boundary

Bundle the complete directory or host it over HTTPS. Load the entry URL in a React Native WebView with JavaScript and DOM storage enabled. Native compact-handset orientation policy belongs to the host; the game adapts to actual viewport changes without reconstructing the engine.

## Display metadata

The host may call:

```js
window.gameBridge.setDisplayEnvironment({
  posture: 'book',
  safeArea: { top: 0, right: 0, bottom: 24, left: 0 },
  hinge: { x: 654, y: 0, width: 12, height: 980, occludes: true }
});
```

Coordinates are CSS pixels in the current WebView viewport, **not physical pixels**. Finite nonnegative inputs are required. The game uses the actual viewport, not an asserted device model. Vertical occluding hinges create world/management panes; horizontal hinges create a tabletop split where sufficient usable room exists. If the usable panes are too small, the host must supply a single unobscured viewport rather than spanning the physical hinge.

Call again after rotation/folding; use `{posture:'flat'}` when no hinge remains. Safe-area values supplied by the host override CSS environment fallbacks for that side. Set all sides explicitly when the host’s insets change.

Actual window dimensions and CSS breakpoints handle normal portrait, landscape and multitasking transitions. Selection, stock, customers and simulation objects remain in the same engine instance.

## Lifecycle

```js
window.gameBridge.pauseGame();   // background/native overlay
window.gameBridge.resumeGame();  // foreground
```

These calls are idempotent. Browser visibility/page lifecycle handlers also save and suspend audio. The host should coordinate its lifecycle with the browser’s events, and real device tests must verify that the WebView does not run duplicate audio loops or count background time twice.

## Outbound messages

```json
{"type":"GAME_READY","version":2}
{"type":"GAME_HAPTIC","style":"light"}
```

The host should validate message type and payload before processing. The game does not send reward claims, purchase requests or real monetary balances.

## Reserved hooks

- `setPlayerProfile(profile)` validates that the argument is an object. It does not establish identity, render a name or change gameplay.
- `setCampaigns(campaigns)` validates a bounded array. It does not apply external campaigns yet.
- `syncAuthoritativeState(state)` returns false.
- `rewardClaimResult(result)` returns false.

Do not confuse these extension points with implemented integrations. Any future reward service must verify identity, eligibility, limits and redemption server-side; client saves, timestamps, XP and Store Cash are untrusted.

## Persistence

The game currently uses WebView/browser localStorage. Schema 1 saves migrate to schema 2, retaining the existing storage key. The host should avoid clearing origin storage unexpectedly. Native/cloud backup, migrations, authentication and conflicts need a separate production implementation.
