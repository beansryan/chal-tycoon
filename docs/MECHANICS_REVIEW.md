# Mechanics review and adaptation

Reviewed the supplied Gemini source and Claude rebuild locally. The Claude graphics were not adopted.

## Adopted from Gemini

Six locations, branch network, additional fixtures, staff specialisations, VIP visitors, recurring stories, pricing strategies, cosmetics and promotions. Added real native environments and role-specific animation art to replace label-only scenes and reused customer outfits.

## Adapted from Claude

- Shopper budgets affect conversion, with named regular budgets following their current requested department. Prices are checked again at checkout so a promotion ending in the queue cannot silently exceed a budget.
- High queue pressure temporarily reduces new arrivals for 25 seconds without removing existing shoppers or changing paid stock.
- Closing reports explain stockouts, queue losses, unaffordable selections and bundle performance.
- A forecast records the next actual weather and event and survives save/reload.

## Deferred

Fixture rotation and fully custom checkout footprints need rotated native artwork and revised path validation. Random candidate hiring would conflict with the newly illustrated named staff. Deep per-SKU/tier inventory would need a dedicated product-management interface rather than hidden multipliers. The existing touch grid, named team and native animation renderer remain the foundation.

## Corrected defects

Upgrades no longer grant free inventory or overbook supplier deliveries. Support fittings cannot sell generic cartons as TVs. Every location expansion adds two columns. A regular's story advances only on its requested department. Save migration retains full legacy accessory displays and refunds only cancelled excess delivery portions. Production no longer exposes the debug object. Eight-minute trading days, lower margins and a quadratic XP curve restore measured progression.

## Art

Five native 1536×1024 environments and three transparent 1536×1024 character atlases. Each atlas has 6 rows × 12 columns: front, back, right; left is mirrored. Twelve customer identities and six staff identities share a reference height and foot anchors. All generated art is packaged locally and cached offline.
