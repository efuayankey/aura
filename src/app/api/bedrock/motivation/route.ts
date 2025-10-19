import { NextRequest, NextResponse } from 'next/server'
import BedrockService from '@/lib/bedrockService'

export async function POST(request: NextRequest) {
  try {
    console.log('💪 Bedrock motivational message requested')
    
    const context = await request.json()
    console.log('📥 Motivation context:', context)

    // Determine time of day
    const hour = new Date().getHours()
    let timeOfDay: 'morning' | 'afternoon' | 'evening'
    if (hour < 12) timeOfDay = 'morning'
    else if (hour < 18) timeOfDay = 'afternoon'
    else timeOfDay = 'evening'

    const enhancedContext = {
      ...context,
      timeOfDay,
      currentTime: new Date().toLocaleTimeString()
    }

    // Generate motivational message using Bedrock Titan
    console.log('🤖 Calling Bedrock Titan for motivational message...')
    const message = await BedrockService.generateMotivationalMessage(enhancedContext)
    
    console.log('✅ Bedrock motivational message generated')
    
    return NextResponse.json({
      message: message.trim(),
      model: 'amazon-titan-text-express',
      context: enhancedContext,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Bedrock motivational message error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate motivational message',
        details: error.message
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Amazon Bedrock Motivation Generator',
    model: 'Titan Text Express',
    status: 'active',
    capabilities: [
      'Context-aware motivational messages',
      'Time-of-day personalization',
      'Progress-based encouragement',
      'Mood-adaptive messaging'
    ]
  })
}