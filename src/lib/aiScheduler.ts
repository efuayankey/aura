import { UserInput, ScheduleItem, Task } from '@/types'

export class AIScheduler {
  private static readonly BREAK_DURATION = 15 // minutes
  private static readonly WELLNESS_BREAK_DURATION = 30 // minutes
  private static readonly MAX_FOCUS_TIME = 90 // minutes

  static async generateSchedule(input: UserInput): Promise<ScheduleItem[]> {
    // This is where we'll integrate with Claude API
    // For now, let's create intelligent scheduling logic
    
    const { tasks, availableHours, mood, energy } = input
    const totalMinutes = availableHours * 60
    const schedule: ScheduleItem[] = []
    
    // Sort tasks by priority and adjust for mood/energy
    const sortedTasks = this.prioritizeTasks(tasks, mood, energy)
    
    let currentTime = new Date()
    currentTime.setHours(9, 0, 0, 0) // Start at 9 AM
    
    let remainingMinutes = totalMinutes
    let consecutiveWorkTime = 0
    
    for (const task of sortedTasks) {
      if (remainingMinutes <= 0) break
      
      // Check if we need a wellness break
      if (consecutiveWorkTime >= this.MAX_FOCUS_TIME) {
        const wellnessBreak = this.createWellnessBreak(currentTime, mood)
        schedule.push(wellnessBreak)
        currentTime = this.addMinutes(currentTime, this.WELLNESS_BREAK_DURATION)
        remainingMinutes -= this.WELLNESS_BREAK_DURATION
        consecutiveWorkTime = 0
      }
      
      // Adjust task duration based on energy and mood
      let adjustedDuration = this.adjustTaskDuration(task.estimatedTime, energy, mood)
      adjustedDuration = Math.min(adjustedDuration, remainingMinutes)
      
      if (adjustedDuration >= 15) { // Only schedule if at least 15 minutes
        const workBlock = this.createWorkBlock(task, currentTime, adjustedDuration)
        schedule.push(workBlock)
        
        currentTime = this.addMinutes(currentTime, adjustedDuration)
        remainingMinutes -= adjustedDuration
        consecutiveWorkTime += adjustedDuration
        
        // Add a short break after each task (unless it's the last one)
        if (remainingMinutes > this.BREAK_DURATION && consecutiveWorkTime < this.MAX_FOCUS_TIME) {
          const shortBreak = this.createShortBreak(currentTime)
          schedule.push(shortBreak)
          currentTime = this.addMinutes(currentTime, this.BREAK_DURATION)
          remainingMinutes -= this.BREAK_DURATION
        }
      }
    }
    
    return schedule
  }

  private static prioritizeTasks(tasks: Task[], mood: UserInput['mood'], energy: number): Task[] {
    return [...tasks].sort((a, b) => {
      // Priority weight
      const priorityWeight = { high: 3, medium: 2, low: 1 }
      let scoreA = priorityWeight[a.priority]
      let scoreB = priorityWeight[b.priority]
      
      // Adjust based on energy and mood
      if (energy <= 4) {
        // Low energy: prefer shorter, easier tasks first
        scoreA += (120 - a.estimatedTime) * 0.01
        scoreB += (120 - b.estimatedTime) * 0.01
      }
      
      if (mood === 'stressed') {
        // Stressed: prioritize high-priority tasks to reduce anxiety
        scoreA += priorityWeight[a.priority] * 0.5
        scoreB += priorityWeight[b.priority] * 0.5
      }
      
      return scoreB - scoreA
    })
  }

  private static adjustTaskDuration(baseDuration: number, energy: number, mood: UserInput['mood']): number {
    let multiplier = 1
    
    // Energy adjustment
    if (energy <= 3) multiplier *= 1.3 // Need more time when tired
    else if (energy >= 8) multiplier *= 0.9 // Can work faster when energized
    
    // Mood adjustment
    switch (mood) {
      case 'stressed':
        multiplier *= 1.2 // Need buffer time when stressed
        break
      case 'energized':
        multiplier *= 0.85 // Can work efficiently
        break
      case 'tired':
        multiplier *= 1.4 // Need extra time
        break
    }
    
    return Math.round(baseDuration * multiplier)
  }

  private static createWorkBlock(task: Task, startTime: Date, duration: number): ScheduleItem {
    const endTime = this.addMinutes(startTime, duration)
    
    return {
      id: `work-${task.id}-${startTime.getTime()}`,
      taskId: task.id,
      startTime: this.formatTime(startTime),
      endTime: this.formatTime(endTime),
      type: 'work',
      title: task.name,
      description: `${duration} min • ${task.priority} priority`
    }
  }

  private static createShortBreak(startTime: Date): ScheduleItem {
    const endTime = this.addMinutes(startTime, this.BREAK_DURATION)
    
    const breakActivities = [
      'Grab a coffee',
      'Quick walk',
      'Hydrate',
      'Rest your eyes',
      'Deep breathing'
    ]
    
    return {
      id: `break-${startTime.getTime()}`,
      taskId: '',
      startTime: this.formatTime(startTime),
      endTime: this.formatTime(endTime),
      type: 'break',
      title: 'Short Break',
      description: breakActivities[Math.floor(Math.random() * breakActivities.length)]
    }
  }

  private static createWellnessBreak(startTime: Date, mood: UserInput['mood']): ScheduleItem {
    const endTime = this.addMinutes(startTime, this.WELLNESS_BREAK_DURATION)
    
    const wellnessActivities = {
      stressed: ['Meditation', 'Breathing exercise', 'Calming music'],
      tired: ['Power nap', 'Coffee break', 'Fresh air'],
      balanced: ['Walk', 'Healthy snack', 'Light reading'],
      energized: ['Quick exercise', 'Energizing activity', 'Stretch']
    }
    
    const activities = wellnessActivities[mood]
    const activity = activities[Math.floor(Math.random() * activities.length)]
    
    return {
      id: `wellness-${startTime.getTime()}`,
      taskId: '',
      startTime: this.formatTime(startTime),
      endTime: this.formatTime(endTime),
      type: 'wellness',
      title: 'Wellness Break',
      description: activity
    }
  }

  private static addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60000)
  }

  private static formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }
}