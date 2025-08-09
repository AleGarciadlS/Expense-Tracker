import React, { useRef, useState } from 'react'
import { runOCR } from '../services/ocr'
import { ConfirmDrawer } from './ConfirmDrawer'

export function ReceiptCapture(){
  const [file, setFile] = useState<File | null>(null)
  const [ocr, setOcr] = useState<any>(null)
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function onPick(e: React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files?.[0]; if(!f) return
    setFile(f)
    const res = await runOCR(f)
    setOcr(res)
    setOpen(true)
  }

  return (
    <div style={{padding:'1rem', border:'1px solid #334155', borderRadius:'1rem'}}>
      <div style={{display:'flex', gap:'0.75rem', alignItems:'center'}}>
        <button style={{padding:'0.5rem 1rem', borderRadius:'0.75rem', background:'#e2e8f0', color:'#0b1222'}} onClick={()=>inputRef.current?.click()}>Add receipt</button>
        <input ref={inputRef} type="file" accept="image/*" capture="environment" style={{display:'none'}} onChange={onPick}/>
        <span style={{color:'#94a3b8'}}>Take or upload a photo of a receipt</span>
      </div>
      <ConfirmDrawer open={open} setOpen={setOpen} file={file} ocr={ocr}/>
    </div>
  )
}