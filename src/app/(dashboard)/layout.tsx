'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import { onAuthStateChange, signOut as firebaseSignOut, getCurrentUser } from '@/lib/firebaseAuth'
import { Calendar, CalendarPlus, LogOut, Sparkles, Trophy, User } from 'lucide-react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [displayName, setDisplayName] = useState<string>('')

  useEffect(() => {
    const unsubscribe = onAuthStateChange((currentUser) => {
      if (!currentUser) {
        router.push('/login')
      } else {
        setDisplayName(currentUser.displayName || currentUser.email || 'User')
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [router])

  const navItems = [
    { href: '/', label: 'Home', icon: Sparkles },
    { href: '/schedule', label: 'Schedule', icon: Calendar },
    { href: '/sync-calendar', label: 'Sync Calendar', icon: CalendarPlus },
    { href: '/achievements', label: 'Achievements', icon: Trophy },
    { href: '/profile', label: 'Profile', icon: User },
  ]

  const handleSignOut = async () => {
    await firebaseSignOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-pulse-gentle mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-serenity-500 to-mindful-500 rounded-full mx-auto" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-72 flex-col gap-6 p-6 glass">
        <div>
          <div className="text-2xl font-extrabold bg-gradient-to-r from-serenity-600 via-mindful-600 to-balance-600 bg-clip-text text-transparent">
            AURA
          </div>
          <p className="text-sm text-gray-600 mt-1">Hey, {displayName}</p>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-white/60 border-white/80 shadow-sm text-gray-900'
                    : 'bg-white/20 hover:bg-white/40 border-white/30 text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 hover:bg-white/40 border border-white/30 text-gray-700"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Sign out</span>
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 p-4 md:p-8">
        {/* Mobile topbar */}
        <div className="md:hidden mb-4 flex items-center justify-between">
          <div className="text-xl font-extrabold bg-gradient-to-r from-serenity-600 via-mindful-600 to-balance-600 bg-clip-text text-transparent">
            AURA
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg bg-white hover:bg-gray-100 border border-gray-200"
            title="Sign out"
          >
            <LogOut className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
