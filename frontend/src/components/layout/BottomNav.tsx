'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, Wallet, Target, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Самбар', icon: LayoutDashboard },
  { href: '/transactions', label: 'Гүйлгээ', icon: ArrowLeftRight },
  { href: '/accounts', label: 'Данс', icon: Wallet },
  { href: '/budgets', label: 'Төсөв', icon: Target },
  { href: '/reports', label: 'Тайлан', icon: BarChart2 },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex items-center justify-around px-2 pb-safe">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all min-w-0',
              active
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-400 dark:text-gray-500',
            )}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium truncate">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
