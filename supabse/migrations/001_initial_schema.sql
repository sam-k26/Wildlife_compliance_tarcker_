-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'trader' CHECK (role IN ('trader', 'compliance_officer', 'admin')),
    company_name TEXT,
    license_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipments table
CREATE TABLE IF NOT EXISTS shipments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    species_name TEXT NOT NULL,
    scientific_name TEXT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit TEXT NOT NULL CHECK (unit IN ('kg', 'pieces', 'live', 'skins')),
    origin_country TEXT NOT NULL,
    destination_country TEXT NOT NULL,
    permit_number TEXT,
    declaration_type TEXT NOT NULL CHECK (declaration_type IN ('export', 'import', 're-export')),
    shipment_date DATE NOT NULL,
    documents_url TEXT[],
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'validating', 'compliant', 'non_compliant', 'needs_review')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance validations table
CREATE TABLE IF NOT EXISTS compliance_validations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
    compliant BOOLEAN NOT NULL,
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_factors JSONB,
    penalty_estimate TEXT,
    legal_citations JSONB,
    suggested_actions JSONB,
    requires_human_review BOOLEAN DEFAULT FALSE,
    validated_by UUID REFERENCES profiles(id),
    validation_type TEXT CHECK (validation_type IN ('ai', 'human')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CITES reference data table
CREATE TABLE IF NOT EXISTS cites_reference (
    id SERIAL PRIMARY KEY,
    species_name TEXT NOT NULL,
    scientific_name TEXT,
    appendix CHAR(1) CHECK (appendix IN ('I', 'II', 'III')),
    restrictions TEXT[],
    quota_limit INTEGER,
    typical_penalty_range TEXT,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes (using IF NOT EXISTS to avoid errors)
CREATE INDEX IF NOT EXISTS idx_shipments_user_id ON shipments(user_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_date ON shipments(shipment_date);
CREATE INDEX IF NOT EXISTS idx_validations_shipment_id ON compliance_validations(shipment_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_cites_species ON cites_reference(species_name);

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers (drop existing if any, then create)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
DROP TRIGGER IF EXISTS update_shipments_updated_at ON shipments;
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();