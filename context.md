# Scene context

A furnished living room, exported from Blender 4.5 as one OBJ file. The viewer is React Three Fiber on Vite.

## Project layout

| Path | Purpose |
|------|---------|
| `assets/1.obj` | **Source** scene (180 MB, text OBJ). Not served |
| `assets/textures/` | **Source** images (36 files, 307 MB). Not served |
| `public/interior.glb` | Converted scene that the app loads (6 MB, meshopt-compressed) |
| `public/textures/*.webp` | Converted textures that the app loads (only the 18 in use, 8-bit WebP, max 2048 px) |
| `scripts/textures.mjs` | Converts the textures listed in `materials.js` to WebP |
| `.cache/` | Intermediate GLBs from `npm run convert` (safe to delete) |
| `src/App.jsx` | Canvas, fixed camera, lights, environment |
| `src/Interior.jsx` | Loads the GLB (`useGLTF`) and textures, then assigns a `MeshStandardMaterial` to every mesh |
| `src/materials.js` | The material table: OBJ `usemtl` name → color / textures / roughness |

Run it with `npm run dev`, then open http://localhost:5173.

## Conversion pipeline (`npm run convert`)

Rerun this whenever `assets/` or the texture list in `materials.js` changes. It takes about 40 s.

1. `obj2gltf`: OBJ → `.cache/raw.glb` (65 MB). This step keeps object names and `usemtl` names. A material that has to be split off for meshes without UVs gets a `-2` suffix (`mat_i2stay0003-2`, `i2stay0019-2`), and `Interior.jsx` strips it.
2. `gltf-transform weld`, then `simplify --error 0.0001`, which is visually lossless. The sofa goes from 448 k to 58 k triangles.
3. `gltf-transform meshopt` → `public/interior.glb`. Three's GLTFLoader decodes it with no extra setup.
4. `scripts/textures.mjs` → `public/textures/*.webp`.

**Do not use `gltf-transform optimize`.** Its dedup step merges every material into one, because obj2gltf gives them all identical default values. Its prune step also strips the UVs, since the GLB has no textures attached.

glTF UVs are flipped compared with OBJ, so `Interior.jsx` sets `texture.flipY = false`.

## Units and coordinates

- Units are **meters** and **Y is up**. Blender's OBJ export has already converted from Z-up, so no rotation is needed.
- Whole-file bounds: x −2.94 → 6.78, y −0.20 → 4.69, z −3.04 → 5.70.
- **The room interior** (wall box `i2stay0022`) runs x −2.74 → 2.43 (5.17 m wide), y 0 → 4.58 (4.6 m ceiling), z −1.29 → 5.64 (6.93 m deep).
- **The window wall** is at x ≈ −2.9 (the frames in `i2stay0002`).
- Everything at x > 2.43 is outside the room: a terrace strip and a curb.
- Camera is **fixed** (no controls): position `[-0.15, 0.6, 4.2]`, rotation `[0, 0, 0]`, fov 45 (zoomed in from the default 60). It sits near the back wall low, at 0.6 m and looks straight ahead (−z) at the sofa, centered on the room width.

## The missing `.mtl` problem

`1.obj` contains `mtllib 1.mtl`, but **`1.mtl` is not in `assets/`**. Without it, the OBJ only has material *names*, with no colors and no texture links. `src/materials.js` stands in for the `.mtl`.

I made each mapping by:
1. **Name**: `mat_i2stayXXXX_diffuse/_bump` belongs to material `mat_i2stayXXXX`, and `…Bitmap_i2stayXXXX_baked` belongs to `mat_i2stayXXXX`.
2. **Looking at the image** and comparing it with the shape and position of the object that uses the material.

Plain `i2stayNNNN.jpg` numbers are image IDs and **do not** match material numbers. If the original `.mtl` turns up, use it instead of these guesses.

Every material is `DoubleSide`, because Blender shell normals can face outward and hide walls from the inside. Every texture uses `RepeatWrapping` and anisotropy 8. Diffuse maps are sRGB.

## Objects (47 meshes named i2stay0002–i2stay0063, one material each)

1.07 M vertices and 1.44 M faces in total. Positions are bounding-box minimums in meters.

### Room shell
| Object | Size (x×y×z) | Material | What it is |
|--------|-------------|----------|------------|
| i2stay0022 | 5.17×4.58×6.93 | i2stay0013 | Interior walls (a 12-tri box) |
| i2stay0023 | 5.17×2.14×5.93 | i2stay0013 | Upper wall band |
| i2stay0012 | 5.18×2.39×0.04 | i2stay0013 | Partition wall behind the sofa (z −0.94) |
| i2stay0025 | 0.84×2.44×1.64 | i2stay0013 | Wall block / column at x 2.2 |
| i2stay0003 | 5.17×0.10×8.68 | mat_i2stay0003 | Ceiling slab (y 4.59) |
| i2stay0011 | 5.17×0.05×6.93 | mat_i2stay0003 | Inner ceiling (no UVs) |
| i2stay0005 | 8.46×3.10×8.68 | mat_i2stay0003 | Outer building shell |
| i2stay0009 | 9.67×0.01×7.91 | mat_i2stay0011 | Floor (dark concrete) |
| i2stay0014 / 0016 / 0018 | 1 cm thick strips | mat_i2stay0014 | Floor thresholds / borders |
| i2stay0006 | 8.68 m line | mat_i2stay0009 | Skirting strip at x −2.74 |
| i2stay0002 | 0.20×2.30×3.03 | mat_i2stay0002 | Black window frames on the left wall (no UVs). There is no glass and nothing outside, so the panes show the canvas background |
| i2stay0004 | 0.07×2.81×2.21 | mat_i2stay0008 | Curtain at the left window, front corner (18 k verts). It currently uses the wood-strip image; i2stay0022.jpeg (linen) may be the real one |
| i2stay0020 | 1.36×1.91×0.05 | i2stay0015 | Concrete panel on the partition (y 0.6) |
| i2stay0008 | 1.36×0.01×5.93 | mat_i2stay0010 | Outside floor strip (x 3.8) |
| i2stay0010 | 0.20×0.35×6.56 | mat_i2stay0012 | Outside curb (x 5.3) |

### Furniture and decor
| Object(s) | Material | What it is |
|-----------|----------|------------|
| i2stay0041 (448 k verts), 0042–0047 | mat_i2stay0020 | Sofa, 2.7 m: body, cushions, two arms (0044/0047), seat (0045/0046) |
| i2stay0039 | i2stay0019 | Dark wood sofa plinth |
| i2stay0038 | mat_i2stay0018 | Rug, 4.56×3.45 m |
| i2stay0062 | i2stay0027 | Coffee table top, 1.16×1.16 m, y 0.22 |
| i2stay0060, 0063 | mat_i2stay0025 | Coffee table base panels |
| i2stay0057 | mat_i2stay0023 | Book on the coffee table (art cover) |
| i2stay0058 | mat_i2stay0024 | Book / tray on the coffee table |
| i2stay0052, 0053 (92 k verts) | mat_i2stay0022 | Two small travertine vases on the coffee table |
| i2stay0037 | i2stay0017 | Dark travertine plant pot at x 1.54 |
| i2stay0028–0036 | mat_i2stay0016 | Plant branches/leaves in that pot, up to 1.9 m (no texture → flat green) |
| i2stay0050 (250 k verts) | mat_i2stay0021 | Pendant lamp globe, Ø 0.44 m, y 1.33–1.77 (no texture, slight warm emissive) |
| i2stay0049 | i2stay0019 | Lamp rod/cable, 2.14 m |

The heaviest meshes are the sofa (0041, 0044, 0047), the lamp globe (0050) and the vases (0053). They make up most of the 180 MB.

## Textures

### Used (material → file)
| Material | Map | Bump / Normal | Notes |
|----------|-----|---------------|-------|
| i2stay0013 | i2stay0013_diffuse.png (2048², beige plaster) | – | walls |
| mat_i2stay0011 | mat_i2stay0011_diffuse.png (998², dark concrete) | mat_i2stay0011_bump.png (bump) | floor |
| mat_i2stay0008 | i2stay0008.jpg (564×2382 wood plank) | – | wall panel |
| mat_i2stay0012 | mat_i2stay0012_diffuse.png (3000×1000 dark) | mat_i2stay0012_bump.png | curb |
| i2stay0015 | i2stay0015.jpg (1536² grey concrete) | – | wall panel |
| i2stay0017 | i2stay0017_diffuse.png (4000², 83 MB, dark travertine) | i2stay0017_bump.png (**normal map**, purple) | pot |
| mat_i2stay0018 | mat_i2stay0018_diffuse.png (2048² greige fabric) | – | rug |
| i2stay0019 | i2stay0019.jpg (1600² dark wood) | – | plinth, rod |
| mat_i2stay0020 | mat_i2stay0020_diffuse.png (2048² beige fabric) | – | sofa |
| mat_i2stay0022 | i2stay0012.png (512² beige travertine) | mat_i2stay0022_bump.png | vases |
| mat_i2stay0023 | i2stay0081Bitmap_i2stay0023_baked.png (abstract painting) | – | book cover |
| mat_i2stay0024 | i2stay0106Bitmap_i2stay0024_baked.png (3465×4125 light wood) | – | book/tray |
| mat_i2stay0025 | mat_i2stay0025_diffuse.png (1600² oak) | – | table base |
| i2stay0027 | i2stay0027_diffuse.png (1600² oak, identical image to 0025) | – | table top |

Flat colors (no texture or no UVs): mat_i2stay0002, 0003, 0009, 0010, 0014, 0016, 0021.

### Unused / suspicious
- `mat_i2stay0003_bump.png`, `mat_i2stay0009_reflection.png`, `mat_i2stay0014_reflection.png` are **black/white checkerboards**. These are placeholder images from a broken export, so they are ignored.
- `i2stay0017_reflection.png` (white with dark specks) is a reflection/gloss mask for the travertine. It's not used yet; it could become a `roughnessMap` (inverted).
- `i2stay0005.jpg` (travertine color) and `i2stay0007.jpg` (its normal map): a matching pair that no material name points to. They might have been meant for the pot or vases.
- `i2stay0002.jpg` (woven fabric) and `i2stay0097Bitmap_i2stay0002_baked.png` (grey fabric) might be the lamp shade, but `mat_i2stay0002` is the window frame and has no UVs.
- `i2stay0003.jpg`, `i2stay0020.jpg`, `i2stay0021.jpg` are white/grey plaster grunge, probably roughness maps or ceiling/wall variants.
- `i2stay0017.jpg` and `i2stay0018.jpg` are grey wood grain, probably roughness maps for the woods.
- `i2stay0009.jpg` and `i2stay0011.jpg` are magazine/book page images. `i2stay0010.jpg` is solid black. `i2stay0013.jpg` is the same dark strip as mat_i2stay0012. `i2stay0022.jpeg` is linen fabric.

All PNGs are **16-bit RGB**. They are large to download and decode, but the GPU stores them as 8-bit anyway.

## Lighting (src/App.jsx)
The look is a sunny afternoon, with the sun coming through the big window on the left wall.
- **HDRI**: drei `<Environment preset="park" background environmentIntensity={0.6}>`. It does two jobs: blue-sky fill and reflections inside the room, and the outdoor view (grass, trees, sky) seen through the window. The HDR is downloaded from drei's CDN, so it needs internet. To work offline, put a .hdr file in `public/` and use `files=` instead of `preset=`.
- **Sun**: `directionalLight` at `[-10, 5.5, 5]` aiming at the origin. Warm `#ffe2b8`, intensity 9, casts shadows (4096² map, ortho box ±7 m, bias −0.0004, normalBias 0.02). The walls and ceiling block it, so it only gets in through the window. It throws a diagonal sunbeam with window-frame shadows across the rug, the sofa and the back wall, plus the pendant lamp's shadow.
- **Base fill**: `hemisphereLight` (sky `#fff1e0` / ground `#b8a48c`, 0.2). It's deliberately faint: it only stops corners from going black. Uniform fill is what makes a render look flat and CG, so most of the indirect light comes from the next two lights, which fall off with distance.
- **Window skylight**: `rectAreaLight` filling the window opening (pos `[-2.8, 1.3, 0.9]`, rotated to face +x, 3 × 2.3 m, intensity 1.2, cool `#e6edff`). It gives soft daylight that is bright near the glass and fades across the room, so the right side is naturally darker and cooler. It needs `RectAreaLightUniformsLib.init()`, which is called at the top of App.jsx. It casts no shadows. It's very sensitive: an intensity of 6 blew out the whole left half of the image.
- **Sun bounce**: warm `pointLight` (`#ffc58f`, 0.5, distance 5, decay 2) at `[-1.6, 0.7, 1.4]`, above the sunlit floor patch. It fakes sunlight bouncing up off the floor onto the sofa front and lower wall. Keep it at about 0.7 m or higher; at 0.25 m it left a visible hotspot on the rug.
- Warm sun + cool sky + warm bounce is the classic interior color balance.
- Every mesh has `castShadow` and `receiveShadow` (set in `Interior.jsx`). The Canvas has `shadows` turned on.
- **Soft shadows**: drei `<SoftShadows size={18} samples={16} focus={0.6}>` (PCSS). The window-frame shadow edges blur the further they fall from the frame, the way real sun shadows do.

## Realism / post-processing (src/App.jsx, `@react-three/postprocessing`)
The Canvas is `flat` (the renderer does no tone mapping) because tone mapping happens in the effect stack. `dpr={[1, 2]}` gives a sharp image on HiDPI screens. The effects run in this order inside `<EffectComposer multisampling={4}>`:
1. **N8AO** (radius 1, falloff 1, intensity 4, warm dark `#2a2018`): screen-space ambient occlusion. It adds contact shadows between cushions, under the sofa and table, around the pot, and in wall corners. This does the most to remove the "floating CG" look.
2. **Bloom** (threshold 0.7, smoothing 0.3, intensity 1.4, radius 0.85, mipmapBlur): a soft glow around sunlit surfaces (wall, sofa seat, lamp globe). Raise `intensity` for a dreamier look. Raise `luminanceThreshold` to limit it to the very brightest spots.
3. **ToneMapping AgX**: filmic highlight roll-off, so the sun doesn't clip to flat white.
4. **BrightnessContrast** (+0.02 / +0.18): AgX looks flat on its own, and this brings back photographic contrast.
5. **Vignette** (offset 0.3, darkness 0.45): subtle lens falloff.

All of this costs GPU time (PCSS, a 4096² shadow map, AO, MSAA at up to 2× dpr). If it stutters on a weak GPU, the first things to lower are `SoftShadows samples` (→ 8), `multisampling` (→ 0), and `dpr` (→ 1).
- To tune the sun: move its `position`. A lower y gives a longer patch that reaches further into the room. A larger z moves the patch toward the camera.

## Known limits / next steps
- **Load time**: about 0.7 s on localhost (6 MB GLB + about 8 MB WebP), down from about 60 s with the raw OBJ. A possible next step is KTX2 textures to cut GPU memory.
- The material mapping is a best guess (see above). Any mesh whose material name isn't in the table shows **magenta**.
