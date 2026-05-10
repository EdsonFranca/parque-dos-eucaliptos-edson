import { defineConfig, loadEnv } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Carrega as variáveis do arquivo .env.test e as injeta no process.env
  const env = loadEnv(mode, process.cwd(), '')
  process.env = { ...process.env, ...env }
  

  return {
    plugins: [react()],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./vitest.setup.ts'],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      },
    },
  }
})
