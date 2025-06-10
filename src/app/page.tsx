'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/Header'
import { ReflectionPrompt } from '@/components/ReflectionPrompt'
import { ReflectionCard } from '@/components/ReflectionCard'
import { api } from '@/services/api'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import type { Post } from '@/services/api'
import { LoginPrompt } from '@/components/LoginPrompt'

export default function Home() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const loadingPostRef = useRef<string | null>(null)

  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      const response = await api.getPosts()
      if (response.success && response.data) {
        const sortedPosts = [...(response.data as Post[])].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setPosts(sortedPosts)
      }
    } catch (error) {
      console.error('載入文章時發生錯誤:', error)
      setError('載入文章時發生錯誤')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePostClick = async (postId: string) => {
    // 如果已經選中這篇文章，則返回列表
    if (selectedPost?.id === postId) {
      setSelectedPost(null)
      return
    }

    // 如果這篇文章正在載入中，則不做任何事
    if (loadingPostRef.current === postId) {
      return
    }

    // 先從現有的 posts 中找到對應的文章
    const post = posts.find(p => p.id === postId)
    if (!post) return

    // 立即顯示文章
    setSelectedPost(post)

    try {
      // 標記這篇文章正在載入中
      loadingPostRef.current = postId

      // 在背景加載完整的文章資訊（包含留言）
      const response = await api.getPost(postId)
      
      // 確保使用者還在看這篇文章
      if (response.success && response.data && selectedPost?.id === postId) {
        setSelectedPost(response.data as Post)
      }
    } catch (error) {
      console.error('載入文章詳細資訊時發生錯誤:', error)
    } finally {
      // 清除載入中的標記
      loadingPostRef.current = null
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handlePostCreated = () => {
    fetchPosts()
    setSelectedPost(null)
  }

  const handleBackToList = () => {
    setSelectedPost(null)
  }

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
        {!selectedPost ? (
          <>
            {session && (
              <ReflectionPrompt 
                compact
                showFloatingButton={true}
                onPostCreated={handlePostCreated}
              />
            )}
            <LoginPrompt />
            <div className={`space-y-4 ${session ? 'mt-8' : 'mt-4'}`}>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-[#111113] rounded-lg h-48 animate-pulse" />
                ))
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <ReflectionCard 
                    key={post.id} 
                    post={post}
                    onExpand={handlePostClick}
                  />
                ))
              ) : (
                <div className="text-center text-white/40 py-12">
                  No posts yet
                </div>
              )}
            </div>
          </>
        ) : (
          <div>
            <button 
              onClick={handleBackToList}
              className="flex items-center gap-1 text-white/60 hover:text-white mb-6 transition-colors cursor-pointer"
            >
              <ChevronLeftIcon className="w-5 h-5" />
              <span>Back to Posts</span>
            </button>
            <ReflectionCard 
              post={selectedPost}
              isExpanded={true}
            />
          </div>
        )}
      </div>
    </main>
  )
}
