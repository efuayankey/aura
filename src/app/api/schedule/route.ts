import { NextRequest, NextResponse } from 'next/server'
import { OpenAIScheduler } from '@/lib/openaiScheduler'

export async function POST(request: NextRequest) {
  try {
    const userInput = await request.json()
    
    const schedule = await OpenAIScheduler.generateSchedule(userInput)
    
    return NextResponse.json({ schedule })
  } catch (error) {
    console.error('Schedule generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate schedule' },
      { status: 500 }
    )
  }
}