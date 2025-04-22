-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS create_customer_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, DECIMAL);
DROP FUNCTION IF EXISTS create_solar_project(UUID, TEXT, DECIMAL, DECIMAL, DECIMAL, DATE, DATE, TEXT);

-- Create function to create customer profile with RLS bypass
CREATE OR REPLACE FUNCTION create_customer_profile(
  p_user_id UUID,
  p_address TEXT,
  p_city TEXT,
  p_state TEXT,
  p_pincode TEXT,
  p_electricity_provider TEXT,
  p_average_bill DECIMAL
) RETURNS customer_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile customer_profiles;
BEGIN
  INSERT INTO customer_profiles (
    user_id,
    address,
    city,
    state,
    pincode,
    electricity_provider,
    average_bill
  ) VALUES (
    p_user_id,
    p_address,
    p_city,
    p_state,
    p_pincode,
    p_electricity_provider,
    p_average_bill
  )
  RETURNING * INTO v_profile;
  
  RETURN v_profile;
END;
$$;

-- Create function to create solar project with RLS bypass
CREATE OR REPLACE FUNCTION create_solar_project(
  p_customer_id UUID,
  p_project_type TEXT,
  p_solar_type TEXT,
  p_status TEXT,
  p_capacity_kw DECIMAL,
  p_estimated_cost DECIMAL,
  p_subsidy_amount DECIMAL,
  p_effective_cost DECIMAL,
  p_space_required DECIMAL,
  p_annual_energy DECIMAL,
  p_annual_savings DECIMAL,
  p_monthly_bill DECIMAL,
  p_needs_financing TEXT,
  p_installation_address TEXT,
  p_city TEXT,
  p_state TEXT,
  p_pincode TEXT,
  p_electricity_provider TEXT
) RETURNS solar_projects
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project solar_projects;
  v_project_type project_type;
  v_solar_type solar_type;
  v_status project_status;
  v_financing financing;
BEGIN
  -- Safely cast project_type
  BEGIN
    v_project_type := p_project_type::project_type;
  EXCEPTION WHEN invalid_text_representation THEN
    -- If casting fails, try to add the value to the enum
    EXECUTE format('ALTER TYPE project_type ADD VALUE IF NOT EXISTS %L', p_project_type);
    v_project_type := p_project_type::project_type;
  END;
  
  -- Safely cast solar_type
  BEGIN
    v_solar_type := p_solar_type::solar_type;
  EXCEPTION WHEN invalid_text_representation THEN
    -- If casting fails, try to add the value to the enum
    EXECUTE format('ALTER TYPE solar_type ADD VALUE IF NOT EXISTS %L', p_solar_type);
    v_solar_type := p_solar_type::solar_type;
  END;
  
  -- Safely cast status
  BEGIN
    v_status := p_status::project_status;
  EXCEPTION WHEN invalid_text_representation THEN
    -- If casting fails, try to add the value to the enum
    EXECUTE format('ALTER TYPE project_status ADD VALUE IF NOT EXISTS %L', p_status);
    v_status := p_status::project_status;
  END;
  
  -- Safely cast needs_financing
  BEGIN
    v_financing := p_needs_financing::financing;
  EXCEPTION WHEN invalid_text_representation THEN
    -- If casting fails, try to add the value to the enum
    EXECUTE format('ALTER TYPE financing ADD VALUE IF NOT EXISTS %L', p_needs_financing);
    v_financing := p_needs_financing::financing;
  END;
  
  INSERT INTO solar_projects (
    customer_id,
    project_type,
    solar_type,
    status,
    capacity_kw,
    estimated_cost,
    subsidy_amount,
    effective_cost,
    space_required,
    annual_energy,
    annual_savings,
    monthly_bill,
    needs_financing,
    installation_address,
    city,
    state,
    pincode,
    electricity_provider,
    created_at,
    updated_at
  ) VALUES (
    p_customer_id,
    v_project_type,
    v_solar_type,
    v_status,
    p_capacity_kw,
    p_estimated_cost,
    p_subsidy_amount,
    p_effective_cost,
    p_space_required,
    p_annual_energy,
    p_annual_savings,
    p_monthly_bill,
    v_financing,
    p_installation_address,
    p_city,
    p_state,
    p_pincode,
    p_electricity_provider,
    NOW(),
    NOW()
  )
  RETURNING * INTO v_project;
  
  RETURN v_project;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_customer_profile TO authenticated;
GRANT EXECUTE ON FUNCTION create_solar_project TO authenticated; 