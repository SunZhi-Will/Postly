import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Post } from '@/services/api'
import { RecommendationService } from '@/services/recommendationService'

const recommendationService = new RecommendationService()

export function useRecommendations(posts: Post[]) {
  const { data: session } = useSession()
  const [recommendedPosts, setRecommendedPosts] = useState<Post[]>([])
  const [viewedPosts] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!posts.length) return

    // 使用模擬的興趣數據
    const userInterests = ['technology', 'programming', 'web']

    // 獲取推薦文章
    const recommendations = recommendationService.getRecommendedPosts(
      posts,
      userInterests,
      viewedPosts
    )

    setRecommendedPosts(recommendations)
  }, [posts, session, viewedPosts])

  return {
    recommendedPosts,
    addToViewed: (postId: string) => {
      viewedPosts.add(postId)
    }
  }
} 