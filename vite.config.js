import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// public/ holds the converted interior.glb + textures (npm run convert); assets/ is the untouched source
export default defineConfig({ plugins: [react()] })
