import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'red' | 'purple'
  trend?: string
}

const colorMap = {
  blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  green: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
}

export function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', colorMap[color])}>
          {icon}
        </div>
      </div>
      <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{value}</p>
      {trend && <p className="text-xs text-gray-400 mt-1">{trend}</p>}
    </div>
  )
}
