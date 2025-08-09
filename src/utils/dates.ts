export const TZ = 'America/Montevideo'
export function todayYMD(){ return new Date().toLocaleDateString('sv-SE',{timeZone:TZ}) }
export function monthKey(d: Date){
  return new Intl.DateTimeFormat('sv-SE',{ timeZone: TZ, year:'numeric', month:'2-digit'}).format(d)
}