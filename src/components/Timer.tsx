'use client'

import { useState, useEffect } from 'react'
import { Check, Pause, Play, X } from 'lucide-react'

interface TimerProps {
  duration: number // in minutes
  timeRemaining: number // in seconds
  isRunning: boolean
  onStart: () => void
  onPause: () => void
  onComplete: () => void
  onReset: () => void
  onClose: () => void
  taskTitle: string
  taskType: 'work' | 'break' | 'wellness'
}

export default function Timer({
  duration,
  timeRemaining,
  isRunning,
  onStart,
  onPause,
  onComplete,
  onReset,
  onClose,
  taskTitle,
  taskType
}: TimerProps) {
  // Timer is controlled by parent component, we just display the time received as prop

  // Format time to show minutes remaining (round down to show exact remaining time)
  const formatTimeRemaining = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    if (minutes === 0) {
      return `${remainingSeconds}s`
    } else if (minutes < 60) {
      return `${minutes}min`
    } else {
      const hours = Math.floor(minutes / 60)
      const remainingMins = minutes % 60
      return `${hours}h ${remainingMins}min`
    }
  }

  const getProgress = (): number => {
    const totalSeconds = duration * 60
    return ((totalSeconds - timeRemaining) / totalSeconds) * 100
  }

  const getTimerColors = () => {
    switch (taskType) {
      case 'work':
        return {
          bg: 'bg-gradient-to-br from-mindful-100 via-mindful-50 to-white',
          text: 'text-mindful-800',
          accent: 'text-mindful-600',
          progress: 'bg-mindful-500',
          button: 'bg-mindful-500 hover:bg-mindful-600',
          icon: '🎯'
        }
      case 'wellness':
        return {
          bg: 'bg-gradient-to-br from-serenity-100 via-serenity-50 to-white',
          text: 'text-serenity-800',
          accent: 'text-serenity-600',
          progress: 'bg-serenity-500',
          button: 'bg-serenity-500 hover:bg-serenity-600',
          icon: '🧘'
        }
      case 'break':
        return {
          bg: 'bg-gradient-to-br from-balance-100 via-balance-50 to-white',
          text: 'text-balance-800',
          accent: 'text-balance-600',
          progress: 'bg-balance-500',
          button: 'bg-balance-500 hover:bg-balance-600',
          icon: '☕'
        }
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-100 via-gray-50 to-white',
          text: 'text-gray-800',
          accent: 'text-gray-600',
          progress: 'bg-gray-500',
          button: 'bg-gray-500 hover:bg-gray-600',
          icon: '⏰'
        }
    }
  }

  const colors = getTimerColors()

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${colors.bg} rounded-3xl shadow-2xl w-full max-w-2xl p-12 text-center relative`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-white/50 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>

        {/* Task Type Icon */}
        <div className="text-6xl mb-6">
          {colors.icon}
        </div>

        {/* Task Info */}
        <div className="space-y-2 mb-8">
          <div className={`text-lg font-medium ${colors.accent} uppercase tracking-wide`}>
            {taskType === 'work' ? 'Focus Session' : taskType === 'wellness' ? 'Wellness Break' : 'Break Time'}
          </div>
          <h2 className={`text-2xl font-bold ${colors.text}`}>
            {taskTitle}
          </h2>
        </div>

        {/* Giant Timer Display */}
        <div className="space-y-8 mb-12">
          <div className={`text-8xl font-bold ${colors.text} font-mono tracking-wider`}>
            {formatTimeRemaining(timeRemaining)}
          </div>
          
          {/* Debug info */}
          <div className="text-sm text-gray-500">
            Debug: {timeRemaining}s | Running: {isRunning ? 'Yes' : 'No'}
          </div>
          
          {/* Progress Circle */}
          <div className="relative w-48 h-48 mx-auto">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-gray-200"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                className={colors.accent}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            
            {/* Center percentage */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${colors.accent}`}>
                {Math.round(getProgress())}%
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          {/* Pause/Resume Button */}
          <button
            onClick={isRunning ? onPause : onStart}
            className="
              p-4 rounded-full bg-white shadow-lg border-2 border-gray-200
              hover:border-gray-300 hover:shadow-xl transition-all duration-200
              focus:outline-none focus:ring-4 focus:ring-gray-300/50
            "
          >
            {isRunning ? (
              <Pause className="w-8 h-8 text-gray-700" />
            ) : (
              <Play className="w-8 h-8 text-gray-700 ml-1" />
            )}
          </button>
          
          {/* Complete Button */}
          <button
            onClick={onComplete}
            className={`
              flex items-center gap-3 px-8 py-4 
              ${colors.button} text-white text-lg font-semibold
              rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl
              focus:outline-none focus:ring-4 focus:ring-offset-2
              transform hover:scale-105 active:scale-95
            `}
          >
            <Check className="w-6 h-6" />
            Mark Complete
          </button>
        </div>

        {/* Timer finished notification */}
        {timeRemaining === 0 && (
          <div className="mt-8 p-6 bg-green-50 border-2 border-green-200 rounded-2xl animate-bounce">
            <div className="text-green-700 font-bold text-xl">
              🎉 Time's up! Excellent work! 🎉
            </div>
            <div className="text-green-600 mt-2 font-medium">
              Ready to mark this task as complete?
            </div>
          </div>
        )}

        {/* Motivational message */}
        <div className="mt-8 text-gray-500 text-sm">
          Stay focused • You're doing great • Keep it up
        </div>
      </div>
    </div>
  )
}