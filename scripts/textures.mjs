// Converts the textures referenced in src/materials.js to 8-bit WebP (max 2048px) in public/textures/.
import sharp from 'sharp'
import { mkdirSync } from 'fs'
import { MATERIALS } from '../src/materials.js'

const files = new Set(Object.values(MATERIALS).flatMap((m) => [m.map, m.bumpMap, m.normalMap].filter(Boolean)))
mkdirSync('public/textures', { recursive: true })
for (const f of files) {
  const out = `public/textures/${f.replace(/\.\w+$/, '.webp')}`
  await sharp(`assets/textures/${f}`, { limitInputPixels: false })
    .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(out)
  console.log(out)
}
