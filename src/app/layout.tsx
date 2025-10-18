import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AURA - AI Balance Agent',
  description: 'Your personal wellness-aware productivity assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-serenity-50 via-mindful-50 to-balance-50">
          {children}
        </div>
      </body>
    </html>
  )
}