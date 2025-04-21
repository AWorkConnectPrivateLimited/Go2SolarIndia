-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop existing foreign key constraints
ALTER TABLE IF EXISTS public.customer_profiles 
    DROP CONSTRAINT IF EXISTS customer_profiles_user_id_fkey;
ALTER TABLE IF EXISTS public.solar_projects 
    DROP CONSTRAINT IF EXISTS solar_projects_customer_id_fkey;
ALTER TABLE IF EXISTS public.service_requests 
    DROP CONSTRAINT IF EXISTS service_requests_customer_id_fkey;
ALTER TABLE IF EXISTS public.service_requests 
    DROP CONSTRAINT IF EXISTS service_requests_assigned_to_fkey;
ALTER TABLE IF EXISTS public.digital_wallet 
    DROP CONSTRAINT IF EXISTS digital_wallet_user_id_fkey;
ALTER TABLE IF EXISTS public.referrals 
    DROP CONSTRAINT IF EXISTS referrals_referrer_id_fkey;
ALTER TABLE IF EXISTS public.referrals 
    DROP CONSTRAINT IF EXISTS referrals_referred_id_fkey;
ALTER TABLE IF EXISTS public.agent_profiles 
    DROP CONSTRAINT IF EXISTS agent_profiles_user_id_fkey;
ALTER TABLE IF EXISTS public.notifications 
    DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table with updated schema
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('customer', 'agent', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Recreate foreign key constraints
ALTER TABLE public.customer_profiles 
    ADD CONSTRAINT customer_profiles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.solar_projects 
    ADD CONSTRAINT solar_projects_customer_id_fkey 
    FOREIGN KEY (customer_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.service_requests 
    ADD CONSTRAINT service_requests_customer_id_fkey 
    FOREIGN KEY (customer_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.service_requests 
    ADD CONSTRAINT service_requests_assigned_to_fkey 
    FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.digital_wallet 
    ADD CONSTRAINT digital_wallet_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.referrals 
    ADD CONSTRAINT referrals_referrer_id_fkey 
    FOREIGN KEY (referrer_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.referrals 
    ADD CONSTRAINT referrals_referred_id_fkey 
    FOREIGN KEY (referred_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.agent_profiles 
    ADD CONSTRAINT agent_profiles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.notifications 
    ADD CONSTRAINT notifications_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
    ON public.users FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update all users"
    ON public.users FOR UPDATE
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can delete users"
    ON public.users FOR DELETE
    USING (auth.jwt() ->> 'role' = 'admin');

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id,
        email,
        full_name,
        phone,
        password_hash,
        role,
        is_active
    )
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'password_hash',
        NEW.raw_user_meta_data->>'role',
        COALESCE((NEW.raw_user_meta_data->>'is_active')::boolean, true)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create index for faster queries
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_is_active ON public.users(is_active); 