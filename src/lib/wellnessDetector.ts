import { GameStats, TaskAction, UserInput, AIsuggestion } from '@/types'

export interface WellnessMetrics {
  stressLevel: number; // 0-100
  burnoutRisk: number; // 0-100
  consistencyScore: number; // 0-100
  workLifeBalance: number; // 0-100
  interventionNeeded: boolean;
  interventionType?: 'rest' | 'motivation' | 'restructure' | 'celebration';
}

export class WellnessDetector {
  static analyzeWellness(
    gameStats: GameStats,
    userInput: UserInput,
    currentTime: Date = new Date()
  ): WellnessMetrics {
    const recentActions = gameStats.taskActions.slice(-10) // Last 10 actions
    const timesSinceStart = this.calculateSessionDuration(gameStats.taskActions)
    
    const stressLevel = this.calculateStressLevel(recentActions, userInput)
    const burnoutRisk = this.calculateBurnoutRisk(gameStats, timesSinceStart)
    const consistencyScore = this.calculateConsistencyScore(gameStats)
    const workLifeBalance = this.calculateWorkLifeBalance(recentActions, userInput)
    
    const interventionNeeded = this.needsIntervention(stressLevel, burnoutRisk, consistencyScore)
    const interventionType = interventionNeeded 
      ? this.determineInterventionType(stressLevel, burnoutRisk, consistencyScore, gameStats)
      : undefined

    return {
      stressLevel,
      burnoutRisk,
      consistencyScore,
      workLifeBalance,
      interventionNeeded,
      interventionType
    }
  }

  static generateWellnessIntervention(
    metrics: WellnessMetrics,
    userInput: UserInput,
    gameStats: GameStats
  ): AIsuggestion | null {
    if (!metrics.interventionNeeded || !metrics.interventionType) {
      return null
    }

    const suggestionId = `wellness-${Date.now()}`
    
    switch (metrics.interventionType) {
      case 'rest':
        return {
          id: suggestionId,
          message: "Your wellness indicators suggest taking a longer break. How about a 20-minute walk or some deep breathing exercises?",
          type: 'wellness',
          actionSuggestion: {
            type: 'break',
            data: { duration: 20, type: 'wellness', activity: 'mindful break' }
          }
        }

      case 'motivation':
        const completionRate = gameStats.taskActions.filter(a => a.type === 'complete').length / Math.max(1, gameStats.taskActions.length) * 100
        return {
          id: suggestionId,
          message: `You've completed ${completionRate.toFixed(0)}% of attempted tasks! Let's build on this momentum with your next task.`,
          type: 'motivation'
        }

      case 'restructure':
        return {
          id: suggestionId,
          message: "I notice some difficulty with task completion. Would you like me to break down larger tasks into smaller, more manageable pieces?",
          type: 'adjustment',
          actionSuggestion: {
            type: 'split_task',
            data: { reason: 'wellness_intervention' }
          }
        }

      case 'celebration':
        return {
          id: suggestionId,
          message: `Outstanding work! You've maintained excellent balance and completed ${gameStats.currentStreak} tasks in a row. Take a moment to appreciate your progress.`,
          type: 'motivation'
        }

      default:
        return null
    }
  }

  static detectEmotionalPatterns(taskActions: TaskAction[]): {
    pattern: 'productive' | 'struggling' | 'inconsistent' | 'balanced';
    confidence: number;
    description: string;
  } {
    if (taskActions.length < 3) {
      return {
        pattern: 'balanced',
        confidence: 0.3,
        description: 'Not enough data to establish pattern'
      }
    }

    const recent = taskActions.slice(-6)
    const completeCount = recent.filter(a => a.type === 'complete').length
    const skipCount = recent.filter(a => a.type === 'skip').length
    const rescheduleCount = recent.filter(a => a.type === 'reschedule').length

    const completionRate = completeCount / recent.length
    const skipRate = skipCount / recent.length
    const rescheduleRate = rescheduleCount / recent.length

    if (completionRate >= 0.8) {
      return {
        pattern: 'productive',
        confidence: 0.9,
        description: 'High completion rate indicates strong focus and productivity'
      }
    }

    if (skipRate >= 0.5) {
      return {
        pattern: 'struggling',
        confidence: 0.85,
        description: 'High skip rate suggests difficulty with current workload or energy levels'
      }
    }

    if (rescheduleRate >= 0.4) {
      return {
        pattern: 'inconsistent',
        confidence: 0.7,
        description: 'Frequent rescheduling indicates need for better time estimation or planning'
      }
    }

    return {
      pattern: 'balanced',
      confidence: 0.6,
      description: 'Healthy mix of completion and flexibility'
    }
  }

  static suggestBreakActivity(
    userInput: UserInput,
    sessionDuration: number,
    stressLevel: number
  ): string {
    const activities = {
      high_stress_short: [
        "Take 10 deep breaths",
        "Step outside for fresh air",
        "Drink a glass of water mindfully",
        "Do gentle neck and shoulder stretches"
      ],
      high_stress_long: [
        "Take a 15-minute walk",
        "Practice guided meditation",
        "Call a friend or family member",
        "Listen to calming music"
      ],
      moderate_stress: [
        "Stand up and stretch",
        "Make a healthy snack",
        "Tidy your workspace",
        "Review your accomplishments so far"
      ],
      low_stress: [
        "Quick energizing walk",
        "Do some jumping jacks",
        "Read something inspiring",
        "Plan your next win"
      ]
    }

    let category: keyof typeof activities
    
    if (stressLevel >= 70) {
      category = sessionDuration > 120 ? 'high_stress_long' : 'high_stress_short'
    } else if (stressLevel >= 40) {
      category = 'moderate_stress'
    } else {
      category = 'low_stress'
    }

    const options = activities[category]
    return options[Math.floor(Math.random() * options.length)]
  }

  // Private helper methods
  private static calculateStressLevel(actions: TaskAction[], userInput: UserInput): number {
    const recentSkips = actions.filter(a => a.type === 'skip').length
    const totalRecent = actions.length
    
    let stressBase = 0
    
    // Mood contribution
    switch (userInput.mood) {
      case 'stressed': stressBase += 40; break
      case 'tired': stressBase += 30; break
      case 'balanced': stressBase += 10; break
      case 'energized': stressBase += 5; break
    }
    
    // Energy contribution
    if (userInput.energy <= 3) stressBase += 25
    else if (userInput.energy <= 5) stressBase += 15
    else if (userInput.energy >= 8) stressBase -= 10
    
    // Skip pattern contribution
    const skipRate = totalRecent > 0 ? recentSkips / totalRecent : 0
    stressBase += skipRate * 40
    
    return Math.max(0, Math.min(100, stressBase))
  }

  private static calculateBurnoutRisk(stats: GameStats, sessionDuration: number): number {
    let risk = 0
    
    // Long session without breaks
    if (sessionDuration > 180) risk += 30 // 3+ hours
    else if (sessionDuration > 120) risk += 15 // 2+ hours
    
    // Low completion with high activity (sign of struggling)
    const recentActions = stats.taskActions.slice(-10)
    const completionRate = recentActions.filter(a => a.type === 'complete').length / Math.max(1, recentActions.length)
    
    if (completionRate < 0.3 && recentActions.length >= 5) {
      risk += 25
    }
    
    // Streak breaks (inconsistency)
    if (stats.currentStreak === 0 && stats.longestStreak > 3) {
      risk += 20
    }
    
    return Math.max(0, Math.min(100, risk))
  }

  private static calculateConsistencyScore(stats: GameStats): number {
    const actions = stats.taskActions
    if (actions.length < 5) return 50 // Not enough data
    
    const recent = actions.slice(-8)
    const completeCount = recent.filter(a => a.type === 'complete').length
    const consistency = (completeCount / recent.length) * 100
    
    // Bonus for maintaining streaks
    const streakBonus = Math.min(20, stats.currentStreak * 2)
    
    return Math.max(0, Math.min(100, consistency + streakBonus))
  }

  private static calculateWorkLifeBalance(actions: TaskAction[], userInput: UserInput): number {
    // Simplified balance based on energy levels and completion patterns
    let balance = 50 // Start neutral
    
    if (userInput.energy >= 7) balance += 20
    else if (userInput.energy <= 3) balance -= 25
    
    if (userInput.mood === 'balanced') balance += 15
    else if (userInput.mood === 'stressed') balance -= 20
    
    return Math.max(0, Math.min(100, balance))
  }

  private static needsIntervention(
    stress: number, 
    burnout: number, 
    consistency: number
  ): boolean {
    return stress >= 60 || burnout >= 50 || consistency <= 30
  }

  private static determineInterventionType(
    stress: number,
    burnout: number,
    consistency: number,
    stats: GameStats
  ): WellnessMetrics['interventionType'] {
    if (stress >= 70 || burnout >= 60) return 'rest'
    if (consistency <= 20) return 'restructure'
    if (stats.currentStreak >= 5 && stress < 30) return 'celebration'
    return 'motivation'
  }

  private static calculateSessionDuration(actions: TaskAction[]): number {
    if (actions.length === 0) return 0
    
    const firstAction = actions[0]
    const lastAction = actions[actions.length - 1]
    
    const duration = lastAction.timestamp.getTime() - firstAction.timestamp.getTime()
    return duration / (1000 * 60) // Convert to minutes
  }
}