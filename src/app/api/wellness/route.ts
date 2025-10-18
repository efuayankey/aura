import { NextRequest, NextResponse } from 'next/server'
import { OpenAIScheduler } from '@/lib/openaiScheduler'

export async function POST(request: NextRequest) {
  try {
    const { mood, energy, completedTasks, totalTasks } = await request.json()
    
    const recommendation = await OpenAIScheduler.generateWellnessRecommendation(
      mood, energy, completedTasks, totalTasks
    )
    
    return NextResponse.json({ recommendation })
  } catch (error) {
    console.error('Wellness recommendation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate wellness recommendation' },
      { status: 500 }
    )
  }
}