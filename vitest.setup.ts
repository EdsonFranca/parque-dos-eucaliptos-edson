import '@testing-library/jest-dom'
import '@testing-library/jest-dom/vitest'
import { config } from 'dotenv'
import { vi } from 'vitest'

config({ path: '.env.test' })

vi.stubGlobal('fetch', vi.fn(async (url: string | URL | Request, options?: RequestInit) => {
  return {
    ok: true,
    json: async () => ({ data: [] }),
    text: async () => '',
  } as Response;
}));
