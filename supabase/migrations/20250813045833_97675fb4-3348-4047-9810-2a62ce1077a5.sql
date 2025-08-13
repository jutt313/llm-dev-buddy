
-- =====================================================
-- COMPREHENSIVE DATABASE SCHEMA FOR AI DEVELOPMENT HUB
-- =====================================================

-- 1. LLM PROVIDERS TABLE
-- Stores different AI/LLM service providers
CREATE TABLE public.llm_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- e.g., 'OpenAI', 'Anthropic', 'Google', 'Azure'
  display_name TEXT NOT NULL,
  base_url TEXT,
  documentation_url TEXT,
  icon_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. LLM MODELS TABLE
-- Stores available models for each provider
CREATE TABLE public.llm_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES public.llm_providers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, -- e.g., 'gpt-4', 'claude-3-sonnet'
  display_name TEXT NOT NULL,
  description TEXT,
  context_length INTEGER,
  supports_vision BOOLEAN DEFAULT false,
  supports_function_calling BOOLEAN DEFAULT false,
  input_cost_per_token DECIMAL(10,8),
  output_cost_per_token DECIMAL(10,8),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(provider_id, name)
);

-- 3. USER LLM CREDENTIALS TABLE
-- Stores encrypted API keys and credentials for each user
CREATE TABLE public.user_llm_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.llm_providers(id) ON DELETE CASCADE NOT NULL,
  credential_name TEXT NOT NULL, -- User-defined name for this credential
  api_key_encrypted TEXT NOT NULL, -- Encrypted API key
  additional_config JSONB DEFAULT '{}', -- Additional provider-specific config
  is_default BOOLEAN DEFAULT false, -- Default credential for this provider
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider_id, credential_name)
);

-- 4. PERSONAL ACCESS TOKENS TABLE
-- Stores user-generated personal tokens for CLI access
CREATE TABLE public.personal_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token_name TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE, -- Hashed token value
  token_prefix TEXT NOT NULL, -- First few characters for display
  permissions JSONB DEFAULT '{}', -- Token permissions/scopes
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. PROJECTS TABLE
-- Stores user projects/workspaces
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  project_type TEXT DEFAULT 'general', -- 'web', 'mobile', 'api', 'general'
  status TEXT DEFAULT 'active', -- 'active', 'archived', 'deleted'
  settings JSONB DEFAULT '{}', -- Project-specific settings
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. CHAT SESSIONS TABLE
-- Stores chat/conversation sessions
CREATE TABLE public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  provider_id UUID REFERENCES public.llm_providers(id) ON DELETE SET NULL,
  model_name TEXT,
  session_title TEXT,
  session_type TEXT DEFAULT 'chat', -- 'chat', 'code_generation', 'debugging'
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'error'
  total_messages INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  total_cost DECIMAL(10,4) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. CHAT MESSAGES TABLE
-- Stores individual messages in chat sessions
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text', -- 'text', 'code', 'image', 'file'
  tokens_used INTEGER DEFAULT 0,
  cost DECIMAL(10,4) DEFAULT 0,
  metadata JSONB DEFAULT '{}', -- Model response metadata, attachments, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. CLI COMMANDS TABLE
-- Stores CLI command history and executions
CREATE TABLE public.cli_commands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE SET NULL,
  command TEXT NOT NULL,
  command_type TEXT, -- 'generate', 'deploy', 'test', 'build'
  execution_status TEXT DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  output TEXT,
  error_message TEXT,
  execution_time_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. AGENT CONFIGURATIONS TABLE
-- Stores custom AI agent configurations
CREATE TABLE public.agent_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  model_config JSONB DEFAULT '{}', -- Temperature, max_tokens, etc.
  provider_id UUID REFERENCES public.llm_providers(id) ON DELETE SET NULL,
  model_name TEXT,
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 10. USAGE ANALYTICS TABLE
-- Stores usage analytics and metrics
CREATE TABLE public.usage_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.llm_providers(id) ON DELETE SET NULL,
  metric_type TEXT NOT NULL, -- 'api_call', 'token_usage', 'cost', 'session_duration'
  metric_value DECIMAL(15,4) NOT NULL,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 11. INTEGRATIONS TABLE
-- Stores third-party integrations and webhooks
CREATE TABLE public.integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  integration_type TEXT NOT NULL, -- 'github', 'slack', 'discord', 'webhook'
  name TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.llm_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_llm_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cli_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Public read access for providers and models (no user restriction needed)
CREATE POLICY "Anyone can view LLM providers" ON public.llm_providers FOR SELECT USING (true);
CREATE POLICY "Anyone can view LLM models" ON public.llm_models FOR SELECT USING (true);

-- User-specific policies for all other tables
CREATE POLICY "Users can manage their own credentials" ON public.user_llm_credentials FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own tokens" ON public.personal_tokens FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own chat sessions" ON public.chat_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own CLI commands" ON public.cli_commands FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own agent configs" ON public.agent_configurations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own analytics" ON public.usage_analytics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own integrations" ON public.integrations FOR ALL USING (auth.uid() = user_id);

-- Chat messages policy (access through session ownership)
CREATE POLICY "Users can manage messages in their sessions" ON public.chat_messages 
FOR ALL USING (EXISTS (
  SELECT 1 FROM public.chat_sessions 
  WHERE chat_sessions.id = chat_messages.session_id 
  AND chat_sessions.user_id = auth.uid()
));

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User-based indexes
CREATE INDEX idx_user_llm_credentials_user_id ON public.user_llm_credentials(user_id);
CREATE INDEX idx_personal_tokens_user_id ON public.personal_tokens(user_id);
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX idx_cli_commands_user_id ON public.cli_commands(user_id);
CREATE INDEX idx_usage_analytics_user_id ON public.usage_analytics(user_id);

-- Relationship indexes
CREATE INDEX idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX idx_chat_sessions_project_id ON public.chat_sessions(project_id);
CREATE INDEX idx_llm_models_provider_id ON public.llm_models(provider_id);

-- Time-based indexes for analytics
CREATE INDEX idx_chat_sessions_created_at ON public.chat_sessions(created_at);
CREATE INDEX idx_usage_analytics_recorded_at ON public.usage_analytics(recorded_at);
CREATE INDEX idx_cli_commands_executed_at ON public.cli_commands(executed_at);

-- =====================================================
-- SAMPLE DATA FOR PROVIDERS AND MODELS
-- =====================================================

-- Insert LLM Providers
INSERT INTO public.llm_providers (name, display_name, base_url, documentation_url) VALUES
('openai', 'OpenAI', 'https://api.openai.com/v1', 'https://platform.openai.com/docs'),
('anthropic', 'Anthropic', 'https://api.anthropic.com', 'https://docs.anthropic.com'),
('google', 'Google AI', 'https://generativelanguage.googleapis.com', 'https://ai.google.dev/docs'),
('azure_openai', 'Azure OpenAI', NULL, 'https://docs.microsoft.com/en-us/azure/ai-services/openai/'),
('huggingface', 'Hugging Face', 'https://api-inference.huggingface.co', 'https://huggingface.co/docs/api-inference/index');

-- Insert Popular Models
INSERT INTO public.llm_models (provider_id, name, display_name, description, context_length, supports_vision, supports_function_calling) VALUES
-- OpenAI Models
((SELECT id FROM public.llm_providers WHERE name = 'openai'), 'gpt-4o', 'GPT-4 Omni', 'Most advanced multimodal model', 128000, true, true),
((SELECT id FROM public.llm_providers WHERE name = 'openai'), 'gpt-4-turbo', 'GPT-4 Turbo', 'High performance model with latest knowledge', 128000, true, true),
((SELECT id FROM public.llm_providers WHERE name = 'openai'), 'gpt-3.5-turbo', 'GPT-3.5 Turbo', 'Fast and efficient model', 16384, false, true),
-- Anthropic Models
((SELECT id FROM public.llm_providers WHERE name = 'anthropic'), 'claude-3-5-sonnet-20241022', 'Claude 3.5 Sonnet', 'Most intelligent model', 200000, true, true),
((SELECT id FROM public.llm_providers WHERE name = 'anthropic'), 'claude-3-haiku-20240307', 'Claude 3 Haiku', 'Fastest model for everyday tasks', 200000, true, true),
-- Google Models
((SELECT id FROM public.llm_providers WHERE name = 'google'), 'gemini-1.5-pro', 'Gemini 1.5 Pro', 'Advanced reasoning and multimodal capabilities', 2000000, true, true),
((SELECT id FROM public.llm_providers WHERE name = 'google'), 'gemini-1.5-flash', 'Gemini 1.5 Flash', 'Fast and versatile performance', 1000000, true, true);
