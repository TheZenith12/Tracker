'use client'
import { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useMonthlyTrend, useCategoryBreakdown, useDailySpending } from '@/hooks/useReports'
import { formatMNT, getMonthName } from '@/lib/utils'
import { Download } from 'lucide-react'

export default function ReportsPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const { data: trend } = useMonthlyTrend(year)
  const { data: categories } = useCategoryBreakdown(month, year)
  const { data: daily } = useDailySpending(month, year)

  const handleExport = () => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/reports/export/csv?month=${month}&year=${year}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Тайлан & Аналитик</h1>
        <div className="flex items-center gap-2">
          <select value={year} onChange={e => setYear(+e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none">
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={month} onChange={e => setMonth(+e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
            ))}
          </select>
          <button onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <Download size={16} />
            CSV
          </button>
        </div>
      </div>

      {/* Annual Trend */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{year} оны орлого / зарлагын хандлага</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={trend || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tickFormatter={getMonthName} tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={v => `${(v / 1000000).toFixed(0)}M`} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: any) => formatMNT(v)} labelFormatter={getMonthName} />
            <Legend />
            <Bar dataKey="income" name="Орлого" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Зарлага" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Spending */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            {getMonthName(month)} өдөр тутмын зарлага
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={daily || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tickFormatter={d => d.split('-')[2]} tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: any) => formatMNT(v)} />
              <Area type="monotone" dataKey="expense" name="Зарлага" stroke="#EF4444" fill="#FEE2E2" strokeWidth={2} />
              <Area type="monotone" dataKey="income" name="Орлого" stroke="#10B981" fill="#D1FAE5" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            {getMonthName(month)} зарлагын ангилал
          </h3>
          {categories?.length ? (
            <div className="flex gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={categories} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70}>
                    {categories.map((c: any, i: number) => <Cell key={i} fill={c.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => formatMNT(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2 overflow-auto max-h-44">
                {categories.map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-gray-600 dark:text-gray-400 truncate max-w-24">{c.name}</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{formatMNT(c.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">Мэдээлэл байхгүй</p>
          )}
        </div>
      </div>
    </div>
  )
}
