'use client'
import { useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor, User, Lock, Bell, Trash2, Save, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { user, setAuth, clearAuth } = useAuthStore()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'appearance'>('profile')

  const { register: regProfile, handleSubmit: handleProfile, formState: { isSubmitting: savingProfile } } = useForm({
    defaultValues: { name: user?.name || '' },
  })

  const { register: regPass, handleSubmit: handlePass, formState: { isSubmitting: savingPass }, reset: resetPass } = useForm<{
    currentPassword: string; newPassword: string; confirmPassword: string
  }>()

  const onSaveProfile = async (data: any) => {
    try {
      const res = await api.put('/users/me', data)
      setAuth(res.data, localStorage.getItem('accessToken')!, localStorage.getItem('refreshToken')!)
      toast.success('Профайл шинэчлэгдлээ')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Алдаа гарлаа')
    }
  }

  const onChangePassword = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Нууц үг таарахгүй байна')
      return
    }
    try {
      await api.put('/users/me/password', { currentPassword: data.currentPassword, newPassword: data.newPassword })
      toast.success('Нууц үг шинэчлэгдлээ')
      resetPass()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Алдаа гарлаа')
    }
  }

  const tabs = [
    { key: 'profile', label: 'Профайл', icon: User },
    { key: 'security', label: 'Нууц үг', icon: Lock },
    { key: 'appearance', label: 'Харагдац', icon: Monitor },
  ] as const

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Тохиргоо</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Бүртгэл болон аппын тохиргоо</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === key
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfile(onSaveProfile)} className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Хувийн мэдээлэл</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Нэр</label>
            <input
              {...regProfile('name', { required: true })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">И-мэйл</label>
            <input
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            disabled={savingProfile}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-xl transition text-sm"
          >
            {savingProfile ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Хадгалах
          </button>
        </form>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <form onSubmit={handlePass(onChangePassword)} className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Нууц үг солих</h2>
          {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((field, i) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {['Одоогийн нууц үг', 'Шинэ нууц үг', 'Шинэ нууц үг давтах'][i]}
              </label>
              <input
                {...regPass(field, { required: true, minLength: field !== 'currentPassword' ? 6 : 1 })}
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                placeholder="••••••••"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={savingPass}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-xl transition text-sm"
          >
            {savingPass ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
            Нууц үг солих
          </button>
        </form>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Харагдацын тохиргоо</h2>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Өнгөт горим</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'light', label: 'Цайвар', icon: Sun },
                { key: 'dark', label: 'Харанхуй', icon: Moon },
                { key: 'system', label: 'Систем', icon: Monitor },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    theme === key
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
