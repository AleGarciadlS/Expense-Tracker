import Tesseract from 'tesseract.js'
import { parseUruguayNumber } from '../utils/format'

export interface OCRResult { merchant?: string; date?: string; amountCents?: number; currency?: 'USD'|'UYU'; confidence: number }

export async function runOCR(file: File): Promise<OCRResult> {
  const { data } = await Tesseract.recognize(file, 'eng+spa', { logger: ()=>{} })
  const text = data.text || ''
  const conf = data.confidence || 0

  const lines = text.split(/\n+/).map(l=>l.trim()).filter(Boolean)
  const merchant = lines[0]?.slice(0,60)
  const dateMatch = text.match(/(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4})|(\d{4}-\d{2}-\d{2})/)
  const date = dateMatch ? normalizeDate(dateMatch[0]) : undefined
  const currency: 'USD'|'UYU' | undefined = /USD|U\$S|US\$|\$U|UYU/i.test(text) ?
    (/USD|US\$|U\$S/i.test(text) ? 'USD' : 'UYU') : undefined
  const amounts = Array.from(text.matchAll(/[0-9][0-9\.,\s]{0,12}[0-9](?:,[0-9]{2})?/g)).map(m=>m[0])
  let bestCents: number | null = null
  for(const a of amounts){ const c = parseUruguayNumber(a); if(c!==null){ if(bestCents===null || c>bestCents) bestCents=c } }

  return { merchant, date, amountCents: bestCents ?? undefined, currency, confidence: conf/100 }
}

export function normalizeDate(s: string): string | undefined {
  const m = s.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/)
  if(m){
    const [_, d, mo, y] = m as any
    const yr = (y as string).length===2 ? '20'+y : y
    const dt = new Date(Number(yr), Number(mo)-1, Number(d))
    if(!isNaN(dt.getTime())) return dt.toISOString().slice(0,10)
  }
  const iso = s.match(/\d{4}-\d{2}-\d{2}/)?.[0]
  return iso ?? undefined
}