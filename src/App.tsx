import React from 'react'
import { MonthView } from './components/MonthView'
import { CompareView } from './components/CompareView'
import { Settings } from './components/Settings'
import { useAppStore } from './state/store'
import { CurrencyToggle } from './components/ExportCSV'
import './styles.css'

export default function App() {
  const { activeTab, setActiveTab } = useAppStore()
  return (
    <div className="min-h-screen" style={{background:'#0b1222', color:'#e2e8f0'}}>
      <header style={{position:'sticky', top:0, zIndex:10, background:'#0b1222', borderBottom:'1px solid #334155'}}>
        <div style={{maxWidth: '64rem', margin:'0 auto', padding:'1rem', display:'flex', gap:'0.75rem', alignItems:'center'}}>
          <h1 style={{fontSize:'1.25rem', fontWeight:600}}>Receipt Tracker</h1>
          <nav style={{marginLeft:'auto', display:'flex', gap:'0.5rem'}}>
            {(['Month','Compare','Settings'] as const).map(tab => (
              <button key={tab}
                onClick={() => setActiveTab(tab)}
                style={{padding:'0.25rem 0.75rem', borderRadius:'0.5rem', border:'1px solid #475569', background: (useAppStore.getState().activeTab===tab?'#e2e8f0':'transparent'), color:(useAppStore.getState().activeTab===tab?'#0b1222':'#e2e8f0')}}>
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main style={{maxWidth:'64rem', margin:'0 auto', padding:'1rem'}}>
        <div style={{display:'flex', justifyContent:'end', marginBottom:'0.75rem'}}><CurrencyToggle/></div>
        {activeTab==='Month' && <MonthView/>}
        {activeTab==='Compare' && <CompareView/>}
        {activeTab==='Settings' && <Settings/>}
      </main>
    </div>
  )
}