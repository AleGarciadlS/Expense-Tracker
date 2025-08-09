import { create } from 'zustand'

export type Currency = 'USD'|'UYU'

interface AppState {
  activeTab: 'Month'|'Compare'|'Settings'
  currencyView: Currency
  setActiveTab: (t: AppState['activeTab']) => void
  setCurrencyView: (c: Currency) => void
}

export const useAppStore = create<AppState>((set)=>({
  activeTab: 'Month',
  currencyView: 'UYU',
  setActiveTab: (t)=>set({activeTab: t}),
  setCurrencyView: (c)=>set({currencyView: c}),
}))