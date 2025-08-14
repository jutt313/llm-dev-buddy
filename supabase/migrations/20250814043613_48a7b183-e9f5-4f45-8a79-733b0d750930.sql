
-- Agent Memory System Tables

-- Agent local and universal memory storage
CREATE TABLE agent_memory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id INTEGER NOT NULL,
  user_id UUID NOT NULL,
  session_id UUID,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('local', 'universal', 'conversation', 'task_history', 'error_log')),
  memory_key TEXT NOT NULL,
  memory_value JSONB NOT NULL,
  context_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Agent conversations with ValidationCore (#19)
CREATE TABLE agent_validations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requesting_agent_id INTEGER NOT NULL,
  validation_agent_id INTEGER DEFAULT 19,
  user_id UUID NOT NULL,
  session_id UUID,
  request_type TEXT NOT NULL CHECK (request_type IN ('clarification', 'validation', 'approval', 'cross_agent_query')),
  request_data JSONB NOT NULL,
  response_data JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected', 'timeout')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Agent task execution logs
CREATE TABLE agent_task_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id INTEGER NOT NULL,
  user_id UUID NOT NULL,
  session_id UUID,
  task_summary TEXT NOT NULL,
  task_data JSONB NOT NULL,
  execution_steps JSONB DEFAULT '[]',
  validation_requests UUID[] DEFAULT '{}',
  final_output JSONB,
  status TEXT DEFAULT 'started' CHECK (status IN ('started', 'planning', 'validating', 'executing', 'completed', 'failed')),
  tokens_used INTEGER DEFAULT 0,
  execution_time_ms INTEGER,
  error_logs JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Agent performance checklist templates
CREATE TABLE agent_checklists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id INTEGER NOT NULL,
  checklist_name TEXT NOT NULL,
  checklist_items JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_task_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_checklists ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can manage their own agent memory" ON agent_memory FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own agent validations" ON agent_validations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own agent task logs" ON agent_task_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own agent checklists" ON agent_checklists FOR ALL USING (auth.uid() = created_by);

-- Create indexes for performance
CREATE INDEX idx_agent_memory_agent_user ON agent_memory(agent_id, user_id);
CREATE INDEX idx_agent_memory_type ON agent_memory(memory_type);
CREATE INDEX idx_agent_memory_session ON agent_memory(session_id);
CREATE INDEX idx_agent_validations_status ON agent_validations(status);
CREATE INDEX idx_agent_task_logs_status ON agent_task_logs(status);
CREATE INDEX idx_agent_task_logs_agent_user ON agent_task_logs(agent_id, user_id);

-- Insert default checklist for CodeArchitect (Agent #1)
INSERT INTO agent_checklists (agent_id, checklist_name, checklist_items, is_default, created_by) VALUES 
(1, 'CodeArchitect Quality Checklist', '{
  "requirements_analysis": {
    "description": "Verify all requirements are clearly understood",
    "items": ["Requirements documented", "Constraints identified", "Success criteria defined"]
  },
  "architecture_design": {
    "description": "Ensure architectural solution is complete and scalable",
    "items": ["System components identified", "Data flow documented", "Integration points defined", "Scalability considerations addressed"]
  },
  "security_validation": {
    "description": "Validate security architecture requirements",
    "items": ["Authentication strategy defined", "Authorization model designed", "Data encryption considered", "Security vulnerabilities assessed"]
  },
  "performance_optimization": {
    "description": "Ensure performance requirements are met",
    "items": ["Performance benchmarks identified", "Caching strategy defined", "Database optimization considered", "Load balancing planned"]
  },
  "code_quality": {
    "description": "Validate code structure and maintainability",
    "items": ["Code structure follows best practices", "Documentation is comprehensive", "Error handling implemented", "Testing strategy defined"]
  },
  "validation_core_approval": {
    "description": "Ensure ValidationCore has approved critical decisions",
    "items": ["Complex decisions validated with Agent #19", "Risk assessment completed", "Alternative solutions considered"]
  }
}', true, '00000000-0000-0000-0000-000000000000');
