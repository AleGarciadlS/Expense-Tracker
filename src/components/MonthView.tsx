import React, { useEffect, useMemo, useState } from 'react'
import { db } from '../db'
import { Expense } from '../models'
import { formatCents } from '../utils/format'
import { useAppStore } from '../state/store'
import { ReceiptCapture } from './ReceiptCapture'
import { CategoryPie, TrendLine } from './Charts'

export function MonthView(){
  const [month, setMonth] = useState(()=> new Date())
  const [rows, setRows] = useState<Expense[]>([])
  const { currencyView } = useAppStore()

  useEffect(()=>{ (async()=>{
    const y = month.getFullYear(); const m = String(month.getMonth()+1).padStart(2,'0')
    const prefix = `${y}-${m}`
    const all = await db.expenses.where('receipt_date').between(`${prefix}-01`, `${prefix}-31`, true, true).toArray()
    setRows(all)
  })() }, [month])

  const total = useMemo(()=> rows.reduce((a,r)=> a + (currencyView==='UYU' ? r.converted_amount_cents : (r.native_currency==='USD'? r.native_amount_cents : Math.round(r.converted_amount_cents / (r.locked_rate||1)))), 0), [rows, currencyView])

  return (
    <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
      <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}>
        <button style={{padding:'0.25rem 0.5rem', border:'1px solid #475569', borderRadius:'0.5rem'}} onClick={()=>setMonth(m=> new Date(m.getFullYear(), m.getMonth()-1, 1))}>◀</button>
        <div style={{minWidth:'10rem', textAlign:'center'}}>{month.toLocaleDateString('en-GB',{month:'long',year:'numeric'})}</div>
        <button style={{padding:'0.25rem 0.5rem', border:'1px solid #475569', borderRadius:'0.5rem'}} onClick={()=>setMonth(m=> new Date(m.getFullYear(), m.getMonth()+1, 1))}>▶</button>
        <div style={{marginLeft:'auto', fontSize:'1.25rem', fontWeight:600}}>{formatCents(total, currencyView)}</div>
      </div>

      <ReceiptCapture/>

      <ul style={{border:'1px solid #334155', borderRadius:'0.75rem', overflow:'hidden', listStyle:'none', margin:0, padding:0}}>
        {rows.map(r=> (
          <li key={r.id} style={{padding:'0.75rem', display:'flex', alignItems:'center', gap:'0.75rem', borderTop:'1px solid #334155'}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:600}}>{r.merchant}</div>
              <div style={{fontSize:'0.875rem', color:'#94a3b8'}}>{r.receipt_date}</div>
            </div>
            <div style={{textAlign:'right', fontWeight:600, minWidth:'8rem'}}>
              {formatCents((currencyView==='UYU'? r.converted_amount_cents : (r.native_currency==='USD'? r.native_amount_cents : Math.round(r.converted_amount_cents/(r.locked_rate||1)))), currencyView)}
            </div>
          </li>
        ))}
        {rows.length===0 && <li style={{padding:'1rem', textAlign:'center', color:'#94a3b8'}}>No expenses yet this month</li>}
      </ul>

      <div style={{display:'grid', gap:'1rem', gridTemplateColumns:'1fr 1fr'}}>
        <CategoryPie rows={rows}/>
        <TrendLine rows={rows}/>
      </div>
    </div>
  )
}