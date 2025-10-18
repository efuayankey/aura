'use client'

import { useEffect, useState } from 'react'
import { onAuthStateChange } from '@/lib/firebaseAuth'
import { User } from 'firebase/auth'
import { User as UserIcon } from 'lucide-react'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChange((u) => setUser(u))
    return () => unsub()
  }, [])

  return (
    <main className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-white/70 border border-white/80">
          <UserIcon className="w-6 h-6 text-gray-700" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
      </div>

      <div className="rounded-2xl p-6 glass grid gap-4 max-w-xl">
        <div className="grid grid-cols-3 items-center gap-2">
          <div className="text-sm text-gray-600">Name</div>
          <div className="col-span-2 font-medium text-gray-800">{user?.displayName || '—'}</div>
        </div>
        <div className="grid grid-cols-3 items-center gap-2">
          <div className="text-sm text-gray-600">Email</div>
          <div className="col-span-2 font-medium text-gray-800">{user?.email || '—'}</div>
        </div>
      </div>
    </main>
  )
}
