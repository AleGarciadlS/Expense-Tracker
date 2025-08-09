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
    }).upgrade(() => { /* no-op for now */ })

    // Seed default categories on first create
    this.on('populate', async () => {
      await this.categories.bulkAdd([
        { id: 'groceries', name: 'Groceries', active: true },
        { id: 'utilities', name: 'Utilities', active: true },
        { id: 'medicine',  name: 'Medicine',  active: true },
        { id: 'transport', name: 'Transport', active: true },
        { id: 'leisure',   name: 'Leisure',   active: true },
        { id: 'home',      name: 'Home',      active: true },
        { id: 'other',     name: 'Other',     active: true },
      ])
    })
  }
}
export const db = new AppDB()
