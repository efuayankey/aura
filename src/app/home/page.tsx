'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChange, signOut as firebaseSignOut } from '@/lib/firebaseAuth'
import { User } from 'firebase/auth'
import { LogOut, Star, Calendar, CheckCircle2, Sparkles, GitBranch, BookMarked, Clock, BarChart3 } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChange((currentUser) => {
      setUser(currentUser)
      setLoading(false)
      if (!currentUser) router.push('/login')
    })
    return () => unsubscribe()
  }, [router])

  const firstName = useMemo(() => {
    if (!user?.displayName) return null
    return user.displayName.split(' ')[0]
  }, [user])

  const handleSignOut = async () => {
    await firebaseSignOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-pulse-gentle mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-serenity-500 to-mindful-500 rounded-full mx-auto"></div>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    )
  }

  if (!user) return null

  return (
    <main className="min-h-screen">
      {/* Top bar inspired by GitHub */}
      <div className="sticky top-0 z-30 border-b border-gray-200/60 backdrop-blur bg-white/70">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-serenity-500 via-mindful-500 to-balance-500" />
            <span className="font-semibold text-gray-800">AURA</span>
            <span className="ml-3 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Home</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500">Signed in as</p>
              <p className="text-sm font-medium text-gray-800">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 transition-all"
              title="Sign out"
            >
              <LogOut className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="px-6 pt-10 pb-6 border-b border-gray-200/60 bg-gradient-to-br from-white/60 to-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Welcome{firstName ? `, ${firstName}` : ''}
              </h1>
              <p className="mt-2 text-gray-600">
                Your personalized productivity and wellness hub
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-serenity-50 text-serenity-700 border border-serenity-200"><Star className="w-3 h-3"/> Focus mode</span>
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-mindful-50 text-mindful-700 border border-mindful-200"><Sparkles className="w-3 h-3"/> AI tips</span>
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-balance-50 text-balance-700 border border-balance-200"><Calendar className="w-3 h-3"/> Schedule</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="rounded-2xl p-4 glass">
                <div className="text-sm text-gray-600">Today's balance</div>
                <div className="mt-3 flex items-end gap-2">
                  <div className="h-16 w-2.5 bg-serenity-400 rounded"/>
                  <div className="h-12 w-2.5 bg-mindful-400 rounded"/>
                  <div className="h-20 w-2.5 bg-balance-400 rounded"/>
                  <div className="h-10 w-2.5 bg-serenity-300 rounded"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main grid inspired by GitHub dashboard */}
      <section className="px-6 py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Quick actions */}
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">Quick actions</h2>
                <span className="text-xs text-gray-500">Today</span>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Plan my day', icon: Calendar, color: 'from-serenity-500 to-serenity-600', href: '/' },
                  { label: 'Start focus session', icon: Clock, color: 'from-mindful-500 to-mindful-600', href: '/#focus' },
                  { label: 'View recommendations', icon: Sparkles, color: 'from-balance-500 to-balance-600', href: '/#tips' },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => router.push(action.href)}
                    className="group w-full rounded-xl border border-gray-200 bg-white hover:bg-gray-50 p-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${action.color} text-white grid place-items-center`}>
                        <action.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{action.label}</div>
                        <div className="text-xs text-gray-500">Jump right in</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Activity feed */}
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">Recent activity</h2>
                <button className="text-xs text-gray-500 hover:text-gray-700">View all</button>
              </div>
              <div className="mt-4 space-y-4">
                {[
                  { icon: GitBranch, text: 'New AI schedule generated', meta: '2m ago', color: 'text-serenity-600' },
                  { icon: CheckCircle2, text: 'Completed 3 tasks', meta: '1h ago', color: 'text-mindful-600' },
                  { icon: BookMarked, text: 'Saved wellness tip', meta: 'Yesterday', color: 'text-balance-600' },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-3">
                    <item.icon className={`w-4 h-4 mt-1 ${item.color}`} />
                    <div>
                      <div className="text-sm text-gray-800">{item.text}</div>
                      <div className="text-xs text-gray-500">{item.meta}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Overview */}
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">Overview</h2>
                <BarChart3 className="w-4 h-4 text-gray-500" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: 'Balance', value: '82', color: 'text-balance-600' },
                  { label: 'Focus', value: '68', color: 'text-serenity-600' },
                  { label: 'Energy', value: '7/10', color: 'text-mindful-600' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-3">
                    <div className="text-xs text-gray-500">{stat.label}</div>
                    <div className={`mt-1 text-lg font-semibold ${stat.color}`}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div id="tips" className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">Recommended for you</h2>
                <Sparkles className="w-4 h-4 text-balance-600" />
              </div>
              <div className="mt-4 space-y-3">
                {[
                  'Block 90 minutes for deep work this morning',
                  'Take a 5-minute stretch break every hour',
                  'Review tomorrow’s calendar before 5pm',
                ].map((tip) => (
                  <div key={tip} className="rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700">{tip}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
