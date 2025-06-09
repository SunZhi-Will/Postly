'use client'

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '@/services/api';
import Image from 'next/image';

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

interface CommentsProps {
  postId: string;
}

export function Comments({ postId }: CommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 載入留言
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await api.getPostComments(postId);
        if (response.success && response.data) {
          setComments(response.data);
        } else {
          setError('無法載入留言');
        }
      } catch (error) {
        console.error('載入留言時發生錯誤:', error);
        setError('載入留言時發生錯誤');
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  // 提交新留言
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await api.createComment(postId, newComment.trim(), false);
      if (response.success && response.data) {
        setComments(prev => [response.data as Comment, ...prev]);
        setNewComment('');
      }
    } catch (error) {
      console.error('發布留言時發生錯誤:', error);
      setError('發布留言時發生錯誤');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCommentAvatar = (comment: Comment) => {
    if (comment.is_anonymous || !comment.author?.picture) {
      const authorInitial = comment.is_anonymous ? '?' : (comment.author?.name?.[0] || '?');
      return (
        <div className="w-6 h-6 rounded-full bg-gradient-to-b from-white/10 to-white/5 flex items-center justify-center">
          <span className="text-xs text-white/80">{authorInitial}</span>
        </div>
      );
    }

    return (
      <div className="w-6 h-6 rounded-full bg-gradient-to-b from-white/10 to-white/5 overflow-hidden">
        <Image
          src={comment.author.picture}
          alt={comment.author.name || 'User Avatar'}
          width={24}
          height={24}
          className="w-full h-full object-cover"
        />
      </div>
    );
  };

  const renderCommentSkeleton = () => (
    <div className="flex gap-3">
      <div className="w-6 h-6 rounded-full bg-white/5 animate-pulse" />
      <div className="flex-1 min-w-0">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
            <div className="h-2 w-20 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-full bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-2/3 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="text-red-500/80 text-sm text-center py-3 bg-red-500/5 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 留言輸入框 */}
      {session && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-3">
            {renderCommentAvatar({
              id: 'new',
              content: '',
              author_id: session.user?.email || '',
              author: {
                id: session.user?.email || '',
                name: session.user?.name || '',
                email: session.user?.email || '',
                picture: session.user?.image || '',
              },
              is_anonymous: false,
              created_at: new Date().toISOString(),
              post_id: postId,
            })}
            <div className="flex-1 min-w-0">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full bg-white/5 rounded-lg p-3 text-sm text-white/90 placeholder-white/40 resize-none focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-200"
                rows={1}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-white/10 text-white/90 hover:text-white rounded-lg px-4 py-1.5 text-sm transition-all duration-200"
            >
              {isSubmitting ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </form>
      )}

      {/* 留言列表 */}
      <div className="space-y-4">
        {isLoading ? (
          // 載入中的骨架屏
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              {renderCommentSkeleton()}
            </div>
          ))
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              {renderCommentAvatar(comment)}
              <div className="flex-1 min-w-0">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white/80 text-sm font-medium">
                      {comment.is_anonymous ? 'Anonymous User' : (comment.author?.name || 'Anonymous User')}
                    </span>
                    <time className="text-white/40 text-xs">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </time>
                  </div>
                  <p className="text-white/90 text-sm whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-white/40 py-6">
            No comments yet
          </div>
        )}
      </div>
    </div>
  );
} 