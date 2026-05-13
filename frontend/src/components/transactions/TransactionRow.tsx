import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react'
import { formatMNT, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Transaction {
  id: string
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  amount: number
  description?: string
  date: string
  category?: { name: string; color: string; icon: string }
  fromAccount?: { name: string }
}

export function TransactionRow({ transaction: tx }: { transaction: Transaction }) {
  const isIncome = tx.type === 'INCOME'
  const isTransfer = tx.type === 'TRANSFER'

  return (
    <div className="flex items-center gap-3 py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition group">
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
        isIncome ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
          : isTransfer ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
          : 'bg-red-100 dark:bg-red-900/30 text-red-600',
      )}>
        {isIncome ? <ArrowDownLeft size={16} /> : isTransfer ? <ArrowLeftRight size={16} /> : <ArrowUpRight size={16} />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {tx.description || tx.category?.name || 'Гүйлгээ'}
        </p>
        <p className="text-xs text-gray-400">
          {tx.fromAccount?.name} · {formatDate(tx.date)}
        </p>
      </div>

      <span className={cn(
        'text-sm font-semibold',
        isIncome ? 'income-text' : isTransfer ? 'text-purple-600' : 'expense-text',
      )}>
        {isIncome ? '+' : '-'}{formatMNT(tx.amount)}
      </span>
    </div>
  )
}
