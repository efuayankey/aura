'use client'

import { useState, useEffect, useRef } from 'react'
import InputForm from '@/components/InputForm'
import BalanceScore from '@/components/BalanceScore'
import ScheduleApproval from '@/components/ScheduleApproval'
import ScheduleItemCard from '@/components/ScheduleItemCard'
import GameStats from '@/components/GameStats'
import NotificationCenter from '@/components/NotificationCenter'
import VoiceController from '@/components/VoiceController'
import HistoryView from '@/components/HistoryView'
import WellnessActivity from '@/components/WellnessActivity'
import ManualRescheduleModal from '@/components/ManualRescheduleModal'
import Timer from '@/components/Timer'
import WellnessActivitySuggestions from '@/components/WellnessActivitySuggestions'
import { UserInput, ScheduleItem, BalanceScore as BalanceScoreType, TaskAction, GameStats as GameStatsType, AIsuggestion } from '@/types'
import { AIScheduler } from '@/lib/aiScheduler'
import { BalanceCalculator } from '@/lib/balanceScore'
import { GamificationEngine } from '@/lib/gamificationEngine'
import { DynamicScheduler } from '@/lib/dynamicScheduler'
import { WellnessDetector } from '@/lib/wellnessDetector'
import { NotificationSystem } from '@/lib/notificationSystem'
import { SmartRescheduler } from '@/lib/smartRescheduler'
import { UserSessionManager } from '@/lib/userSession'
import { WellnessActivityManager, WellnessActivityData } from '@/lib/wellnessActivityManager'
import { Check, CheckCircle2, Circle, Clock } from 'lucide-react'

// Animated Loading Component
function AnimatedLoadingView() {
  const [currentStep, setCurrentStep] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [showDots, setShowDots] = useState(false)

  const steps = [
    { icon: '🧠', text: 'Reading your mind...', subtitle: 'Understanding your energy and goals' },
    { icon: '🎯', text: 'Crafting your perfect day...', subtitle: 'Balancing productivity with wellness' },
    { icon: '✨', text: 'Adding magical touches...', subtitle: 'Personalizing every detail for you' },
    { icon: '🎆', text: 'Almost ready!', subtitle: 'Preparing your balanced schedule' }
  ]

  const motivationalMessages = [
    'Great things take time 💪',
    'Your perfect day is being born 🌱',
    'AI magic in progress ✨',
    'Building something amazing 🚀'
  ]

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length)
    }, 2000)

    const textInterval = setInterval(() => {
      setCurrentText(motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)])
    }, 3000)

    const dotsInterval = setInterval(() => {
      setShowDots(prev => !prev)
    }, 800)

    return () => {
      clearInterval(stepInterval)
      clearInterval(textInterval)
      clearInterval(dotsInterval)
    }
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-serenity-50 via-white to-mindful-50">
      <div className="text-center max-w-lg">
        {/* Enhanced Animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-serenity-500 via-mindful-500 to-balance-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl animate-pulse">
            <div className="w-12 h-12 bg-white rounded-full animate-ping flex items-center justify-center">
              <span className="text-2xl animate-bounce">
                {steps[currentStep]?.icon}
              </span>
            </div>
          </div>
          
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 bg-gradient-to-r from-serenity-400 to-mindful-400 rounded-full animate-ping`}
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 2) * 40}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </div>
        </div>

        {/* Animated Title */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-serenity-600 via-mindful-600 to-balance-600 bg-clip-text text-transparent mb-2 animate-fade-in">
            {steps[currentStep]?.text}
            {showDots && <span className="animate-pulse">...</span>}
          </h2>
          <p className="text-gray-600 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {steps[currentStep]?.subtitle}
          </p>
        </div>

        {/* Animated Progress Steps */}
        <div className="space-y-4 mb-8">
          {[
            { emoji: '📝', text: 'Analyzing your tasks', delay: 0 },
            { emoji: '🧘', text: 'Balancing work & wellness', delay: 0.5 },
            { emoji: '🎯', text: 'Optimizing your flow', delay: 1 },
            { emoji: '🌟', text: 'Adding personal touches', delay: 1.5 }
          ].map((step, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-1000 ${
                index <= currentStep 
                  ? 'bg-white/60 backdrop-blur-sm border border-white/40 shadow-sm translate-x-0 opacity-100' 
                  : 'translate-x-4 opacity-50'
              }`}
              style={{ animationDelay: `${step.delay}s` }}
            >
              <div className={`text-2xl transition-all duration-500 ${
                index <= currentStep ? 'scale-110' : 'scale-100'
              }`}>
                {step.emoji}
              </div>
              <div className="flex-1 text-left">
                <p className={`font-medium transition-all duration-500 ${
                  index <= currentStep ? 'text-gray-800' : 'text-gray-500'
                }`}>
                  {step.text}
                </p>
              </div>
              {index <= currentStep && (
                <div className="text-green-500 animate-bounce">
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Rotating Motivational Text */}
        <div className="bg-gradient-to-r from-serenity-50 to-mindful-50 rounded-2xl p-6 border border-serenity-200">
          <p className="text-serenity-700 font-medium animate-fade-in" key={currentText}>
            {currentText}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                index === currentStep 
                  ? 'bg-gradient-to-r from-serenity-500 to-mindful-500 scale-125' 
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </main>
  )
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<'input' | 'approval' | 'dashboard'>('input')
  const [userInput, setUserInput] = useState<UserInput | null>(null)
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [balanceScore, setBalanceScore] = useState<BalanceScoreType | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [skippedTasks, setSkippedTasks] = useState<string[]>([])
  const [rescheduledTasks, setRescheduledTasks] = useState<string[]>([])
  const [gameStats, setGameStats] = useState<GameStatsType>({
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    level: 1,
    achievements: [],
    taskActions: []
  })
  const [suggestions, setSuggestions] = useState<AIsuggestion[]>([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [currentWellnessActivity, setCurrentWellnessActivity] = useState<WellnessActivityData | null>(null)
  const [completedWellnessActivities, setCompletedWellnessActivities] = useState<string[]>([])
  const [lastWellnessTime, setLastWellnessTime] = useState<Date | null>(null)
  const [manualRescheduleData, setManualRescheduleData] = useState<{
    taskId: string
    taskTitle: string
    taskDuration: number
  } | null>(null)
  
  // Timer states
  const [activeTimers, setActiveTimers] = useState<{[taskId: string]: {
    isRunning: boolean
    timeRemaining: number // in seconds
    duration: number // original duration in minutes
  }}>({})
  const [activeTask, setActiveTask] = useState<{
    id: string
    title: string
    type: 'work' | 'break' | 'wellness'
    duration: number
    timeRemaining?: number
    isRunning?: boolean
  } | null>(null)

  // Initialize user session and load existing plan
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const existingPlan = await UserSessionManager.getTodaysPlan()
        if (existingPlan) {
          console.log('📂 Loaded existing plan from storage')
          setUserInput(existingPlan.userInput)
          setSchedule(existingPlan.schedule)
          setCompletedTasks(existingPlan.completedTasks)
          setSkippedTasks(existingPlan.skippedTasks)
          setCurrentStep('dashboard')
          
          const score = BalanceCalculator.calculateScore(
            existingPlan.schedule,
            existingPlan.userInput,
            existingPlan.completedTasks,
            existingPlan.skippedTasks,
            [] // No rescheduled tasks in storage yet
          )
          setBalanceScore(score)
        }

        const session = await UserSessionManager.getUserSession()
        setGameStats(prev => ({
          ...prev,
          currentStreak: session.streak,
          totalPoints: session.averageScore * 10
        }))
      } catch (error) {
        console.warn('Error loading user session:', error)
      }
    }

    initializeSession()
  }, [])

  // Cleanup notifications on unmount
  useEffect(() => {
    return () => {
      NotificationSystem.clearAllReminders()
    }
  }, [])

  const handleTaskAction = async (action: Omit<TaskAction, 'timestamp' | 'points'>) => {
    if (!userInput || !balanceScore) {
      console.warn('⚠️ Task action blocked: Missing userInput or balanceScore')
      return
    }

    // Verify the task exists in the schedule
    const taskExists = schedule.some(item => (item.taskId || item.id) === action.taskId)
    if (!taskExists) {
      console.error('⚠️ Task action blocked: Task not found in schedule:', action.taskId)
      return
    }

    console.log('🎯 Task Action:', action.type, 'for task:', action.taskId)
    console.log('📅 Schedule before action:', schedule.length, 'items')
    console.log('📊 Current completion state:', {
      completed: completedTasks.length,
      skipped: skippedTasks.length,
      rescheduled: rescheduledTasks.length
    })

    const fullAction: TaskAction = {
      ...action,
      timestamp: new Date(),
      points: 0 // Will be calculated by gamification engine
    }

    // Process action through gamification engine
    const result = GamificationEngine.processTaskAction(fullAction, gameStats, balanceScore, userInput)

    // Update game stats
    setGameStats(result.updatedStats)

    // Update task lists based on action type
    switch (action.type) {
      case 'complete':
        setCompletedTasks(prev => [...prev, action.taskId])
        setSkippedTasks(prev => prev.filter(id => id !== action.taskId))
        setRescheduledTasks(prev => prev.filter(id => id !== action.taskId))
        break
      case 'skip':
        setSkippedTasks(prev => [...prev, action.taskId])
        setCompletedTasks(prev => prev.filter(id => id !== action.taskId))
        setRescheduledTasks(prev => prev.filter(id => id !== action.taskId))
        break
      case 'reschedule':
        // Handle smart rescheduling
        handleSmartReschedule(action.taskId)
        setRescheduledTasks(prev => [...prev, action.taskId])
        setSkippedTasks(prev => prev.filter(id => id !== action.taskId))
        setCompletedTasks(prev => prev.filter(id => id !== action.taskId))
        break
    }

    // Recalculate balance score
    const newCompletedTasks = action.type === 'complete' 
      ? [...completedTasks, action.taskId]
      : completedTasks.filter(id => id !== action.taskId)
    
    const updatedScore = BalanceCalculator.calculateScore(
      schedule, 
      userInput, 
      newCompletedTasks,
      skippedTasks,
      rescheduledTasks
    )
    setBalanceScore(updatedScore)

    // Add AI suggestion if provided
    if (result.suggestion) {
      setSuggestions(prev => [...prev, result.suggestion!])
    }

    // Trigger dynamic rescheduling after task actions (DISABLED FOR DEBUGGING)
    // if (action.type === 'complete' || action.type === 'skip') {
    //   handleDynamicReschedule()
    // }

    // Check wellness and generate interventions
    handleWellnessCheck(result.updatedStats)

    // Save progress to storage
    if (userInput && balanceScore) {
      try {
        await UserSessionManager.updateProgress(
          completedTasks,
          skippedTasks,
          schedule,
          updatedScore.totalScore
        )
        console.log('💾 Updated progress in storage')
      } catch (error) {
        console.error('Error updating progress:', error)
      }
    }

    // Show success notification for completed tasks
    if (action.type === 'complete' && notificationsEnabled) {
      NotificationSystem.showSuccessNotification(
        `Great job completing your task! +${result.pointsEarned} points earned.`
      )
    }
  }

  const handleWellnessCheck = (updatedStats: GameStatsType) => {
    if (!userInput) return

    const wellnessMetrics = WellnessDetector.analyzeWellness(updatedStats, userInput)
    
    // Check for wellness activity suggestions
    const suggestedActivity = WellnessActivityManager.suggestActivity(
      userInput,
      updatedStats,
      lastWellnessTime || undefined
    )

    if (suggestedActivity) {
      setSuggestions(prev => [...prev, {
        id: `wellness-activity-${Date.now()}`,
        message: `Time for a wellness break! Try: ${suggestedActivity.title}`,
        type: 'wellness',
        actionSuggestion: {
          type: 'wellness_activity',
          data: { activity: suggestedActivity }
        }
      }])
    }
    
    if (wellnessMetrics.interventionNeeded) {
      const intervention = WellnessDetector.generateWellnessIntervention(
        wellnessMetrics,
        userInput,
        updatedStats
      )
      
      if (intervention) {
        setSuggestions(prev => [...prev, intervention])
      }
    }

    // Periodic wellness checks (every 5 actions)
    if (updatedStats.taskActions.length % 5 === 0 && updatedStats.taskActions.length > 0) {
      const emotionalPattern = WellnessDetector.detectEmotionalPatterns(updatedStats.taskActions)
      
      if (emotionalPattern.pattern === 'struggling' && emotionalPattern.confidence > 0.7) {
        const breakActivity = WellnessDetector.suggestBreakActivity(
          userInput,
          120, // Assume 2 hour session
          wellnessMetrics.stressLevel
        )
        
        setSuggestions(prev => [...prev, {
          id: `wellness-pattern-${Date.now()}`,
          message: `I notice you might be having a challenging time. Consider taking a break: ${breakActivity}`,
          type: 'wellness',
          actionSuggestion: {
            type: 'break',
            data: { activity: breakActivity }
          }
        }])
      }
    }
  }

  const handleDynamicReschedule = async () => {
    if (!userInput) return

    try {
      const newSchedule = await DynamicScheduler.rescheduleRemaining(
        schedule,
        userInput,
        completedTasks,
        skippedTasks,
        rescheduledTasks,
        new Date()
      )

      // Only update if the schedule actually changed and is not empty
      if (JSON.stringify(newSchedule) !== JSON.stringify(schedule) && newSchedule.length > 0) {
        console.log('🔄 Updating schedule with', newSchedule.length, 'items')
        setSchedule(newSchedule)
        
        // Add suggestion about rescheduling
        const timeRemaining = calculateRemainingMinutes()
        const suggestion = DynamicScheduler.generateTimeBasedSuggestion(
          skippedTasks.length > completedTasks.length ? 'skip' : 'complete',
          timeRemaining,
          schedule.filter(s => s.type === 'work').length,
          completedTasks.length
        )
        
        if (suggestion) {
          setSuggestions(prev => [...prev, {
            id: `dynamic-${Date.now()}`,
            message: suggestion,
            type: 'productivity'
          }])
        }
      }
    } catch (error) {
      console.error('Dynamic rescheduling error:', error)
    }
  }

  const calculateRemainingMinutes = (): number => {
    if (!userInput) return 0
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTimeMinutes = currentHour * 60 + currentMinute
    
    const [endHour, endMinute] = userInput.endTime.split(':').map(Number)
    const endTimeMinutes = endHour * 60 + endMinute
    
    return Math.max(0, endTimeMinutes - currentTimeMinutes)
  }

  const handleInputSubmit = async (input: UserInput) => {
    setIsGenerating(true)
    setUserInput(input)
    
    // Reset all task states when starting new schedule
    console.log('🆕 Resetting task states for new schedule generation')
    setCompletedTasks([])
    setSkippedTasks([])
    setRescheduledTasks([])
    setActiveTimers({})
    setActiveTask(null)
    
    try {
      // Call Amazon Bedrock API for AI scheduling
      console.log('🚀 Calling Amazon Bedrock for schedule generation...')
      const response = await fetch('/api/bedrock/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      })
      
      if (!response.ok) {
        console.warn('⚠️ Bedrock API failed, trying OpenAI fallback...')
        throw new Error('Bedrock API failed')
      }
      
      const { schedule: generatedSchedule, model } = await response.json()
      console.log(`✅ Schedule generated using ${model}`)
      
      const calculatedScore = BalanceCalculator.calculateScore(
        generatedSchedule, 
        input, 
        [], // No completed tasks yet
        [], // No skipped tasks yet
        []  // No rescheduled tasks yet
      )
      
      // Ensure no tasks are marked as completed for new schedule
      console.log('✅ Generated schedule with', generatedSchedule.length, 'items')
      console.log('📝 Completed tasks array reset to:', [])
      
      setSchedule(generatedSchedule)
      setBalanceScore(calculatedScore)
      setCurrentStep('approval')
      
      // Show notification about using Bedrock
      setSuggestions(prev => [...prev, {
        id: `bedrock-success-${Date.now()}`,
        message: `🤖 Schedule generated using Amazon Bedrock Claude Sonnet - Advanced AI scheduling!`,
        type: 'productivity'
      }])
      
    } catch (error) {
      console.error('❌ Bedrock scheduling failed:', error)
      
      try {
        // Fallback to OpenAI API
        console.log('🔄 Falling back to OpenAI...')
        const response = await fetch('/api/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        })
        
        if (!response.ok) {
          throw new Error('OpenAI API also failed')
        }
        
        const { schedule: generatedSchedule } = await response.json()
        const calculatedScore = BalanceCalculator.calculateScore(
          generatedSchedule, 
          input, 
          [], // No completed tasks yet
          [], // No skipped tasks yet
          []  // No rescheduled tasks yet
        )
        
        setSchedule(generatedSchedule)
        setBalanceScore(calculatedScore)
        setCurrentStep('approval')
        
        setSuggestions(prev => [...prev, {
          id: `openai-fallback-${Date.now()}`,
          message: `⚠️ Using OpenAI fallback - Bedrock temporarily unavailable`,
          type: 'adjustment'
        }])
        
      } catch (fallbackError) {
        console.error('❌ Both Bedrock and OpenAI failed:', fallbackError)
        // Final fallback to local AI scheduling
        const generatedSchedule = await AIScheduler.generateSchedule(input)
        const calculatedScore = BalanceCalculator.calculateScore(
          generatedSchedule, 
          input, 
          [], // No completed tasks yet
          [], // No skipped tasks yet
          []  // No rescheduled tasks yet
        )
        
        setSchedule(generatedSchedule)
        setBalanceScore(calculatedScore)
        setCurrentStep('approval')
        
        setSuggestions(prev => [...prev, {
          id: `local-fallback-${Date.now()}`,
          message: `🔧 Using local AI fallback - Cloud services temporarily unavailable`,
          type: 'adjustment'
        }])
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleScheduleApproval = async () => {
    setCurrentStep('dashboard')
    
    // Save the initial plan to DynamoDB/localStorage
    if (userInput && balanceScore) {
      try {
        console.log('💾 Attempting to save plan to DynamoDB...')
        await UserSessionManager.saveDailyPlan(
          schedule,
          userInput,
          balanceScore.totalScore,
          [],
          [],
          0
        )
        console.log('✅ Successfully saved plan to storage')
        
        // Show notification about successful save
        setSuggestions(prev => [...prev, {
          id: `save-success-${Date.now()}`,
          message: 'Your daily plan has been saved and backed up!',
          type: 'productivity'
        }])
      } catch (error) {
        console.error('❌ Error saving plan:', error)
        setSuggestions(prev => [...prev, {
          id: `save-error-${Date.now()}`,
          message: `Save error: ${error.message}`,
          type: 'productivity'
        }])
      }
    }
    
    // Disable browser notifications in favor of notification center
    // const notificationPermission = await NotificationSystem.initialize()
    // setNotificationsEnabled(notificationPermission)
    
    // if (notificationPermission) {
    //   NotificationSystem.scheduleTaskReminders(schedule)
    //   NotificationSystem.schedulePeriodicWellnessChecks()
    // }
  }

  const handleScheduleRegeneration = async (feedback: string, preferences?: any) => {
    if (!userInput) return

    setIsGenerating(true)
    
    // Create modified input based on feedback and preferences
    const modifiedInput = { ...userInput }
    
    // Apply preferences to input
    if (preferences?.longerBreaks) {
      // This would be handled by the AI scheduling logic
    }
    if (preferences?.shorterWorkBlocks) {
      // Modify estimated times for tasks
      modifiedInput.tasks = modifiedInput.tasks.map(task => ({
        ...task,
        estimatedTime: Math.max(15, task.estimatedTime * 0.8)
      }))
    }
    
    try {
      // Include feedback in API call
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...modifiedInput, 
          feedback, 
          preferences 
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to regenerate schedule')
      }
      
      const { schedule: newSchedule } = await response.json()
      const newScore = BalanceCalculator.calculateScore(
        newSchedule, 
        modifiedInput, 
        [], // No completed tasks yet for regenerated schedule
        [], // No skipped tasks yet
        []  // No rescheduled tasks yet
      )
      
      setSchedule(newSchedule)
      setBalanceScore(newScore)
      setUserInput(modifiedInput)
    } catch (error) {
      console.error('Error regenerating schedule:', error)
      // Fallback to local scheduling with modifications
      const newSchedule = await AIScheduler.generateSchedule(modifiedInput)
      const newScore = BalanceCalculator.calculateScore(
        newSchedule, 
        modifiedInput, 
        [], // No completed tasks yet for regenerated schedule
        [], // No skipped tasks yet
        []  // No rescheduled tasks yet
      )
      
      setSchedule(newSchedule)
      setBalanceScore(newScore)
      setUserInput(modifiedInput)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSuggestionDismiss = (suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId))
  }

  const handleSmartReschedule = async (taskId: string) => {
    if (!userInput) return

    try {
      console.log('🔄 Smart rescheduling task:', taskId)
      console.log('📅 Current schedule length:', schedule.length)
      
      const result = await SmartRescheduler.rescheduleTask(taskId, schedule, userInput)
      
      // Check if manual rescheduling is needed
      if (result.needsManualReschedule && result.taskDetails) {
        console.log('⏰ AI reschedule failed, showing manual time picker')
        setManualRescheduleData({
          taskId,
          taskTitle: result.taskDetails.title,
          taskDuration: result.taskDetails.duration
        })
        return
      }
      
      // AI reschedule succeeded
      if (result.newSchedule && result.rescheduledTo) {
        setSchedule(result.newSchedule)
        
        // Save the updated schedule to storage
        if (userInput && balanceScore) {
          try {
            await UserSessionManager.updateProgress(
              completedTasks,
              skippedTasks,
              result.newSchedule,
              balanceScore.totalScore
            )
            console.log('💾 Saved rescheduled plan to storage')
          } catch (error) {
            console.error('Error saving rescheduled plan:', error)
          }
        }
        
        // Show notification about the reschedule
        setSuggestions(prev => [...prev, {
          id: `reschedule-${Date.now()}`,
          message: `Task successfully ${result.reason}. New time: ${result.rescheduledTo.startTime} - ${result.rescheduledTo.endTime}`,
          type: 'productivity'
        }])
        
        console.log('✅ Task rescheduled to:', result.rescheduledTo)
      }
      
    } catch (error) {
      console.error('❌ Rescheduling failed:', error)
      
      // Show error notification
      setSuggestions(prev => [...prev, {
        id: `reschedule-error-${Date.now()}`,
        message: 'Unable to find a better time slot for this task. Try completing other tasks first.',
        type: 'adjustment'
      }])
    }
  }

  const handleAcceptSuggestion = (suggestion: AIsuggestion) => {
    // Handle different action suggestions
    if (suggestion.actionSuggestion) {
      switch (suggestion.actionSuggestion.type) {
        case 'break':
          // Could trigger a break reminder or add break to schedule
          if (notificationsEnabled) {
            NotificationSystem.showWellnessReminder({
              id: 'wellness-break',
              taskId: '',
              startTime: new Date().toLocaleTimeString(),
              endTime: new Date(Date.now() + 15 * 60000).toLocaleTimeString(),
              type: 'wellness',
              title: 'Wellness Break',
              description: suggestion.actionSuggestion.data?.activity || 'Take a mindful break'
            })
          }
          break
        case 'wellness_activity':
          // Show wellness activity modal
          const activity = suggestion.actionSuggestion.data?.activity
          if (activity) {
            setCurrentWellnessActivity(activity)
          }
          break
        case 'split_task':
          // Could trigger schedule regeneration with shorter tasks
          console.log('Splitting tasks suggested')
          break
        default:
          console.log('Action suggestion:', suggestion.actionSuggestion.type)
      }
    }
    
    // Remove the suggestion after accepting
    handleSuggestionDismiss(suggestion.id)
  }

  const handleWellnessActivityComplete = () => {
    if (currentWellnessActivity) {
      setCompletedWellnessActivities(prev => [...prev, currentWellnessActivity.type])
      setLastWellnessTime(new Date())
      setCurrentWellnessActivity(null)
      
      // Update wellness count in storage
      const newWellnessCount = completedWellnessActivities.length + 1
      if (userInput && balanceScore) {
        UserSessionManager.updateProgress(
          completedTasks,
          skippedTasks,
          schedule,
          balanceScore.totalScore,
          newWellnessCount
        ).catch(console.error)
      }
    }
  }

  const handleWellnessActivitySkip = () => {
    setCurrentWellnessActivity(null)
  }

  const handleManualReschedule = async (newStartTime: string, newEndTime: string) => {
    if (!manualRescheduleData) return

    try {
      console.log('✏️ Manual reschedule confirmed:', newStartTime, '-', newEndTime)
      
      const newSchedule = SmartRescheduler.manualRescheduleTask(
        manualRescheduleData.taskId,
        schedule,
        newStartTime,
        newEndTime
      )
      
      setSchedule(newSchedule)
      setManualRescheduleData(null)
      
      // Save the updated schedule
      if (userInput && balanceScore) {
        try {
          await UserSessionManager.updateProgress(
            completedTasks,
            skippedTasks,
            newSchedule,
            balanceScore.totalScore
          )
          console.log('💾 Saved manually rescheduled plan to storage')
        } catch (error) {
          console.error('Error saving manually rescheduled plan:', error)
        }
      }
      
      // Show success notification
      setSuggestions(prev => [...prev, {
        id: `manual-reschedule-${Date.now()}`,
        message: `"${manualRescheduleData.taskTitle}" rescheduled to ${newStartTime} - ${newEndTime}`,
        type: 'productivity'
      }])
      
    } catch (error) {
      console.error('❌ Manual rescheduling failed:', error)
      setSuggestions(prev => [...prev, {
        id: `manual-reschedule-error-${Date.now()}`,
        message: `Failed to reschedule: ${error.message}`,
        type: 'productivity'
      }])
    }
  }

  const handleManualRescheduleCancel = () => {
    setManualRescheduleData(null)
  }

  // Timer handler functions
  const startTimer = (taskId: string) => {
    const task = schedule.find(item => (item.taskId || item.id) === taskId)
    if (!task) {
      console.error('⚠️ Task not found for timer:', taskId)
      return
    }

    const durationInMinutes = calculateTaskDuration(task.startTime, task.endTime)
    const durationInSeconds = durationInMinutes * 60
    
    console.log(`🚀 Starting timer for ${task.title}, duration: ${durationInMinutes} minutes (${durationInSeconds} seconds)`)
    
    // Clear any existing timer for this task first
    setActiveTimers(prev => {
      const newTimers = {
        ...prev,
        [taskId]: {
          isRunning: true,
          timeRemaining: durationInSeconds,
          duration: durationInMinutes
        }
      }
      console.log('🔧 Active timers updated:', newTimers)
      return newTimers
    })

    // Set this as the active task
    setActiveTask({
      id: taskId,
      title: task.title,
      type: task.type as 'work' | 'break' | 'wellness',
      duration: durationInMinutes,
      timeRemaining: durationInSeconds,
      isRunning: true
    })

    // Show notification
    setSuggestions(prev => [...prev, {
      id: `timer-start-${Date.now()}`,
      message: `Timer started for "${task.title}" - ${durationInMinutes} minutes`,
      type: 'productivity'
    }])
  }

  const pauseTimer = (taskId: string) => {
    setActiveTimers(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        isRunning: false
      }
    }))

    if (activeTask?.id === taskId) {
      setActiveTask(prev => prev ? { ...prev, isRunning: false } : null)
    }
  }

  const resumeTimer = (taskId: string) => {
    setActiveTimers(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        isRunning: true
      }
    }))

    if (activeTask?.id === taskId) {
      setActiveTask(prev => prev ? { ...prev, isRunning: true } : null)
    }
  }

  const completeTimer = (taskId: string) => {
    console.log('🏁 Completing timer for task:', taskId)
    
    // Mark task as completed
    handleTaskAction({ type: 'complete', taskId })
    
    // Remove from active timers
    setActiveTimers(prev => {
      const { [taskId]: removed, ...rest } = prev
      console.log('🗑️ Removed timer for task:', taskId)
      return rest
    })

    // Clear active task if it was this one
    if (activeTask?.id === taskId) {
      console.log('🚫 Clearing active task')
      setActiveTask(null)
    }

    const task = schedule.find(item => (item.taskId || item.id) === taskId)
    if (task) {
      setSuggestions(prev => [...prev, {
        id: `timer-complete-${Date.now()}`,
        message: `🎉 Great job completing "${task.title}"! +15 points earned.`,
        type: 'productivity'
      }])
    }
  }

  const resetTimer = (taskId: string) => {
    const task = schedule.find(item => (item.taskId || item.id) === taskId)
    if (!task) return

    const durationInMinutes = calculateTaskDuration(task.startTime, task.endTime)
    
    setActiveTimers(prev => ({
      ...prev,
      [taskId]: {
        isRunning: false,
        timeRemaining: durationInMinutes * 60,
        duration: durationInMinutes
      }
    }))

    if (activeTask?.id === taskId) {
      setActiveTask(prev => prev ? {
        ...prev,
        timeRemaining: durationInMinutes * 60,
        isRunning: false
      } : null)
    }
  }

  const closeTimer = () => {
    // Stop all timers and clear active task
    setActiveTimers({})
    setActiveTask(null)
  }

  const calculateTaskDuration = (startTime: string, endTime: string): number => {
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)
    
    const startMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute
    
    return endMinutes - startMinutes
  }

  // Improved timer effect with proper state management
  useEffect(() => {
    if (!activeTask || !activeTask.isRunning || activeTask.timeRemaining <= 0) {
      console.log('⏸️ No active running task, skipping timer')
      return
    }

    console.log(`🚀 Starting countdown for ${activeTask.title}, remaining: ${activeTask.timeRemaining}s`)
    
    const interval = setInterval(() => {
      console.log('⏰ Timer tick...')
      
      setActiveTask(current => {
        if (!current || !current.isRunning) {
          console.log('⏹️ Stopping timer - task not running')
          return current
        }

        if (current.timeRemaining <= 0) {
          console.log('⏹️ Timer reached zero - stopping but NOT auto-completing')
          // Stop the timer but don't auto-complete - user must click Complete
          const stoppedTask = {
            ...current,
            timeRemaining: 0,
            isRunning: false
          }
          
          // Update the timer state to show timer finished
          setActiveTimers(prev => ({
            ...prev,
            [current.id]: {
              ...prev[current.id],
              timeRemaining: 0,
              isRunning: false
            }
          }))
          
          return stoppedTask
        }

        const newTimeRemaining = current.timeRemaining - 1
        console.log(`🔥 Countdown: ${current.title} - ${newTimeRemaining}s remaining`)

        // Update the timer state
        setActiveTimers(prev => ({
          ...prev,
          [current.id]: {
            ...prev[current.id],
            timeRemaining: newTimeRemaining,
            isRunning: true
          }
        }))

        return {
          ...current,
          timeRemaining: newTimeRemaining,
          isRunning: true
        }
      })
    }, 1000)

    return () => {
      console.log('🛑 Cleaning up timer interval')
      clearInterval(interval)
    }
  }, [activeTask?.id, activeTask?.isRunning]) // Restart when active task changes

  if (isGenerating) {
    return <AnimatedLoadingView />
  }

  if (currentStep === 'input') {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-serenity-600 via-mindful-600 to-balance-600 bg-clip-text text-transparent mb-4">
              AURA
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your AI Balance Agent - Where wellness meets productivity
            </p>
          </div>
          <InputForm onSubmit={handleInputSubmit} />
        </div>
      </main>
    )
  }

  if (currentStep === 'approval' && schedule.length > 0 && balanceScore) {
    return (
      <main className="min-h-screen p-8">
        <ScheduleApproval
          schedule={schedule}
          balanceScore={balanceScore}
          onApprove={handleScheduleApproval}
          onRegenerate={handleScheduleRegeneration}
        />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Brand & Back */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => setCurrentStep('input')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Adjust Settings
              </button>
              
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-serenity-600 via-mindful-600 to-balance-600 bg-clip-text text-transparent">
                  AURA
                </h1>
                <p className="text-sm text-gray-500 -mt-1">Your Perfect Day</p>
              </div>
            </div>
            
            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHistory(true)}
                className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-mindful-500 focus:ring-offset-2"
                title="View History"
              >
                <Clock className="w-5 h-5" />
              </button>
              
              <VoiceController
                schedule={schedule}
                completedTasks={completedTasks.length}
                totalTasks={schedule.filter(s => s.type === 'work').length}
                activeTask={activeTask}
                currentWellnessActivity={currentWellnessActivity}
                activeTimers={Object.keys(activeTimers).map(taskId => ({
                  taskId,
                  taskTitle: schedule.find(s => (s.taskId || s.id) === taskId)?.title || 'Unknown Task',
                  timeRemaining: activeTimers[taskId].timeRemaining,
                  isRunning: activeTimers[taskId].isRunning
                }))}
              />
              
              <NotificationCenter
                suggestions={suggestions}
                onDismiss={handleSuggestionDismiss}
                onAcceptAction={handleAcceptSuggestion}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{completedTasks.length}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{schedule.filter(s => s.type === 'work').length - completedTasks.length}</p>
                <p className="text-sm text-gray-600">Remaining</p>
              </div>
            </div>
          </div>
          
          {balanceScore && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(balanceScore.overall)}</p>
                  <p className="text-sm text-gray-600">Balance Score</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{gameStats.currentStreak}</p>
                <p className="text-sm text-gray-600">Day Streak</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Schedule Display */}
          <div className="xl:col-span-3">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Today's Schedule</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Live updates</span>
                </div>
              </div>
              <div className="space-y-3">
                {schedule.map((item) => {
                  const taskId = item.taskId || item.id
                  const isCompleted = completedTasks.includes(taskId)
                  const isSkipped = skippedTasks.includes(taskId)
                  const isRescheduled = rescheduledTasks.includes(taskId)
                  const taskTimer = activeTimers[taskId]
                  const isActiveTask = activeTask?.id === taskId
                  
                  return (
                    <div key={item.id} className="space-y-3">
                      <ScheduleItemCard
                        item={item}
                        isCompleted={isCompleted}
                        isSkipped={isSkipped}
                        isRescheduled={isRescheduled}
                        onTaskAction={handleTaskAction}
                        hasTimer={!!taskTimer}
                        onStartTimer={startTimer}
                      />
                      
                      
                      {/* Wellness Activity Suggestions for Break/Wellness Tasks */}
                      {isActiveTask && (item.type === 'break' || item.type === 'wellness') && (
                        <WellnessActivitySuggestions
                          taskType={item.type}
                          duration={calculateTaskDuration(item.startTime, item.endTime)}
                          onActivitySelect={(activity) => {
                            setSuggestions(prev => [...prev, {
                              id: `wellness-selected-${Date.now()}`,
                              message: `Great choice! Enjoy your ${activity} break.`,
                              type: 'wellness'
                            }])
                          }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Balance Score Card */}
            {balanceScore && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Balance Score</h3>
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                      <circle cx="50" cy="50" r="40" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        stroke="url(#gradient)" 
                        strokeWidth="8" 
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - balanceScore.overall / 100)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900">{Math.round(balanceScore.overall)}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{Math.round(balanceScore.productivity)}</div>
                      <div className="text-gray-600">Productivity</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{Math.round(balanceScore.wellness)}</div>
                      <div className="text-gray-600">Wellness</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{Math.round(balanceScore.consistency)}</div>
                      <div className="text-gray-600">Consistency</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Game Stats */}
            <GameStats stats={gameStats} />
            
            {/* Progress Summary */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Progress</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Overall Progress</span>
                  <span className="text-lg font-bold text-gray-900">
                    {Math.round(schedule.length > 0 ? (completedTasks.length / schedule.filter(s => s.type === 'work').length) * 100 : 0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="h-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${schedule.length > 0 ? (completedTasks.length / schedule.filter(s => s.type === 'work').length) * 100 : 0}%` 
                    }}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-lg font-bold text-gray-900">{skippedTasks.length}</div>
                    <div className="text-xs text-gray-600">Skipped</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-lg font-bold text-gray-900">{rescheduledTasks.length}</div>
                    <div className="text-xs text-gray-600">Rescheduled</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Energy Level</span>
                  <div className="flex items-center gap-1">
                    {[...Array(10)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-2 h-4 rounded-sm ${
                          i < (userInput?.energy || 0) 
                            ? 'bg-gradient-to-t from-orange-400 to-orange-300' 
                            : 'bg-gray-200'
                        }`} 
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium text-gray-900">{userInput?.energy}/10</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* History View Modal */}
      <HistoryView 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
      />
      
      {/* Wellness Activity Modal */}
      {currentWellnessActivity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <WellnessActivity
              activity={currentWellnessActivity}
              onComplete={handleWellnessActivityComplete}
              onSkip={handleWellnessActivitySkip}
            />
          </div>
        </div>
      )}
      
      {/* Manual Reschedule Modal */}
      {manualRescheduleData && (
        <ManualRescheduleModal
          isOpen={true}
          taskTitle={manualRescheduleData.taskTitle}
          taskDuration={manualRescheduleData.taskDuration}
          currentSchedule={schedule}
          onReschedule={handleManualReschedule}
          onCancel={handleManualRescheduleCancel}
        />
      )}

      {/* Full-Screen Timer */}
      {activeTask && activeTimers[activeTask.id] && (
        <Timer
          duration={activeTimers[activeTask.id].duration}
          timeRemaining={activeTimers[activeTask.id].timeRemaining}
          isRunning={activeTimers[activeTask.id].isRunning}
          onStart={() => resumeTimer(activeTask.id)}
          onPause={() => pauseTimer(activeTask.id)}
          onComplete={() => completeTimer(activeTask.id)}
          onReset={() => resetTimer(activeTask.id)}
          onClose={closeTimer}
          taskTitle={activeTask.title}
          taskType={activeTask.type}
        />
      )}
    </main>
  )
}