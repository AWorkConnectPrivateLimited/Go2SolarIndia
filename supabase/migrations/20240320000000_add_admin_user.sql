-- Create admin user in auth.users
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@go2solar.com') THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_token,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new
        )
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'admin@go2solar.com',
            crypt('Admin@123', gen_salt('bf')),
            now(),
            '',
            '{"provider":"email","providers":["email"]}',
            '{"role":"admin","full_name":"System Admin","phone":"+919876543210","is_active":true}',
            now(),
            now(),
            '',
            '',
            ''
        );
    END IF;
END $$;

-- Create admin user in public.users
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'admin@go2solar.com') THEN
        INSERT INTO public.users (
            id,
            email,
            full_name,
            phone,
            password_hash,
            role,
            is_active,
            created_at,
            updated_at
        )
        SELECT 
            id,
            email,
            raw_user_meta_data->>'full_name',
            raw_user_meta_data->>'phone',
            encode(encrypted_password::bytea, 'hex'),
            raw_user_meta_data->>'role',
            (raw_user_meta_data->>'is_active')::boolean,
            created_at,
            updated_at
        FROM auth.users
        WHERE email = 'admin@go2solar.com';
    END IF;
END $$; 