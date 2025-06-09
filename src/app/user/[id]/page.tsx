'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/Header'
import { ReflectionCard } from '@/components/ReflectionCard'
import { ReflectionPrompt } from '@/components/ReflectionPrompt'
import { UserProfileHeader } from '@/components/UserProfileHeader'
import { api } from '@/services/api'
import type { Post, Author, Comment } from '@/services/api'

export default function UserPage() {
  const { id } = useParams()
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [user, setUser] = useState<Author | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts')
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null)
  const [expandedCommentId, setExpandedCommentId] = useState<string | null>(null)

  const isCurrentUser = session?.user?.email && user?.email === session.user.email

  const fetchUserContent = async () => {
    try {
      setIsLoading(true)
      
      // 獲取用戶資訊
      const userResponse = await api.getUser(id as string)
      if (!userResponse.success) {
        setError('User not found')
        return
      }
      setUser(userResponse.data)

      // 如果是當前登入用戶
      if (session?.user?.email && userResponse.data.email === session.user.email) {
        if (activeTab === 'posts') {
          const postsResponse = await api.getMyPosts()
          if (postsResponse.success) {
            const sortedPosts = [...postsResponse.data].sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
            setPosts(sortedPosts)
          }
        } else {
          const commentsResponse = await api.getMyComments()
          if (commentsResponse.success) {
            const sortedComments = [...commentsResponse.data].sort((a, b) => 
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
      } else {
        // 如果是其他用戶，只獲取公開文章
        const postsResponse = await api.getUserPosts(id as string)
        if (postsResponse.success) {
          const publicPosts = postsResponse.data.filter(post => !post.is_anonymous)
          const sortedPosts = publicPosts.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          setPosts(sortedPosts)
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      setError('Error loading user data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchUserContent()
    }
  }, [id, session, activeTab])

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
          description={isCurrentUser ? "Posts & Comments" : "Public Posts"}
        />

        {isCurrentUser ? (
          <>
            {/* Tabs */}
            <div className="relative flex border-b border-white/5 mb-6">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-300 text-center cursor-pointer ${
                  activeTab === 'posts'
                    ? 'text-white'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                Posts
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-300 text-center cursor-pointer ${
                  activeTab === 'comments'
                    ? 'text-white'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                Comments
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
                        user={session?.user}
                        post={post}
                        isExpanded={expandedPostId === post.id}
                        onExpand={handlePostExpand}
                      />
                    ))
                  ) : (
                    <div className="text-center text-white/40 py-6">
                      No posts yet
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
                            {comment.is_anonymous ? session?.user?.name : (comment.author?.name || 'Anonymous User')}
                          </span>
                          {comment.is_anonymous && (
                            <span className="px-1.5 py-0.5 bg-white/10 rounded text-xs text-white/60">
                              Anonymous
                            </span>
                          )}
                        </div>
                        <span className="text-white/30">·</span>
                        <span className="text-white/30">
                          {new Date(comment.created_at).toLocaleDateString('en-US')}
                        </span>
                      </div>

                      {/* Comment Content */}
                      <p className="text-sm text-white/90 mb-2">
                        {comment.content}
                      </p>

                      {/* Original Post Reference */}
                      {comment.post && (
                        <div 
                          className="text-xs bg-white/5 p-2 rounded"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="text-white/50 mb-1">Reply to:</div>
                          <div className="line-clamp-2 text-white/70">
                            {comment.post.content}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-white/40 py-6">
                  No comments yet
                </div>
              )}
            </div>
          </>
        ) : (
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
                No public posts yet
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
} 