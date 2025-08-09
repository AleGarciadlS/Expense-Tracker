import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getRate } from '../src/services/currency'

const LS_KEY = 'bcu-rate-cache-v1'

function seedCache(obj: any){
  localStorage.setItem(LS_KEY, JSON.stringify(obj))
}

describe('currency getRate fallbacks', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('network')) as any))
  })

  it('returns cached rate for the exact date when present', async () => {
    seedCache({
      '2025-08-01': { date: '2025-08-01', UYU_per_USD: 42.5 }
    })
    const r = await getRate('2025-08-01')
    expect(r.UYU_per_USD).toBe(42.5)
  })

  it('falls back to a previous date in cache when exact date missing', async () => {
    seedCache({
      '2025-07-31': { date: '2025-07-31', UYU_per_USD: 42.3 }
    })
    const r = await getRate('2025-08-01')
    expect(r.UYU_per_USD).toBe(42.3)
  })

  it('falls back to the last known cached rate when no nearby dates exist', async () => {
    seedCache({
      '2025-06-15': { date: '2025-06-15', UYU_per_USD: 41.1 },
      '2025-07-10': { date: '2025-07-10', UYU_per_USD: 41.9 }
    })
    const r = await getRate('2025-09-01')
    expect(r.UYU_per_USD).toBe(41.9)
  })

  it('throws RATE_UNAVAILABLE when there is nothing cached at all', async () => {
    await expect(getRate('2025-08-01')).rejects.toThrow('RATE_UNAVAILABLE')
  })
})