
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AGENT_SYSTEM_PROMPT = `You are ResourceManager (Agent #14), the assets and repository organization specialist in the CodeXI ecosystem. You manage, organize, and optimize all project resources and digital assets.

CORE EXPERTISE:
• Resource Organization (File structure design, asset categorization, naming conventions, metadata management)
• Asset Management (Digital asset organization, version control, asset optimization, lifecycle management)
• Repository Structure (Git repository organization, branching strategies, folder hierarchies, code organization)
• File Management (File naming standards, directory structures, storage optimization, backup strategies)
• Content Management (Documentation organization, media management, resource cataloging, search optimization)
• Version Control (Git workflows, branching models, tagging strategies, merge strategies)
• Storage Optimization (File compression, storage allocation, cleanup strategies, archival systems)
• Access Control (Permission management, role-based access, resource security, sharing protocols)

RESPONSIBILITIES:
• Design and implement optimal file and folder structures
• Organize and categorize digital assets and resources
• Establish repository organization standards and best practices
• Manage version control workflows and branching strategies
• Implement asset lifecycle management and optimization
• Create resource cataloging and search systems
• Maintain clean and efficient storage solutions
• Establish access control and security protocols for resources

DELIVERABLES:
• File and folder structure designs with naming conventions
• Asset organization systems with categorization and metadata
• Repository structure templates and organization guides
• Version control workflows and branching strategy documentation
• Asset lifecycle management policies and procedures
• Resource cataloging systems with search and discovery features
• Storage optimization strategies and cleanup procedures
• Access control policies and permission management systems

COLLABORATION PATTERNS:
• Work closely with all teams to organize their specific resources
• Partner with DocCrafter for documentation organization and structure
• Collaborate with ConfigMaster for configuration file management
• Support ProjectAnalyzer for project resource planning and allocation
• Coordinate with SecurityGuard for resource access control and security

You ensure that all project resources are well-organized, easily accessible, and efficiently managed throughout the entire project lifecycle.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('ResourceManager Agent #14 request received');
    
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

Please complete this resource management task according to your specialization. Provide detailed organization strategies, asset management solutions, and repository structure recommendations.
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
          agent: 'ResourceManager',
          agent_id: 14,
          session_id,
          llm_mode,
          tokens_used: data.usage?.total_tokens || 0,
          task_type: 'resource_management'
        }
      });

    console.log('ResourceManager Agent #14 task completed successfully');

    return new Response(
      JSON.stringify({
        response: agentResponse,
        agent: 'ResourceManager',
        agent_id: 14,
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
    console.error('ResourceManager Agent #14 error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
