import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import makeManifest from './utils/plugins/make-manifest'
import { outputFolderName } from './utils/constants'

const root = resolve(__dirname, 'src')
const pagesDir = resolve(root, 'pages')
const assetsDir = resolve(root, 'assets')
const outDir = resolve(__dirname, outputFolderName)
const publicDir = resolve(__dirname, 'public')
export default defineConfig({
  resolve: {
    alias: {
      '@src': root,
      '@assets': assetsDir
    }
  },
  plugins: [react(), makeManifest()],
  publicDir,
  build: {
    outDir,
    emptyOutDir: true,
    minify: false,
    rollupOptions: {
      input: {
        background: resolve(root, 'background', 'index.ts'),
        content: resolve(root, 'content', 'index.ts'),
        popup: resolve(root, 'popup', 'index.html'),
        components: resolve(root, 'popup', 'components', 'capture.ts')
      },
      output: {
        entryFileNames: (chunk) => `src/${chunk.name}/index.js`
      }
    }
  }
})
