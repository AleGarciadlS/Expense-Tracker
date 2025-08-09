import React, { useEffect, useMemo, useState } from 'react'
import { Expense, Category } from '../models'
import { parseUruguayNumber } from '../utils/format'
import { getRate } from '../services/currency'
import { db } from '../db'

export function ConfirmDrawer({open,setOpen,file,ocr}:{open:boolean; setOpen:(v:boolean)=>void; file:File|null; ocr:any}){
  const [merchant,setMerchant] = useState('')
  const [date,setDate] = useState('')
  const [currency,setCurrency] = useState<'USD'|'UYU'>('UYU')
  const [amountStr,setAmountStr] = useState('') // editable string (Uruguay format)
  const amountCents = useMemo(()=>parseUruguayNumber(amountStr) ?? 0,[amountStr])

  const [busy,setBusy] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState('other')

  // Prefill from OCR when provided (but always stay editable)
  useEffect(()=>{
    setMerchant(ocr?.merchant || '')
    setDate(ocr?.date || '')
    setCurrency(ocr?.currency || 'UYU')
    setAmountStr(ocr?.amountCents ? (ocr.amountCents/100).toString().replace('.',',') : '')
  }, [ocr])

  // Load categories (filter active in JS to avoid Dexie boolean index typing issues)
  useEffect(()=>{ (async()=>{
    const all = await db.categories.toArray()
    const active = all.filter(c=>c.active)
    setCategories(active)
    if (!active.find(c=>c.id===categoryId) && active.length) setCategoryId(active[0].id)
  })() }, [categoryId])

  const lowConfidence = (ocr?.confidence ?? 0) < 0.6 || !ocr?.amountCents || !ocr?.date

  async function onSave(){
    if(!date || !amountCents || !currency) {
      alert('Please complete required fields')
      return
    }
    setBusy(true)
    try {
      // Lock rate at save time (UYU per USD)
      let rateNum = 1
      if(currency==='USD'){
        try {
          const r = await getRate(date); rateNum = r.UYU_per_USD
        } catch (err) {
          // We fallback to last known rate inside getRate; if none, block save to avoid wrong math
          alert('No exchange rate available yet. Please add a USD receipt after the first successful fetch, or set up the proxy.')
          setBusy(false); return
        }
      }
      const convertedUYU = currency==='USD' ? Math.round(amountCents * rateNum) : amountCents

      const id = crypto.randomUUID()
      const now = new Date().toISOString()
      const exp: Expense = {
        id, created_at: now, updated_at: now,
        merchant: merchant||'—', receipt_date: date,
        native_currency: currency, native_amount_cents: amountCents,
        converted_amount_cents: convertedUYU, locked_rate: rateNum,
        // For now, single-category 100% split; amount stored in converted currency to match charts
        category_splits: [{ category_id: categoryId, percent: 100, amount_cents: convertedUYU }],
        notes: '', image_ref: undefined, ocr_confidence: ocr?.confidence
      }
      if(file){
        const buf = await file.arrayBuffer()
        const blob = new Blob([buf], {type: (file as File).type})
        const url = URL.createObjectURL(blob)
        exp.image_ref = url
      }
      await db.expenses.add(exp)
      setOpen(false)
    } finally { setBusy(false) }
  }

  if(!open) return null
  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'flex-end', justifyContent:'center', zIndex: 9999, //}}>
      <div style={{background:'#1f2937', width:'100%', maxWidth:'36rem', padding:'1rem', borderRadius:'1rem', border:'1px solid #334155',zIndex: 10000, //}}>
        <h3 style={{fontSize:'1rem', fontWeight:600, marginBottom:'0.75rem'}}>
          Confirm expense {lowConfidence && <span style={{marginLeft:'0.5rem', color:'#fbbf24', fontSize:'0.875rem'}}>Low confidence — you can type manually</span>}
        </h3>

        {lowConfidence && (
          <div style={{marginBottom:'0.5rem'}}>
            <button
              onClick={()=>{ setMerchant(''); setDate(''); setCurrency('UYU'); setAmountStr('') }}
              style={{padding:'0.25rem 0.5rem', border:'1px solid #475569', borderRadius:'0.5rem', background:'transparent', color:'#e2e8f0'}}
            >
              Switch to manual entry
            </button>
          </div>
        )}

        <div style={{display:'grid', gap:'0.75rem', gridTemplateColumns:'1fr 1fr'}}>
          <label style={{display:'flex', flexDirection:'column', gap:'0.25rem', gridColumn:'1 / span 2'}}>
            Merchant
            <input style={{padding:'0.5rem', borderRadius:'0.5rem', background:'#0b1222', border:'1px solid #475569', color:'#e2e8f0'}} value={merchant} onChange={e=>setMerchant(e.target.value)} />
          </label>

          <label style={{display:'flex', flexDirection:'column', gap:'0.25rem'}}>
            Date
            <input type="date" style={{padding:'0.5rem', borderRadius:'0.5rem', background:'#0b1222', border:'1px solid #475569', color:'#e2e8f0'}} value={date} onChange={e=>setDate(e.target.value)} />
          </label>

          <label style={{display:'flex', flexDirection:'column', gap:'0.25rem'}}>
            Currency
            <select style={{padding:'0.5rem', borderRadius:'0.5rem', background:'#0b1222', border:'1px solid #475569', color:'#e2e8f0'}} value={currency} onChange={e=>setCurrency(e.target.value as any)}>
              <option>UYU</option>
              <option>USD</option>
            </select>
          </label>

          <label style={{display:'flex', flexDirection:'column', gap:'0.25rem', gridColumn:'1 / span 2'}}>
            Total
            <input
              placeholder="1.234,56"
              style={{padding:'0.5rem', borderRadius:'0.5rem', background:'#0b1222', border:'1px solid #475569', color:'#e2e8f0'}}
              value={amountStr}
              onChange={e=>setAmountStr(e.target.value)}
            />
            <span style={{fontSize:'0.75rem', color:'#94a3b8'}}>Use comma for cents, e.g. 1.234,56</span>
          </label>

          <label style={{display:'flex', flexDirection:'column', gap:'0.25rem', gridColumn:'1 / span 2'}}>
            Category
            <select style={{padding:'0.5rem', borderRadius:'0.5rem', background:'#0b1222', border:'1px solid #475569', color:'#e2e8f0'}} value={categoryId} onChange={e=>setCategoryId(e.target.value)}>
              {categories.map(c=> (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </label>
        </div>

        <div style={{display:'flex', gap:'0.5rem', justifyContent:'end', marginTop:'1rem'}}>
          <button style={{padding:'0.5rem 1rem', borderRadius:'0.5rem', border:'1px solid #475569', background:'transparent', color:'#e2e8f0'}} onClick={()=>setOpen(false)}>Cancel</button>
          <button disabled={busy} style={{padding:'0.5rem 1rem', borderRadius:'0.5rem', background:'#e2e8f0', color:'#0b1222'}} onClick={onSave}>{busy?'Saving…':'Save'}</button>
        </div>
      </div>
    </div>
  )
}
