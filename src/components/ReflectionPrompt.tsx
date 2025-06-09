'use client'

import { XMarkIcon, PlusIcon } from '@heroicons/react/24/solid'
import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { api } from '@/services/api'

interface ReflectionPromptProps {
  compact?: boolean;
  showFloatingButton?: boolean;
  onPostCreated?: () => void;
}

export function ReflectionPrompt({ 
  compact = false, 
  showFloatingButton = false,
  onPostCreated 
}: ReflectionPromptProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showDailyTopic, setShowDailyTopic] = useState(true)
  const [content, setContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isFloatingButtonVisible, setIsFloatingButtonVisible] = useState(false)
  const { data: session } = useSession()

  // 當 session 改變時，更新 API 用戶信息
  useEffect(() => {
    if (session?.user?.email) {
      api.setUserEmail(session.user.email);
    }
  }, [session]);

  // 監聽滾動事件
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsFloatingButtonVisible(scrollPosition > 200)
    }

    if (showFloatingButton) {
      window.addEventListener('scroll', handleScroll)
      handleScroll() // 初始化時檢查一次
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [showFloatingButton])

  const handleClick = () => {
    if (!session) {
      signIn()
      return
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return
    if (!content.trim()) return

    try {
      setIsCreating(true)
      const response = await api.createPost(content.trim(), isAnonymous)

      if (response.success) {
        setContent('')
        setIsAnonymous(false)
        setIsModalOpen(false)
        // 呼叫回調函數通知父組件刷新
        onPostCreated?.()
      }
    } catch (error) {
      console.error('發布文章時發生錯誤:', error)
    } finally {
      setIsCreating(false)
    }
  }

  if (compact) {
    return (
      <>
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <div className="text-xs text-white/70 flex items-center gap-1.5">
              <span className="bg-[#111113] rounded-full px-2 py-0.5">📝 今日主題</span>
              <span>分享一個最近改變了你生活的小習慣</span>
            </div>
          </div>
          <div 
            onClick={handleClick}
            className="bg-[#111113] rounded-lg border border-white/5 p-3 cursor-pointer hover:bg-[#16161A] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || '用戶頭像'}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#0A0A0B] flex items-center justify-center">
                  <span className="text-sm text-white/60">
                    {session?.user?.name?.[0] || '?'}
                  </span>
                </div>
              )}
              <div className="flex-1 text-sm text-white/50">
                {session ? '分享你的想法...' : '登入以開始分享...'}
              </div>
              <PlusIcon className="w-5 h-5 text-white/30" />
            </div>
          </div>
        </div>

        {/* 浮動按鈕 */}
        {showFloatingButton && isFloatingButtonVisible && (
          <button
            onClick={handleClick}
            className="fixed right-4 bottom-20 sm:right-6 sm:bottom-6 md:right-8 md:bottom-8 lg:right-10 lg:bottom-10 bg-white text-black rounded-full p-3 shadow-lg backdrop-blur-sm hover:bg-white/90 transition-all duration-200 group z-50"
          >
            <PlusIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1.5 bg-[#111113] text-white text-xs sm:text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-lg border border-white/10">
              {session ? '開始撰寫' : '登入以開始撰寫'}
            </div>
          </button>
        )}

        {/* 模態對話框 */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-[#111113] rounded-xl border border-white/5 w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDailyTopic(!showDailyTopic);
                      }}
                      className={`text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full transition-all duration-200 ${
                        showDailyTopic 
                          ? 'bg-white/10 text-white/90' 
                          : 'bg-white/5 text-white/60 hover:text-white/90'
                      }`}
                    >
                      📝 今日主題
                    </button>
                    {showDailyTopic && (
                      <p className="text-white/90 text-xs sm:text-sm">
                        分享一個最近改變了你生活的小習慣
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsModalOpen(false);
                      setShowDailyTopic(true);
                      setContent('');
                      setIsAnonymous(false);
                    }}
                    className="text-white/60 hover:text-white/90 transition-colors duration-150"
                  >
                    <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-white/5 rounded-lg p-3 sm:p-4 text-white/90 resize-none focus:outline-none focus:ring-1 focus:ring-white/20 placeholder-white/40 transition-all duration-200 text-sm sm:text-base"
                    placeholder={showDailyTopic ? "分享你的小習慣故事..." : "分享你的想法..."}
                    rows={6}
                    autoFocus
                    disabled={isCreating}
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="space-y-1 sm:space-y-2">
                      <label className="flex items-center gap-2 text-xs sm:text-sm text-white/70">
                        <input 
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="rounded bg-white/5 border-white/20 text-white focus:ring-white/20 transition-colors duration-200"
                          disabled={isCreating}
                        />
                        匿名發布
                      </label>
                      <p className="text-[10px] sm:text-xs text-white/60">
                        每日只能發布一篇文章，請確保內容有意義且真誠
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsModalOpen(false);
                          setContent('');
                          setIsAnonymous(false);
                        }}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white/60 hover:text-white/90 transition-colors duration-150"
                        disabled={isCreating}
                      >
                        取消
                      </button>
                      <button 
                        onClick={handleSubmit}
                        disabled={isCreating || !content.trim()}
                        className="bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-white/10 text-white/90 hover:text-white rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm transition-all duration-200"
                      >
                        {isCreating ? '發布中...' : '發布文章'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      {/* 浮動按鈕 */}
      <button
        onClick={handleClick}
        className="fixed right-4 bottom-20 sm:right-6 sm:bottom-6 md:right-8 md:bottom-8 lg:right-10 lg:bottom-10 bg-white text-black rounded-full p-3 shadow-lg backdrop-blur-sm hover:bg-white/90 transition-all duration-200 group z-50"
      >
        <PlusIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1.5 bg-[#111113] text-white text-xs sm:text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-lg border border-white/10">
          {session ? '開始撰寫' : '登入以開始撰寫'}
        </div>
      </button>

      {/* 模態對話框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-[#111113] rounded-xl border border-white/5 w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDailyTopic(!showDailyTopic);
                    }}
                    className={`text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full transition-all duration-200 ${
                      showDailyTopic 
                        ? 'bg-white/10 text-white/90' 
                        : 'bg-white/5 text-white/60 hover:text-white/90'
                    }`}
                  >
                    📝 今日主題
                  </button>
                  {showDailyTopic && (
                    <p className="text-white/90 text-xs sm:text-sm">
                      分享一個最近改變了你生活的小習慣
                    </p>
                  )}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsModalOpen(false);
                    setShowDailyTopic(true);
                    setContent('');
                    setIsAnonymous(false);
                  }}
                  className="text-white/60 hover:text-white/90 transition-colors duration-150"
                >
                  <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-white/5 rounded-lg p-3 sm:p-4 text-white/90 resize-none focus:outline-none focus:ring-1 focus:ring-white/20 placeholder-white/40 transition-all duration-200 text-sm sm:text-base"
                  placeholder={showDailyTopic ? "分享你的小習慣故事..." : "分享你的想法..."}
                  rows={6}
                  autoFocus
                  disabled={isCreating}
                />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="space-y-1 sm:space-y-2">
                    <label className="flex items-center gap-2 text-xs sm:text-sm text-white/70">
                      <input 
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded bg-white/5 border-white/20 text-white focus:ring-white/20 transition-colors duration-200"
                        disabled={isCreating}
                      />
                      匿名發布
                    </label>
                    <p className="text-[10px] sm:text-xs text-white/60">
                      每日只能發布一篇文章，請確保內容有意義且真誠
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsModalOpen(false);
                        setContent('');
                        setIsAnonymous(false);
                      }}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white/60 hover:text-white/90 transition-colors duration-150"
                      disabled={isCreating}
                    >
                      取消
                    </button>
                    <button 
                      onClick={handleSubmit}
                      disabled={isCreating || !content.trim()}
                      className="bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-white/10 text-white/90 hover:text-white rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm transition-all duration-200"
                    >
                      {isCreating ? '發布中...' : '發布文章'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}