//lib/types.ts
export type GenerateSecretRequest = {
  phrase: string;
  timestamp: string;
};

export type GenerateSecretResponse = {
  secret?: string;
  phrase?: string;
  timestamp?: string;
  error?: string;
};

export type RateLimitHeaders = {
  "X-RateLimit-Limit": string;
  "X-RateLimit-Remaining": string;
  "X-RateLimit-Reset": string;
};
