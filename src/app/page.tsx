'use client'

import { useState, useEffect } from 'react'
import { UserInput, ScheduleItem, BalanceScore as BalanceScoreType, Task } from '@/types'
import { AIScheduler } from '@/lib/aiScheduler'
import { BalanceCalculator } from '@/lib/balanceScore'
import TaskInput from '@/components/TaskInput'
import AvailabilityPicker from '@/components/AvailabilityPicker'
import FeelingSelector from '@/components/FeelingSelector'
import LoadingScreen from '@/components/LoadingScreen'
import Schedule from '@/components/Schedule'
import ScoreBoard from '@/components/ScoreBoard'
import NotificationModal from '@/components/NotificationModal'
import { Sparkles } from 'lucide-react'

export default function Home() {
  // Form state
  const [tasks, setTasks] = useState<Task[]>([])
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [mood, setMood] = useState<UserInput['mood']>('balanced')
  const [energy, setEnergy] = useState(7)

  // App state
  const [currentStep, setCurrentStep] = useState<'input' | 'dashboard'>('input')
  const [userInput, setUserInput] = useState<UserInput | null>(null)
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [balanceScore, setBalanceScore] = useState<BalanceScoreType | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Tracking state
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set())
  const [totalPoints, setTotalPoints] = useState(0)
  const [notificationTask, setNotificationTask] = useState<ScheduleItem | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('auraData')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        if (parsed.schedule && parsed.schedule.length > 0) {
          setSchedule(parsed.schedule)
          setUserInput(parsed.userInput)
          setBalanceScore(parsed.balanceScore)
          setCompletedItems(new Set(parsed.completedItems || []))
          setTotalPoints(parsed.totalPoints || 0)
          setCurrentStep('dashboard')
        }
      } catch (e) {
        console.error('Failed to load saved data', e)
      }
    }
  }, [])

  // Save to localStorage whenever relevant state changes
  useEffect(() => {
    if (schedule.length > 0 && userInput) {
      const dataToSave = {
        schedule,
        userInput,
        balanceScore,
        completedItems: Array.from(completedItems),
        totalPoints,
      }
      localStorage.setItem('auraData', JSON.stringify(dataToSave))
    }
  }, [schedule, userInput, balanceScore, completedItems, totalPoints])

  // Check for 10-minute notifications
  useEffect(() => {
    if (currentStep !== 'dashboard' || schedule.length === 0) return

    const checkNotifications = () => {
      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      
      schedule.forEach(item => {
        if (completedItems.has(item.id)) return
        
        // Parse end time and check if we're 10 minutes before
        const [endHour, endMin] = item.endTime.split(':').map(Number)
        const endDate = new Date()
        endDate.setHours(endHour, endMin, 0, 0)
        
        const tenMinBefore = new Date(endDate.getTime() - 10 * 60 * 1000)
        const tenMinBeforeTime = `${tenMinBefore.getHours().toString().padStart(2, '0')}:${tenMinBefore.getMinutes().toString().padStart(2, '0')}`
        
        if (currentTime === tenMinBeforeTime && !notificationTask) {
          setNotificationTask(item)
        }
      })
    }

    const interval = setInterval(checkNotifications, 60000) // Check every minute
    checkNotifications() // Check immediately

    return () => clearInterval(interval)
  }, [currentStep, schedule, completedItems, notificationTask])

  const handleGenerate = async () => {
    if (tasks.length === 0) return

    setIsGenerating(true)
    
    const input: UserInput = {
      tasks,
      startTime,
      endTime,
      mood,
      energy
    }
    
    setUserInput(input)
    
    try {
      // Try API first
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      })
      
      let generatedSchedule: ScheduleItem[]
      
      if (response.ok) {
        const data = await response.json()
        generatedSchedule = data.schedule
      } else {
        // Fallback to local AI scheduling
        generatedSchedule = await AIScheduler.generateSchedule(input)
      }
      
      const calculatedScore = BalanceCalculator.calculateScore(generatedSchedule, input, [])
      
      setSchedule(generatedSchedule)
      setBalanceScore(calculatedScore)
      setCompletedItems(new Set())
      setTotalPoints(0)
      setCurrentStep('dashboard')
    } catch (error) {
      console.error('Error generating schedule:', error)
      // Fallback to local AI scheduling
      const generatedSchedule = await AIScheduler.generateSchedule(input)
      const calculatedScore = BalanceCalculator.calculateScore(generatedSchedule, input, [])
      
      setSchedule(generatedSchedule)
      setBalanceScore(calculatedScore)
      setCompletedItems(new Set())
      setTotalPoints(0)
      setCurrentStep('dashboard')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleComplete = (itemId: string) => {
    const newCompleted = new Set(completedItems)
    newCompleted.add(itemId)
    setCompletedItems(newCompleted)
    setTotalPoints(prev => prev + 10)
    
    // Recalculate score
    if (userInput) {
      const item = schedule.find(s => s.id === itemId)
      const completedTaskIds = item?.taskId ? [item.taskId] : []
      const updatedScore = BalanceCalculator.calculateScore(
        schedule, 
        userInput, 
        completedTaskIds
      )
      setBalanceScore(updatedScore)
    }
  }

  const handleSkip = (itemId: string) => {
    const newCompleted = new Set(completedItems)
    newCompleted.add(itemId)
    setCompletedItems(newCompleted)
    setTotalPoints(prev => prev - 5)
  }

  const handleReschedule = (itemId: string) => {
    setTotalPoints(prev => prev - 2)
    // In a real app, this would move the task to a new time slot
    alert('Task rescheduled! (In full version, this would move to next available slot)')
  }

  const handleNotificationReschedule = () => {
    if (notificationTask) {
      handleReschedule(notificationTask.id)
      setNotificationTask(null)
    }
  }

  const calculateWorkTime = () => {
    return schedule
      .filter(s => s.type === 'work')
      .reduce((sum, item) => {
        const [startHour, startMin] = item.startTime.split(':').map(Number)
        const [endHour, endMin] = item.endTime.split(':').map(Number)
        const start = startHour * 60 + startMin
        const end = endHour * 60 + endMin
        return sum + (end - start) / 60
      }, 0)
  }

  if (isGenerating) {
    return <LoadingScreen />
  }

  if (currentStep === 'input') {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-emerald mb-3">
              AURA
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              Your AI Balance Agent
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Where wellness meets productivity
            </p>
          </div>

          {/* Input Form */}
          <div className="glass rounded-3xl p-6 md:p-8 animate-slide-up">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-emerald">
              What's on your mind today?
            </h2>

            <TaskInput tasks={tasks} onTasksChange={setTasks} />
            
            <AvailabilityPicker 
              startTime={startTime}
              endTime={endTime}
              onStartTimeChange={setStartTime}
              onEndTimeChange={setEndTime}
            />
            
            <FeelingSelector 
              mood={mood}
              energy={energy}
              onMoodChange={setMood}
              onEnergyChange={setEnergy}
            />

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={tasks.length === 0}
              className="w-full py-4 bg-gradient-to-r from-serenity-400 via-balance-400 to-mindful-400 hover:from-serenity-500 hover:via-balance-500 hover:to-mindful-500 text-white rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Sparkles className="w-5 h-5" />
              ✨ Generate My Perfect Day
            </button>
            
            {tasks.length === 0 && (
              <p className="text-center text-sm text-gray-500 mt-3">
                Add at least one task to continue
              </p>
            )}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-emerald mb-2">
            Your Perfect Day
          </h1>
          <p className="text-gray-600 mb-4">
            Crafted by AI for optimal balance and productivity
          </p>
          <button
            onClick={() => {
              setCurrentStep('input')
              setSchedule([])
              setCompletedItems(new Set())
              setTotalPoints(0)
              localStorage.removeItem('auraData')
            }}
            className="px-6 py-2 text-sm bg-white/70 hover:bg-white text-gray-700 rounded-xl transition-all shadow-sm hover:shadow-md font-medium"
          >
            ← New Schedule
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Schedule - Left Side (2/3 width) */}
          <div className="lg:col-span-2">
            <Schedule 
              schedule={schedule}
              completedItems={completedItems}
              onComplete={handleComplete}
              onSkip={handleSkip}
              onReschedule={handleReschedule}
            />
          </div>

          {/* Scoreboard - Right Side (1/3 width) */}
          <div className="lg:col-span-1">
            {balanceScore && (
              <ScoreBoard 
                score={balanceScore}
                totalPoints={totalPoints}
                completedTasks={completedItems.size}
                totalTasks={schedule.length}
                workTime={calculateWorkTime()}
                energyLevel={energy}
              />
            )}
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      <NotificationModal 
        task={notificationTask}
        onClose={() => setNotificationTask(null)}
        onReschedule={handleNotificationReschedule}
      />
    </main>
  )
}
