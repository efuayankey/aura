'use client'

import { Trophy } from 'lucide-react'

const achievements = [
  { id: 'streak_3', title: '3-Day Streak', description: 'Completed balanced schedules for 3 days in a row', emoji: '🔥' },
  { id: 'early_bird', title: 'Early Bird', description: 'Started your day before 8am with focus', emoji: '🌅' },
  { id: 'mindful_breaks', title: 'Mindful Breaks', description: 'Took 5 wellness breaks in a day', emoji: '🧘' },
]

export default function AchievementsPage() {
  return (
    <main className="space-y-6">
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-balance-600" />
        <h1 className="text-xl font-semibold text-gray-900">Achievements & History</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {achievements.map((a) => (
          <div key={a.id} className="rounded-2xl p-5 glass">
            <div className="text-3xl">{a.emoji}</div>
            <div className="mt-2 text-lg font-semibold text-gray-800">{a.title}</div>
            <div className="text-sm text-gray-600">{a.description}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-5 glass">
        <div className="text-sm text-gray-600 mb-1">Recent days</div>
        <div className="text-gray-800">History and analytics coming soon</div>
      </div>
    </main>
  )
}
