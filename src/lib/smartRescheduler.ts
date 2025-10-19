import { ScheduleItem, UserInput, Task } from '@/types'

export class SmartRescheduler {
  static async rescheduleTask(
    taskId: string,
    currentSchedule: ScheduleItem[],
    userInput: UserInput
  ): Promise<{
    newSchedule?: ScheduleItem[];
    rescheduledTo?: { startTime: string; endTime: string };
    reason?: string;
    needsManualReschedule?: boolean;
    taskDetails?: { title: string; duration: number };
  }> {
    // Find the task to reschedule
    console.log('🔍 Looking for task with ID:', taskId)
    console.log('📋 Available schedule items:', currentSchedule.map(item => ({ 
      id: item.id, 
      taskId: item.taskId, 
      title: item.title, 
      type: item.type 
    })))
    
    const taskToReschedule = currentSchedule.find(item => 
      item.taskId === taskId || item.id === taskId
    )
    
    if (!taskToReschedule) {
      throw new Error(`Task with ID '${taskId}' not found in schedule`)
    }
    
    if (taskToReschedule.type !== 'work') {
      throw new Error(`Task '${taskToReschedule.title}' is not a work task and cannot be rescheduled`)
    }

    const currentDuration = this.calculateDuration(taskToReschedule.startTime, taskToReschedule.endTime)
    
    // Simple and reliable: always move to the end of the schedule
    const newSlot = this.moveTaskToEnd(currentSchedule, taskToReschedule, currentDuration, userInput)
    
    if (!newSlot) {
      console.log('❌ No available slot found, requesting manual reschedule')
      return {
        needsManualReschedule: true,
        taskDetails: {
          title: taskToReschedule.title,
          duration: currentDuration
        }
      }
    }

    // Create new schedule with rescheduled task
    const newSchedule = this.createRescheduledSchedule(
      currentSchedule,
      taskToReschedule,
      newSlot,
      userInput
    )

    return {
      newSchedule,
      rescheduledTo: newSlot,
      reason: newSlot.reason
    }
  }

  // Manual reschedule with user-selected time
  static manualRescheduleTask(
    taskId: string,
    currentSchedule: ScheduleItem[],
    newStartTime: string,
    newEndTime: string
  ): ScheduleItem[] {
    console.log('✏️ Manual reschedule:', taskId, 'to', newStartTime, '-', newEndTime)
    
    // Find the task to reschedule
    const taskToReschedule = currentSchedule.find(item => 
      item.taskId === taskId || item.id === taskId
    )
    
    if (!taskToReschedule) {
      throw new Error('Task not found')
    }

    // Remove the original task
    let newSchedule = currentSchedule.filter(item => item.id !== taskToReschedule.id)
    
    // Create the rescheduled task
    const rescheduledTask: ScheduleItem = {
      ...taskToReschedule,
      startTime: newStartTime,
      endTime: newEndTime,
      description: `${taskToReschedule.description} (rescheduled to ${newStartTime})`
    }
    
    // Insert the rescheduled task
    newSchedule.push(rescheduledTask)
    
    // Sort by start time
    newSchedule.sort((a, b) => 
      this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime)
    )
    
    return newSchedule
  }

  private static analyzeScheduleForRescheduling(
    schedule: ScheduleItem[],
    userInput: UserInput,
    taskToReschedule: ScheduleItem
  ) {
    const currentTime = new Date()
    const currentHour = currentTime.getHours()
    const currentMinute = currentTime.getMinutes()
    const currentTimeMinutes = currentHour * 60 + currentMinute

    const endTimeMinutes = this.timeToMinutes(userInput.endTime)
    
    // Analyze gaps and work patterns
    const workItems = schedule.filter(item => item.type === 'work' && item.id !== taskToReschedule.id)
    const gaps = this.findTimeGaps(schedule, currentTimeMinutes, endTimeMinutes)
    
    // Calculate energy curve (people are usually more focused at certain times)
    const energyLevels = this.calculateEnergyLevels(userInput, currentTimeMinutes, endTimeMinutes)
    
    // Find task clustering opportunities (similar tasks together)
    const taskClusters = this.findTaskClusters(workItems, taskToReschedule)

    return {
      gaps,
      energyLevels,
      taskClusters,
      currentTimeMinutes,
      endTimeMinutes
    }
  }

  private static findOptimalTimeSlot(
    analysis: any,
    taskDuration: number,
    userInput: UserInput
  ): { startTime: string; endTime: string; reason: string } | null {
    const { gaps, energyLevels, taskClusters } = analysis
    
    console.log('🎯 Finding optimal slot for task duration:', taskDuration)
    console.log('🕳️ Available gaps:', gaps)
    
    // Score each potential slot
    const slots = gaps
      .filter(gap => gap.duration >= taskDuration + 5) // Reduced to 5 min buffer for more flexibility
      .map(gap => {
        const midPoint = gap.start + Math.floor(gap.duration / 2)
        const energyScore = energyLevels[Math.floor(midPoint / 60)] || 50
        
        // Prefer slots with higher energy
        let score = energyScore
        
        // Bonus for clustering with similar tasks
        const clusterBonus = taskClusters.some(cluster => 
          Math.abs(cluster.timeSlot - gap.start) < 60
        ) ? 20 : 0
        
        // Penalty for slots too close to end time
        const timeRemaining = analysis.endTimeMinutes - gap.start
        const timePenalty = timeRemaining < 60 ? -30 : 0
        
        // Bonus for afternoon slots if user is tired (energy <= 4)
        const afternoonBonus = userInput.energy <= 4 && gap.start >= 14 * 60 ? 15 : 0
        
        score += clusterBonus + timePenalty + afternoonBonus
        
        return {
          gap,
          score,
          energyScore,
          clusterBonus,
          reason: this.generateReason(energyScore, clusterBonus, afternoonBonus, userInput)
        }
      })
      .sort((a, b) => b.score - a.score)

    if (slots.length === 0) return null

    const bestSlot = slots[0]
    const startTimeMinutes = bestSlot.gap.start + 5 // Small buffer
    const endTimeMinutes = startTimeMinutes + taskDuration

    return {
      startTime: this.minutesToTime(startTimeMinutes),
      endTime: this.minutesToTime(endTimeMinutes),
      reason: bestSlot.reason
    }
  }

  private static generateReason(
    energyScore: number,
    clusterBonus: number,
    afternoonBonus: number,
    userInput: UserInput
  ): string {
    if (energyScore >= 80) {
      return "moved to your peak focus time for optimal performance"
    }
    if (clusterBonus > 0) {
      return "grouped with similar tasks for better workflow"
    }
    if (afternoonBonus > 0) {
      return "scheduled for afternoon when you have more energy"
    }
    if (userInput.mood === 'stressed') {
      return "moved to a calmer time slot to reduce pressure"
    }
    return "optimized for better work-life balance"
  }

  // Bulletproof method: always move task to the end of schedule
  private static moveTaskToEnd(
    schedule: ScheduleItem[],
    taskToReschedule: ScheduleItem,
    taskDuration: number,
    userInput: UserInput
  ): { startTime: string; endTime: string; reason: string } | null {
    console.log('📅 Moving task to end:', taskToReschedule.title)
    
    // Find all work tasks EXCEPT the one we're rescheduling
    const otherWorkTasks = schedule.filter(item => 
      item.type === 'work' && item.id !== taskToReschedule.id
    )
    
    console.log('📋 Other work tasks:', otherWorkTasks.length)
    
    let newStartMinutes: number
    
    if (otherWorkTasks.length === 0) {
      // No other tasks - place at current time or user's start time, whichever is later
      const currentTime = new Date()
      const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes()
      const userStartMinutes = this.timeToMinutes(userInput.startTime)
      newStartMinutes = Math.max(currentMinutes, userStartMinutes)
    } else {
      // Find the latest end time among all other work tasks
      const latestEndTime = otherWorkTasks.reduce((latest, task) => {
        const taskEndMinutes = this.timeToMinutes(task.endTime)
        return Math.max(latest, taskEndMinutes)
      }, 0)
      
      // Place the rescheduled task right after the latest task (with 5 min buffer)
      newStartMinutes = latestEndTime + 5
    }
    
    const newEndMinutes = newStartMinutes + taskDuration
    const userEndMinutes = this.timeToMinutes(userInput.endTime)
    
    console.log('⏰ New start time (minutes):', newStartMinutes)
    console.log('⏰ New end time (minutes):', newEndMinutes)
    console.log('⏰ User end time (minutes):', userEndMinutes)
    
    // Check if the task fits within the user's available time
    if (newEndMinutes > userEndMinutes) {
      console.log('❌ Task would end after user\'s end time')
      return null
    }
    
    const reason = otherWorkTasks.length === 0 
      ? "moved to start of your available time"
      : "moved to the end of your schedule"
    
    return {
      startTime: this.minutesToTime(newStartMinutes),
      endTime: this.minutesToTime(newEndMinutes),
      reason
    }
  }

  // Simple, reliable method to find an available slot
  private static findSimpleAvailableSlot(
    schedule: ScheduleItem[],
    taskToReschedule: ScheduleItem,
    taskDuration: number,
    userInput: UserInput
  ): { startTime: string; endTime: string; reason: string } | null {
    console.log('🔍 Simple reschedule: looking for slot for', taskToReschedule.title)
    
    // Remove the task we're rescheduling from consideration
    const otherTasks = schedule.filter(item => item.id !== taskToReschedule.id && item.type === 'work')
    
    // Sort by start time
    otherTasks.sort((a, b) => this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime))
    
    const currentTime = new Date()
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes()
    const endMinutes = this.timeToMinutes(userInput.endTime)
    
    console.log('⏰ Current time (minutes):', currentMinutes)
    console.log('⏰ End time (minutes):', endMinutes)
    console.log('📋 Other tasks:', otherTasks.map(t => ({ title: t.title, start: t.startTime, end: t.endTime })))
    
    // Strategy 1: Try to place at the end of the schedule
    if (otherTasks.length === 0) {
      // No other tasks, place right after current time
      const startMinutes = Math.max(currentMinutes + 5, this.timeToMinutes(userInput.startTime))
      if (startMinutes + taskDuration <= endMinutes) {
        return {
          startTime: this.minutesToTime(startMinutes),
          endTime: this.minutesToTime(startMinutes + taskDuration),
          reason: "moved to start of your available time"
        }
      }
    } else {
      // Try to place after the last task
      const lastTask = otherTasks[otherTasks.length - 1]
      const afterLastTask = this.timeToMinutes(lastTask.endTime) + 5 // 5 min buffer
      
      if (afterLastTask + taskDuration <= endMinutes) {
        return {
          startTime: this.minutesToTime(afterLastTask),
          endTime: this.minutesToTime(afterLastTask + taskDuration),
          reason: "moved to the end of your schedule"
        }
      }
      
      // Strategy 2: Find a gap between tasks
      for (let i = 0; i < otherTasks.length - 1; i++) {
        const currentTaskEnd = this.timeToMinutes(otherTasks[i].endTime)
        const nextTaskStart = this.timeToMinutes(otherTasks[i + 1].startTime)
        const gapDuration = nextTaskStart - currentTaskEnd
        
        if (gapDuration >= taskDuration + 10) { // 10 min total buffer
          const newStartTime = currentTaskEnd + 5
          return {
            startTime: this.minutesToTime(newStartTime),
            endTime: this.minutesToTime(newStartTime + taskDuration),
            reason: "moved to a gap between your tasks"
          }
        }
      }
      
      // Strategy 3: Place before the first task if there's space
      const firstTask = otherTasks[0]
      const beforeFirstTask = this.timeToMinutes(firstTask.startTime) - 5
      const earliestStart = Math.max(currentMinutes + 5, this.timeToMinutes(userInput.startTime))
      
      if (beforeFirstTask >= earliestStart + taskDuration) {
        return {
          startTime: this.minutesToTime(earliestStart),
          endTime: this.minutesToTime(earliestStart + taskDuration),
          reason: "moved to the beginning of your schedule"
        }
      }
    }
    
    console.log('❌ No available slot found')
    return null
  }

  // Fallback method: find any available slot without optimization
  private static findAnyAvailableSlot(
    analysis: any,
    taskDuration: number,
    userInput: UserInput
  ): { startTime: string; endTime: string; reason: string } | null {
    const { gaps } = analysis
    
    console.log('🔍 Looking for any available slot, task duration:', taskDuration)
    console.log('📊 Available gaps:', gaps)
    
    // Find the first gap that can fit the task (with minimal buffer)
    const suitableGap = gaps.find((gap: any) => gap.duration >= taskDuration + 5) // Only 5 min buffer
    
    if (!suitableGap) {
      console.log('❌ No gaps found that can fit the task')
      return null
    }
    
    console.log('✅ Found suitable gap:', suitableGap)
    
    const startTimeMinutes = suitableGap.start + 2 // Minimal buffer
    const endTimeMinutes = startTimeMinutes + taskDuration
    
    return {
      startTime: this.minutesToTime(startTimeMinutes),
      endTime: this.minutesToTime(endTimeMinutes),
      reason: "moved to an available time slot"
    }
  }

  private static createRescheduledSchedule(
    originalSchedule: ScheduleItem[],
    taskToReschedule: ScheduleItem,
    newSlot: { startTime: string; endTime: string },
    userInput: UserInput
  ): ScheduleItem[] {
    // Remove the original task
    let newSchedule = originalSchedule.filter(item => item.id !== taskToReschedule.id)
    
    // Create the rescheduled task
    const rescheduledTask: ScheduleItem = {
      ...taskToReschedule,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
      description: `${taskToReschedule.description} (rescheduled)`
    }
    
    // Insert the rescheduled task in the right position
    newSchedule.push(rescheduledTask)
    
    // Sort by start time
    newSchedule.sort((a, b) => 
      this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime)
    )
    
    // Add small breaks if needed
    return this.addAutomaticBreaks(newSchedule)
  }

  private static findTimeGaps(
    schedule: ScheduleItem[],
    startMinutes: number,
    endMinutes: number
  ): { start: number; end: number; duration: number }[] {
    const sortedItems = schedule
      .filter(item => this.timeToMinutes(item.startTime) >= startMinutes)
      .sort((a, b) => this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime))
    
    const gaps: { start: number; end: number; duration: number }[] = []
    
    let currentTime = Math.max(startMinutes, this.timeToMinutes(sortedItems[0]?.startTime) || startMinutes)
    
    for (const item of sortedItems) {
      const itemStart = this.timeToMinutes(item.startTime)
      const itemEnd = this.timeToMinutes(item.endTime)
      
      if (itemStart > currentTime) {
        gaps.push({
          start: currentTime,
          end: itemStart,
          duration: itemStart - currentTime
        })
      }
      
      currentTime = Math.max(currentTime, itemEnd)
    }
    
    // Add final gap if there's time left
    if (currentTime < endMinutes) {
      gaps.push({
        start: currentTime,
        end: endMinutes,
        duration: endMinutes - currentTime
      })
    }
    
    return gaps.filter(gap => gap.duration >= 20) // Only meaningful gaps
  }

  private static calculateEnergyLevels(
    userInput: UserInput,
    startMinutes: number,
    endMinutes: number
  ): { [hour: number]: number } {
    const energyLevels: { [hour: number]: number } = {}
    
    // Base energy curve (typical human energy patterns)
    const basePattern = {
      9: 80, 10: 85, 11: 90,  // Morning peak
      12: 70, 13: 60,         // Lunch dip
      14: 65, 15: 75, 16: 80, // Afternoon recovery
      17: 70, 18: 60, 19: 50  // Evening decline
    }
    
    for (let hour = Math.floor(startMinutes / 60); hour <= Math.floor(endMinutes / 60); hour++) {
      let energy = basePattern[hour] || 50
      
      // Adjust based on user's current energy level
      const energyMultiplier = userInput.energy / 7 // Normalize to ~1.0
      energy *= energyMultiplier
      
      // Adjust based on mood
      switch (userInput.mood) {
        case 'energized':
          energy += 15
          break
        case 'tired':
          energy -= 20
          break
        case 'stressed':
          energy -= 10
          break
      }
      
      energyLevels[hour] = Math.max(0, Math.min(100, energy))
    }
    
    return energyLevels
  }

  private static findTaskClusters(
    workItems: ScheduleItem[],
    taskToReschedule: ScheduleItem
  ) {
    // Simple clustering based on task name similarity or type
    return workItems
      .filter(item => this.areTasksSimilar(item, taskToReschedule))
      .map(item => ({
        task: item,
        timeSlot: this.timeToMinutes(item.startTime)
      }))
  }

  private static areTasksSimilar(task1: ScheduleItem, task2: ScheduleItem): boolean {
    const title1 = task1.title.toLowerCase()
    const title2 = task2.title.toLowerCase()
    
    // Check for common keywords
    const keywords1 = title1.split(' ')
    const keywords2 = title2.split(' ')
    
    return keywords1.some(word => 
      keywords2.includes(word) && word.length > 3
    )
  }

  private static addAutomaticBreaks(schedule: ScheduleItem[]): ScheduleItem[] {
    // Add small breaks between work sessions if missing
    const result: ScheduleItem[] = []
    
    for (let i = 0; i < schedule.length; i++) {
      result.push(schedule[i])
      
      const current = schedule[i]
      const next = schedule[i + 1]
      
      if (next && current.type === 'work' && next.type === 'work') {
        const currentEnd = this.timeToMinutes(current.endTime)
        const nextStart = this.timeToMinutes(next.startTime)
        
        // If there's no break between work items, add a micro-break
        if (nextStart - currentEnd < 10) {
          const breakStart = this.minutesToTime(currentEnd)
          const breakEnd = this.minutesToTime(currentEnd + 5)
          
          result.push({
            id: `auto-break-${current.id}-${next.id}`,
            taskId: '',
            startTime: breakStart,
            endTime: breakEnd,
            type: 'break',
            title: 'Quick Break',
            description: 'Automatic break between tasks'
          })
        }
      }
    }
    
    return result
  }

  // Utility methods
  private static calculateDuration(startTime: string, endTime: string): number {
    return this.timeToMinutes(endTime) - this.timeToMinutes(startTime)
  }

  private static timeToMinutes(timeString: string): number {
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