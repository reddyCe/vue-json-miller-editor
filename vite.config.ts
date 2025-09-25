import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib'
  
  return {
    plugins: [
      vue(),
      !isLib && vueDevTools(),
    ].filter(Boolean),
    
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    
    build: isLib ? {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'VueJsonEditor',
        fileName: 'vue-json-edtr',
        formats: ['es', 'umd']
      },
      rollupOptions: {
        external: ['vue'],
        output: {
          globals: {
            vue: 'Vue'
          },
          exports: 'named',
          assetFileNames: (assetInfo): string => {
            if (assetInfo.name === 'style.css') {
              return 'vue-json-edtr.css'
            }
            return assetInfo.name || '[name][extname]'
          }
        }
      },
      sourcemap: true,
      minify: 'terser'
    } : {
      // Demo build configuration
      outDir: 'demo-dist'
    }
  }
})
