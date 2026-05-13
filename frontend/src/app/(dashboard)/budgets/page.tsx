'use client'
import { useState } from 'react'
import { Plus, AlertTriangle, CheckCircle } from 'lucide-react'
import { useBudgets, useUpsertBudget } from '@/hooks/useBudgets'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import api from '@/lib/api'
import { formatMNT, getMonthName } from '@/lib/utils'
import { Skeleton } from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'

export default function BudgetsPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year] = useState(now.getFullYear())
  const [showForm, setShowForm] = useState(false)

  const { data: budgets, isLoading } = useBudgets(month, year)
  const upsert = useUpsertBudget()
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data),
  })

  const { register, handleSubmit, reset } = useForm()

  const onSubmit = async (data: any) => {
    await upsert.mutateAsync({ ...data, month, year, limit: Number(data.limit) })
    toast.success('Төсөв хадгалагдлаа')
    reset()
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Сарын төсөв</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{year} оны {getMonthName(month)}</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={month} onChange={e => setMonth(+e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
            ))}
          </select>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
            <Plus size={16} />
            Нэмэх
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Шинэ төсөв</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap gap-3">
            <select {...register('categoryId', { required: true })}
              className="flex-1 min-w-40 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none">
              <option value="">Категори</option>
              {categories?.filter((c: any) => c.type === 'EXPENSE').map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input {...register('limit', { required: true })} type="number" placeholder="Лимит (₮)"
              className="flex-1 min-w-32 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none" />
            <button type="submit" className="bg-primary-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition">
              Хадгалах
            </button>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : budgets?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b: any) => (
            <div key={b.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: b.category?.color + '20', color: b.category?.color }}>
                    <span className="text-xs font-bold">{b.category?.name?.[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{b.category?.name}</p>
                    <p className="text-xs text-gray-400">Лимит: {formatMNT(b.limit)}</p>
                  </div>
                </div>
                {b.isExceeded
                  ? <AlertTriangle size={18} className="text-red-500" />
                  : <CheckCircle size={18} className="text-emerald-500" />
                }
              </div>

              <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all ${b.isExceeded ? 'bg-red-500' : b.percentage > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(b.percentage, 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span>Зарцуулсан: <strong className={b.isExceeded ? 'text-red-500' : 'text-gray-900 dark:text-white'}>{formatMNT(b.spent)}</strong></span>
                <span className={b.isExceeded ? 'text-red-500' : 'text-gray-900 dark:text-white'}>
                  {b.isExceeded ? `${formatMNT(Math.abs(b.remaining))} хэтэрсэн` : `${formatMNT(b.remaining)} үлдсэн`}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <p className="text-gray-400">Энэ сарын төсөв байхгүй байна</p>
          <button onClick={() => setShowForm(true)} className="mt-4 text-primary-600 text-sm font-medium hover:underline">
            Төсөв нэмэх
          </button>
        </div>
      )}
    </div>
  )
}
