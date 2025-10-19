import { NextRequest, NextResponse } from 'next/server'
import BedrockService from '@/lib/bedrockService'

export async function POST(request: NextRequest) {
  try {
    console.log('🧘 Bedrock wellness recommendation requested')
    
    const context = await request.json()
    console.log('📥 Wellness context:', context)

    // Generate wellness recommendation using Bedrock
    console.log('🤖 Calling Bedrock Claude for wellness recommendation...')
    const recommendation = await BedrockService.generateWellnessRecommendation(context)
    
    console.log('✅ Bedrock wellness recommendation generated:', recommendation.activity)
    
    return NextResponse.json({
      ...recommendation,
      model: 'amazon-bedrock-claude-haiku',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Bedrock wellness recommendation error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate wellness recommendation',
        details: error.message
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Amazon Bedrock Wellness Coach',
    model: 'Claude Haiku',
    status: 'active',
    capabilities: [
      'Personalized wellness activities',
      'Stress-level adaptive recommendations',
      'Energy-based activity selection',
      'Contextual mindfulness guidance'
    ]
  })
}