import { create } from 'zustand'
import { getMe, setToken, clearToken, isLoggedIn, type AuthUser } from '@/lib/api'

interface AuthState {
  user: AuthUser | null
  syncing: boolean
  restoreSession: () => Promise<void>
  setUser: (user: AuthUser, token: string) => void
  signOut: () => void
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  syncing: false,

  restoreSession: async () => {
    if (!isLoggedIn()) return
    try {
      const user = await getMe()
      set({ user })
    } catch {
      clearToken()
      set({ user: null })
    }
  },

  setUser: (user, token) => {
    setToken(token)
    set({ user })
  },

  signOut: () => {
    clearToken()
    set({ user: null })
  },
}))
