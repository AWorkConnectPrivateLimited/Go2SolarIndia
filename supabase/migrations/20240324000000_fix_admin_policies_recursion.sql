-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Service role can do everything" ON public.users;

-- Create new policies that use auth.jwt() instead of querying the users table
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

-- Create the service role policy
CREATE POLICY "Service role can do everything"
    ON public.users
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role'); 