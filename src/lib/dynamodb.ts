import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand, 
  QueryCommand,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb'
import { ScheduleItem, UserInput } from '@/types'

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
})

const docClient = DynamoDBDocumentClient.from(client)

export interface DailyPlan {
  userId: string
  date: string // ISO date string
  schedule: ScheduleItem[]
  userInput: UserInput
  balanceScore: number
  completedTasks: string[]
  skippedTasks: string[]
  wellnessActivities: number
  createdAt: string
  updatedAt: string
}

export interface UserSession {
  userId: string
  currentPlan?: DailyPlan
  streak: number
  totalDays: number
  averageScore: number
  lastActiveDate: string
}

export class DynamoDBService {
  private static readonly PLANS_TABLE = 'aura-daily-plans'
  private static readonly SESSIONS_TABLE = 'aura-user-sessions'

  // Save daily plan
  static async saveDailyPlan(plan: DailyPlan): Promise<void> {
    const command = new PutCommand({
      TableName: this.PLANS_TABLE,
      Item: {
        ...plan,
        updatedAt: new Date().toISOString()
      }
    })

    await docClient.send(command)
  }

  // Get daily plan by user and date
  static async getDailyPlan(userId: string, date: string): Promise<DailyPlan | null> {
    const command = new GetCommand({
      TableName: this.PLANS_TABLE,
      Key: {
        userId,
        date
      }
    })

    const result = await docClient.send(command)
    return result.Item as DailyPlan || null
  }

  // Get recent plans for history view
  static async getRecentPlans(userId: string, limit: number = 10): Promise<DailyPlan[]> {
    const command = new QueryCommand({
      TableName: this.PLANS_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false, // Sort by date descending
      Limit: limit
    })

    const result = await docClient.send(command)
    return result.Items as DailyPlan[] || []
  }

  // Update daily plan (for task completions, skips, etc.)
  static async updateDailyPlan(
    userId: string, 
    date: string, 
    updates: Partial<DailyPlan>
  ): Promise<void> {
    const updateExpressions: string[] = []
    const expressionAttributeNames: Record<string, string> = {}
    const expressionAttributeValues: Record<string, any> = {}

    Object.entries(updates).forEach(([key, value], index) => {
      const attrName = `#attr${index}`
      const attrValue = `:val${index}`
      
      updateExpressions.push(`${attrName} = ${attrValue}`)
      expressionAttributeNames[attrName] = key
      expressionAttributeValues[attrValue] = value
    })

    // Always update the timestamp
    updateExpressions.push('#updatedAt = :updatedAt')
    expressionAttributeNames['#updatedAt'] = 'updatedAt'
    expressionAttributeValues[':updatedAt'] = new Date().toISOString()

    const command = new UpdateCommand({
      TableName: this.PLANS_TABLE,
      Key: { userId, date },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    })

    await docClient.send(command)
  }

  // Get or create user session
  static async getUserSession(userId: string): Promise<UserSession> {
    const command = new GetCommand({
      TableName: this.SESSIONS_TABLE,
      Key: { userId }
    })

    const result = await docClient.send(command)
    
    if (result.Item) {
      return result.Item as UserSession
    }

    // Create new session
    const newSession: UserSession = {
      userId,
      streak: 0,
      totalDays: 0,
      averageScore: 0,
      lastActiveDate: new Date().toISOString().split('T')[0]
    }

    await this.updateUserSession(newSession)
    return newSession
  }

  // Update user session
  static async updateUserSession(session: UserSession): Promise<void> {
    const command = new PutCommand({
      TableName: this.SESSIONS_TABLE,
      Item: session
    })

    await docClient.send(command)
  }

  // Calculate and update user statistics
  static async updateUserStats(userId: string, todayScore: number): Promise<UserSession> {
    const session = await this.getUserSession(userId)
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Update streak
    if (session.lastActiveDate === yesterday) {
      session.streak += 1
    } else if (session.lastActiveDate !== today) {
      session.streak = 1 // Reset streak if gap
    }

    // Update totals
    session.totalDays += 1
    session.lastActiveDate = today

    // Calculate new average score
    const recentPlans = await this.getRecentPlans(userId, session.totalDays)
    if (recentPlans.length > 0) {
      const totalScore = recentPlans.reduce((sum, plan) => sum + plan.balanceScore, 0)
      session.averageScore = Math.round(totalScore / recentPlans.length)
    }

    await this.updateUserSession(session)
    return session
  }

  // Get wellness insights for user
  static async getWellnessInsights(userId: string): Promise<{
    averageWellnessActivities: number
    consistencyScore: number
    recommendations: string[]
  }> {
    const recentPlans = await this.getRecentPlans(userId, 7) // Last 7 days
    
    if (recentPlans.length === 0) {
      return {
        averageWellnessActivities: 0,
        consistencyScore: 0,
        recommendations: ['Start tracking your daily activities to get personalized insights!']
      }
    }

    const averageWellnessActivities = recentPlans.reduce(
      (sum, plan) => sum + (plan.wellnessActivities || 0), 0
    ) / recentPlans.length

    const daysWithWellness = recentPlans.filter(plan => 
      (plan.wellnessActivities || 0) > 0
    ).length
    const consistencyScore = Math.round((daysWithWellness / recentPlans.length) * 100)

    const recommendations: string[] = []
    
    if (averageWellnessActivities < 2) {
      recommendations.push('Try to include more wellness breaks in your schedule')
    }
    
    if (consistencyScore < 70) {
      recommendations.push('Aim for more consistent wellness practices throughout the week')
    }

    const averageScore = recentPlans.reduce((sum, plan) => sum + plan.balanceScore, 0) / recentPlans.length
    if (averageScore < 70) {
      recommendations.push('Consider shorter work blocks to improve your balance score')
    }

    return {
      averageWellnessActivities: Math.round(averageWellnessActivities * 10) / 10,
      consistencyScore,
      recommendations
    }
  }
}

// Utility function to check if DynamoDB is available
export async function isDynamoDBAvailable(): Promise<boolean> {
  try {
    await docClient.send(new GetCommand({
      TableName: DynamoDBService['PLANS_TABLE'],
      Key: { userId: 'test', date: 'test' }
    }))
    return true
  } catch (error) {
    console.warn('DynamoDB not available, using local storage fallback')
    return false
  }
}