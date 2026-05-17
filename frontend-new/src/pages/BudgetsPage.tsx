import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useBudgets, useUpsertBudget, useDeleteBudget } from '../hooks/useBudgets'
import { useCategories } from '../hooks/useCategories'
import { Modal } from '../components/ui/Modal'
import { Skeleton } from '../components/ui/Skeleton'
import { formatMNT, getMonthName } from '../lib/utils'
import { useForm } from 'react-hook-form'

function BudgetForm({ onSubmit, categories, loading }: any) {
  const { register, handleSubmit } = useForm()
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Ангилал</label>
        <select {...register('categoryId', { required: true })} className="input">
          <option value="">Сонгох...</option>
          {(categories || []).filter((c: any) => c.type === 'EXPENSE').map((c: any) => (
            <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Дээд хязгаар (₮)</label>
        <input {...register('limit', { required: true, valueAsNumber: true, min: 1 })} type="number" className="input" placeholder="100,000" />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Хадгалж байна...' : 'Хадгалах'}</button>
    </form>
  )
}

export default function BudgetsPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [open, setOpen] = useState(false)

  const { data: budgets, isLoading } = useBudgets(month, year)
  const { data: categories } = useCategories()
  const upsert = useUpsertBudget()
  const deleteBudget = useDeleteBudget()

  const handleSubmit = async (d: any) => {
    await upsert.mutateAsync({ ...d, month, year })
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Төсөв</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">{year} оны {getMonthName(month)}</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Төсөв нэмэх
        </button>
      </div>

      {/* Month selector */}
      <div className="flex gap-2">
        <select value={month} onChange={e => setMonth(+e.target.value)} className="input w-auto">
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>{getMonthName(m)}</option>
          ))}
        </select>
        <select value={year} onChange={e => setYear(+e.target.value)} className="input w-auto">
          {[year - 1, year, year + 1].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : (budgets || []).length ? (
        <div className="space-y-4">
          {(budgets || []).map((b: any) => (
            <div key={b.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white text-sm">{(b.category as any)?.name || 'Ангилал'}</span>
                  {b.isExceeded && <span className="badge-expense">Хэтэрсэн</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${b.isExceeded ? 'expense-text' : 'text-gray-900 dark:text-white'}`}>{b.percentage}%</span>
                  <button onClick={() => deleteBudget.mutate(b.id)} className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg"><Trash2 size={13} /></button>
                </div>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                <div className={`h-full rounded-full transition-all ${b.isExceeded ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(b.percentage, 100)}%` }} />
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400">
                <span>Зарцуулсан: {formatMNT(b.spent)}</span>
                <span>Хязгаар: {formatMNT(b.limit)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <p className="text-gray-400 text-sm">Энэ сарын төсөв тохируулаагүй байна</p>
          <button onClick={() => setOpen(true)} className="btn-primary mt-4 mx-auto">Төсөв нэмэх</button>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Төсөв тохируулах">
        <BudgetForm onSubmit={handleSubmit} categories={categories} loading={upsert.isPending} />
      </Modal>
    </div>
  )
}
