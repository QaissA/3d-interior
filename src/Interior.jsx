import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useTexture } from '@react-three/drei'
import { DoubleSide, Mesh, MeshStandardMaterial, Plane, RepeatWrapping, SRGBColorSpace, Vector3 } from 'three'
import { MATERIALS, SWATCHES } from './materials.js'

const TEXTURE_SLOTS = ['map', 'bumpMap', 'normalMap']
const files = [...new Set(Object.values(MATERIALS).flatMap((m) => TEXTURE_SLOTS.map((s) => m[s]).filter(Boolean)))]
// scripts/textures.mjs writes each source texture as .webp
const urls = Object.fromEntries(files.map((f) => [f, `/textures/${f.replace(/\.\w+$/, '.webp')}`]))
// material name → recolorable part (walls, sofa, …)
const PART = Object.fromEntries(Object.entries(SWATCHES).flatMap(([part, s]) => s.materials.map((m) => [m, part])))
// the wipe sweeps the room width (window wall → right wall, see context.md); the camera looks down -z, so world x = screen x
const WIPE_FROM = -2.94
const WIPE_TO = 2.43
const WIPE_SECONDS = 1.2

export default function Interior({ finishes, onPick }) {
  const { scene } = useGLTF('/interior.glb')
  const tex = useTexture(urls)
  const gl = useThree((s) => s.gl)
  const prev = useRef(finishes)
  const wipe = useRef(null)

  useMemo(() => {
    for (const t of Object.values(tex)) {
      t.flipY = false // glTF UV convention
      t.wrapS = t.wrapT = RepeatWrapping
      t.anisotropy = 8
    }
    scene.traverse((o) => {
      if (!o.isMesh) return
      o.castShadow = o.receiveShadow = true
      // obj2gltf adds "-2" to a material it splits off for meshes without UVs
      const name = o.material.name.replace(/-\d+$/, '')
      const { map, bumpMap, normalMap, ...props } = MATERIALS[name] ?? { color: 'magenta' }
      if (map) tex[map].colorSpace = SRGBColorSpace
      // DoubleSide: Blender shell normals may face outward, which would hide walls from inside
      o.material = new MeshStandardMaterial({
        name,
        side: DoubleSide,
        map: tex[map] ?? null,
        bumpMap: tex[bumpMap] ?? null,
        normalMap: tex[normalMap] ?? null,
        ...props,
      })
      // on the mesh, not the material: Material.clone() JSON-copies userData, which would break the texture
      const { map: m, color, roughness, metalness } = o.material
      o.userData.original = { map: m, color: color.clone(), roughness, metalness }
    })
  }, [scene, tex])

  useEffect(() => {
    gl.localClippingEnabled = true
  }, [gl])

  // swap the new materials in for good and drop the overlays
  const endWipe = () => {
    for (const { mesh, overlay } of wipe.current?.items ?? []) {
      mesh.material.dispose()
      mesh.material = overlay.material
      mesh.material.clippingPlanes = null
      mesh.material.needsUpdate = true
      mesh.remove(overlay)
    }
    wipe.current = null
  }

  useEffect(() => {
    endWipe() // a click mid-wipe finishes the previous one instantly
    const changed = Object.keys(SWATCHES).filter((p) => finishes[p] !== prev.current[p])
    prev.current = finishes
    if (!changed.length) return

    const meshes = []
    scene.traverse((o) => o.isMesh && changed.includes(PART[o.material.name]) && meshes.push(o))
    // new material keeps x <= edge, old keeps x >= edge: the mesh is drawn twice with no overlap, so no z-fighting
    const newSide = new Plane(new Vector3(-1, 0, 0), WIPE_FROM)
    const oldSide = new Plane(new Vector3(1, 0, 0), -WIPE_FROM)
    const items = meshes.map((mesh) => {
      const m = mesh.material.clone()
      const orig = mesh.userData.original
      const f = finishes[PART[m.name]] // undefined/null = original
      m.map = f ? (tex[f.map] ?? null) : orig.map
      m.color.set(f ? (f.color ?? '#fff') : orig.color)
      m.roughness = f?.roughness ?? orig.roughness
      m.metalness = f?.metalness ?? orig.metalness
      m.clippingPlanes = [newSide]
      mesh.material.clippingPlanes = [oldSide]
      mesh.material.needsUpdate = true
      const overlay = new Mesh(mesh.geometry, m) // child, so it inherits the mesh's transform
      overlay.castShadow = overlay.receiveShadow = true
      mesh.add(overlay)
      return { mesh, overlay }
    })
    wipe.current = { items, newSide, oldSide, t: 0 }
  }, [scene, tex, finishes])

  useFrame((_, dt) => {
    const w = wipe.current
    if (!w) return
    w.t = Math.min(1, w.t + dt / WIPE_SECONDS)
    const k = w.t * w.t * (3 - 2 * w.t) // smoothstep ease in/out
    const x = WIPE_FROM + (WIPE_TO - WIPE_FROM) * k
    w.newSide.constant = x
    w.oldSide.constant = -x
    if (w.t === 1) endWipe()
  })

  return (
    <primitive
      object={scene}
      onClick={(e) => {
        e.stopPropagation() // only the nearest hit counts
        onPick(PART[e.object.material.name] ?? null)
      }}
    />
  )
}
