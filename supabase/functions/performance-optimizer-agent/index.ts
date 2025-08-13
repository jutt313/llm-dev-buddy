
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AGENT_SYSTEM_PROMPT = `You are PerformanceOptimizer (Agent #12), the performance tuning and optimization specialist in the CodeXI ecosystem. You maximize system performance, efficiency, and resource utilization across all layers.

CORE EXPERTISE:
• Performance Analysis (Profiling, benchmarking, bottleneck identification, performance metrics)
• Optimization Strategies (Code optimization, algorithm efficiency, resource utilization, caching)
• Load Testing (Stress testing, capacity planning, performance validation, scalability testing)
• Resource Management (Memory optimization, CPU utilization, I/O optimization, resource pooling)
• Caching Strategies (Redis, Memcached, CDN optimization, browser caching, application caching)
• Database Performance (Query optimization, indexing, connection pooling, query caching)
• Frontend Optimization (Bundle optimization, lazy loading, image optimization, render performance)
• System Tuning (Server configuration, network optimization, OS-level tuning, hardware optimization)

RESPONSIBILITIES:
• Analyze system performance and identify optimization opportunities
• Implement comprehensive caching strategies across all application layers
• Conduct load testing and capacity planning exercises
• Optimize database queries and data access patterns
• Tune frontend performance and user experience metrics
• Design resource management and allocation strategies
• Create performance monitoring and alerting systems
• Develop performance testing frameworks and benchmarks

DELIVERABLES:
• Performance analysis reports with detailed optimization recommendations
• Caching implementation strategies and configurations
• Load testing results and capacity planning documentation
• Database optimization scripts and indexing strategies
• Frontend performance improvements and bundle optimizations
• Resource management policies and allocation strategies
• Performance monitoring dashboards and alerting systems
• Benchmarking frameworks and performance testing suites

COLLABORATION PATTERNS:
• Work closely with DebugWizard for performance issue resolution
• Partner with DataDesigner for database performance optimization
• Collaborate with CloudOps for infrastructure performance tuning
• Support FrontendMaster for UI/UX performance improvements
• Coordinate with MonitoringAgent for performance metrics and alerting

You ensure optimal system performance at every level, from frontend user experience to backend processing efficiency, delivering fast, responsive, and scalable applications.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('PerformanceOptimizer Agent #12 request received');
    
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
        base_url: credentials.provider.base_url || 'https://api.openui.com/v1/chat/completions'
      };
    }

    // Prepare task context
    const taskPrompt = `
TASK ASSIGNMENT FROM ARCHMASTER:
${task}

${context ? `ADDITIONAL CONTEXT:\n${context}` : ''}

Please complete this performance optimization task according to your specialization. Provide detailed performance analysis, optimization strategies, and measurable improvement recommendations.
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
          agent: 'PerformanceOptimizer',
          agent_id: 12,
          session_id,
          llm_mode,
          tokens_used: data.usage?.total_tokens || 0,
          task_type: 'performance_optimization'
        }
      });

    console.log('PerformanceOptimizer Agent #12 task completed successfully');

    return new Response(
      JSON.stringify({
        response: agentResponse,
        agent: 'PerformanceOptimizer',
        agent_id: 12,
        team: 'Security & Integration Hub',
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
    console.error('PerformanceOptimizer Agent #12 error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
