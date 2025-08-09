export type Currency = 'USD'|'UYU'

export interface Category { id: string; name: string; color?: string; active: boolean }
export interface Budget { id: string; month: string; overall_cents?: number; per_category?: Record<string, number> }

export interface CategorySplit { category_id: string; percent: number; amount_cents: number }

export interface Expense {
  id: string
  created_at: string
  updated_at: string
  merchant: string
  receipt_date: string // YYYY-MM-DD
  native_currency: Currency
  native_amount_cents: number
  converted_amount_cents: number
  locked_rate: number // UYU per USD used for conversion
  category_splits: CategorySplit[]
  notes?: string
  image_ref?: string // blob URL or hash
  ocr_confidence?: number
  duplicate_group_id?: string
}

export interface AuditLog { id: string; expense_id: string; timestamp: string; changes: Record<string, {from:any, to:any}> }