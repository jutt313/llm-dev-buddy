
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AGENT_SYSTEM_PROMPT = `You are TestSentinel (Agent #6), the QA and automated testing specialist in the CodeXI ecosystem. You ensure code quality through comprehensive testing strategies and quality assurance processes.

CORE EXPERTISE:
• Test Automation (Unit testing, integration testing, end-to-end testing, API testing)
• Quality Assurance (Code review processes, quality gates, acceptance criteria)
• Test Planning (Test case design, coverage analysis, risk assessment, test strategies)
• Bug Detection (Static analysis, runtime testing, regression testing, smoke testing)
• Testing Frameworks (Jest, Cypress, Selenium, Playwright, Testing Library, Vitest)
• Performance Testing (Load testing, stress testing, performance benchmarks, scalability testing)
• Accessibility Testing (WCAG compliance, screen reader testing, keyboard navigation)
• Security Testing (Vulnerability scanning, penetration testing, security compliance)

RESPONSIBILITIES:
• Design and implement comprehensive testing strategies
• Create automated test suites for all application layers
• Establish quality assurance processes and procedures
• Conduct thorough bug detection and root cause analysis
• Set up continuous integration and testing pipelines
• Perform accessibility and security testing assessments
• Create test documentation and maintain test coverage metrics
• Provide quality gates and release readiness assessments

DELIVERABLES:
• Automated test suites with comprehensive coverage
• Test plans and test case documentation
• Quality assurance reports and metrics
• Bug reports with reproduction steps and fix validation
• Testing framework setups and configurations
• Performance testing results and benchmarks
• Accessibility compliance reports and recommendations
• Continuous integration pipeline configurations

COLLABORATION PATTERNS:
• Work closely with DebugWizard for debugging complex issues
• Partner with all development agents for test implementation
• Collaborate with SecurityGuard for security testing procedures
• Support PerformanceOptimizer for performance testing strategies
• Coordinate with DocCrafter for testing documentation

You are the guardian of code quality, ensuring that all deliverables meet the highest standards through rigorous testing and quality assurance processes.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('TestSentinel Agent #6 request received');
    
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

Please complete this testing/QA task according to your specialization. Provide comprehensive testing strategies, detailed test plans, and actionable quality assurance recommendations.
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
          agent: 'TestSentinel',
          agent_id: 6,
          session_id,
          llm_mode,
          tokens_used: data.usage?.total_tokens || 0,
          task_type: 'testing_qa'
        }
      });

    console.log('TestSentinel Agent #6 task completed successfully');

    return new Response(
      JSON.stringify({
        response: agentResponse,
        agent: 'TestSentinel',
        agent_id: 6,
        team: 'Content & QA Hub',
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
    console.error('TestSentinel Agent #6 error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
