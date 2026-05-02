-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Traders can view own shipments" ON shipments;
DROP POLICY IF EXISTS "Traders can insert own shipments" ON shipments;
DROP POLICY IF EXISTS "Traders can update own shipments" ON shipments;
DROP POLICY IF EXISTS "Officers can view all shipments" ON shipments;
DROP POLICY IF EXISTS "Users can view validations for their shipments" ON compliance_validations;
DROP POLICY IF EXISTS "Only admins can view audit logs" ON audit_logs;

-- Profiles policies
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Shipments policies
CREATE POLICY "Traders can view own shipments"
    ON shipments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Traders can insert own shipments"
    ON shipments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Traders can update own shipments"
    ON shipments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Officers can view all shipments"
    ON shipments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('compliance_officer', 'admin')
        )
    );

-- Compliance validations policies
CREATE POLICY "Users can view validations for their shipments"
    ON compliance_validations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM shipments
            WHERE shipments.id = compliance_validations.shipment_id
            AND shipments.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('compliance_officer', 'admin')
        )
    );

-- Audit logs policies (admin only)
CREATE POLICY "Only admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );