// backend/src/middleware/rateLimiter.js
export const strictRateLimiter = (req, res, next) => {
  // Simple rate limiting mock
  // In production, use express-rate-limit
  next()
}

export const uploadRateLimiter = (req, res, next) => {
  next()
}