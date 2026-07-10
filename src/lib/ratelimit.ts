import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { NextRequest } from 'next/server';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const isConfigured = Boolean(redisUrl && redisToken);

const redis = isConfigured ? new Redis({
  url: redisUrl as string,
  token: redisToken as string,
}) : null;

// Different tiers of rate limiting
export const rateLimiters = {
  // Strict: For Login, Register (5 requests per 15 minutes)
  auth: isConfigured ? new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    analytics: true,
  }) : null,

  // Spin: 1 request per 10 seconds to prevent macro double clicks
  spin: isConfigured ? new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(1, '10 s'),
    analytics: true,
  }) : null,

  // Global/Standard API protection (100 req per minute)
  global: isConfigured ? new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
  }) : null,
  
  // Admin: Stricter than global, e.g. 50 req per minute
  admin: isConfigured ? new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(50, '1 m'),
    analytics: true,
  }) : null,
};

// Helper function to get IP
export function getIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1'; // Fallback
}
