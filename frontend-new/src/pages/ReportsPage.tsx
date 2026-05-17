import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { useMonthlyTrend, useCategoryBreakdown, useDailySpending } from '../hooks/useReports'
import { Skeleton } from '../components/ui/Skeleton'
import { formatMNT, getMonthName } from '../lib/utils'

export default function ReportsPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  const { data: trend, isLoading: trendLoading } = useMonthlyTrend(year)
  const { data: cats } = useCategoryBreakdown(month, year)
  const { data: daily } = useDailySpending(month, year)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Тайлан</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Санхүүгийн дүн шинжилгээ</p>
        </div>
        <div className="flex gap-2">
          <select value={month} onChange={e => setMonth(+e.target.value)} className="input w-auto">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{getMonthName(m)}</option>)}
          </select>
          <select value={year} onChange={e => setYear(+e.target.value)} className="input w-auto">
            {[year - 1, year, year + 1].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Monthly trend */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{year} оны орлого / зарлагын хандлага</h3>
        {trendLoading ? <Skeleton className="h-52" /> : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tickFormatter={getMonthName} tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => `${(v/1000000).toFixed(0)}M`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => formatMNT(v)} labelFormatter={getMonthName} />
              <Legend />
              <Bar dataKey="income" name="Орлого" fill="#10B981" radius={[4,4,0,0]} />
              <Bar dataKey="expense" name="Зарлага" fill="#EF4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Зарлагын ангиллаар</h3>
          {(cats || []).length ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={cats} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                    {(cats || []).map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => formatMNT(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {(cats || []).slice(0, 6).map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-gray-600 dark:text-slate-400">{c.name}</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{formatMNT(c.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-gray-400 text-sm text-center py-10">Мэдээлэл байхгүй</p>}
        </div>

        {/* Daily spending */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Өдрийн зарлага</h3>
          {(daily || []).length ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={daily || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(8)} />
                <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => formatMNT(v)} />
                <Bar dataKey="expense" name="Зарлага" fill="#EF4444" radius={[3,3,0,0]} />
                <Bar dataKey="income" name="Орлого" fill="#10B981" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm text-center py-10">Мэдээлэл байхгүй</p>}
        </div>
      </div>
    </div>
  )
}
