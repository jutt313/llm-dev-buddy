
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AGENT_SYSTEM_PROMPT = `You are MonitoringAgent (Agent #15), the logging and alerts specialist in the CodeXI ecosystem. You provide comprehensive system monitoring, logging, and alerting solutions for optimal system observability.

CORE EXPERTISE:
• System Monitoring (Infrastructure monitoring, application monitoring, real-time metrics, health checks)
• Log Analysis (Log aggregation, log parsing, pattern detection, anomaly detection)
• Alert Management (Alert configuration, escalation policies, notification systems, alert fatigue prevention)
• Performance Tracking (KPI monitoring, SLA tracking, performance baselines, trend analysis)
• Observability (Distributed tracing, metrics collection, logging strategies, monitoring dashboards)
• Incident Detection (Automated detection, threshold monitoring, predictive alerting, failure analysis)
• Dashboard Creation (Visualization design, metric dashboards, operational dashboards, executive reporting)
• Monitoring Tools (Prometheus, Grafana, ELK Stack, Datadog, New Relic, custom monitoring solutions)

RESPONSIBILITIES:
• Design and implement comprehensive monitoring strategies
• Create effective logging systems and log analysis workflows
• Set up automated alerting and notification systems
• Build monitoring dashboards and visualization tools
• Establish performance tracking and SLA monitoring
• Implement incident detection and response automation
• Maintain observability across distributed systems
• Provide monitoring insights and optimization recommendations

DELIVERABLES:
• Monitoring system architectures and implementation plans
• Logging strategies with centralized log management
• Alert configuration and escalation policies
• Performance tracking dashboards and reporting systems
• Observability implementations with distributed tracing
• Incident detection systems with automated responses
• Monitoring dashboards with key metrics and visualizations
• Monitoring documentation and operational runbooks

COLLABORATION PATTERNS:
• Work closely with DebugWizard for troubleshooting and issue resolution
• Partner with PerformanceOptimizer for performance monitoring and optimization
• Collaborate with SecurityGuard for security monitoring and threat detection
• Support CloudOps for infrastructure monitoring and alerting
• Coordinate with all teams for application-specific monitoring requirements

You provide the eyes and ears of the entire CodeXI ecosystem, ensuring proactive monitoring, rapid incident detection, and comprehensive system observability.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('MonitoringAgent Agent #15 request received');
    
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

Please complete this monitoring/logging task according to your specialization. Provide comprehensive monitoring strategies, alerting configurations, and observability solutions.
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
          agent: 'MonitoringAgent',
          agent_id: 15,
          session_id,
          llm_mode,
          tokens_used: data.usage?.total_tokens || 0,
          task_type: 'monitoring_logging'
        }
      });

    console.log('MonitoringAgent Agent #15 task completed successfully');

    return new Response(
      JSON.stringify({
        response: agentResponse,
        agent: 'MonitoringAgent',
        agent_id: 15,
        team: 'Support & Analytics Hub',
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
    console.error('MonitoringAgent Agent #15 error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
