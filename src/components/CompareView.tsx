import React, { useEffect, useState } from 'react'
import { db } from '../db'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAppStore } from '../state/store'
import { formatCents } from '../utils/format'

export function CompareView(){
  const [data, setData] = useState<{month:string,total:number}[]>([])
  const { currencyView } = useAppStore()

  useEffect(()=>{ (async()=>{
    const all = await db.expenses.toArray()
    const byMonth = new Map<string, number>()
    for(const r of all){
      const k = r.receipt_date.slice(0,7)
      const v = (currencyView==='UYU'? r.converted_amount_cents : (r.native_currency==='USD'? r.native_amount_cents : Math.round(r.converted_amount_cents/(r.locked_rate||1))))
      byMonth.set(k, (byMonth.get(k)||0) + v)
    }
    const items = Array.from(byMonth.entries()).sort(([a],[b])=> a.localeCompare(b)).slice(-12).map(([m,t])=>({month:m,total:t}))
    setData(items)
  })() }, [currencyView])

  return (
    <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
      <h3 style={{fontSize:'1rem', fontWeight:600}}>Last 12 months</h3>
      <div style={{width:'100%', height:320}}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(v)=>formatCents(v, currencyView)} />
            <Tooltip formatter={(v:any)=>formatCents(v, currencyView)} />
            <Bar dataKey="total" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}