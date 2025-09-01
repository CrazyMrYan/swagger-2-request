import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/v2': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: true,
      },
    },
  }
})