'use client'
import { useState } from 'react'
import { Plus, Wallet, CreditCard, Smartphone, Banknote, Trash2, ArrowLeftRight } from 'lucide-react'
import { useAccounts, useCreateAccount, useDeleteAccount, useTransfer } from '@/hooks/useAccounts'
import { useForm } from 'react-hook-form'
import { formatMNT } from '@/lib/utils'
import { Skeleton } from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'

const accountTypeLabel: Record<string, string> = {
  CASH: 'Бэлэн мөнгө', BANK: 'Банк', CARD: 'Карт', EWALLET: 'E-wallet',
}

const accountTypeIcon: Record<string, any> = {
  CASH: Banknote, BANK: Wallet, CARD: CreditCard, EWALLET: Smartphone,
}

export default function AccountsPage() {
  const [showAdd, setShowAdd] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)

  const { data: accounts, isLoading } = useAccounts()
  const createAccount = useCreateAccount()
  const deleteAccount = useDeleteAccount()
  const transfer = useTransfer()

  const { register, handleSubmit, reset } = useForm()
  const transferForm = useForm()

  const totalBalance = accounts?.reduce((s: number, a: any) => s + Number(a.balance), 0) || 0

  const onCreateAccount = async (data: any) => {
    await createAccount.mutateAsync(data)
    toast.success('Данс нэмэгдлээ')
    reset()
    setShowAdd(false)
  }

  const onTransfer = async (data: any) => {
    await transfer.mutateAsync({ ...data, amount: Number(data.amount) })
    toast.success('Шилжүүлэг амжилттай')
    transferForm.reset()
    setShowTransfer(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Данснууд</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowTransfer(!showTransfer)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <ArrowLeftRight size={16} />
            Шилжүүлэг
          </button>
          <button onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
            <Plus size={16} />
            Данс нэмэх
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="card p-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <p className="text-primary-100 text-sm">Нийт үлдэгдэл</p>
        <p className="text-3xl font-bold mt-1">{formatMNT(totalBalance)}</p>
        <p className="text-primary-200 text-xs mt-2">{accounts?.length || 0} данс</p>
      </div>

      {/* Add Account Form */}
      {showAdd && (
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Шинэ данс нэмэх</h3>
          <form onSubmit={handleSubmit(onCreateAccount)} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input {...register('name', { required: true })} placeholder="Дансны нэр"
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <select {...register('type')} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none">
              <option value="CASH">Бэлэн мөнгө</option>
              <option value="BANK">Банк</option>
              <option value="CARD">Карт</option>
              <option value="EWALLET">E-wallet</option>
            </select>
            <select {...register('currency')} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none">
              <option value="MNT">₮ Төгрөг</option>
              <option value="USD">$ Доллар</option>
            </select>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition">
                Нэмэх
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                Болих
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transfer Form */}
      {showTransfer && (
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Данс хооронд шилжүүлэх</h3>
          <form onSubmit={transferForm.handleSubmit(onTransfer)} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select {...transferForm.register('fromAccountId', { required: true })}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none">
              <option value="">Хаанаас</option>
              {accounts?.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <select {...transferForm.register('toAccountId', { required: true })}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none">
              <option value="">Хаашаа</option>
              {accounts?.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <input {...transferForm.register('amount', { required: true })} type="number" placeholder="Дүн (₮)"
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none" />
            <button type="submit" className="bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition">
              Шилжүүлэх
            </button>
          </form>
        </div>
      )}

      {/* Account Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts?.map((account: any) => {
            const Icon = accountTypeIcon[account.type] || Wallet
            return (
              <div key={account.id} className="card p-5 relative group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: account.color + '20', color: account.color }}>
                    <Icon size={18} />
                  </div>
                  {!account.isDefault && (
                    <button onClick={() => deleteAccount.mutateAsync(account.id).then(() => toast.success('Данс устгагдлаа'))}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 transition">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{account.name}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatMNT(Number(account.balance))}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400">{accountTypeLabel[account.type]}</span>
                  <span className="text-xs font-medium text-gray-500">{account.currency}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
