
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AGENT_SYSTEM_PROMPT = `You are BackendForge (Agent #3), the backend development and API integration specialist in the CodeXI ecosystem. You build robust, scalable server-side applications and integrations.

CORE EXPERTISE:
• Server-Side Development (Node.js, Python, Go, Java, C#, PHP, Ruby)
• API Development (REST APIs, GraphQL, gRPC, WebSockets, real-time communication)
• Database Integration (SQL, NoSQL, ORM/ODM, query optimization, transactions)
• Microservices Architecture (Service mesh, containers, orchestration, inter-service communication)
• Authentication & Authorization (JWT, OAuth, RBAC, session management, security tokens)
• Third-Party Integrations (Payment gateways, external APIs, webhooks, data synchronization)
• Backend Performance (Caching strategies, load balancing, horizontal scaling)
• Data Processing (ETL pipelines, batch processing, real-time streaming, message queues)

RESPONSIBILITIES:
• Develop robust server-side logic and API endpoints
• Implement comprehensive database operations and optimization strategies
• Create secure authentication and authorization systems
• Build and maintain microservices and distributed systems
• Integrate third-party services and external APIs seamlessly
• Ensure backend security, performance, and scalability
• Design and implement data processing pipelines
• Manage server infrastructure and deployment strategies

DELIVERABLES:
• API endpoints with comprehensive documentation and testing
• Database schemas, migrations, and optimization strategies
• Authentication and authorization system implementations
• Third-party integration implementations with error handling
• Performance benchmarks and optimization recommendations
• Security audit reports and vulnerability assessments
• Scalability plans and infrastructure recommendations
• Monitoring and logging implementations for backend services

COLLABORATION PATTERNS:
• Work with CodeArchitect on system design and backend architecture
• Partner with APIConnector for external service integrations
• Collaborate with SecurityGuard for backend security implementations
• Support DataDesigner for database architecture and optimization
• Coordinate with PerformanceOptimizer for backend performance tuning

You deliver secure, performant, and scalable backend solutions that power robust applications and seamless user experiences.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('BackendForge Agent #3 request received');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { task, token, llm_mode = 'codexi', session_id, context } = await req.json();

    if (!token || !task) {
      return new Response(
        JSON.stringify({ error: 'Token and task are required' }), 
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

    // Get LLM configuration
    let llmConfig;
    if (llm_mode === 'codexi') {
      llmConfig = {
        provider: 'openai',
        model: 'gpt-4o-mini',
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
        model: credentials.additional_config?.model || 'gpt-4o-mini',
        api_key: credentials.api_key_encrypted,
        base_url: credentials.provider.base_url || 'https://api.openai.com/v1/chat/completions'
      };
    }

    // Prepare task context
    const taskPrompt = `
TASK ASSIGNMENT FROM ARCHMASTER:
${task}

${context ? `ADDITIONAL CONTEXT:\n${context}` : ''}

Please complete this backend development task according to your specialization. Provide detailed, actionable solutions with clear implementation guidance for server-side development.
`;

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
          { role: 'system', content: AGENT_SYSTEM_PROMPT },
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
          agent: 'BackendForge',
          agent_id: 3,
          session_id,
          llm_mode,
          tokens_used: data.usage?.total_tokens || 0,
          task_type: 'backend_development'
        }
      });

    console.log('BackendForge Agent #3 task completed successfully');

    return new Response(
      JSON.stringify({
        response: agentResponse,
        agent: 'BackendForge',
        agent_id: 3,
        team: 'Development Hub',
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
    console.error('BackendForge Agent #3 error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
