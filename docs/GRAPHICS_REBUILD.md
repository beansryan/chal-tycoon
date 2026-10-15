# Graphics rebuild: 15 October 2026

The user’s supplied character atlas is the style reference. The previous procedural adults did not match it, the repeated full-width fascia implied mall-wide branding, and an overlay-only train had no foreground occlusion. The earlier water overlays were replaced again in 1.9.0: the live curtain is now generated in motion instead of scrolling a static image.

## Research and applied decisions

| Primary source | Relevant guidance or reference | Application in this game |
| --- | --- | --- |
| [Godot: 2D sprite animation](https://docs.godotengine.org/en/stable/tutorials/2d/2d_sprite_animation.html) | Individual frames and sprite sheets support distinct animation sequences with explicit playback and stop behaviour. | Native front, side, back, idle and interaction poses replace the procedural adult rig. Playback follows travel distance. |
| [Aseprite: sprite sheets](https://www.aseprite.org/docs/sprite-sheet/) and [slices](https://www.aseprite.org/docs/slices/) | Frame regions and metadata must describe actual source artwork. | Source alpha bounds, optical head anchors and sole pivots are registered per frame. Walk rows are measured from actual transparent gaps rather than assumed to be equal quarters. |
| [Godot: CanvasItem](https://docs.godotengine.org/en/stable/classes/class_canvasitem.html) | Tree order, z-order and Y-sorting determine 2D drawing order. | Application decision: explicit background, flowing water, far service, far bridge face, near service, near bridge face, foreground foliage, oculus rim, signage and floor-object layers. |
| [Godot: CanvasItem shaders](https://docs.godotengine.org/en/stable/tutorials/shaders/shader_reference/canvas_item_shader.html) | Shader UV coordinates, textures and time support animated materials. | Application decision: analytical annular geometry, advected noise strands and supply/drain clipping, with no sampled waterfall image. |
| [Mitsubishi Heavy Industries: Changi Crystal Mover](https://www.mhi.com/jp/technology/review/sites/g/files/jwhtju2326/files/tr/pdf/e442/e442010.pdf) | Manufacturer reference for Changi’s vehicle family, coupled operation and guideways. | Original stylized three-car airport-shuttle artwork; proportional sizing and running-wheel anchoring. This game is not an engineering-scale recreation. |
| [Jewel: Rain Vortex](https://www.jewelchangiairport.com/en/attractions/rain-vortex.html) | Official reference for the falling water and its setting. | Water remains part of the atrium with the rim, gardens and guideways in front where appropriate. The requested start/stop animation is a fictional game cycle. |

The engine remains dependency-free. The research is applied in the Canvas renderer and a small WebGL water material; it does not introduce a game-engine dependency.

## Scale and artwork registration

- The person’s reference height is 48 world units. Depth modifies characters and fixtures together, within 0.90–1.12.
- Display width comes from its two-cell projected footprint. Native image proportions determine its height; the renderer no longer stretches every table into an arbitrary fixed rectangle.
- Scenery anchors are normalized to the original scene image. Train scale belongs to its guideway depth rather than the shop floor.
- The supplied character sheet has SHA-256 `d5021b212e13417526281725cfd527c2e9995d46e4855d746f648a5fb16dba3d`.
- Walk sheet row separators are `[0,236,449,672,887]`. The earlier equal-quarter split crossed soles and included pixels from the neighbouring row.
- One 240-native-pixel reference unit is used across both character sheets and both roles. Frame crops retain native proportions. Horizontal anchoring uses the head centre and vertical registration pins the crown; variations in shoe bounds cannot bounce the head. Idle profiles remain in the same sheet as their walk. Customer side cycles omit frames that lose the tote; rear cycles omit frames that swap shoulders. Turns follow the interpolated displacement rather than prematurely facing the next route segment. Customers never use the employee bank.
- The original central tenant fascia occupies source x481–1055. The rebuilt ribbed panel uses these upper glass-corner anchors. The wider floor-threshold anchors are deliberately not used for signage because of perspective. The real logo is centred inside that panel. The cafe and fashion signs remain in their own tenant spans.

## Verification

56 code checks and 48 headless Chromium integration checks pass. The graphics checks inspect rendered pixels: a train changes pixels in an open guideway span but leaves foreground foliage pixels unchanged; water pixels vary over time with a fixed attachment. The integration suite also checks sprite loading, complete walk frames, fixture proportions, placement gestures, save compatibility and offline loading under a repository subpath.

Phone and desktop compositions are visually inspected. These checks do not establish subjective art quality or replace physical iPhone/Android testing. No real-device frame-rate guarantee is claimed.

## 1.8.3 feedback corrections

The cashier shares the same character unit as customers and stands 1.9 logical rows behind the counter anchor, so the counter occludes the lower body rather than hiding the entire shirt. Walk frames use the original native head size instead of enlarging the shorter walk silhouettes to match the standing body height. Retired actor tracks are reclaimed, including timestamp-based customer IDs.

## 1.9.0 water, train and sign corrections

- Replaced the sampled waterfall with a shader-generated annular curtain attached to the front inner lip. Water strands advect downward with an accelerated profile; the aperture stays open. Native image sampling and the old waterfall PNG are removed from the load/cache/export list.
- Replaced rectangular foreground redraws with transparent plant/bark contours and calibrated palm cores. Gaps between leaves no longer erase train windows or cabs. Both directions are inspected at both garden edges.
- Rebuilt the charcoal ribbed fascia inside its authored upper glass corners, with cyan trim and the actual logo. Adjacent wood and ivory signs are untouched.
- Passed the simulation frame delta and speed to the renderer. Train services, water, corridor walkers and effects use 1×/2×/3× game time; camera movement uses real time. Pausing or opening a management modal freezes environmental motion.
- Added regressions for contour gaps on both sides, adjacent-tenant pixels, 1×/2×/3× train displacement and water uniforms, the actual fast-forward button, and shader/Canvas water aperture, movement and drainage.

Water reference: [Changi Airport: behind the Rain Vortex](https://www.changiairport.com/en/corporate/our-media-hub/publications/changi-journeys/2020/what-goes-on-behind-the-worlds-tallest-indoor-waterfall.html), describing the even circular flow supplied by the oculus. The visual is a stylized game interpretation, not a fluid simulation.

## 1.9.1: source-geometry correction

The original sign dividers were at x481 and x1056, while the front wall columns were at x416–435 and x1101–1120. The whole beam is now rebuilt at x416–1120, with matching posts to y785 and resized adjoining tenant panels. The main sign is no longer treated as an isolated rectangle.

The colour-key foreground mask allowed train windows to show through grey stone and dark gaps inside dense foreground plants. It also classified background palm stems as foreground despite the near guideway passing in front of them. Solid traced garden masses replace that classifier. Tests now cover grey stone at all four train entries and the open near span; the earlier trunk-occlusion expectation was incorrect and has been replaced.

Four entry/exit frames and the connected frontage are visually inspected at native source resolution. The source crops in the new feedback are used as counterexamples, not just green foliage sample points.
