'use client'

import { useState } from 'react'
import { useComments } from '@/hooks/useComments'
import Image from 'next/image'
import { Session } from 'next-auth';
import { ShareIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

interface Author {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

interface Comment {
  id: string;
  content: string;
  post_id: string;
  author_id: string;
  created_at: string;
  is_anonymous: boolean;
  author?: Author | null;
}

interface Post {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  is_anonymous: boolean;
  author?: Author | null;
  comments?: Comment[];
}

interface Props {
  post: Post;
  isExpanded?: boolean;
  onExpand?: (id: string) => void;
  user?: Session['user'];
}

export function ReflectionCard({ post, isExpanded, onExpand, user }: Props) {
  const router = useRouter()
  const [isCommentOpen, setIsCommentOpen] = useState(isExpanded)
  const [commentContent, setCommentContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const { comments, createComment, isCreating } = useComments(post.id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentContent.trim()) return

    try {
      await createComment({
        content: commentContent,
        isAnonymous
      })
      setCommentContent('')
      setIsAnonymous(false)
    } catch (error) {
      console.error('發表留言失敗:', error)
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest('.share-button') ||
      (e.target as HTMLElement).closest('.comment-section')
    ) {
      return
    }

    onExpand?.(post.id)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsShareModalOpen(true)
  }

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/post/${post.id}`
    try {
      await navigator.clipboard.writeText(url)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('複製連結失敗:', err)
    }
  }

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!post.is_anonymous && post.author?.id) {
      router.push(`/user/${post.author.id}`)
    }
  }

  const renderAvatar = () => {
    const avatarContent = !user?.image && (post.is_anonymous || !post.author?.picture) ? (
      <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
        <span className="text-xs text-white/60">
          {post.is_anonymous ? '?' : (post.author?.name?.[0] || '?')}
        </span>
      </div>
    ) : (
      <div className="w-6 h-6 rounded-full overflow-hidden">
        <Image
          src={post.is_anonymous ? user?.image || '' : post.author?.picture || ''}
          alt={post.is_anonymous ? user?.name || '' : post.author?.name || ''}
          width={24}
          height={24}
          className="w-full h-full object-cover"
        />
      </div>
    )

    // 如果是匿名文章，直接返回頭像
    if (post.is_anonymous) {
      return avatarContent
    }

    // 如果是非匿名文章，包裝在可點擊的按鈕中
    return (
      <button
        onClick={handleAuthorClick}
        className="hover:opacity-80 transition-opacity"
        title="查看作者頁面"
      >
        {avatarContent}
      </button>
    )
  }

  return (
    <>
      <article 
        className={`bg-[#111113] rounded-lg transition-all duration-200 ${
          isExpanded 
            ? 'ring-1 ring-white/10' 
            : 'hover:bg-[#16161A] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] cursor-pointer'
        }`}
        onClick={handleCardClick}
      >
        <div className="p-3">
          {/* Post Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs">
              {renderAvatar()}
              {post.is_anonymous ? (
                <span className="text-white/70">
                  {user?.name || '匿名用戶'}
                </span>
              ) : (
                <button
                  onClick={handleAuthorClick}
                  className="text-white/70 hover:text-white transition-colors"
                  title="查看作者頁面"
                >
                  {post.author?.name || '未命名用戶'}
                </button>
              )}
              {(post.is_anonymous && user?.name) && (
                <span className="px-1.5 py-0.5 bg-white/10 rounded text-xs text-white/60">
                  匿名
                </span>
              )}
              <span className="text-white/30">•</span>
              <time className="text-white/50">
                {new Date(post.created_at).toLocaleDateString()}
              </time>
            </div>
            <button
              onClick={handleShare}
              className="share-button p-1.5 text-white/50 hover:text-white/80 hover:bg-white/5 rounded-full transition-all duration-200"
              title="複製文章連結"
            >
              <ShareIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Post Content */}
          <div className="text-sm text-white/90 whitespace-pre-wrap mb-2">
            {post.content}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between text-xs comment-section">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsCommentOpen(!isCommentOpen)
              }}
              className="text-white/50 hover:text-white/80 transition-colors duration-200"
            >
              留言 ({post.comments?.length || comments?.length || 0})
            </button>
            {!isExpanded && (
              <button
                className="text-white/30 hover:text-white/50 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          {/* Comments Section */}
          {(isExpanded || isCommentOpen) && (
            <div className="comment-section mt-4 space-y-4">
              {/* Comment Form */}
              <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="space-y-3">
                <div className="relative">
                  <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="發表留言..."
                    className="w-full min-h-[100px] p-3 text-sm bg-[#0A0A0B] rounded-lg border border-white/10 placeholder-white/30 text-white/90 focus:outline-none focus:border-white/20 focus:ring-0 transition-colors duration-200 resize-none"
                    style={{ minHeight: '100px' }}
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs text-white/60">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded border-white/20 bg-[#0A0A0B] text-white focus:ring-0 focus:ring-offset-0"
                      />
                      匿名發表
                    </label>
                    <button
                      type="submit"
                      disabled={isCreating || !commentContent.trim()}
                      className="px-4 py-1.5 text-xs bg-white text-black rounded-full hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isCreating ? '發表中...' : '發表'}
                    </button>
                  </div>
                </div>
              </form>

              {/* Comments List */}
              {(post.comments || comments)?.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-white/5">
                  {((post.comments || comments) as Comment[])?.map((comment) => (
                    <div key={comment.id} className="text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white/70">
                          {comment.is_anonymous ? (user?.name || '匿名用戶') : (comment.author?.name || '未命名用戶')}
                        </span>
                        {(comment.is_anonymous && user?.name) && (
                          <span className="px-1.5 py-0.5 bg-white/10 rounded text-xs text-white/60">
                            匿名
                          </span>
                        )}
                        <span className="text-white/30">•</span>
                        <time className="text-white/50">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </time>
                      </div>
                      <p className="text-white/90 leading-relaxed">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </article>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsShareModalOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-[#111113] rounded-lg w-full max-w-md mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-medium text-white">分享文章</h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/post/${post.id}`}
                  className="flex-1 px-3 py-2 bg-black/30 rounded-lg border border-white/10 text-white/90 text-sm focus:outline-none focus:border-white/20"
                />
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors text-sm font-medium"
                >
                  {isCopied ? (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      已複製
                    </>
                  ) : (
                    <>
                      複製連結
                    </>
                  )}
                </button>
              </div>

              <div className="text-sm text-white/60">
                分享這篇文章給其他人，他們可以透過這個連結直接查看文章內容。
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}