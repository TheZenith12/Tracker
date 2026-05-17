import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'
import api from '../lib/api'
import { useAuthStore } from '../store/auth.store'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email('Буруу и-мэйл'),
  password: z.string().min(1, 'Нууц үгээ оруулна уу'),
})

type Form = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const setUser = useAuthStore(s => s.setUser)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: Form) => {
    try {
      const res = await api.post('/auth/login', data)
      localStorage.setItem('accessToken', res.data.accessToken)
      localStorage.setItem('refreshToken', res.data.refreshToken)
      setUser(res.data.user)
      navigate('/dashboard')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Нэвтрэхэд алдаа гарлаа')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Finance Tracker</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Санхүүгийн менежмент</p>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Нэвтрэх</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">И-мэйл</label>
              <input {...register('email')} type="email" placeholder="name@example.com" className="input" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Нууц үг</label>
              <input {...register('password')} type="password" placeholder="••••••••" className="input" />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5 mt-2">
              {isSubmitting ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-4">
            Бүртгэлгүй юу?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">Бүртгүүлэх</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
