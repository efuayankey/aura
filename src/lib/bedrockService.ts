import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'

// Initialize Bedrock client
const client = new BedrockRuntimeClient({
  region: 'us-east-1', // Bedrock is available in us-east-1, us-west-2, etc.
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export interface BedrockModels {
  CLAUDE_SONNET: 'anthropic.claude-3-sonnet-20240229-v1:0'
  CLAUDE_HAIKU: 'anthropic.claude-3-haiku-20240307-v1:0'
  TITAN_TEXT: 'amazon.titan-text-express-v1'
  TITAN_EMBED: 'amazon.titan-embed-text-v1'
}

export const BEDROCK_MODELS: BedrockModels = {
  CLAUDE_SONNET: 'anthropic.claude-3-sonnet-20240229-v1:0',
  CLAUDE_HAIKU: 'anthropic.claude-3-haiku-20240307-v1:0',
  TITAN_TEXT: 'amazon.titan-text-express-v1',
  TITAN_EMBED: 'amazon.titan-embed-text-v1'
}

export class BedrockService {
  static async invokeClaude(prompt: string, model: keyof BedrockModels = 'CLAUDE_SONNET'): Promise<string> {
    try {
      const modelId = BEDROCK_MODELS[model]
      
      const body = JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 2000,
        temperature: 0.7,
        messages: [{
          role: "user",
          content: prompt
        }]
      })

      const command = new InvokeModelCommand({
        modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: body
      })

      const response = await client.send(command)
      const responseBody = JSON.parse(new TextDecoder().decode(response.body))
      
      return responseBody.content[0].text
    } catch (error) {
      console.error('Bedrock Claude Error:', error)
      throw new Error(`Bedrock Claude invocation failed: ${error.message}`)
    }
  }

  static async invokeTitan(prompt: string): Promise<string> {
    try {
      const body = JSON.stringify({
        inputText: prompt,
        textGenerationConfig: {
          maxTokenCount: 1000,
          temperature: 0.7,
          topP: 0.9
        }
      })

      const command = new InvokeModelCommand({
        modelId: BEDROCK_MODELS.TITAN_TEXT,
        contentType: 'application/json',
        accept: 'application/json',
        body: body
      })

      const response = await client.send(command)
      const responseBody = JSON.parse(new TextDecoder().decode(response.body))
      
      return responseBody.results[0].outputText
    } catch (error) {
      console.error('Bedrock Titan Error:', error)
      throw new Error(`Bedrock Titan invocation failed: ${error.message}`)
    }
  }

  static async generateSchedule(userInput: any): Promise<any[]> {
    const prompt = `
You are an AI wellness and productivity coach. Create an optimized daily schedule based on the user's input.

User Input:
- Available time: ${userInput.startTime} to ${userInput.endTime}
- Energy level: ${userInput.energy}/10
- Mood: ${userInput.mood}
- Current stress level: ${userInput.stress}/10
- Health focus: ${userInput.health}
- Tasks: ${userInput.tasks.map(t => `"${t.task}" (${t.estimatedTime} min, priority: ${t.priority})`).join(', ')}

Instructions:
1. Use the EXACT task names provided by the user (e.g. "cooking", "calc hw", "study math")
2. Balance work tasks with wellness breaks
3. Schedule high-energy tasks when user energy is optimal
4. Include mindfulness breaks if stress is high
5. Add physical activity if health focus includes fitness
6. NEVER use generic names like "Priority Task 1" - always use the actual task names

IMPORTANT: The "title" field must be the EXACT task name from the user's input.

Return ONLY a JSON array of schedule items in this exact format:
[
  {
    "id": "task-1",
    "title": "cooking",
    "description": "Prepare healthy meal",
    "startTime": "18:00",
    "endTime": "19:00", 
    "type": "work",
    "taskId": "cooking-task"
  },
  {
    "id": "break-1", 
    "title": "Mindfulness Break",
    "description": "5-minute breathing exercise",
    "startTime": "19:00",
    "endTime": "19:05",
    "type": "wellness",
    "taskId": "break-1"
  }
]

CRITICAL: Use the exact task names: ${userInput.tasks.map(t => `"${t.task}"`).join(', ')}
Ensure all times are within ${userInput.startTime}-${userInput.endTime} and tasks don't overlap.
`

    try {
      const response = await this.invokeClaude(prompt, 'CLAUDE_SONNET')
      
      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Bedrock response')
      }
      
      const schedule = JSON.parse(jsonMatch[0])
      
      // Validate schedule format
      if (!Array.isArray(schedule)) {
        throw new Error('Schedule is not an array')
      }
      
      return schedule
    } catch (error) {
      console.error('Schedule generation error:', error)
      throw error
    }
  }

  static async generateWellnessRecommendation(context: {
    stressLevel: number
    energyLevel: number
    duration: number
    currentTime: string
    recentActivities: string[]
  }): Promise<{
    activity: string
    description: string
    instructions: string[]
    benefits: string[]
  }> {
    const prompt = `
You are an AI wellness coach. Based on the user's current state, recommend a wellness activity.

Context:
- Stress level: ${context.stressLevel}/10
- Energy level: ${context.energyLevel}/10  
- Available time: ${context.duration} minutes
- Current time: ${context.currentTime}
- Recent activities: ${context.recentActivities.join(', ') || 'None'}

Provide a personalized wellness recommendation in this JSON format:
{
  "activity": "Activity Name",
  "description": "Brief description of the activity",
  "instructions": ["Step 1", "Step 2", "Step 3"],
  "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"]
}

Choose activities appropriate for the stress/energy level and duration. Avoid repeating recent activities.
`

    try {
      const response = await this.invokeClaude(prompt, 'CLAUDE_HAIKU')
      
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No valid JSON found in wellness response')
      }
      
      return JSON.parse(jsonMatch[0])
    } catch (error) {
      console.error('Wellness recommendation error:', error)
      throw error
    }
  }

  static async generateMotivationalMessage(context: {
    completedTasks: number
    totalTasks: number
    currentTime: string
    userMood: string
    timeOfDay: 'morning' | 'afternoon' | 'evening'
  }): Promise<string> {
    const prompt = `
Generate a personalized motivational message for a user working on their daily schedule.

Context:
- Completed: ${context.completedTasks}/${context.totalTasks} tasks
- Current time: ${context.currentTime}
- User mood: ${context.userMood}
- Time of day: ${context.timeOfDay}

Create an encouraging, personalized message (2-3 sentences) that:
1. Acknowledges their progress
2. Motivates them to continue
3. Matches their current mood and time of day
4. Feels personal and authentic

Return only the motivational message text, no JSON.
`

    try {
      return await this.invokeTitan(prompt)
    } catch (error) {
      console.error('Motivational message error:', error)
      // Fallback message
      const progress = context.totalTasks > 0 ? (context.completedTasks / context.totalTasks) * 100 : 0
      if (progress === 0) {
        return "Ready to start your productive day? You've got this!"
      } else if (progress < 50) {
        return "Great start! Keep up the momentum."
      } else if (progress < 100) {
        return "Excellent work! You're making solid progress."
      } else {
        return "Amazing! You've completed all your tasks. Time to celebrate!"
      }
    }
  }

  static async optimizeSchedule(currentSchedule: any[], completedTasks: string[], userFeedback: string): Promise<any[]> {
    const prompt = `
You are an AI schedule optimizer. Based on user progress and feedback, optimize the remaining schedule.

Current Schedule:
${JSON.stringify(currentSchedule, null, 2)}

Completed Tasks: ${completedTasks.join(', ')}
User Feedback: "${userFeedback}"

Instructions:
1. Keep completed tasks as-is
2. Optimize remaining tasks based on feedback
3. Maintain realistic time estimates
4. Ensure wellness balance
5. Consider user's current energy state

Return the optimized schedule as a JSON array in the same format as the input.
`

    try {
      const response = await this.invokeClaude(prompt, 'CLAUDE_SONNET')
      
      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('No valid JSON found in optimization response')
      }
      
      return JSON.parse(jsonMatch[0])
    } catch (error) {
      console.error('Schedule optimization error:', error)
      throw error
    }
  }
}

export default BedrockService