import { NextRequest, NextResponse } from 'next/server'
import { OpenAIScheduler } from '@/lib/openaiScheduler'

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json()
    const { feedback, preferences, ...userInput } = requestData
    
    // If feedback/preferences are provided, it's a regeneration request
    if (feedback || preferences) {
      const schedule = await OpenAIScheduler.regenerateScheduleWithFeedback(
        userInput, 
        feedback, 
        preferences
      )
      return NextResponse.json({ schedule, regenerated: true })
    } else {
      // Normal schedule generation
      const schedule = await OpenAIScheduler.generateSchedule(userInput)
      return NextResponse.json({ schedule })
    }
  } catch (error) {
    console.error('Schedule generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate schedule' },
      { status: 500 }
    )
  }
}