-- Create custom types
CREATE TYPE user_role AS ENUM ('customer', 'agent', 'admin');
CREATE TYPE kyc_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE project_type AS ENUM ('physical', 'digital');
CREATE TYPE project_status AS ENUM ('quote', 'confirmed', 'installation', 'active');
CREATE TYPE service_request_type AS ENUM ('maintenance', 'repair', 'inspection');
CREATE TYPE service_request_status AS ENUM ('open', 'assigned', 'in_progress', 'resolved');
CREATE TYPE transaction_type AS ENUM ('credit', 'debit');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE referral_status AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE notification_type AS ENUM ('alert', 'update', 'promotion');

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  role user_role NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  kyc_status kyc_status DEFAULT 'pending',
  profile_image TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create customer_profiles table
CREATE TABLE customer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  electricity_provider TEXT,
  average_bill DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create solar_projects table
CREATE TABLE solar_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_type project_type NOT NULL,
  status project_status NOT NULL,
  capacity_kw DECIMAL NOT NULL,
  estimated_cost DECIMAL NOT NULL,
  actual_cost DECIMAL,
  installation_date TIMESTAMP WITH TIME ZONE,
  completion_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create energy_consumption table
CREATE TABLE energy_consumption (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES solar_projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  consumption_kwh DECIMAL NOT NULL,
  generation_kwh DECIMAL NOT NULL,
  battery_level INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_requests table
CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES solar_projects(id) ON DELETE CASCADE,
  type service_request_type NOT NULL,
  status service_request_status NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create digital_wallet table
CREATE TABLE digital_wallet (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  balance DECIMAL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wallet_transactions table
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID REFERENCES digital_wallet(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount DECIMAL NOT NULL,
  description TEXT,
  reference_id TEXT,
  status transaction_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create referrals table
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status referral_status DEFAULT 'pending',
  reward_amount DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agent_profiles table
CREATE TABLE agent_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  commission_rate DECIMAL,
  total_earnings DECIMAL DEFAULT 0,
  performance_rating DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
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
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update users" ON users
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for customer_profiles table
CREATE POLICY "Customers can view their own profile" ON customer_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all customer profiles" ON customer_profiles
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Customers can update their own profile" ON customer_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for solar_projects table
CREATE POLICY "Customers can view their own projects" ON solar_projects
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Admins and agents can view all projects" ON solar_projects
  FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'agent'));

CREATE POLICY "Admins can update projects" ON solar_projects
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for energy_consumption table
CREATE POLICY "Customers can view their own energy consumption" ON energy_consumption
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM solar_projects
      WHERE solar_projects.id = energy_consumption.project_id
      AND solar_projects.customer_id = auth.uid()
    )
  );

CREATE POLICY "Admins and agents can view all energy consumption" ON energy_consumption
  FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'agent'));

-- Create policies for service_requests table
CREATE POLICY "Customers can view their own service requests" ON service_requests
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Admins and agents can view all service requests" ON service_requests
  FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'agent'));

CREATE POLICY "Customers can create service requests" ON service_requests
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Admins and agents can update service requests" ON service_requests
  FOR UPDATE USING (auth.jwt() ->> 'role' IN ('admin', 'agent'));

-- Create policies for digital_wallet table
CREATE POLICY "Users can view their own wallet" ON digital_wallet
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all wallets" ON digital_wallet
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for wallet_transactions table
CREATE POLICY "Users can view their own transactions" ON wallet_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM digital_wallet
      WHERE digital_wallet.id = wallet_transactions.wallet_id
      AND digital_wallet.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all transactions" ON wallet_transactions
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for referrals table
CREATE POLICY "Users can view their own referrals" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Admins can view all referrals" ON referrals
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for agent_profiles table
CREATE POLICY "Agents can view their own profile" ON agent_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all agent profiles" ON agent_profiles
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for notifications table
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all notifications" ON notifications
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for tables with updated_at column
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