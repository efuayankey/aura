'use client'

import { Check, Clock, RotateCcw } from 'lucide-react'
import { TaskAction } from '@/types'

interface TaskActionButtonsProps {
  taskId: string;
  onAction: (action: Omit<TaskAction, 'timestamp' | 'points'>) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function TaskActionButtons({ 
  taskId, 
  onAction, 
  disabled = false,
  size = 'md' 
}: TaskActionButtonsProps) {
  const handleComplete = () => {
    onAction({
      type: 'complete',
      taskId,
      reason: 'completed'
    })
  }

  const handleSkip = () => {
    onAction({
      type: 'skip',
      taskId,
      reason: 'not_ready'
    })
  }

  const handleReschedule = () => {
    onAction({
      type: 'reschedule',
      taskId,
      reason: 'timing_adjustment'
    })
  }

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const baseButtonClasses = `
    ${sizeClasses[size]} 
    font-medium rounded-xl transition-all duration-200 
    flex items-center gap-2 
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `

  return (
    <div className="flex items-center gap-2">
      {/* Complete Button */}
      <button
        onClick={handleComplete}
        disabled={disabled}
        className={`
          ${baseButtonClasses}
          bg-gradient-to-r from-mindful-500 to-mindful-600 text-white
          hover:from-mindful-600 hover:to-mindful-700
          focus:ring-mindful-500
          shadow-lg hover:shadow-xl
          transform hover:scale-105
        `}
        title="Complete task"
      >
        <Check className={iconSizes[size]} />
        Complete
      </button>

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        disabled={disabled}
        className={`
          ${baseButtonClasses}
          bg-gradient-to-r from-gray-400 to-gray-500 text-white
          hover:from-gray-500 hover:to-gray-600
          focus:ring-gray-400
          shadow-md hover:shadow-lg
          transform hover:scale-105
        `}
        title="Skip for now"
      >
        <Clock className={iconSizes[size]} />
        Skip
      </button>

      {/* Reschedule Button */}
      <button
        onClick={handleReschedule}
        disabled={disabled}
        className={`
          ${baseButtonClasses}
          bg-gradient-to-r from-serenity-500 to-serenity-600 text-white
          hover:from-serenity-600 hover:to-serenity-700
          focus:ring-serenity-500
          shadow-md hover:shadow-lg
          transform hover:scale-105
        `}
        title="Reschedule task"
      >
        <RotateCcw className={iconSizes[size]} />
        Reschedule
      </button>
    </div>
  )
}

// Compact version for small spaces
export function CompactTaskActions({ 
  taskId, 
  onAction, 
  disabled = false 
}: TaskActionButtonsProps) {
  const handleComplete = () => onAction({ type: 'complete', taskId, reason: 'completed' })
  const handleSkip = () => onAction({ type: 'skip', taskId, reason: 'not_ready' })
  const handleReschedule = () => onAction({ type: 'reschedule', taskId, reason: 'timing_adjustment' })

  const iconButtonClasses = `
    w-8 h-8 rounded-lg flex items-center justify-center
    transition-all duration-200 disabled:opacity-50
    focus:outline-none focus:ring-2 focus:ring-offset-1
    shadow-sm hover:shadow-md transform hover:scale-110
  `

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleComplete}
        disabled={disabled}
        className={`
          ${iconButtonClasses}
          bg-gradient-to-r from-mindful-500 to-mindful-600 text-white
          hover:from-mindful-600 hover:to-mindful-700
          focus:ring-mindful-500
        `}
        title="Complete"
      >
        <Check className="w-4 h-4" />
      </button>

      <button
        onClick={handleSkip}
        disabled={disabled}
        className={`
          ${iconButtonClasses}
          bg-gradient-to-r from-gray-400 to-gray-500 text-white
          hover:from-gray-500 hover:to-gray-600
          focus:ring-gray-400
        `}
        title="Skip"
      >
        <Clock className="w-4 h-4" />
      </button>

      <button
        onClick={handleReschedule}
        disabled={disabled}
        className={`
          ${iconButtonClasses}
          bg-gradient-to-r from-serenity-500 to-serenity-600 text-white
          hover:from-serenity-600 hover:to-serenity-700
          focus:ring-serenity-500
        `}
        title="Reschedule"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>
  )
}