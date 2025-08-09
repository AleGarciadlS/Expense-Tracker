export const config = { runtime: 'edge' }

export default async function handler(req: Request) {
  const url = new URL(req.url)
  const date = url.searchParams.get('date')
  if (!date) return new Response('Missing date', { status: 400 })

  const soap = `<?xml version="1.0" encoding="UTF-8"?>
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cot="Cotiza">
    <soapenv:Header />
    <soapenv:Body>
      <cot:wsbcucotizaciones.Execute>
        <cot:Entrada>
          <cot:Moneda><cot:item>2222</cot:item></cot:Moneda>
          <cot:FechaDesde>${date}</cot:FechaDesde>
          <cot:FechaHasta>${date}</cot:FechaHasta>
          <cot:Grupo>2</cot:Grupo>
        </cot:Entrada>
      </cot:wsbcucotizaciones.Execute>
    </soapenv:Body>
  </soapenv:Envelope>`

  const resp = await fetch('https://cotizaciones.bcu.gub.uy/wscotizaciones/servlet/awsbcucotizaciones', {
    method: 'POST', headers: { 'Content-Type': 'text/xml;charset=UTF-8' }, body: soap
  })
  const xml = await resp.text()
  const get = (tag: string) => (xml.match(new RegExp(`<${tag}>(.*?)</${tag}>`)) || [])[1]
  const fecha = get('Fecha') || date
  const tcv = parseFloat(get('TCV') || '0')
  const forma = get('FormaArbitrar')
  let UYU_per_USD = tcv
  if (forma === '1' && tcv > 0) UYU_per_USD = 1 / tcv
  return new Response(JSON.stringify({ date: fecha.slice(0, 10), UYU_per_USD }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
}