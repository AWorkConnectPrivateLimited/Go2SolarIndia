-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    permissions TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create trigger for updated_at
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view roles"
    ON roles FOR SELECT
    USING (true);

CREATE POLICY "Only admins can insert roles"
    ON roles FOR INSERT
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update roles"
    ON roles FOR UPDATE
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete roles"
    ON roles FOR DELETE
    USING (auth.jwt() ->> 'role' = 'admin');

-- Insert default roles
INSERT INTO roles (name, description, permissions)
VALUES 
    ('Customer', 'Regular users who can access customer features', ARRAY['view_profile', 'view_projects', 'create_service_requests']),
    ('Agent', 'Field agents who can manage installations and service requests', ARRAY['view_profile', 'view_projects', 'manage_service_requests', 'view_customers']),
    ('Admin', 'Administrators with full system access', ARRAY['view_profile', 'view_projects', 'manage_service_requests', 'view_customers', 'manage_users', 'manage_roles', 'view_reports'])
ON CONFLICT (name) DO NOTHING; 