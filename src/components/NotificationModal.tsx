'use client'

import { ScheduleItem } from '@/types'

interface NotificationModalProps {
  task: ScheduleItem | null
  onClose: () => void
  onReschedule: () => void
}

export default function NotificationModal({ task, onClose, onReschedule }: NotificationModalProps) {
  if (!task) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass rounded-3xl p-8 max-w-md w-full shadow-2xl animate-slide-up">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-light to-teal rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⏰</span>
          </div>
          <h3 className="text-2xl font-bold text-emerald mb-2">
            Almost Time!
          </h3>
          <p className="text-gray-600">
            There are 10 minutes left before your break.
          </p>
        </div>

        <div className="bg-white/70 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">Current Task:</p>
          <h4 className="text-lg font-bold text-gray-800">{task.title}</h4>
          <p className="text-sm text-gray-500 mt-1">{task.startTime} - {task.endTime}</p>
        </div>

        <p className="text-center text-gray-700 mb-6 font-medium">
          Are you done with this task?
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-teal hover:bg-teal-dark text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
          >
            Yes, I'm Done!
          </button>
          <button
            onClick={onReschedule}
            className="flex-1 px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md"
          >
            Reschedule (-2 pts)
          </button>
        </div>
      </div>
    </div>
  )
}
