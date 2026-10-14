# Validation and playtest checklist

## Release 1.1 validation

39 code tests passed: 16 original simulation/persistence checks, 14 operations/migration checks, four character-pose tests, and five presentation/cache tests. The full shop scene was rendered independently at wide and phone viewport sizes and inspected. These checks validate renderer commands and assets, but do not replace a browser run.

The browser-testing connection became unavailable while building 1.1. The redesigned DOM/CSS, actual animation timing, install/update flow and fold layouts must be rechecked in a browser. The included browser suite is updated for the illustrated renderer. The successful checks below refer to release 1.0 and must not be interpreted as successful 1.1 browser validation.

## Original release validation (historical)

16 Node simulation/persistence checks passed:

- First sale within 25 seconds and correct stock/cash movement.
- No overselling during a rush; no negative cash from denied actions.
- Partial restock at actual unit costs.
- Collision/path rejection, valid placement and move preservation.
- Staff automation capacity and cash invariants over two trading days.
- Day-closing wage deductions.
- Shared-stock online fulfilment and one-time milestone claims.
- Four-hour offline cap with finite inventory; no unattended earnings.
- Versioned save restoration; corrupt/injected content rejection.
- Supplier recovery and debt repayment.
- Offline processing emits no repeated UI/audio events.
- Customer-care training adds patience.

25 headless Chromium browser checks passed:

- Open store, first sale, restock, upgrade, build confirmation and staff hire through UI.
- Panning does not fire a ghost selection or move furniture.
- Online orders use shop stock; save survives reload.
- Ten viewport checks: 320×568, 390×844, 430×932, 768×1024, 820×1180, 1024×1366, 1024×768, 1366×1024, 844×390 and 700×600.
- Host-provided vertical book and horizontal tabletop hinges keep world/management panes separate.
- Daily report continuation and no uncaught browser exceptions.
- Install manifest and actual offline reload under `/repo/`.
- Explicit service-worker update activates and reloads.

Additional Chromium touch-event checks confirmed direct display selection, no ghost selection after touch panning, and bounded pinch zoom returning to the idle gesture state. These are browser emulation checks, not physical-device tests.

Phone and tablet screenshots were visually reviewed. Automated viewport checks assert no horizontal document overflow, a nonzero canvas and store continuity. They do **not** verify every accessibility requirement or every real hardware behaviour.

## Physical-device gates still needed

- iOS Safari install, standalone launch, audio unlock and export/import usability.
- Android Chrome install/offline launch and service-worker update behaviour.
- Foldable cover/unfold/book/tabletop transitions with actual host hinge metadata.
- Rotation and split-view resizing while a display or staff panel is selected.
- Low/mid-range hardware with a full expanded store, rain, promotions and many shoppers.
- 30–60 minute sessions for thermal load, battery, memory and input latency.
- Native WebView storage/lifecycle behaviour and single audio loop after background/resume.
- VoiceOver/TalkBack access to DOM controls and management equivalents of canvas selections.
- Reduced-motion and large-text controls on the smallest supported window.

## First-session player observation

Watch first taps, time to first independent restock, unnoticed stock gaps, queue understanding, accidental taps and whether an upgrade feels useful. Do not tell players what to press unless they are stuck. Ask what they want to do next. No external rewards should be promised.

## Depth and balance observation

Compare a Mobile-focused store against diversified departments. Compare manual operation against early hiring. Measure stock losses, queue losses, working capital and accessory attachment. If one strategy wins without tradeoffs, retune before adding more content.

## Updates and persistence

With a future incremented service-worker version, leave one old tab open, publish the update, verify no forced mid-session reload, then use the explicit update button. Confirm the same save loads in the new version. Keep incompatible save migrations in tests. Clearing site data should be tested only on a disposable shop or after exporting a backup.
