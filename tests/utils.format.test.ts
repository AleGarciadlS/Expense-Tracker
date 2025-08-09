import { describe, it, expect } from 'vitest'
import { parseUruguayNumber, formatCents } from '../src/utils/format'

describe('parseUruguayNumber', () => {
  it('parses 1.234,56 as cents', () => {
    expect(parseUruguayNumber('1.234,56')).toBe(123456)
  })
  it('parses 1234,56 as cents', () => {
    expect(parseUruguayNumber('1234,56')).toBe(123456)
  })
  it('parses 1234 as cents', () => {
    expect(parseUruguayNumber('1234')).toBe(123400)
  })
  it('returns null for empty', () => {
    expect(parseUruguayNumber('')).toBeNull()
  })
})

describe('formatCents', () => {
  it('formats UYU with es-UY locale', () => {
    const out = formatCents(123456,'UYU')
    expect(out).toMatch(/1\.234,56/)
  })
})