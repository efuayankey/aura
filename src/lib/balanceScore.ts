import { ScheduleItem, BalanceScore, UserInput } from '@/types'

export class BalanceCalculator {
  static calculateScore(
    schedule: ScheduleItem[], 
    userInput: UserInput,
    completedTasks: string[] = []
  ): BalanceScore {
    const productivity = this.calculateProductivity(schedule, completedTasks)
    const wellness = this.calculateWellness(schedule, userInput)
    const consistency = this.calculateConsistency(schedule)
    
    const overall = Math.round((productivity + wellness + consistency) / 3)
    
    return {
      overall,
      productivity,
      wellness,
      consistency
    }
  }

  private static calculateProductivity(schedule: ScheduleItem[], completedTasks: string[]): number {
    const workBlocks = schedule.filter(item => item.type === 'work')
    const totalWorkTime = workBlocks.reduce((sum, block) => {
      const start = new Date(`2000-01-01 ${block.startTime}`)
      const end = new Date(`2000-01-01 ${block.endTime}`)
      return sum + (end.getTime() - start.getTime()) / (1000 * 60) // minutes
    }, 0)
    
    const completedWorkTime = workBlocks
      .filter(block => completedTasks.includes(block.taskId))
      .reduce((sum, block) => {
        const start = new Date(`2000-01-01 ${block.startTime}`)
        const end = new Date(`2000-01-01 ${block.endTime}`)
        return sum + (end.getTime() - start.getTime()) / (1000 * 60)
      }, 0)
    
    if (totalWorkTime === 0) return 0
    
    const completionRate = (completedWorkTime / totalWorkTime) * 100
    
    // Bonus points for good time distribution
    const averageBlockTime = totalWorkTime / workBlocks.length
    const idealBlockTime = 60 // 1 hour blocks are ideal
    const timeDistributionScore = Math.max(0, 100 - Math.abs(averageBlockTime - idealBlockTime))
    
    return Math.round((completionRate * 0.7) + (timeDistributionScore * 0.3))
  }

  private static calculateWellness(schedule: ScheduleItem[], userInput: UserInput): number {
    const totalItems = schedule.length
    const wellnessItems = schedule.filter(item => 
      item.type === 'break' || item.type === 'wellness'
    ).length
    
    const wellnessRatio = (wellnessItems / totalItems) * 100
    
    // Adjust based on user's energy and mood
    let moodBonus = 0
    switch (userInput.mood) {
      case 'stressed':
        moodBonus = wellnessRatio > 25 ? 20 : -10 // Need more breaks when stressed
        break
      case 'tired':
        moodBonus = wellnessRatio > 30 ? 15 : -15 // Need even more breaks when tired
        break
      case 'energized':
        moodBonus = wellnessRatio > 15 ? 10 : 0 // Can handle fewer breaks
        break
      case 'balanced':
        moodBonus = wellnessRatio >= 20 && wellnessRatio <= 25 ? 10 : 0
        break
    }
    
    const energyAdjustment = userInput.energy <= 4 ? (wellnessRatio > 25 ? 15 : -20) : 0
    
    return Math.min(100, Math.max(0, Math.round(wellnessRatio * 2 + moodBonus + energyAdjustment)))
  }

  private static calculateConsistency(schedule: ScheduleItem[]): number {
    if (schedule.length < 2) return 100
    
    const workBlocks = schedule.filter(item => item.type === 'work')
    if (workBlocks.length < 2) return 50
    
    // Calculate variance in work block durations
    const durations = workBlocks.map(block => {
      const start = new Date(`2000-01-01 ${block.startTime}`)
      const end = new Date(`2000-01-01 ${block.endTime}`)
      return (end.getTime() - start.getTime()) / (1000 * 60)
    })
    
    const average = durations.reduce((sum, d) => sum + d, 0) / durations.length
    const variance = durations.reduce((sum, d) => sum + Math.pow(d - average, 2), 0) / durations.length
    const standardDeviation = Math.sqrt(variance)
    
    // Lower standard deviation = higher consistency
    const consistencyScore = Math.max(0, 100 - (standardDeviation * 2))
    
    // Check for good break distribution
    let breakDistributionScore = 100
    for (let i = 1; i < schedule.length - 1; i++) {
      if (schedule[i].type === 'work' && schedule[i-1].type === 'work') {
        const prevEnd = new Date(`2000-01-01 ${schedule[i-1].endTime}`)
        const currentStart = new Date(`2000-01-01 ${schedule[i].startTime}`)
        const gap = (currentStart.getTime() - prevEnd.getTime()) / (1000 * 60)
        
        if (gap === 0) breakDistributionScore -= 10 // No break between work blocks
      }
    }
    
    return Math.round((consistencyScore * 0.6) + (breakDistributionScore * 0.4))
  }

  static getScoreColor(score: number): string {
    if (score >= 80) return 'from-mindful-500 to-mindful-600'
    if (score >= 60) return 'from-yellow-500 to-orange-500'
    if (score >= 40) return 'from-orange-500 to-red-500'
    return 'from-red-500 to-red-600'
  }

  static getScoreMessage(score: BalanceScore): string {
    const { overall } = score
    
    if (overall >= 90) return "🌟 Perfect balance! You're crushing it!"
    if (overall >= 80) return "✨ Great balance! Keep up the awesome work!"
    if (overall >= 70) return "🌿 Good balance! Small tweaks could make it even better."
    if (overall >= 60) return "⚖️ Decent balance, but there's room for improvement."
    if (overall >= 40) return "🔄 Consider adjusting your schedule for better balance."
    return "🆘 Your day needs more balance - let AURA help!"
  }
}