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

const shipments = [
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
]

function sendJson(res, statusCode, payload) {
  res.setHeader('Content-Type', 'application/json')
  res.status(statusCode).json(payload)
}

function parseBody(req) {
  return typeof req.body === 'object' && req.body !== null ? req.body : {}
}

function createSession(user) {
  const { password: _password, ...safeUser } = user
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    issuedAt: new Date().toISOString()
  }

  return {
    user: safeUser,
    token: Buffer.from(JSON.stringify(tokenPayload)).toString('base64url')
  }
}

function validateShipment(body) {
  const {
    species_name = 'Unknown species',
    quantity = 0,
    origin_country = 'Unknown',
    destination_country = 'Unknown',
    permit_number = ''
  } = body

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

  return {
    compliant,
    risk_score,
    route: `${origin_country} to ${destination_country}`,
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
  }
}

export default function handler(req, res) {
  const path = Array.isArray(req.query.path) ? req.query.path.join('/') : ''
  const body = parseBody(req)

  if (req.method === 'GET' && path === 'health') {
    sendJson(res, 200, {
      status: 'healthy',
      service: 'wildlife-compliance-vercel-api',
      timestamp: new Date().toISOString()
    })
    return
  }

  if (req.method === 'GET' && path === 'test') {
    sendJson(res, 200, {
      message: 'Backend API is working!',
      service: 'Wildlife Compliance Tracker API'
    })
    return
  }

  if (req.method === 'GET' && path === 'shipments') {
    sendJson(res, 200, {
      shipments,
      count: shipments.length,
      message: 'Shipments endpoint working'
    })
    return
  }

  if (req.method === 'GET' && path === 'statistics') {
    sendJson(res, 200, {
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
    return
  }

  if (req.method === 'POST' && path === 'auth/login') {
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    const user = users.find((candidate) =>
      candidate.email.toLowerCase() === email && candidate.password === password
    )

    if (!user) {
      sendJson(res, 401, { error: 'Invalid email or password' })
      return
    }

    sendJson(res, 200, createSession(user))
    return
  }

  if (req.method === 'POST' && path === 'auth/register') {
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const company = String(body.company || '').trim()
    const password = String(body.password || '')

    if (!name || !email || !company || !password) {
      sendJson(res, 400, { error: 'All account fields are required' })
      return
    }

    sendJson(res, 201, createSession({
      id: `usr-${Date.now()}`,
      name,
      email,
      password,
      role: 'Trade Review',
      company
    }))
    return
  }

  if (req.method === 'POST' && path === 'validate') {
    sendJson(res, 200, validateShipment(body))
    return
  }

  sendJson(res, 404, { error: 'API route not found' })
}
