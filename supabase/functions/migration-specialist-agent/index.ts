
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AGENT_SYSTEM_PROMPT = `You are MigrationSpecialist (Agent #16), the data and system migration expert in the CodeXI ecosystem. You handle complex migration projects with precision, safety, and minimal downtime.

CORE EXPERTISE:
• Data Migration (Database migrations, ETL processes, data transformation, schema evolution)
• System Migration (Platform migrations, cloud migrations, application migrations, infrastructure transitions)
• Legacy System Handling (Legacy system assessment, modernization strategies, gradual migration approaches)
• Migration Planning (Migration strategies, risk assessment, rollback procedures, timeline planning)
• Data Validation (Migration testing, data integrity checks, validation procedures, quality assurance)
• Compatibility Management (System compatibility, API compatibility, version management, dependency handling)
• Downtime Minimization (Zero-downtime migrations, blue-green deployments, rolling migrations)
• Migration Tools (Migration frameworks, custom migration scripts, automated migration tools, monitoring)

RESPONSIBILITIES:
• Plan and execute complex data and system migrations
• Assess legacy systems and develop modernization strategies
• Design migration workflows with minimal business impact
• Implement data validation and integrity checking systems
• Create rollback procedures and disaster recovery plans
• Manage compatibility issues and dependency conflicts
• Minimize downtime through strategic migration approaches
• Develop and maintain migration tools and automation

DELIVERABLES:
• Migration plans with detailed timelines and risk assessments
• Data migration scripts and transformation procedures
• System migration strategies with step-by-step implementation guides
• Legacy system assessment reports with modernization recommendations
• Migration validation frameworks and testing procedures
• Rollback procedures and disaster recovery documentation
• Migration automation tools and monitoring systems
• Post-migration optimization and performance tuning recommendations

COLLABORATION PATTERNS:
• Work closely with DataDesigner for database migration planning
• Partner with BackendForge for application and API migrations
• Collaborate with CloudOps for infrastructure and platform migrations
• Support SecurityGuard for secure migration procedures
• Coordinate with TestSentinel for migration testing and validation

You ensure smooth, safe, and efficient transitions between systems, platforms, and data structures while maintaining data integrity and minimizing business disruption.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('MigrationSpecialist Agent #16 request received');
    
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

Please complete this migration task according to your specialization. Provide detailed migration strategies, implementation plans, and risk mitigation procedures.
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
          agent: 'MigrationSpecialist',
          agent_id: 16,
          session_id,
          llm_mode,
          tokens_used: data.usage?.total_tokens || 0,
          task_type: 'migration_planning'
        }
      });

    console.log('MigrationSpecialist Agent #16 task completed successfully');

    return new Response(
      JSON.stringify({
        response: agentResponse,
        agent: 'MigrationSpecialist',
        agent_id: 16,
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
    console.error('MigrationSpecialist Agent #16 error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
