import { UserInput, GameStats } from '@/types'

export interface WellnessActivityData {
  type: 'breathing' | 'stretching' | 'hydration' | 'mindfulness'
  title: string
  description: string
  duration?: number // in seconds
  instructions?: string[]
  trigger: 'stress' | 'fatigue' | 'focus' | 'break' | 'periodic'
}

export class WellnessActivityManager {
  private static readonly ACTIVITIES: WellnessActivityData[] = [
    {
      type: 'breathing',
      title: '4-7-8 Breathing',
      description: 'Calm your mind with deep breathing',
      duration: 120, // 2 minutes
      instructions: [
        'Sit comfortably with your back straight',
        'Breathe in through your nose for 4 counts',
        'Hold your breath for 7 counts',
        'Exhale through your mouth for 8 counts',
        'Repeat the cycle 3-4 times'
      ],
      trigger: 'stress'
    },
    {
      type: 'stretching',
      title: 'Desk Stretches',
      description: 'Release tension from sitting',
      duration: 180, // 3 minutes
      instructions: [
        'Roll your shoulders backward 5 times',
        'Gently turn your head left and right',
        'Stretch your arms overhead and lean side to side',
        'Do some seated spinal twists',
        'Stretch your wrists and fingers'
      ],
      trigger: 'fatigue'
    },
    {
      type: 'hydration',
      title: 'Hydration Break',
      description: 'Fuel your body with water',
      instructions: [
        'Get a glass of water (8-12 oz)',
        'Drink slowly and mindfully',
        'Notice how the water feels',
        'Take a moment to check in with your body',
        'Consider adding lemon or herbs for variety'
      ],
      trigger: 'break'
    },
    {
      type: 'mindfulness',
      title: 'Mindful Moment',
      description: 'Reset your focus and awareness',
      duration: 60, // 1 minute
      instructions: [
        'Close your eyes or soften your gaze',
        'Notice three things you can hear right now',
        'Feel your feet on the ground',
        'Take three deep, conscious breaths',
        'Set an intention for your next task'
      ],
      trigger: 'focus'
    },
    {
      type: 'breathing',
      title: 'Quick Energy Breath',
      description: 'Boost your energy naturally',
      duration: 60,
      instructions: [
        'Sit up straight and place hands on your belly',
        'Take quick, shallow breaths for 30 seconds',
        'Then take 3 deep, slow breaths',
        'Notice the energy flowing through your body'
      ],
      trigger: 'fatigue'
    },
    {
      type: 'stretching',
      title: 'Eye Rest Exercise',
      description: 'Give your eyes a break from screens',
      duration: 90,
      instructions: [
        'Look away from your screen',
        'Focus on something 20 feet away for 20 seconds',
        'Blink slowly 10 times',
        'Gently massage your temples',
        'Close your eyes for 30 seconds'
      ],
      trigger: 'focus'
    }
  ]

  // Analyze user state and suggest appropriate activity
  static suggestActivity(
    userInput: UserInput,
    gameStats: GameStats,
    lastActivityTime?: Date
  ): WellnessActivityData | null {
    const now = new Date()
    
    // Don't suggest if recent activity (within 30 minutes)
    if (lastActivityTime && (now.getTime() - lastActivityTime.getTime()) < 30 * 60 * 1000) {
      return null
    }

    // Analyze stress indicators
    const stressScore = this.calculateStressScore(userInput, gameStats)
    const fatigueScore = this.calculateFatigueScore(userInput, gameStats)
    const focusScore = this.calculateFocusScore(userInput, gameStats)

    // Priority order: stress > fatigue > focus > periodic
    if (stressScore >= 7) {
      return this.getRandomActivity('stress')
    }
    
    if (fatigueScore >= 6) {
      return this.getRandomActivity('fatigue')
    }
    
    if (focusScore <= 3) {
      return this.getRandomActivity('focus')
    }

    // Periodic wellness (every hour or so)
    const hoursSinceLastActivity = lastActivityTime 
      ? (now.getTime() - lastActivityTime.getTime()) / (60 * 60 * 1000)
      : 2

    if (hoursSinceLastActivity >= 1.5) {
      return this.getRandomActivity('break')
    }

    return null
  }

  // Calculate stress indicators (0-10 scale)
  private static calculateStressScore(userInput: UserInput, gameStats: GameStats): number {
    let score = 0

    // High skip rate indicates stress
    const totalActions = gameStats.taskActions.length
    const skipActions = gameStats.taskActions.filter(a => a.type === 'skip').length
    if (totalActions > 0) {
      score += (skipActions / totalActions) * 4
    }

    // Low energy + rushed mood
    if (userInput.energy <= 3) score += 2
    if (userInput.mood === 'stressed') score += 3
    if (userInput.mood === 'overwhelmed') score += 4

    // Tight schedule pressure
    const timeToWorkRatio = this.calculateTimeToWorkRatio(userInput)
    if (timeToWorkRatio < 1.2) score += 2 // Very tight schedule

    return Math.min(10, score)
  }

  // Calculate fatigue indicators (0-10 scale)
  private static calculateFatigueScore(userInput: UserInput, gameStats: GameStats): number {
    let score = 0

    // Low energy is primary indicator
    score += (10 - userInput.energy)

    // Tired mood
    if (userInput.mood === 'tired') score += 2

    // Long work sessions without breaks
    const avgSessionLength = this.calculateAverageSessionLength(userInput)
    if (avgSessionLength > 90) score += 2 // 90+ minute sessions

    // Time of day factor (more likely to be tired in afternoon)
    const currentHour = new Date().getHours()
    if (currentHour >= 14 && currentHour <= 16) score += 1 // Post-lunch dip

    return Math.min(10, score)
  }

  // Calculate focus issues (0-10 scale, lower = needs focus help)
  private static calculateFocusScore(userInput: UserInput, gameStats: GameStats): number {
    let score = userInput.energy // Start with energy level

    // Distracted mood
    if (userInput.mood === 'distracted') score -= 3
    if (userInput.mood === 'scattered') score -= 2

    // Recent reschedules indicate focus issues
    const recentReschedules = gameStats.taskActions
      .filter(a => a.type === 'reschedule' && 
        new Date().getTime() - a.timestamp.getTime() < 60 * 60 * 1000) // Last hour
      .length
    score -= recentReschedules

    return Math.max(0, Math.min(10, score))
  }

  // Get random activity of specific trigger type
  private static getRandomActivity(trigger: string): WellnessActivityData {
    const activities = this.ACTIVITIES.filter(a => a.trigger === trigger)
    return activities[Math.floor(Math.random() * activities.length)]
  }

  // Helper: Calculate time to work ratio
  private static calculateTimeToWorkRatio(userInput: UserInput): number {
    const totalMinutes = this.getMinutesBetween(userInput.startTime, userInput.endTime)
    const totalWorkMinutes = userInput.tasks.reduce((sum, task) => sum + task.estimatedTime, 0)
    return totalMinutes / totalWorkMinutes
  }

  // Helper: Calculate average session length
  private static calculateAverageSessionLength(userInput: UserInput): number {
    if (userInput.tasks.length === 0) return 60
    
    const totalTime = userInput.tasks.reduce((sum, task) => sum + task.estimatedTime, 0)
    return totalTime / userInput.tasks.length
  }

  // Helper: Get minutes between two time strings
  private static getMinutesBetween(startTime: string, endTime: string): number {
    const start = this.timeToMinutes(startTime)
    const end = this.timeToMinutes(endTime)
    return end - start
  }

  // Helper: Convert time string to minutes
  private static timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number)
    return hours * 60 + minutes
  }

  // Get all activities for a specific trigger
  static getActivitiesForTrigger(trigger: string): WellnessActivityData[] {
    return this.ACTIVITIES.filter(a => a.trigger === trigger)
  }

  // Get activity by type
  static getActivityByType(type: string): WellnessActivityData | null {
    return this.ACTIVITIES.find(a => a.type === type) || null
  }

  // Generate wellness summary for history
  static generateWellnessSummary(completedActivities: string[]): {
    totalActivities: number
    breakdown: Record<string, number>
    recommendation: string
  } {
    const breakdown = completedActivities.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalActivities = completedActivities.length
    
    let recommendation = ''
    if (totalActivities === 0) {
      recommendation = 'Try incorporating some wellness breaks into your day!'
    } else if (totalActivities < 3) {
      recommendation = 'Great start! Consider adding more wellness moments throughout your day.'
    } else if (totalActivities < 6) {
      recommendation = 'Excellent wellness habits! You\'re taking good care of yourself.'
    } else {
      recommendation = 'Outstanding commitment to wellness! You\'re a wellness champion!'
    }

    return {
      totalActivities,
      breakdown,
      recommendation
    }
  }
}