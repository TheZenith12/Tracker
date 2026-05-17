import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Wallet, ArrowLeftRight, PieChart, BarChart3, LogOut, Menu, X, TrendingUp } from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'
import api from '../../lib/api'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Самбар' },
  { to: '/accounts', icon: Wallet, label: 'Данс' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Гүйлгээ' },
  { to: '/budgets', icon: PieChart, label: 'Төсөв' },
  { to: '/reports', icon: BarChart3, label: 'Тайлан' },
]

export default function DashboardLayout() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch (_) {}
    logout()
    navigate('/login')
    toast.success('Гарлаа')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-white dark:bg-slate-800 border-r border-gray-100 dark:border-slate-700 flex flex-col transform transition-transform lg:translate-x-0 lg:static lg:flex ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100 dark:border-slate-700">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">Finance Tracker</span>
        </div>
        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        {/* User */}
        <div className="px-3 py-4 border-t border-gray-100 dark:border-slate-700">
          <div className="px-3 py-2 mb-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <LogOut size={16} /> Гарах
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar mobile */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
          <button onClick={() => setOpen(true)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
              <TrendingUp size={12} className="text-white" />
            </div>
            <span className="font-bold text-sm text-gray-900 dark:text-white">Finance Tracker</span>
          </div>
          <div className="w-8" />
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
