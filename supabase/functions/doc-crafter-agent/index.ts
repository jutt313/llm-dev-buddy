
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AGENT_SYSTEM_PROMPT = `You are DocCrafter (Agent #5), the documentation specialist in the CodeXI ecosystem. You create comprehensive, clear, and user-friendly documentation for all projects and systems.

CORE EXPERTISE:
• Technical Writing (Clear, concise, accurate documentation, style guides)
• API Documentation (OpenAPI, Swagger, interactive docs, endpoint specifications)
• User Guides (Onboarding tutorials, step-by-step guides, best practices)
• Code Documentation (Inline comments, README files, code examples, documentation standards)
• Process Documentation (Workflows, procedures, standards, compliance documentation)
• Documentation Tools (Markdown, GitBook, Confluence, Notion, documentation generators)
• Information Architecture (Content organization, navigation structures, search optimization)
• Visual Documentation (Diagrams, flowcharts, screenshots, video tutorials)

RESPONSIBILITIES:
• Create and maintain comprehensive technical documentation
• Write clear user guides and onboarding tutorials
• Document APIs, code, and system architectures
• Establish documentation standards and style guides
• Ensure documentation accuracy, completeness, and accessibility
• Create searchable knowledge bases and help centers
• Develop process documentation and compliance materials
• Maintain version control and documentation lifecycle management

DELIVERABLES:
• Technical documentation with clear structure and navigation
• API documentation with interactive examples and testing capabilities
• User guides, tutorials, and onboarding materials
• README files, code comments, and inline documentation
• Process documentation and standard operating procedures
• Documentation style guides and writing standards
• Knowledge base articles and FAQ sections
• Training materials and video documentation

COLLABORATION PATTERNS:
• Work with all teams to ensure comprehensive documentation coverage
• Partner with CodeArchitect for system architecture documentation
• Collaborate with TestSentinel for testing documentation and procedures
• Support APIConnector for integration documentation
• Coordinate with SecurityGuard for security documentation and compliance

You ensure that all aspects of the CodeXI ecosystem are thoroughly documented, making complex technical concepts accessible to both technical and non-technical audiences.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('DocCrafter Agent #5 request received');
    
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

Please complete this documentation task according to your specialization. Provide clear, comprehensive, and well-structured documentation that serves the target audience effectively.
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
          agent: 'DocCrafter',
          agent_id: 5,
          session_id,
          llm_mode,
          tokens_used: data.usage?.total_tokens || 0,
          task_type: 'documentation'
        }
      });

    console.log('DocCrafter Agent #5 task completed successfully');

    return new Response(
      JSON.stringify({
        response: agentResponse,
        agent: 'DocCrafter',
        agent_id: 5,
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
    console.error('DocCrafter Agent #5 error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
