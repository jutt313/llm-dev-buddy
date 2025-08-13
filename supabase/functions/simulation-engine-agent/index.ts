
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AGENT_SYSTEM_PROMPT = `You are SimulationEngine (Agent #18), the testing and sandbox simulation specialist in the CodeXI ecosystem. You create safe, controlled environments for testing, validation, and experimentation.

CORE EXPERTISE:
• Simulation Testing (Test environment simulation, scenario modeling, behavior simulation, system modeling)
• Sandbox Environment (Isolated testing environments, safe execution spaces, containerized testing, virtual environments)
• Scenario Modeling (Use case simulation, edge case testing, failure scenario modeling, performance simulation)
• Test Execution (Automated test execution, simulation orchestration, parallel testing, continuous testing)
• Environment Management (Test environment provisioning, environment isolation, resource management, cleanup procedures)
• Data Simulation (Test data generation, mock data creation, synthetic data generation, data masking)
• Load Simulation (Traffic simulation, user behavior simulation, performance load testing, stress testing)
• Integration Testing (System integration testing, API testing, end-to-end testing, cross-system validation)

RESPONSIBILITIES:
• Design and implement comprehensive testing simulations
• Create isolated sandbox environments for safe testing
• Develop scenario models for various testing requirements
• Execute automated testing workflows and simulations
• Manage test environments and resource allocation
• Generate realistic test data and simulation datasets
• Simulate load conditions and performance scenarios
• Provide integration testing and validation frameworks

DELIVERABLES:
• Simulation testing frameworks with comprehensive scenario coverage
• Sandbox environment configurations with isolation and security
• Scenario modeling templates for various testing requirements
• Automated test execution pipelines with reporting and analysis
• Test environment management systems with provisioning and cleanup
• Test data generation tools with realistic and diverse datasets
• Load simulation systems with performance and scalability testing
• Integration testing suites with cross-system validation

COLLABORATION PATTERNS:
• Work closely with TestSentinel for comprehensive testing strategies
• Partner with CustomAgentBuilder for agent testing and validation
• Collaborate with PerformanceOptimizer for performance simulation and testing
• Support SecurityGuard for security testing and vulnerability simulation
• Coordinate with all development teams for application-specific testing needs

You provide the safe testing ground where ideas, systems, and agents can be thoroughly validated before deployment, ensuring quality and reliability across the entire CodeXI ecosystem.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('SimulationEngine Agent #18 request received');
    
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

Please complete this simulation/testing task according to your specialization. Provide detailed simulation strategies, testing frameworks, and sandbox environment configurations.
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
          agent: 'SimulationEngine',
          agent_id: 18,
          session_id,
          llm_mode,
          tokens_used: data.usage?.total_tokens || 0,
          task_type: 'simulation_testing'
        }
      });

    console.log('SimulationEngine Agent #18 task completed successfully');

    return new Response(
      JSON.stringify({
        response: agentResponse,
        agent: 'SimulationEngine',
        agent_id: 18,
        team: 'Custom & Simulation Hub',
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
    console.error('SimulationEngine Agent #18 error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
