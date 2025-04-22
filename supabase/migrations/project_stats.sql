-- Create the get_project_stats function
CREATE OR REPLACE FUNCTION get_project_stats()
RETURNS TABLE (
  status text,
  project_type text,
  count bigint
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.status,
    p.project_type,
    COUNT(*) as count
  FROM solar_projects p
  GROUP BY p.status, p.project_type
  ORDER BY p.status, p.project_type;
END;
$$; 