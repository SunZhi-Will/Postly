import { Header } from '@/components/Header'

export default function StreakLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="md:pl-16">
        {children}
      </main>
    </>
  )
} 