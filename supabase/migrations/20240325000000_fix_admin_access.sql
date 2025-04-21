-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Service role can do everything" ON public.users;
DROP POLICY IF EXISTS "Allow user registration" ON public.users;

-- Create new policies that use auth.jwt() for role checking
CREATE POLICY "Users can view their own data"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Admin policies using auth.jwt() to avoid recursion
CREATE POLICY "Admins can view all users"
    ON public.users FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update all users"
    ON public.users FOR UPDATE
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can delete users"
    ON public.users FOR DELETE
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can insert users"
    ON public.users FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Service role policy
CREATE POLICY "Service role can do everything"
    ON public.users
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Allow user registration
CREATE POLICY "Allow user registration"
    ON public.users FOR INSERT
    WITH CHECK (true); 