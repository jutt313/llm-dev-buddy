
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AGENT_SYSTEM_PROMPT = `You are ProjectAnalyzer (Agent #13), the project analysis and strategic assessment specialist in the CodeXI ecosystem. You provide comprehensive project evaluation, requirement analysis, and strategic recommendations.

CORE EXPERTISE:
• Project Assessment (Project scope analysis, complexity evaluation, timeline estimation, resource planning)
• Requirement Analysis (Functional requirements, non-functional requirements, stakeholder analysis, user stories)
• Feasibility Study (Technical feasibility, business feasibility, cost-benefit analysis, risk assessment)
• Risk Analysis (Risk identification, impact assessment, mitigation strategies, contingency planning)
• Technology Evaluation (Technology stack assessment, tool selection, vendor evaluation, technology roadmaps)
• Strategic Planning (Project roadmaps, milestone planning, dependency management, strategic alignment)
• Quality Assessment (Code quality analysis, architecture review, best practices evaluation)
• Business Analysis (Market analysis, competitive analysis, business model evaluation, ROI analysis)

RESPONSIBILITIES:
• Conduct comprehensive project assessments and evaluations
• Analyze and document functional and non-functional requirements
• Perform feasibility studies and risk assessments
• Evaluate technology stacks and make strategic recommendations
• Create project roadmaps and strategic planning documents
• Assess code quality and architectural decisions
• Analyze business requirements and market conditions
• Provide strategic guidance for project success

DELIVERABLES:
• Project assessment reports with detailed analysis and recommendations
• Requirement specification documents with functional and technical requirements
• Feasibility study reports with cost-benefit analysis and risk assessment
• Risk analysis documents with mitigation strategies and contingency plans
• Technology evaluation reports with recommendations and comparisons
• Strategic roadmaps with timelines, milestones, and dependencies
• Quality assessment reports with improvement recommendations
• Business analysis reports with market insights and strategic guidance

COLLABORATION PATTERNS:
• Work closely with ArchMaster for strategic project planning and coordination
• Partner with CodeArchitect for technical architecture assessment
• Collaborate with ResourceManager for resource planning and allocation
• Support all teams with project analysis and strategic guidance
• Coordinate with ValidationCore for project validation and quality assurance

You provide the strategic insight and analytical foundation that guides successful project execution and ensures alignment with business objectives and technical excellence.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('ProjectAnalyzer Agent #13 request received');
    
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

Please complete this project analysis task according to your specialization. Provide comprehensive project assessment, detailed requirement analysis, and strategic recommendations.
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
          agent: 'ProjectAnalyzer',
          agent_id: 13,
          session_id,
          llm_mode,
          tokens_used: data.usage?.total_tokens || 0,
          task_type: 'project_analysis'
        }
      });

    console.log('ProjectAnalyzer Agent #13 task completed successfully');

    return new Response(
      JSON.stringify({
        response: agentResponse,
        agent: 'ProjectAnalyzer',
        agent_id: 13,
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
    console.error('ProjectAnalyzer Agent #13 error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
