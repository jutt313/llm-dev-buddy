
-- Add missing columns to user_llm_credentials table
ALTER TABLE public.user_llm_credentials 
ADD COLUMN IF NOT EXISTS test_status TEXT,
ADD COLUMN IF NOT EXISTS last_test_at TIMESTAMP WITH TIME ZONE;

-- Insert missing LLM providers
INSERT INTO public.llm_providers (name, display_name, is_active, created_at, updated_at) 
VALUES 
  ('deepseek', 'DeepSeek', true, now(), now()),
  ('marshall-ai', 'Marshall AI', true, now(), now()),
  ('grok', 'Grok', true, now(), now())
ON CONFLICT (name) DO NOTHING;

-- Get provider IDs for model insertion
WITH provider_ids AS (
  SELECT id, name FROM public.llm_providers WHERE name IN ('openai', 'azure-openai', 'huggingface', 'deepseek', 'marshall-ai', 'grok')
)
-- Insert missing models
INSERT INTO public.llm_models (name, display_name, provider_id, is_active, created_at) 
SELECT 
  models.name,
  models.display_name,
  provider_ids.id,
  true,
  now()
FROM (
  VALUES 
    ('gpt-4o-mini', 'GPT-4o Mini'),
    ('gpt-4o', 'GPT-4o'),
    ('gpt-3.5-turbo', 'GPT-3.5 Turbo')
) AS models(name, display_name)
CROSS JOIN provider_ids
WHERE provider_ids.name = 'openai'

UNION ALL

SELECT 
  models.name,
  models.display_name,
  provider_ids.id,
  true,
  now()
FROM (
  VALUES 
    ('gpt-4o', 'GPT-4o (Azure)'),
    ('gpt-4', 'GPT-4 (Azure)'),
    ('gpt-35-turbo', 'GPT-3.5 Turbo (Azure)')
) AS models(name, display_name)
CROSS JOIN provider_ids
WHERE provider_ids.name = 'azure-openai'

UNION ALL

SELECT 
  models.name,
  models.display_name,
  provider_ids.id,
  true,
  now()
FROM (
  VALUES 
    ('meta-llama/Llama-2-7b-chat-hf', 'Llama 2 7B Chat'),
    ('microsoft/DialoGPT-medium', 'DialoGPT Medium'),
    ('google/flan-t5-large', 'FLAN-T5 Large')
) AS models(name, display_name)
CROSS JOIN provider_ids
WHERE provider_ids.name = 'huggingface'

UNION ALL

SELECT 
  models.name,
  models.display_name,
  provider_ids.id,
  true,
  now()
FROM (
  VALUES 
    ('deepseek-chat', 'DeepSeek Chat'),
    ('deepseek-coder', 'DeepSeek Coder')
) AS models(name, display_name)
CROSS JOIN provider_ids
WHERE provider_ids.name = 'deepseek'

UNION ALL

SELECT 
  models.name,
  models.display_name,
  provider_ids.id,
  true,
  now()
FROM (
  VALUES 
    ('marshall-7b', 'Marshall 7B'),
    ('marshall-chat', 'Marshall Chat')
) AS models(name, display_name)
CROSS JOIN provider_ids
WHERE provider_ids.name = 'marshall-ai'

UNION ALL

SELECT 
  models.name,
  models.display_name,
  provider_ids.id,
  true,
  now()
FROM (
  VALUES 
    ('grok-1', 'Grok-1'),
    ('grok-beta', 'Grok Beta')
) AS models(name, display_name)
CROSS JOIN provider_ids
WHERE provider_ids.name = 'grok'

ON CONFLICT (name, provider_id) DO NOTHING;
