
-- Create the agent_registry table with all required columns
CREATE TABLE IF NOT EXISTS public.agent_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_number INTEGER NOT NULL,
  agent_name TEXT NOT NULL,
  agent_codename TEXT NOT NULL,
  team_name TEXT NOT NULL,
  team_number INTEGER NOT NULL,
  basic_role TEXT NOT NULL,
  capabilities TEXT[] DEFAULT '{}',
  specializations TEXT[] DEFAULT '{}',
  system_prompt TEXT,
  is_built BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  performance_metrics JSONB DEFAULT '{
    "success_rate": 0,
    "avg_response_time": 0,
    "tasks_completed": 0,
    "errors_count": 0
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.agent_registry ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own agent registry" 
  ON public.agent_registry 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create unique constraint to prevent duplicate agent numbers per user
CREATE UNIQUE INDEX IF NOT EXISTS agent_registry_user_agent_number_idx 
  ON public.agent_registry(user_id, agent_number);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS agent_registry_user_id_idx 
  ON public.agent_registry(user_id);

-- Create index for team queries
CREATE INDEX IF NOT EXISTS agent_registry_team_number_idx 
  ON public.agent_registry(team_number);
