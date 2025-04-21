-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
DROP POLICY IF EXISTS "Allow user registration" ON public.users;

-- Create new policies
CREATE POLICY "Users can view their own data"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
    ON public.users FOR SELECT
    USING (
        auth.uid() IN (
            SELECT id FROM public.users 
            WHERE role = 'admin'
        )
    );

CREATE POLICY "Admins can update all users"
    ON public.users FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT id FROM public.users 
            WHERE role = 'admin'
        )
    );

CREATE POLICY "Admins can delete users"
    ON public.users FOR DELETE
    USING (
        auth.uid() IN (
            SELECT id FROM public.users 
            WHERE role = 'admin'
        )
    );

-- Create policy to allow user registration
CREATE POLICY "Allow user registration"
    ON public.users FOR INSERT
    WITH CHECK (true);