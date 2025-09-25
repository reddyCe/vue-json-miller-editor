import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('test')
  },
  test: {
    environment: 'jsdom',
    globals: true,
    pool: 'forks',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/**/__tests__/**',
        'src/**/*.spec.ts',
        'src/**/*.test.ts',
        'dist/',
        'demo-dist/',
        '*.config.*'
      ]
    }
  }
})
