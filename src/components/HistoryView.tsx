'use client'

import { useState, useEffect } from 'react'
import { Calendar, TrendingUp, TrendingDown, Award, Target, Heart, CheckCircle, X, Clock, BarChart3 } from 'lucide-react'
import { DailyPlan } from '@/lib/dynamodb'

interface HistoryViewProps {
  isOpen: boolean
  onClose: () => void
}

interface WellnessInsights {
  averageWellnessActivities: number
  consistencyScore: number
  recommendations: string[]
}

export default function HistoryView({ isOpen, onClose }: HistoryViewProps) {
  const [recentPlans, setRecentPlans] = useState<DailyPlan[]>([])
  const [insights, setInsights] = useState<WellnessInsights | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<DailyPlan | null>(null)

  // Load history data when opened
  useEffect(() => {
    if (isOpen) {
      loadHistoryData()
    }
  }, [isOpen])

  const loadHistoryData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/user/history?limit=14') // Last 2 weeks
      const data = await response.json()
      
      // If no real data, use mock data for demo
      if (!data.plans || data.plans.length === 0) {
        console.log('📊 No real history found, using mock data for demo')
        setRecentPlans(getMockHistoryData())
        setInsights(getMockInsights())
      } else {
        setRecentPlans(data.plans || [])
        setInsights(data.insights || null)
      }
    } catch (error) {
      console.error('Error loading history, using mock data:', error)
      setRecentPlans(getMockHistoryData())
      setInsights(getMockInsights())
    } finally {
      setIsLoading(false)
    }
  }

  const getMockHistoryData = (): DailyPlan[] => {
    const today = new Date()
    
    return [
      {
        userId: 'demo-user',
        date: today.toISOString().split('T')[0],
        balanceScore: 87,
        completedTasks: ['task-1', 'task-2', 'task-4'],
        skippedTasks: ['task-3'],
        wellnessActivities: 3,
        schedule: [
          { id: 'task-1', taskId: 'task-1', startTime: '9:00 AM', endTime: '10:30 AM', type: 'work', title: 'Review project requirements', description: 'Morning focus work' },
          { id: 'task-2', taskId: 'task-2', startTime: '11:00 AM', endTime: '12:00 PM', type: 'work', title: 'Team standup meeting', description: 'Daily sync' },
          { id: 'task-3', taskId: 'task-3', startTime: '1:00 PM', endTime: '2:30 PM', type: 'work', title: 'Code review session', description: 'Peer review' },
          { id: 'task-4', taskId: 'task-4', startTime: '3:00 PM', endTime: '4:00 PM', type: 'work', title: 'Update documentation', description: 'Documentation work' }
        ],
        userInput: {
          tasks: [],
          startTime: '9:00 AM',
          endTime: '5:00 PM',
          energy: 8,
          mood: 'focused'
        },
        createdAt: today.toISOString(),
        updatedAt: today.toISOString()
      },
      {
        userId: 'demo-user',
        date: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        balanceScore: 92,
        completedTasks: ['task-1', 'task-2', 'task-3', 'task-4'],
        skippedTasks: [],
        wellnessActivities: 4,
        schedule: [
          { id: 'task-1', taskId: 'task-1', startTime: '9:00 AM', endTime: '10:00 AM', type: 'work', title: 'Morning workout', description: 'Wellness activity' },
          { id: 'task-2', taskId: 'task-2', startTime: '10:30 AM', endTime: '12:00 PM', type: 'work', title: 'Client presentation prep', description: 'Important presentation' },
          { id: 'task-3', taskId: 'task-3', startTime: '1:00 PM', endTime: '2:00 PM', type: 'work', title: 'Email management', description: 'Admin work' },
          { id: 'task-4', taskId: 'task-4', startTime: '3:00 PM', endTime: '4:30 PM', type: 'work', title: 'Research new tools', description: 'Learning time' }
        ],
        userInput: {
          tasks: [],
          startTime: '9:00 AM',
          endTime: '5:00 PM',
          energy: 9,
          mood: 'energized'
        },
        createdAt: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }

  const getMockInsights = () => ({
    averageWellnessActivities: 3.0,
    consistencyScore: 85,
    recommendations: [
      'Great job maintaining consistent wellness habits!',
      'Your productivity peak seems to be in the mornings',
      'Consider scheduling important tasks between 9-11 AM for best results'
    ]
  })

  const calculateStreaks = () => {
    if (recentPlans.length === 0) return { current: 0, longest: 0 }
    
    const sortedPlans = [...recentPlans].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    
    // Calculate current streak from most recent date
    const today = new Date().toISOString().split('T')[0]
    let checkDate = new Date(today)
    
    for (const plan of sortedPlans) {
      const planDate = checkDate.toISOString().split('T')[0]
      const hasGoodScore = plan.balanceScore >= 70
      
      if (planDate === plan.date && hasGoodScore) {
        currentStreak++
        tempStreak++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        if (planDate === plan.date) tempStreak = 0
        break
      }
      
      checkDate.setDate(checkDate.getDate() - 1)
    }
    
    return { current: currentStreak, longest: longestStreak }
  }

  const calculateAverageScore = () => {
    if (recentPlans.length === 0) return 0
    const totalScore = recentPlans.reduce((sum, plan) => sum + plan.balanceScore, 0)
    return Math.round(totalScore / recentPlans.length)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return '🌟'
    if (score >= 80) return '🎯'
    if (score >= 70) return '✅'
    if (score >= 60) return '⚠️'
    return '❌'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    
    if (dateString === today.toISOString().split('T')[0]) return 'Today'
    if (dateString === yesterday.toISOString().split('T')[0]) return 'Yesterday'
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const streaks = calculateStreaks()
  const averageScore = calculateAverageScore()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-mindful-50 to-serenity-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-mindful-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-mindful-700" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Your Journey</h2>
                <p className="text-gray-600">Track your productivity and wellness over time</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-mindful-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Loading your history...</p>
              </div>
            </div>
          ) : recentPlans.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No History Yet</h3>
              <p className="text-gray-500">Complete your first daily plan to start tracking your journey!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-mindful-50 to-mindful-100 p-4 rounded-xl border border-mindful-200">
                  <div className="flex items-center gap-3">
                    <Award className="w-8 h-8 text-mindful-600" />
                    <div>
                      <p className="text-sm text-mindful-700">Current Streak</p>
                      <p className="text-2xl font-bold text-mindful-800">{streaks.current}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-serenity-50 to-serenity-100 p-4 rounded-xl border border-serenity-200">
                  <div className="flex items-center gap-3">
                    <Target className="w-8 h-8 text-serenity-600" />
                    <div>
                      <p className="text-sm text-serenity-700">Average Score</p>
                      <p className="text-2xl font-bold text-serenity-800">{averageScore}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-balance-50 to-balance-100 p-4 rounded-xl border border-balance-200">
                  <div className="flex items-center gap-3">
                    <Heart className="w-8 h-8 text-balance-600" />
                    <div>
                      <p className="text-sm text-balance-700">Wellness</p>
                      <p className="text-2xl font-bold text-balance-800">{insights?.consistencyScore || 0}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-700">Total Days</p>
                      <p className="text-2xl font-bold text-gray-800">{recentPlans.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Plans */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-mindful-600" />
                  Recent Days
                </h3>
                <div className="space-y-3">
                  {recentPlans.map((plan) => (
                    <div
                      key={plan.date}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">
                            {getScoreEmoji(plan.balanceScore)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {formatDate(plan.date)}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {plan.completedTasks.length} of {plan.schedule.filter(s => s.type === 'work').length} tasks completed
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`
                            px-3 py-1 rounded-full text-sm font-semibold
                            ${getScoreColor(plan.balanceScore)}
                          `}>
                            {plan.balanceScore}
                          </div>
                          {plan.wellnessActivities > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {plan.wellnessActivities} wellness activities
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wellness Insights */}
              {insights && insights.recommendations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-balance-600" />
                    Wellness Insights
                  </h3>
                  <div className="bg-balance-50 border border-balance-200 rounded-xl p-4">
                    <div className="space-y-3">
                      {insights.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-balance-500 rounded-full mt-2"></div>
                          <p className="text-balance-800 text-sm">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Plan Detail Modal */}
        {selectedPlan && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {formatDate(selectedPlan.date)} - Score: {selectedPlan.balanceScore}
                </h3>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                <div className="space-y-4">
                  {selectedPlan.schedule.filter(s => s.type === 'work').map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {selectedPlan.completedTasks.includes(item.taskId || item.id) ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : selectedPlan.skippedTasks.includes(item.taskId || item.id) ? (
                        <X className="w-5 h-5 text-red-500" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-400" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.startTime} - {item.endTime}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}