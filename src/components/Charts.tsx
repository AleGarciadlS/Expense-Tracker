import React, { useMemo } from 'react'
import { Expense } from '../models'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import { formatCents } from '../utils/format'

const palette = ['#a8a29e','#f97316','#22c55e','#38bdf8','#e879f9','#f43f5e','#eab308']

export function CategoryPie({rows}:{rows:Expense[]}){
  const totals = useMemo(()=>{
    const map = new Map<string, number>()
    for(const r of rows){
      map.set(r.merchant, (map.get(r.merchant)||0) + r.converted_amount_cents)
    }
    return Array.from(map.entries()).map(([name,value])=>({name,value}))
  },[rows])

  return (
    <div style={{padding:'0.75rem', border:'1px solid #334155', borderRadius:'1rem'}}>
      <h4 style={{fontWeight:600, marginBottom:'0.5rem'}}>Share by merchant (demo)</h4>
      <div style={{width:'100%', height:260}}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={totals} dataKey="value" nameKey="name" outerRadius={100}>
              {totals.map((_,i)=>(<Cell key={i} fill={palette[i%palette.length]}/>))}
            </Pie>
            <Tooltip formatter={(v:any)=>formatCents(v,'UYU')} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function TrendLine({rows}:{rows:Expense[]}){
  const items = useMemo(()=>{
    const map = new Map<string, number>()
    for(const r of rows){
      map.set(r.receipt_date, (map.get(r.receipt_date)||0) + r.converted_amount_cents)
    }
    return Array.from(map.entries()).sort(([a],[b])=>a.localeCompare(b)).map(([date,total])=>({date,total}))
  },[rows])

  return (
    <div style={{padding:'0.75rem', border:'1px solid #334155', borderRadius:'1rem'}}>
      <h4 style={{fontWeight:600, marginBottom:'0.5rem'}}>Trend within month</h4>
      <div style={{width:'100%', height:260}}>
        <ResponsiveContainer>
          <LineChart data={items}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date"/>
            <YAxis />
            <Tooltip formatter={(v:any)=>formatCents(v,'UYU')} />
            <Line dataKey="total" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}