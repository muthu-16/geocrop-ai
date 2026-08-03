// ============================================================
// TOKEN BUCKET & SLIDING WINDOW RATE LIMITER ENGINE
// Limit: Maximum 10 requests per 1000ms (1 second)
// ============================================================

class RateLimiter {
  constructor(maxRequestsPerSecond = 10) {
    this.maxRequests = maxRequestsPerSecond; // 10 requests / sec limit
    this.windowMs = 1000; // 1 second sliding window
    this.requestTimestamps = [];
  }

  /**
   * Cleans up expired timestamps older than 1 second
   */
  _cleanExpired() {
    const now = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter(
      (timestamp) => now - timestamp < this.windowMs
    );
  }

  /**
   * Get current request count in the active 1-second window
   */
  getCurrentRate() {
    this._cleanExpired();
    return this.requestTimestamps.length;
  }

  /**
   * Check if a request is allowed under the 10 req/sec rate limit
   * @returns {Object} { allowed: boolean, currentRate: number, retryAfterMs: number }
   */
  checkLimit() {
    this._cleanExpired();
    const now = Date.now();

    if (this.requestTimestamps.length >= this.maxRequests) {
      const oldestRequest = this.requestTimestamps[0];
      const retryAfterMs = Math.max(0, this.windowMs - (now - oldestRequest));
      return {
        allowed: false,
        currentRate: this.requestTimestamps.length,
        retryAfterMs,
        messageEn: `Rate limit exceeded (429 Too Many Requests). Max ${this.maxRequests} logins per second allowed.`,
        messageTa: `அளவுக்கு அதிகமான கோரிக்கைகள் (429). வினாடிக்கு அதிகபட்சம் ${this.maxRequests} உள்நுழைவுகள் மட்டுமே அனுமதி.`
      };
    }

    // Register timestamp for this request
    this.requestTimestamps.push(now);
    return {
      allowed: true,
      currentRate: this.requestTimestamps.length,
      retryAfterMs: 0
    };
  }

  /**
   * Resets the rate limiter window (useful for testing)
   */
  reset() {
    this.requestTimestamps = [];
  }
}

// Export singleton instance initialized to 10 requests per second
export const loginRateLimiter = new RateLimiter(10);
