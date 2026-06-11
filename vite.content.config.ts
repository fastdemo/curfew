import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'src/content/overlay.tsx'),
      output: {
        format: 'iife',
        entryFileNames: 'src/content/overlay.js',
        dir: 'dist',
      },
    },
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: false,
    cssCodeSplit: false,
    modulePreload: false,
    minify: 'esbuild',
  },
})
