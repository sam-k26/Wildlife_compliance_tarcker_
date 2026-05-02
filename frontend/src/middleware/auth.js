// backend/src/middleware/auth.js
export async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // For development, create a mock user
      req.user = {
        id: 'mock-user-id',
        email: 'dev@example.com',
        role: 'admin',
        isOfficer: true,
        isAdmin: true
      }
      return next()
    }
    
    // For production, validate token here
    const token = authHeader.split(' ')[1]
    
    // Mock user for now
    req.user = {
      id: 'mock-user-id',
      email: 'dev@example.com',
      role: 'admin',
      isOfficer: true,
      isAdmin: true
    }
    
    next()
  } catch (error) {
    console.error('Auth error:', error)
    req.user = {
      id: 'mock-user-id',
      email: 'dev@example.com',
      role: 'admin',
      isOfficer: true,
      isAdmin: true
    }
    next()
  }
}

export function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' })
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    
    next()
  }
}