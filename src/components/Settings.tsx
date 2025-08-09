import React from 'react'
import { useAppStore } from '../state/store'

export function Settings(){
  const { currencyView, setCurrencyView } = useAppStore()
  return (
    <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
      <h3 style={{fontSize:'1rem', fontWeight:600}}>Settings</h3>
      <div style={{padding:'0.75rem', border:'1px solid #334155', borderRadius:'1rem', display:'flex', flexDirection:'column', gap:'0.75rem'}}>
        <div style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
          <label style={{minWidth:'10rem'}}>Default totals currency</label>
          <select style={{padding:'0.5rem', borderRadius:'0.5rem', background:'#0b1222', border:'1px solid #475569', color:'#e2e8f0'}} value={currencyView} onChange={e=>setCurrencyView(e.target.value as any)}>
            <option>UYU</option>
            <option>USD</option>
          </select>
        </div>
        <p style={{fontSize:'0.875rem', color:'#94a3b8'}}>Numbers render in Uruguay format (1.234,56). Timezone America/Montevideo.</p>
      </div>
    </div>
  )
}