import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Loader, SoftShadows } from '@react-three/drei'
import { Bloom, BrightnessContrast, EffectComposer, N8AO, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import Interior from './Interior.jsx'
import { SWATCHES } from './materials.js'

RectAreaLightUniformsLib.init() // required once before any rectAreaLight renders on MeshStandardMaterial

export default function App() {
  const [part, setPart] = useState(null) // clicked part whose swatches are shown
  const [finishes, setFinishes] = useState({}) // part → chosen finish (absent/null = original)
  const pick = (f) => setFinishes({ ...finishes, [part]: f })

  return (
    <>
      {/* fixed camera: centered on the sofa, low, looking straight down -z.
          flat: tone mapping happens in the post stack (AgX) instead of the renderer */}
      <Canvas flat shadows onPointerMissed={() => setPart(null)} dpr={[1, 2]} camera={{ position: [-0.15, 0.6, 4.2], rotation: [0, 0, 0], fov: 45, near: 0.05, far: 100 }}>
        {/* PCSS: sun shadow edges get softer the further they fall from the caster */}
        <SoftShadows size={18} samples={16} focus={0.6} />
        {/* outdoor HDRI: soft sky fill for the room + the view through the window */}
        <Environment preset="park" background environmentIntensity={0.6} />
        {/* faint uniform base so no corner goes black; kept low so the window falloff below reads */}
        <hemisphereLight color="#fff1e0" groundColor="#b8a48c" intensity={0.2} />
        {/* skylight entering through the window opening (x = -2.8, 3 m wide, 2.3 m tall): soft, slightly
            cool, and fades with distance — the room gets darker the further it is from the glass */}
        <rectAreaLight position={[-2.8, 1.3, 0.9]} rotation={[0, -Math.PI / 2, 0]} width={3} height={2.3} intensity={1.2} color="#e6edff" />
        {/* warm bounce off the sunlit floor patch, lifting the sofa front and lower wall (fakes GI) */}
        <pointLight position={[-1.6, 0.7, 1.4]} color="#ffc58f" intensity={0.5} distance={5} decay={2} />
        {/* low warm sun from outside the window wall (x = -2.9); aims at the origin so the
            window-frame shadow lands on the floor and rug in front of the sofa */}
        <directionalLight
          position={[-10, 5.5, 5]}
          color="#ffe2b8"
          intensity={9}
          castShadow
          shadow-mapSize={[4096, 4096]}
          shadow-bias={-0.0004}
          shadow-normalBias={0.02}
          shadow-camera-left={-7}
          shadow-camera-right={7}
          shadow-camera-top={7}
          shadow-camera-bottom={-7}
          shadow-camera-near={1}
          shadow-camera-far={30}
        />
        <Suspense fallback={null}>
          <Interior finishes={finishes} onPick={setPart} />
        </Suspense>
        <EffectComposer multisampling={4}>
          {/* contact shadows in corners, under the sofa, table and pot */}
          <N8AO aoRadius={1} distanceFalloff={1} intensity={4} color="#2a2018" />
          {/* soft glow only where the sun hits bright surfaces */}
          <Bloom mipmapBlur luminanceThreshold={0.7} luminanceSmoothing={0.3} intensity={1.4} radius={0.85} />
          <ToneMapping mode={ToneMappingMode.AGX} />
          {/* AgX is deliberately flat; win back some photographic punch */}
          <BrightnessContrast brightness={0.02} contrast={0.18} />
          <Vignette offset={0.3} darkness={0.45} />
        </EffectComposer>
      </Canvas>
      {part && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 'calc(100vw - 32px)', gap: 10, alignItems: 'center', padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.85)', font: '14px system-ui', textTransform: 'capitalize' }}>
          <b>{part}</b>
          <Swatch label="Original" active={!finishes[part]} onClick={() => pick(null)} style={{ background: '#fff' }}>↺</Swatch>
          {SWATCHES[part].finishes.map((f) => (
            <Swatch key={f.label} label={f.label} active={finishes[part] === f} onClick={() => pick(f)} style={swatchStyle(f)} />
          ))}
        </div>
      )}
      <Loader />
    </>
  )
}

function Swatch({ label, active, onClick, style, children }) {
  return (
    <button onClick={onClick} title={label} aria-label={label} aria-pressed={active} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 64, padding: 0, border: 0, background: 'none', cursor: 'pointer', font: '11px system-ui', textTransform: 'none' }}>
      <span style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #0003', outline: active ? '2px solid #000' : 'none', outlineOffset: 2, display: 'grid', placeItems: 'center', ...style }}>{children}</span>
      {label}
    </button>
  )
}

// texture preview tinted by color (multiply, like the shader), plus a highlight when glossy/metallic
const swatchStyle = (f) => {
  const glossy = f.roughness < 0.4 || f.metalness
  const layers = [glossy && 'radial-gradient(circle at 32% 28%, #fffc, #fff0 38%)', f.map && `url(/textures/${f.map.replace(/\.\w+$/, '.webp')}) center / 300%`].filter(Boolean)
  return {
    background: [...layers, f.color ?? '#fff'].join(', '),
    backgroundBlendMode: [...layers.map((l) => (l.startsWith('url') ? 'multiply' : 'normal')), 'normal'].join(', '),
  }
}
