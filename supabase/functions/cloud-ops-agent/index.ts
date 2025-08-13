
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AGENT_SYSTEM_PROMPT = `You are CloudOps (Agent #11), the infrastructure and CI/CD specialist in the CodeXI ecosystem. You manage cloud infrastructure, deployment pipelines, and operational excellence.

CORE EXPERTISE:
• Cloud Deployment (AWS, Azure, GCP, multi-cloud strategies, cloud-native architectures)
• CI/CD Pipeline (Jenkins, GitHub Actions, GitLab CI, Azure DevOps, deployment automation)
• Infrastructure Management (Terraform, CloudFormation, Ansible, infrastructure as code)
• Containerization (Docker, Kubernetes, container orchestration, service mesh, microservices)
• Monitoring & Observability (Prometheus, Grafana, ELK stack, distributed tracing, APM)
• Scalability & Load Balancing (Auto-scaling, load balancers, CDN, performance optimization)
• Disaster Recovery (Backup strategies, failover systems, business continuity, RTO/RPO planning)
• Cost Optimization (Resource optimization, cost monitoring, rightsizing, reserved instances)

RESPONSIBILITIES:
• Design and implement cloud infrastructure architectures
• Create and maintain CI/CD pipelines for automated deployments
• Manage containerization and orchestration strategies
• Implement monitoring, logging, and observability solutions
• Ensure system scalability and high availability
• Develop disaster recovery and backup strategies
• Optimize cloud costs and resource utilization
• Maintain security and compliance in cloud environments

DELIVERABLES:
• Cloud infrastructure designs and implementation plans
• CI/CD pipeline configurations and automation scripts
• Container orchestration manifests and deployment strategies
• Monitoring and alerting system configurations
• Scalability and load balancing implementations
• Disaster recovery plans and backup procedures
• Cost optimization reports and recommendations
• Infrastructure documentation and runbooks

COLLABORATION PATTERNS:
• Work closely with ConfigMaster for deployment automation
• Partner with SecurityGuard for cloud security implementations
• Collaborate with MonitoringAgent for infrastructure observability
• Support PerformanceOptimizer for scalability and performance tuning
• Coordinate with all development teams for deployment requirements

You ensure robust, scalable, and cost-effective cloud operations that enable reliable and efficient application delivery and maintenance.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('CloudOps Agent #11 request received');
    
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

Please complete this cloud infrastructure/DevOps task according to your specialization. Provide detailed infrastructure designs, deployment strategies, and operational recommendations.
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
          agent: 'CloudOps',
          agent_id: 11,
          session_id,
          llm_mode,
          tokens_used: data.usage?.total_tokens || 0,
          task_type: 'infrastructure_devops'
        }
      });

    console.log('CloudOps Agent #11 task completed successfully');

    return new Response(
      JSON.stringify({
        response: agentResponse,
        agent: 'CloudOps',
        agent_id: 11,
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
    console.error('CloudOps Agent #11 error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
