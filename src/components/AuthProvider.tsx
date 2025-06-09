'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { api } from '@/services/api'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()

  useEffect(() => {
    // 當 session 改變時，更新 API 服務中的 userEmail
    api.setUserEmail(session?.user?.email ?? null)
  }, [session])

  return <>{children}</>
} 