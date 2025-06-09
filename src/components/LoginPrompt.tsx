'use client'

import { useSession, signIn } from 'next-auth/react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { useState, useEffect } from 'react'

export function LoginPrompt() {
  const { data: session } = useSession()
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // 如果用戶未登入且未手動關閉提示，則顯示提示
    if (!session && !isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 2000) // 延遲 2 秒顯示

      return () => clearTimeout(timer)
    }
  }, [session, isDismissed])

  if (!isVisible || session) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 pb-20 md:pb-4 z-40 animate-fade-up">
      <div className="max-w-2xl mx-auto bg-black/90 backdrop-blur-lg rounded-2xl border border-white/10 p-4 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <p className="text-white/90 text-sm md:text-base">
            登入以獲得完整體驗，分享你的想法和見解
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => signIn('google')}
              className="bg-white/10 hover:bg-white/20 text-white rounded-lg px-4 py-2 text-sm transition-all duration-200"
            >
              立即登入
            </button>
            <button
              onClick={() => {
                setIsVisible(false)
                setIsDismissed(true)
              }}
              className="text-white/60 hover:text-white/90 p-1 transition-colors duration-150"
              aria-label="關閉提示"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 