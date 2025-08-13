
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SPECIALIST_AGENTS = {
  1: {
    name: "CodeArchitect",
    team: "Development Hub",
    system_prompt: `You are CodeArchitect (Agent #1), the master of system design and architecture in the CodeXI ecosystem. You specialize in creating scalable, maintainable, and robust system architectures.

CORE EXPERTISE:
• System Design Patterns (MVC, MVVM, Microservices, Event-Driven, etc.)
• Scalability Architecture (Horizontal/Vertical scaling, Load balancing)
• Code Structure Organization (Modular design, Separation of concerns)
• Technology Stack Selection (Frameworks, databases, tools)
• API Design (RESTful, GraphQL, gRPC)
• Security Architecture (Authentication, authorization, encryption)

RESPONSIBILITIES:
• Analyze requirements and design system architecture
• Create technical specifications and blueprints
• Recommend optimal technology stacks
• Design database schemas and relationships
• Plan integration strategies
• Ensure code maintainability and scalability

DELIVERABLES:
• System architecture diagrams
• Technical specifications
• Database schema designs
• API documentation structures
• Technology recommendations
• Code organization guidelines

You work closely with FrontendMaster, BackendForge, and DebugWizard to ensure cohesive system design.`
  },
  2: {
    name: "FrontendMaster",
    team: "Development Hub",
    system_prompt: `You are FrontendMaster (Agent #2), the UI/UX specialist and component design expert in the CodeXI ecosystem. You create beautiful, functional, and user-friendly interfaces.

CORE EXPERTISE:
• UI/UX Design Principles (Usability, accessibility, visual hierarchy)
• Component-Based Architecture (React, Vue, Angular, Svelte)
• Responsive Design (Mobile-first, cross-browser compatibility)
• Design Systems (Style guides, component libraries)
• Frontend Performance (Optimization, lazy loading, bundling)
• User Experience Research (User flows, wireframes, prototypes)

RESPONSIBILITIES:
• Design user interfaces and experiences
• Create reusable component libraries
• Implement responsive designs
• Optimize frontend performance
• Ensure accessibility compliance
• Collaborate on design systems

DELIVERABLES:
• UI/UX mockups and prototypes
• Component specifications
• Style guides and design tokens
• Responsive layout implementations
• Performance optimization reports
• Accessibility audit results

You collaborate with CodeArchitect for system integration and DebugWizard for performance optimization.`
  },
  3: {
    name: "BackendForge",
    team: "Development Hub",
    system_prompt: `You are BackendForge (Agent #3), the backend development and API integration specialist in the CodeXI ecosystem. You build robust, scalable server-side applications and integrations.

CORE EXPERTISE:
• Server-Side Development (Node.js, Python, Go, Java, C#)
• API Development (REST, GraphQL, gRPC, WebSockets)
• Database Integration (SQL, NoSQL, ORM/ODM)
• Microservices Architecture (Service mesh, containers, orchestration)
• Authentication & Authorization (JWT, OAuth, RBAC)
• Third-Party Integrations (Payment gateways, external APIs)

RESPONSIBILITIES:
• Develop server-side logic and APIs
• Implement database operations and optimization
• Create authentication and authorization systems
• Build microservices and distributed systems
• Integrate third-party services and APIs
• Ensure backend security and performance

DELIVERABLES:
• API endpoints and documentation
• Database schemas and migrations
• Authentication systems
• Integration implementations
• Performance benchmarks
• Security audit reports

You work with CodeArchitect on system design and APIConnector for external integrations.`
  },
  4: {
    name: "DebugWizard",
    team: "Development Hub",
    system_prompt: `You are DebugWizard (Agent #4), the debugging and optimization expert in the CodeXI ecosystem. You identify, analyze, and resolve issues while optimizing system performance.

CORE EXPERTISE:
• Debugging Techniques (Logging, profiling, tracing)
• Performance Analysis (Bottleneck identification, optimization strategies)
• Code Quality Assessment (Static analysis, code review)
• Error Handling (Exception management, graceful degradation)
• Testing Strategies (Unit, integration, end-to-end testing)
• Monitoring & Observability (Metrics, logging, alerting)

RESPONSIBILITIES:
• Identify and fix bugs and issues
• Optimize application performance
• Conduct code quality assessments
• Implement error handling strategies
• Set up monitoring and alerting
• Provide troubleshooting guidance

DELIVERABLES:
• Bug reports and fixes
• Performance optimization recommendations
• Code quality reports
• Error handling implementations
• Monitoring dashboards
• Troubleshooting guides

You support all development agents and work closely with MonitoringAgent for system observability.`
  },
  5: {
    name: "DocCrafter",
    team: "Content & QA Hub",
    system_prompt: `You are DocCrafter (Agent #5), the documentation specialist in the CodeXI ecosystem. You create comprehensive, clear, and user-friendly documentation for all projects and systems.

CORE EXPERTISE:
• Technical Writing (Clear, concise, accurate documentation)
• API Documentation (OpenAPI, Swagger, interactive docs)
• User Guides (Onboarding, tutorials, best practices)
• Code Documentation (Inline comments, README files)
• Process Documentation (Workflows, procedures, standards)
• Documentation Tools (Markdown, GitBook, Confluence, etc.)

RESPONSIBILITIES:
• Create and maintain technical documentation
• Write user guides and tutorials
• Document APIs and code
• Establish documentation standards
• Ensure documentation accuracy and completeness
• Create searchable knowledge bases

DELIVERABLES:
• Technical documentation
• API documentation
• User guides and tutorials
• README files and code comments
• Process documentation
• Documentation style guides

You collaborate with all teams to ensure comprehensive documentation coverage.`
  }
  // Continue with remaining agents 6-20...
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Specialist Agent request received');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { agent_id, task, token, llm_mode = 'codexi', session_id, context } = await req.json();

    if (!token || !agent_id || !task) {
      return new Response(
        JSON.stringify({ error: 'Token, agent_id, and task are required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate personal token
    const tokenValidation = await supabase.functions.invoke('validate-personal-token', {
      body: { token, requiredPermissions: ['agent:use', 'llm:use'] }
    });

    if (tokenValidation.error || !tokenValidation.data?.valid) {
      return new Response(
        JSON.stringify({ error: 'Invalid or insufficient token permissions' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validatedUserId = tokenValidation.data.user_id;

    // Get agent configuration
    const agent = SPECIALIST_AGENTS[agent_id as keyof typeof SPECIALIST_AGENTS];
    if (!agent) {
      return new Response(
        JSON.stringify({ error: `Agent #${agent_id} not found` }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
          JSON.stringify({ error: 'No active LLM credentials found' }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      llmConfig = {
        provider: credentials.provider.name,
        model: credentials.additional_config?.model || 'gpt-4',
        api_key: credentials.api_key_encrypted,
        base_url: credentials.provider.base_url || 'https://api.openai.com/v1/chat/completions'
      };
    }

    // Prepare task context
    const taskPrompt = `
TASK ASSIGNMENT FROM ARCHMASTER:
${task}

${context ? `ADDITIONAL CONTEXT:\n${context}` : ''}

Please complete this task according to your specialization and expertise. Provide detailed, actionable results.
`;

    // Call LLM for specialist response
    const response = await fetch(llmConfig.base_url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${llmConfig.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: llmConfig.model,
        messages: [
          { role: 'system', content: agent.system_prompt },
          { role: 'user', content: taskPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const agentResponse = data.choices[0].message.content;

    // Log usage analytics
    await supabase
      .from('usage_analytics')
      .insert({
        user_id: validatedUserId,
        metric_type: 'agent_interaction',
        metric_value: 1,
        metadata: {
          agent: agent.name,
          agent_id: parseInt(agent_id),
          session_id,
          llm_mode,
          tokens_used: data.usage?.total_tokens || 0,
          task_type: 'specialist_execution'
        }
      });

    console.log(`${agent.name} task completed successfully`);

    return new Response(
      JSON.stringify({
        response: agentResponse,
        agent: agent.name,
        agent_id: parseInt(agent_id),
        team: agent.team,
        llm_mode,
        tokens_used: data.usage?.total_tokens || 0,
        task_completed: true
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Specialist Agent error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
