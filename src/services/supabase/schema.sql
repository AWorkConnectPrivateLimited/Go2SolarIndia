-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('customer', 'agent', 'admin');
CREATE TYPE kyc_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE project_type AS ENUM ('physical', 'digital');
CREATE TYPE project_status AS ENUM ('quote', 'confirmed', 'installation', 'active');
CREATE TYPE service_type AS ENUM ('maintenance', 'repair', 'inspection');
CREATE TYPE service_status AS ENUM ('open', 'assigned', 'in_progress', 'resolved');
CREATE TYPE transaction_type AS ENUM ('credit', 'debit');
CREATE TYPE referral_status AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE notification_type AS ENUM ('alert', 'update', 'promotion');

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    role user_role NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    kyc_status kyc_status DEFAULT 'pending',
    profile_image VARCHAR(255),
    is_active BOOLEAN DEFAULT true
);

-- Customer Profiles Table
CREATE TABLE customer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    electricity_provider VARCHAR(255) NOT NULL,
    average_bill DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Solar Projects Table
CREATE TABLE solar_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_type project_type NOT NULL,
    status project_status NOT NULL,
    capacity_kw DECIMAL(10,2) NOT NULL,
    estimated_cost DECIMAL(10,2) NOT NULL,
    actual_cost DECIMAL(10,2),
    installation_date TIMESTAMP WITH TIME ZONE,
    completion_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Energy Consumption Table
CREATE TABLE energy_consumption (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES solar_projects(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    consumption_kwh DECIMAL(10,2) NOT NULL,
    generation_kwh DECIMAL(10,2) NOT NULL,
    battery_level INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Service Requests Table
CREATE TABLE service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES solar_projects(id) ON DELETE CASCADE,
    type service_type NOT NULL,
    status service_status NOT NULL,
    description TEXT NOT NULL,
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Digital Wallet Table
CREATE TABLE digital_wallet (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(10,2) DEFAULT 0.00,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Wallet Transactions Table
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES digital_wallet(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    reference_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Referrals Table
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status referral_status NOT NULL,
    reward_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agent Profiles Table
CREATE TABLE agent_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    commission_rate DECIMAL(5,2) NOT NULL,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    performance_rating DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to tables with updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_profiles_updated_at
    BEFORE UPDATE ON customer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_solar_projects_updated_at
    BEFORE UPDATE ON solar_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at
    BEFORE UPDATE ON service_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at
    BEFORE UPDATE ON referrals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_profiles_updated_at
    BEFORE UPDATE ON agent_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE solar_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
    ON users FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for customer_profiles table
CREATE POLICY "Customers can view their own profile"
    ON customer_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all customer profiles"
    ON customer_profiles FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for solar_projects table
CREATE POLICY "Customers can view their own projects"
    ON solar_projects FOR SELECT
    USING (auth.uid() = customer_id);

CREATE POLICY "Admins can view all projects"
    ON solar_projects FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for energy_consumption table
CREATE POLICY "Customers can view their project's consumption"
    ON energy_consumption FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM solar_projects
        WHERE solar_projects.id = energy_consumption.project_id
        AND solar_projects.customer_id = auth.uid()
    ));

CREATE POLICY "Admins can view all consumption data"
    ON energy_consumption FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for service_requests table
CREATE POLICY "Customers can view their own service requests"
    ON service_requests FOR SELECT
    USING (auth.uid() = customer_id);

CREATE POLICY "Agents can view assigned service requests"
    ON service_requests FOR SELECT
    USING (auth.uid() = assigned_to);

CREATE POLICY "Admins can view all service requests"
    ON service_requests FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for digital_wallet table
CREATE POLICY "Users can view their own wallet"
    ON digital_wallet FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all wallets"
    ON digital_wallet FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for wallet_transactions table
CREATE POLICY "Users can view their own transactions"
    ON wallet_transactions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM digital_wallet
        WHERE digital_wallet.id = wallet_transactions.wallet_id
        AND digital_wallet.user_id = auth.uid()
    ));

CREATE POLICY "Admins can view all transactions"
    ON wallet_transactions FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for referrals table
CREATE POLICY "Users can view their own referrals"
    ON referrals FOR SELECT
    USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Admins can view all referrals"
    ON referrals FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for agent_profiles table
CREATE POLICY "Agents can view their own profile"
    ON agent_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all agent profiles"
    ON agent_profiles FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for notifications table
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all notifications"
    ON notifications FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin'); 