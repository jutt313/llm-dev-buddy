
-- Add test_status column to user_llm_credentials to track credential validation
ALTER TABLE user_llm_credentials 
ADD COLUMN IF NOT EXISTS test_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS test_error text,
ADD COLUMN IF NOT EXISTS last_test_at timestamp with time zone;

-- Create indexes for better performance on analytics queries
CREATE INDEX IF NOT EXISTS idx_usage_analytics_user_provider ON usage_analytics(user_id, provider_id);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_recorded_at ON usage_analytics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created ON chat_messages(session_id, created_at);

-- Add foreign key relationships for better data integrity
ALTER TABLE user_llm_credentials 
ADD CONSTRAINT IF NOT EXISTS fk_user_llm_credentials_provider 
FOREIGN KEY (provider_id) REFERENCES llm_providers(id);

-- Ensure we have some basic LLM providers in the database
INSERT INTO llm_providers (name, display_name, base_url, is_active) 
VALUES 
  ('openai', 'OpenAI', 'https://api.openai.com', true),
  ('anthropic', 'Anthropic (Claude)', 'https://api.anthropic.com', true),
  ('google', 'Google AI', 'https://generativelanguage.googleapis.com', true),
  ('azure', 'Azure OpenAI', null, true),
  ('huggingface', 'Hugging Face', 'https://api-inference.huggingface.co', true)
ON CONFLICT (name) DO UPDATE SET 
  display_name = EXCLUDED.display_name,
  is_active = EXCLUDED.is_active;

-- Add some basic models for each provider
INSERT INTO llm_models (provider_id, name, display_name, context_length, is_active) 
SELECT p.id, models.name, models.display_name, models.context_length, true
FROM llm_providers p
CROSS JOIN (
  VALUES 
    ('openai', 'gpt-4o', 'GPT-4o', 128000),
    ('openai', 'gpt-4o-mini', 'GPT-4o Mini', 128000),
    ('anthropic', 'claude-3-5-sonnet-20241022', 'Claude 3.5 Sonnet', 200000),
    ('anthropic', 'claude-3-haiku-20240307', 'Claude 3 Haiku', 200000),
    ('google', 'gemini-1.5-pro', 'Gemini 1.5 Pro', 1000000),
    ('google', 'gemini-1.5-flash', 'Gemini 1.5 Flash', 1000000),
    ('azure', 'gpt-4o', 'GPT-4o (Azure)', 128000),
    ('huggingface', 'meta-llama/Meta-Llama-3-8B-Instruct', 'Llama 3 8B Instruct', 8192)
) AS models(provider_name, name, display_name, context_length)
WHERE p.name = models.provider_name
ON CONFLICT (provider_id, name) DO UPDATE SET 
  display_name = EXCLUDED.display_name,
  is_active = EXCLUDED.is_active;
