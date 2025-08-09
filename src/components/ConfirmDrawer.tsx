import React, { useMemo, useState } from 'react'
import { Expense } from '../models'
import { parseUruguayNumber } from '../utils/format'
import { getRate } from '../services/currency'
import { db } from '../db'

export function ConfirmDrawer({open,setOpen,file,ocr}:{open:boolean; setOpen:(v:boolean)=>void; file:File|null; ocr:any}){
  const [merchant,setMerchant] = useState(ocr?.merchant||'')
  const [date,setDate] = useState(ocr?.date||'')
  const [currency,setCurrency] = useState<'USD'|'UYU'>(ocr?.currency||'UYU')
  const [amountStr,setAmountStr] = useState(ocr?.amountCents ? (ocr.amountCents/100).toString() : '')
  const amountCents = useMemo(()=>parseUruguayNumber(amountStr) ?? 0,[amountStr])
  const [busy,setBusy] = useState(false)
  const lowConfidence = (ocr?.confidence ?? 0) < 0.6 || !ocr?.amountCents || !ocr?.date

  async function onSave(){
    if(!date || !amountCents || !currency) return alert('Please complete required fields')
    setBusy(true)
    try {
      let rateNum = 1
      if(currency==='USD'){
        try {
          const r = await getRate(date); rateNum = r.UYU_per_USD
        } catch (err) {
          alert('No exchange rate available yet. Please add a USD receipt after the first successful fetch, or set up the proxy.')
          setBusy(false)
          return
        }
      }
      const converted = currency==='USD' ? Math.round(amountCents * (rateNum)) : amountCents
      const id = crypto.randomUUID()
      const now = new Date().toISOString()
      const exp: Expense = {
        id, created_at: now, updated_at: now,
        merchant: merchant||'—', receipt_date: date,
        native_currency: currency, native_amount_cents: amountCents,
        converted_amount_cents: converted, locked_rate: rateNum,
        category_splits: [], notes: '', image_ref: undefined, ocr_confidence: ocr?.confidence
      }
      if(file){
        const buf = await file.arrayBuffer()
        const blob = new Blob([buf], {type: file.type})
        const url = URL.createObjectURL(blob)
        exp.image_ref = url
      }
      await db.expenses.add(exp)
      setOpen(false)
    } finally { setBusy(false) }
  }

  if(!open) return null
  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'flex-end', justifyContent:'center'}}>
      <div style={{background:'#1f2937', width:'100%', maxWidth:'36rem', padding:'1rem', borderRadius:'1rem', border:'1px solid #334155'}}>
        <h3 style={{fontSize:'1rem', fontWeight:600, marginBottom:'0.75rem'}}>
          Confirm expense {lowConfidence && <span style={{marginLeft:'0.5rem', color:'#fbbf24', fontSize:'0.875rem'}}>Low confidence — please review</span>}
        </h3>
        <div style={{display:'grid', gap:'0.75rem', gridTemplateColumns:'1fr', alignItems:'center'}}>
          <label style={{display:'flex', flexDirection:'column', gap:'0.25rem'}}>Merchant<input style={{padding:'0.5rem', borderRadius:'0.5rem', background:'#0b1222', border:'1px solid #475569', color:'#e2e8f0'}} value={merchant} onChange={e=>setMerchant(e.target.value)} /></label>
          <label style={{display:'flex', flexDirection:'column', gap:'0.25rem'}}>Date<input type="date" style={{padding:'0.5rem', borderRadius:'0.5rem', background:'#0b1222', border:'1px solid #475569', color:'#e2e8f0'}} value={date} onChange={e=>setDate(e.target.value)} /></label>
          <label style={{display:'flex', flexDirection:'column', gap:'0.25rem'}}>Currency<select style={{padding:'0.5rem', borderRadius:'0.5rem', background:'#0b1222', border:'1px solid #475569', color:'#e2e8f0'}} value={currency} onChange={e=>setCurrency(e.target.value as any)}><option>UYU</option><option>USD</option></select></label>
          <label style={{display:'flex', flexDirection:'column', gap:'0.25rem'}}>Total<input placeholder="1.234,56" style={{padding:'0.5rem', borderRadius:'0.5rem', background:'#0b1222', border:'1px solid #475569', color:'#e2e8f0'}} value={amountStr} onChange={e=>setAmountStr(e.target.value)} /></label>
        </div>
        <div style={{display:'flex', gap:'0.5rem', justifyContent:'end', marginTop:'1rem'}}>
          <button style={{padding:'0.5rem 1rem', borderRadius:'0.5rem', border:'1px solid #475569', background:'transparent', color:'#e2e8f0'}} onClick={()=>setOpen(false)}>Cancel</button>
          <button disabled={busy} style={{padding:'0.5rem 1rem', borderRadius:'0.5rem', background:'#e2e8f0', color:'#0b1222'}} onClick={onSave}>{busy?'Saving…':'Save'}</button>
        </div>
      </div>
    </div>
  )
}