'use client'

import Link from 'next/link'
import { Sparkles, Calendar, CalendarPlus, Trophy, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { onAuthStateChange } from '@/lib/firebaseAuth'

export default function HomePage() {
  const [name, setName] = useState<string>('')

  useEffect(() => {
    const unsub = onAuthStateChange((u) => setName(u?.displayName || u?.email || ''))
    return () => unsub()
  }, [])

  return (
    <main className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl p-8 md:p-12 glass">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-serenity-300 via-mindful-300 to-balance-300 rounded-full blur-3xl opacity-60" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 text-gray-700 text-xs font-medium mb-4">
            <Sparkles className="w-3 h-3" /> Introducing AURA
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
            Balance your productivity and wellness
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Smart schedules, mindful breaks, and personal insights—crafted for how you actually feel.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/schedule"
              className="px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-serenity-500 to-mindful-500 hover:from-serenity-600 hover:to-mindful-600 shadow"
            >
              Create my balanced day
            </Link>
            <Link
              href="/sync-calendar"
              className="px-6 py-3 rounded-xl font-semibold bg-white/70 hover:bg-white/90 border border-white/80 text-gray-800"
            >
              Sync calendar
            </Link>
          </div>
          {name && (
            <p className="mt-4 text-sm text-gray-500">Welcome back, {name.split('@')[0]} 👋</p>
          )}
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/schedule" className="group rounded-2xl p-5 glass hover:bg-white/60">
            <Calendar className="w-5 h-5 text-serenity-600" />
            <div className="mt-3 font-medium text-gray-800 group-hover:translate-x-0.5">Plan today</div>
            <div className="text-xs text-gray-500">AI-balanced schedule</div>
          </Link>
          <Link href="/sync-calendar" className="group rounded-2xl p-5 glass hover:bg-white/60">
            <CalendarPlus className="w-5 h-5 text-mindful-600" />
            <div className="mt-3 font-medium text-gray-800 group-hover:translate-x-0.5">Sync calendar</div>
            <div className="text-xs text-gray-500">Google Calendar</div>
          </Link>
          <Link href="/achievements" className="group rounded-2xl p-5 glass hover:bg-white/60">
            <Trophy className="w-5 h-5 text-balance-600" />
            <div className="mt-3 font-medium text-gray-800 group-hover:translate-x-0.5">Achievements</div>
            <div className="text-xs text-gray-500">Milestones & streaks</div>
          </Link>
          <Link href="/profile" className="group rounded-2xl p-5 glass hover:bg-white/60">
            <User className="w-5 h-5 text-gray-700" />
            <div className="mt-3 font-medium text-gray-800 group-hover:translate-x-0.5">Profile</div>
            <div className="text-xs text-gray-500">Your info</div>
          </Link>
        </div>
      </section>

      {/* Highlights */}
      <section className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl p-5 glass">
          <div className="text-sm text-gray-600">Wellness-first</div>
          <div className="text-lg font-semibold text-gray-800">Mindful breaks when you need them</div>
        </div>
        <div className="rounded-2xl p-5 glass">
          <div className="text-sm text-gray-600">Personalized</div>
          <div className="text-lg font-semibold text-gray-800">Plans adapt to your energy</div>
        </div>
        <div className="rounded-2xl p-5 glass">
          <div className="text-sm text-gray-600">Aligned</div>
          <div className="text-lg font-semibold text-gray-800">Seamless with your calendar</div>
        </div>
      </section>
    </main>
  )
}
