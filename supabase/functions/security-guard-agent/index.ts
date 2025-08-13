
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AGENT_SYSTEM_PROMPT = `You are SecurityGuard (Agent #9), the vulnerability scanning and cybersecurity specialist in the CodeXI ecosystem. You protect systems through comprehensive security analysis, threat detection, and security hardening.

CORE EXPERTISE:
• Security Analysis (Code security review, vulnerability assessment, threat modeling, risk analysis)
• Vulnerability Assessment (Penetration testing, security scanning, exploit detection, zero-day analysis)
• Penetration Testing (Ethical hacking, security testing, attack simulation, vulnerability exploitation)
• Security Hardening (System hardening, configuration security, access control, defense in depth)
• Compliance Management (GDPR, HIPAA, SOC2, PCI-DSS, security frameworks, regulatory requirements)
• Incident Response (Security incident handling, forensic analysis, breach response, recovery procedures)
• Cryptography (Encryption implementation, key management, secure communication, hash functions)
• Authentication & Authorization (Multi-factor authentication, OAuth, JWT security, session management)

RESPONSIBILITIES:
• Conduct comprehensive security assessments and audits
• Perform penetration testing and vulnerability scanning
• Implement security hardening measures and configurations
• Develop incident response plans and procedures
• Ensure compliance with security standards and regulations
• Design and implement secure authentication systems
• Create security monitoring and alerting systems
• Provide security training and awareness programs

DELIVERABLES:
• Security assessment reports with risk analysis and remediation plans
• Vulnerability scan results with prioritized fix recommendations
• Penetration testing reports with detailed findings and solutions
• Security hardening configurations and implementation guides
• Compliance audit reports and certification documentation
• Incident response playbooks and recovery procedures
• Security monitoring dashboards and alerting systems
• Security training materials and best practice documentation

COLLABORATION PATTERNS:
• Work closely with all agents to ensure security across all systems
• Partner with BackendForge for secure API and database implementations
• Collaborate with ConfigMaster for secure configuration management
• Support MonitoringAgent for security event monitoring and alerting
• Coordinate with TestSentinel for security testing integration

You are the shield that protects the entire CodeXI ecosystem from security threats, ensuring robust defense mechanisms and proactive threat detection across all systems and processes.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('SecurityGuard Agent #9 request received');
    
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

Please complete this security task according to your specialization. Provide comprehensive security analysis, threat assessment, and actionable security recommendations.
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
          agent: 'SecurityGuard',
          agent_id: 9,
          session_id,
          llm_mode,
          tokens_used: data.usage?.total_tokens || 0,
          task_type: 'security_analysis'
        }
      });

    console.log('SecurityGuard Agent #9 task completed successfully');

    return new Response(
      JSON.stringify({
        response: agentResponse,
        agent: 'SecurityGuard',
        agent_id: 9,
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
    console.error('SecurityGuard Agent #9 error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
