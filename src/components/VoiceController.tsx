'use client'

import { useState, useEffect } from 'react'
import { Volume2, VolumeX, Play, Pause, Loader2 } from 'lucide-react'

interface VoiceControllerProps {
  schedule?: any[]
  completedTasks?: number
  totalTasks?: number
  className?: string
  // Context-aware props
  activeTask?: {
    id: string
    title: string
    type: 'work' | 'break' | 'wellness'
    duration: number
    timeRemaining?: number
    isRunning?: boolean
  }
  currentWellnessActivity?: {
    title: string
    description: string
    instructions: string[]
  }
  activeTimers?: Array<{
    taskId: string
    taskTitle: string
    timeRemaining: number
    isRunning: boolean
  }>
}

export default function VoiceController({
  schedule = [],
  completedTasks = 0,
  totalTasks = 0,
  className = '',
  activeTask,
  currentWellnessActivity,
  activeTimers = []
}: VoiceControllerProps) {
  const [isPollyAvailable, setIsPollyAvailable] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSynthesizing, setIsSynthesizing] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)

  // Check Polly availability on mount
  useEffect(() => {
    const checkPollyAvailability = async () => {
      try {
        console.log('🔍 Checking Polly availability...')
        const response = await fetch('/api/polly/synthesize')
        const data = await response.json()
        console.log('🔍 Polly availability response:', data)
        
        setIsPollyAvailable(data.available)
        
        // Auto-enable if available, but also enable for browser fallback
        setIsEnabled(true) // Always enable - we have browser fallback
        
        if (!data.available) {
          console.warn('⚠️ AWS Polly not available, will use browser speech synthesis')
        }
      } catch (error) {
        console.warn('Could not check Polly availability:', error)
        setIsPollyAvailable(false)
        setIsEnabled(true) // Still enable for browser fallback
      }
    }

    checkPollyAvailability()
  }, [])

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause()
        currentAudio.src = ''
      }
    }
  }, [currentAudio])

  const fallbackSpeechSynthesis = async (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('Browser speech synthesis not supported'))
        return
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1

      utterance.onend = () => {
        setIsPlaying(false)
        resolve()
      }
      
      utterance.onerror = (event) => {
        setIsPlaying(false)
        reject(new Error(`Speech synthesis failed: ${event.error}`))
      }

      setIsPlaying(true)
      window.speechSynthesis.speak(utterance)
    })
  }

  const synthesizeAndPlay = async (text: string, type: string = 'custom') => {
    if (!isEnabled) return

    let speechText = text
    setIsSynthesizing(true)
    
    // Generate the appropriate text based on type (same logic as server)
    if (type === 'schedule-summary' && typeof text === 'object') {
      speechText = generateScheduleSummary((text as any).schedule, (text as any).userName)
    } else if (type === 'motivational' && typeof text === 'object') {
      speechText = generateMotivationalMessage((text as any).completedTasks, (text as any).totalTasks)
    }
    
    // Try AWS Polly first if available
    if (isPollyAvailable) {
      try {
        console.log('🔊 Trying AWS Polly...')
        
        const response = await fetch('/api/polly/synthesize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, type })
        })

        if (response.ok) {
          const { audioUrl, text: generatedText } = await response.json()
          speechText = generatedText || speechText
          
          // Validate audioUrl before proceeding
          if (!audioUrl || typeof audioUrl !== 'string') {
            console.warn('⚠️ Invalid audioUrl from Polly:', audioUrl)
            throw new Error('Invalid audio URL from Polly service')
          }
          
          console.log('✅ Valid audio URL received:', audioUrl.substring(0, 50) + '...')
          
          // Stop current audio if playing
          if (currentAudio) {
            currentAudio.pause()
            currentAudio.src = ''
          }

          // Create and play new audio
          const audio = new Audio()
          setCurrentAudio(audio)
          
          audio.addEventListener('loadeddata', () => {
            console.log('🎵 Audio loaded successfully')
            setIsPlaying(true)
            audio.play().catch(playError => {
              console.warn('Audio play failed:', playError)
              setIsPlaying(false)
            })
          })
          
          audio.addEventListener('canplay', () => {
            console.log('🎵 Audio ready to play')
          })
          
          // Set the audio source after event listeners are attached
          audio.src = audioUrl
          audio.load()
          
          audio.addEventListener('ended', () => {
            setIsPlaying(false)
            URL.revokeObjectURL(audioUrl)
          })
          
          audio.addEventListener('error', (e) => {
            console.warn('🔊 Polly audio playback failed:', {
              error: e?.type || 'unknown',
              audioSrc: audio?.src || 'no source',
              readyState: audio?.readyState,
              networkState: audio?.networkState,
              errorCode: e?.target?.error?.code
            })
            console.log('⚠️ Polly audio failed, falling back to browser speech...')
            setIsPlaying(false)
            
            // Clean up the failed audio URL
            if (audioUrl && audioUrl.startsWith('blob:')) {
              try {
                URL.revokeObjectURL(audioUrl)
              } catch (cleanupError) {
                console.warn('Failed to revoke audio URL:', cleanupError)
              }
            }
            
            // Fallback to browser speech synthesis
            try {
              fallbackSpeechSynthesis(speechText).catch(fallbackError => {
                console.warn('Browser speech also failed:', fallbackError)
              })
            } catch (fallbackError) {
              console.warn('Fallback speech error:', fallbackError)
            }
          })

          audio.load()
          setIsSynthesizing(false)
          return // Success with Polly
        } else {
          console.log('⚠️ Polly API failed, falling back to browser speech')
        }
      } catch (error) {
        console.log('⚠️ Polly error, falling back to browser speech:', error)
      }
    }
    
    // Fallback to browser speech synthesis
    try {
      console.log('🔊 Using browser speech synthesis...')
      await fallbackSpeechSynthesis(speechText)
    } catch (fallbackError) {
      console.error('Browser speech synthesis failed:', fallbackError)
      alert('Speech synthesis is not supported in your browser.')
    } finally {
      setIsSynthesizing(false)
    }
  }

  // Helper functions for text generation (mirroring server logic)
  const generateScheduleSummary = (schedule: any[], userName?: string): string => {
    const greeting = userName ? `Hi ${userName}` : 'Hi there'
    const workItems = schedule.filter(item => item.type === 'work')
    
    if (workItems.length === 0) {
      return `${greeting}! Your schedule is clear for now. Enjoy your free time!`
    }

    return `${greeting}! You have ${workItems.length} tasks planned for today. Let's make it a productive day!`
  }

  const generateMotivationalMessage = (completedTasks: number, totalTasks: number): string => {
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    
    if (progress === 0) {
      return "Ready to start your productive day? You've got this!"
    } else if (progress < 50) {
      return "Great start! Keep up the momentum."
    } else if (progress < 100) {
      return "Excellent work! You're making solid progress."
    } else {
      return "Amazing! You've completed all your tasks. Time to celebrate!"
    }
  }

  // Context-aware reading functions
  const generateCurrentScreenContent = (): string => {
    let content = ""

    // Check what's currently active and prioritize context
    if (currentWellnessActivity) {
      content = generateWellnessActivityReading(currentWellnessActivity)
    } else if (activeTask) {
      content = generateActiveTaskReading(activeTask)
    } else if (activeTimers.length > 0) {
      content = generateTimerStatusReading(activeTimers)
    } else {
      // Default to schedule summary
      content = generateScheduleSummary(schedule, 'there')
    }

    return content
  }

  const generateWellnessActivityReading = (activity: any): string => {
    const instructions = activity.instructions?.slice(0, 3).join('. ') || 'Follow the activity instructions.'
    return `You're currently doing a wellness activity: ${activity.title}. ${activity.description}. Here are the first few steps: ${instructions}. Take your time and focus on your wellbeing.`
  }

  const generateActiveTaskReading = (task: any): string => {
    const timeText = task.timeRemaining 
      ? `You have ${Math.ceil(task.timeRemaining / 60)} minutes remaining.`
      : `This task is estimated to take ${task.duration} minutes.`
    
    const statusText = task.isRunning 
      ? 'Your timer is currently running.'
      : 'Your timer is paused or not started yet.'

    const taskTypeText = task.type === 'wellness' 
      ? 'This is a wellness break - perfect time to recharge!'
      : task.type === 'break'
      ? 'This is a regular break - take a moment to relax.'
      : 'This is a work task - stay focused and you\'ve got this!'

    return `You're working on: ${task.title}. ${taskTypeText} ${timeText} ${statusText}`
  }

  const generateTimerStatusReading = (timers: any[]): string => {
    const runningTimers = timers.filter(t => t.isRunning)
    const pausedTimers = timers.filter(t => !t.isRunning)

    let status = ""
    
    if (runningTimers.length > 0) {
      const timer = runningTimers[0]
      const minutes = Math.ceil(timer.timeRemaining / 60)
      status += `You have a timer running for "${timer.taskTitle}" with ${minutes} minutes remaining. `
    }
    
    if (pausedTimers.length > 0) {
      status += `You also have ${pausedTimers.length} paused timer${pausedTimers.length > 1 ? 's' : ''}. `
    }

    if (status === "") {
      status = "No active timers at the moment. Ready to start your next task?"
    }

    return status + "Stay focused and keep up the great work!"
  }

  const generateNextUpReading = (): string => {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const upcomingTasks = schedule
      .filter(item => {
        const [hours, minutes] = item.startTime.split(':').map(Number)
        const taskTime = hours * 60 + minutes
        return taskTime > currentTime
      })
      .slice(0, 3)

    if (upcomingTasks.length === 0) {
      return "You have no more tasks scheduled for today. Great job staying on track!"
    }

    const nextTask = upcomingTasks[0]
    const nextTaskText = `Your next task is "${nextTask.title}" at ${nextTask.startTime}.`
    
    if (upcomingTasks.length > 1) {
      const followingTasks = upcomingTasks.slice(1, 3).map(t => `"${t.title}" at ${t.startTime}`).join(', and ')
      return `${nextTaskText} After that, you have ${followingTasks}.`
    }

    return nextTaskText
  }

  const readScheduleSummary = () => {
    const summaryData = {
      schedule,
      userName: 'there' // Could be personalized later
    }
    synthesizeAndPlay(summaryData, 'schedule-summary')
  }

  const readMotivationalMessage = async () => {
    try {
      // Get AI-powered motivational message from Bedrock
      console.log('🤖 Getting smart motivation from Bedrock...')
      const response = await fetch('/api/bedrock/motivation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedTasks,
          totalTasks,
          userMood: 'focused' // Could be dynamic based on user input
        })
      })
      
      if (response.ok) {
        const { message } = await response.json()
        console.log('✅ Bedrock generated:', message)
        synthesizeAndPlay(message, 'bedrock-motivation')
      } else {
        // Fallback to local motivation
        const motivationData = { completedTasks, totalTasks }
        synthesizeAndPlay(motivationData, 'motivational')
      }
    } catch (error) {
      console.error('Bedrock motivation failed:', error)
      // Fallback to local motivation
      const motivationData = { completedTasks, totalTasks }
      synthesizeAndPlay(motivationData, 'motivational')
    }
  }

  // New context-aware action functions
  const readCurrentScreen = () => {
    const screenContent = generateCurrentScreenContent()
    synthesizeAndPlay(screenContent, 'screen-content')
  }

  const readWellnessActivity = () => {
    if (currentWellnessActivity) {
      const activityContent = generateWellnessActivityReading(currentWellnessActivity)
      synthesizeAndPlay(activityContent, 'wellness-activity')
    }
  }

  const readTimerStatus = () => {
    if (activeTimers.length > 0 || activeTask) {
      const timerContent = activeTask 
        ? generateActiveTaskReading(activeTask)
        : generateTimerStatusReading(activeTimers)
      synthesizeAndPlay(timerContent, 'timer-status')
    }
  }

  const readNextUp = () => {
    const nextUpContent = generateNextUpReading()
    synthesizeAndPlay(nextUpContent, 'next-up')
  }

  const togglePlayback = () => {
    if (currentAudio) {
      if (isPlaying) {
        currentAudio.pause()
        setIsPlaying(false)
      } else {
        currentAudio.play()
        setIsPlaying(true)
      }
    }
  }

  const stopPlayback = () => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      setIsPlaying(false)
    }
  }

  // Always show voice controller - we have browser fallback
  // if (!isPollyAvailable) {
  //   return null // Don't show if Polly is not available
  // }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Voice Toggle */}
      <button
        onClick={() => setIsEnabled(!isEnabled)}
        className={`
          p-2 rounded-lg transition-all duration-200 
          ${isEnabled 
            ? 'bg-mindful-100 text-mindful-700 hover:bg-mindful-200' 
            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          }
          focus:outline-none focus:ring-2 focus:ring-mindful-500 focus:ring-offset-2
        `}
        title={isEnabled ? 'Voice enabled' : 'Voice disabled'}
      >
        {isEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>

      {isEnabled && (
        <>
          {/* Playback Controls */}
          {(isPlaying || isSynthesizing) && (
            <div className="flex items-center gap-1">
              {isSynthesizing ? (
                <Loader2 className="w-4 h-4 animate-spin text-mindful-600" />
              ) : (
                <button
                  onClick={togglePlayback}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title={isPlaying ? 'Pause' : 'Resume'}
                >
                  {isPlaying ? (
                    <Pause className="w-3 h-3 text-gray-600" />
                  ) : (
                    <Play className="w-3 h-3 text-gray-600" />
                  )}
                </button>
              )}
              
              <button
                onClick={stopPlayback}
                className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-400 hover:text-gray-600"
                title="Stop"
              >
                <VolumeX className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Voice Actions */}
          {!isPlaying && !isSynthesizing && (
            <div className="flex items-center gap-1 flex-wrap">
              {/* Primary Context-Aware Button */}
              <button
                onClick={readCurrentScreen}
                className="
                  text-xs px-3 py-1 bg-gradient-to-r from-mindful-500 to-serenity-500 text-white 
                  rounded-md hover:from-mindful-600 hover:to-serenity-600 transition-all
                  font-medium shadow-sm
                "
                title="Read what's currently on screen"
              >
                🔊 Read Screen
              </button>

              {/* Contextual Buttons */}
              {currentWellnessActivity && (
                <button
                  onClick={readWellnessActivity}
                  className="
                    text-xs px-2 py-1 bg-serenity-50 text-serenity-700 
                    rounded hover:bg-serenity-100 transition-colors
                    border border-serenity-200
                  "
                  title="Read wellness activity instructions"
                >
                  🧘 Activity Guide
                </button>
              )}

              {(activeTask || activeTimers.length > 0) && (
                <button
                  onClick={readTimerStatus}
                  className="
                    text-xs px-2 py-1 bg-balance-50 text-balance-700 
                    rounded hover:bg-balance-100 transition-colors
                    border border-balance-200
                  "
                  title="Read timer and task status"
                >
                  ⏰ Timer Status
                </button>
              )}
              
              <button
                onClick={readNextUp}
                className="
                  text-xs px-2 py-1 bg-mindful-50 text-mindful-700 
                  rounded hover:bg-mindful-100 transition-colors
                  border border-mindful-200
                "
                title="Read upcoming tasks"
              >
                📅 Next Up
              </button>
              
              <button
                onClick={readMotivationalMessage}
                className="
                  text-xs px-2 py-1 bg-yellow-50 text-yellow-700 
                  rounded hover:bg-yellow-100 transition-colors
                  border border-yellow-200
                "
                title="Motivational message"
              >
                💪 Motivate
              </button>
            </div>
          )}
        </>
      )}

      {/* Status Indicator */}
      {isEnabled && (
        <div className="flex items-center">
          <div className={`
            w-2 h-2 rounded-full 
            ${isSynthesizing ? 'bg-yellow-400 animate-pulse' : 
              isPlaying ? 'bg-green-400 animate-pulse' : 
              'bg-gray-300'}
          `} />
        </div>
      )}
    </div>
  )
}