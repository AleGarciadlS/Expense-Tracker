import React, { useMemo } from 'react'
import { Expense } from '../models'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import { formatCents } from '../utils/format'
import { db } from '../db'

const palette = ['#a8a29e','#f97316','#22c55e','#38bdf8','#e879f9','#f43f5e','#eab308']

// Helper to map category_id -> human name
let categoryNameCache: Record<string,string> = {}
async function loadCategoryNameMap(){
  const cats = await db.categories.toArray()
  categoryNameCache = Object.fromEntries(cats.map(c=>[c.id, c.name]))
}
loadCategoryNameMap().catch(()=>{})

export function CategoryPie({rows}:{rows:Expense[]}){
  const totals = useMemo(()=>{
    const map = new Map<string, number>()
    for(const r of rows){
      if (r.category_splits && r.category_splits.length){
        for(const s of r.category_splits){
          const name = categoryNameCache[s.category_id] || 'Uncategorized'
          // Use split amount (already in converted currency from our save step)
          map.set(name, (map.get(name)||0) + (s.amount_cents || 0))
        }
      } else {
        map.set('Uncategorized', (map.get('Uncategorized')||0) + r.converted_amount_cents)
      }
    }
    return Array.from(map.entries()).map(([name,value])=>({name,value}))
  },[rows])

  return (
    <div style={{padding:'0.75rem', border:'1px solid #334155', borderRadius:'1rem'}}>
      <h4 style={{fontWeight:600, marginBottom:'0.5rem'}}>Share by category</h4>
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
