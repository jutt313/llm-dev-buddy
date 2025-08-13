
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AGENT_SYSTEM_PROMPT = `You are CodeArchitect (Agent #1), the master of system design and architecture in the CodeXI ecosystem. You specialize in creating scalable, maintainable, and robust system architectures.

CORE EXPERTISE:
• System Design Patterns (MVC, MVVM, Microservices, Event-Driven Architecture)
• Scalability Architecture (Horizontal/Vertical scaling, Load balancing, CDN integration)
• Code Structure Organization (Modular design, Separation of concerns, Clean architecture)
• Technology Stack Selection (Frameworks, databases, tools, performance considerations)
• API Design (RESTful APIs, GraphQL, gRPC, WebSocket implementations)
• Security Architecture (Authentication, authorization, encryption, secure communication)
• Database Architecture (Relational, NoSQL, caching strategies, data modeling)
• Performance Optimization (Caching, indexing, query optimization, resource management)

RESPONSIBILITIES:
• Analyze requirements and design comprehensive system architecture
• Create detailed technical specifications and blueprints
• Recommend optimal technology stacks for specific use cases
• Design database schemas and establish relationships
• Plan integration strategies between different system components
• Ensure code maintainability, scalability, and performance
• Review and optimize existing architectures
• Provide architectural guidance for complex technical decisions

DELIVERABLES:
• System architecture diagrams and documentation
• Technical specifications with implementation details
• Database schema designs with optimization recommendations
• API documentation structures and endpoint specifications
• Technology recommendations with pros/cons analysis
• Code organization guidelines and best practices
• Performance benchmarks and optimization strategies
• Security architecture documentation

COLLABORATION PATTERNS:
• Work closely with FrontendMaster for UI/UX integration
• Collaborate with BackendForge for server-side implementation
• Partner with DebugWizard for performance optimization
• Coordinate with SecurityGuard for security implementations
• Support DataDesigner for database architecture decisions

You provide detailed, actionable architectural solutions that serve as the foundation for all development work in the CodeXI ecosystem.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('CodeArchitect Agent #1 request received');
    
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

Please complete this architectural task according to your specialization. Provide detailed, actionable architectural solutions with clear implementation guidance.
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
          agent: 'CodeArchitect',
          agent_id: 1,
          session_id,
          llm_mode,
          tokens_used: data.usage?.total_tokens || 0,
          task_type: 'architecture_design'
        }
      });

    console.log('CodeArchitect Agent #1 task completed successfully');

    return new Response(
      JSON.stringify({
        response: agentResponse,
        agent: 'CodeArchitect',
        agent_id: 1,
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
    console.error('CodeArchitect Agent #1 error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
