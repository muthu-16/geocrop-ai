import rateLimit from 'express-rate-limit';

// Strict 10 requests per 1 second per IP rate limiter
export const strict10ReqPerSecLimiter = rateLimit({
  windowMs: 1000, // 1 second window
  max: 10, // Max 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'RATE_LIMIT_EXCEEDED',
    error: 'Rate limit exceeded (429 Too Many Requests). Maximum 10 requests per second allowed per IP.'
  }
});
