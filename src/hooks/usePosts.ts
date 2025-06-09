import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { useSession } from 'next-auth/react'

export function usePosts(options?: { mine?: boolean; include?: string[] }) {
  const { data: session } = useSession()

  return useQuery({
    queryKey: ['posts', session?.user?.email, options?.mine, options?.include?.join(',')],
    queryFn: async () => {
      if (!session?.user?.email) {
        return []
      }
      if (options?.mine) {
        const response = await api.getMyPosts()
        if (!response.success) {
          throw new Error(response.error)
        }
        return response.data
      } else {
        const response = await fetch(`/api/posts?user_email=${session.user.email}${options?.include ? `&include=${options.include.join(',')}` : ''}`)
        const data = await response.json()
        return data
      }
    },
    staleTime: 5 * 60 * 1000, // 5 分鐘
    gcTime: 10 * 60 * 1000, // 10 分鐘
    enabled: !!session?.user?.email,
  })
} 