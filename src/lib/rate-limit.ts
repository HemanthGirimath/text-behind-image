import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import { Plan } from '@/types/plans'

// Create Redis instance
const redis = Redis.fromEnv()

// Define durations in milliseconds for Ratelimit
const HOUR = 60 * 60 * 1000 // 1 hour in ms
const MONTH = 30 * 24 * 60 * 60 * 1000 // 30 days in ms

const LIMITS = {
  free: { requests: 10, duration: HOUR },
  basic: { requests: 50, duration: HOUR },
  premium: { 
    tensorflow: { requests: 200, duration: HOUR },
    removebg: { requests: 50, duration: MONTH }
  }
}

export class RateLimiter {
  private static instance: RateLimiter

  private constructor() {}

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter()
    }
    return RateLimiter.instance
  }

  async checkLimit(userId: string, plan: Plan, service: 'tensorflow' | 'removebg' = 'tensorflow') {
    // Temporarily disabled rate limiting
    return {
      success: true,
      reset: new Date(Date.now() + 3600000), // 1 hour from now
      remaining: 999,
      limit: 1000
    }
  }

  private getLimit(plan: Plan, service: 'tensorflow' | 'removebg'): number {
    return 1000 // Temporary unlimited value
  }

  private getLimiter(plan: Plan, service: 'tensorflow' | 'removebg') {
    return {
      limit: async (userId: string) => ({
        success: true,
        reset: new Date(Date.now() + 3600000),
        remaining: 999
      })
    }
  }
}
