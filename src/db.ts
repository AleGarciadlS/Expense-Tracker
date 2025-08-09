import Dexie, { Table } from 'dexie'
import { Expense, Category, Budget, AuditLog } from './models'

class AppDB extends Dexie {
  expenses!: Table<Expense, string>
  categories!: Table<Category, string>
  budgets!: Table<Budget, string>
  audit!: Table<AuditLog, string>

  constructor(){
    super('receipts-db')
    this.version(2).stores({
      expenses: 'id, receipt_date, merchant, native_amount_cents, converted_amount_cents',
      categories: 'id, name, active',
      budgets: 'id, month',
      audit: 'id, expense_id, timestamp'
    })
  }
}
export const db = new AppDB()