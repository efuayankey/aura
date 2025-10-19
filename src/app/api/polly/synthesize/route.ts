import { NextRequest, NextResponse } from 'next/server'
import { PollyService } from '@/lib/pollyService'

export async function POST(request: NextRequest) {
  try {
    const { text, type = 'custom' } = await request.json()
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text parameter is required' },
        { status: 400 }
      )
    }

    // Generate appropriate text based on type
    let speechText = text
    
    if (type === 'schedule-summary' && typeof text === 'object') {
      speechText = PollyService.generateScheduleSummary(text.schedule, text.userName)
    } else if (type === 'task-reminder' && typeof text === 'object') {
      speechText = PollyService.generateTaskReminder(text.taskTitle, text.timeRemaining)
    } else if (type === 'motivational' && typeof text === 'object') {
      speechText = PollyService.generateMotivationalMessage(text.completedTasks, text.totalTasks)
    } else if (type === 'wellness' && typeof text === 'object') {
      speechText = PollyService.generateWellnessReminder(text.activityType)
    }

    console.log('🎤 Synthesizing speech:', speechText.substring(0, 100) + '...')
    
    const audioUrl = await PollyService.synthesizeSpeech(speechText)
    
    if (!audioUrl) {
      console.error('❌ Polly synthesis returned null')
      return NextResponse.json(
        { error: 'Failed to synthesize speech - Polly service unavailable' },
        { status: 500 }
      )
    }
    
    console.log('✅ Speech synthesis successful')

    return NextResponse.json({ 
      audioUrl,
      text: speechText
    })
  } catch (error) {
    console.error('Polly synthesis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const isAvailable = await PollyService.isPollyAvailable()
    return NextResponse.json({ available: isAvailable })
  } catch (error) {
    console.error('Polly availability check error:', error)
    return NextResponse.json({ available: false })
  }
}