'use client'

import { ScheduleItem } from '@/types'
import { CheckCircle, SkipForward, RefreshCw } from 'lucide-react'

interface ScheduleProps {
  schedule: ScheduleItem[]
  completedItems: Set<string>
  onComplete: (itemId: string) => void
  onSkip: (itemId: string) => void
  onReschedule: (itemId: string) => void
}

export default function Schedule({ 
  schedule, 
  completedItems, 
  onComplete, 
  onSkip, 
  onReschedule 
}: ScheduleProps) {
  const getCardColor = (type: string, isCompleted: boolean) => {
    if (isCompleted) return 'bg-green-50 border-green-300'
    
    switch (type) {
      case 'work':
        return 'bg-blue-50 border-blue-200'
      case 'wellness':
        return 'bg-pink-50 border-pink-200'
      case 'break':
        return 'bg-purple-50 border-purple-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  if (schedule.length === 0) {
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No schedule yet</h3>
        <p className="text-gray-500">Add tasks and generate your perfect day!</p>
      </div>
    )
  }

  return (
    <div className="glass rounded-3xl p-6">
      <h3 className="text-2xl font-bold text-emerald mb-6">
        Today's Schedule
      </h3>
      
      <div className="space-y-3">
        {schedule.map((item) => {
          const isCompleted = completedItems.has(item.id)
          
          return (
            <div
              key={item.id}
              className={`rounded-xl border-2 p-4 transition-all ${getCardColor(item.type, isCompleted)} ${
                isCompleted ? 'opacity-75' : 'shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className={`font-semibold text-lg ${
                    isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'
                  }`}>
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className={`text-sm mt-1 ${
                      isCompleted ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {item.description}
                    </p>
                  )}
                </div>
                <span className={`text-sm font-medium px-3 py-1 rounded-lg ${
                  isCompleted 
                    ? 'bg-gray-200 text-gray-500' 
                    : 'bg-white/70 text-gray-700'
                }`}>
                  {item.startTime} - {item.endTime}
                </span>
              </div>

              {/* Action Buttons */}
              {!isCompleted && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onComplete(item.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-teal hover:bg-teal-dark text-white rounded-lg transition-all font-medium shadow-md hover:shadow-lg"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Complete (+10)</span>
                  </button>
                  <button
                    onClick={() => onSkip(item.id)}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-all font-medium shadow-sm hover:shadow-md"
                    title="Skip (-5 points)"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onReschedule(item.id)}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-all font-medium shadow-sm hover:shadow-md"
                    title="Reschedule (-2 points)"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              )}

              {isCompleted && (
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">Completed!</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
