'use client'

import { useSession } from 'next-auth/react'
import { useState, useMemo } from 'react'
import { FireIcon, ChatBubbleLeftIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { useStreak } from '@/hooks/useStreak'
import { useQuery } from '@tanstack/react-query'

interface Comment {
  id: string
  content: string
  created_at: string
  author: string
  picture: string | null
  is_anonymous: boolean
}

interface Post {
  id: string
  content: string
  created_at: string
  streak_count: number
  author: string
  picture: string | null
  is_anonymous: boolean
  comments: Comment[]
}

interface PostsByDate {
  [key: string]: Post[]
}

interface APIPost {
  id: string
  content: string
  author_id: string
  is_anonymous: boolean
  created_at: string
  streak_count?: number
}

interface APIResponse {
  success: boolean
  data: APIPost[]
}

export default function StreakPage() {
  const { data: session } = useSession()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set())
  const [showModal, setShowModal] = useState(false)

  const { data: streakData, isLoading: isLoadingStreak } = useStreak()
  const currentStreak = (streakData as { streak: number })?.streak ?? 0

  const { data: streakPosts = [], isLoading: isLoadingPosts } = useQuery<Post[]>({
    queryKey: ['streakPosts', session?.user?.email],
    queryFn: async () => {
      if (!session?.user?.email) return []
      const response = await fetch(`/api/posts?mine=true&user_email=${session.user.email}`)
      const result = (await response.json()) as APIResponse
      
      // 將用戶資訊加入每個文章中
      return result.success ? result.data.map((post: APIPost) => ({
        ...post,
        author: session.user?.name || 'Unknown',
        picture: session.user?.image || null,
        comments: [], // 如果之後需要評論功能，可以在這裡加入
        streak_count: post.streak_count || currentStreak // 使用當前的 streak 或 0
      })) : []
    },
    enabled: !!session?.user?.email,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  })

  const postsByDate = useMemo(() => {
    // 確保 streakPosts 是陣列
    const posts = Array.isArray(streakPosts) ? streakPosts : []
    
    // 將文章按日期分組
    return posts.reduce((acc: PostsByDate, post: Post) => {
      const postDate = new Date(post.created_at)
    const date = `${postDate.getFullYear()}-${String(postDate.getMonth() + 1).padStart(2, '0')}-${String(postDate.getDate()).padStart(2, '0')}`
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(post)
      return acc
    }, {})
  }, [streakPosts])

  const togglePost = (postId: string) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const handleDateClick = (date: string) => {
    setSelectedDate(date)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedDate(null)
    setExpandedPosts(new Set())
  }

  const renderCalendar = () => {
    const days = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const weeks = []
    let week = []

    // 填充月初的空白日期
    for (let i = 0; i < firstDay; i++) {
      week.push(<div key={`empty-${i}`} className="h-12 sm:h-16 bg-white/5 rounded-lg opacity-50"></div>)
    }

    // 填充日期
    for (let day = 1; day <= days; day++) {
      const dateString = formatDateString(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      )
      const hasPost = postsByDate[dateString]?.length > 0
      const isSelected = dateString === selectedDate
      const isToday = dateString === new Date().toISOString().split('T')[0]

      week.push(
        <button
          key={dateString}
          onClick={() => handleDateClick(dateString)}
          className={`h-12 sm:h-16 rounded-lg p-1 sm:p-2 text-left transition-all relative
            ${hasPost ? 'bg-orange-500/20 hover:bg-orange-500/30' : 'bg-white/5 hover:bg-white/10'}
            ${isSelected ? 'ring-2 ring-orange-500' : ''}
            ${isToday ? 'ring-1 ring-white/20' : ''}
          `}
        >
          <span className="text-xs sm:text-sm font-medium">{day}</span>
          {hasPost && (
            <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2">
              <FireIcon className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
            </div>
          )}
          {hasPost && (
            <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-white/60">
              {postsByDate[dateString].length} posts
            </div>
          )}
        </button>
      )

      if (week.length === 7) {
        weeks.push(
          <div key={`week-${weeks.length}`} className="grid grid-cols-7 gap-1 sm:gap-2">
            {week}
          </div>
        )
        week = []
      }
    }

    // 填充月末的空白日期
    if (week.length > 0) {
      while (week.length < 7) {
        week.push(
          <div
            key={`empty-end-${week.length}`}
            className="h-12 sm:h-16 bg-white/5 rounded-lg opacity-50"
          ></div>
        )
      }
      weeks.push(
        <div key={`week-${weeks.length}`} className="grid grid-cols-7 gap-1 sm:gap-2">
          {week}
        </div>
      )
    }

    return weeks
  }

  const changeMonth = (increment: number) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + increment)
      return newDate
    })
  }

  const renderPost = (post: Post) => {
    const isExpanded = expandedPosts.has(post.id)

    return (
      <div key={post.id} className="bg-white/5 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* 文章頭部信息 */}
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="flex-shrink-0">
            <div className={`relative ${post.is_anonymous ? 'opacity-50' : ''}`}>
              {post.picture ? (
                <Image
                  src={post.picture}
                  alt={post.author}
                  width={32}
                  height={32}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-white/80 text-sm sm:text-base">{post.author?.[0]}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <span className={`font-medium truncate text-sm sm:text-base ${post.is_anonymous ? 'opacity-50' : ''}`}>
                {post.author}
              </span>
              {post.is_anonymous && (
                <span className="px-1 sm:px-1.5 py-0.5 bg-white/10 rounded text-[10px] sm:text-xs text-white/60">
                  Anonymous
                </span>
              )}
              {post.streak_count > 0 && (
                <div className="flex items-center gap-1 text-orange-400">
                  <FireIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-[10px] sm:text-xs font-medium">
                    {post.streak_count} days
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs sm:text-sm text-white/60">
              {new Date(post.created_at).toLocaleString('zh-TW', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <button
            onClick={() => togglePost(post.id)}
            className="flex-shrink-0 text-white/60 hover:text-white transition-colors p-0.5 sm:p-1"
          >
            {isExpanded ? (
              <ChevronUpIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>

        {/* 文章內容 */}
        <div className={`${isExpanded ? '' : 'line-clamp-3'}`}>
          <p className="text-sm sm:text-base text-white/80 whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* 留言區塊 */}
        {isExpanded && post.comments && post.comments.length > 0 && (
          <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-white/60">
              <div className="flex items-center gap-1 sm:gap-2">
                <ChatBubbleLeftIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">{post.comments.length}</span>
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0">
                    <div className={`relative ${comment.is_anonymous ? 'opacity-50' : ''}`}>
                      {comment.picture ? (
                        <Image
                          src={comment.picture}
                          alt={comment.author}
                          width={24}
                          height={24}
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center">
                          <span className="text-white/80 text-xs sm:text-sm">{comment.author?.[0]}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      <span className={`font-medium text-xs sm:text-sm truncate ${comment.is_anonymous ? 'opacity-50' : ''}`}>
                        {comment.author}
                      </span>
                      {comment.is_anonymous && (
                        <span className="px-1 sm:px-1.5 py-0.5 bg-white/10 rounded text-[10px] sm:text-xs text-white/60">
                          Anonymous
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-xs text-white/60 mb-0.5 sm:mb-1">
                      {new Date(comment.created_at).toLocaleString('zh-TW', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-xs sm:text-sm text-white/80 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (isLoadingStreak || isLoadingPosts) {
    return (
      <div className="min-h-screen bg-black/95 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-32 bg-white/5 rounded-lg mb-6"></div>
            <div className="space-y-4">
              <div className="h-16 bg-white/5 rounded-lg"></div>
              <div className="h-16 bg-white/5 rounded-lg"></div>
              <div className="h-16 bg-white/5 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-black/95 text-white p-6">
        <div className="max-w-4xl mx-auto">
          {/* 連續發文統計 */}
          <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <FireIcon className="w-5 h-5 text-orange-400" />
              <h1 className="text-lg font-medium">Streak Record</h1>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-1 bg-black/30 rounded-lg p-2">
                <p className="text-white/60 text-xs">Current Streak</p>
                <p className="text-xl font-medium text-orange-400">{currentStreak} days</p>
              </div>
              <div className="flex-1 bg-black/30 rounded-lg p-2">
                <p className="text-white/60 text-xs">Total Posts</p>
                <p className="text-xl font-medium text-orange-400">{streakPosts.length} posts</p>
              </div>
            </div>
          </div>

          {/* 日曆視圖 */}
          <div className="bg-white/5 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => changeMonth(-1)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <h2 className="text-xl font-semibold">
                {currentMonth.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' })}
              </h2>
              <button
                onClick={() => changeMonth(1)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2 text-sm text-white/60 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="space-y-2">
              {renderCalendar()}
            </div>
          </div>
        </div>
      </div>

      {/* 彈跳視窗 */}
      {showModal && selectedDate && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeModal}
          ></div>
          
          {/* 彈跳視窗內容 */}
          <div className="relative bg-black/95 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden mx-4">
            {/* 標題列 */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-xl font-semibold">
                {new Date(selectedDate).toLocaleDateString('zh-TW', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} posts
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* 文章列表 */}
            <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(80vh-4rem)]">
              {postsByDate[selectedDate]?.map(post => renderPost(post))}
            </div>
          </div>
        </div>
      )}
    </>
  )
} 