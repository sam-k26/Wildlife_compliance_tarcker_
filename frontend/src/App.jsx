import React, { useEffect, useMemo, useState } from 'react'
import { apiUrl } from './lib/apiUrl'

const initialShipment = {
  species_name: 'Orchid specimens',
  quantity: 12,
  origin_country: 'Thailand',
  destination_country: 'United States',
  permit_number: 'CITES-EXP-2048'
}
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const speciesRegistry = [
  { id: 'SP001', name: 'Bengal Tiger', category: 'Mammal', status: 'Endangered', habitat: 'Zone-12 Tadoba' },
  { id: 'SP002', name: 'Indian Pangolin', category: 'Mammal', status: 'Endangered', habitat: 'Zone-09 Satpura' },
  { id: 'SP003', name: 'Great Indian Bustard', category: 'Bird', status: 'Critically Endangered', habitat: 'Zone-05 Rajasthan Desert' },
  { id: 'SP004', name: 'Red Sand Boa', category: 'Reptile', status: 'Protected', habitat: 'Zone-07 Western Ghats' }
]
const protectedAreas = [
  { id: 'Z-12', name: 'Tadoba-Andhari Reserve', state: 'Maharashtra', area: '625 sq km', risk: 'Medium' },
  { id: 'Z-05', name: 'Desert National Park', state: 'Rajasthan', area: '3162 sq km', risk: 'High' },
  { id: 'Z-09', name: 'Satpura Reserve', state: 'Madhya Pradesh', area: '2133 sq km', risk: 'Medium' }
]
const patrolLogs = [
  { id: 'PAT-001', date: '12-Feb-2026', zone: 'Z-12', officer: 'Officer Sharma', observation: 'Illegal trap found near water source' },
  { id: 'PAT-002', date: '18-Feb-2026', zone: 'Z-05', officer: 'Officer Khan', observation: 'Vehicle tracks near restricted dune corridor' }
]
const violations = [
  { id: 'CASE-21', type: 'Poaching Attempt', zone: 'Z-05', status: 'Under Trial', penalty: '₹5,00,000 fine' },
  { id: 'CASE-22', type: 'Illegal Logging', zone: 'Z-12', status: 'Closed', penalty: '₹2,00,000 fine' }
]
const tradePermits = [
  { id: 'PERM-09', entity: 'BioResearch Pvt Ltd', species: 'SP002', purpose: 'Scientific Study', status: 'Approved' },
  { id: 'PERM-14', entity: 'Conservation Lab', species: 'SP004', purpose: 'Rescue Transfer', status: 'Pending Review' }
]
const sensorAlerts = [
  { id: 'AI-778', zone: 'Z-05', activity: 'Night movement with weapon-like object', confidence: '89%', action: 'Ranger dispatch' },
  { id: 'AI-804', zone: 'Z-12', activity: 'Fence crossing near buffer boundary', confidence: '76%', action: 'Camera review' }
]
const predictiveRisks = [
  { zone: 'Z-05', poaching: '82/100', habitat: 'High', level: 'Critical' },
  { zone: 'Z-12', poaching: '55/100', habitat: 'Moderate', level: 'Medium' },
  { zone: 'Z-09', poaching: '61/100', habitat: 'Moderate', level: 'High' }
]
const emptyTrackedRecord = {
  type: 'Species',
  title: '',
  reference: '',
  status: 'Active',
  notes: ''
}
const defaultTables = {
  species: speciesRegistry.map((item) => ({ ...item, priority: 'Normal' })),
  areas: protectedAreas.map((item) => ({ ...item, priority: 'Normal' })),
  patrols: patrolLogs.map((item) => ({ ...item, priority: 'Normal' })),
  violations: violations.map((item) => ({ ...item, priority: item.status === 'Closed' ? 'Low' : 'High' })),
  permits: tradePermits.map((item) => ({ ...item, priority: item.status === 'Pending Review' ? 'High' : 'Normal' })),
  alerts: sensorAlerts.map((item) => ({ ...item, priority: 'High' })),
  risks: predictiveRisks.map((item) => ({ ...item, id: item.zone, priority: item.level === 'Critical' ? 'High' : 'Normal' }))
}
const tableConfigs = [
  {
    key: 'species',
    title: 'Species registry',
    fields: [
      { key: 'id', label: 'Species ID' },
      { key: 'name', label: 'Name' },
      { key: 'category', label: 'Category' },
      { key: 'status', label: 'IUCN status' },
      { key: 'habitat', label: 'Habitat zone' }
    ]
  },
  {
    key: 'areas',
    title: 'Protected areas',
    fields: [
      { key: 'id', label: 'Zone ID' },
      { key: 'name', label: 'Name' },
      { key: 'state', label: 'State' },
      { key: 'area', label: 'Area' },
      { key: 'risk', label: 'Risk level' }
    ]
  },
  {
    key: 'patrols',
    title: 'Ranger patrol logs',
    fields: [
      { key: 'id', label: 'Patrol ID' },
      { key: 'date', label: 'Date' },
      { key: 'zone', label: 'Zone' },
      { key: 'officer', label: 'Officer' },
      { key: 'observation', label: 'Observations' }
    ]
  },
  {
    key: 'violations',
    title: 'Wildlife violations',
    fields: [
      { key: 'id', label: 'Case ID' },
      { key: 'type', label: 'Type' },
      { key: 'zone', label: 'Zone' },
      { key: 'status', label: 'Status' },
      { key: 'penalty', label: 'Penalty' }
    ]
  },
  {
    key: 'permits',
    title: 'Wildlife trade permits',
    fields: [
      { key: 'id', label: 'Permit ID' },
      { key: 'entity', label: 'Entity' },
      { key: 'species', label: 'Species' },
      { key: 'purpose', label: 'Purpose' },
      { key: 'status', label: 'Status' }
    ]
  },
  {
    key: 'alerts',
    title: 'AI camera and sensor alerts',
    fields: [
      { key: 'id', label: 'Alert ID' },
      { key: 'zone', label: 'Zone' },
      { key: 'activity', label: 'Detected activity' },
      { key: 'confidence', label: 'Confidence' },
      { key: 'action', label: 'Action' }
    ]
  },
  {
    key: 'risks',
    title: 'Predictive risk engine',
    fields: [
      { key: 'zone', label: 'Zone' },
      { key: 'poaching', label: 'Poaching risk score' },
      { key: 'habitat', label: 'Habitat degradation' },
      { key: 'level', label: 'Risk level' }
    ]
  }
]
const createTableDrafts = () => Object.fromEntries(
  tableConfigs.map((config) => [
    config.key,
    {
      ...Object.fromEntries(config.fields.map((field) => [field.key, ''])),
      priority: 'Normal'
    }
  ])
)

function App() {
  const [user, setUser] = useState(() => {
    const savedSession = localStorage.getItem('wildlifeComplianceSession')
    return savedSession ? JSON.parse(savedSession).user : null
  })
  const [trackedRecords, setTrackedRecords] = useState(() => {
    const savedRecords = localStorage.getItem('wildlifeTrackedRecords')
    return savedRecords ? JSON.parse(savedRecords) : []
  })
  const [editableTables, setEditableTables] = useState(() => {
    const savedTables = localStorage.getItem('wildlifeEditableTables')
    return savedTables ? JSON.parse(savedTables) : defaultTables
  })
  const [tableDrafts, setTableDrafts] = useState(createTableDrafts)
  const [tableSort, setTableSort] = useState({})
  const [health, setHealth] = useState({ state: 'checking', message: 'Checking connection...' })
  const [stats, setStats] = useState(null)
  const [shipments, setShipments] = useState([])
  const [formData, setFormData] = useState(initialShipment)
  const [recordForm, setRecordForm] = useState(emptyTrackedRecord)
  const [validation, setValidation] = useState(null)
  const [loadingValidation, setLoadingValidation] = useState(false)
  const [apiMessage, setApiMessage] = useState('')
  const [shipmentSearch, setShipmentSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [communityReport, setCommunityReport] = useState('')
  const [reportMessage, setReportMessage] = useState('')
  const [reportType, setReportType] = useState('Monthly Wildlife Compliance Report')
  const [checklist, setChecklist] = useState({
    permit: false,
    route: false,
    species: false,
    documents: false
  })

  const isConnected = health.state === 'connected'

  useEffect(() => {
    if (user) {
      refreshBackend()
    }
  }, [user])

  useEffect(() => {
    localStorage.setItem('wildlifeTrackedRecords', JSON.stringify(trackedRecords))
  }, [trackedRecords])

  useEffect(() => {
    localStorage.setItem('wildlifeEditableTables', JSON.stringify(editableTables))
  }, [editableTables])

  async function handleLogin(credentials) {
    const session = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
    localStorage.setItem('wildlifeComplianceSession', JSON.stringify(session))
    setUser(session.user)
  }

  async function handleGoogleLogin(credential) {
    const session = await request('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential, clientId: googleClientId })
    })
    localStorage.setItem('wildlifeComplianceSession', JSON.stringify(session))
    setUser(session.user)
  }

  async function handleRegister(account) {
    const session = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(account)
    })
    localStorage.setItem('wildlifeComplianceSession', JSON.stringify(session))
    setUser(session.user)
  }

  async function handleDemoLogin() {
    const demoCredentials = {
      email: 'officer@wildlife.local',
      password: 'Wildlife@123'
    }

    try {
      await handleLogin(demoCredentials)
    } catch (error) {
      const demoSession = {
        user: {
          id: 'demo-officer',
          name: 'Demo Officer',
          email: demoCredentials.email,
          role: 'Trade Review'
        },
        token: 'demo-local-session'
      }
      localStorage.setItem('wildlifeComplianceSession', JSON.stringify(demoSession))
      setUser(demoSession.user)
      setHealth({ state: 'offline', message: 'Offline demo' })
    }
  }

  function handleLogout() {
    localStorage.removeItem('wildlifeComplianceSession')
    setUser(null)
    setValidation(null)
    setApiMessage('')
  }

  async function request(path, options) {
    const response = await fetch(apiUrl(path), {
      headers: { 'Content-Type': 'application/json' },
      ...options
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Request failed with ${response.status}`)
    }

    return response.json()
  }

  async function refreshBackend() {
    setHealth({ state: 'checking', message: 'Checking connection...' })
    try {
      const [healthData, statisticsData, shipmentsData] = await Promise.all([
        request('/api/health'),
        request('/api/statistics'),
        request('/api/shipments')
      ])

      setHealth({
        state: 'connected',
        message: 'Connected'
      })
      setStats(statisticsData)
      setShipments(shipmentsData.shipments || [])
    } catch (error) {
      setHealth({
        state: 'offline',
        message: 'Offline'
      })
      setStats(null)
      setShipments([])
    }
  }

  async function testApi() {
    try {
      await request('/api/test')
      setApiMessage('Connection available')
    } catch (error) {
      setApiMessage('Connection unavailable')
    }
  }

  async function validateShipment(event) {
    event.preventDefault()
    setLoadingValidation(true)
    setValidation(null)
    try {
      const result = await request('/api/validate', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      setValidation(result)
    } catch (error) {
      setValidation({ error: error.message })
    } finally {
      setLoadingValidation(false)
    }
  }

  function updateField(event) {
    const { name, value } = event.target
    setFormData((current) => ({
      ...current,
      [name]: name === 'quantity' ? Number(value) : value
    }))
  }

  function updateChecklist(event) {
    const { name, checked } = event.target
    setChecklist((current) => ({ ...current, [name]: checked }))
  }

  function reviewShipment(shipment) {
    setFormData({
      species_name: shipment.species_name,
      quantity: shipment.quantity || 1,
      origin_country: shipment.origin_country,
      destination_country: shipment.destination_country,
      permit_number: shipment.permit_number || ''
    })
    document.getElementById('validator')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function downloadValidationReport() {
    if (!validation || validation.error) return

    const lines = [
      'Wildlife Compliance Tracker - Validation Report',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      `Species: ${formData.species_name}`,
      `Quantity: ${formData.quantity}`,
      `Route: ${formData.origin_country} to ${formData.destination_country}`,
      `Permit: ${formData.permit_number || 'Missing'}`,
      '',
      `Result: ${validation.compliant ? 'Compliant' : 'Human review recommended'}`,
      `Risk score: ${validation.risk_score}/100`,
      `Penalty estimate: ${validation.penalty_estimate}`,
      '',
      'Checked:',
      ...(validation.checked_items || []).map((item) => `- ${item}`),
      '',
      'Findings:',
      ...(validation.risk_factors.length ? validation.risk_factors : ['No review flags from the current rules']).map((item) => `- ${item}`),
      '',
      'Next actions:',
      ...(validation.suggested_actions.length ? validation.suggested_actions : ['No action required unless documents change']).map((item) => `- ${item}`)
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `validation-report-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(link)
  }

  function submitCommunityReport() {
    if (!communityReport.trim()) {
      setReportMessage('Enter report details before submitting.')
      return
    }

    setReportMessage('Community report submitted for officer review.')
    setCommunityReport('')
  }

  function updateRecordForm(event) {
    const { name, value } = event.target
    setRecordForm((current) => ({ ...current, [name]: value }))
  }

  function addTrackedRecord(event) {
    event.preventDefault()

    if (!recordForm.title.trim()) {
      setReportMessage('Add a title before saving the record.')
      return
    }

    const newRecord = {
      ...recordForm,
      id: `REC-${Date.now()}`,
      createdAt: new Date().toLocaleDateString()
    }

    setTrackedRecords((current) => [newRecord, ...current])
    setRecordForm(emptyTrackedRecord)
    setReportMessage('Record saved.')
  }

  function deleteTrackedRecord(recordId) {
    setTrackedRecords((current) => current.filter((record) => record.id !== recordId))
  }

  function updateTableDraft(tableKey, fieldKey, value) {
    setTableDrafts((current) => ({
      ...current,
      [tableKey]: {
        ...current[tableKey],
        [fieldKey]: value
      }
    }))
  }

  function addTableRow(event, tableKey, fields) {
    event.preventDefault()
    const draft = tableDrafts[tableKey]
    const firstField = fields[0].key

    if (!String(draft[firstField] || '').trim()) {
      setReportMessage('Complete the first field before saving.')
      return
    }

    const row = {
      ...draft,
      id: draft.id || draft.zone || `ROW-${Date.now()}`,
      priority: draft.priority || 'Normal'
    }

    setEditableTables((current) => ({
      ...current,
      [tableKey]: [row, ...(current[tableKey] || [])]
    }))
    setTableDrafts((current) => ({
      ...current,
      [tableKey]: {
        ...Object.fromEntries(fields.map((field) => [field.key, ''])),
        priority: 'Normal'
      }
    }))
    setReportMessage('Table row saved.')
  }

  function deleteTableRow(tableKey, rowIndex) {
    setEditableTables((current) => ({
      ...current,
      [tableKey]: current[tableKey].filter((_, index) => index !== rowIndex)
    }))
  }

  function updateTablePriority(tableKey, rowIndex, priority) {
    setEditableTables((current) => ({
      ...current,
      [tableKey]: current[tableKey].map((row, index) => (
        index === rowIndex ? { ...row, priority } : row
      ))
    }))
  }

  function sortTable(tableKey, fieldKey) {
    setTableSort((current) => {
      const existing = current[tableKey]
      return {
        ...current,
        [tableKey]: {
          fieldKey,
          direction: existing?.fieldKey === fieldKey && existing.direction === 'asc' ? 'desc' : 'asc'
        }
      }
    })
  }

  function generateComplianceReport() {
    const lines = [
      reportType,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      `Protected areas monitored: ${protectedAreas.length}`,
      `Species records: ${speciesRegistry.length}`,
      `User tracked records: ${trackedRecords.length}`,
      `Editable table rows: ${Object.values(editableTables).reduce((sum, rows) => sum + rows.length, 0)}`,
      `Open violations: ${violations.filter((item) => item.status !== 'Closed').length}`,
      `AI alerts: ${sensorAlerts.length}`,
      `High risk zones: ${predictiveRisks.filter((item) => ['High', 'Critical'].includes(item.level)).length}`
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${reportType.toLowerCase().replaceAll(' ', '-')}-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(link)
    setReportMessage('Compliance report generated.')
  }

  const riskLabel = useMemo(() => {
    if (!validation || validation.error) return 'Awaiting scan'
    if (validation.risk_score >= 60) return 'High risk'
    if (validation.risk_score >= 35) return 'Moderate risk'
    return 'Low risk'
  }, [validation])

  const analytics = useMemo(
    () => buildAnalytics(editableTables, trackedRecords, shipments),
    [editableTables, trackedRecords, shipments]
  )
  const filteredShipments = useMemo(() => {
    const query = shipmentSearch.trim().toLowerCase()

    return shipments.filter((shipment) => {
      const matchesSearch = !query || [
        shipment.id,
        shipment.species_name,
        shipment.origin_country,
        shipment.destination_country,
        shipment.status
      ].some((value) => String(value || '').toLowerCase().includes(query))
      const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [shipments, shipmentSearch, statusFilter])
  const checklistComplete = Object.values(checklist).filter(Boolean).length

  if (!user) {
    return (
      <LoginPage
        onLogin={handleLogin}
        onDemoLogin={handleDemoLogin}
        onGoogleLogin={handleGoogleLogin}
        onRegister={handleRegister}
      />
    )
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <nav className="topbar" aria-label="Primary">
          <div className="brand-mark">WCT</div>
          <div>
            <h1>Wildlife Compliance Tracker</h1>
            <div className={`status-pill compact ${isConnected ? 'online' : 'offline'}`}>
              <span />
              {health.message}
            </div>
          </div>
          <div className="session-actions">
            <div className="user-chip">
              <strong>{user.name}</strong>
              <span>{user.role}</span>
            </div>
            <button className="ghost-button" type="button" onClick={refreshBackend}>
              Refresh
            </button>
            <button className="ghost-button logout-button" type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <div className="hero-actions">
              <a className="primary-button" href="#validator">Validate shipment</a>
              <button className="secondary-button" type="button" onClick={testApi}>Check connection</button>
            </div>
            {apiMessage && <p className="api-message">{apiMessage}</p>}
          </div>

          <div className="signal-panel" aria-label="Backend status summary">
            <Metric label="Protected zones" value={protectedAreas.length} />
            <Metric label="Endangered species" value={speciesRegistry.filter((item) => item.status.includes('Endangered')).length} />
            <Metric label="Active violations" value={violations.filter((item) => item.status !== 'Closed').length} />
            <Metric label="AI risk alerts" value={sensorAlerts.length} />
          </div>
        </div>
      </section>

      <section className="content-grid">
        <form className="workspace-panel validator-panel" id="validator" onSubmit={validateShipment}>
          <div className="section-heading">
            <p className="eyebrow">Live validator</p>
            <h2>Check a shipment</h2>
          </div>

          <div className="form-grid">
            <label>
              Species name
              <input name="species_name" value={formData.species_name} onChange={updateField} required />
            </label>
            <label>
              Quantity
              <input name="quantity" type="number" min="1" value={formData.quantity} onChange={updateField} required />
            </label>
            <label>
              Origin country
              <input name="origin_country" value={formData.origin_country} onChange={updateField} required />
            </label>
            <label>
              Destination country
              <input name="destination_country" value={formData.destination_country} onChange={updateField} required />
            </label>
            <label className="full">
              Permit number
              <input name="permit_number" value={formData.permit_number} onChange={updateField} placeholder="Permit number" />
            </label>
          </div>

          <button className="primary-button wide" type="submit" disabled={loadingValidation || !isConnected}>
            {loadingValidation ? 'Scanning...' : 'Run compliance scan'}
          </button>
        </form>

        <aside className="workspace-panel result-panel">
          <div className="section-heading">
            <p className="eyebrow">Result</p>
            <h2>{riskLabel}</h2>
          </div>

          {validation?.error ? (
            <p className="error-box">{validation.error}</p>
          ) : validation ? (
            <div className="result-stack">
              <div className="risk-meter">
                <span style={{ width: `${validation.risk_score}%` }} />
              </div>
              <div className="result-score">{validation.risk_score}<small>/100</small></div>
              <p className={validation.compliant ? 'result-good' : 'result-review'}>
                {validation.compliant ? 'No review flags from current rules' : 'Human review recommended'}
              </p>
              <InfoList title="Checked" items={validation.checked_items || [
                `Species: ${formData.species_name}`,
                `Quantity: ${formData.quantity}`,
                `Route: ${formData.origin_country} to ${formData.destination_country}`,
                `Permit: ${formData.permit_number || 'Missing'}`
              ]} />
              <InfoList
                title="Findings"
                items={validation.risk_factors.length ? validation.risk_factors : ['No issues triggered by the current rule set']}
              />
              <InfoList
                title="Next actions"
                items={validation.suggested_actions.length ? validation.suggested_actions : ['No action required unless shipment details change']}
              />
              <button className="secondary-action" type="button" onClick={downloadValidationReport}>
                Download report
              </button>
            </div>
          ) : (
            <p className="empty-state">No scan yet.</p>
          )}
        </aside>
      </section>

      <section className="feature-grid">
        <div className="feature-panel">
          <div className="section-heading">
            <p className="eyebrow">Officer checklist</p>
            <h2>Before clearance</h2>
          </div>
          <div className="checklist-progress">
            <span style={{ width: `${(checklistComplete / 4) * 100}%` }} />
          </div>
          <div className="checklist">
            <label>
              <input name="permit" type="checkbox" checked={checklist.permit} onChange={updateChecklist} />
              Permit number and issuing authority verified
            </label>
            <label>
              <input name="route" type="checkbox" checked={checklist.route} onChange={updateChecklist} />
              Origin and destination route reviewed
            </label>
            <label>
              <input name="species" type="checkbox" checked={checklist.species} onChange={updateChecklist} />
              Species name checked against protected keywords
            </label>
            <label>
              <input name="documents" type="checkbox" checked={checklist.documents} onChange={updateChecklist} />
              Supporting documents attached to shipment record
            </label>
          </div>
          <p className="checklist-note">{checklistComplete}/4 clearance items complete</p>
        </div>

        <div className="feature-panel">
          <div className="section-heading">
            <p className="eyebrow">Tools</p>
            <h2>Actions</h2>
          </div>
          <div className="quick-actions">
            <button type="button" onClick={() => setFormData(initialShipment)}>Load sample</button>
            <button type="button" onClick={() => {
              setFormData((current) => ({ ...current, permit_number: '' }))
              document.getElementById('validator')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}>
              Clear permit
            </button>
            <button type="button" onClick={() => setChecklist({ permit: false, route: false, species: false, documents: false })}>
              Reset
            </button>
          </div>
        </div>
      </section>

      <AnalyticsSection analytics={analytics} />

      <DatabaseModules
        communityReport={communityReport}
        onCommunityReportChange={setCommunityReport}
        onSubmitCommunityReport={submitCommunityReport}
        reportMessage={reportMessage}
        reportType={reportType}
        onReportTypeChange={setReportType}
        onGenerateComplianceReport={generateComplianceReport}
        recordForm={recordForm}
        trackedRecords={trackedRecords}
        onRecordFormChange={updateRecordForm}
        onAddTrackedRecord={addTrackedRecord}
        onDeleteTrackedRecord={deleteTrackedRecord}
        editableTables={editableTables}
        tableDrafts={tableDrafts}
        tableSort={tableSort}
        onTableDraftChange={updateTableDraft}
        onAddTableRow={addTableRow}
        onDeleteTableRow={deleteTableRow}
        onTablePriorityChange={updateTablePriority}
        onSortTable={sortTable}
      />

      <section className="shipment-band">
        <div className="section-heading shipment-heading">
          <div>
            <p className="eyebrow">Shipment review queue</p>
            <h2>Recent shipments</h2>
          </div>
          <div className="shipment-controls">
            <input
              aria-label="Search shipments"
              value={shipmentSearch}
              onChange={(event) => setShipmentSearch(event.target.value)}
              placeholder="Search species, route, status"
            />
            <select
              aria-label="Filter shipment status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="compliant">Compliant</option>
              <option value="review_required">Review required</option>
            </select>
          </div>
        </div>
        <div className="queue-summary">
          <span>{filteredShipments.length} visible</span>
          <span>{shipments.filter((shipment) => shipment.status !== 'compliant').length} need review</span>
          <span>{shipments.filter((shipment) => shipment.risk_score >= 60).length} high risk</span>
        </div>
        <div className="shipment-list">
          {filteredShipments.map((shipment) => (
            <article className="shipment-row" key={shipment.id}>
              <div>
                <strong>{shipment.species_name}</strong>
                <p>{shipment.origin_country} to {shipment.destination_country}</p>
              </div>
              <span className={shipment.status === 'compliant' ? 'badge success' : 'badge warning'}>
                {shipment.status.replace('_', ' ')}
              </span>
              <span className="risk-chip">{shipment.risk_score} risk</span>
              <button className="row-action" type="button" onClick={() => reviewShipment(shipment)}>
                Review
              </button>
            </article>
          ))}
          {filteredShipments.length === 0 && (
            <p className="empty-state">No shipments match the current filters.</p>
          )}
        </div>
      </section>
    </main>
  )
}

function DatabaseModules({
  communityReport,
  onCommunityReportChange,
  onSubmitCommunityReport,
  reportMessage,
  reportType,
  onReportTypeChange,
  onGenerateComplianceReport,
  recordForm,
  trackedRecords,
  onRecordFormChange,
  onAddTrackedRecord,
  onDeleteTrackedRecord,
  editableTables,
  tableDrafts,
  tableSort,
  onTableDraftChange,
  onAddTableRow,
  onDeleteTableRow,
  onTablePriorityChange,
  onSortTable
}) {
  return (
    <section className="database-section" id="records">
      <div className="section-heading">
        <h2>Wildlife compliance records</h2>
      </div>

      <div className="record-grid">
        <RecordPanel title="Add tracking record">
          <form className="record-form" onSubmit={onAddTrackedRecord}>
            <div className="form-grid compact">
              <label>
                Record type
                <select name="type" value={recordForm.type} onChange={onRecordFormChange}>
                  <option>Species</option>
                  <option>Protected area</option>
                  <option>Patrol log</option>
                  <option>Violation</option>
                  <option>Permit</option>
                  <option>Sensor alert</option>
                  <option>Other</option>
                </select>
              </label>
              <label>
                Title
                <input name="title" value={recordForm.title} onChange={onRecordFormChange} required />
              </label>
              <label>
                Reference
                <input name="reference" value={recordForm.reference} onChange={onRecordFormChange} />
              </label>
              <label>
                Status
                <select name="status" value={recordForm.status} onChange={onRecordFormChange}>
                  <option>Active</option>
                  <option>Pending review</option>
                  <option>Resolved</option>
                  <option>Archived</option>
                </select>
              </label>
              <label className="full">
                Notes
                <textarea name="notes" value={recordForm.notes} onChange={onRecordFormChange} />
              </label>
            </div>
            <button className="secondary-action" type="submit">Save record</button>
          </form>
        </RecordPanel>

        <RecordPanel title="Stored tracking records">
          {trackedRecords.length > 0 ? (
            <div className="stored-records">
              {trackedRecords.map((record) => (
                <article className="stored-record" key={record.id}>
                  <div>
                    <span className="record-type">{record.type}</span>
                    <h4>{record.title}</h4>
                    <p>{record.notes || 'No notes added.'}</p>
                    <small>{record.reference || record.id} - {record.createdAt}</small>
                  </div>
                  <div className="stored-record-actions">
                    <span className="badge success">{record.status}</span>
                    <button className="row-action" type="button" onClick={() => onDeleteTrackedRecord(record.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-state">No saved records.</p>
          )}
        </RecordPanel>

        {tableConfigs.map((config) => (
          <RecordPanel title={config.title} key={config.key}>
            <EditableDataTable
              config={config}
              rows={editableTables[config.key] || []}
              draft={tableDrafts[config.key]}
              sortState={tableSort[config.key]}
              onDraftChange={onTableDraftChange}
              onAddRow={onAddTableRow}
              onDeleteRow={onDeleteTableRow}
              onPriorityChange={onTablePriorityChange}
              onSort={onSortTable}
            />
          </RecordPanel>
        ))}

        <RecordPanel title="Community and NGO reports">
          <textarea
            value={communityReport}
            onChange={(event) => onCommunityReportChange(event.target.value)}
            placeholder="Report illegal activity, suspicious movement, or conservation concern"
          />
          <button className="secondary-action" type="button" onClick={onSubmitCommunityReport}>
            Submit report
          </button>
          {reportMessage && <p className="record-message">{reportMessage}</p>}
        </RecordPanel>

        <RecordPanel title="Compliance reports">
          <select value={reportType} onChange={(event) => onReportTypeChange(event.target.value)}>
            <option>Monthly Wildlife Compliance Report</option>
            <option>Violation Penalty Summary</option>
            <option>Protected Area Risk Report</option>
            <option>AI Alert Dispatch Report</option>
          </select>
          <button className="secondary-action" type="button" onClick={onGenerateComplianceReport}>
            Generate report
          </button>
        </RecordPanel>
      </div>
    </section>
  )
}

function RecordPanel({ title, children }) {
  return (
    <article className="record-panel">
      <h3>{title}</h3>
      {children}
    </article>
  )
}

function EditableDataTable({
  config,
  rows,
  draft,
  sortState,
  onDraftChange,
  onAddRow,
  onDeleteRow,
  onPriorityChange,
  onSort
}) {
  const sortedRows = useMemo(() => {
    if (!sortState?.fieldKey) return rows

    return [...rows].sort((first, second) => {
      const firstValue = String(first[sortState.fieldKey] || '').toLowerCase()
      const secondValue = String(second[sortState.fieldKey] || '').toLowerCase()
      const result = firstValue.localeCompare(secondValue, undefined, { numeric: true })
      return sortState.direction === 'asc' ? result : -result
    })
  }, [rows, sortState])

  return (
    <div className="editable-table">
      <form className="table-add-form" onSubmit={(event) => onAddRow(event, config.key, config.fields)}>
        {config.fields.map((field) => (
          <label key={field.key}>
            {field.label}
            <input
              value={draft?.[field.key] || ''}
              onChange={(event) => onDraftChange(config.key, field.key, event.target.value)}
            />
          </label>
        ))}
        <label>
          Priority
          <select
            value={draft?.priority || 'Normal'}
            onChange={(event) => onDraftChange(config.key, 'priority', event.target.value)}
          >
            <option>Low</option>
            <option>Normal</option>
            <option>High</option>
            <option>Critical</option>
          </select>
        </label>
        <button className="secondary-action" type="submit">Add row</button>
      </form>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {config.fields.map((field) => (
                <th key={field.key}>
                  <button type="button" onClick={() => onSort(config.key, field.key)}>
                    {field.label}
                    {sortState?.fieldKey === field.key ? ` ${sortState.direction}` : ''}
                  </button>
                </th>
              ))}
              <th>Priority</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => {
              const rowIndex = rows.indexOf(row)
              return (
                <tr key={`${config.key}-${rowIndex}-${row.id || row.zone || row.name}`}>
                  {config.fields.map((field) => <td key={field.key}>{row[field.key]}</td>)}
                  <td>
                    <select
                      className="priority-select"
                      value={row.priority || 'Normal'}
                      onChange={(event) => onPriorityChange(config.key, rowIndex, event.target.value)}
                    >
                      <option>Low</option>
                      <option>Normal</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </td>
                  <td>
                    <button className="row-action" type="button" onClick={() => onDeleteRow(config.key, rowIndex)}>
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="empty-state">No rows saved.</p>}
      </div>
    </div>
  )
}

function buildAnalytics(editableTables, trackedRecords, shipments) {
  const tableRows = Object.entries(editableTables).flatMap(([tableKey, rows]) => (
    rows.map((row) => ({ ...row, tableKey }))
  ))
  const shipmentRows = shipments.map((shipment) => ({
    ...shipment,
    tableKey: 'shipments',
    priority: shipment.risk_score >= 60 ? 'High' : 'Normal'
  }))
  const trackedRows = trackedRecords.map((record) => ({
    ...record,
    tableKey: 'tracked',
    priority: record.status === 'Pending review' ? 'High' : 'Normal'
  }))
  const records = [...tableRows, ...trackedRows, ...shipmentRows]
  const total = records.length
  const safeTotal = Math.max(total, 1)
  const cleared = records.filter((record) => isCleared(record)).length
  const blocked = records.filter((record) => isBlocked(record)).length
  const pending = Math.max(0, total - cleared - blocked)
  const compliantRate = Math.round((cleared / safeTotal) * 100)
  const highPriority = records.filter((record) => ['High', 'Critical'].includes(record.priority)).length
  const avgRisk = Math.round(
    records.reduce((sum, record) => sum + recordRiskScore(record), 0) / safeTotal
  )
  const riskDistribution = ['Low', 'Medium', 'High'].map((label) => ({
    label,
    value: records.filter((record) => riskBucket(record) === label).length
  }))

  return {
    totals: [
      { label: 'Total records', value: total },
      { label: 'Compliant rate', value: `${compliantRate}%` },
      { label: 'High priority', value: highPriority },
      { label: 'Avg. risk score', value: avgRisk }
    ],
    complianceMix: [
      { label: 'Cleared', value: cleared },
      { label: 'Needs review', value: pending },
      { label: 'Blocked', value: blocked }
    ],
    riskDistribution,
    monthlyValidations: buildMonthlyActivity(records)
  }
}

function normalizeValue(value) {
  return String(value || '').toLowerCase()
}

function isCleared(record) {
  const status = normalizeValue(record.status || record.level)
  return ['approved', 'closed', 'resolved', 'compliant', 'low'].some((value) => status.includes(value))
}

function isBlocked(record) {
  const status = normalizeValue(record.status || record.level)
  return ['blocked', 'critical', 'non_compliant', 'non-compliant'].some((value) => status.includes(value))
}

function recordRiskScore(record) {
  const priorityScores = { Low: 20, Normal: 40, High: 70, Critical: 95 }
  const levelScores = { low: 20, medium: 45, moderate: 45, high: 75, critical: 95 }
  const poachingScore = Number.parseInt(record.poaching, 10)

  if (Number.isFinite(Number(record.risk_score))) return Number(record.risk_score)
  if (Number.isFinite(poachingScore)) return poachingScore
  if (priorityScores[record.priority]) return priorityScores[record.priority]

  const level = normalizeValue(record.level || record.risk || record.status)
  const matchedLevel = Object.entries(levelScores).find(([key]) => level.includes(key))
  return matchedLevel ? matchedLevel[1] : 35
}

function riskBucket(record) {
  const score = recordRiskScore(record)
  if (score >= 67) return 'High'
  if (score >= 34) return 'Medium'
  return 'Low'
}

function buildMonthlyActivity(records) {
  const today = new Date()
  const months = Array.from({ length: 4 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (3 - index), 1)
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      month: date.toLocaleString(undefined, { month: 'short' }),
      count: 0
    }
  })
  const currentMonth = months[months.length - 1]

  records.forEach((record) => {
    const recordDate = new Date(record.createdAt || record.date || record.created_at || today)
    const monthKey = Number.isNaN(recordDate.getTime())
      ? currentMonth.key
      : `${recordDate.getFullYear()}-${recordDate.getMonth()}`
    const bucket = months.find((month) => month.key === monthKey) || currentMonth
    bucket.count += 1
  })

  return months
}

function AnalyticsSection({ analytics }) {
  return (
    <section className="analytics-band" id="analytics">
      <div className="section-heading analytics-heading">
        <div>
          <p className="eyebrow">Analytics</p>
          <h2>Compliance performance</h2>
        </div>
        <a className="analytics-period" href="#records">Live records</a>
      </div>

      <div className="analytics-stats">
        {analytics.totals.map((item) => (
          <div className="analytics-stat" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      <div className="analytics-grid">
        <div className="chart-card">
          <div className="chart-heading">
            <h3>Compliance mix</h3>
          </div>
          <PieChart data={analytics.complianceMix} />
        </div>

        <div className="chart-card">
          <div className="chart-heading">
            <h3>Risk distribution</h3>
          </div>
          <BarList data={analytics.riskDistribution} />
        </div>

        <div className="chart-card wide-chart">
          <div className="chart-heading">
            <h3>Monthly validations</h3>
          </div>
          <MiniColumnChart data={analytics.monthlyValidations} />
        </div>
      </div>
    </section>
  )
}

function PieChart({ data }) {
  const colors = ['#839958', '#105666', '#D3968C', '#F7F4D5']
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1
  let cumulative = 0
  const gradient = data.map((item, index) => {
    const start = (cumulative / total) * 100
    cumulative += item.value
    const end = (cumulative / total) * 100
    return `${colors[index % colors.length]} ${start}% ${end}%`
  }).join(', ')

  return (
    <div className="pie-layout">
      <div className="pie-chart" style={{ background: `conic-gradient(${gradient})` }}>
        <span>{total}</span>
      </div>
      <div className="chart-legend">
        {data.map((item, index) => (
          <div key={item.label}>
            <i style={{ background: colors[index % colors.length] }} />
            <span>{item.label}</span>
            <strong>{Math.round((item.value / total) * 100)}%</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

function BarList({ data }) {
  const colors = ['#839958', '#105666', '#D3968C']
  const maxValue = Math.max(...data.map((item) => item.value), 1)

  return (
    <div className="bar-list">
      {data.map((item, index) => (
        <div className="bar-row" key={item.label}>
          <div className="bar-label">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
          <div className="bar-track">
            <span
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                background: colors[index % colors.length]
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function MiniColumnChart({ data }) {
  const maxValue = Math.max(...data.map((item) => item.count), 1)

  return (
    <div className="column-chart">
      {data.map((item, index) => (
        <div className="column-item" key={item.month}>
          <div className="column-track">
            <span
              style={{
                height: `${Math.max(12, (item.count / maxValue) * 100)}%`,
                background: index % 2 === 0 ? '#0A3323' : '#105666'
              }}
            />
          </div>
          <strong>{item.count}</strong>
          <p>{item.month}</p>
        </div>
      ))}
    </div>
  )
}

function LoginPage({ onLogin, onDemoLogin, onGoogleLogin, onRegister }) {
  const [mode, setMode] = useState('login')
  const [credentials, setCredentials] = useState({
    email: 'officer@wildlife.local',
    password: 'Wildlife@123'
  })
  const [account, setAccount] = useState({
    name: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [googleReady, setGoogleReady] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!googleClientId) return undefined

    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')

    function initializeGoogle() {
      if (!window.google?.accounts?.id) return

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          try {
            setLoading(true)
            setError('')
            await onGoogleLogin(response.credential)
          } catch (error) {
            setError(error.message || 'Google login failed.')
          } finally {
            setLoading(false)
          }
        }
      })

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'signin_with',
          shape: 'rectangular'
        }
      )
      setGoogleReady(true)
    }

    if (existingScript) {
      initializeGoogle()
      return undefined
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initializeGoogle
    script.onerror = () => setError('Google sign-in script could not load.')
    document.head.appendChild(script)

    return undefined
  }, [onGoogleLogin])

  function updateCredentials(event) {
    const { name, value } = event.target
    setCredentials((current) => ({ ...current, [name]: value }))
  }

  function updateAccount(event) {
    const { name, value } = event.target
    setAccount((current) => ({ ...current, [name]: value }))
  }

  function switchMode(nextMode) {
    setMode(nextMode)
    setError('')
  }

  async function submitLogin(event) {
    event.preventDefault()

    if (!credentials.email.trim() || !credentials.password.trim()) {
      setError('Enter an email and password to continue.')
      return
    }

    try {
      setLoading(true)
      setError('')
      await onLogin(credentials)
    } catch (error) {
      setError(error.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  async function submitRegister(event) {
    event.preventDefault()

    if (!account.name.trim() || !account.email.trim() || !account.company.trim() || !account.password.trim()) {
      setError('Fill in all account fields.')
      return
    }

    if (account.password !== account.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setLoading(true)
      setError('')
      await onRegister(account)
    } catch (error) {
      setError(error.message || 'Account creation failed.')
    } finally {
      setLoading(false)
    }
  }

  async function submitDemoLogin() {
    try {
      setLoading(true)
      setError('')
      await onDemoLogin()
    } catch (error) {
      setError(error.message || 'Demo login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-shell">
      <section className="login-panel">
        <div className="login-copy">
          <div className="brand-mark">WCT</div>
          <p className="eyebrow">Wildlife Compliance Tracker</p>
          <h1>Sign in to review protected trade shipments.</h1>
        </div>

        <form className="login-card" onSubmit={mode === 'login' ? submitLogin : submitRegister}>
          <div className="section-heading">
            <p className="eyebrow">{mode === 'login' ? 'Secure access' : 'New account'}</p>
            <h2>{mode === 'login' ? 'Log in' : 'Create account'}</h2>
          </div>

          <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              className={mode === 'login' ? 'active' : ''}
              onClick={() => switchMode('login')}
            >
              Log in
            </button>
            <button
              type="button"
              className={mode === 'register' ? 'active' : ''}
              onClick={() => switchMode('register')}
            >
              Create account
            </button>
          </div>

          {mode === 'login' ? (
            <>
              {googleClientId && (
                <>
                  <div className="google-login-area">
                    <div id="google-signin-button" />
                    {!googleReady && <p className="login-note">Loading Google sign-in...</p>}
                  </div>
                  <div className="login-divider"><span>or use email</span></div>
                </>
              )}

              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  value={credentials.email}
                  onChange={updateCredentials}
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                Password
                <input
                  name="password"
                  type="password"
                  value={credentials.password}
                  onChange={updateCredentials}
                  autoComplete="current-password"
                  required
                />
              </label>
            </>
          ) : (
            <>
              <label>
                Full name
                <input
                  name="name"
                  value={account.name}
                  onChange={updateAccount}
                  autoComplete="name"
                  required
                />
              </label>

              <label>
                Work email
                <input
                  name="email"
                  type="email"
                  value={account.email}
                  onChange={updateAccount}
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                Company or agency
                <input
                  name="company"
                  value={account.company}
                  onChange={updateAccount}
                  autoComplete="organization"
                  required
                />
              </label>

              <label>
                Password
                <input
                  name="password"
                  type="password"
                  value={account.password}
                  onChange={updateAccount}
                  autoComplete="new-password"
                  required
                />
              </label>

              <label>
                Confirm password
                <input
                  name="confirmPassword"
                  type="password"
                  value={account.confirmPassword}
                  onChange={updateAccount}
                  autoComplete="new-password"
                  required
                />
              </label>
            </>
          )}

          {error && <p className="error-box">{error}</p>}

          <button className="primary-button wide" type="submit" disabled={loading}>
            {loading
              ? (mode === 'login' ? 'Checking credentials...' : 'Creating account...')
              : (mode === 'login' ? 'Log in' : 'Create account')}
          </button>

          {mode === 'login' && (
            <button className="secondary-action demo-button" type="button" onClick={submitDemoLogin} disabled={loading}>
              Continue as demo
            </button>
          )}

        </form>
      </section>
    </main>
  )
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function InfoList({ title, items }) {
  return (
    <div className="info-list">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  )
}

export default App
