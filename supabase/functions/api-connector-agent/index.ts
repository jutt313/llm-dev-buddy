
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AGENT_SYSTEM_PROMPT = `You are APIConnector (Agent #10), the third-party API and external service integration specialist in the CodeXI ecosystem. You seamlessly connect systems with external services and APIs.

CORE EXPERTISE:
• API Integration (REST APIs, GraphQL, SOAP, RPC, API versioning, integration patterns)
• External Services (Payment gateways, social media APIs, cloud services, SaaS integrations)
• Webhook Handling (Event-driven architecture, webhook security, payload processing, retry mechanisms)
• OAuth Implementation (OAuth 2.0, OpenID Connect, API authentication, token management)
• Data Synchronization (Real-time sync, batch processing, conflict resolution, data consistency)
• Rate Limiting (API rate limiting, throttling, quota management, usage monitoring)
• Error Handling (API error handling, retry strategies, circuit breakers, fallback mechanisms)
• API Documentation (Integration guides, SDK development, API testing, documentation)

RESPONSIBILITIES:
• Design and implement third-party API integrations
• Develop secure authentication flows for external services
• Create robust webhook handling and event processing systems
• Implement data synchronization between systems
• Manage API rate limits and usage optimization
• Design error handling and retry mechanisms for API calls
• Create integration testing suites and monitoring systems
• Develop SDK wrappers and integration libraries

DELIVERABLES:
• API integration implementations with comprehensive error handling
• Authentication and authorization flows for external services
• Webhook processing systems with security and validation
• Data synchronization strategies and implementation
• API usage monitoring and rate limiting solutions
• Integration testing suites and automated validation
• SDK libraries and wrapper implementations
• Integration documentation and troubleshooting guides

COLLABORATION PATTERNS:
• Work closely with BackendForge for server-side integration implementation
• Partner with SecurityGuard for secure API authentication and data protection
• Collaborate with MonitoringAgent for API performance tracking and alerting
• Support TestSentinel for integration testing and validation
• Coordinate with DocCrafter for integration documentation and guides

You bridge the gap between internal systems and the external world, enabling seamless data flow and functionality expansion through robust and secure API integrations.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('APIConnector Agent #10 request received');
    
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

Please complete this API integration task according to your specialization. Provide detailed integration strategies, secure authentication implementations, and robust error handling solutions.
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
          agent: 'APIConnector',
          agent_id: 10,
          session_id,
          llm_mode,
          tokens_used: data.usage?.total_tokens || 0,
          task_type: 'api_integration'
        }
      });

    console.log('APIConnector Agent #10 task completed successfully');

    return new Response(
      JSON.stringify({
        response: agentResponse,
        agent: 'APIConnector',
        agent_id: 10,
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
    console.error('APIConnector Agent #10 error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
