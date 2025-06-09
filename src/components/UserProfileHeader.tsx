import { User } from 'next-auth'
import type { Author } from '@/services/api'
import Image from 'next/image'

interface UserProfileHeaderProps {
  user: Partial<User | Author> | null
  postCount?: number
  description?: string
}

export function UserProfileHeader({ user, postCount, description }: UserProfileHeaderProps) {
  if (!user) return null

  const imageUrl = 'image' in user ? user.image : (user as Author).picture

  return (
    <div className="mt-8 mb-8">
      <div className="flex flex-col items-center">
        <div className="relative mb-4">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={user.name || '用戶頭像'}
              className="w-24 h-24 rounded-full object-cover ring-2 ring-white/10"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1a1a1c] to-[#111113] flex items-center justify-center ring-2 ring-white/10">
              <span className="text-3xl text-white/90">
                {user.name?.[0] || '?'}
              </span>
            </div>
          )}
        </div>
        <h2 className="text-xl font-medium text-white/90 mb-4">
          {user.name || '未命名用戶'}
        </h2>
        {(postCount !== undefined || description) && (
          <p className="text-sm text-white/60">
            {description || `${postCount} 篇公開文章`}
          </p>
        )}
      </div>
    </div>
  )
} 