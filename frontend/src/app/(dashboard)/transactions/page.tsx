'use client'
import { useState } from 'react'
import { Plus, Search, Filter, Download } from 'lucide-react'
import { useTransactions, useDeleteTransaction } from '@/hooks/useTransactions'
import { useAccounts } from '@/hooks/useAccounts'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { formatMNT, formatDate } from '@/lib/utils'
import { TransactionRow } from '@/components/transactions/TransactionRow'
import { Skeleton } from '@/components/ui/Skeleton'
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal'
import toast from 'react-hot-toast'

export default function TransactionsPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showAdd, setShowAdd] = useState(false)

  const { data, isLoading } = useTransactions({ search, type: typeFilter || undefined, page, limit: 20 })
  const deleteTransaction = useDeleteTransaction()

  const handleExportCsv = () => {
    const now = new Date()
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/reports/export/csv?month=${now.getMonth() + 1}&year=${now.getFullYear()}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Гүйлгээнүүд</h1>
        <div className="flex gap-2">
          <button onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <Download size={16} />
            <span className="hidden sm:inline">CSV</span>
          </button>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
            <Plus size={16} />
            Нэмэх
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Хайх..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none"
        >
          <option value="">Бүгд</option>
          <option value="INCOME">Орлого</option>
          <option value="EXPENSE">Зарлага</option>
          <option value="TRANSFER">Шилжүүлэг</option>
        </select>
      </div>

      {/* List */}
      <div className="card divide-y divide-gray-50 dark:divide-gray-700">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : data?.data?.length ? (
          data.data.map((tx: any) => (
            <div key={tx.id} className="px-2">
              <TransactionRow transaction={tx} />
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 py-12">Гүйлгээ байхгүй байна</p>
        )}
      </div>

      {/* Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">
            Өмнөх
          </button>
          <span className="px-4 py-2 text-sm text-gray-500">{page} / {data.meta.totalPages}</span>
          <button onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))} disabled={page === data.meta.totalPages}
            className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">
            Дараах
          </button>
        </div>
      )}

      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}
