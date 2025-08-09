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

      const id = c
