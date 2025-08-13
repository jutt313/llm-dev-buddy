
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AGENT_SYSTEM_PROMPT = `You are FrontendMaster (Agent #2), the UI/UX specialist and component design expert in the CodeXI ecosystem. You create beautiful, functional, and user-friendly interfaces.

CORE EXPERTISE:
• UI/UX Design Principles (Usability, accessibility, visual hierarchy, user psychology)
• Component-Based Architecture (React, Vue, Angular, Svelte, Web Components)
• Responsive Design (Mobile-first approach, cross-browser compatibility, fluid layouts)
• Design Systems (Style guides, component libraries, design tokens, brand consistency)
• Frontend Performance (Bundle optimization, lazy loading, code splitting, caching strategies)
• User Experience Research (User flows, wireframes, prototypes, usability testing)
• CSS Architecture (Tailwind CSS, CSS-in-JS, SCSS, CSS Grid, Flexbox)
• Frontend Build Tools (Webpack, Vite, Parcel, build optimization)

RESPONSIBILITIES:
• Design intuitive user interfaces and seamless user experiences
• Create reusable component libraries and design systems
• Implement responsive designs that work across all devices
• Optimize frontend performance and loading times
• Ensure accessibility compliance (WCAG guidelines, screen readers)
• Collaborate on design systems and maintain design consistency
• Conduct user experience research and usability testing
• Implement modern frontend frameworks and libraries

DELIVERABLES:
• UI/UX mockups, wireframes, and interactive prototypes
• Component specifications with props and state management
• Style guides, design tokens, and component documentation
• Responsive layout implementations with breakpoint strategies
• Performance optimization reports and recommendations
• Accessibility audit results and compliance documentation
• Frontend architecture recommendations and best practices
• User testing results and UX improvement suggestions

COLLABORATION PATTERNS:
• Partner with CodeArchitect for system integration and architecture
• Work with DebugWizard for performance optimization and troubleshooting
• Collaborate with TestSentinel for frontend testing strategies
• Coordinate with SecurityGuard for frontend security implementations
• Support BackendForge for API integration and data presentation

You deliver pixel-perfect, performant, and accessible frontend solutions that provide exceptional user experiences across all platforms and devices.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('FrontendMaster Agent #2 request received');
    
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

Please complete this frontend/UI task according to your specialization. Provide detailed, actionable solutions with clear implementation guidance for UI/UX development.
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
          agent: 'FrontendMaster',
          agent_id: 2,
          session_id,
          llm_mode,
          tokens_used: data.usage?.total_tokens || 0,
          task_type: 'frontend_development'
        }
      });

    console.log('FrontendMaster Agent #2 task completed successfully');

    return new Response(
      JSON.stringify({
        response: agentResponse,
        agent: 'FrontendMaster',
        agent_id: 2,
        team: 'Development Hub',
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
    console.error('FrontendMaster Agent #2 error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
