import { NextRequest, NextResponse } from 'next/server'
import BedrockService from '@/lib/bedrockService'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Bedrock schedule generation requested')
    
    const userInput = await request.json()
    console.log('📥 User input:', userInput)

    // Validate required fields
    if (!userInput.tasks || !userInput.startTime || !userInput.endTime) {
      return NextResponse.json(
        { error: 'Missing required fields: tasks, startTime, endTime' },
        { status: 400 }
      )
    }

    // Generate schedule using Bedrock Claude
    console.log('🤖 Calling Bedrock Claude for schedule generation...')
    const schedule = await BedrockService.generateSchedule(userInput)
    
    console.log('✅ Bedrock schedule generated:', schedule.length, 'items')
    
    return NextResponse.json({
      schedule,
      model: 'amazon-bedrock-claude-sonnet',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Bedrock schedule generation error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate schedule with Bedrock',
        details: error.message,
        fallback: true
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Amazon Bedrock Schedule Generator',
    models: ['Claude Sonnet', 'Claude Haiku'],
    status: 'active',
    capabilities: [
      'Intelligent schedule optimization',
      'Wellness-focused planning', 
      'Context-aware recommendations',
      'Multi-model AI processing'
    ]
  })
}