import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'], // O carregamento do .env já acontece aqui dentro
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
