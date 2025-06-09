'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import Image from 'next/image'
import { FireIcon } from '@heroicons/react/24/solid'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useStreak } from '@/hooks/useStreak'

export function Header() {
  const { data: session } = useSession()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const desktopButtonRef = useRef<HTMLButtonElement>(null)
  const mobileButtonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const { data: streakData, isLoading: isLoadingStreak } = useStreak()
  const streak = (streakData as { streak: number })?.streak ?? 0

  // 點擊外部關閉下拉選單
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node

      // 檢查是否點擊到下拉選單內的元素或觸發按鈕
      if (
        dropdownRef.current?.contains(target) ||
        desktopButtonRef.current?.contains(target) ||
        mobileButtonRef.current?.contains(target)
      ) {
        // 不要關閉下拉選單
        return
      }

      // 點擊在外部時關閉下拉選單
      setShowDropdown(false)
    }

    // 只在下拉選單開啟時添加事件監聽
    if (showDropdown) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => document.removeEventListener('click', handleClickOutside)
  }, [showDropdown])

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      console.log('開始登出程序...')
      // 先關閉下拉選單
      setShowDropdown(false)
      // 執行登出
      await signOut({ 
        callbackUrl: '/',
        redirect: true
      })
    } catch (error) {
      console.error('登出失敗:', error)
      // 發生錯誤時強制重新導向
      window.location.href = '/'
    }
  }

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowDropdown(prev => !prev)
  }

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    signIn('google', {
      prompt: 'select_account'
    })
  }

  return (
    <>
      {/* 桌面版側邊欄 */}
      <div className="fixed left-0 top-0 h-screen w-16 bg-black/80 backdrop-blur-md border-r border-white/5 hidden md:flex flex-col items-center py-6 z-50">
        {/* 導覽列 */}
        <div className="flex flex-col items-center gap-6">
          <Link href="/">
            <Image src="/logo.png" alt="logo" width={64} height={64} />
          </Link>
          <Link 
            href="/"
            className={`text-white/80 hover:text-white transition-colors duration-150 group relative w-10 h-10 flex items-center justify-center ${pathname === '/' ? 'text-white bg-gradient-to-r from-white/10 to-white/5 rounded-lg ring-1 ring-white/10' : ''}`}
            title="Home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <div className="absolute left-full ml-2 px-2 py-1.5 bg-black/90 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-lg border border-white/10">
              Home
            </div>
          </Link>
          <Link 
            href="/profile"
            className={`text-white/80 hover:text-white transition-colors duration-150 group relative w-10 h-10 flex items-center justify-center ${(pathname === '/profile' || pathname === `/users/${session?.user?.id}`) ? 'text-white bg-gradient-to-r from-white/10 to-white/5 rounded-lg ring-1 ring-white/10' : ''}`}
            title="Profile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <div className="absolute left-full ml-2 px-2 py-1.5 bg-black/90 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-lg border border-white/10">
              Profile
            </div>
          </Link>
        </div>

        {/* 用戶資訊 */}
        <div className="mt-auto space-y-4 flex flex-col items-center">
          {session?.user ? (
            <>
              {/* 連續打卡 */}
              <Link href="/streak">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-full group relative cursor-pointer hover:from-orange-500/30 hover:to-yellow-500/30 transition-all duration-200 shadow-sm hover:shadow-md">
                  <div className="relative w-5 h-5">
                    <FireIcon className="w-5 h-5 text-orange-400 animate-pulse" />
                    <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs [text-shadow:_0_0_2px_rgb(0_0_0_/_100%)]">
                      {isLoadingStreak ? '...' : streak}
                    </span>
                  </div>
                  <div className="absolute left-full ml-2 px-3 py-2 bg-black/95 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl border border-white/10 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <FireIcon className="w-4 h-4 text-orange-400" />
                      <span>Streak <span className="text-white font-bold">{isLoadingStreak ? '...' : streak}</span> days</span>
                    </div>
                  </div>
                </div>
              </Link>

              <div className="relative">
                <button
                  ref={desktopButtonRef}
                  onClick={toggleDropdown}
                  className="w-10 h-10 rounded-full bg-gradient-to-b from-white/10 to-white/5 p-[1px] relative group cursor-pointer"
                >
                  <div className="w-full h-full rounded-full bg-black/50 flex items-center justify-center overflow-hidden">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'User Avatar'}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white/90 font-medium">
                        {session.user.name?.[0] || '?'}
                      </span>
                    )}
                  </div>
                </button>

                {/* 下拉選單 */}
                {showDropdown && (
                  <div 
                    ref={dropdownRef}
                    className="absolute bottom-1/2 left-full ml-2 w-56 bg-black/90 backdrop-blur-sm rounded-lg border border-white/10 py-1 shadow-xl animate-fade-in"
                  >
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="font-medium text-white/90 truncate">{session.user.name}</p>
                      <p className="text-white/60 text-sm truncate">{session.user.email}</p>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full px-3 py-2 text-left text-white/80 hover:text-white bg-transparent hover:bg-red-500/20 rounded-md transition-all duration-200 flex items-center gap-2 group cursor-pointer"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          strokeWidth={1.5} 
                          stroke="currentColor" 
                          className="w-5 h-5 text-red-500/70 group-hover:text-red-500 transition-colors duration-200"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={handleLoginClick}
              className="w-10 h-10 rounded-full bg-gradient-to-b from-white/10 to-white/5 p-[1px] group relative flex items-center justify-center hover:from-white/20 hover:to-white/10 transition-all duration-200 cursor-pointer"
            >
              <div className="absolute inset-[1px] rounded-full bg-black/50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white/80 group-hover:text-white transition-colors duration-150">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </div>
              <div className="absolute left-full ml-2 px-2 py-1.5 bg-black/90 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-lg border border-white/10">
                Login
              </div>
            </button>
          )}
        </div>
      </div>

      {/* 手機版底部導覽列 */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md border-t border-white/5 flex md:hidden items-center justify-around px-4 z-50">
        <Link href="/">
          <button 
            className="text-white/80 hover:text-white transition-colors duration-150 p-2"
            title="Home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </button>
        </Link>

        <Link href="/profile">
          <button 
            className="text-white/80 hover:text-white transition-colors duration-150 p-2"
            title="Profile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </button>
        </Link>

        {session?.user ? (
          <>
            {/* 連續打卡 */}
            <Link href="/streak">
              <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-full cursor-pointer hover:from-orange-500/30 hover:to-yellow-500/30 transition-all duration-200 group">
                <FireIcon className="w-6 h-6 text-orange-400" />
                <span className="absolute text-white/90 font-medium text-sm drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                  {isLoadingStreak ? '...' : streak}
                </span>
                <div className="absolute left-full ml-2 px-3 py-2 bg-black/95 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <FireIcon className="w-4 h-4 text-orange-400" />
                    <span>Streak <span className="text-white font-bold">{isLoadingStreak ? '...' : streak}</span> days</span>
                  </div>
                </div>
              </div>
            </Link>

            <div className="relative">
              <button
                ref={mobileButtonRef}
                onClick={toggleDropdown}
                className="w-9 h-9 rounded-full bg-gradient-to-b from-white/10 to-white/5 p-[1px] hover:from-white/20 hover:to-white/10 transition-all duration-200 cursor-pointer"
              >
                <div className="w-full h-full rounded-full bg-black/50 flex items-center justify-center overflow-hidden">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User Avatar'}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white/90 font-medium text-sm">
                      {session.user?.name?.[0] || '?'}
                    </span>
                  )}
                </div>
              </button>

              {/* 手機版下拉選單 */}
              {showDropdown && (
                <div 
                  ref={dropdownRef}
                  className="absolute bottom-full right-0 mb-2 w-48 bg-black/90 backdrop-blur-sm rounded-lg border border-white/10 py-1 shadow-xl animate-fade-in z-50"
                >
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="font-medium text-white/90 truncate">{session.user?.name}</p>
                    <p className="text-white/60 text-sm truncate">{session.user?.email}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full px-3 py-2 text-left text-white/80 hover:text-white bg-transparent hover:bg-red-500/20 rounded-md transition-all duration-200 flex items-center gap-2 group cursor-pointer"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={1.5} 
                        stroke="currentColor" 
                        className="w-5 h-5 text-red-500/70 group-hover:text-red-500 transition-colors duration-200"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                      </svg>
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
            <button
              onClick={handleLoginClick}
              className="w-9 h-9 rounded-full  flex items-center justify-center cursor-pointer"
            >
              <div className=" flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white/80 group-hover:text-white transition-colors duration-150">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </div>
            </button>
        )}
      </div>
    </>
  )
}