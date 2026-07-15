import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useEffect, useState } from 'react'

export interface User {
  email: string
  name: string
  role: 'user' | 'admin' | 'staff'
  username?: string
  phone?: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isHydrated: boolean
  login: (user: User, accessToken: string, refreshToken: string) => void
  logout: () => void
  setHydrated: (state: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isHydrated: false,
      login: (user, accessToken, refreshToken) => set({ user, accessToken, refreshToken, isAuthenticated: true }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
      setHydrated: (state) => set({ isHydrated: state }),
    }),
    {
      name: 'supermarket-auth-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return window.sessionStorage
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    }
  )
)

export function useAuth() {
  const store = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return {
    user: mounted ? store.user : null,
    accessToken: mounted ? store.accessToken : null,
    refreshToken: mounted ? store.refreshToken : null,
    isAuthenticated: mounted ? store.isAuthenticated : false,
    isHydrated: store.isHydrated && mounted,
    login: store.login,
    logout: store.logout,
  }
}

