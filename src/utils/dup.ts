export function normalizeMerchant(s: string){
  return s.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,40)
}

export async function imageAverageHash(blob: Blob): Promise<string> {
  const bmp = await createImageBitmap(blob)
  const canvas = new OffscreenCanvas(16,16)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bmp,0,0,16,16)
  const { data } = ctx.getImageData(0,0,16,16)
  let gray: number[] = []
  for(let i=0;i<data.length;i+=4){ gray.push(0.299*data[i]+0.587*data[i+1]+0.114*data[i+2]) }
  const mean = gray.reduce((a,b)=>a+b,0)/gray.length
  return gray.map(v=>v>mean? '1':'0').join('')
}