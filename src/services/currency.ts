// We call a proxy (Vercel function) to query the BCU SOAP service.
// The proxy URL is provided via VITE_BCU_PROXY env var.

export interface Rate { date: string; UYU_per_USD: number }

const LS_KEY = 'bcu-rate-cache-v1'

function loadCache(): Record<string, Rate> {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') } catch { return {} }
}
function saveCache(cache: Record<string, Rate>){ localStorage.setItem(LS_KEY, JSON.stringify(cache)) }

export async function getRate(date: string): Promise<Rate> {
  const cache = loadCache()
  if (cache[date]) return cache[date]

  // Try proxy first
  try {
    const url = (import.meta.env.VITE_BCU_PROXY || '/api/bcu-proxy') + `?date=${date}`
    const r = await fetch(url)
    if (r.ok) {
      const json = (await r.json()) as Rate
      cache[json.date] = json
      saveCache(cache)
      return json
    }
  } catch {}

  // Fallback 1: previous business days (up to 30)
  for (let i = 1; i <= 30; i++) {
    const d = new Date(date)
    d.setDate(d.getDate() - i)
    const k = d.toISOString().slice(0, 10)
    if (cache[k]) return cache[k]
  }

  // Fallback 2: most recent cached rate
  const all = Object.values(cache)
  if (all.length) {
    all.sort((a, b) => a.date.localeCompare(b.date))
    return all[all.length - 1]
  }

  throw new Error('RATE_UNAVAILABLE')
}