import { NextRequest, NextResponse } from 'next/server'
import { UserSessionManager } from '@/lib/userSession'

export async function GET(request: NextRequest) {
  try {
    const plan = await UserSessionManager.getTodaysPlan()
    return NextResponse.json({ plan })
  } catch (error) {
    console.error('Error getting daily plan:', error)
    return NextResponse.json(
      { error: 'Failed to get daily plan' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      schedule, 
      userInput, 
      balanceScore, 
      completedTasks = [], 
      skippedTasks = [], 
      wellnessActivities = 0 
    } = await request.json()

    await UserSessionManager.saveDailyPlan(
      schedule,
      userInput,
      balanceScore,
      completedTasks,
      skippedTasks,
      wellnessActivities
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving daily plan:', error)
    return NextResponse.json(
      { error: 'Failed to save daily plan' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { 
      completedTasks, 
      skippedTasks, 
      newSchedule, 
      newScore, 
      wellnessActivities 
    } = await request.json()

    await UserSessionManager.updateProgress(
      completedTasks,
      skippedTasks,
      newSchedule,
      newScore,
      wellnessActivities
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}