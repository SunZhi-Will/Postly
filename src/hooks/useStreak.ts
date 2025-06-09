import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { useSession } from 'next-auth/react'

export function useStreak() {
  const { data: session } = useSession()

  return useQuery({
    queryKey: ['streak', session?.user?.email],
    queryFn: async () => {
      if (!session?.user?.email) {
        return { streak: 0 }
      }
      const response = await api.getStreak()
      if (!response.success) {
        throw new Error(response.error)
      }
      return response.data
    },
    // 設定快取時間為 5 分鐘
    staleTime: 5 * 60 * 1000,
    // 設定垃圾回收時間為 10 分鐘
    gcTime: 10 * 60 * 1000,
    // 如果沒有 session，則不執行查詢
    enabled: !!session?.user?.email,
  })
} 