import { NextRequest, NextResponse } from 'next/server'
import { UserSessionManager } from '@/lib/userSession'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '7')

    const plans = await UserSessionManager.getRecentPlans(limit)
    const insights = await UserSessionManager.getWellnessInsights()

    return NextResponse.json({ 
      plans,
      insights
    })
  } catch (error) {
    console.error('Error getting user history:', error)
    return NextResponse.json(
      { error: 'Failed to get user history' },
      { status: 500 }
    )
  }
}