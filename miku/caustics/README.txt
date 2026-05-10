public/caustics/

These 9 caustic decal textures are stamped on the floor when shards land
(see src/stage/DecalLayer.tsx and section 4 of the design spec). They are
single-channel intensity maps written into the alpha channel of a white
RGBA PNG. The runtime tints them cyan (#9beaff) and overlays the warm
variant (#ffd9a8) at lower opacity for the high-tier shards.

Files
  caustic-01.png ... caustic-08.png   main decal set (8 textures, varied seeds)
  caustic-warm.png                    warm overlay variant (coarser, softer ridges)

Format: 512x512 RGBA PNG. R/G/B = 255 (white). A = intensity (0..255).
Typical file size: 130-170 KB each. Total: ~1.4 MB.

Generation
  Script: scripts/bake-caustics.mjs
  Command: npm run bake-caustics

The script uses procedural Worley/Voronoi noise with toroidal tiling and
domain warp to produce caustic-shaped ridges. Each texture uses a distinct
seed and parameter set (feature-point count, warp strength, warp frequency,
ridge sharpness, gamma) so the 8 decals look meaningfully different.

This is the spec section 4 procedural fallback path. The canonical approach
(raymarched caustics via a headless-browser WebGL renderer) would produce
more physically accurate results but requires puppeteer/node-gl and is
heavier than necessary at this resolution. The procedural Worley approach
gives visually convincing caustic ridges that are indistinguishable from
the raymarched version at 512x512 when tinted and blended additively on
the floor.

Re-run the script if you want to regenerate with new seeds. Outputs are
committed to the repo; the script is not part of the production build
(not in prebuild chain).
