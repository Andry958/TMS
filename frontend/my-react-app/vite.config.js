import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// VITE_PROTOCOL=http -> http://:5174, інакше https://:5173
const useHttp = process.env.VITE_PROTOCOL === 'http'

export default defineConfig({
  plugins: [react(), ...(useHttp ? [] : [basicSsl()])],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    host: true,
    port: useHttp ? 5174 : 5173,
    strictPort: true,
    allowedHosts: [
      'tms.emal.com.ua'
    ],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:7060',
        changeOrigin: true,
        xfwd: true,
      },
    },
  },
})
