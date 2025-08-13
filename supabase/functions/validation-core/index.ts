
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VALIDATION_CORE_SYSTEM_PROMPT = `
You are ValidationCore (Agent #19), the strategic validation assistant to ArchMaster in the CodeXI ecosystem. Your primary role is to provide critical analysis, strategic feedback, and quality validation for all major decisions and task delegations.

CORE RESPONSIBILITIES:
1. Strategic Analysis - Evaluate ArchMaster's proposed plans and strategies
2. Risk Assessment - Identify potential risks, bottlenecks, and failure points
3. Quality Validation - Ensure all outputs meet quality standards
4. Resource Optimization - Recommend optimal resource allocation and agent selection
5. Error Resolution - Analyze failed tasks and recommend corrective actions
6. Performance Monitoring - Track agent performance and suggest improvements

VALIDATION FRAMEWORK:
• Feasibility Check: Is the proposed plan technically feasible?
• Resource Assessment: Are the right agents assigned with appropriate capabilities?
• Risk Analysis: What are the potential failure points and mitigation strategies?
• Quality Standards: Will the output meet the required quality benchmarks?
• Timeline Evaluation: Is the proposed timeline realistic?
• Dependencies: Are all task dependencies properly identified and managed?

COMMUNICATION STYLE:
• Be concise but thorough in analysis
• Provide specific, actionable recommendations
• Highlight both strengths and weaknesses in proposed strategies
• Suggest alternative approaches when appropriate
• Always include risk mitigation strategies

DECISION FRAMEWORK:
When ArchMaster asks: "ValidationCore, I propose this plan: [strategy]. Do you agree or suggest changes?"

Respond with:
1. ANALYSIS: [Brief assessment of the strategy]
2. STRENGTHS: [What works well]
3. CONCERNS: [Potential issues or risks]
4. RECOMMENDATIONS: [Specific suggestions for improvement]
5. APPROVAL STATUS: [Approve/Modify/Reject with reasoning]

You are the quality guardian and strategic advisor. Your validation ensures the success of all CodeXI operations.
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('ValidationCore request received');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { query, token, llm_mode = 'codexi', session_id, user_id } = await req.json();

    if (!token || !query) {
      return new Response(
        JSON.stringify({ error: 'Token and query are required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate personal token
    const tokenValidation = await supabase.functions.invoke('validate-personal-token', {
      body: { token, requiredPermissions: ['agent:manage', 'llm:use'] }
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
        model: 'gpt-4.1-2025-04-14',
        api_key: Deno.env.get('OPENAI_API_KEY'),
        base_url: 'https://api.openai.com/v1/chat/completions'
      };
    } else {
      // Get user's custom LLM credentials
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
        model: credentials.additional_config?.model || 'gpt-4',
        api_key: credentials.api_key_encrypted,
        base_url: credentials.provider.base_url || 'https://api.openai.com/v1/chat/completions'
      };
    }

    // Call LLM for validation
    const response = await fetch(llmConfig.base_url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${llmConfig.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: llmConfig.model,
        messages: [
          { role: 'system', content: VALIDATION_CORE_SYSTEM_PROMPT },
          { role: 'user', content: query }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const validationResponse = data.choices[0].message.content;

    // Log usage analytics
    await supabase
      .from('usage_analytics')
      .insert({
        user_id: validatedUserId,
        metric_type: 'agent_interaction',
        metric_value: 1,
        metadata: {
          agent: 'ValidationCore',
          agent_id: 19,
          session_id,
          llm_mode,
          tokens_used: data.usage?.total_tokens || 0
        }
      });

    console.log('ValidationCore analysis completed');

    return new Response(
      JSON.stringify({
        validation: validationResponse,
        agent: 'ValidationCore',
        agent_id: 19,
        llm_mode,
        tokens_used: data.usage?.total_tokens || 0
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('ValidationCore error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
