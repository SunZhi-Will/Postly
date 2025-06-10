'use client'

import { useState } from 'react'
import { useComments } from '@/hooks/useComments'
import Image from 'next/image'
import { Session } from 'next-auth';
import { ShareIcon, XMarkIcon, CheckIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow, isAfter, subDays, format } from 'date-fns'
import { enUS } from 'date-fns/locale'

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
  updated_at: string;
  is_anonymous: boolean;
  author: Author;
  likes?: string[];
  comments?: Comment[];
  tags?: string[];
  views?: number;
}

interface Props {
  post: Post;
  isExpanded?: boolean;
  onExpand?: (id: string) => void;
  user?: Session['user'];
}

const formatPostDate = (date: string) => {
  const postDate = new Date(date)
  const sevenDaysAgo = subDays(new Date(), 7)
  
  if (isAfter(postDate, sevenDaysAgo)) {
    return formatDistanceToNow(postDate, { 
      addSuffix: true,
      locale: enUS 
    })
  }
  
  return format(postDate, 'MM/dd/yyyy', { locale: enUS })
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
        className="hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-start gap-2"
        title="View author page"
      >
          {avatarContent}
            <div className="flex flex-col items-start justify-start">
              <div className="text-sm text-white/60">
                {post.is_anonymous ? 'Anonymous' : post.author?.name}
              </div>
              <div className="text-xs text-white/40">
                {formatPostDate(post.created_at)}
              </div>
            </div>
      </button>
    )
  }

  const handleCommentAuthorClick = (e: React.MouseEvent, comment: Comment) => {
    e.stopPropagation()
    if (!comment.is_anonymous && comment.author?.id) {
      router.push(`/user/${comment.author.id}`)
    }
  }

  const renderCommentAvatar = (comment: Comment) => {
    const avatarContent = comment.is_anonymous || !comment.author?.picture ? (
      <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
        <span className="text-xs text-white/60">
          {comment.is_anonymous ? '?' : (comment.author?.name?.[0] || '?')}
        </span>
      </div>
    ) : (
      <div className="w-6 h-6 rounded-full overflow-hidden">
        <Image
          src={comment.is_anonymous ? user?.image || '' : comment.author?.picture || ''}
          alt={comment.is_anonymous ? user?.name || '' : comment.author?.name || ''}
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
        onClick={(e) => handleCommentAuthorClick(e, comment)}
        className="hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-3"
        title="View author page"
      >
        {avatarContent}
          <span className="text-white/70">
            {comment.is_anonymous ? (user?.name || 'Anonymous User') : (comment.author?.name || 'Anonymous User')}
          </span>
          {(comment.is_anonymous && user?.name) && (
            <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/60">
              Anonymous
            </span>
          )}
          <span className="text-white/30">•</span>
          <time className="text-white/50">
            {formatPostDate(comment.created_at)}
          </time>
        </button>
    )
  }

  // 新增截斷文字的函數
  const truncateContent = (content: string, maxLength: number) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...'
  }

  return (
    <>
      <div 
        className={`bg-[#111113] rounded-lg p-6 space-y-4 ${!isExpanded ? 'cursor-pointer hover:bg-[#16161A] transition-colors' : ''}`}
        onClick={handleCardClick}
      >
        <div className="flex items-start justify-between">
        {renderAvatar()}
          <button
            className="share-button text-white/40 hover:text-white transition-colors cursor-pointer"
            onClick={handleShare}
          >
            <ShareIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Post Content */}
        <div className="text-base text-white/90 whitespace-pre-wrap mb-4 leading-relaxed">
          {isExpanded ? post.content : truncateContent(post.content, 200)}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between text-sm comment-section border-t border-white/5 pt-4">
          <div className="flex items-center gap-2">
            <ChatBubbleLeftIcon className="w-4 h-4 text-white/50" />
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsCommentOpen(!isCommentOpen)
              }}
              className="text-white/50 hover:text-white/80 transition-colors duration-200 cursor-pointer"
            >
              <span>{post.comments?.length || comments?.length || 0}</span>
            </button>
          </div>
          {!isExpanded && (
            <button
              className="text-white/30 hover:text-white/50 transition-colors duration-200 cursor-pointer flex items-center gap-1"
            >
              <span className="text-sm">Read more</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        {/* Comments Section */}
        {(isExpanded || isCommentOpen) && (
          <div className="comment-section mt-6 space-y-6">
            {/* Comment Form */}
            <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="space-y-4">
              <div className="relative">
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Post a comment..."
                  className="w-full min-h-[120px] p-4 text-sm bg-[#0A0A0B] rounded-lg border border-white/10 placeholder-white/30 text-white/90 focus:outline-none focus:border-white/20 focus:ring-0 transition-colors duration-200 resize-none"
                />
                <div className="absolute bottom-4 right-4 flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-white/60">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded border-white/20 bg-[#0A0A0B] text-white focus:ring-0 focus:ring-offset-0"
                    />
                    Anonymous
                  </label>
                  <button
                    type="submit"
                    disabled={isCreating || !commentContent.trim()}
                    className="px-5 py-2 text-sm bg-white text-black rounded-full hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                  >
                    {isCreating ? 'Publishing...' : 'Publish'}
                  </button>
                </div>
              </div>
            </form>

            {/* Comments List */}
            {(comments || post.comments)?.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-white/5">
                {((comments || post.comments) as Comment[])?.map((comment) => (
                  <div key={comment.id} className="text-sm space-y-2">
                    {renderCommentAvatar(comment)}
                    <p className="text-white/90 leading-relaxed">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

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
              <h3 className="text-lg font-medium text-white">Share Post</h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
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
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors text-sm font-medium cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      Copy Link
                    </>
                  )}
                </button>
              </div>

              <div className="text-sm text-white/60">
                Share this post with others. They can view the content directly through this link.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}