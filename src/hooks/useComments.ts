import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { useSession } from 'next-auth/react'

export function useComments(postId?: string) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', postId, session?.user?.email],
    queryFn: async () => {
      if (!postId || !session?.user?.email) return []
      const response = await api.getPostComments(postId)
      if (!response.success) {
        throw new Error(response.error)
      }
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 分鐘
    gcTime: 10 * 60 * 1000, // 10 分鐘
    enabled: !!postId && !!session?.user?.email,
  })

  const createCommentMutation = useMutation({
    mutationFn: async ({ content, isAnonymous }: { content: string; isAnonymous: boolean }) => {
      if (!postId || !session?.user?.email) throw new Error('未登入或缺少必要參數')
      const response = await api.createComment(postId, content, isAnonymous)
      if (!response.success) {
        throw new Error(response.error)
      }
      return response.data
    },
    onSuccess: () => {
      // 當成功創建評論時，使相關的查詢失效
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })

  return {
    comments,
    isLoading,
    createComment: createCommentMutation.mutate,
    isCreating: createCommentMutation.isPending,
    error: createCommentMutation.error,
  }
} 