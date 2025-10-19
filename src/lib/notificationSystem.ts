import { ScheduleItem } from '@/types'

export class NotificationSystem {
  private static reminderTimers: Map<string, NodeJS.Timeout> = new Map()
  private static isEnabled = false

  static async initialize(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      this.isEnabled = true
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      this.isEnabled = permission === 'granted'
      return this.isEnabled
    }

    return false
  }

  static scheduleTaskReminders(schedule: ScheduleItem[]) {
    // Clear existing reminders
    this.clearAllReminders()

    if (!this.isEnabled) return

    const now = new Date()
    
    schedule.forEach(item => {
      // Schedule start reminder (5 minutes before)
      const startTime = this.parseTimeToDate(item.startTime)
      const reminderTime = new Date(startTime.getTime() - 5 * 60 * 1000) // 5 minutes before
      
      if (reminderTime > now) {
        const timeoutId = setTimeout(() => {
          this.showTaskReminder(item, 'starting')
        }, reminderTime.getTime() - now.getTime())
        
        this.reminderTimers.set(`${item.id}-start`, timeoutId)
      }

      // Schedule end reminder (when task should end)
      const endTime = this.parseTimeToDate(item.endTime)
      
      if (endTime > now) {
        const timeoutId = setTimeout(() => {
          this.showTaskReminder(item, 'ending')
        }, endTime.getTime() - now.getTime())
        
        this.reminderTimers.set(`${item.id}-end`, timeoutId)
      }

      // Schedule wellness break reminders
      if (item.type === 'wellness' || item.type === 'break') {
        const breakStart = this.parseTimeToDate(item.startTime)
        
        if (breakStart > now) {
          const timeoutId = setTimeout(() => {
            this.showWellnessReminder(item)
          }, breakStart.getTime() - now.getTime())
          
          this.reminderTimers.set(`${item.id}-wellness`, timeoutId)
        }
      }
    })
  }

  static schedulePeriodicWellnessChecks() {
    if (!this.isEnabled) return

    // Check every 30 minutes
    const checkInterval = setInterval(() => {
      this.showWellnessCheck()
    }, 30 * 60 * 1000)

    this.reminderTimers.set('wellness-check', checkInterval as any)
  }

  private static showTaskReminder(item: ScheduleItem, phase: 'starting' | 'ending') {
    if (!this.isEnabled) return

    const title = phase === 'starting' 
      ? `Time to start: ${item.title}`
      : `Time to wrap up: ${item.title}`
    
    const body = phase === 'starting'
      ? `Your ${item.type} session begins in 5 minutes. Get ready!`
      : `Your ${item.type} session should be ending now. Great work!`

    const icon = this.getTaskIcon(item.type)

    new Notification(title, {
      body,
      icon,
      tag: `aura-${item.id}-${phase}`,
      requireInteraction: false,
      silent: false
    })

    // Optional: Play a subtle sound
    this.playNotificationSound(item.type)
  }

  private static showWellnessReminder(item: ScheduleItem) {
    if (!this.isEnabled) return

    const title = "Time for wellness 🌿"
    const body = `It's time for your ${item.title.toLowerCase()}. Your wellbeing matters!`
    
    new Notification(title, {
      body,
      icon: '/icons/wellness-icon.png',
      tag: `aura-wellness-${item.id}`,
      requireInteraction: false
    })

    this.playNotificationSound('wellness')
  }

  private static showWellnessCheck() {
    if (!this.isEnabled) return

    const title = "AURA Wellness Check"
    const body = "How are you feeling? Remember to take breaks and stay hydrated!"
    
    new Notification(title, {
      body,
      icon: '/icons/aura-icon.png',
      tag: 'aura-wellness-check',
      requireInteraction: false
    })
  }

  static showSuccessNotification(message: string) {
    if (!this.isEnabled) return

    new Notification("Great job! 🎉", {
      body: message,
      icon: '/icons/success-icon.png',
      tag: 'aura-success',
      requireInteraction: false
    })

    this.playNotificationSound('success')
  }

  static showMotivationNotification(message: string) {
    if (!this.isEnabled) return

    new Notification("You've got this! 💪", {
      body: message,
      icon: '/icons/motivation-icon.png',
      tag: 'aura-motivation',
      requireInteraction: false
    })
  }

  private static getTaskIcon(type: ScheduleItem['type']): string {
    switch (type) {
      case 'work':
        return '/icons/work-icon.png'
      case 'break':
        return '/icons/break-icon.png'
      case 'wellness':
        return '/icons/wellness-icon.png'
      default:
        return '/icons/aura-icon.png'
    }
  }

  private static playNotificationSound(type: string) {
    try {
      // Create different sounds for different notification types
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Generate a subtle notification tone
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Different frequencies for different types
      const frequencies = {
        work: 440,       // A note
        break: 523.25,   // C note
        wellness: 392,   // G note
        success: 659.25  // E note
      }
      
      oscillator.frequency.value = frequencies[type as keyof typeof frequencies] || 440
      oscillator.type = 'sine'
      
      // Gentle volume envelope
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
      
    } catch (error) {
      // Fallback: silent notification if audio fails
      console.log('Audio notification failed:', error)
    }
  }

  private static parseTimeToDate(timeString: string): Date {
    const today = new Date()
    
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
    
    const targetDate = new Date(today)
    targetDate.setHours(hours, minutes, 0, 0)
    
    // If the time has passed today, assume it's for tomorrow
    if (targetDate < today) {
      targetDate.setDate(targetDate.getDate() + 1)
    }
    
    return targetDate
  }

  static clearAllReminders() {
    this.reminderTimers.forEach(timer => {
      clearTimeout(timer)
    })
    this.reminderTimers.clear()
  }

  static clearTaskReminder(itemId: string) {
    const startKey = `${itemId}-start`
    const endKey = `${itemId}-end`
    const wellnessKey = `${itemId}-wellness`
    
    if (this.reminderTimers.has(startKey)) {
      clearTimeout(this.reminderTimers.get(startKey)!)
      this.reminderTimers.delete(startKey)
    }
    
    if (this.reminderTimers.has(endKey)) {
      clearTimeout(this.reminderTimers.get(endKey)!)
      this.reminderTimers.delete(endKey)
    }
    
    if (this.reminderTimers.has(wellnessKey)) {
      clearTimeout(this.reminderTimers.get(wellnessKey)!)
      this.reminderTimers.delete(wellnessKey)
    }
  }

  static getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied'
    }
    return Notification.permission
  }

  static isSupported(): boolean {
    return 'Notification' in window
  }

  static isActive(): boolean {
    return this.isEnabled
  }
}