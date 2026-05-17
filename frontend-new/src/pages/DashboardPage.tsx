import { useState } from 'react'
import { TrendingUp, TrendingDown, Wallet, AlertTriangle, Sparkles, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'
import { useTransactionSummary, useTransactions } from '../hooks/useTransactions'
import { useAccounts } from '../hooks/useAccounts'
import { useBudgetOverview } from '../hooks/useBudgets'
import { useMonthlyTrend } from '../hooks/useReports'
import { useAiAdvice } from '../hooks/useAiAdvice'
import { useQueryClient } from '@tanstack/react-query'
import { formatMNT, getMonthName, formatDate } from '../lib/utils'
import { Skeleton } from '../components/ui/Skeleton'

function StatCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  const colors: any = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400',
  }
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500 dark:text-slate-400">{title}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[color] || colors.blue}`}>{icon}</div>
      </div>
      <p className="text-lg font-bold text-gray-900 dark:text-white truncate">{value}</p>
    </div>
  )
}

function AiCard() {
  const [enabled, setEnabled] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const qc = useQueryClient()
  const { data, isLoading, isError } = useAiAdvice(enabled)

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">AI санхүүгийн зөвлөгөө</h3>
        </div>
        <div className="flex items-center gap-1">
          {data && (
            <button onClick={() => setExpanded(v => !v)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
          <button
            onClick={() => { if (enabled) qc.invalidateQueries({ queryKey: ['ai-advice'] }); else { setEnabled(true); setExpanded(true) } }}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 hover:bg-violet-100 disabled:opacity-50"
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            {data ? 'Шинэчлэх' : 'Зөвлөгөө авах'}
          </button>
        </div>
      </div>
      {!enabled && <p className="text-sm text-gray-400 text-center py-6">Дээрх товчийг дарж AI зөвлөгөө авна уу</p>}
      {isLoading && <div className="space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></div>}
      {isError && <p className="text-sm text-red-500 text-center py-4">Зөвлөгөө авахад алдаа гарлаа</p>}
      {data && expanded && (
        <div className="border-t border-gray-100 dark:border-slate-700 pt-4 text-sm text-gray-700 dark:text-gray-300 space-y-2 leading-relaxed">
          {data.advice.split('\n').map((line: string, i: number) => {
            if (line.startsWith('## ')) return <p key={i} className="font-semibold text-gray-900 dark:text-white mt-3 first:mt-0">{line.slice(3)}</p>
            if (line.startsWith('- ')) return <p key={i} className="pl-3 before:content-['•'] before:mr-2 before:text-blue-500">{line.slice(2)}</p>
            if (!line.trim()) return null
            const parts = line.split(/(\*\*[^*]+\*\*)/)
            return <p key={i}>{parts.map((p, j) => p.startsWith('**') && p.endsWith('**') ? <strong key={j} className="text-gray-900 dark:text-white">{p.slice(2,-2)}</strong> : p)}</p>
          })}
          <p className="text-xs text-gray-400 mt-3">{new Date(data.generatedAt).toLocaleString('mn-MN')}</p>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const now = new Date()
  const [month] = useState(now.getMonth() + 1)
  const [year] = useState(now.getFullYear())

  const { data: summary, isLoading: sumLoading } = useTransactionSummary(month, year)
  const { data: accounts, isLoading: accLoading } = useAccounts()
  const { data: budget } = useBudgetOverview(month, year)
  const { data: trend } = useMonthlyTrend(year)
  const { data: recent } = useTransactions({ limit: 5 })

  const totalBalance = (accounts || []).reduce((s: number, a: any) => s + Number(a.balance), 0)
  const netIncome = (summary?.income || 0) - (summary?.expense || 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Хяналтын самбар</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">{year} оны {getMonthName(month)}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {sumLoading || accLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24" />) : (
          <>
            <StatCard title="Нийт үлдэгдэл" value={formatMNT(totalBalance)} icon={<Wallet size={16} />} color="blue" />
            <StatCard title="Сарын орлого" value={formatMNT(summary?.income || 0)} icon={<TrendingUp size={16} />} color="green" />
            <StatCard title="Сарын зарлага" value={formatMNT(summary?.expense || 0)} icon={<TrendingDown size={16} />} color="red" />
            <StatCard title="Цэвэр орлого" value={formatMNT(netIncome)} icon={<TrendingUp size={16} />} color={netIncome >= 0 ? 'green' : 'red'} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend chart */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Сарын орлого / зарлага</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trend || []}>
              <defs>
                <linearGradient id="ig" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.15} /><stop offset="95%" stopColor="#10B981" stopOpacity={0} /></linearGradient>
                <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} /><stop offset="95%" stopColor="#EF4444" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tickFormatter={getMonthName} tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => `${(v/1000000).toFixed(0)}M`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => formatMNT(v)} labelFormatter={getMonthName} />
              <Legend />
              <Area type="monotone" dataKey="income" name="Орлого" stroke="#10B981" fill="url(#ig)" strokeWidth={2} />
              <Area type="monotone" dataKey="expense" name="Зарлага" stroke="#EF4444" fill="url(#eg)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Зарлагын бүтэц</h3>
          {summary?.byCategory?.length ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={summary.byCategory} dataKey="amount" cx="50%" cy="50%" innerRadius={35} outerRadius={65}>
                    {summary.byCategory.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => formatMNT(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {summary.byCategory.slice(0, 5).map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-gray-600 dark:text-slate-400 text-xs">{c.name}</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white text-xs">{formatMNT(c.amount)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-gray-400 text-sm text-center py-8">Мэдээлэл байхгүй</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent transactions */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Сүүлийн гүйлгээнүүд</h3>
          <div className="space-y-2">
            {recent?.data?.map((tx: any) => (
              <div key={tx.id || tx._id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-slate-700/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: tx.category?.color ? tx.category.color + '20' : '#6B728020' }}>
                    <span className="text-xs">{tx.category?.icon || '💳'}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{tx.description || tx.category?.name || '-'}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{formatDate(tx.date)}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${tx.type === 'INCOME' ? 'income-text' : 'expense-text'}`}>
                  {tx.type === 'INCOME' ? '+' : '-'}{formatMNT(tx.amount)}
                </span>
              </div>
            ))}
            {!recent?.data?.length && <p className="text-gray-400 text-sm text-center py-6">Гүйлгээ байхгүй</p>}
          </div>
        </div>

        {/* Budget overview */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Төсвийн биелэлт</h3>
            {(budget?.exceeded?.length || 0) > 0 && (
              <span className="flex items-center gap-1 text-xs text-red-500"><AlertTriangle size={12} />{budget?.exceeded?.length}</span>
            )}
          </div>
          <div className="space-y-3">
            {budget?.budgets?.slice(0, 5).map((b: any) => (
              <div key={b.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 dark:text-slate-400">{(b.category as any)?.name || 'Ангилал'}</span>
                  <span className={b.isExceeded ? 'text-red-500' : 'text-gray-900 dark:text-white'}>{b.percentage}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${b.isExceeded ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(b.percentage, 100)}%` }} />
                </div>
              </div>
            ))}
            {!budget?.budgets?.length && <p className="text-gray-400 text-sm text-center py-4">Төсөв тохируулаагүй</p>}
          </div>
        </div>
      </div>

      <AiCard />
    </div>
  )
}
