import { Currency } from '../models'

const nfUYU = new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' })
const nfUSD = new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'USD' })

export function cents(n: number){ return Math.round(n) }
export function formatCents(cents: number, currency: Currency){
  const v = cents/100
  return currency==='UYU' ? nfUYU.format(v) : nfUSD.format(v)
}

export function parseUruguayNumber(input: string): number | null {
  const cleaned = input.replace(/[^0-9.,]/g,'').trim()
  if(!cleaned) return null
  const lastComma = cleaned.lastIndexOf(',')
  const lastDot = cleaned.lastIndexOf('.')
  let normalized = cleaned
  if(lastComma > lastDot){
    normalized = cleaned.replace(/\./g,'').replace(',', '.')
  } else {
    normalized = cleaned.replace(/,/g,'')
  }
  const n = Number(normalized)
  return Number.isFinite(n) ? Math.round(n*100) : null
}