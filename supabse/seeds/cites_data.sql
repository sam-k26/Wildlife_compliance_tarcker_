-- Insert CITES reference data
INSERT INTO cites_reference (species_name, scientific_name, appendix, restrictions, quota_limit, typical_penalty_range) VALUES
('African Elephant', 'Loxodonta africana', 'I', ARRAY['No commercial trade', 'Import permit required', 'Export permit required'], NULL, '$50,000 - $200,000'),
('Tiger', 'Panthera tigris', 'I', ARRAY['No commercial trade', 'Strictly prohibited for hunting trophies'], NULL, '$100,000 - $500,000'),
('Peregrine Falcon', 'Falco peregrinus', 'I', ARRAY['Captive-bred only', 'Microchipping required'], NULL, '$25,000 - $100,000'),
('American Alligator', 'Alligator mississippiensis', 'II', ARRAY['Quota limits apply', 'Sustainable harvest only'], 5000, '$5,000 - $25,000'),
('Python', 'Python regius', 'II', ARRAY['Export quota: 5000 annually', 'Captive-bred certification needed'], 5000, '$10,000 - $50,000'),
('Rhinoceros', 'Rhinocerotidae spp.', 'I', ARRAY['No commercial trade', 'Strict anti-poaching measures'], NULL, '$200,000 - $1,000,000'),
('Pangolin', 'Manis spp.', 'I', ARRAY['No commercial trade', 'All trade prohibited'], NULL, '$50,000 - $250,000');

-- Insert sample compliance officer account (password: Admin123!)
-- Note: Create this user through Supabase Auth first, then add profile
INSERT INTO profiles (id, email, full_name, role, company_name) 
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'compliance@wildlife.gov',
    'John Officer',
    'compliance_officer',
    'Wildlife Authority'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample admin account
INSERT INTO profiles (id, email, full_name, role, company_name) 
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'admin@wildlife.gov',
    'Admin User',
    'admin',
    'Wildlife Authority'
) ON CONFLICT (id) DO NOTHING;