-- Check existing enum values and create if needed
DO $$
BEGIN
    -- Check if project_type enum exists and has the correct values
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_type') THEN
        CREATE TYPE project_type AS ENUM ('residential', 'commercial');
    ELSE
        -- Check if we need to add values to the enum
        BEGIN
            -- Try to cast 'residential' to project_type to see if it's a valid value
            PERFORM 'residential'::project_type;
        EXCEPTION WHEN invalid_text_representation THEN
            -- If it fails, we need to add the value
            ALTER TYPE project_type ADD VALUE IF NOT EXISTS 'residential';
        END;
        
        BEGIN
            -- Try to cast 'commercial' to project_type to see if it's a valid value
            PERFORM 'commercial'::project_type;
        EXCEPTION WHEN invalid_text_representation THEN
            -- If it fails, we need to add the value
            ALTER TYPE project_type ADD VALUE IF NOT EXISTS 'commercial';
        END;
    END IF;
    
    -- Check if solar_type enum exists and has the correct values
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'solar_type') THEN
        CREATE TYPE solar_type AS ENUM ('physical', 'digital');
    ELSE
        -- Check if we need to add values to the enum
        BEGIN
            -- Try to cast 'physical' to solar_type to see if it's a valid value
            PERFORM 'physical'::solar_type;
        EXCEPTION WHEN invalid_text_representation THEN
            -- If it fails, we need to add the value
            ALTER TYPE solar_type ADD VALUE IF NOT EXISTS 'physical';
        END;
        
        BEGIN
            -- Try to cast 'digital' to solar_type to see if it's a valid value
            PERFORM 'digital'::solar_type;
        EXCEPTION WHEN invalid_text_representation THEN
            -- If it fails, we need to add the value
            ALTER TYPE solar_type ADD VALUE IF NOT EXISTS 'digital';
        END;
    END IF;
    
    -- Check if financing enum exists and has the correct values
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'financing') THEN
        CREATE TYPE financing AS ENUM ('yes', 'no', 'maybe');
    ELSE
        -- Check if we need to add values to the enum
        BEGIN
            -- Try to cast 'yes' to financing to see if it's a valid value
            PERFORM 'yes'::financing;
        EXCEPTION WHEN invalid_text_representation THEN
            -- If it fails, we need to add the value
            ALTER TYPE financing ADD VALUE IF NOT EXISTS 'yes';
        END;
        
        BEGIN
            -- Try to cast 'no' to financing to see if it's a valid value
            PERFORM 'no'::financing;
        EXCEPTION WHEN invalid_text_representation THEN
            -- If it fails, we need to add the value
            ALTER TYPE financing ADD VALUE IF NOT EXISTS 'no';
        END;
        
        BEGIN
            -- Try to cast 'maybe' to financing to see if it's a valid value
            PERFORM 'maybe'::financing;
        EXCEPTION WHEN invalid_text_representation THEN
            -- If it fails, we need to add the value
            ALTER TYPE financing ADD VALUE IF NOT EXISTS 'maybe';
        END;
    END IF;
    
    -- Check if project_status enum exists and has the correct values
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
        CREATE TYPE project_status AS ENUM ('quote', 'confirmed', 'installation', 'active');
    ELSE
        -- Check if we need to add values to the enum
        BEGIN
            -- Try to cast 'quote' to project_status to see if it's a valid value
            PERFORM 'quote'::project_status;
        EXCEPTION WHEN invalid_text_representation THEN
            -- If it fails, we need to add the value
            ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'quote';
        END;
        
        BEGIN
            -- Try to cast 'confirmed' to project_status to see if it's a valid value
            PERFORM 'confirmed'::project_status;
        EXCEPTION WHEN invalid_text_representation THEN
            -- If it fails, we need to add the value
            ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'confirmed';
        END;
        
        BEGIN
            -- Try to cast 'installation' to project_status to see if it's a valid value
            PERFORM 'installation'::project_status;
        EXCEPTION WHEN invalid_text_representation THEN
            -- If it fails, we need to add the value
            ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'installation';
        END;
        
        BEGIN
            -- Try to cast 'active' to project_status to see if it's a valid value
            PERFORM 'active'::project_status;
        EXCEPTION WHEN invalid_text_representation THEN
            -- If it fails, we need to add the value
            ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'active';
        END;
    END IF;
END$$;

-- Add missing columns to solar_projects table
ALTER TABLE solar_projects
ADD COLUMN IF NOT EXISTS solar_type solar_type,
ADD COLUMN IF NOT EXISTS project_type project_type,
ADD COLUMN IF NOT EXISTS subsidy_amount DECIMAL,
ADD COLUMN IF NOT EXISTS effective_cost DECIMAL,
ADD COLUMN IF NOT EXISTS space_required DECIMAL,
ADD COLUMN IF NOT EXISTS annual_energy DECIMAL,
ADD COLUMN IF NOT EXISTS annual_savings DECIMAL,
ADD COLUMN IF NOT EXISTS monthly_bill DECIMAL,
ADD COLUMN IF NOT EXISTS needs_financing financing,
ADD COLUMN IF NOT EXISTS installation_address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS pincode TEXT,
ADD COLUMN IF NOT EXISTS electricity_provider TEXT; 