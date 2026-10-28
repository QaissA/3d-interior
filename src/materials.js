// 1.obj references 1.mtl, which is missing; this table replaces it.
// Keys are the OBJ `usemtl` names, values are texture files in assets/textures/.
// See context.md for how each mapping was chosen.
export const MATERIALS = {
  mat_i2stay0002: { color: '#2b2b2b', roughness: 0.5 },                  // window frames (no UVs)
  mat_i2stay0003: { color: '#f2f0ec', roughness: 0.95 },                 // ceiling + outer shell
  mat_i2stay0008: { map: 'i2stay0008.jpg', roughness: 0.6 },             // curtain
  mat_i2stay0009: { color: '#d8d4cc' },                                  // skirting strip
  mat_i2stay0010: { color: '#3a3a3a' },                                  // outside floor strip
  mat_i2stay0011: { map: 'mat_i2stay0011_diffuse.png', bumpMap: 'mat_i2stay0011_bump.png', roughness: 0.7 }, // concrete floor
  mat_i2stay0012: { map: 'mat_i2stay0012_diffuse.png', bumpMap: 'mat_i2stay0012_bump.png' }, // outside curb
  i2stay0013: { map: 'i2stay0013_diffuse.png', roughness: 0.95 },        // plaster walls
  mat_i2stay0014: { color: '#cfc9c0', roughness: 0.4 },                  // floor thresholds
  i2stay0015: { map: 'i2stay0015.jpg', roughness: 0.8 },                 // concrete wall panel
  mat_i2stay0016: { color: '#4d6b3a', roughness: 0.7 },                  // plant leaves/branches
  i2stay0017: { map: 'i2stay0017_diffuse.png', normalMap: 'i2stay0017_bump.png', roughness: 0.3 }, // dark travertine pot
  mat_i2stay0018: { map: 'mat_i2stay0018_diffuse.png', roughness: 1 },   // rug
  i2stay0019: { map: 'i2stay0019.jpg', roughness: 0.6 },                 // dark wood: sofa plinth, lamp rod
  mat_i2stay0020: { map: 'mat_i2stay0020_diffuse.png', roughness: 1 },   // sofa fabric
  mat_i2stay0021: { color: '#f3eee4', emissive: '#ffd9a0', emissiveIntensity: 0.4 }, // pendant lamp globe
  mat_i2stay0022: { map: 'i2stay0012.png', bumpMap: 'mat_i2stay0022_bump.png', roughness: 0.5 }, // travertine vases
  mat_i2stay0023: { map: 'i2stay0081Bitmap_i2stay0023_baked.png' },      // book (art cover)
  mat_i2stay0024: { map: 'i2stay0106Bitmap_i2stay0024_baked.png' },      // book / tray
  mat_i2stay0025: { map: 'mat_i2stay0025_diffuse.png', roughness: 0.6 }, // coffee table base
  i2stay0027: { map: 'i2stay0027_diffuse.png', roughness: 0.5 },         // coffee table top
}

// Click-to-restyle: each part lists the materials it covers and its finishes.
// A finish sets color (tints `map` if given), roughness (low = glossy/oiled, high = matte) and metalness.
// `map` must be a file already used in MATERIALS above, so it is loaded and converted.
const OAK = 'mat_i2stay0025_diffuse.png'
const DARK_WOOD = 'i2stay0019.jpg'
const TRAVERTINE = 'i2stay0012.png'
const FABRIC = 'mat_i2stay0020_diffuse.png'
const WOOL = 'mat_i2stay0018_diffuse.png'
export const SWATCHES = {
  walls: {
    materials: ['i2stay0013'],
    finishes: [
      { label: 'Matte white', color: '#f4f1ea', roughness: 0.95 },
      { label: 'Matte sage', color: '#c9d3c4', roughness: 0.95 },
      { label: 'Satin blue', color: '#b7c3cf', roughness: 0.5 },
      { label: 'Gloss terracotta', color: '#c98f74', roughness: 0.12 },
      { label: 'Pink plaster', map: 'i2stay0013_diffuse.png', color: '#f0d2c4', roughness: 0.9 },
      { label: 'Concrete', map: 'i2stay0015.jpg', roughness: 0.8 },
    ],
  },
  sofa: {
    materials: ['mat_i2stay0020'],
    finishes: [
      { label: 'Linen olive', map: FABRIC, color: '#9aa486', roughness: 1 },
      { label: 'Linen navy', map: FABRIC, color: '#6a7ca0', roughness: 1 },
      { label: 'Bouclé white', map: WOOL, color: '#ffffff', roughness: 1 },
      { label: 'Leather cognac', color: '#8a4b2a', roughness: 0.35 },
      { label: 'Leather black', color: '#1d1b1a', roughness: 0.28 },
    ],
  },
  table: {
    materials: ['i2stay0027', 'mat_i2stay0025'],
    finishes: [
      { label: 'Oiled oak', map: OAK, roughness: 0.25 },
      { label: 'Matte oak', map: OAK, roughness: 0.95 },
      { label: 'Dark walnut', map: DARK_WOOD, roughness: 0.45 },
      { label: 'Travertine', map: TRAVERTINE, roughness: 0.4 },
      { label: 'Black lacquer', color: '#141414', roughness: 0.08 },
      { label: 'Brushed brass', color: '#c9a35a', roughness: 0.35, metalness: 1 },
    ],
  },
  carpet: {
    materials: ['mat_i2stay0018'],
    finishes: [
      { label: 'Wool slate', map: WOOL, color: '#8a97a8', roughness: 1 },
      { label: 'Wool clay', map: WOOL, color: '#c48a6c', roughness: 1 },
      { label: 'Wool charcoal', map: WOOL, color: '#5a5a5a', roughness: 1 },
      { label: 'Jute', map: FABRIC, color: '#c8a878', roughness: 1 },
    ],
  },
  floor: {
    materials: ['mat_i2stay0011'],
    finishes: [
      { label: 'Polished concrete', map: 'mat_i2stay0011_diffuse.png', roughness: 0.12 },
      { label: 'Oiled oak', map: OAK, roughness: 0.3 },
      { label: 'Dark wood', map: DARK_WOOD, roughness: 0.5 },
      { label: 'Travertine', map: TRAVERTINE, roughness: 0.35 },
      { label: 'Glossy white', color: '#ece8e1', roughness: 0.06 },
      { label: 'Matte grey', color: '#7a7a78', roughness: 0.95 },
    ],
  },
}
