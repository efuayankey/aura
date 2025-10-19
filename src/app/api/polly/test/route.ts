import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🧪 Testing Polly configuration...')
    
    // Check environment variables
    const hasAccessKey = !!process.env.AWS_ACCESS_KEY_ID
    const hasSecretKey = !!process.env.AWS_SECRET_ACCESS_KEY
    const region = process.env.AWS_REGION || 'us-east-1'
    
    console.log('🔍 Polly config check:', {
      hasAccessKey,
      hasSecretKey, 
      region
    })
    
    if (!hasAccessKey || !hasSecretKey) {
      return NextResponse.json({
        status: 'failed',
        error: 'Missing AWS credentials',
        hasAccessKey,
        hasSecretKey,
        region
      })
    }

    // Try to import and test Polly
    try {
      const { PollyService } = await import('@/lib/pollyService')
      const isAvailable = await PollyService.isPollyAvailable()
      
      return NextResponse.json({
        status: isAvailable ? 'working' : 'failed',
        pollyAvailable: isAvailable,
        hasAccessKey,
        hasSecretKey,
        region,
        message: isAvailable ? 'Polly is working!' : 'Polly authentication failed'
      })
      
    } catch (pollyError) {
      console.error('❌ Polly service error:', pollyError)
      return NextResponse.json({
        status: 'failed',
        error: 'Polly service error',
        details: pollyError.message,
        hasAccessKey,
        hasSecretKey,
        region
      })
    }
    
  } catch (error) {
    console.error('❌ Polly test error:', error)
    return NextResponse.json({
      status: 'failed',
      error: 'Test failed',
      details: error.message
    })
  }
}