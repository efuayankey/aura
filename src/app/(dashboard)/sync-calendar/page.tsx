'use client'

import { CalendarPlus } from 'lucide-react'
import Link from 'next/link'

export default function SyncCalendarPage() {
  return (
    <main className="space-y-6">
      <div className="rounded-3xl p-8 glass">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 text-gray-700 text-xs font-medium mb-4">
          <CalendarPlus className="w-3 h-3" /> Sync Calendar
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Connect your Google Calendar</h1>
        <p className="text-gray-600 mt-2 max-w-2xl">
          AURA will align your tasks with your real schedule to avoid conflicts and recommend mindful breaks at the right time.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-serenity-500 to-mindful-500 hover:from-serenity-600 hover:to-mindful-600 shadow disabled:opacity-60" disabled>
            Connect Google Calendar (coming soon)
          </button>
          <Link href="/schedule" className="px-6 py-3 rounded-xl font-semibold bg-white/70 hover:bg-white/90 border border-white/80 text-gray-800">
            Plan my day instead
          </Link>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Tip: See setup instructions in your project docs for Google OAuth.
        </p>
      </div>
    </main>
  )
}
