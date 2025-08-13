
-- Create agent_registry table to store all agent capabilities and metadata
CREATE TABLE public.agent_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_number INTEGER NOT NULL UNIQUE,
  agent_name TEXT NOT NULL,
  agent_codename TEXT NOT NULL,
  team_name TEXT NOT NULL,
  team_number INTEGER NOT NULL,
  basic_role TEXT NOT NULL,
  capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  specializations JSONB NOT NULL DEFAULT '[]'::jsonb,
  system_prompt TEXT NULL,
  is_built BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  performance_metrics JSONB NOT NULL DEFAULT '{"success_rate": 0, "avg_response_time": 0, "tasks_completed": 0, "errors_count": 0}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id)
);

-- Add Row Level Security
ALTER TABLE public.agent_registry ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own agent registry
CREATE POLICY "Users can manage their own agent registry"
  ON public.agent_registry
  FOR ALL
  USING (auth.uid() = user_id);

-- Insert all 20 agents with their basic information
INSERT INTO public.agent_registry (agent_number, agent_name, agent_codename, team_name, team_number, basic_role, user_id) VALUES
-- Team 1: Development Hub
(1, 'CodeArchitect', 'ARCH-001', 'Development Hub', 1, 'System design & architecture', auth.uid()),
(2, 'FrontendMaster', 'FRONT-002', 'Development Hub', 1, 'UI/UX & component design', auth.uid()),
(3, 'BackendForge', 'BACK-003', 'Development Hub', 1, 'APIs & integrations', auth.uid()),
(4, 'DebugWizard', 'DEBUG-004', 'Development Hub', 1, 'Debugging & optimization', auth.uid()),

-- Team 2: Content & QA Hub
(5, 'DocCrafter', 'DOC-005', 'Content & QA Hub', 2, 'Documentation', auth.uid()),
(6, 'TestSentinel', 'TEST-006', 'Content & QA Hub', 2, 'QA & automated tests', auth.uid()),
(7, 'ConfigMaster', 'CONFIG-007', 'Content & QA Hub', 2, 'Configurations & deployment scripts', auth.uid()),
(8, 'DataDesigner', 'DATA-008', 'Content & QA Hub', 2, 'Database modeling', auth.uid()),

-- Team 3: Security & Integration Hub
(9, 'SecurityGuard', 'SEC-009', 'Security & Integration Hub', 3, 'Vulnerability scanning', auth.uid()),
(10, 'APIConnector', 'API-010', 'Security & Integration Hub', 3, 'Third-party APIs', auth.uid()),
(11, 'CloudOps', 'CLOUD-011', 'Security & Integration Hub', 3, 'Infrastructure & CI/CD', auth.uid()),
(12, 'PerformanceOptimizer', 'PERF-012', 'Security & Integration Hub', 3, 'Performance tuning', auth.uid()),

-- Team 4: Support & Analytics Hub
(13, 'ProjectAnalyzer', 'PROJ-013', 'Support & Analytics Hub', 4, 'Project analysis', auth.uid()),
(14, 'ResourceManager', 'RES-014', 'Support & Analytics Hub', 4, 'Assets & repository organization', auth.uid()),
(15, 'MonitoringAgent', 'MON-015', 'Support & Analytics Hub', 4, 'Logging & alerts', auth.uid()),
(16, 'MigrationSpecialist', 'MIG-016', 'Support & Analytics Hub', 4, 'Data/system migrations', auth.uid()),

-- Team 5: Custom & Simulation Hub
(17, 'CustomAgentBuilder', 'CUSTOM-017', 'Custom & Simulation Hub', 5, 'Creates specialized agents', auth.uid()),
(18, 'SimulationEngine', 'SIM-018', 'Custom & Simulation Hub', 5, 'Testing & sandbox simulations', auth.uid()),
(19, 'ValidationCore', 'VALID-019', 'Custom & Simulation Hub', 5, 'QA, validation, strategic feedback', auth.uid()),
(20, 'IntegrationOrchestrator', 'INT-020', 'Custom & Simulation Hub', 5, 'Complex system integration', auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_agent_registry_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER agent_registry_updated_at
  BEFORE UPDATE ON public.agent_registry
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_registry_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_agent_registry_user_id ON public.agent_registry(user_id);
CREATE INDEX idx_agent_registry_agent_number ON public.agent_registry(agent_number);
CREATE INDEX idx_agent_registry_team_number ON public.agent_registry(team_number);
CREATE INDEX idx_agent_registry_is_built ON public.agent_registry(is_built);
CREATE INDEX idx_agent_registry_is_active ON public.agent_registry(is_active);
