'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/Header'
import { ReflectionCard } from '@/components/ReflectionCard'
import { UserProfileHeader } from '@/components/UserProfileHeader'
import { api } from '@/services/api'
import type { Post, Author } from '@/services/api'

export default function UserPage() {
  const { id } = useParams()
  const [posts, setPosts] = useState<Post[]>([])
  const [user, setUser] = useState<Author | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserAndPosts = async () => {
    try {
      setIsLoading(true)
      
      // 獲取用戶資訊
      const userResponse = await api.getUser(id as string)
      if (!userResponse.success) {
        setError('找不到此用戶')
        return
      }
      setUser(userResponse.data)

      // 獲取用戶的文章
      const postsResponse = await api.getUserPosts(id as string)
      if (postsResponse.success) {
        // 只顯示非匿名的文章
        const publicPosts = postsResponse.data.filter(post => !post.is_anonymous)
        // 按時間排序
        const sortedPosts = publicPosts.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setPosts(sortedPosts)
      } else {
        setPosts([])
      }
    } catch (error) {
      console.error('載入用戶資料時發生錯誤:', error)
      setError('載入用戶資料時發生錯誤')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchUserAndPosts()
    }
  }, [id])

  if (error) {
    return (
      <main className="min-h-screen bg-[#0A0A0B] text-white">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="bg-red-500/10 text-red-500 p-4 rounded-lg text-center">
            {error}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0A0A0B] text-white">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <UserProfileHeader 
          user={user}
          postCount={posts.length}
        />

        {/* Posts List */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-[#111113] rounded-lg h-48 animate-pulse" />
            ))
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <ReflectionCard key={post.id} post={post} />
            ))
          ) : (
            <div className="text-center text-white/40 py-12">
              還沒有任何公開文章
            </div>
          )}
        </div>
      </div>
    </main>
  )
} 