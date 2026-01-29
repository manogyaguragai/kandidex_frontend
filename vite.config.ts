import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), 
        // Note: Check backend prefix. If backend routes are /login, then path rewrite strips /api.
        // If backend routes are /api/login, then remove rewrite.
        // Based on client.ts default 'http://localhost:8000', backend likely has routes at root or /api. 
        // Let's assume backend is http://localhost:8000/login etc. based on screenshot request URL.
      }
    }
  },
})
