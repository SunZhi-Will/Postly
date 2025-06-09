'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { ReflectionCard } from '@/components/ReflectionCard'
import { api } from '@/services/api'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import type { Post } from '@/services/api'

export default function PostPage() {
  const { id } = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPost = async () => {
    try {
      setIsLoading(true)
      const response = await api.getPost(id as string)
      if (response.success && response.data) {
        setPost(response.data as Post)
      } else {
        setError('找不到此文章')
      }
    } catch (error) {
      console.error('載入文章時發生錯誤:', error)
      setError('載入文章時發生錯誤')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchPost()
    }
  }, [id])

  const handleBackToList = () => {
    router.push('/')
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#0A0A0B] text-white">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="bg-[#111113] rounded-lg h-48 animate-pulse" />
        </div>
      </main>
    )
  }

  if (error || !post) {
    return (
      <main className="min-h-screen bg-[#0A0A0B] text-white">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="bg-red-500/10 text-red-500 p-4 rounded-lg text-center">
            {error || '找不到此文章'}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0A0A0B] text-white">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <button 
          onClick={handleBackToList}
          className="flex items-center gap-1 text-white/60 hover:text-white mb-6 transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5" />
          <span>返回文章列表</span>
        </button>
        <ReflectionCard 
          post={post}
          isExpanded={true}
        />
      </div>
    </main>
  )
}