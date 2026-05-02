import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3000
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const allowedOrigins = new Set([
  FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
])
const users = [
  {
    id: 'usr-officer-001',
    name: 'Compliance Officer',
    email: 'officer@wildlife.local',
    password: 'Wildlife@123',
    role: 'Trade Review'
  },
  {
    id: 'usr-admin-001',
    name: 'Admin Reviewer',
    email: 'admin@wildlife.local',
    password: 'Admin@123',
    role: 'Administrator'
  }
]

// Middleware
app.use(cors({
  origin(origin, callback) {
    const isLocalDev = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || '')
    if (!origin || allowedOrigins.has(origin) || isLocalDev) {
      callback(null, true)
      return
    }
    callback(new Error(`CORS blocked origin: ${origin}`))
  },
  credentials: true
}))
app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend API is working!',
    service: 'Wildlife Compliance Tracker API',
    endpoints: [
      'GET /health',
      'GET /api/test',
      'POST /api/validate',
      'GET /api/shipments',
      'GET /api/statistics'
    ]
  })
})

app.post('/api/auth/login', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')
  const user = users.find((candidate) =>
    candidate.email.toLowerCase() === email && candidate.password === password
  )

  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  const { password: _password, ...safeUser } = user
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    issuedAt: new Date().toISOString()
  }

  res.json({
    user: safeUser,
    token: Buffer.from(JSON.stringify(tokenPayload)).toString('base64url')
  })
})

app.post('/api/auth/register', (req, res) => {
  const name = String(req.body.name || '').trim()
  const email = String(req.body.email || '').trim().toLowerCase()
  const company = String(req.body.company || '').trim()
  const password = String(req.body.password || '')

  if (!name || !email || !company || !password) {
    res.status(400).json({ error: 'All account fields are required' })
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Enter a valid email address' })
    return
  }

  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' })
    return
  }

  if (users.some((user) => user.email.toLowerCase() === email)) {
    res.status(409).json({ error: 'An account with this email already exists' })
    return
  }

  const user = {
    id: `usr-${Date.now()}`,
    name,
    email,
    password,
    role: 'Trade Review',
    company
  }

  users.push(user)

  const { password: _password, ...safeUser } = user
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    issuedAt: new Date().toISOString()
  }

  res.status(201).json({
    user: safeUser,
    token: Buffer.from(JSON.stringify(tokenPayload)).toString('base64url')
  })
})

app.post('/api/auth/google', async (req, res) => {
  const credential = String(req.body.credential || '')
  const expectedClientId = GOOGLE_CLIENT_ID || String(req.body.clientId || '')

  if (!expectedClientId) {
    res.status(500).json({ error: 'Google login is not configured' })
    return
  }

  if (!credential) {
    res.status(400).json({ error: 'Missing Google credential' })
    return
  }

  try {
    const verificationResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    )

    if (!verificationResponse.ok) {
      res.status(401).json({ error: 'Google token verification failed' })
      return
    }

    const profile = await verificationResponse.json()

    if (profile.aud !== expectedClientId) {
      res.status(401).json({ error: 'Google token audience does not match this app' })
      return
    }

    if (profile.email_verified !== 'true' && profile.email_verified !== true) {
      res.status(401).json({ error: 'Google email is not verified' })
      return
    }

    const user = {
      id: `google-${profile.sub}`,
      name: profile.name || profile.email,
      email: profile.email,
      role: 'Google User',
      picture: profile.picture
    }
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      provider: 'google',
      issuedAt: new Date().toISOString()
    }

    res.json({
      user,
      token: Buffer.from(JSON.stringify(tokenPayload)).toString('base64url')
    })
  } catch (error) {
    res.status(502).json({ error: 'Unable to verify Google login right now' })
  }
})

// Validation endpoint (mock for now)
app.post('/api/validate', (req, res) => {
  const {
    species_name = 'Unknown species',
    quantity = 0,
    origin_country = 'Unknown',
    destination_country = 'Unknown',
    permit_number = ''
  } = req.body

  const normalizedQuantity = Number(quantity) || 0
  const hasPermit = permit_number.trim().length > 0
  const normalizedSpecies = species_name.toLowerCase().trim()
  const normalizedOrigin = origin_country.toLowerCase().trim()
  const normalizedDestination = destination_country.toLowerCase().trim()
  const permitPattern = /^CITES-[A-Z]{3}-\d{4}$/i
  const hasValidPermitFormat = hasPermit && permitPattern.test(permit_number.trim())
  const commonLivestock = ['cow', 'cattle', 'goat', 'sheep', 'pig', 'chicken', 'buffalo', 'horse', 'camel']
  const protectedSpeciesRules = [
    { label: 'peacock', terms: ['peacock', 'peakock', 'peafowl', 'indian peafowl'], score: 35 },
    { label: 'tiger', terms: ['tiger'], score: 40 },
    { label: 'pangolin', terms: ['pangolin'], score: 38 },
    { label: 'rhino', terms: ['rhino', 'rhinoceros'], score: 42 },
    { label: 'ivory', terms: ['ivory', 'elephant tusk'], score: 45 },
    { label: 'tortoise', terms: ['tortoise', 'star tortoise'], score: 35 },
    { label: 'coral', terms: ['coral'], score: 28 }
  ]
  const matchedSpeciesRule = protectedSpeciesRules.find((rule) =>
    rule.terms.some((term) => normalizedSpecies.includes(term))
  )
  const hasLikelyMisspelling = ['peakock', 'pecock', 'peacok'].some((term) =>
    normalizedSpecies.includes(term)
  )
  const isLivestock = commonLivestock.some((term) => normalizedSpecies === term || normalizedSpecies.includes(term))
  const isUnknownWildlife = !isLivestock && !matchedSpeciesRule && normalizedSpecies.length > 0
  const isSensitiveRoute = (
    (normalizedOrigin.includes('pakistan') && normalizedDestination.includes('india')) ||
    (normalizedOrigin.includes('india') && normalizedDestination.includes('pakistan'))
  )
  const quantityRisk = matchedSpeciesRule
    ? (normalizedQuantity > 100 ? 28 : normalizedQuantity > 50 ? 20 : normalizedQuantity > 10 ? 8 : 0)
    : (isUnknownWildlife && normalizedQuantity > 50 ? 12 : 0)
  const permitRisk = !hasPermit ? 26 : hasValidPermitFormat ? 0 : 8
  const routeRisk = (matchedSpeciesRule || isUnknownWildlife) && isSensitiveRoute ? 18 : 0
  const unknownSpeciesRisk = isUnknownWildlife ? 10 : 0
  const risk_score = Math.min(
    95,
    6 +
      quantityRisk +
      permitRisk +
      (matchedSpeciesRule ? matchedSpeciesRule.score : 0) +
      (hasLikelyMisspelling ? 10 : 0) +
      routeRisk +
      unknownSpeciesRisk
  )
  const compliant = risk_score < 45
  const routeLabel = `${origin_country} to ${destination_country}`
  const risk_factors = [
    ...(matchedSpeciesRule ? [`Protected species match: ${matchedSpeciesRule.label}`] : []),
    ...(isLivestock ? ['Common livestock species; no CITES wildlife match found'] : []),
    ...(isUnknownWildlife ? ['Species not recognized in protected or livestock reference list'] : []),
    ...(hasLikelyMisspelling ? ['Species name appears misspelled; verify taxonomy before clearance'] : []),
    ...(routeRisk ? [`Sensitive cross-border route: ${routeLabel}`] : []),
    ...(quantityRisk ? [`Quantity requires review for this species: ${normalizedQuantity}`] : []),
    ...(!hasPermit ? ['Permit number missing'] : []),
    ...(hasPermit && !hasValidPermitFormat ? ['Permit format does not match expected CITES pattern'] : [])
  ]
  const suggested_actions = [
    ...(matchedSpeciesRule ? ['Confirm CITES appendix, local protection status, and scientific name'] : []),
    ...(isUnknownWildlife ? ['Verify scientific name before final clearance'] : []),
    ...(hasLikelyMisspelling ? ['Correct species spelling and attach scientific name'] : []),
    ...(routeRisk ? ['Route to officer review for cross-border wildlife movement'] : []),
    ...(quantityRisk ? ['Review quantity against permit and quota limits'] : []),
    ...(!hasPermit ? ['Attach a valid CITES permit before clearance'] : []),
    ...(hasPermit && !hasValidPermitFormat ? ['Verify permit number with issuing authority'] : [])
  ]
  
  res.json({
    compliant,
    risk_score,
    route: `${origin_country} → ${destination_country}`,
    checked_items: [
      `Species: ${species_name}`,
      `Quantity: ${normalizedQuantity}`,
      `Route: ${origin_country} to ${destination_country}`,
      `Permit: ${hasPermit ? permit_number : 'Missing'}`
    ],
    risk_factors,
    penalty_estimate: compliant ? '$0 - $5,000' : '$10,000 - $50,000+',
    legal_citations: ['CITES Article III', 'CITES Article IV', 'Local wildlife protection act'],
    suggested_actions,
    requires_human_review: !compliant || risk_score >= 60,
    timestamp: new Date().toISOString()
  })
})

// Get shipments endpoint
app.get('/api/shipments', (req, res) => {
  res.json({
    shipments: [
      {
        id: 'WCT-1028',
        species_name: 'Orchid specimens',
        quantity: 12,
        origin_country: 'Thailand',
        destination_country: 'United States',
        permit_number: 'CITES-EXP-2048',
        status: 'compliant',
        risk_score: 18
      },
      {
        id: 'WCT-1031',
        species_name: 'Pangolin scales',
        quantity: 75,
        origin_country: 'Nigeria',
        destination_country: 'Vietnam',
        permit_number: '',
        status: 'review_required',
        risk_score: 82
      },
      {
        id: 'WCT-1034',
        species_name: 'Coral fragments',
        quantity: 32,
        origin_country: 'Indonesia',
        destination_country: 'Germany',
        permit_number: 'CITES-REEF-7781',
        status: 'review_required',
        risk_score: 64
      },
      {
        id: 'WCT-1038',
        species_name: 'Cultivated aloe extract',
        quantity: 24,
        origin_country: 'Mexico',
        destination_country: 'Canada',
        permit_number: 'CITES-BOT-9120',
        status: 'compliant',
        risk_score: 21
      }
    ],
    count: 4,
    message: 'Shipments endpoint working'
  })
})

// Get statistics endpoint
app.get('/api/statistics', (req, res) => {
  res.json({
    total_validations: 128,
    compliant_rate: 74,
    high_risk_count: 9,
    avg_risk_score: 31,
    pending_review: 18,
    blocked_shipments: 7,
    monthly_validations: [
      { month: 'Jan', count: 18 },
      { month: 'Feb', count: 22 },
      { month: 'Mar', count: 31 },
      { month: 'Apr', count: 57 }
    ],
    compliance_mix: [
      { label: 'Compliant', value: 74 },
      { label: 'Needs review', value: 19 },
      { label: 'Blocked', value: 7 }
    ],
    risk_distribution: [
      { label: 'Low', value: 72 },
      { label: 'Medium', value: 37 },
      { label: 'High', value: 19 }
    ]
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`)
  console.log(`   Health check: http://localhost:${PORT}/health`)
  console.log(`   Test API: http://localhost:${PORT}/api/test`)
})
