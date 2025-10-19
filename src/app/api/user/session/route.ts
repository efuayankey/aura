import { NextRequest, NextResponse } from 'next/server'
import { UserSessionManager } from '@/lib/userSession'

export async function GET(request: NextRequest) {
  try {
    const session = await UserSessionManager.getUserSession()
    return NextResponse.json({ session })
  } catch (error) {
    console.error('Error getting user session:', error)
    return NextResponse.json(
      { error: 'Failed to get user session' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { todayScore } = await request.json()
    
    if (typeof todayScore !== 'number') {
      return NextResponse.json(
        { error: 'todayScore must be a number' },
        { status: 400 }
      )
    }

    const updatedSession = await UserSessionManager.updateUserStats(todayScore)
    return NextResponse.json({ session: updatedSession })
  } catch (error) {
    console.error('Error updating user stats:', error)
    return NextResponse.json(
      { error: 'Failed to update user stats' },
      { status: 500 }
    )
  }
}