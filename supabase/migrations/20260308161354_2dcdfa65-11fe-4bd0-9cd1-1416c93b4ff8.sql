
CREATE OR REPLACE FUNCTION public.generate_test_case_display_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_prefix text;
  v_next_number integer;
  v_display_id text;
BEGIN
  -- Get the prefix from project_settings, default to 'TC' if not set
  SELECT COALESCE(ps.tc_id_prefix, 'TC') INTO v_prefix
  FROM project_settings ps
  WHERE ps.project_id = NEW.project_id;
  
  -- If no settings exist, use default prefix
  IF v_prefix IS NULL THEN
    v_prefix := 'TC';
  END IF;
  
  -- Get the next number by counting existing test cases in this project
  SELECT COALESCE(MAX(
    CASE 
      WHEN display_id ~ ('_[0-9]+$') 
      THEN CAST(SUBSTRING(display_id FROM '[0-9]+$') AS integer)
      ELSE 0
    END
  ), 0) + 1 INTO v_next_number
  FROM test_cases
  WHERE project_id = NEW.project_id;
  
  -- Format the display_id with 3-digit zero-padding (e.g., Tvo_001, Tvo_002)
  v_display_id := v_prefix || '_' || LPAD(v_next_number::text, 3, '0');
  
  -- Ensure uniqueness by incrementing if collision
  WHILE EXISTS (SELECT 1 FROM test_cases WHERE project_id = NEW.project_id AND display_id = v_display_id) LOOP
    v_next_number := v_next_number + 1;
    v_display_id := v_prefix || '_' || LPAD(v_next_number::text, 3, '0');
  END LOOP;
  
  NEW.display_id := v_display_id;
  RETURN NEW;
END;
$function$;
