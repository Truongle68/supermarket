'use client'

import { useEffect, useState, ReactNode } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getAccessToken, clearTokens } from "@/lib/utils/tokenManager"
import { useAuthStore } from "@/lib/store/useAuthStore"
import { UserProfile } from "@/lib/types"
import userService from "../services/user.service"

export default function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const { login, logout } = useAuthStore()
  const [hasToken, setHasToken] = useState<boolean>(false)

  // Initialize token status
  useEffect(() => {
    setHasToken(!!getAccessToken())
  }, [])

  // Fetch profile query
  const { data: profile, error, isSuccess } = useQuery<UserProfile>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const data = await userService.getProfile();
      return data.data;
    },
    enabled: hasToken,
    retry: false,
  })

  // Synchronize profile data with Zustand auth store
  useEffect(() => {
    if (isSuccess && profile) {
      const token = getAccessToken()
      if (token) {
        login(
          {
            email: profile.email || `${profile.username}@example.com`,
            name: profile.full_name || profile.username,
            username: profile.username,
            phone: profile.phone,
            role: profile.role,
          },
          token,
          null
        )
      }
    }
  }, [profile, isSuccess, login])

  // Handle query error (e.g. if token is invalid or request fails)
  useEffect(() => {
    if (error) {
      console.error("[AuthProvider] Profile load failed:", error)
      handleLogout()
    }
  }, [error])

  // Centralized logout function
  const handleLogout = () => {
    clearTokens()
    logout()
    setHasToken(false)
    queryClient.clear()
  }

  // Listen for storage, token:changed, and auth:session_expired events
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === "access_token") {
        setHasToken(!!e.newValue)
        if (!e.newValue) {
          handleLogout()
        } else {
          queryClient.invalidateQueries({ queryKey: ["userProfile"] })
        }
      }
    }

    const handleTokenChanged = () => {
      setHasToken(true)
      queryClient.invalidateQueries({ queryKey: ["userProfile"] })
    }

    const handleSessionExpired = () => {
      console.warn("[AuthProvider] Session expired. Logging out...")
      handleLogout()
    }

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageEvent)
      window.addEventListener("token:changed", handleTokenChanged)
      window.addEventListener("auth:session_expired", handleSessionExpired)
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorageEvent)
        window.removeEventListener("token:changed", handleTokenChanged)
        window.removeEventListener("auth:session_expired", handleSessionExpired)
      }
    }
  }, [queryClient, logout])

  return <>{children}</>
}
