import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // щоб сайт був доступний по локальній IP
    port: 5173, // порт, на якому буде фронт (можеш змінити)
  },
})
