import React from 'react'
import { useAppStore } from '../state/store'
import { db } from '../db'

export function CurrencyToggle(){
  const { currencyView, setCurrencyView } = useAppStore()
  return (
    <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
      <span style={{fontSize:'0.875rem', color:'#94a3b8'}}>Totals in</span>
      <button style={{padding:'0.25rem 0.5rem', borderRadius:'0.5rem', background:currencyView==='UYU'?'#e2e8f0':'transparent', color:currencyView==='UYU'?'#0b1222':'#e2e8f0'}} onClick={()=>setCurrencyView('UYU')}>UYU</button>
      <button style={{padding:'0.25rem 0.5rem', borderRadius:'0.5rem', background:currencyView==='USD'?'#e2e8f0':'transparent', color:currencyView==='USD'?'#0b1222':'#e2e8f0'}} onClick={()=>setCurrencyView('USD')}>USD</button>
    </div>
  )
}

export function ExportCSV(){
  async function onExport(){
    const rows = await db.expenses.toArray()
    const header = ['merchant','receipt_date','native_currency','native_amount','converted_amount','locked_rate']
    const csv = [header.join(',')].concat(rows.map(r=> [r.merchant, r.receipt_date, r.native_currency, (r.native_amount_cents/100).toFixed(2), (r.converted_amount_cents/100).toFixed(2), r.locked_rate].join(','))).join('\n')
    const blob = new Blob([csv],{type:'text/csv'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'expenses.csv'; a.click()
    URL.revokeObjectURL(url)
  }
  return <button style={{padding:'0.5rem 0.75rem', border:'1px solid #475569', borderRadius:'0.5rem'}} onClick={onExport}>Export CSV</button>
}