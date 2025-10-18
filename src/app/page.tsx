'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import InputForm from '@/components/InputForm'
import BalanceScore from '@/components/BalanceScore'
import { UserInput, ScheduleItem, BalanceScore as BalanceScoreType } from '@/types'
import { AIScheduler } from '@/lib/aiScheduler'
import { BalanceCalculator } from '@/lib/balanceScore'
import { Check, CheckCircle2, Circle, Clock, LogOut } from 'lucide-react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-pulse-gentle mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-serenity-500 to-mindful-500 rounded-full mx-auto"></div>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    )
  }

  if (!session) {
    return null
  }
  const [currentStep, setCurrentStep] = useState<'input' | 'dashboard'>('input')
  const [userInput, setUserInput] = useState<UserInput | null>(null)
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [balanceScore, setBalanceScore] = useState<BalanceScoreType | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [completedScheduleItems, setCompletedScheduleItems] = useState<string[]>([])

  const handleTaskCompletion = (scheduleItemId: string, taskId: string) => {
    const newCompletedItems = [...completedScheduleItems, scheduleItemId]
    const newCompletedTasks = taskId && !completedTasks.includes(taskId) 
      ? [...completedTasks, taskId] 
      : completedTasks

    setCompletedScheduleItems(newCompletedItems)
    setCompletedTasks(newCompletedTasks)

    // Recalculate balance score with new completion data
    if (userInput) {
      const updatedScore = BalanceCalculator.calculateScore(schedule, userInput, newCompletedTasks)
      setBalanceScore(updatedScore)
    }
  }

  const handleTaskUndo = (scheduleItemId: string, taskId: string) => {
    const newCompletedItems = completedScheduleItems.filter(id => id !== scheduleItemId)
    const newCompletedTasks = taskId ? completedTasks.filter(id => id !== taskId) : completedTasks

    setCompletedScheduleItems(newCompletedItems)
    setCompletedTasks(newCompletedTasks)

    // Recalculate balance score
    if (userInput) {
      const updatedScore = BalanceCalculator.calculateScore(schedule, userInput, newCompletedTasks)
      setBalanceScore(updatedScore)
    }
  }

  const handleInputSubmit = async (input: UserInput) => {
    setIsGenerating(true)
    setUserInput(input)
    
    try {
      // Call OpenAI API for real AI scheduling
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate schedule')
      }
      
      const { schedule: generatedSchedule } = await response.json()
      const calculatedScore = BalanceCalculator.calculateScore(generatedSchedule, input)
      
      setSchedule(generatedSchedule)
      setBalanceScore(calculatedScore)
      setCurrentStep('dashboard')
    } catch (error) {
      console.error('Error generating schedule:', error)
      // Fallback to local AI scheduling
      const generatedSchedule = await AIScheduler.generateSchedule(input)
      const calculatedScore = BalanceCalculator.calculateScore(generatedSchedule, input)
      
      setSchedule(generatedSchedule)
      setBalanceScore(calculatedScore)
      setCurrentStep('dashboard')
    } finally {
      setIsGenerating(false)
    }
  }

  if (isGenerating) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="animate-pulse-gentle mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-serenity-500 to-mindful-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full animate-ping"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🤖 AI is analyzing your day...
          </h2>
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Processing your tasks and priorities
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Analyzing your mood and energy levels
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              Optimizing schedule for wellness balance
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              Generating personalized recommendations
            </div>
          </div>
          <p className="text-gray-500 mt-6 text-sm">
            Using OpenAI GPT-4 for intelligent scheduling
          </p>
        </div>
      </main>
    )
  }

  if (currentStep === 'input') {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full">
          {/* Header with user info and logout */}
          <div className="absolute top-4 right-4 flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Welcome,</p>
              <p className="text-sm font-semibold text-gray-800">{session.user?.name}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-2 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 transition-all"
              title="Sign out"
            >
              <LogOut className="w-4 h-4 text-gray-600" />
            </button>
          </div>

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

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with user info and logout */}
        <div className="flex justify-end items-center gap-4 mb-6">
          <div className="text-right">
            <p className="text-sm text-gray-600">Welcome,</p>
            <p className="text-sm font-semibold text-gray-800">{session.user?.name}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-2 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 transition-all"
            title="Sign out"
          >
            <LogOut className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-serenity-600 via-mindful-600 to-balance-600 bg-clip-text text-transparent mb-2">
            Your Perfect Day
          </h1>
          <p className="text-gray-600">
            Crafted by AI for optimal balance and productivity
          </p>
          <button
            onClick={() => setCurrentStep('input')}
            className="mt-4 px-6 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
          >
            ← Adjust Settings
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Schedule Display */}
          <div className="lg:col-span-2">
            <div className="glass rounded-3xl p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Today's Schedule
              </h3>
              <div className="space-y-3">
                {schedule.map((item) => {
                  const isCompleted = completedScheduleItems.includes(item.id)
                  const isWorkItem = item.type === 'work'
                  
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border-l-4 transition-all ${
                        isCompleted 
                          ? 'border-green-400 bg-green-50 opacity-75' 
                          : item.type === 'work'
                          ? 'border-serenity-400 bg-serenity-50'
                          : item.type === 'wellness'
                          ? 'border-balance-400 bg-balance-50'
                          : 'border-mindful-400 bg-mindful-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => isCompleted 
                            ? handleTaskUndo(item.id, item.taskId)
                            : handleTaskCompletion(item.id, item.taskId)
                          }
                          className={`mt-1 p-1 rounded-full transition-all ${
                            isCompleted 
                              ? 'text-green-600 hover:text-green-700' 
                              : 'text-gray-400 hover:text-green-500'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className={`font-medium transition-all ${
                                isCompleted 
                                  ? 'text-gray-500 line-through' 
                                  : 'text-gray-800'
                              }`}>
                                {item.title}
                              </h4>
                              <p className={`text-sm mt-1 transition-all ${
                                isCompleted 
                                  ? 'text-gray-400' 
                                  : 'text-gray-600'
                              }`}>
                                {item.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium transition-all ${
                                isCompleted 
                                  ? 'text-gray-400' 
                                  : 'text-gray-500'
                              }`}>
                                {item.startTime} - {item.endTime}
                              </span>
                              {isWorkItem && (
                                <div className={`p-1 rounded ${
                                  isCompleted 
                                    ? 'bg-green-100 text-green-600' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  <Clock className="w-3 h-3" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Balance Score & Stats */}
          <div className="space-y-6">
            {balanceScore && <BalanceScore score={balanceScore} />}

            <div className="glass rounded-3xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Today's Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium text-green-600">
                    {completedScheduleItems.length}/{schedule.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Progress</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                        style={{ 
                          width: `${schedule.length > 0 ? (completedScheduleItems.length / schedule.length) * 100 : 0}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      {Math.round(schedule.length > 0 ? (completedScheduleItems.length / schedule.length) * 100 : 0)}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Work Time</span>
                  <span className="font-medium">
                    {Math.round(schedule.filter(s => s.type === 'work').reduce((sum, item) => {
                      const start = new Date(`2000-01-01 ${item.startTime}`)
                      const end = new Date(`2000-01-01 ${item.endTime}`)
                      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
                    }, 0) * 10) / 10}h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Energy Level</span>
                  <span className="font-medium">{userInput?.energy}/10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}