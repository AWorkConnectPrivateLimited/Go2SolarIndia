-- Add new columns to solar_projects table
ALTER TABLE solar_projects
ADD COLUMN IF NOT EXISTS monthly_bill DECIMAL,
ADD COLUMN IF NOT EXISTS need_financing VARCHAR(10),
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS latitude DECIMAL,
ADD COLUMN IF NOT EXISTS longitude DECIMAL,
ADD COLUMN IF NOT EXISTS space_required DECIMAL,
ADD COLUMN IF NOT EXISTS annual_energy DECIMAL,
ADD COLUMN IF NOT EXISTS annual_savings DECIMAL,
ADD COLUMN IF NOT EXISTS subsidy DECIMAL,
ADD COLUMN IF NOT EXISTS effective_cost DECIMAL;

-- Add comment to explain the need_financing field
COMMENT ON COLUMN solar_projects.need_financing IS 'Values: yes, no, maybe';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_solar_projects_customer_id ON solar_projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_solar_projects_status ON solar_projects(status); 