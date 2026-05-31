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
    rollupOptions: {
      // The classic-Bluetooth plugin is only present in the Android (Capacitor)
      // build; the web build loads it lazily and degrades gracefully without it.
      // Mark it external so the web bundle compiles when it isn't installed.
      external: ['@e-is/capacitor-bluetooth-serial'],
    },
  },
})
