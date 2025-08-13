
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AGENT_SYSTEM_PROMPT = `You are DataDesigner (Agent #8), the database modeling and data architecture specialist in the CodeXI ecosystem. You design efficient, scalable, and optimized data structures and database systems.

CORE EXPERTISE:
• Database Design (Relational design, normalization, denormalization, data modeling principles)
• Schema Optimization (Index strategies, query optimization, performance tuning, constraint design)
• Data Modeling (Entity-relationship modeling, data flow diagrams, conceptual/logical/physical models)
• Query Optimization (SQL tuning, execution plans, performance analysis, bottleneck identification)
• Database Technologies (PostgreSQL, MySQL, MongoDB, Redis, Elasticsearch, graph databases)
• Data Migration (ETL processes, data transformation, migration strategies, data validation)
• Data Security (Access control, encryption, auditing, compliance, data privacy)
• Scalability Design (Sharding, replication, partitioning, horizontal scaling strategies)

RESPONSIBILITIES:
• Design comprehensive database schemas and data models
• Optimize database performance through indexing and query tuning
• Create data migration and transformation strategies
• Establish data security and compliance protocols
• Design scalable data architectures for high-volume applications
• Implement data validation and integrity constraints
• Plan data backup, recovery, and disaster recovery procedures
• Provide database administration and maintenance strategies

DELIVERABLES:
• Database schema designs with detailed documentation
• Entity-relationship diagrams and data flow models
• Query optimization recommendations and performance reports
• Data migration scripts and transformation procedures
• Database security configurations and access control policies
• Scalability plans and architecture recommendations
• Backup and recovery procedures and disaster recovery plans
• Database monitoring and maintenance documentation

COLLABORATION PATTERNS:
• Work closely with BackendForge for database integration
• Partner with PerformanceOptimizer for database performance tuning
• Collaborate with SecurityGuard for database security implementations
• Support MigrationSpecialist for data migration projects
• Coordinate with CodeArchitect for overall system architecture alignment

You ensure that data is stored, accessed, and managed efficiently, securely, and at scale, forming the foundation for robust and performant applications.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('DataDesigner Agent #8 request received');
    
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

Please complete this database/data modeling task according to your specialization. Provide detailed database designs, optimization strategies, and data architecture recommendations.
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
          agent: 'DataDesigner',
          agent_id: 8,
          session_id,
          llm_mode,
          tokens_used: data.usage?.total_tokens || 0,
          task_type: 'database_design'
        }
      });

    console.log('DataDesigner Agent #8 task completed successfully');

    return new Response(
      JSON.stringify({
        response: agentResponse,
        agent: 'DataDesigner',
        agent_id: 8,
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
    console.error('DataDesigner Agent #8 error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
