/**
 * Simple in-memory rate limiting implementation
 * Note: This is for development only. Use Redis in production.
 */

// Rename the Map to avoid naming conflict with the function
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const WINDOW_SIZE = 3600; // 1 hour in seconds
const MAX_REQUESTS = 10;

interface RateLimitResponse {
  success: boolean;
  message?: string;
}

/**
 * Check if a user has exceeded their rate limit
 * @param userId - The ID of the user to check
 * @returns A promise that resolves to the rate limit status
 */
export async function rateLimit(userId: string): Promise<RateLimitResponse> {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, {
      count: 1,
      resetTime: now + WINDOW_SIZE * 1000
    });
    return { success: true };
  }

  if (userLimit.count >= MAX_REQUESTS) {
    return {
      success: false,
      message: 'Rate limit exceeded. Please try again later.'
    };
  }

  userLimit.count += 1;
  return { success: true };
} 