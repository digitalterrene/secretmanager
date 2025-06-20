//lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "15 m"),
  analytics: true,
  prefix: "@upstash/ratelimit:secret-generator",
});

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};
