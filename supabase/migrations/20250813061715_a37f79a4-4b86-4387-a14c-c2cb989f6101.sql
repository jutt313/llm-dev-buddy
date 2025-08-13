
-- Add missing columns to user_llm_credentials table
ALTER TABLE user_llm_credentials 
ADD COLUMN IF NOT EXISTS test_status TEXT,
ADD COLUMN IF NOT EXISTS last_test_at TIMESTAMP WITH TIME ZONE;

-- Insert the 8 LLM providers
INSERT INTO llm_providers (id, name, display_name, base_url, documentation_url, is_active) VALUES
  ('anthropic-provider-id', 'anthropic', 'Anthropic', 'https://api.anthropic.com', 'https://docs.anthropic.com', true),
  ('openai-provider-id', 'openai', 'OpenAI', 'https://api.openai.com', 'https://platform.openai.com/docs', true),
  ('azure-provider-id', 'azure', 'Microsoft Azure OpenAI', 'https://api.openai.azure.com', 'https://docs.microsoft.com/azure/cognitive-services/openai', true),
  ('google-provider-id', 'google', 'Google Gemini', 'https://generativelanguage.googleapis.com', 'https://ai.google.dev/docs', true),
  ('huggingface-provider-id', 'huggingface', 'Hugging Face', 'https://api-inference.huggingface.co', 'https://huggingface.co/docs', true),
  ('deepseek-provider-id', 'deepseek', 'DeepSeek', 'https://api.deepseek.com', 'https://platform.deepseek.com/docs', true),
  ('marshall-provider-id', 'marshall', 'Marshall AI', 'https://api.marshall.ai', 'https://docs.marshall.ai', true),
  ('grok-provider-id', 'grok', 'Grok (xAI)', 'https://api.x.ai', 'https://docs.x.ai', true)
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  base_url = EXCLUDED.base_url,
  documentation_url = EXCLUDED.documentation_url;

-- Insert models for each provider
INSERT INTO llm_models (provider_id, name, display_name, description, context_length, supports_vision, supports_function_calling, is_active) VALUES
  -- Anthropic models
  ('anthropic-provider-id', 'claude-4-opus', 'Claude 4 Opus', 'Most powerful Claude model', 200000, true, true, true),
  ('anthropic-provider-id', 'claude-4-sonnet', 'Claude 4 Sonnet', 'Balanced Claude model', 200000, true, true, true),
  ('anthropic-provider-id', 'claude-4.1', 'Claude 4.1', 'Latest Claude model', 200000, true, true, true),
  ('anthropic-provider-id', 'claude-3.5-sonnet', 'Claude 3.5 Sonnet', 'Enhanced Claude 3.5', 200000, true, true, true),
  ('anthropic-provider-id', 'claude-3-opus', 'Claude 3 Opus', 'Claude 3 flagship', 200000, true, true, true),
  
  -- OpenAI models
  ('openai-provider-id', 'gpt-5', 'GPT-5', 'Next generation GPT', 128000, true, true, true),
  ('openai-provider-id', 'gpt-4.1', 'GPT-4.1', 'Enhanced GPT-4', 128000, true, true, true),
  ('openai-provider-id', 'gpt-4', 'GPT-4', 'Advanced GPT model', 8192, true, true, true),
  ('openai-provider-id', 'gpt-3.5-turbo', 'GPT-3.5 Turbo', 'Fast and efficient', 16384, false, true, true),
  ('openai-provider-id', 'gpt-3', 'GPT-3', 'Base GPT-3 model', 4096, false, false, true),
  
  -- Azure OpenAI models
  ('azure-provider-id', 'gpt-5', 'GPT-5', 'Azure GPT-5', 128000, true, true, true),
  ('azure-provider-id', 'gpt-5-mini', 'GPT-5 Mini', 'Lightweight GPT-5', 32000, false, true, true),
  ('azure-provider-id', 'gpt-5-nano', 'GPT-5 Nano', 'Ultra-fast GPT-5', 8000, false, false, true),
  ('azure-provider-id', 'gpt-5-chat', 'GPT-5 Chat', 'Chat-optimized GPT-5', 128000, true, true, true),
  
  -- Google Gemini models
  ('google-provider-id', 'gemini-2.5-pro-diamond', 'Gemini 2.5 Pro Diamond', 'Premium Gemini model', 1000000, true, true, true),
  ('google-provider-id', 'gemini-2.5-flash-spark', 'Gemini 2.5 Flash Spark', 'Fast Gemini model', 1000000, true, true, true),
  
  -- Hugging Face models
  ('huggingface-provider-id', 'openai/gpt-oss-120b', 'GPT OSS 120B', 'Open source GPT 120B', 32000, false, true, true),
  ('huggingface-provider-id', 'openai/gpt-oss-20b', 'GPT OSS 20B', 'Open source GPT 20B', 16000, false, true, true),
  ('huggingface-provider-id', 'Qwen/Qwen3-4B-Thinking-2507', 'Qwen3 4B Thinking', 'Qwen thinking model', 32000, false, true, true),
  ('huggingface-provider-id', 'zai-org/GLM-4.5V', 'GLM 4.5V', 'GLM vision model', 8000, true, true, true),
  ('huggingface-provider-id', 'deepseek-ai/DeepSeek-R1', 'DeepSeek R1', 'DeepSeek reasoning model', 32000, false, true, true),
  ('huggingface-provider-id', 'deepseek-ai/DeepSeek-V3', 'DeepSeek V3', 'DeepSeek V3 model', 64000, true, true, true),
  
  -- DeepSeek models
  ('deepseek-provider-id', 'deepseek-r1', 'DeepSeek-R1 (685B)', 'DeepSeek reasoning 685B', 64000, false, true, true),
  ('deepseek-provider-id', 'deepseek-v3', 'DeepSeek-V3 (685B)', 'DeepSeek V3 685B', 64000, true, true, true),
  
  -- Marshall models
  ('marshall-provider-id', 'marshall-ai-v1', 'Marshall AI v1', 'Marshall AI model v1', 32000, false, true, true),
  ('marshall-provider-id', 'marshall-ai-v2', 'Marshall AI v2', 'Marshall AI model v2', 64000, true, true, true),
  
  -- Grok models
  ('grok-provider-id', 'grok-4', 'Grok 4', 'Latest Grok model', 128000, true, true, true),
  ('grok-provider-id', 'grok-3', 'Grok 3', 'Grok 3 model', 64000, false, true, true)
ON CONFLICT (provider_id, name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  context_length = EXCLUDED.context_length,
  supports_vision = EXCLUDED.supports_vision,
  supports_function_calling = EXCLUDED.supports_function_calling;
