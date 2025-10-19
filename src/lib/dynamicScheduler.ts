import { ScheduleItem, UserInput, TaskAction } from '@/types'

export class DynamicScheduler {
  static async rescheduleRemaining(
    originalSchedule: ScheduleItem[],
    userInput: UserInput,
    completedTasks: string[],
    skippedTasks: string[],
    rescheduledTasks: string[],
    currentTime?: Date
  ): Promise<ScheduleItem[]> {
    const now = currentTime || new Date()
    const currentTimeString = this.formatCurrentTime(now)
    
    // Filter out completed and determine what's left
    const remainingItems = originalSchedule.filter(item => {
      const taskId = item.taskId || item.id
      const isCompleted = completedTasks.includes(taskId)
      const isSkipped = skippedTasks.includes(taskId)
      
      // Keep if not completed/skipped, or if it's a future item
      return !isCompleted && !isSkipped && this.isTimeAfter(item.startTime, currentTimeString)
    })

    // If there are skipped tasks that need rescheduling
    const skippedTasksToReschedule = userInput.tasks.filter(task => 
      skippedTasks.includes(task.id) && !rescheduledTasks.includes(task.id)
    )

    if (skippedTasksToReschedule.length === 0 && remainingItems.length === originalSchedule.length) {
      // No changes needed
      return originalSchedule
    }

    // Calculate remaining time
    const endTime = userInput.endTime
    const remainingMinutes = this.calculateRemainingMinutes(currentTimeString, endTime)
    
    if (remainingMinutes <= 0) {
      return remainingItems // No time left, return current schedule
    }

    // Create a new user input for remaining items
    const remainingUserInput: UserInput = {
      ...userInput,
      startTime: currentTimeString,
      tasks: [
        // Add back skipped tasks with adjusted priorities
        ...skippedTasksToReschedule.map(task => ({
          ...task,
          estimatedTime: Math.max(15, task.estimatedTime * 0.8) // Reduce time for skipped items
        })),
        // Include uncompleted original tasks
        ...userInput.tasks.filter(task => {
          const hasWorkItem = remainingItems.some(item => item.taskId === task.id)
          return hasWorkItem && !completedTasks.includes(task.id) && !skippedTasks.includes(task.id)
        })
      ]
    }

    if (remainingUserInput.tasks.length === 0) {
      // Only breaks/wellness items left
      return remainingItems
    }

    try {
      // Use API to generate new schedule for remaining time
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...remainingUserInput,
          feedback: `Reschedule remaining tasks. Current time is ${currentTimeString}. ${skippedTasksToReschedule.length > 0 ? `Please include the ${skippedTasksToReschedule.length} skipped task(s) if time allows.` : ''}`,
          preferences: {
            shorterWorkBlocks: skippedTasksToReschedule.length > 0, // If tasks were skipped, make blocks shorter
            moreWellnessTime: skippedTasks.length >= 2 // More wellness if multiple skips
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to reschedule')
      }

      const { schedule: newSchedule } = await response.json()
      return newSchedule

    } catch (error) {
      console.error('Dynamic rescheduling error:', error)
      
      // Fallback: simple time compression
      return this.compressRemainingSchedule(remainingItems, currentTimeString, endTime)
    }
  }

  private static compressRemainingSchedule(
    items: ScheduleItem[],
    startTime: string,
    endTime: string
  ): ScheduleItem[] {
    const availableMinutes = this.calculateRemainingMinutes(startTime, endTime)
    const workItems = items.filter(item => item.type === 'work')
    
    if (workItems.length === 0) return items
    
    const totalWorkMinutes = workItems.reduce((sum, item) => {
      return sum + this.calculateDuration(item.startTime, item.endTime)
    }, 0)
    
    // If we have enough time, keep original schedule but shift times
    if (totalWorkMinutes <= availableMinutes * 0.8) {
      return this.shiftScheduleToNewTime(items, startTime)
    }
    
    // Otherwise, compress work blocks
    const compressionRatio = (availableMinutes * 0.7) / totalWorkMinutes
    return this.compressWorkBlocks(items, startTime, compressionRatio)
  }

  private static shiftScheduleToNewTime(items: ScheduleItem[], newStartTime: string): ScheduleItem[] {
    if (items.length === 0) return items
    
    const originalStart = this.timeToMinutes(items[0].startTime)
    const newStart = this.timeToMinutes(newStartTime)
    const timeShift = newStart - originalStart
    
    return items.map(item => ({
      ...item,
      startTime: this.minutesToTime(this.timeToMinutes(item.startTime) + timeShift),
      endTime: this.minutesToTime(this.timeToMinutes(item.endTime) + timeShift)
    }))
  }

  private static compressWorkBlocks(
    items: ScheduleItem[],
    startTime: string,
    compressionRatio: number
  ): ScheduleItem[] {
    let currentTime = this.timeToMinutes(startTime)
    
    return items.map(item => {
      const duration = this.calculateDuration(item.startTime, item.endTime)
      const newDuration = item.type === 'work' 
        ? Math.max(15, Math.round(duration * compressionRatio))
        : Math.min(15, duration) // Compress breaks too
        
      const newStartTime = this.minutesToTime(currentTime)
      const newEndTime = this.minutesToTime(currentTime + newDuration)
      
      currentTime += newDuration
      
      return {
        ...item,
        startTime: newStartTime,
        endTime: newEndTime,
        description: item.type === 'work' && compressionRatio < 1
          ? `${item.description} (compressed due to time constraints)`
          : item.description
      }
    })
  }

  static generateTimeBasedSuggestion(
    actionType: TaskAction['type'],
    timeRemaining: number,
    totalTasks: number,
    completedTasks: number
  ): string {
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    const hoursRemaining = timeRemaining / 60
    
    if (actionType === 'skip' && hoursRemaining < 1) {
      return "With limited time remaining, consider focusing on your highest priority tasks."
    }
    
    if (actionType === 'complete' && completionRate > 75) {
      return "Excellent progress! You're on track to complete most of your planned tasks."
    }
    
    if (actionType === 'skip' && completionRate < 25) {
      return "I notice you're skipping several tasks. Would you like me to adjust the schedule to better match your current energy?"
    }
    
    if (hoursRemaining > 2 && completionRate > 50) {
      return "Great momentum! You have good time cushion to maintain this steady pace."
    }
    
    return ""
  }

  // Utility methods
  private static formatCurrentTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  private static isTimeAfter(timeA: string, timeB: string): boolean {
    const minutesA = this.timeToMinutes(timeA)
    const minutesB = this.timeToMinutes(timeB)
    return minutesA > minutesB
  }

  private static calculateRemainingMinutes(startTime: string, endTime: string): number {
    const start = this.timeToMinutes(startTime)
    const end = this.timeToMinutes(endTime)
    return Math.max(0, end - start)
  }

  private static calculateDuration(startTime: string, endTime: string): number {
    const start = this.timeToMinutes(startTime)
    const end = this.timeToMinutes(endTime)
    return end - start
  }

  private static timeToMinutes(timeString: string): number {
    // Handle both "HH:MM" and "H:MM AM/PM" formats
    let time = timeString.replace(/\s+/g, '').toUpperCase()
    let hours = 0
    let minutes = 0
    
    if (time.includes('AM') || time.includes('PM')) {
      const isPM = time.includes('PM')
      time = time.replace(/[AP]M/, '')
      const [h, m] = time.split(':').map(Number)
      hours = isPM && h !== 12 ? h + 12 : !isPM && h === 12 ? 0 : h
      minutes = m || 0
    } else {
      const [h, m] = time.split(':').map(Number)
      hours = h
      minutes = m || 0
    }
    
    return hours * 60 + minutes
  }

  private static minutesToTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60) % 24
    const minutes = totalMinutes % 60
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }
}