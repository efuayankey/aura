import { TaskAction, GameStats, Achievement, AIsuggestion, BalanceScore, Task, UserInput } from '@/types'

export class GamificationEngine {
  private static readonly POINTS = {
    COMPLETE: 15,
    COMPLETE_EARLY: 20,
    COMPLETE_LATE: 10,
    SKIP: -5,
    RESCHEDULE: 2,
    STREAK_BONUS: 5,
    WELLNESS_BONUS: 10,
    ENERGY_MATCH_BONUS: 8
  }

  private static readonly ACHIEVEMENTS: Achievement[] = [
    {
      id: 'first-complete',
      title: 'First Victory',
      description: 'Complete your first task',
      icon: 'target',
      requirements: { type: 'completion_rate', target: 1 }
    },
    {
      id: 'streak-3',
      title: 'Momentum Building',
      description: 'Complete 3 tasks in sequence',
      icon: 'trending-up',
      requirements: { type: 'streak', target: 3 }
    },
    {
      id: 'streak-7',
      title: 'Peak Performance',
      description: 'Complete 7 tasks in sequence',
      icon: 'zap',
      requirements: { type: 'streak', target: 7 }
    },
    {
      id: 'points-100',
      title: 'Century Milestone',
      description: 'Reach 100 total points',
      icon: 'award',
      requirements: { type: 'points', target: 100 }
    },
    {
      id: 'wellness-master',
      title: 'Balance Master',
      description: 'Maintain optimal wellness score',
      icon: 'heart',
      requirements: { type: 'wellness_balance', target: 80 }
    }
  ]

  static processTaskAction(
    action: TaskAction, 
    currentStats: GameStats, 
    balanceScore: BalanceScore,
    userInput: UserInput
  ): { 
    updatedStats: GameStats; 
    pointsEarned: number; 
    newAchievements: Achievement[];
    suggestion?: AIsuggestion;
  } {
    let pointsEarned = 0
    let newStreak = currentStats.currentStreak
    let newAchievements: Achievement[] = []

    // Calculate base points
    switch (action.type) {
      case 'complete':
        pointsEarned = this.POINTS.COMPLETE
        newStreak += 1
        
        // Early completion bonus
        if (action.reason === 'early') {
          pointsEarned = this.POINTS.COMPLETE_EARLY
        }
        
        // Late completion (still positive!)
        if (action.reason === 'late') {
          pointsEarned = this.POINTS.COMPLETE_LATE
        }
        
        // Streak bonus
        if (newStreak >= 3) {
          pointsEarned += this.POINTS.STREAK_BONUS
        }
        
        // Energy-based bonus
        if (this.matchesEnergyLevel(userInput)) {
          pointsEarned += this.POINTS.ENERGY_MATCH_BONUS
        }
        break

      case 'skip':
        pointsEarned = this.POINTS.SKIP
        newStreak = 0 // Reset streak
        break

      case 'reschedule':
        pointsEarned = this.POINTS.RESCHEDULE
        // Keep streak intact for reschedules
        break
    }

    // Wellness bonus
    if (balanceScore.wellness >= 80) {
      pointsEarned += this.POINTS.WELLNESS_BONUS
    }

    const newTotalPoints = currentStats.totalPoints + pointsEarned
    const newLevel = Math.floor(newTotalPoints / 100) + 1

    // Check for new achievements
    const unlockedAchievements = this.checkAchievements(
      currentStats, 
      { ...currentStats, totalPoints: newTotalPoints, currentStreak: newStreak },
      balanceScore
    )

    const updatedStats: GameStats = {
      totalPoints: newTotalPoints,
      currentStreak: newStreak,
      longestStreak: Math.max(currentStats.longestStreak, newStreak),
      level: newLevel,
      achievements: [...currentStats.achievements, ...unlockedAchievements],
      taskActions: [...currentStats.taskActions, action]
    }

    // Generate AI suggestion based on action
    const suggestion = this.generateAISuggestion(action, updatedStats, balanceScore)

    return {
      updatedStats,
      pointsEarned,
      newAchievements: unlockedAchievements,
      suggestion
    }
  }

  private static checkAchievements(
    oldStats: GameStats, 
    newStats: GameStats, 
    balanceScore: BalanceScore
  ): Achievement[] {
    const newAchievements: Achievement[] = []
    const currentAchievementIds = oldStats.achievements.map(a => a.id)

    for (const achievement of this.ACHIEVEMENTS) {
      if (currentAchievementIds.includes(achievement.id)) continue

      let unlocked = false

      switch (achievement.requirements.type) {
        case 'points':
          unlocked = newStats.totalPoints >= achievement.requirements.target
          break
        case 'streak':
          unlocked = newStats.currentStreak >= achievement.requirements.target
          break
        case 'completion_rate':
          const completedTasks = newStats.taskActions.filter(a => a.type === 'complete').length
          unlocked = completedTasks >= achievement.requirements.target
          break
        case 'wellness_balance':
          unlocked = balanceScore.wellness >= achievement.requirements.target
          break
      }

      if (unlocked) {
        newAchievements.push({
          ...achievement,
          unlockedAt: new Date()
        })
      }
    }

    return newAchievements
  }

  private static generateAISuggestion(
    action: TaskAction, 
    stats: GameStats, 
    balanceScore: BalanceScore
  ): AIsuggestion | undefined {
    const recentActions = stats.taskActions.slice(-3)
    const skipCount = recentActions.filter(a => a.type === 'skip').length

    // Generate contextual suggestions
    if (action.type === 'skip' && skipCount >= 2) {
      return {
        id: `suggestion-${Date.now()}`,
        message: "I notice you've skipped several tasks. Would you like me to break them into smaller, more manageable pieces?",
        type: 'adjustment',
        actionSuggestion: {
          type: 'split_task',
          data: { reason: 'frequent_skips' }
        }
      }
    }

    if (action.type === 'complete' && stats.currentStreak >= 3) {
      return {
        id: `suggestion-${Date.now()}`,
        message: `Excellent work! You're maintaining strong momentum with ${stats.currentStreak} completed tasks.`,
        type: 'motivation'
      }
    }

    if (balanceScore.wellness < 40) {
      return {
        id: `suggestion-${Date.now()}`,
        message: "Your wellness metrics suggest taking a brief restorative break would optimize your performance.",
        type: 'wellness',
        actionSuggestion: {
          type: 'break',
          data: { duration: 15, type: 'mindfulness' }
        }
      }
    }

    if (action.type === 'reschedule') {
      return {
        id: `suggestion-${Date.now()}`,
        message: "Smart adjustment. I've optimized your schedule to maintain workflow continuity.",
        type: 'productivity'
      }
    }

    return undefined
  }

  private static matchesEnergyLevel(userInput: UserInput): boolean {
    // Bonus for completing tasks when energy matches the optimal time
    const currentHour = new Date().getHours()
    
    if (userInput.energy >= 8 && currentHour >= 9 && currentHour <= 11) {
      return true // High energy morning bonus
    }
    
    if (userInput.energy <= 4 && currentHour >= 14 && currentHour <= 16) {
      return true // Low energy afternoon understanding
    }
    
    return false
  }

  static calculateLevelProgress(totalPoints: number): { 
    currentLevel: number; 
    pointsInLevel: number; 
    pointsToNextLevel: number; 
    progressPercentage: number;
  } {
    const currentLevel = Math.floor(totalPoints / 100) + 1
    const pointsInLevel = totalPoints % 100
    const pointsToNextLevel = 100 - pointsInLevel
    const progressPercentage = (pointsInLevel / 100) * 100

    return {
      currentLevel,
      pointsInLevel,
      pointsToNextLevel,
      progressPercentage
    }
  }

  static getMotivationalMessage(stats: GameStats): string {
    const { currentStreak, totalPoints, level } = stats

    if (currentStreak >= 5) {
      return `Outstanding performance with ${currentStreak} consecutive completions`
    }
    
    if (totalPoints >= 500) {
      return `Level ${level} achieved with ${totalPoints} total points earned`
    }
    
    if (currentStreak >= 3) {
      return `Strong momentum maintained: ${currentStreak} tasks completed`
    }
    
    return `Level ${level} - Building consistent productive habits`
  }
}