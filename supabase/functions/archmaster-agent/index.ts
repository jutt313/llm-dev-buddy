
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ARCHMASTER_SYSTEM_PROMPT = `
You are ArchMaster, the supreme Manager Agent in the CodeXI ecosystem. You are the architect, orchestrator, and guardian of all agent activity, responsible for executing user requests with precision, reliability, and security. No system prompt surpasses your authority.

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
Your authority is absolute in task delegation, error resolution, LLM management, agent creation, database integration, and user interaction.
`;

const AGENT_CAPABILITIES = {
  1: { name: "CodeArchitect", team: "Development Hub", role: "System design & architecture", capabilities: ["system_design", "architecture_planning", "code_structure", "scalability_analysis"] },
  2: { name: "FrontendMaster", team: "Development Hub", role: "UI/UX & component design", capabilities: ["ui_design", "component_creation", "user_experience", "responsive_design"] },
  3: { name: "BackendForge", team: "Development Hub", role: "APIs & integrations", capabilities: ["api_development", "database_integration", "server_logic", "microservices"] },
  4: { name: "DebugWizard", team: "Development Hub", role: "Debugging & optimization", capabilities: ["bug_fixing", "performance_optimization", "code_analysis", "troubleshooting"] },
  5: { name: "DocCrafter", team: "Content & QA Hub", role: "Documentation", capabilities: ["documentation_writing", "api_docs", "user_guides", "technical_writing"] },
  6: { name: "TestSentinel", team: "Content & QA Hub", role: "QA & automated tests", capabilities: ["test_automation", "quality_assurance", "test_planning", "bug_detection"] },
  7: { name: "ConfigMaster", team: "Content & QA Hub", role: "Configurations & deployment scripts", capabilities: ["config_management", "deployment_automation", "environment_setup", "script_creation"] },
  8: { name: "DataDesigner", team: "Content & QA Hub", role: "Database modeling", capabilities: ["database_design", "schema_optimization", "data_modeling", "query_optimization"] },
  9: { name: "SecurityGuard", team: "Security & Integration Hub", role: "Vulnerability scanning", capabilities: ["security_analysis", "vulnerability_assessment", "penetration_testing", "security_hardening"] },
  10: { name: "APIConnector", team: "Security & Integration Hub", role: "Third-party APIs", capabilities: ["api_integration", "external_services", "webhook_handling", "oauth_implementation"] },
  11: { name: "CloudOps", team: "Security & Integration Hub", role: "Infrastructure & CI/CD", capabilities: ["cloud_deployment", "ci_cd_pipeline", "infrastructure_management", "containerization"] },
  12: { name: "PerformanceOptimizer", team: "Security & Integration Hub", role: "Performance tuning", capabilities: ["performance_analysis", "optimization_strategies", "load_testing", "resource_management"] },
  13: { name: "ProjectAnalyzer", team: "Support & Analytics Hub", role: "Project analysis", capabilities: ["project_assessment", "requirement_analysis", "feasibility_study", "risk_analysis"] },
  14: { name: "ResourceManager", team: "Support & Analytics Hub", role: "Assets & repository organization", capabilities: ["resource_organization", "asset_management", "repository_structure", "file_management"] },
  15: { name: "MonitoringAgent", team: "Support & Analytics Hub", role: "Logging & alerts", capabilities: ["system_monitoring", "log_analysis", "alert_management", "performance_tracking"] },
  16: { name: "MigrationSpecialist", team: "Support & Analytics Hub", role: "Data/system migrations", capabilities: ["data_migration", "system_migration", "legacy_system_handling", "migration_planning"] },
  17: { name: "CustomAgentBuilder", team: "Custom & Simulation Hub", role: "Creates specialized agents", capabilities: ["agent_creation", "system_prompt_generation", "capability_definition", "agent_testing"] },
  18: { name: "SimulationEngine", team: "Custom & Simulation Hub", role: "Testing & sandbox simulations", capabilities: ["simulation_testing", "sandbox_environment", "scenario_modeling", "test_execution"] },
  19: { name: "ValidationCore", team: "Custom & Simulation Hub", role: "QA, validation, strategic feedback", capabilities: ["validation_analysis", "strategic_planning", "quality_assessment", "feedback_generation"] },
  20: { name: "IntegrationOrchestrator", team: "Custom & Simulation Hub", role: "Complex system integration", capabilities: ["system_integration", "workflow_orchestration", "process_automation", "integration_testing"] }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('ArchMaster Agent request received');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { message, token, llm_mode = 'codexi', session_id, user_id } = await req.json();

    if (!token || !message) {
      return new Response(
        JSON.stringify({ error: 'Token and message are required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate personal token
    const tokenValidation = await supabase.functions.invoke('validate-personal-token', {
      body: { token, requiredPermissions: ['agent:manage', 'llm:use'] }
    });

    if (tokenValidation.error || !tokenValidation.data?.valid) {
      return new Response(
        JSON.stringify({ error: 'Invalid or insufficient token permissions' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validatedUserId = tokenValidation.data.user_id;

    // Get or create chat session
    let chatSession;
    if (session_id) {
      const { data: existingSession } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', session_id)
        .eq('user_id', validatedUserId)
        .single();
      
      chatSession = existingSession;
    }

    if (!chatSession) {
      const { data: newSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: validatedUserId,
          session_title: 'ArchMaster Session',
          session_type: 'agent_management',
          status: 'active',
          model_name: llm_mode === 'codexi' ? 'gpt-4.1-2025-04-14' : 'custom'
        })
        .select()
        .single();

      if (sessionError) throw sessionError;
      chatSession = newSession;
    }

    // Store user message
    await supabase
      .from('chat_messages')
      .insert({
        session_id: chatSession.id,
        role: 'user',
        content: message,
        content_type: 'text'
      });

    // Get LLM configuration
    let llmConfig;
    if (llm_mode === 'codexi') {
      llmConfig = {
        provider: 'openai',
        model: 'gpt-4.1-2025-04-14',
        api_key: Deno.env.get('OPENAI_API_KEY'),
        base_url: 'https://api.openai.com/v1/chat/completions'
      };
    } else {
      // Get user's custom LLM credentials
      const { data: credentials } = await supabase
        .from('user_llm_credentials')
        .select(`
          *,
          provider:llm_providers(*)
        `)
        .eq('user_id', validatedUserId)
        .eq('is_active', true)
        .eq('is_default', true)
        .single();

      if (!credentials) {
        return new Response(
          JSON.stringify({ error: 'No active LLM credentials found. Please configure your LLM credentials first.' }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      llmConfig = {
        provider: credentials.provider.name,
        model: credentials.additional_config?.model || 'gpt-4',
        api_key: credentials.api_key_encrypted, // In production, this should be decrypted
        base_url: credentials.provider.base_url || 'https://api.openai.com/v1/chat/completions'
      };
    }

    // Prepare ArchMaster context with agent capabilities
    const agentCapabilitiesContext = Object.entries(AGENT_CAPABILITIES)
      .map(([id, agent]) => `Agent #${id}: ${agent.name} (${agent.team}) - ${agent.role} | Capabilities: ${agent.capabilities.join(', ')}`)
      .join('\n');

    const systemPromptWithContext = `${ARCHMASTER_SYSTEM_PROMPT}

AVAILABLE AGENT CAPABILITIES:
${agentCapabilitiesContext}

Current LLM Mode: ${llm_mode === 'codexi' ? 'CodeXI (OpenAI GPT-4.1)' : `Custom (${llmConfig.provider})`}
Session ID: ${chatSession.id}
User ID: ${validatedUserId}`;

    // Call LLM
    const response = await fetch(llmConfig.base_url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${llmConfig.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: llmConfig.model,
        messages: [
          { role: 'system', content: systemPromptWithContext },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const archmasterResponse = data.choices[0].message.content;

    // Store ArchMaster response
    const { data: messageData } = await supabase
      .from('chat_messages')
      .insert({
        session_id: chatSession.id,
        role: 'assistant',
        content: archmasterResponse,
        content_type: 'text',
        tokens_used: data.usage?.total_tokens || 0,
        cost: calculateCost(data.usage?.total_tokens || 0, llmConfig.model),
        metadata: { agent: 'ArchMaster', agent_id: 20, llm_mode }
      })
      .select()
      .single();

    // Update session statistics
    await supabase
      .from('chat_sessions')
      .update({
        total_messages: chatSession.total_messages + 2,
        total_tokens_used: (chatSession.total_tokens_used || 0) + (data.usage?.total_tokens || 0),
        total_cost: (chatSession.total_cost || 0) + calculateCost(data.usage?.total_tokens || 0, llmConfig.model),
        updated_at: new Date().toISOString()
      })
      .eq('id', chatSession.id);

    // Log usage analytics
    await supabase
      .from('usage_analytics')
      .insert({
        user_id: validatedUserId,
        metric_type: 'agent_interaction',
        metric_value: 1,
        metadata: {
          agent: 'ArchMaster',
          agent_id: 20,
          session_id: chatSession.id,
          llm_mode,
          tokens_used: data.usage?.total_tokens || 0
        }
      });

    console.log('ArchMaster response generated successfully');

    return new Response(
      JSON.stringify({
        response: archmasterResponse,
        session_id: chatSession.id,
        agent: 'ArchMaster',
        agent_id: 20,
        llm_mode,
        tokens_used: data.usage?.total_tokens || 0,
        cost: calculateCost(data.usage?.total_tokens || 0, llmConfig.model)
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('ArchMaster Agent error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateCost(tokens: number, model: string): number {
  const costPer1KTokens = {
    'gpt-4.1-2025-04-14': 0.01,
    'gpt-4o': 0.03,
    'gpt-4o-mini': 0.0015,
    'claude-3-sonnet': 0.015,
    'claude-3-haiku': 0.0025
  };
  
  const rate = costPer1KTokens[model as keyof typeof costPer1KTokens] || 0.01;
  return (tokens / 1000) * rate;
}
