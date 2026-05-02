
-- ============================================
-- ADDITIONAL PERFORMANCE INDEXES
-- ============================================

-- Index for compliance status queries
CREATE INDEX IF NOT EXISTS idx_shipments_compliance_status 
ON shipments(status, created_at DESC);

-- Index for high-risk validations (partial index)
CREATE INDEX IF NOT EXISTS idx_validations_high_risk 
ON compliance_validations(risk_score) 
WHERE risk_score > 70;

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_shipments_date_range 
ON shipments(shipment_date) 
WHERE status IN ('compliant', 'non_compliant');

-- Index for audit log actions
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_date 
ON audit_logs(action, created_at DESC);

-- Index for permit number lookups
CREATE INDEX IF NOT EXISTS idx_shipments_permit 
ON shipments(permit_number) 
WHERE permit_number IS NOT NULL;

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_shipments_user_status 
ON shipments(user_id, status, created_at DESC);