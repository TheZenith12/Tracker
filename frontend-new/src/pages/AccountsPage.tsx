import { useState } from 'react'
import { Plus, Edit2, Trash2, Wallet } from 'lucide-react'
import { useAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount } from '../hooks/useAccounts'
import { Modal } from '../components/ui/Modal'
import { Skeleton } from '../components/ui/Skeleton'
import { formatMNT } from '../lib/utils'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

const TYPES = ['CASH', 'BANK', 'CARD', 'EWALLET']
const TYPE_LABELS: any = { CASH: 'Бэлэн', BANK: 'Банк', CARD: 'Карт', EWALLET: 'Цахим' }
const COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6','#F97316']

function AccountForm({ onSubmit, defaultValues, loading }: any) {
  const { register, handleSubmit } = useForm({ defaultValues })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div><label className="label">Нэр</label><input {...register('name', { required: true })} className="input" placeholder="Миний данс" /></div>
      <div>
        <label className="label">Төрөл</label>
        <select {...register('type')} className="input">
          {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Өнгө</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <label key={c} className="cursor-pointer">
              <input type="radio" {...register('color')} value={c} className="sr-only" />
              <div className="w-7 h-7 rounded-full" style={{ backgroundColor: c }} />
            </label>
          ))}
        </div>
      </div>
      {!defaultValues?.id && (
        <div><label className="label">Анхны үлдэгдэл</label><input {...register('balance', { valueAsNumber: true })} type="number" className="input" defaultValue={0} /></div>
      )}
      <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Хадгалж байна...' : 'Хадгалах'}</button>
    </form>
  )
}

export default function AccountsPage() {
  const { data: accounts, isLoading } = useAccounts()
  const createAcc = useCreateAccount()
  const updateAcc = useUpdateAccount()
  const deleteAcc = useDeleteAccount()
  const [modal, setModal] = useState<{ open: boolean; acc?: any }>({ open: false })

  const handleSubmit = async (data: any) => {
    if (modal.acc) {
      await updateAcc.mutateAsync({ id: modal.acc._id || modal.acc.id, ...data })
    } else {
      await createAcc.mutateAsync(data)
    }
    setModal({ open: false })
  }

  const handleDelete = async (acc: any) => {
    if (!confirm(`"${acc.name}" дансыг устгах уу?`)) return
    deleteAcc.mutate(acc._id || acc.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Данс</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Дансны жагсаалт</p>
        </div>
        <button onClick={() => setModal({ open: true })} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Данс нэмэх
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(accounts || []).map((acc: any) => (
            <div key={acc._id || acc.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: (acc.color || '#3B82F6') + '20' }}>
                    <Wallet size={18} style={{ color: acc.color || '#3B82F6' }} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{acc.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{TYPE_LABELS[acc.type]}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setModal({ open: true, acc })} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"><Edit2 size={14} /></button>
                  {!acc.isDefault && <button onClick={() => handleDelete(acc)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500"><Trash2 size={14} /></button>}
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatMNT(acc.balance)}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{acc.currency}</p>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal.open} onClose={() => setModal({ open: false })} title={modal.acc ? 'Данс засах' : 'Данс нэмэх'}>
        <AccountForm
          onSubmit={handleSubmit}
          loading={createAcc.isPending || updateAcc.isPending}
          defaultValues={modal.acc ? { name: modal.acc.name, type: modal.acc.type, color: modal.acc.color } : { type: 'CASH', color: '#3B82F6' }}
        />
      </Modal>
    </div>
  )
}
