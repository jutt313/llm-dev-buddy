
-- Add validation trigger for CXI_ token format
CREATE OR REPLACE FUNCTION validate_token_format()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure token_prefix always starts with 'CXI_'
  IF NEW.token_prefix IS NOT NULL AND NOT NEW.token_prefix LIKE 'CXI_%' THEN
    RAISE EXCEPTION 'Token prefix must start with CXI_';
  END IF;
  
  -- Ensure token_prefix is exactly 4 + 32 = 36 characters (CXI_ + 32 chars)
  IF NEW.token_prefix IS NOT NULL AND LENGTH(NEW.token_prefix) != 36 THEN
    RAISE EXCEPTION 'Token must be exactly 36 characters (CXI_ + 32 alphanumeric)';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate token format on insert/update
DROP TRIGGER IF EXISTS validate_token_format_trigger ON public.personal_tokens;
CREATE TRIGGER validate_token_format_trigger
  BEFORE INSERT OR UPDATE ON public.personal_tokens
  FOR EACH ROW
  EXECUTE FUNCTION validate_token_format();

-- Add index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_personal_tokens_hash ON public.personal_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_personal_tokens_active ON public.personal_tokens(user_id, is_active) WHERE is_active = true;

-- Update personal_tokens table to ensure permissions field has proper structure
ALTER TABLE public.personal_tokens 
ALTER COLUMN permissions SET DEFAULT '{"llm": [], "agent": [], "project": [], "cli": []}'::jsonb;

-- Add helpful comments
COMMENT ON TABLE public.personal_tokens IS 'Personal access tokens with CXI_ prefix for CLI and API access';
COMMENT ON COLUMN public.personal_tokens.token_prefix IS 'First 36 chars of token (CXI_ + 32 chars) for display';
COMMENT ON COLUMN public.personal_tokens.token_hash IS 'Bcrypt hash of the full token for security';
COMMENT ON COLUMN public.personal_tokens.permissions IS 'JSON object with llm, agent, project, cli permission arrays';
