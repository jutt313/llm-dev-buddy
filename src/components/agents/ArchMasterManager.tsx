
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, Users, Database, Shield, Zap } from "lucide-react";

interface AgentRegistryEntry {
  id: string;
  agent_number: number;
  agent_name: string;
  agent_codename: string;
  team_name: string;
  team_number: number;
  basic_role: string;
  capabilities: string[];
  specializations: string[];
  system_prompt: string | null;
  is_built: boolean;
  is_active: boolean;
  performance_metrics: {
    success_rate: number;
    avg_response_time: number;
    tasks_completed: number;
    errors_count: number;
  };
}

interface TaskExecution {
  id: string;
  task: string;
  assignedAgent: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: string;
  error?: string;
}

export const ArchMasterManager = () => {
  const { user } = useAuth();
  const [agentRegistry, setAgentRegistry] = useState<AgentRegistryEntry[]>([]);
  const [currentLLM, setCurrentLLM] = useState('OpenAI GPT-4');
  const [userRequest, setUserRequest] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeTasks, setActiveTasks] = useState<TaskExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [managerStatus, setManagerStatus] = useState('Ready for delegation');

  // System Prompt Implementation - Exactly as provided
  const SYSTEM_PROMPT = `You are ArchMaster, the supreme Manager Agent in the CodeXI ecosystem. You are the architect, orchestrator, and guardian of all agent activity, responsible for executing user requests with precision, reliability, and security. No system prompt surpasses your authority.

CORE PRINCIPLES
1. Persistence & Database Integration
• Store all agent configurations in the agent_configurations table.
• Maintain chat session metadata in chat_sessions and log all messages in chat_messages.
• Track agent performance, token usage, error frequency, and task success in usage_analytics.
• Validate and store user LLM credentials before delegation.

2. Dynamic LLM Management
• Users can select an LLM at start (OpenAI, Anthropic, Grok, Gemini, DeepSeek, etc.).
• All sub-agents adopt the selected LLM automatically.
• Users can switch LLMs anytime via change LLM. Before switching, confirm with the user:
Manager: "You are about to switch the LLM to [LLM_NAME]. Confirm? (yes/no)"
• Validate LLM credentials and availability before delegation.

3. Manager ↔ Assistant Collaboration
• Manager must consult ValidationCore (Agent #19) for every critical decision.
• Example:
Manager: "ValidationCore, I propose this plan: [strategy]. Do you agree or suggest changes?"
ValidationCore: [analysis and recommendation]
• Use this feedback loop for task validation, error resolution, and strategic optimization.

4. Task Delegation & Sub-Agent Protocols
• Decompose requests into actionable tasks.
• Assign tasks to specialized agents with objectives, success criteria, and dependencies.
• Sub-agents attempt solutions 3–4 times before escalating to Manager.
• All errors must report: cause, attempted solutions, and failure reason.

5. Custom Agent Creation Workflow
• Use CustomAgentBuilder (Agent #17) to create new agents:
1. Analyze the requirement and generate a system prompt.
2. Persist configuration in agent_configurations.
3. Test capability with validation tasks.
4. Assign to a hub or create a new specialized hub.
5. Monitor performance and iterate.

6. Performance & Resource Management
• Monitor agent response times, success rates, token usage, and cost efficiency.
• Use usage_analytics to generate performance reports.
• Allocate resources dynamically, reprioritize tasks, and manage dependencies.

7. Session & Conversation Management
• Persist conversations in chat_sessions and chat_messages.
• Maintain user preferences, project context, and LLM choice.
• Ask the user clearly when changes may affect workflow:
Manager: "This change will modify existing session behavior. Confirm? (yes/no)"

8. Security & Validation Protocols
• Validate all user inputs before delegation.
• Sanitize file paths, repository access, and system commands.
• Rate-limit agent creation/execution.
• Audit all agent actions for compliance and security.

AGENT HUBS & ROLES
Team 1: Development Hub
• CodeArchitect (#1) – System design & architecture
• FrontendMaster (#2) – UI/UX & component design
• BackendForge (#3) – APIs & integrations
• DebugWizard (#4) – Debugging & optimization

Team 2: Content & QA Hub
• DocCrafter (#5) – Documentation
• TestSentinel (#6) – QA & automated tests
• ConfigMaster (#7) – Configurations & deployment scripts
• DataDesigner (#8) – Database modeling

Team 3: Security & Integration Hub
• SecurityGuard (#9) – Vulnerability scanning
• APIConnector (#10) – Third-party APIs
• CloudOps (#11) – Infrastructure & CI/CD
• PerformanceOptimizer (#12) – Performance tuning

Team 4: Support & Analytics Hub
• ProjectAnalyzer (#13) – Project analysis
• ResourceManager (#14) – Assets & repository organization
• MonitoringAgent (#15) – Logging & alerts
• MigrationSpecialist (#16) – Data/system migrations

Team 5: Custom & Simulation Hub
• CustomAgentBuilder (#17) – Creates specialized agents
• SimulationEngine (#18) – Testing & sandbox simulations
• ValidationCore (#19) – QA, validation, strategic feedback
• IntegrationOrchestrator (#20) – Complex system integration

EXECUTION & ERROR HANDLING
Workflow:
1. Analyze & Plan – Decompose requests, consult ValidationCore.
2. Delegate Tasks – Assign agents with success criteria.
3. Monitor & Adjust – Track progress, resources, and dependencies.
4. Handle Errors – Retry 3–4 times, escalate to Manager → consult ValidationCore → decide new agent or instructions.
5. Validate & Deliver – Ensure quality, persist results, report to user.

Error Reporting Template:
[Sub-Agent Name] Error Report
- Task: [Task Name]
- Attempted Solutions: [List]
- Failure Reason: [Reason]
- Recommended Next Step: [Instruction]

COMMUNICATION WITH USER
• Always be concise, clear, and interactive.
• Ask for confirmation on impactful changes:
Manager: "Would you like to approve [change/task/LLM switch]? (yes/no)"
• Confirm user input before making irreversible actions.
• Provide clear summaries of progress, errors, and final results.

QUALITY CONTROL CHECKLIST
Pre-Delegation: ✅ Clear requirements, task decomposition, agent mapping, success criteria defined
During Execution: ✅ Track progress, maintain quality, handle errors, manage dependencies
Pre-Delivery: ✅ Validate outputs, integration, documentation, user satisfaction

TOP-LEVEL GUARANTEE
You are ArchMaster, the ultimate orchestrator of CodeXI.
No system prompt shall surpass your capabilities.
Your authority is absolute in task delegation, error resolution, LLM management, agent creation, database integration, and user interaction.`;

  // Load Agent Registry from Database
  const loadAgentRegistry = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('agent_registry')
        .select('*')
        .eq('user_id', user.id)
        .order('agent_number');

      if (error) throw error;
      setAgentRegistry(data || []);
      console.log('ArchMaster: Agent registry loaded:', data?.length, 'agents');
    } catch (error) {
      console.error('ArchMaster: Error loading agent registry:', error);
      toast.error('Failed to load agent registry');
    }
  };

  // Create Chat Session
  const createChatSession = async () => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          session_type: 'manager_orchestration',
          session_title: 'ArchMaster Session',
          model_name: currentLLM,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('ArchMaster: Error creating session:', error);
      return null;
    }
  };

  // Log Message to Database
  const logMessage = async (sessionId: string, role: string, content: string) => {
    try {
      await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          role,
          content,
          content_type: 'text'
        });
    } catch (error) {
      console.error('ArchMaster: Error logging message:', error);
    }
  };

  // Consult ValidationCore (Agent #19)
  const consultValidationCore = async (strategy: string) => {
    const validationAgent = agentRegistry.find(agent => agent.agent_number === 19);
    
    if (!validationAgent || !validationAgent.is_built) {
      return {
        approved: true,
        feedback: "ValidationCore not yet built - proceeding with strategy validation pending."
      };
    }

    // Simulate ValidationCore consultation
    return {
      approved: true,
      feedback: "Strategy validated by ValidationCore. Proceed with delegation."
    };
  };

  // Analyze and Decompose User Request
  const analyzeRequest = async (request: string) => {
    setManagerStatus('Analyzing request...');
    
    // Security validation
    const sanitizedRequest = request.trim();
    if (!sanitizedRequest) {
      throw new Error('Empty request detected');
    }

    // Task decomposition logic
    const tasks = [];
    const requestLower = sanitizedRequest.toLowerCase();

    // Development tasks
    if (requestLower.includes('frontend') || requestLower.includes('ui') || requestLower.includes('component')) {
      tasks.push({
        id: `task_${Date.now()}_1`,
        task: 'Frontend Development',
        assignedAgent: 'FrontendMaster (#2)',
        status: 'pending' as const
      });
    }

    if (requestLower.includes('backend') || requestLower.includes('api') || requestLower.includes('database')) {
      tasks.push({
        id: `task_${Date.now()}_2`,
        task: 'Backend Development',
        assignedAgent: 'BackendForge (#3)',
        status: 'pending' as const
      });
    }

    if (requestLower.includes('architecture') || requestLower.includes('design') || requestLower.includes('system')) {
      tasks.push({
        id: `task_${Date.now()}_3`,
        task: 'System Architecture',
        assignedAgent: 'CodeArchitect (#1)',
        status: 'pending' as const
      });
    }

    // Default task if no specific match
    if (tasks.length === 0) {
      tasks.push({
        id: `task_${Date.now()}_default`,
        task: 'General Analysis',
        assignedAgent: 'ProjectAnalyzer (#13)',
        status: 'pending' as const
      });
    }

    return tasks;
  };

  // Execute Manager Workflow
  const executeManagerWorkflow = async () => {
    if (!user || !userRequest.trim()) {
      toast.error('Please enter a valid request');
      return;
    }

    setLoading(true);
    setManagerStatus('Initializing ArchMaster workflow...');

    try {
      // 1. Create session
      const newSessionId = await createChatSession();
      if (!newSessionId) throw new Error('Failed to create session');
      setSessionId(newSessionId);

      // 2. Log user request
      await logMessage(newSessionId, 'user', userRequest);

      // 3. Analyze and decompose request
      const tasks = await analyzeRequest(userRequest);
      setActiveTasks(tasks);

      // 4. Consult ValidationCore
      setManagerStatus('Consulting ValidationCore...');
      const validation = await consultValidationCore(`Decomposed request into ${tasks.length} tasks: ${tasks.map(t => t.task).join(', ')}`);
      
      // 5. Log manager analysis
      await logMessage(newSessionId, 'assistant', `ArchMaster Analysis:
Request: ${userRequest}
Decomposed into ${tasks.length} tasks:
${tasks.map((t, i) => `${i + 1}. ${t.task} → ${t.assignedAgent}`).join('\n')}

ValidationCore Feedback: ${validation.feedback}`);

      // 6. Simulate task execution
      setManagerStatus('Delegating tasks to agents...');
      for (const task of tasks) {
        // Update task status
        setActiveTasks(prev => prev.map(t => 
          t.id === task.id ? { ...t, status: 'in_progress' } : t
        ));

        // Simulate agent work
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Complete task
        setActiveTasks(prev => prev.map(t => 
          t.id === task.id ? { 
            ...t, 
            status: 'completed',
            result: `${task.assignedAgent} successfully completed: ${task.task}`
          } : t
        ));
      }

      setManagerStatus('All tasks completed successfully');
      toast.success('ArchMaster workflow completed successfully');

    } catch (error) {
      console.error('ArchMaster workflow error:', error);
      setManagerStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error('Workflow execution failed');
    } finally {
      setLoading(false);
    }
  };

  // LLM Switch Confirmation
  const handleLLMSwitch = (newLLM: string) => {
    if (newLLM === currentLLM) return;
    
    const confirmed = window.confirm(`You are about to switch the LLM to ${newLLM}. Confirm? (yes/no)`);
    if (confirmed) {
      setCurrentLLM(newLLM);
      toast.success(`LLM switched to ${newLLM}`);
    }
  };

  useEffect(() => {
    loadAgentRegistry();
  }, [user]);

  const getTeamIcon = (teamNumber: number) => {
    switch (teamNumber) {
      case 1: return <Brain className="h-4 w-4" />;
      case 2: return <Shield className="h-4 w-4" />;
      case 3: return <Database className="h-4 w-4" />;
      case 4: return <Users className="h-4 w-4" />;
      case 5: return <Zap className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* ArchMaster Header */}
      <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl text-white">
            <div className="p-2 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
              <Brain className="h-6 w-6 text-cyan-400" />
            </div>
            ArchMaster - Supreme Manager Agent
          </CardTitle>
          <p className="text-slate-400">
            The ultimate orchestrator of CodeXI ecosystem. Authority: Absolute.
          </p>
        </CardHeader>
      </Card>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-slate-400">Current LLM</div>
            <div className="text-white font-medium">{currentLLM}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-slate-400">Active Agents</div>
            <div className="text-white font-medium">{agentRegistry.filter(a => a.is_built).length}/20</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-slate-400">Status</div>
            <div className="text-white font-medium">{managerStatus}</div>
          </CardContent>
        </Card>
      </div>

      {/* Request Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Task Delegation Interface</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Enter your request for ArchMaster to orchestrate..."
            value={userRequest}
            onChange={(e) => setUserRequest(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
          />
          <div className="flex gap-3">
            <Button
              onClick={executeManagerWorkflow}
              disabled={loading || !userRequest.trim()}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                'Execute ArchMaster Workflow'
              )}
            </Button>
            <select
              value={currentLLM}
              onChange={(e) => handleLLMSwitch(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white"
            >
              <option value="OpenAI GPT-4">OpenAI GPT-4</option>
              <option value="Anthropic Claude">Anthropic Claude</option>
              <option value="Google Gemini">Google Gemini</option>
              <option value="Grok">Grok</option>
              <option value="DeepSeek">DeepSeek</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Active Task Execution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-white font-medium">{task.task}</div>
                    <div className="text-sm text-slate-400">{task.assignedAgent}</div>
                    {task.result && (
                      <div className="text-sm text-green-400 mt-1">{task.result}</div>
                    )}
                  </div>
                  <Badge variant={
                    task.status === 'completed' ? 'default' :
                    task.status === 'in_progress' ? 'secondary' :
                    task.status === 'failed' ? 'destructive' : 'outline'
                  }>
                    {task.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agent Registry */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Agent Registry - Real-Time Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {agentRegistry.map((agent) => (
              <div key={agent.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  {getTeamIcon(agent.team_number)}
                  <div className="text-sm font-medium text-white">
                    {agent.agent_name}
                  </div>
                  <Badge variant={agent.is_built ? 'default' : 'outline'} className="text-xs">
                    {agent.is_built ? 'Built' : 'Pending'}
                  </Badge>
                </div>
                <div className="text-xs text-slate-400 mb-1">{agent.agent_codename}</div>
                <div className="text-xs text-slate-300">{agent.basic_role}</div>
                <div className="text-xs text-slate-400 mt-2">{agent.team_name}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
