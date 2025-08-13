
-- Add missing test_status column to user_llm_credentials table
ALTER TABLE user_llm_credentials 
ADD COLUMN IF NOT EXISTS test_status TEXT,
ADD COLUMN IF NOT EXISTS last_test_at TIMESTAMP WITH TIME ZONE;

-- Insert only the 3 missing providers
INSERT INTO llm_providers (name, display_name, base_url, documentation_url, is_active) VALUES
  ('deepseek', 'DeepSeek', 'https://api.deepseek.com', 'https://platform.deepseek.com/docs', true),
  ('marshall', 'Marshall AI', 'https://api.marshall.ai', 'https://docs.marshall.ai', true),
  ('grok', 'Grok (xAI)', 'https://api.x.ai', 'https://docs.x.ai', true)
ON CONFLICT (name) DO NOTHING;

-- Get provider IDs for adding models
DO $$
DECLARE
    azure_id UUID;
    huggingface_id UUID;
    deepseek_id UUID;
    marshall_id UUID;
    grok_id UUID;
    anthropic_id UUID;
    openai_id UUID;
BEGIN
    -- Get existing provider IDs
    SELECT id INTO azure_id FROM llm_providers WHERE name = 'azure';
    SELECT id INTO huggingface_id FROM llm_providers WHERE name = 'huggingface';
    SELECT id INTO anthropic_id FROM llm_providers WHERE name = 'anthropic';
    SELECT id INTO openai_id FROM llm_providers WHERE name = 'openai';
    SELECT id INTO deepseek_id FROM llm_providers WHERE name = 'deepseek';
    SELECT id INTO marshall_id FROM llm_providers WHERE name = 'marshall';
    SELECT id INTO grok_id FROM llm_providers WHERE name = 'grok';
    
    -- Add Azure OpenAI models (currently has 0)
    INSERT INTO llm_models (provider_id, name, display_name, description, context_length, supports_vision, supports_function_calling, is_active) VALUES
      (azure_id, 'gpt-4', 'GPT-4', 'Azure GPT-4', 8192, true, true, true),
      (azure_id, 'gpt-4-turbo', 'GPT-4 Turbo', 'Azure GPT-4 Turbo', 128000, true, true, true),
      (azure_id, 'gpt-3.5-turbo', 'GPT-3.5 Turbo', 'Azure GPT-3.5 Turbo', 16384, false, true, true),
      (azure_id, 'gpt-4o', 'GPT-4o', 'Azure GPT-4o', 128000, true, true, true);
    
    -- Add Hugging Face models (currently has 0)
    INSERT INTO llm_models (provider_id, name, display_name, description, context_length, supports_vision, supports_function_calling, is_active) VALUES
      (huggingface_id, 'microsoft/DialoGPT-large', 'DialoGPT Large', 'Conversational AI model', 1024, false, false, true),
      (huggingface_id, 'facebook/blenderbot-400M-distill', 'BlenderBot 400M', 'Conversational AI', 128, false, false, true),
      (huggingface_id, 'microsoft/phi-2', 'Phi-2', 'Small language model', 2048, false, true, true),
      (huggingface_id, 'mistralai/Mistral-7B-Instruct-v0.1', 'Mistral 7B Instruct', 'Instruction-following model', 8192, false, true, true),
      (huggingface_id, 'codellama/CodeLlama-7b-Python-hf', 'CodeLlama Python', 'Code generation model', 16384, false, true, true),
      (huggingface_id, 'NousResearch/Nous-Hermes-2-Yi-34B', 'Nous Hermes 2 Yi 34B', 'Large instruction model', 4096, false, true, true);
    
    -- Add DeepSeek models
    INSERT INTO llm_models (provider_id, name, display_name, description, context_length, supports_vision, supports_function_calling, is_active) VALUES
      (deepseek_id, 'deepseek-r1', 'DeepSeek-R1', 'DeepSeek reasoning model', 64000, false, true, true),
      (deepseek_id, 'deepseek-v3', 'DeepSeek-V3', 'DeepSeek V3 model', 64000, true, true, true);
    
    -- Add Marshall AI models
    INSERT INTO llm_models (provider_id, name, display_name, description, context_length, supports_vision, supports_function_calling, is_active) VALUES
      (marshall_id, 'marshall-ai-v1', 'Marshall AI v1', 'Marshall AI model v1', 32000, false, true, true),
      (marshall_id, 'marshall-ai-v2', 'Marshall AI v2', 'Marshall AI model v2', 64000, true, true, true);
    
    -- Add Grok models
    INSERT INTO llm_models (provider_id, name, display_name, description, context_length, supports_vision, supports_function_calling, is_active) VALUES
      (grok_id, 'grok-2', 'Grok 2', 'Grok 2 model', 128000, true, true, true),
      (grok_id, 'grok-beta', 'Grok Beta', 'Grok beta model', 64000, false, true, true);
    
    -- Update existing Anthropic models to latest versions
    UPDATE llm_models SET 
      name = 'claude-3-5-sonnet-20241022',
      display_name = 'Claude 3.5 Sonnet',
      description = 'Latest Claude 3.5 Sonnet model',
      context_length = 200000,
      supports_vision = true,
      supports_function_calling = true
    WHERE provider_id = anthropic_id AND name = 'claude-3-haiku-20240307';
    
    -- Update existing OpenAI models
    UPDATE llm_models SET 
      name = 'gpt-4-turbo-2024-04-09',
      display_name = 'GPT-4 Turbo',
      description = 'Latest GPT-4 Turbo model',
      context_length = 128000,
      supports_vision = true
    WHERE provider_id = openai_id AND name = 'gpt-4-turbo-preview';
    
    UPDATE llm_models SET 
      name = 'gpt-4o-2024-08-06',
      display_name = 'GPT-4o',
      description = 'Latest GPT-4o model',
      context_length = 128000,
      supports_vision = true
    WHERE provider_id = openai_id AND name = 'gpt-4o';
    
END $$;
