'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAccounts } from '@/hooks/useAccounts'
import { useCreateTransaction } from '@/hooks/useTransactions'

const schema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  fromAccountId: z.string().min(1, 'Данс сонгоно уу'),
  categoryId: z.string().optional(),
  amount: z.coerce.number().positive('Дүн 0-ээс их байна'),
  description: z.string().optional(),
  date: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function AddTransactionModal({ onClose }: { onClose: () => void }) {
  const { data: accounts } = useAccounts()
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data),
  })
  const create = useCreateTransaction()

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'EXPENSE', date: new Date().toISOString().split('T')[0] },
  })

  const type = watch('type')

  const onSubmit = async (data: FormData) => {
    await create.mutateAsync(data)
    toast.success('Гүйлгээ нэмэгдлээ')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-xl animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Гүйлгээ нэмэх</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Type selector */}
          <div className="grid grid-cols-3 gap-2">
            {(['EXPENSE', 'INCOME', 'TRANSFER'] as const).map(t => (
              <label key={t} className={`flex items-center justify-center py-2.5 rounded-xl border-2 cursor-pointer text-sm font-medium transition ${
                type === t
                  ? t === 'INCOME' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                    : t === 'EXPENSE' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600'
                    : 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600'
                  : 'border-gray-200 dark:border-gray-600 text-gray-500'
              }`}>
                <input {...register('type')} type="radio" value={t} className="sr-only" />
                {t === 'INCOME' ? 'Орлого' : t === 'EXPENSE' ? 'Зарлага' : 'Шилжүүлэг'}
              </label>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Дүн (₮)</label>
            <input
              {...register('amount')}
              type="number"
              placeholder="0"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Данс</label>
            <select {...register('fromAccountId')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Данс сонгоно уу</option>
              {accounts?.map((a: any) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            {errors.fromAccountId && <p className="text-red-500 text-xs mt-1">{errors.fromAccountId.message}</p>}
          </div>

          {type !== 'TRANSFER' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Категори</label>
              <select {...register('categoryId')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">Категори сонгоно уу</option>
                {categories?.filter((c: any) => c.type === type).map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Тайлбар</label>
            <input
              {...register('description')}
              placeholder="Нэмэлт тайлбар..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Огноо</label>
            <input
              {...register('date')}
              type="date"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              Болих
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              Хадгалах
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
