import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User { id: string; email: string; name: string; role: string }
interface AuthState {
  user: User | null
  setUser: (u: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      setUser: user => set({ user }),
      logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        set({ user: null })
      },
    }),
    { name: 'auth-store', partialize: s => ({ user: s.user }) },
  ),
)
