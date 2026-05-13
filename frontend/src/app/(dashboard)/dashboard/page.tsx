'use client'
import { useState } from 'react'
import { TrendingUp, TrendingDown, Wallet, AlertTriangle } from 'lucide-react'
import {
  PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useTransactionSummary, useTransactions } from '@/hooks/useTransactions'
import { useAccounts } from '@/hooks/useAccounts'
import { useBudgetOverview } from '@/hooks/useBudgets'
import { useMonthlyTrend } from '@/hooks/useReports'
import { formatMNT, getMonthName } from '@/lib/utils'
import { StatCard } from '@/components/ui/StatCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { TransactionRow } from '@/components/transactions/TransactionRow'
import AiAdviceCard from '@/components/dashboard/AiAdviceCard'

export default function DashboardPage() {
  const now = new Date()
  const [month] = useState(now.getMonth() + 1)
  const [year] = useState(now.getFullYear())

  const { data: summary, isLoading: summaryLoading } = useTransactionSummary(month, year)
  const { data: accounts, isLoading: accountsLoading } = useAccounts()
  const { data: budget } = useBudgetOverview(month, year)
  const { data: trend } = useMonthlyTrend(year)
  const { data: recent } = useTransactions({ limit: 5 })

  const totalBalance = accounts?.reduce((s: number, a: any) => s + Number(a.balance), 0) || 0

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Хяналтын самбар</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{year} оны {getMonthName(month)}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryLoading || accountsLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : (
          <>
            <StatCard
              title="Нийт үлдэгдэл"
              value={formatMNT(totalBalance)}
              icon={<Wallet size={20} />}
              color="blue"
            />
            <StatCard
              title="Сарын орлого"
              value={formatMNT(summary?.income || 0)}
              icon={<TrendingUp size={20} />}
              color="green"
              trend={`+${formatMNT(summary?.income || 0)}`}
            />
            <StatCard
              title="Сарын зарлага"
              value={formatMNT(summary?.expense || 0)}
              icon={<TrendingDown size={20} />}
              color="red"
            />
            <StatCard
              title="Цэвэр орлого"
              value={formatMNT((summary?.income || 0) - (summary?.expense || 0))}
              icon={<TrendingUp size={20} />}
              color={(summary?.income || 0) >= (summary?.expense || 0) ? 'green' : 'red'}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Chart */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Сарын орлого / зарлага</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trend || []}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tickFormatter={getMonthName} tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => `${(v / 1000000).toFixed(0)}M`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => formatMNT(v)} labelFormatter={getMonthName} />
              <Legend />
              <Area type="monotone" dataKey="income" name="Орлого" stroke="#10B981" fill="url(#incomeGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="expense" name="Зарлага" stroke="#EF4444" fill="url(#expenseGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Expense by Category */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Зарлагын бүтэц</h3>
          {summary?.byCategory?.length ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={summary.byCategory} dataKey="amount" cx="50%" cy="50%" innerRadius={40} outerRadius={70}>
                    {summary.byCategory.map((entry: any, i: number) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => formatMNT(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {summary.byCategory.slice(0, 5).map((cat: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-gray-600 dark:text-gray-400">{cat.name}</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{formatMNT(cat.amount)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">Мэдээлэл байхгүй</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Сүүлийн гүйлгээнүүд</h3>
          <div className="space-y-1">
            {recent?.data?.map((tx: any) => (
              <TransactionRow key={tx.id} transaction={tx} />
            ))}
            {!recent?.data?.length && (
              <p className="text-gray-400 text-sm text-center py-6">Гүйлгээ байхгүй</p>
            )}
          </div>
        </div>

        {/* Budget Overview */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Төсвийн биелэлт</h3>
            {(budget?.exceeded?.length || 0) > 0 && (
              <span className="flex items-center gap-1 text-xs text-red-500">
                <AlertTriangle size={12} />
                {budget?.exceeded?.length} хэтэрсэн
              </span>
            )}
          </div>
          <div className="space-y-3">
            {budget?.budgets?.slice(0, 5).map((b: any) => (
              <div key={b.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{b.category?.name}</span>
                  <span className={b.isExceeded ? 'text-red-500' : 'text-gray-900 dark:text-white'}>
                    {b.percentage}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${b.isExceeded ? 'bg-red-500' : 'bg-primary-500'}`}
                    style={{ width: `${Math.min(b.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {!budget?.budgets?.length && (
              <p className="text-gray-400 text-sm text-center py-4">Төсөв тохируулаагүй</p>
            )}
          </div>
        </div>
      </div>

      {/* AI Advice */}
      <AiAdviceCard />
    </div>
  )
}
