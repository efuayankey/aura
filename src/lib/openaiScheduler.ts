import OpenAI from 'openai'
import { UserInput, ScheduleItem, Task } from '@/types'

// Only initialize OpenAI on server-side
const getOpenAIClient = () => {
  if (typeof window !== 'undefined') {
    throw new Error('OpenAI client should only be used on server-side')
  }
  
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export class OpenAIScheduler {
  static async generateSchedule(input: UserInput): Promise<ScheduleItem[]> {
    try {
      const openai = getOpenAIClient()
      const prompt = this.buildSchedulingPrompt(input)
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are AURA, an AI wellness and productivity assistant. Your job is to create balanced, realistic schedules that prioritize both productivity and well-being. Always consider the user's energy level, mood, and include appropriate breaks and wellness interventions.

Return your response as a valid JSON array of schedule items with this exact structure:
[
  {
    "id": "unique-id",
    "taskId": "task-id-if-work-item",
    "startTime": "9:00 AM",
    "endTime": "10:00 AM", 
    "type": "work|break|wellness",
    "title": "Task Title",
    "description": "Brief description"
  }
]

Rules:
- Use the exact start and end times provided by the user
- Include 15-min breaks between work sessions
- Add 30-min wellness breaks after 90 min of consecutive work
- Adjust task durations based on user energy/mood
- Low energy = longer time estimates, more breaks
- Stressed = shorter focused sessions, more wellness breaks
- Never exceed the available time window
- Minimum task duration: 15 minutes`
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('No response from OpenAI')
      }

      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from OpenAI')
      }

      const schedule = JSON.parse(jsonMatch[0]) as ScheduleItem[]
      return this.validateAndFixSchedule(schedule)

    } catch (error) {
      console.error('OpenAI scheduling error:', error)
      // Fallback to local scheduling if API fails
      const { AIScheduler } = await import('./aiScheduler')
      return AIScheduler.generateSchedule(input)
    }
  }

  private static buildSchedulingPrompt(input: UserInput): string {
    const { tasks, startTime, endTime, mood, energy } = input
    
    const taskList = tasks.map(task => 
      `- ${task.name} (${task.estimatedTime} min, ${task.priority} priority)`
    ).join('\n')

    const start = new Date(`2000-01-01 ${startTime}:00`)
    const end = new Date(`2000-01-01 ${endTime}:00`)
    const availableHours = Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60))

    return `Create a balanced daily schedule for a user with the following requirements:

**Time Window:** ${this.formatTime12Hour(startTime)} to ${this.formatTime12Hour(endTime)} (${availableHours.toFixed(1)} hours available)
**Current Mood:** ${mood}
**Energy Level:** ${energy}/10

**Tasks to schedule:**
${taskList}

**User Context:**
- Mood: ${mood} (${this.getMoodDescription(mood)})
- Energy: ${energy}/10 (${this.getEnergyDescription(energy)})
- Must start at exactly ${this.formatTime12Hour(startTime)}
- Must finish by ${this.formatTime12Hour(endTime)}

Please create a schedule that:
1. Balances productivity with wellness
2. Includes appropriate breaks and wellness activities
3. Adjusts task timing based on mood and energy
4. Uses the EXACT time window provided (${this.formatTime12Hour(startTime)} - ${this.formatTime12Hour(endTime)})
5. Fits within the available ${availableHours.toFixed(1)} hours

Focus on creating a sustainable, balanced schedule that promotes both achievement and well-being within their specific time constraints.`
  }

  private static formatTime12Hour(time24: string): string {
    const [hours, minutes] = time24.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  private static getMoodDescription(mood: UserInput['mood']): string {
    const descriptions = {
      energized: 'high motivation, ready for challenging tasks',
      balanced: 'stable mood, optimal for steady work',
      tired: 'low energy, needs more breaks and easier tasks',
      stressed: 'anxious, needs calming activities and shorter focus sessions'
    }
    return descriptions[mood]
  }

  private static getEnergyDescription(energy: number): string {
    if (energy >= 8) return 'very high energy, can handle intensive work'
    if (energy >= 6) return 'good energy, productive day ahead'
    if (energy >= 4) return 'moderate energy, needs balanced approach'
    return 'low energy, requires gentle schedule with frequent breaks'
  }

  private static validateAndFixSchedule(schedule: ScheduleItem[]): ScheduleItem[] {
    // Ensure all required fields are present
    return schedule.map((item, index) => ({
      id: item.id || `schedule-${Date.now()}-${index}`,
      taskId: item.taskId || '',
      startTime: item.startTime || '9:00 AM',
      endTime: item.endTime || '10:00 AM',
      type: item.type || 'work',
      title: item.title || 'Untitled Task',
      description: item.description || ''
    }))
  }

  static async generateWellnessRecommendation(
    mood: UserInput['mood'],
    energy: number,
    completedTasks: number,
    totalTasks: number
  ): Promise<string> {
    try {
      const openai = getOpenAIClient()
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are AURA, a caring wellness AI assistant. Provide brief, encouraging wellness recommendations based on user state. Keep responses under 100 words and focus on actionable advice."
          },
          {
            role: "user",
            content: `User status:
- Mood: ${mood}
- Energy: ${energy}/10
- Progress: ${completedTasks}/${totalTasks} tasks completed

Provide a short, personalized wellness recommendation to help them maintain balance and motivation.`
          }
        ],
        temperature: 0.8,
        max_tokens: 150
      })

      return completion.choices[0]?.message?.content || "Take a moment to breathe and appreciate your progress so far!"
    } catch (error) {
      console.error('Wellness recommendation error:', error)
      return this.getFallbackWellnessMessage(mood, energy)
    }
  }

  private static getFallbackWellnessMessage(mood: UserInput['mood'], energy: number): string {
    if (mood === 'stressed') return "Take 5 deep breaths. You're doing great, one step at a time."
    if (mood === 'tired') return "Consider a short walk or some fresh air to recharge your energy."
    if (energy <= 3) return "Your body needs rest. Take a proper break and hydrate."
    return "You're making good progress! Keep up the balanced approach."
  }

  static async regenerateScheduleWithFeedback(
    input: UserInput,
    feedback: string,
    preferences?: any
  ): Promise<ScheduleItem[]> {
    try {
      const openai = getOpenAIClient()
      const prompt = this.buildRegenerationPrompt(input, feedback, preferences)
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are AURA, an AI wellness and productivity assistant. The user has requested changes to their previous schedule. 

CRITICAL: You must incorporate their feedback and preferences to create an improved schedule.

Return your response as a valid JSON array of schedule items with this exact structure:
[
  {
    "id": "unique-id",
    "taskId": "task-id-if-work-item",
    "startTime": "9:00 AM",
    "endTime": "10:00 AM", 
    "type": "work|break|wellness",
    "title": "Task Title",
    "description": "Brief description"
  }
]

Rules:
- Apply the user's feedback and preferences FIRST
- Use the exact start and end times provided by the user
- If they want longer breaks, extend break durations
- If they want shorter work blocks, reduce work session lengths
- If they want more wellness time, add more wellness activities
- If they want different task order, rearrange based on their preference
- Still maintain balance between productivity and wellness
- Never exceed the available time window`
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2000
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('No response from OpenAI')
      }

      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from OpenAI')
      }

      const schedule = JSON.parse(jsonMatch[0]) as ScheduleItem[]
      return this.validateAndFixSchedule(schedule)

    } catch (error) {
      console.error('OpenAI schedule regeneration error:', error)
      // Fallback to modified local scheduling
      const { AIScheduler } = await import('./aiScheduler')
      return AIScheduler.generateSchedule(input)
    }
  }

  private static buildRegenerationPrompt(
    input: UserInput,
    feedback: string,
    preferences?: any
  ): string {
    const basePrompt = this.buildSchedulingPrompt(input)
    
    let adjustments = []
    
    if (preferences?.longerBreaks) {
      adjustments.push("- Make breaks longer (20-30 minutes instead of 15)")
    }
    if (preferences?.shorterWorkBlocks) {
      adjustments.push("- Reduce work session lengths (30-45 minutes max)")
    }
    if (preferences?.moreWellnessTime) {
      adjustments.push("- Add more wellness activities and self-care time")
    }
    if (preferences?.differentTaskOrder) {
      adjustments.push("- Rearrange tasks in a different order")
    }

    const adjustmentText = adjustments.length > 0 
      ? `\n**REQUIRED ADJUSTMENTS:**\n${adjustments.join('\n')}\n`
      : ''

    const feedbackText = feedback.trim() 
      ? `\n**USER FEEDBACK:**\n"${feedback}"\n\nPlease address this feedback directly in the new schedule.\n`
      : ''

    return `${basePrompt}

**SCHEDULE REGENERATION REQUEST:**
The user has reviewed their previous schedule and wants changes.

${feedbackText}${adjustmentText}

Please create a NEW schedule that specifically addresses their concerns while maintaining balance and staying within the time constraints.`
  }
}