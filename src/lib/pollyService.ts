import { PollyClient, SynthesizeSpeechCommand, OutputFormat, VoiceId } from '@aws-sdk/client-polly'

const client = new PollyClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
})

export class PollyService {
  private static readonly VOICE_ID: VoiceId = 'Joanna' // Natural, friendly female voice
  private static readonly OUTPUT_FORMAT: OutputFormat = 'mp3'

  // Convert text to speech and return audio URL
  static async synthesizeSpeech(text: string): Promise<string | null> {
    try {
      console.log('🔊 Polly: Starting synthesis...')
      
      const command = new SynthesizeSpeechCommand({
        Text: text,
        OutputFormat: this.OUTPUT_FORMAT,
        VoiceId: this.VOICE_ID,
        Engine: 'neural' // Use neural engine for more natural speech
      })

      console.log('🔊 Polly: Sending command to AWS...')
      const response = await client.send(command)
      console.log('🔊 Polly: Got response from AWS')
      
      if (response.AudioStream) {
        console.log('🔊 Polly: Processing audio stream...')
        // Convert the audio stream to a blob URL for playback
        const audioBuffer = await this.streamToBuffer(response.AudioStream)
        const blob = new Blob([audioBuffer], { type: 'audio/mpeg' })
        const audioUrl = URL.createObjectURL(blob)
        console.log('🔊 Polly: Audio URL created successfully')
        return audioUrl
      }
      
      console.log('❌ Polly: No AudioStream in response')
      return null
    } catch (error) {
      console.error('❌ Polly synthesis error:', error)
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        code: error.code || 'unknown'
      })
      return null
    }
  }

  // Generate schedule summary for voice read-out
  static generateScheduleSummary(schedule: any[], userName?: string): string {
    const greeting = userName ? `Hi ${userName}` : 'Hi there'
    const workItems = schedule.filter(item => item.type === 'work')
    
    if (workItems.length === 0) {
      return `${greeting}! Your schedule is clear for now. Enjoy your free time!`
    }

    let summary = `${greeting}! Here's your schedule for today. `
    
    if (workItems.length === 1) {
      const item = workItems[0]
      summary += `You have one task: ${item.title}, scheduled from ${item.startTime} to ${item.endTime}. `
    } else {
      summary += `You have ${workItems.length} tasks planned. `
      
      // Mention first few tasks
      const firstTasks = workItems.slice(0, 3)
      firstTasks.forEach((item, index) => {
        if (index === 0) {
          summary += `Starting with ${item.title} at ${item.startTime}. `
        } else if (index === firstTasks.length - 1 && workItems.length <= 3) {
          summary += `And finally, ${item.title} at ${item.startTime}. `
        } else {
          summary += `Then ${item.title} at ${item.startTime}. `
        }
      })
      
      if (workItems.length > 3) {
        summary += `And ${workItems.length - 3} more tasks throughout the day. `
      }
    }
    
    // Add wellness reminder
    const hasBreaks = schedule.some(item => item.type === 'break' || item.type === 'wellness')
    if (hasBreaks) {
      summary += 'I\'ve also included some wellness breaks to keep you balanced. '
    }
    
    summary += 'You\'ve got this! Let me know if you need to reschedule anything.'
    
    return summary
  }

  // Generate task reminder text
  static generateTaskReminder(taskTitle: string, timeRemaining: number): string {
    const minutes = Math.round(timeRemaining)
    
    if (minutes <= 0) {
      return `Time to start ${taskTitle}! You've got this.`
    } else if (minutes <= 5) {
      return `${taskTitle} starts in ${minutes} minutes. Get ready!`
    } else if (minutes <= 15) {
      return `Heads up! ${taskTitle} starts in ${minutes} minutes.`
    } else {
      return `Reminder: ${taskTitle} is coming up in ${minutes} minutes.`
    }
  }

  // Generate motivational messages
  static generateMotivationalMessage(completedTasks: number, totalTasks: number): string {
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    
    if (progress === 0) {
      return "Ready to start your productive day? You've got this!"
    } else if (progress < 25) {
      return "Great start! Keep up the momentum."
    } else if (progress < 50) {
      return "You're making solid progress! Keep going strong."
    } else if (progress < 75) {
      return "Excellent work! You're more than halfway there."
    } else if (progress < 100) {
      return "Amazing progress! You're almost done for the day."
    } else {
      return "Incredible! You've completed all your tasks. Time to celebrate your productive day!"
    }
  }

  // Generate wellness reminder
  static generateWellnessReminder(activityType: string): string {
    switch (activityType) {
      case 'breathing':
        return 'Time for a quick breathing break. Take three deep breaths and reset your focus.'
      case 'stretching':
        return 'Let\'s take a moment to stretch. Roll your shoulders, stretch your neck, and get your body moving.'
      case 'hydration':
        return 'Hydration check! Grab some water and give your body the fuel it needs.'
      case 'walk':
        return 'Time for a short walk. Step away from your workspace and get some fresh air.'
      default:
        return 'Time for a wellness break. Take care of yourself - you deserve it!'
    }
  }

  // Play audio with error handling
  static async playAudio(audioUrl: string): Promise<boolean> {
    try {
      const audio = new Audio(audioUrl)
      
      // Add event listeners for better error handling
      return new Promise((resolve, reject) => {
        audio.addEventListener('loadeddata', () => {
          console.log('🔊 Audio loaded successfully')
          audio.play()
            .then(() => resolve(true))
            .catch(reject)
        })
        
        audio.addEventListener('error', (e) => {
          console.error('Audio playback error:', e)
          reject(e)
        })
        
        audio.addEventListener('ended', () => {
          console.log('🔊 Audio playback completed')
          URL.revokeObjectURL(audioUrl) // Clean up blob URL
        })
        
        // Start loading the audio
        audio.load()
      })
    } catch (error) {
      console.error('Error playing audio:', error)
      return false
    }
  }

  // Utility function to convert stream to buffer
  private static async streamToBuffer(stream: any): Promise<Uint8Array> {
    const chunks: Uint8Array[] = []
    
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Uint8Array) => chunks.push(chunk))
      stream.on('error', reject)
      stream.on('end', () => {
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
        const buffer = new Uint8Array(totalLength)
        let offset = 0
        
        for (const chunk of chunks) {
          buffer.set(chunk, offset)
          offset += chunk.length
        }
        
        resolve(buffer)
      })
    })
  }

  // Check if Polly is available
  static async isPollyAvailable(): Promise<boolean> {
    try {
      const testCommand = new SynthesizeSpeechCommand({
        Text: 'test',
        OutputFormat: this.OUTPUT_FORMAT,
        VoiceId: this.VOICE_ID
      })
      
      await client.send(testCommand)
      return true
    } catch (error) {
      console.warn('Polly not available:', error)
      return false
    }
  }
}