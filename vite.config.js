import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the production build also works when loaded from the
// Android WebView (file://android_asset/...) bundled by Capacitor.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { host: true, port: 5173 },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
