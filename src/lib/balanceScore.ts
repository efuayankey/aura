import { ScheduleItem, BalanceScore, UserInput } from '@/types'

export class BalanceCalculator {
  static calculateScore(
    schedule: ScheduleItem[], 
    userInput: UserInput,
    completedTasks: string[] = [],
    skippedTasks: string[] = [],
    rescheduledTasks: string[] = []
  ): BalanceScore {
    // New intuitive progress-based scoring system
    const { overall, productivity, wellness, consistency } = this.calculateProgressScore(
      schedule, 
      completedTasks, 
      skippedTasks, 
      rescheduledTasks
    )
    
    return {
      overall,
      productivity,
      wellness,
      consistency
    }
  }

  private static calculateProgressScore(
    schedule: ScheduleItem[],
    completedTasks: string[],
    skippedTasks: string[],
    rescheduledTasks: string[]
  ) {
    if (schedule.length === 0) {
      return { overall: 0, productivity: 0, wellness: 0, consistency: 0 }
    }

    // Separate work tasks and wellness/break items
    const workItems = schedule.filter(item => item.type === 'work')
    const wellnessItems = schedule.filter(item => item.type === 'break' || item.type === 'wellness')
    const totalItems = schedule.length

    // Calculate base points per item (total = 100 points)
    const workPoints = workItems.length > 0 ? 70 / workItems.length : 0 // 70% for work
    const wellnessPoints = wellnessItems.length > 0 ? 30 / wellnessItems.length : 0 // 30% for wellness

    let earnedPoints = 0
    let productivityPoints = 0
    let wellnessEarnedPoints = 0

    // Award points for completed work tasks
    workItems.forEach(item => {
      const taskId = item.taskId || item.id
      if (completedTasks.includes(taskId)) {
        earnedPoints += workPoints
        productivityPoints += workPoints
      } else if (rescheduledTasks.includes(taskId)) {
        // Partial credit for rescheduled tasks (50%)
        earnedPoints += workPoints * 0.5
        productivityPoints += workPoints * 0.5
      } else if (skippedTasks.includes(taskId)) {
        // No points for skipped tasks, but also deduct 5 points as penalty
        earnedPoints -= 5
      }
    })

    // Award points for completed wellness/break items
    wellnessItems.forEach(item => {
      const taskId = item.taskId || item.id
      if (completedTasks.includes(taskId)) {
        earnedPoints += wellnessPoints
        wellnessEarnedPoints += wellnessPoints
      } else if (rescheduledTasks.includes(taskId)) {
        // Partial credit for rescheduled wellness
        earnedPoints += wellnessPoints * 0.5
        wellnessEarnedPoints += wellnessPoints * 0.5
      }
    })

    // Calculate individual scores
    const productivity = Math.max(0, Math.min(100, Math.round(
      workItems.length > 0 ? (productivityPoints / (workPoints * workItems.length)) * 100 : 0
    )))
    
    const wellness = Math.max(0, Math.min(100, Math.round(
      wellnessItems.length > 0 ? (wellnessEarnedPoints / (wellnessPoints * wellnessItems.length)) * 100 : 0
    )))

    // Consistency based on completion pattern (fewer skips = higher consistency)
    const totalActioned = completedTasks.length + skippedTasks.length + rescheduledTasks.length
    const consistencyRatio = totalActioned > 0 ? (completedTasks.length + rescheduledTasks.length * 0.7) / totalActioned : 0
    const consistency = Math.round(consistencyRatio * 100)

    // Overall score is the total earned points, capped between 0-100
    const overall = Math.max(0, Math.min(100, Math.round(earnedPoints)))

    return { overall, productivity, wellness, consistency }
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