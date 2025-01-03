import { NextResponse } from 'next/server'
import { RateLimiter } from '@/lib/rate-limit'
import { removeBackgroundFromImageUrl, type RemoveBgResult } from "remove.bg"

export const maxDuration = 300 // 5 minutes
export const dynamic = 'force-dynamic'

type UserPlan = 'free' | 'basic' | 'premium'

export async function POST(req: Request) {
  try {
    // For now, we'll use a mock user ID and plan
    const userId = 'mock-user-id'
    const userPlan = 'free' as UserPlan

    // Check rate limit
    const rateLimiter = RateLimiter.getInstance()
    const { success, remaining, reset } = await rateLimiter.checkLimit(
      userId,
      userPlan,
      userPlan === 'premium' ? 'removebg' : 'tensorflow'
    )

    if (!success) {
      return new NextResponse('Rate limit exceeded', {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString()
        }
      })
    }

    // Get request data
    const data = await req.json()
    const { imageUrl, text, textStyle, quality, useRemoveBg } = data

    // Process image
    let processedImageUrl: string

    if (userPlan === 'premium' && useRemoveBg) {
      try {
        const result = await removeBackgroundFromImageUrl({
          url: imageUrl,
          apiKey: process.env.REMOVE_BG_API_KEY!,
          size: 'regular',
          type: 'auto'
        })
        
        processedImageUrl = `data:image/png;base64,${result.base64img}`
      } catch (error) {
        console.error('Remove.bg error:', error)
        // Fallback to TensorFlow.js
        processedImageUrl = await processTensorFlow(imageUrl, text, textStyle, quality)
      }
    } else {
      processedImageUrl = await processTensorFlow(imageUrl, text, textStyle, quality)
    }

    return NextResponse.json({ 
      url: processedImageUrl,
      remaining,
      reset
    })

  } catch (error) {
    console.error('Processing error:', error)
    return new NextResponse('Processing failed', { status: 500 })
  }
}

async function processTensorFlow(
  imageUrl: string,
  text: string,
  textStyle: any,
  quality: 'low' | 'medium' | 'high'
): Promise<string> {
  // For now, just return the original image
  // We'll implement the actual processing later
  return imageUrl
}
