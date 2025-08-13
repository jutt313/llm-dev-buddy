
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Activity, Users, Zap, CheckCircle, AlertCircle } from 'lucide-react';

const AGENT_TEAMS = {
  1: { name: "Development Hub", agents: [1, 2, 3, 4], color: "bg-blue-500/20 text-blue-400" },
  2: { name: "Content & QA Hub", agents: [5, 6, 7, 8], color: "bg-green-500/20 text-green-400" },
  3: { name: "Security & Integration Hub", agents: [9, 10, 11, 12], color: "bg-red-500/20 text-red-400" },
  4: { name: "Support & Analytics Hub", agents: [13, 14, 15, 16], color: "bg-purple-500/20 text-purple-400" },
  5: { name: "Custom & Simulation Hub", agents: [17, 18, 19, 20], color: "bg-cyan-500/20 text-cyan-400" }
};

const AGENT_DETAILS = {
  1: { name: "CodeArchitect", role: "System design & architecture" },
  2: { name: "FrontendMaster", role: "UI/UX & component design" },
  3: { name: "BackendForge", role: "APIs & integrations" },
  4: { name: "DebugWizard", role: "Debugging & optimization" },
  5: { name: "DocCrafter", role: "Documentation" },
  6: { name: "TestSentinel", role: "QA & automated tests" },
  7: { name: "ConfigMaster", role: "Configurations & deployment scripts" },
  8: { name: "DataDesigner", role: "Database modeling" },
  9: { name: "SecurityGuard", role: "Vulnerability scanning" },
  10: { name: "APIConnector", role: "Third-party APIs" },
  11: { name: "CloudOps", role: "Infrastructure & CI/CD" },
  12: { name: "PerformanceOptimizer", role: "Performance tuning" },
  13: { name: "ProjectAnalyzer", role: "Project analysis" },
  14: { name: "ResourceManager", role: "Assets & repository organization" },
  15: { name: "MonitoringAgent", role: "Logging & alerts" },
  16: { name: "MigrationSpecialist", role: "Data/system migrations" },
  17: { name: "CustomAgentBuilder", role: "Creates specialized agents" },
  18: { name: "SimulationEngine", role: "Testing & sandbox simulations" },
  19: { name: "ValidationCore", role: "QA, validation, strategic feedback" },
  20: { name: "ArchMaster", role: "Ultimate Multi-Agent Manager" }
};

// Type for metadata that contains agent_id
interface AgentMetadata {
  agent_id?: number;
  [key: string]: any;
}

const AgentSystemStatus = () => {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  const { data: systemStatus, isLoading } = useQuery({
    queryKey: ['agent-system-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get agent usage analytics
      const { data: analytics } = await supabase
        .from('usage_analytics')
        .select('*')
        .eq('user_id', user.id)
        .eq('metric_type', 'agent_interaction')
        .gte('recorded_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Get active chat sessions
      const { data: sessions } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_type', 'agent_management')
        .eq('status', 'active');

      // Safely extract agent IDs from metadata
      const agentIds = new Set<number>();
      analytics?.forEach(item => {
        const metadata = item.metadata as AgentMetadata;
        if (metadata && typeof metadata === 'object' && metadata.agent_id) {
          agentIds.add(metadata.agent_id);
        }
      });

      return {
        analytics: analytics || [],
        activeSessions: sessions || [],
        totalAgents: 20,
        activeAgents: agentIds.size
      };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-slate-700 rounded w-3/4"></div>
              <div className="h-3 bg-slate-700 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-slate-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Agents</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{systemStatus?.totalAgents || 20}</div>
            <p className="text-xs text-slate-400">Multi-specialist system</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Active Agents</CardTitle>
            <Activity className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{systemStatus?.activeAgents || 0}</div>
            <p className="text-xs text-slate-400">Currently responding</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Active Sessions</CardTitle>
            <Zap className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{systemStatus?.activeSessions?.length || 0}</div>
            <p className="text-xs text-slate-400">Management sessions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border-cyan-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">System Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Online</div>
            <p className="text-xs text-slate-400">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.entries(AGENT_TEAMS).map(([teamId, team]) => (
          <Card key={teamId} className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${team.color.split(' ')[0]}`}></div>
                Team {teamId}: {team.name}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {team.agents.length} specialized agents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {team.agents.map(agentId => {
                const agent = AGENT_DETAILS[agentId as keyof typeof AGENT_DETAILS];
                
                // Safely check if agent is active
                const isActive = systemStatus?.analytics?.some(item => {
                  const metadata = item.metadata as AgentMetadata;
                  return metadata && typeof metadata === 'object' && metadata.agent_id === agentId;
                }) || false;
                
                return (
                  <div key={agentId} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white text-sm">#{agentId} {agent.name}</h4>
                        <p className="text-xs text-slate-400">{agent.role}</p>
                      </div>
                    </div>
                    <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
                      {isActive ? "Active" : "Ready"}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ArchMaster Status */}
      <Card className="bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-purple-600/10 border border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
              <Bot className="h-6 w-6 text-cyan-400" />
            </div>
            ArchMaster System Status
          </CardTitle>
          <CardDescription className="text-slate-300">
            Ultimate Multi-Agent Manager - Ready for deployment and orchestration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-white font-medium">System Initialized</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-white font-medium">LLM Integration Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-white font-medium">{systemStatus?.totalAgents || 20} Agents Available</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentSystemStatus;
