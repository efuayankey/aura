import { v4 as uuidv4 } from 'uuid'
import { DynamoDBService, DailyPlan, UserSession, isDynamoDBAvailable } from './dynamodb'
import { ScheduleItem, UserInput } from '@/types'

export class UserSessionManager {
  private static readonly USER_ID_KEY = 'aura-user-id'
  private static readonly DAILY_PLAN_KEY = 'aura-daily-plan'
  private static readonly USER_SESSION_KEY = 'aura-user-session'

  // Get or create user ID
  static getUserId(): string {
    if (typeof window === 'undefined') return 'server-user'
    
    let userId = localStorage.getItem(this.USER_ID_KEY)
    if (!userId) {
      userId = uuidv4()
      localStorage.setItem(this.USER_ID_KEY, userId)
    }
    return userId
  }

  // Save daily plan (DynamoDB + localStorage backup)
  static async saveDailyPlan(
    schedule: ScheduleItem[],
    userInput: UserInput,
    balanceScore: number,
    completedTasks: string[] = [],
    skippedTasks: string[] = [],
    wellnessActivities: number = 0
  ): Promise<void> {
    const userId = this.getUserId()
    const today = new Date().toISOString().split('T')[0]
    
    const plan: DailyPlan = {
      userId,
      date: today,
      schedule,
      userInput,
      balanceScore,
      completedTasks,
      skippedTasks,
      wellnessActivities,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Try DynamoDB first, fall back to localStorage
    try {
      if (await isDynamoDBAvailable()) {
        await DynamoDBService.saveDailyPlan(plan)
      } else {
        throw new Error('DynamoDB not available')
      }
    } catch (error) {
      console.warn('Saving to localStorage instead:', error)
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.DAILY_PLAN_KEY, JSON.stringify(plan))
      }
    }
  }

  // Get today's plan
  static async getTodaysPlan(): Promise<DailyPlan | null> {
    const userId = this.getUserId()
    const today = new Date().toISOString().split('T')[0]

    try {
      if (await isDynamoDBAvailable()) {
        return await DynamoDBService.getDailyPlan(userId, today)
      } else {
        throw new Error('DynamoDB not available')
      }
    } catch (error) {
      console.warn('Loading from localStorage instead:', error)
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(this.DAILY_PLAN_KEY)
        if (stored) {
          const plan = JSON.parse(stored) as DailyPlan
          if (plan.date === today) return plan
        }
      }
      return null
    }
  }

  // Update daily plan progress
  static async updateProgress(
    completedTasks: string[],
    skippedTasks: string[],
    newSchedule?: ScheduleItem[],
    newScore?: number,
    wellnessActivities?: number
  ): Promise<void> {
    const userId = this.getUserId()
    const today = new Date().toISOString().split('T')[0]

    const updates: Partial<DailyPlan> = {
      completedTasks,
      skippedTasks,
      updatedAt: new Date().toISOString()
    }

    if (newSchedule) updates.schedule = newSchedule
    if (newScore !== undefined) updates.balanceScore = newScore
    if (wellnessActivities !== undefined) updates.wellnessActivities = wellnessActivities

    try {
      if (await isDynamoDBAvailable()) {
        await DynamoDBService.updateDailyPlan(userId, today, updates)
      } else {
        throw new Error('DynamoDB not available')
      }
    } catch (error) {
      console.warn('Updating localStorage instead:', error)
      // Update localStorage
      const currentPlan = await this.getTodaysPlan()
      if (currentPlan && typeof window !== 'undefined') {
        const updatedPlan = { ...currentPlan, ...updates }
        localStorage.setItem(this.DAILY_PLAN_KEY, JSON.stringify(updatedPlan))
      }
    }
  }

  // Get user session and stats
  static async getUserSession(): Promise<UserSession> {
    const userId = this.getUserId()

    try {
      if (await isDynamoDBAvailable()) {
        return await DynamoDBService.getUserSession(userId)
      } else {
        throw new Error('DynamoDB not available')
      }
    } catch (error) {
      console.warn('Using localStorage session instead:', error)
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(this.USER_SESSION_KEY)
        if (stored) {
          return JSON.parse(stored) as UserSession
        }
      }

      // Default session
      const defaultSession: UserSession = {
        userId,
        streak: 0,
        totalDays: 0,
        averageScore: 0,
        lastActiveDate: new Date().toISOString().split('T')[0]
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(this.USER_SESSION_KEY, JSON.stringify(defaultSession))
      }

      return defaultSession
    }
  }

  // Update user stats after completing a day
  static async updateUserStats(todayScore: number): Promise<UserSession> {
    const userId = this.getUserId()

    try {
      if (await isDynamoDBAvailable()) {
        return await DynamoDBService.updateUserStats(userId, todayScore)
      } else {
        throw new Error('DynamoDB not available')
      }
    } catch (error) {
      console.warn('Updating localStorage stats instead:', error)
      const session = await this.getUserSession()
      const today = new Date().toISOString().split('T')[0]
      
      // Simple local stats update
      if (session.lastActiveDate !== today) {
        session.totalDays += 1
        session.streak = session.lastActiveDate === this.getYesterday() ? session.streak + 1 : 1
        session.lastActiveDate = today
      }

      // Simple average calculation
      session.averageScore = Math.round(((session.averageScore * (session.totalDays - 1)) + todayScore) / session.totalDays)

      if (typeof window !== 'undefined') {
        localStorage.setItem(this.USER_SESSION_KEY, JSON.stringify(session))
      }

      return session
    }
  }

  // Get recent plans for history
  static async getRecentPlans(limit: number = 7): Promise<DailyPlan[]> {
    const userId = this.getUserId()

    try {
      if (await isDynamoDBAvailable()) {
        return await DynamoDBService.getRecentPlans(userId, limit)
      } else {
        throw new Error('DynamoDB not available')
      }
    } catch (error) {
      console.warn('Using localStorage history instead:', error)
      const currentPlan = await this.getTodaysPlan()
      return currentPlan ? [currentPlan] : []
    }
  }

  // Get wellness insights
  static async getWellnessInsights() {
    const userId = this.getUserId()

    try {
      if (await isDynamoDBAvailable()) {
        return await DynamoDBService.getWellnessInsights(userId)
      } else {
        throw new Error('DynamoDB not available')
      }
    } catch (error) {
      console.warn('Using basic wellness insights:', error)
      return {
        averageWellnessActivities: 0,
        consistencyScore: 0,
        recommendations: ['Enable AWS DynamoDB to track detailed wellness insights!']
      }
    }
  }

  // Utility methods
  private static getYesterday(): string {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toISOString().split('T')[0]
  }

  // Clear user data (for testing/reset)
  static clearUserData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.USER_ID_KEY)
      localStorage.removeItem(this.DAILY_PLAN_KEY)
      localStorage.removeItem(this.USER_SESSION_KEY)
    }
  }
}