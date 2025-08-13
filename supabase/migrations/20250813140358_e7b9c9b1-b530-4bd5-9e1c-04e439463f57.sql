
-- Create table for CLI command history
CREATE TABLE public.cli_command_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  command TEXT NOT NULL,
  args JSONB DEFAULT '[]'::jsonb,
  output TEXT,
  error_message TEXT,
  execution_status TEXT DEFAULT 'success',
  execution_time_ms INTEGER DEFAULT 0,
  session_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for CLI sessions with better structure
CREATE TABLE public.cli_user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_name TEXT,
  status TEXT DEFAULT 'active',
  last_command TEXT,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create table for custom CLI aliases
CREATE TABLE public.cli_aliases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alias_name TEXT NOT NULL,
  command TEXT NOT NULL,
  description TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, alias_name)
);

-- Create table for CLI user preferences
CREATE TABLE public.cli_user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  default_llm TEXT,
  terminal_theme TEXT DEFAULT 'dark',
  auto_complete BOOLEAN DEFAULT true,
  command_history_limit INTEGER DEFAULT 1000,
  session_timeout_minutes INTEGER DEFAULT 480,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.cli_command_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cli_user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cli_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cli_user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for cli_command_history
CREATE POLICY "Users can manage their own command history" 
  ON public.cli_command_history 
  FOR ALL 
  USING (auth.uid() = user_id);

-- RLS policies for cli_user_sessions
CREATE POLICY "Users can manage their own CLI sessions" 
  ON public.cli_user_sessions 
  FOR ALL 
  USING (auth.uid() = user_id);

-- RLS policies for cli_aliases
CREATE POLICY "Users can manage their own CLI aliases" 
  ON public.cli_aliases 
  FOR ALL 
  USING (auth.uid() = user_id);

-- RLS policies for cli_user_preferences
CREATE POLICY "Users can manage their own CLI preferences" 
  ON public.cli_user_preferences 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_cli_command_history_user_created ON cli_command_history(user_id, created_at DESC);
CREATE INDEX idx_cli_user_sessions_user_status ON cli_user_sessions(user_id, status);
CREATE INDEX idx_cli_aliases_user_name ON cli_aliases(user_id, alias_name);
