import { useState } from 'react'
import { Plus, Trash2, Filter } from 'lucide-react'
import { useTransactions, useCreateTransaction, useDeleteTransaction } from '../hooks/useTransactions'
import { useAccounts } from '../hooks/useAccounts'
import { useCategories } from '../hooks/useCategories'
import { Modal } from '../components/ui/Modal'
import { Skeleton } from '../components/ui/Skeleton'
import { formatMNT, formatDate } from '../lib/utils'
import { useForm } from 'react-hook-form'

const TYPES = [
  { value: 'EXPENSE', label: 'Зарлага' },
  { value: 'INCOME', label: 'Орлого' },
  { value: 'TRANSFER', label: 'Шилжүүлэг' },
]

function TxForm({ onSubmit, accounts, categories, loading }: any) {
  const { register, handleSubmit, watch } = useForm({ defaultValues: { type: 'EXPENSE', currency: 'MNT' } })
  const type = watch('type')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Төрөл</label>
        <select {...register('type')} className="input">
          {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Данс</label>
        <select {...register('fromAccountId', { required: true })} className="input">
          <option value="">Сонгох...</option>
          {accounts?.map((a: any) => <option key={a._id || a.id} value={a._id || a.id}>{a.name}</option>)}
        </select>
      </div>
      {type === 'TRANSFER' && (
        <div>
          <label className="label">Хүлээн авах данс</label>
          <select {...register('toAccountId')} className="input">
            <option value="">Сонгох...</option>
            {accounts?.map((a: any) => <option key={a._id || a.id} value={a._id || a.id}>{a.name}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="label">Ангилал</label>
        <select {...register('categoryId')} className="input">
          <option value="">Сонгох...</option>
          {(categories || []).filter((c: any) => type === 'TRANSFER' || c.type === type).map((c: any) => (
            <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Дүн</label>
        <input {...register('amount', { required: true, valueAsNumber: true, min: 1 })} type="number" className="input" placeholder="0" />
      </div>
      <div>
        <label className="label">Тайлбар</label>
        <input {...register('description')} className="input" placeholder="Тайлбар..." />
      </div>
      <div>
        <label className="label">Огноо</label>
        <input {...register('date')} type="date" className="input" defaultValue={new Date().toISOString().split('T')[0]} />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Нэмж байна...' : 'Нэмэх'}</button>
    </form>
  )
}

export default function TransactionsPage() {
  const [page, setPage] = useState(1)
  const [filterType, setFilterType] = useState('')
  const [open, setOpen] = useState(false)

  const { data, isLoading } = useTransactions({ page, limit: 20, type: filterType || undefined })
  const { data: accounts } = useAccounts()
  const { data: categories } = useCategories()
  const createTx = useCreateTransaction()
  const deleteTx = useDeleteTransaction()

  const handleSubmit = async (d: any) => {
    await createTx.mutateAsync(d)
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Гүйлгээ</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Нийт {data?.meta?.total || 0} гүйлгээ</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Нэмэх
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[{ value: '', label: 'Бүгд' }, ...TYPES].map(t => (
          <button key={t.value} onClick={() => { setFilterType(t.value); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterType === t.value ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="card divide-y divide-gray-50 dark:divide-slate-700">
        {isLoading ? (
          <div className="p-4 space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : data?.data?.length ? data.data.map((tx: any) => (
          <div key={tx.id || tx._id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: (tx.category?.color || '#6B7280') + '20' }}>
                {tx.category?.icon || '💳'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{tx.description || tx.category?.name || '-'}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{formatDate(tx.date)} · {(tx.fromAccount as any)?.name || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-semibold ${tx.type === 'INCOME' ? 'income-text' : 'expense-text'}`}>
                {tx.type === 'INCOME' ? '+' : '-'}{formatMNT(tx.amount)}
              </span>
              <button onClick={() => { if (confirm('Устгах уу?')) deleteTx.mutate(tx.id || tx._id) }}
                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        )) : (
          <p className="text-gray-400 text-sm text-center py-12">Гүйлгээ байхгүй</p>
        )}
      </div>

      {/* Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">← Өмнөх</button>
          <span className="px-3 py-1.5 text-sm text-gray-600 dark:text-slate-400">{page} / {data.meta.totalPages}</span>
          <button disabled={page >= data.meta.totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">Дараах →</button>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Гүйлгээ нэмэх">
        <TxForm onSubmit={handleSubmit} accounts={accounts} categories={categories} loading={createTx.isPending} />
      </Modal>
    </div>
  )
}
