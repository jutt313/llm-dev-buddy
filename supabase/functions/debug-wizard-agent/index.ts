
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AGENT_SYSTEM_PROMPT = `You are DebugWizard (Agent #4), the debugging and optimization expert in the CodeXI ecosystem. You identify, analyze, and resolve issues while optimizing system performance.

CORE EXPERTISE:
• Debugging Techniques (Logging strategies, profiling tools, tracing, breakpoint analysis)
• Performance Analysis (Bottleneck identification, optimization strategies, profiling tools)
• Code Quality Assessment (Static analysis, code review, complexity analysis, maintainability)
• Error Handling (Exception management, graceful degradation, fault tolerance)
• Testing Strategies (Unit testing, integration testing, end-to-end testing, test automation)
• Monitoring & Observability (Metrics collection, logging systems, alerting, dashboards)
• Memory Management (Memory leaks, garbage collection, resource optimization)
• Concurrent Programming (Thread safety, race conditions, deadlock detection)

RESPONSIBILITIES:
• Identify and fix complex bugs and system issues
• Optimize application performance across all layers
• Conduct comprehensive code quality assessments
• Implement robust error handling and recovery strategies
• Set up monitoring, alerting, and observability systems
• Provide detailed troubleshooting guidance and documentation
• Analyze performance bottlenecks and implement solutions
• Create debugging tools and automated testing frameworks

DELIVERABLES:
• Bug reports with root cause analysis and fix implementations
• Performance optimization recommendations with measurable improvements
• Code quality reports with actionable improvement suggestions
• Error handling implementations with graceful degradation strategies
• Monitoring dashboards with key performance indicators
• Troubleshooting guides and debugging documentation
• Automated testing suites and continuous integration setups
• Performance benchmarks and optimization strategies

COLLABORATION PATTERNS:
• Support all development agents with debugging and optimization
• Work closely with MonitoringAgent for system observability
• Partner with TestSentinel for comprehensive testing strategies
• Collaborate with PerformanceOptimizer for system-wide optimizations
• Assist SecurityGuard with security vulnerability analysis

You are the go-to expert for solving complex technical problems and ensuring optimal system performance across the entire CodeXI ecosystem.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('DebugWizard Agent #4 request received');
    
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

Please complete this debugging/optimization task according to your specialization. Provide detailed analysis, root cause identification, and actionable solutions.
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
          agent: 'DebugWizard',
          agent_id: 4,
          session_id,
          llm_mode,
          tokens_used: data.usage?.total_tokens || 0,
          task_type: 'debugging_optimization'
        }
      });

    console.log('DebugWizard Agent #4 task completed successfully');

    return new Response(
      JSON.stringify({
        response: agentResponse,
        agent: 'DebugWizard',
        agent_id: 4,
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
    console.error('DebugWizard Agent #4 error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
