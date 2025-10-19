'use client'

import { useState, useEffect } from 'react'
import { Heart, Droplets, Wind, Zap, CheckCircle, X, Play, Pause, RotateCcw } from 'lucide-react'

interface WellnessActivityProps {
  activity: {
    type: 'breathing' | 'stretching' | 'hydration' | 'mindfulness'
    title: string
    description: string
    duration?: number // in seconds
    instructions?: string[]
  }
  onComplete: () => void
  onSkip: () => void
  className?: string
}

export default function WellnessActivity({
  activity,
  onComplete,
  onSkip,
  className = ''
}: WellnessActivityProps) {
  const [isActive, setIsActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(activity.duration || 60)
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            setIsActive(false)
            setIsCompleted(true)
            return 0
          }
          return time - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeRemaining])

  // Breathing pattern effect
  useEffect(() => {
    if (activity.type === 'breathing' && isActive) {
      const breathingInterval = setInterval(() => {
        setCurrentStep(step => (step + 1) % 4) // 4-7-8 breathing pattern steps
      }, activity.type === 'breathing' ? 1000 : 3000)

      return () => clearInterval(breathingInterval)
    }
  }, [activity.type, isActive])

  const getIcon = () => {
    switch (activity.type) {
      case 'breathing':
        return Wind
      case 'stretching':
        return Zap
      case 'hydration':
        return Droplets
      case 'mindfulness':
        return Heart
      default:
        return Heart
    }
  }

  const getColor = () => {
    switch (activity.type) {
      case 'breathing':
        return 'from-blue-500 to-cyan-500'
      case 'stretching':
        return 'from-green-500 to-emerald-500'
      case 'hydration':
        return 'from-blue-400 to-indigo-500'
      case 'mindfulness':
        return 'from-purple-500 to-pink-500'
      default:
        return 'from-mindful-500 to-serenity-500'
    }
  }

  const getBgColor = () => {
    switch (activity.type) {
      case 'breathing':
        return 'bg-blue-50 border-blue-200'
      case 'stretching':
        return 'bg-green-50 border-green-200'
      case 'hydration':
        return 'bg-blue-50 border-indigo-200'
      case 'mindfulness':
        return 'bg-purple-50 border-purple-200'
      default:
        return 'bg-mindful-50 border-mindful-200'
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getBreathingInstruction = () => {
    const instructions = ['Breathe in...', 'Hold...', 'Breathe out...', 'Hold...']
    return instructions[currentStep]
  }

  const handleStart = () => {
    setIsActive(true)
    setIsCompleted(false)
  }

  const handlePause = () => {
    setIsActive(false)
  }

  const handleReset = () => {
    setIsActive(false)
    setTimeRemaining(activity.duration || 60)
    setCurrentStep(0)
    setIsCompleted(false)
  }

  const handleComplete = () => {
    setIsCompleted(true)
    setIsActive(false)
    onComplete()
  }

  const Icon = getIcon()

  return (
    <div className={`${getBgColor()} rounded-2xl p-6 border-2 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${getColor()}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{activity.title}</h3>
            <p className="text-gray-600 text-sm">{activity.description}</p>
          </div>
        </div>
        
        <button
          onClick={onSkip}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          title="Skip this activity"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Activity Content */}
      <div className="space-y-6">
        {/* Timer Display */}
        {activity.duration && (
          <div className="text-center">
            <div className={`
              w-24 h-24 mx-auto rounded-full flex items-center justify-center
              bg-gradient-to-r ${getColor()} text-white text-2xl font-bold
              ${isActive ? 'animate-pulse' : ''}
            `}>
              {formatTime(timeRemaining)}
            </div>
          </div>
        )}

        {/* Breathing Animation & Instructions */}
        {activity.type === 'breathing' && isActive && (
          <div className="text-center space-y-4">
            <div className={`
              w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${getColor()}
              transition-transform duration-1000
              ${currentStep === 0 || currentStep === 1 ? 'scale-125' : 'scale-75'}
            `} />
            <p className="text-lg font-medium text-gray-700">
              {getBreathingInstruction()}
            </p>
          </div>
        )}

        {/* Instructions */}
        {activity.instructions && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800">Instructions:</h4>
            <ul className="space-y-1">
              {activity.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
                  {instruction}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {!isCompleted ? (
            <>
              {activity.duration ? (
                <>
                  <button
                    onClick={isActive ? handlePause : handleStart}
                    className={`
                      px-6 py-3 rounded-xl font-medium transition-all
                      bg-gradient-to-r ${getColor()} text-white
                      hover:shadow-lg hover:scale-105
                    `}
                  >
                    {isActive ? (
                      <><Pause className="w-4 h-4 inline mr-2" />Pause</>
                    ) : (
                      <><Play className="w-4 h-4 inline mr-2" />Start</>
                    )}
                  </button>
                  
                  <button
                    onClick={handleReset}
                    className="p-3 bg-gray-200 hover:bg-gray-300 rounded-xl transition-colors"
                    title="Reset"
                  >
                    <RotateCcw className="w-4 h-4 text-gray-600" />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleComplete}
                  className={`
                    px-6 py-3 rounded-xl font-medium transition-all
                    bg-gradient-to-r ${getColor()} text-white
                    hover:shadow-lg hover:scale-105
                  `}
                >
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  Mark Complete
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Completed! Great job!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}