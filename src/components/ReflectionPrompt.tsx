'use client'

import { XMarkIcon, PlusIcon } from '@heroicons/react/24/solid'
import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { api } from '@/services/api'
import Image from 'next/image'

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
  const [dailyTopic, setDailyTopic] = useState<string>('分享一個最近改變了你生活的小習慣')
  const [isLoadingTopic, setIsLoadingTopic] = useState(false)
  const { data: session } = useSession()

  // 當 session 改變時，更新 API 用戶信息
  useEffect(() => {
    if (session?.user?.email) {
      api.setUserEmail(session.user.email);
    }
  }, [session]);

  // 獲取每日主題
  const fetchDailyTopic = async (refresh = false) => {
    setIsLoadingTopic(true);
    try {
      const response = await fetch(`/api/daily-topic${refresh ? '?refresh=true' : ''}`);
      const data = await response.json();
      if (data.topic) {
        setDailyTopic(data.topic);
      }
    } catch (error) {
      console.error('獲取每日主題時發生錯誤:', error);
    } finally {
      setIsLoadingTopic(false);
    }
  };

  useEffect(() => {
    fetchDailyTopic();
  }, []); // 只在組件首次加載時獲取主題

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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fetchDailyTopic(true);
                }}
                disabled={isLoadingTopic}
                className="bg-[#111113] rounded-full px-2 py-0.5 hover:bg-[#1a1a1c] transition-colors duration-150 disabled:opacity-50"
              >
                {isLoadingTopic ? '⌛' : '📝'} 今日主題
              </button>
              <span>{isLoadingTopic ? '載入中...' : dailyTopic}</span>
            </div>
          </div>
          <div 
            onClick={handleClick}
            className="bg-[#111113] rounded-lg border border-white/5 p-3 cursor-pointer hover:bg-[#16161A] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || '用戶頭像'}
                  className="rounded-full"
                  width={32}
                  height={32}
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 animate-fade-in">
            <div 
              className={`
                bg-[#111113] w-full h-[100dvh] sm:h-auto sm:w-[680px] 
                transform transition-all duration-300 ease-out
                ${isModalOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
                sm:translate-y-0 sm:rounded-xl sm:border sm:border-white/5
                sm:max-h-[80vh] 
                flex flex-col
              `}
            >
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between sticky top-0 bg-[#111113] py-2 -mt-2">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (showDailyTopic) {
                            fetchDailyTopic(true);
                          } else {
                            setShowDailyTopic(true);
                          }
                        }}
                        disabled={isLoadingTopic}
                        className={`shrink-0 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full transition-all duration-200 ${
                          showDailyTopic 
                            ? 'bg-white/10 text-white/90' 
                            : 'bg-white/5 text-white/60 hover:text-white/90'
                        }`}
                      >
                        {isLoadingTopic ? '⌛' : '📝'} 今日主題
                      </button>
                      {showDailyTopic && (
                        <p className="text-white/90 text-xs sm:text-sm truncate">
                          {isLoadingTopic ? '載入中...' : dailyTopic}
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
                      className="text-white/60 hover:text-white/90 transition-colors duration-150 ml-4"
                    >
                      <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
  
                  <div className="relative h-[calc(100vh-12rem)] sm:h-[400px]">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full h-[80%] bg-transparent sm:bg-white/5 sm:rounded-lg sm:p-5 text-white/90 resize-none focus:outline-none sm:focus:ring-1 sm:focus:ring-white/20 placeholder-white/40 transition-all duration-200 text-base p-0"
                      placeholder={showDailyTopic ? "分享你的想法..." : "分享你的想法..."}
                      autoFocus
                      disabled={isCreating}
                    />
                    
                    <div className="fixed bottom-0 left-0 right-0 bg-[#111113] border-t border-white/5 p-4 sm:static sm:mt-4 sm:border-0 sm:p-0 sm:bg-transparent">
                      <div className="flex items-center justify-between gap-3 max-w-2xl mx-auto">
                        <div className="flex items-center gap-4">
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
                          
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsModalOpen(false);
                              setContent('');
                              setIsAnonymous(false);
                            }}
                            className="hidden sm:block px-4 py-2 text-sm text-white/60 hover:text-white/90 transition-colors duration-150"
                            disabled={isCreating}
                          >
                            取消
                          </button>
                          <button 
                            onClick={handleSubmit}
                            disabled={isCreating || !content.trim()}
                            className="bg-white text-black rounded-full sm:rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:hover:bg-white sm:hover:bg-white/90 transition-all duration-200"
                          >
                            {isCreating ? '發布中...' : (
                              <>
                                <span className="sm:hidden">發布</span>
                                <span className="hidden sm:inline">發布文章</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
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
}