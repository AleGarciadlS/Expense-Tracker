import { describe, it, expect } from 'vitest'
import { normalizeDate } from '../src/services/ocr'

describe('normalizeDate', () => {
  it('DD/MM/YYYY → YYYY-MM-DD', () => {
    expect(normalizeDate('07/08/2025')).toBe('2025-08-07')
  })
  it('YYYY-MM-DD passthrough', () => {
    expect(normalizeDate('2025-08-07')).toBe('2025-08-07')
  })
  it('invalid returns undefined', () => {
    expect(normalizeDate('32/13/2025')).toBeUndefined()
  })
})