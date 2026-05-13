'use client'
import { useState } from 'react'
import { Plus, Pause, Play, Trash2, RefreshCw } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import api from '@/lib/api'
import { useAccounts } from '@/hooks/useAccounts'
import { formatMNT, formatDate } from '@/lib/utils'
import { Skeleton } from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

export default function RecurringPage() {
  const [showAdd, setShowAdd] = useState(false)
  const qc = useQueryClient()

  const { data: recurring, isLoading } = useQuery({
    queryKey: ['recurring'],
    queryFn: () => api.get('/recurring').then(r => r.data),
  })
  const { data: accounts } = useAccounts()
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data),
  })

  const togglePause = useMutation({
    mutationFn: (id: string) => api.patch(`/recurring/${id}/toggle`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring'] }),
  })
  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/recurring/${id}`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['recurring'] }); toast.success('Устгагдлаа') },
  })
  const create = useMutation({
    mutationFn: (data: any) => api.post('/recurring', data).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['recurring'] }); toast.success('Нэмэгдлээ') },
  })

  const { register, handleSubmit, reset } = useForm()

  const onSubmit = async (data: any) => {
    await create.mutateAsync({ ...data, amount: Number(data.amount) })
    reset()
    setShowAdd(false)
  }

  const freqLabel: Record<string, string> = {
    DAILY: 'Өдөр бүр', WEEKLY: '7 хоног бүр',
    MONTHLY: 'Сар бүр', YEARLY: 'Жил бүр',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Тогтмол гүйлгээ</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Автоматаар үүсдэг орлого, зардлууд</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
          <Plus size={16} />
          Нэмэх
        </button>
      </div>

      {showAdd && (
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Шинэ тогтмол гүйлгээ</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input {...register('title', { required: true })} placeholder="Нэр (жш. Цалин, Түрээс)"
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none" />
            <input {...register('amount', { required: true })} type="number" placeholder="Дүн (₮)"
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none" />
            <select {...register('type', { required: true })} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none">
              <option value="INCOME">Орлого</option>
              <option value="EXPENSE">Зарлага</option>
            </select>
            <select {...register('accountId', { required: true })} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none">
              <option value="">Данс сонгоно уу</option>
              {accounts?.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <select {...register('frequency')} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none">
              <option value="MONTHLY">Сар бүр</option>
              <option value="WEEKLY">7 хоног бүр</option>
              <option value="DAILY">Өдөр бүр</option>
              <option value="YEARLY">Жил бүр</option>
            </select>
            <input {...register('startDate', { required: true })} type="date"
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none"
              defaultValue={new Date().toISOString().split('T')[0]} />
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" className="flex-1 bg-primary-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition">Хадгалах</button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition">Болих</button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : recurring?.length ? (
        <div className="card divide-y divide-gray-50 dark:divide-gray-700">
          {recurring.map((r: any) => (
            <div key={r.id} className="flex items-center gap-4 p-4">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                r.type === 'INCOME' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600')}>
                <RefreshCw size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white text-sm">{r.title}</p>
                <p className="text-xs text-gray-400">{freqLabel[r.frequency]} · Дараагийн: {formatDate(r.nextDate)}</p>
              </div>
              <span className={cn('text-sm font-semibold', r.type === 'INCOME' ? 'income-text' : 'expense-text')}>
                {r.type === 'INCOME' ? '+' : '-'}{formatMNT(r.amount)}
              </span>
              <div className="flex gap-1">
                <button onClick={() => togglePause.mutate(r.id)}
                  className={cn('p-2 rounded-xl transition', r.isPaused ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' : 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20')}>
                  {r.isPaused ? <Play size={14} /> : <Pause size={14} />}
                </button>
                <button onClick={() => remove.mutate(r.id)} className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <RefreshCw size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">Тогтмол гүйлгээ байхгүй байна</p>
        </div>
      )}
    </div>
  )
}
