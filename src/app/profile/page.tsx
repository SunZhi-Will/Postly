'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/Header'
import { ReflectionCard } from '@/components/ReflectionCard'
import { ReflectionPrompt } from '@/components/ReflectionPrompt'
import { UserProfileHeader } from '@/components/UserProfileHeader'
import { api } from '@/services/api'

interface Author {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

interface Post {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  is_anonymous: boolean;
  author?: Author | null;
}

interface Comment {
  id: string;
  content: string;
  post_id: string;
  author_id: string;
  created_at: string;
  is_anonymous: boolean;
  author?: Author | null;
  post?: Post;
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts')
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null)
  const [expandedCommentId, setExpandedCommentId] = useState<string | null>(null)

  const fetchUserContent = async () => {
    if (status === 'loading') return
    if (!session) {
      setError('請先登入')
      setIsLoading(false)
      return
    }

    try {
      if (activeTab === 'posts') {
        const postsResponse = await api.getMyPosts()
        if (postsResponse.success && postsResponse.data) {
          const sortedPosts = [...(postsResponse.data as Post[])].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          setPosts(sortedPosts)
        }
      } else if (activeTab === 'comments') {
        const commentsResponse = await api.getMyComments()
        if (commentsResponse.success && commentsResponse.data) {
          const sortedComments = [...(commentsResponse.data as Comment[])].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          
          const postIds = [...new Set(sortedComments.map(comment => comment.post_id))]
          
          const postsMap = new Map<string, Post>()
          if (postIds.length > 0) {
            const postsResponses = await Promise.all(
              postIds.map(id => api.getPost(id))
            )
            postsResponses.forEach((response, index) => {
              if (response.success && response.data) {
                postsMap.set(postIds[index], response.data as Post)
              }
            })
          }

          const commentsWithPosts = sortedComments
            .map(comment => ({
              ...comment,
              post: postsMap.get(comment.post_id),
            }))
            .filter(comment => comment.post !== undefined)

          setComments(commentsWithPosts)
        }
      }
    } catch (error) {
      setError('載入資料時發生錯誤')
      console.error('載入資料時發生錯誤:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserContent()
  }, [session, status, activeTab])

  const handlePostExpand = (postId: string) => {
    setExpandedPostId(expandedPostId === postId ? null : postId)
    setExpandedCommentId(null)
  }

  const handleCommentExpand = (commentId: string) => {
    setExpandedCommentId(expandedCommentId === commentId ? null : commentId)
    setExpandedPostId(null)
  }

  const handlePostCreated = () => {
    fetchUserContent()
  }

  if (status === 'loading' || isLoading) {
    return (
      <main className="min-h-screen bg-[#0A0A0B] text-white">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <ReflectionPrompt 
            compact 
            showFloatingButton
            onPostCreated={handlePostCreated}
          />
          <div className="space-y-6 mt-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#111113] rounded-lg h-48 animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-[#0A0A0B] text-white">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="bg-red-500/10 text-red-500 p-4 rounded-lg text-center">
            請先登入以查看個人頁面
          </div>
        </div>
      </main>
    )
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
        <UserProfileHeader 
          user={session.user}
          description={`${posts.length} 篇文章 · ${comments.length} 則留言`}
        />

        {/* Tabs */}
        <div className="relative flex border-b border-white/5 mb-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-300 text-center ${
              activeTab === 'posts'
                ? 'text-white'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            文章
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-300 text-center ${
              activeTab === 'comments'
                ? 'text-white'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            留言
          </button>
          <div 
            className={`absolute bottom-0 h-0.5 bg-white transition-all duration-300 ease-in-out ${
              activeTab === 'posts' ? 'left-0 w-1/2' : 'left-1/2 w-1/2'
            }`}
          />
        </div>

        {/* Content */}
        <div className="space-y-3">
          {activeTab === 'posts' ? (
            <>
            <ReflectionPrompt 
              compact 
                showFloatingButton
                onPostCreated={handlePostCreated}
              />
            {posts.length > 0 ? (
              posts.map((post) => (
                <ReflectionCard 
                  key={post.id} 
                  user={session.user}
                  post={post}
                  isExpanded={expandedPostId === post.id}
                  onExpand={handlePostExpand}
                />
              ))
            ) : (
              <div className="text-center text-white/40 py-6">
                還沒有發表任何文章
              </div>
              )}
            </>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <div 
                key={comment.id} 
                className={`group bg-[#111113] rounded-lg transition-all duration-200 ${
                  expandedCommentId === comment.id 
                    ? 'ring-1 ring-white/10' 
                    : 'hover:bg-[#16161A] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.05)]'
                }`}
                onClick={() => handleCommentExpand(comment.id)}
              >
                <div className="p-3">
                  {/* Comment Header */}
                  <div className="flex items-center gap-2 mb-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-white/70">
                        {comment.is_anonymous ? session.user.name : (comment.author?.name || '未命名用戶')}
                      </span>
                      {comment.is_anonymous && (
                        <span className="px-1.5 py-0.5 bg-white/10 rounded text-xs text-white/60">
                          匿名
                        </span>
                      )}
                    </div>
                    <span className="text-white/30">•</span>
                    <time className="text-white/50">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </time>
                  </div>

                  {/* Comment Content */}
                  <div className="text-sm text-white/90 mb-2">{comment.content}</div>

                  {/* Referenced Post */}
                  <div className="text-xs text-white/50 bg-[#0A0A0B] rounded p-2">
                    <div className="mb-1">回覆文章：</div>
                    <p className="line-clamp-1">{comment.post?.content || '已刪除的文章'}</p>
                  </div>

                  {/* Expand Button */}
                  <div className="mt-2 flex justify-center">
                    <button
                      className="text-white/30 hover:text-white/50 transition-colors duration-200"
                    >
                      {expandedCommentId === comment.id ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Post */}
                {expandedCommentId === comment.id && comment.post && (
                  <div className="border-t border-white/5">
                    <div className="p-3">
                      <ReflectionCard 
                        post={comment.post}
                        isExpanded={true}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-white/40 py-6">
              還沒有發表任何留言
            </div>
          )}
        </div>
      </div>
    </main>
  )
} 