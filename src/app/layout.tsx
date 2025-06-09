import { Inter } from 'next/font/google'
import { SessionProvider } from '@/components/SessionProvider'
import { AuthProvider } from '@/components/AuthProvider'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata = {
  title: 'Postly - Share Your Reflections',
  description: 'A platform for sharing your reflections and thoughts',
  icons: {
    icon: [
      { url: '/Postly.ico', sizes: '32x32' },
      { url: '/Postly.ico', sizes: '64x64' },
      { url: '/Postly.ico', sizes: '128x128' }
    ]
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW" className={inter.variable}>
      <body className={`${inter.className} bg-[#0A0A0B] text-white antialiased [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-track]:rounded [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb:hover]:bg-white/30 [&::-webkit-scrollbar]:block`}>
        <Providers>
          <SessionProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </SessionProvider>
        </Providers>
      </body>
    </html>
  )
}
