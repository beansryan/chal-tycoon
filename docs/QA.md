# Validation and playtest checklist

## Release 1.2 validation

37 Node checks pass: economy and persistence, routes and stock reservations, second checkout, supplier deliveries, research and automation, version-one save migration, whole-body animation directions, reduced motion, contextual controls and offline asset coverage.

28 headless Chromium checks pass:

- First sale, restock, upgrades, build confirmation, staff hire and online order through the UI.
- Panning does not select or move a fixture; saves survive reload.
- Second checkout, supplier order/arrival and research controls.
- Ten viewport sizes: 320×568, 390×844, 430×932, 768×1024, 820×1180, 1024×1366, 1024×768, 1366×1024, 844×390 and 700×600.
- Book and tabletop hinge layouts keep world and management panes separate.
- Closing report continuation; no uncaught browser errors.
- Manifest, fully cached offline reload under `/repo/`, and explicit service-worker update activation.

Automated viewport checks validate document overflow, canvas dimensions, minimum navigation target sizes and progress continuity. They do not substitute for physical-device or player testing.

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
