import { Post } from '@/services/api'

interface PostScore {
  post: Post;
  score: number;
}

export class RecommendationService {
  // 計算時間衰減因子 (較新的文章得分較高)
  private calculateTimeDecay(createdAt: string): number {
    const now = new Date().getTime()
    const postDate = new Date(createdAt).getTime()
    const daysDiff = (now - postDate) / (1000 * 60 * 60 * 24)
    // 使用更平緩的衰減曲線，讓較舊但優質的文章也有機會被推薦
    return 1 / (1 + 0.1 * daysDiff)
  }

  // 計算互動分數 (評論和觀看的加權總和)
  private calculateInteractionScore(comments: number, views: number): number {
    const commentWeight = 3  // 評論權重較高
    const viewWeight = 1    // 觀看次數權重較低
    
    // 使用對數轉換來處理大數值，避免極端值主導分數
    const normalizedComments = Math.log(comments + 1)
    const normalizedViews = Math.log(views + 1)
    
    const totalScore = (
      normalizedComments * commentWeight + 
      normalizedViews * viewWeight
    )
    
    // 將分數標準化到 0-1 範圍
    return Math.min(totalScore / 8, 1)
  }

  // 計算內容相似度 (基於標籤匹配)
  private calculateContentSimilarity(userInterests: string[], postTags: string[]): number {
    if (!userInterests.length || !postTags.length) return 0.5 // 當沒有標籤時給予中等分數
    
    // 使用 Jaccard 相似度
    const intersection = postTags.filter(tag => userInterests.includes(tag)).length
    const union = new Set([...userInterests, ...postTags]).size
    
    return intersection / union
  }

  // 計算熱度分數 (基於時間和互動的綜合指標)
  private calculateHotness(post: Post): number {
    const now = new Date().getTime()
    const postDate = new Date(post.created_at).getTime()
    const hoursSincePost = (now - postDate) / (1000 * 60 * 60)
    
    // 計算每小時平均互動數
    const totalInteractions = (
      (post.comments?.length || 0) * 3 + 
      (post.views || 0)
    )
    const interactionsPerHour = totalInteractions / (hoursSincePost + 1)
    
    // 使用對數轉換並標準化
    return Math.min(Math.log(interactionsPerHour + 1) / 4, 1)
  }

  // 主要推薦函數
  public getRecommendedPosts(
    posts: Post[],
    userInterests: string[] = [],
    viewedPosts: Set<string> = new Set()
  ): Post[] {
    // 計算每篇文章的綜合分數
    const scoredPosts: PostScore[] = posts
      .filter(post => !viewedPosts.has(post.id))
      .map(post => {
        const timeScore = this.calculateTimeDecay(post.created_at)
        const interactionScore = this.calculateInteractionScore(
          post.comments?.length || 0,
          post.views || 0
        )
        const similarityScore = this.calculateContentSimilarity(
          userInterests,
          post.tags || []
        )
        const hotnessScore = this.calculateHotness(post)

        // 綜合分數計算 (調整權重分配)
        const totalScore = 
          timeScore * 0.25 +         // 時間衰減
          interactionScore * 0.35 +  // 互動分數（評論和觀看）
          similarityScore * 0.25 +   // 內容相似度
          hotnessScore * 0.15        // 熱度指標

        return {
          post,
          score: totalScore
        }
      })

    // 根據分數排序並返回文章
    return scoredPosts
      .sort((a, b) => b.score - a.score)
      .map(item => item.post)
  }
} 