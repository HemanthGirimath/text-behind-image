import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import { Plan } from '@/types/plans'

// Create Redis instance
const redis = Redis.fromEnv()

const LIMITS = {
  free: { requests: 10, duration: '1 h' },
  basic: { requests: 50, duration: '1 h' },
  premium: { 
    tensorflow: { requests: 200, duration: '1 h' },
    removebg: { requests: 50, duration: '30 d' }
  }
}

export class RateLimiter {
  private static instance: RateLimiter
  private limiters: Record<string, Ratelimit>

  private constructor() {
    this.limiters = {
      free: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(LIMITS.free.requests, LIMITS.free.duration),
        prefix: 'ratelimit:free'
      }),
      basic: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(LIMITS.basic.requests, LIMITS.basic.duration),
        prefix: 'ratelimit:basic'
      }),
      premium_tf: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(LIMITS.premium.tensorflow.requests, LIMITS.premium.tensorflow.duration),
        prefix: 'ratelimit:premium:tf'
      }),
      premium_rb: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(LIMITS.premium.removebg.requests, LIMITS.premium.removebg.duration),
        prefix: 'ratelimit:premium:rb'
      })
    }
  }

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter()
    }
    return RateLimiter.instance
  }

  async checkLimit(userId: string, plan: Plan, service: 'tensorflow' | 'removebg' = 'tensorflow') {
    const limiter = this.getLimiter(plan, service)
    const { success, reset, remaining } = await limiter.limit(userId)
    
    return {
      success,
      reset,
      remaining,
      limit: this.getLimit(plan, service)
    }
  }

  private getLimiter(plan: Plan, service: 'tensorflow' | 'removebg'): Ratelimit {
    if (plan === 'premium' && service === 'removebg') {
      return this.limiters.premium_rb
    }
    if (plan === 'premium') {
      return this.limiters.premium_tf
    }
    if (plan === 'basic') {
      return this.limiters.basic
    }
    return this.limiters.free
  }

  private getLimit(plan: Plan, service: 'tensorflow' | 'removebg'): number {
    if (plan === 'premium' && service === 'removebg') {
      return LIMITS.premium.removebg.requests
    }
    if (plan === 'premium') {
      return LIMITS.premium.tensorflow.requests
    }
    if (plan === 'basic') {
      return LIMITS.basic.requests
    }
    return LIMITS.free.requests
  }
}
