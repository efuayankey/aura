'use client'

import { ScheduleItem, TaskAction, GameStats } from '@/types'
import { Clock, RotateCcw } from 'lucide-react'

interface ScheduleItemCardProps {
  item: ScheduleItem;
  isCompleted?: boolean;
  isSkipped?: boolean;
  isRescheduled?: boolean;
  onTaskAction: (action: Omit<TaskAction, 'timestamp' | 'points'>) => void;
  compact?: boolean;
  disabled?: boolean;
  hasTimer?: boolean;
  onStartTimer?: (taskId: string) => void;
}

export default function ScheduleItemCard({
  item,
  isCompleted = false,
  isSkipped = false,
  isRescheduled = false,
  onTaskAction,
  compact = false,
  disabled = false,
  hasTimer = false,
  onStartTimer
}: ScheduleItemCardProps) {
  const getStatusStyles = () => {
    if (isCompleted) {
      return {
        border: 'border-green-400',
        bg: 'bg-green-50',
        opacity: 'opacity-90'
      }
    }
    if (isSkipped) {
      return {
        border: 'border-gray-400',
        bg: 'bg-gray-50',
        opacity: 'opacity-75'
      }
    }
    if (isRescheduled) {
      return {
        border: 'border-yellow-400',
        bg: 'bg-yellow-50',
        opacity: 'opacity-85'
      }
    }
    
    // Default styles based on item type
    switch (item.type) {
      case 'work':
        return {
          border: 'border-serenity-400',
          bg: 'bg-serenity-50',
          opacity: 'opacity-100'
        }
      case 'wellness':
        return {
          border: 'border-balance-400',
          bg: 'bg-balance-50',
          opacity: 'opacity-100'
        }
      case 'break':
        return {
          border: 'border-mindful-400',
          bg: 'bg-mindful-50',
          opacity: 'opacity-100'
        }
      default:
        return {
          border: 'border-gray-400',
          bg: 'bg-gray-50',
          opacity: 'opacity-100'
        }
    }
  }

  const getStatusText = () => {
    if (isCompleted) return 'Completed'
    if (isSkipped) return 'Skipped'
    if (isRescheduled) return 'Rescheduled'
    return null
  }

  const styles = getStatusStyles()
  const statusText = getStatusText()

  return (
    <div
      className={`
        p-5 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md
        bg-white/70 backdrop-blur-sm border border-white/30
        ${isCompleted ? 'opacity-75' : isSkipped ? 'opacity-60' : 'opacity-100'}
        ${compact ? 'p-4' : 'p-5'}
        ${isCompleted ? 'border-l-4 border-l-green-400' : 
          isSkipped ? 'border-l-4 border-l-gray-400' : 
          isRescheduled ? 'border-l-4 border-l-yellow-400' : 
          item.type === 'work' ? 'border-l-4 border-l-blue-500' :
          item.type === 'wellness' ? 'border-l-4 border-l-purple-500' :
          'border-l-4 border-l-green-500'}
      `}
    >
      <div className={`flex items-start gap-4 ${compact ? 'gap-3' : 'gap-4'}`}>
        {/* Task Type Icon */}
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
          ${item.type === 'work' ? 'bg-gradient-to-br from-blue-100 to-blue-200' :
            item.type === 'wellness' ? 'bg-gradient-to-br from-purple-100 to-purple-200' :
            'bg-gradient-to-br from-green-100 to-green-200'}
        `}>
          {item.type === 'work' ? (
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
              <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
            </svg>
          ) : item.type === 'wellness' ? (
            <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`text-lg font-semibold transition-all ${
                  isCompleted || isSkipped 
                    ? 'text-gray-500 line-through' 
                    : 'text-gray-900'
                }`}>
                  {item.title}
                </h4>
                {statusText && (
                  <span className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${isCompleted ? 'bg-green-100 text-green-800' : 
                      isSkipped ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'}
                  `}>
                    {statusText}
                  </span>
                )}
              </div>
              
              {item.description && (
                <p className={`text-sm transition-all ${
                  isCompleted || isSkipped 
                    ? 'text-gray-400' 
                    : 'text-gray-600'
                }`}>
                  {item.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className={`text-sm font-semibold transition-all ${
                  isCompleted || isSkipped 
                    ? 'text-gray-400' 
                    : 'text-gray-800'
                }`}>
                  {item.startTime} - {item.endTime}
                </div>
                <div className={`text-xs font-medium capitalize ${
                  item.type === 'work' ? 'text-blue-600' :
                  item.type === 'wellness' ? 'text-purple-600' :
                  'text-green-600'
                }`}>
                  {item.type === 'work' ? '💼 Work' : item.type === 'wellness' ? '🧘 Wellness' : '☕ Break'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Action buttons: Start, Skip, and Reschedule */}
          {!isCompleted && !isSkipped && (
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-200/50">
              {/* Start Timer Button */}
              {!hasTimer && onStartTimer && (
                <button
                  onClick={() => onStartTimer(item.taskId || item.id)}
                  disabled={disabled}
                  className="
                    px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 
                    flex items-center gap-2 
                    bg-gradient-to-r from-green-500 to-green-600 text-white
                    hover:from-green-600 hover:to-green-700
                    focus:ring-green-500 shadow-md hover:shadow-lg
                    transform hover:scale-105 active:scale-95
                    disabled:opacity-50 disabled:cursor-not-allowed
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                  "
                  title="Start timer"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Start
                </button>
              )}
              
              <button
                onClick={() => onTaskAction({ type: 'skip', taskId: item.taskId || item.id, reason: 'not_ready' })}
                disabled={disabled}
                className="
                  px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 
                  flex items-center gap-2 
                  bg-white/80 text-gray-700 border border-gray-300
                  hover:bg-gray-50 hover:border-gray-400
                  focus:ring-gray-400 shadow-sm hover:shadow-md
                  transform hover:scale-105 active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                "
                title="Skip for now"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Skip
              </button>

              <button
                onClick={() => onTaskAction({ type: 'reschedule', taskId: item.taskId || item.id, reason: 'timing_adjustment' })}
                disabled={disabled}
                className="
                  px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 
                  flex items-center gap-2 
                  bg-gradient-to-r from-blue-500 to-blue-600 text-white
                  hover:from-blue-600 hover:to-blue-700
                  focus:ring-blue-500 shadow-md hover:shadow-lg
                  transform hover:scale-105 active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                "
                title="Reschedule task"
              >
                <RotateCcw className="w-4 h-4" />
                Reschedule
              </button>
            </div>
          )}
          
          {/* Rescheduled items can still be acted upon */}
          {isRescheduled && (
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-200/50">
              {/* Start Timer Button for rescheduled tasks */}
              {!hasTimer && onStartTimer && (
                <button
                  onClick={() => onStartTimer(item.taskId || item.id)}
                  disabled={disabled}
                  className="
                    px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 
                    flex items-center gap-2 
                    bg-gradient-to-r from-green-500 to-green-600 text-white
                    hover:from-green-600 hover:to-green-700
                    focus:ring-green-500 shadow-md hover:shadow-lg
                    transform hover:scale-105 active:scale-95
                    disabled:opacity-50 disabled:cursor-not-allowed
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                  "
                  title="Start timer"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Start
                </button>
              )}
              
              <button
                onClick={() => onTaskAction({ type: 'skip', taskId: item.taskId || item.id, reason: 'not_ready' })}
                disabled={disabled}
                className="
                  px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 
                  flex items-center gap-2 
                  bg-white/80 text-gray-700 border border-gray-300
                  hover:bg-gray-50 hover:border-gray-400
                  focus:ring-gray-400 shadow-sm hover:shadow-md
                  transform hover:scale-105 active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                "
                title="Skip for now"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Skip
              </button>

              <button
                onClick={() => onTaskAction({ type: 'reschedule', taskId: item.taskId || item.id, reason: 'timing_adjustment' })}
                disabled={disabled}
                className="
                  px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 
                  flex items-center gap-2 
                  bg-gradient-to-r from-blue-500 to-blue-600 text-white
                  hover:from-blue-600 hover:to-blue-700
                  focus:ring-blue-500 shadow-md hover:shadow-lg
                  transform hover:scale-105 active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                "
                title="Reschedule task"
              >
                <RotateCcw className="w-4 h-4" />
                Reschedule
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Simplified view for schedule preview (no actions)
export function ScheduleItemPreview({ item }: { item: ScheduleItem }) {
  const getBorderColor = () => {
    switch (item.type) {
      case 'work':
        return 'border-serenity-400'
      case 'wellness':
        return 'border-balance-400'
      case 'break':
        return 'border-mindful-400'
      default:
        return 'border-gray-400'
    }
  }

  const getBgColor = () => {
    switch (item.type) {
      case 'work':
        return 'bg-serenity-50'
      case 'wellness':
        return 'bg-balance-50'
      case 'break':
        return 'bg-mindful-50'
      default:
        return 'bg-gray-50'
    }
  }

  return (
    <div className={`p-3 rounded-xl border-l-4 ${getBorderColor()} ${getBgColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-800 text-sm">{item.title}</h4>
          {item.description && (
            <p className="text-xs text-gray-600 mt-1">{item.description}</p>
          )}
        </div>
        <div className="text-right ml-3">
          <div className="text-xs font-medium text-gray-700">
            {item.startTime} - {item.endTime}
          </div>
          <div className="text-xs text-gray-500 capitalize">
            {item.type}
          </div>
        </div>
      </div>
    </div>
  )
}