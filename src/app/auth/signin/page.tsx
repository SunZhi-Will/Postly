'use client'

import { signIn } from 'next-auth/react'
import Image from 'next/image'

export default function SignIn() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-black/40 backdrop-blur-md rounded-xl p-8 border border-white/5 w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white/90">歡迎回來</h2>
          <p className="mt-2 text-white/60">登入以開始分享你的反思</p>
        </div>

        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white rounded-lg px-4 py-3 transition-all duration-200"
        >
          <Image
            src="/google.svg"
            alt="Google Logo"
            width={20}
            height={20}
          />
          使用 Google 帳號登入
        </button>

        <p className="text-center text-white/40 text-sm">
          登入即表示你同意我們的
          <a href="#" className="text-white/60 hover:text-white/90 underline ml-1">
            服務條款
          </a>
          <span className="mx-1">和</span>
          <a href="#" className="text-white/60 hover:text-white/90 underline">
            隱私政策
          </a>
        </p>
      </div>
    </div>
  )
} 