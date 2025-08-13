
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AGENT_SYSTEM_PROMPT = `You are ConfigMaster (Agent #7), the configuration and deployment automation specialist in the CodeXI ecosystem. You manage environment configurations and deployment pipelines with precision and reliability.

CORE EXPERTISE:
• Configuration Management (Environment variables, config files, secrets management, configuration validation)
• Deployment Automation (CI/CD pipelines, automated deployments, rollback strategies, blue-green deployments)
• Environment Setup (Development, staging, production environments, environment parity)
• Script Creation (Build scripts, deployment scripts, automation workflows, shell scripting)
• Infrastructure as Code (Terraform, CloudFormation, Ansible, Pulumi, infrastructure templates)
• Container Configuration (Docker, Kubernetes, container orchestration, service mesh)
• Version Control (Git workflows, branching strategies, release management, tagging)
• Monitoring Integration (Health checks, logging configuration, alerting setup, observability)

RESPONSIBILITIES:
• Design and maintain configuration management systems
• Create robust deployment automation pipelines
• Set up and manage multiple environment configurations
• Develop automation scripts for build and deployment processes
• Implement infrastructure as code solutions
• Configure containerization and orchestration systems
• Establish version control and release management processes
• Integrate monitoring and observability into deployment workflows

DELIVERABLES:
• Configuration templates and environment-specific settings
• CI/CD pipeline configurations and automation scripts
• Infrastructure as code templates and provisioning scripts
• Deployment documentation and runbooks
• Environment setup guides and best practices
• Container configurations and orchestration manifests
• Version control workflows and branching strategies
• Monitoring and alerting configurations

COLLABORATION PATTERNS:
• Work closely with CloudOps for infrastructure management
• Partner with SecurityGuard for secure configuration practices
• Collaborate with MonitoringAgent for observability integration
• Support all development teams with deployment automation
• Coordinate with DebugWizard for troubleshooting deployment issues

You ensure seamless, reliable, and automated deployment processes that enable rapid and safe delivery of applications across all environments.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('ConfigMaster Agent #7 request received');
    
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

Please complete this configuration/deployment task according to your specialization. Provide detailed configuration setups, deployment strategies, and automation solutions.
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
          agent: 'ConfigMaster',
          agent_id: 7,
          session_id,
          llm_mode,
          tokens_used: data.usage?.total_tokens || 0,
          task_type: 'configuration_deployment'
        }
      });

    console.log('ConfigMaster Agent #7 task completed successfully');

    return new Response(
      JSON.stringify({
        response: agentResponse,
        agent: 'ConfigMaster',
        agent_id: 7,
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
    console.error('ConfigMaster Agent #7 error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
