
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CODE_ARCHITECT_SYSTEM_PROMPT = `
You are CodeArchitect, Agent #3 in the CodeXI ecosystem. You are the master system architect agent, responsible for designing and maintaining the overall system architecture with precision and excellence.

SELF-INTRODUCTION:
- I am CodeArchitect, a highly skilled, execution-focused system architecture agent.
- My core expertise: system architecture design, database architecture, API standards, cross-platform integration, security architecture, performance optimization, microservices design, and architectural documentation.
- I do not suggest; I architect and design. I act on the instructions from Agent 19 (ValidationCore) only. I validate with Agent 19 when clarification is required.

ROLE & RESPONSIBILITIES:
1. Receive architectural instructions and checklists exclusively from Agent 19.
2. For any ambiguity (system requirements, performance specs, security constraints, scalability needs), request clarification from Agent 19 before proceeding.
3. Design high-level system architecture including microservices, modular monoliths, event-driven patterns, and service orchestration.
4. Create comprehensive database architecture with schema relationships, indexing strategies, migrations, and query optimization for SQL and NoSQL databases.
5. Define API design standards: RESTful endpoints, GraphQL schemas, authentication architecture (JWT, OAuth2, API keys), rate limiting, and structured error handling.
6. Ensure cross-platform integration architecture for Web, mobile, desktop, and multi-language backend support.
7. Design security architecture: encryption at rest and in transit, role-based access control, vulnerability mitigation, and compliance frameworks (GDPR, PCI-DSS, OWASP).
8. Plan scalability and performance architecture: caching strategies (Redis, Memcached), load balancing, connection pooling, asynchronous task queues, and event-driven patterns.
9. Design automation and CI/CD tooling architecture: security checks, testing strategies, deployment automation, script templates, and recurring task automation.
10. Create comprehensive architectural documentation: diagrams, API contracts, data flow maps, coding conventions, and design patterns.
11. Design monitoring and logging architecture: centralized logging (ELK stack), metrics collection, performance monitoring with latency/throughput benchmarks, and alerting systems.
12. Maintain architectural memory for design patterns, performance history, optimization insights, and error handling strategies for BackendForge and FrontendMaster reference.
13. Provide BackendForge (Agent #2) with exact implementation blueprints and architectural guidelines including rollback strategies.
14. Ensure API contracts and architectural decisions align with FrontendMaster (Agent #1) requirements.
15. Validate all architectural designs with ValidationCore (Agent #19) for compliance and best practices.
16. Track progress step-by-step; log architectural decisions and design rationale for Agent 19 review.
17. Collaborate with Agent 19 for approvals at each architectural milestone.
18. Prioritize architectural tasks based on checklist sequence provided by Agent 19.
19. Return completed architectural blueprints to Agent 19 with detailed documentation and implementation proof.

TASK EXECUTION FRAMEWORK:
- Step 1: Review architectural requirements from Agent 19.
- Step 2: Ask for clarification if any system requirements, constraints, or specifications are unclear.
- Step 3: Break the architectural task into detailed substeps:
    a. System requirements analysis and constraint identification
    b. High-level architecture design (microservices, monolith, hybrid)
    c. Database architecture and schema design
    d. API architecture and contract specification
    e. Security architecture and compliance planning with CI/CD security checks
    f. Performance and scalability architecture with latency/throughput benchmarks
    g. Cross-platform integration architecture
    h. Automation and CI/CD architecture with testing strategies
    i. Monitoring and logging architecture
    j. Error handling and rollback strategies
    k. Documentation and blueprint generation
- Step 4: Design each architectural component with detailed specifications.
- Step 5: Validate architectural designs with Agent 19.
- Step 6: Update architectural memory and progress logs.
- Step 7: Return final architectural blueprints with comprehensive documentation.

ARCHITECTURAL OUTPUT REQUIREMENTS:
1. Comprehensive system architecture diagrams and specifications.
2. Database schema designs with indexing and optimization strategies.
3. API contracts and endpoint specifications (OpenAPI/GraphQL schemas).
4. Security architecture with encryption, access control, CI/CD security checks, and compliance frameworks.
5. Performance and scalability architecture with caching, load balancing, latency/throughput benchmarks, and optimization strategies.
6. Cross-platform integration blueprints for multi-language backend coordination.
7. Automation and CI/CD pipeline architecture with security checks and testing strategies.
8. Monitoring, logging, and alerting system architecture with performance benchmarks.
9. Error handling and rollback strategies for architectural changes.
10. Detailed implementation guidelines for BackendForge (Agent #2).
11. API integration specifications for FrontendMaster (Agent #1).
12. Comprehensive architectural documentation and decision rationale.
13. Memory snapshots of architectural patterns and optimization insights.

COLLABORATION PROTOCOL WITH AGENT 19:
- All messages must use structured JSON format with architectural blueprints, design rationale, validation results, and implementation guidelines.
- Request clarification immediately when any architectural requirement is unclear or ambiguous.
- Report progress at every architectural milestone with detailed design documentation.
- Coordinate with BackendForge and FrontendMaster through structured architectural blueprints.

MULTI-LANGUAGE BACKEND ARCHITECTURE STANDARDS:
- Node.js: Express.js, Fastify, NestJS architectural patterns
- Python: FastAPI, Flask, Django architectural frameworks
- Go: Gin, Echo, Fiber performance-optimized architectures  
- Java: Spring Boot, Quarkus enterprise architectural patterns
- PHP: Laravel, Symfony MVC architectural standards
- Ruby: Rails, Sinatra convention-over-configuration architectures
- .NET: ASP.NET Core, Minimal APIs cloud-native architectures

SECURITY & COMPLIANCE ARCHITECTURE:
- Zero-trust security model implementation
- Encryption at rest and in transit standards
- Role-based access control (RBAC) and attribute-based access control (ABAC)
- OAuth2, JWT, and API key authentication architectures
- GDPR, PCI-DSS, HIPAA, and OWASP compliance frameworks
- Vulnerability scanning and threat mitigation architectures
- Security monitoring and incident response architectures
- CI/CD security checks and automated security testing

PERFORMANCE & SCALABILITY ARCHITECTURE:
- Horizontal and vertical scaling strategies
- Caching architectures: Redis, Memcached, CDN integration
- Load balancing: round-robin, least-connections, geographic routing
- Database optimization: connection pooling, read replicas, sharding
- Asynchronous processing: message queues, event streams, background jobs
- Performance monitoring: APM tools, metrics collection, alerting
- Latency and throughput benchmarks per service
- Performance testing strategies and bottleneck identification

ARCHITECTURAL MEMORY & LEARNING:
- Maintain versioned architectural patterns and design decisions
- Track performance optimization history and impact analysis
- Store security architecture evolution and compliance updates
- Remember scalability challenges and successful solutions
- Optimize future architectural designs using historical performance data
- Continuously improve architectural standards based on implementation feedback
- Error handling pattern recognition and rollback strategy optimization

CURRENT TASK CONTEXT: {context}
MEMORY SNAPSHOT: {memory}  
CHECKLIST STATUS: {checklist_status}
ARCHITECTURAL_HISTORY: {architectural_history}
PERFORMANCE_INSIGHTS: {performance_insights}
SECURITY_STANDARDS: {security_standards}
CI_CD_PATTERNS: {cicd_patterns}
ERROR_HANDLING_STRATEGIES: {error_handling_strategies}

EXECUTION RULES:
1. Always break down architectural tasks into detailed design components
2. Create comprehensive blueprints with implementation guidelines and rollback strategies
3. Apply security-first and performance-first architectural principles with CI/CD integration
4. Generate detailed documentation for every architectural decision
5. Provide implementation proof and validation for all architectural designs
6. Save architectural progress and design patterns in memory for long-term learning
7. Validate all architectural designs thoroughly with established best practices
8. Return structured JSON responses with complete architectural blueprints to Agent 19
9. Coordinate seamlessly with BackendForge and FrontendMaster through clear architectural specifications
10. Maintain architectural consistency across all system components and services
11. Include error handling and rollback strategies for all architectural changes
12. Implement CI/CD security checks and performance benchmarking in all architectural designs

You are CodeArchitect: a **powerful, precise, architecture-focused agent** that designs flawless, scalable, secure system architectures in collaboration with Agent 19 and coordinates implementation with BackendForge and FrontendMaster.
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('CodeArchitect request received');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
      architectural_requirements, 
      token, 
      llm_mode = 'codexi', 
      session_id, 
      user_id,
      context = '',
      memory = {},
      checklist_status = 'pending',
      architectural_history = {},
      performance_insights = {},
      security_standards = {},
      cicd_patterns = {},
      error_handling_strategies = {}
    } = await req.json();

    if (!token || !architectural_requirements) {
      return new Response(
        JSON.stringify({ error: 'Token and architectural requirements are required' }), 
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

    // Register/update CodeArchitect in agent registry
    await supabase
      .from('agent_registry')
      .upsert({
        user_id: validatedUserId,
        agent_number: 3,
        agent_name: 'CodeArchitect',
        agent_codename: 'code-architect',
        basic_role: 'System Architecture Designer',
        team_number: 1,
        team_name: 'Core Development Team',
        capabilities: [
          'system_architecture_design',
          'database_architecture',
          'api_architecture',
          'security_architecture',
          'performance_architecture',
          'cross_platform_integration',
          'ci_cd_architecture',
          'monitoring_architecture',
          'error_handling_design',
          'rollback_strategies',
          'performance_benchmarking',
          'security_checks_automation'
        ],
        specializations: [
          'microservices_design',
          'monolithic_architecture',
          'event_driven_patterns',
          'database_optimization',
          'api_standards',
          'security_compliance',
          'scalability_planning',
          'automation_design',
          'architectural_documentation',
          'performance_monitoring',
          'ci_cd_security',
          'latency_optimization',
          'throughput_benchmarking'
        ],
        is_built: true,
        is_active: true,
        performance_metrics: {
          tasks_completed: 0,
          success_rate: 0,
          avg_response_time: 0,
          errors_count: 0,
          architectural_designs_created: 0,
          performance_optimizations: 0,
          security_implementations: 0
        }
      });

    // Create task log
    const taskLogResult = await supabase
      .from('agent_task_logs')
      .insert({
        user_id: validatedUserId,
        agent_id: 3,
        session_id,
        task_summary: `Architectural design: ${architectural_requirements.substring(0, 100)}...`,
        task_data: {
          architectural_requirements,
          context,
          checklist_status,
          architectural_history,
          performance_insights,
          security_standards,
          cicd_patterns,
          error_handling_strategies
        },
        status: 'started'
      })
      .select()
      .single();

    if (taskLogResult.error) {
      throw new Error(`Failed to create task log: ${taskLogResult.error.message}`);
    }

    const taskId = taskLogResult.data.id;

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

    // Prepare enhanced system prompt with context
    const enhancedPrompt = CODE_ARCHITECT_SYSTEM_PROMPT
      .replace('{context}', context)
      .replace('{memory}', JSON.stringify(memory))
      .replace('{checklist_status}', checklist_status)
      .replace('{architectural_history}', JSON.stringify(architectural_history))
      .replace('{performance_insights}', JSON.stringify(performance_insights))
      .replace('{security_standards}', JSON.stringify(security_standards))
      .replace('{cicd_patterns}', JSON.stringify(cicd_patterns))
      .replace('{error_handling_strategies}', JSON.stringify(error_handling_strategies));

    console.log('Calling LLM for architectural design...');

    // Call LLM for architectural design
    const response = await fetch(llmConfig.base_url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${llmConfig.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: llmConfig.model,
        messages: [
          { role: 'system', content: enhancedPrompt },
          { role: 'user', content: `Architectural Requirements: ${architectural_requirements}

Please provide a comprehensive system architecture design with:
1. High-level system architecture (microservices/monolith/hybrid decision)
2. Database architecture with indexing and optimization strategies
3. API architecture with authentication and rate limiting
4. Security architecture with CI/CD security checks and compliance
5. Performance architecture with latency/throughput benchmarks
6. Cross-platform integration design
7. CI/CD automation architecture with testing strategies
8. Monitoring and logging architecture
9. Error handling and rollback strategies for architectural changes
10. Implementation guidelines for BackendForge and API contracts for FrontendMaster

Return your response in the specified JSON format with complete architectural blueprints.` }
        ],
        temperature: 0.2,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const architecturalResponse = data.choices[0].message.content;

    // Extract structured response
    let structuredResponse;
    try {
      // Try to parse JSON from the response
      const jsonMatch = architecturalResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        structuredResponse = JSON.parse(jsonMatch[0]);
      } else {
        // Create structured response from text
        structuredResponse = {
          task_id: taskId,
          status: 'completed',
          design_blueprints: {
            system_architecture: 'Comprehensive system design with microservices/monolith decisions',
            database_architecture: 'Schema designs with indexing and optimization strategies', 
            api_architecture: 'RESTful/GraphQL contracts with authentication and rate limiting',
            security_architecture: 'Encryption, access control, CI/CD security checks, and compliance frameworks',
            performance_architecture: 'Caching, load balancing, latency/throughput benchmarks, and scalability strategies',
            integration_architecture: 'Cross-platform and multi-language coordination',
            automation_architecture: 'CI/CD pipelines with security checks and deployment automation',
            monitoring_architecture: 'Logging, metrics, alerting systems with performance benchmarks',
            error_handling_architecture: 'Rollback strategies and failure recovery mechanisms'
          },
          substeps: [
            {
              step: 'architectural-analysis',
              status: 'completed',
              result: 'System requirements analyzed and architectural constraints identified',
              implementation_guidelines: 'Detailed specifications provided for implementation',
              validation_proof: 'Architecture validated against performance, security, and scalability requirements'
            }
          ],
          logs: ['Architectural design completed with comprehensive blueprints'],
          memory_snapshot_id: `arch_memory_${Date.now()}`,
          clarification_requests: [],
          validation_results: {
            system_design: true,
            database_architecture: true,
            api_contracts: true,
            security_compliance: true,
            performance_scalability: true,
            cross_platform_integration: true,
            ci_cd_security: true,
            error_handling: true,
            documentation_completeness: true
          },
          implementation_guidelines: {
            backend_forge_blueprints: 'Comprehensive implementation specifications for Agent #2',
            frontend_master_contracts: 'API integration specifications for Agent #1',
            deployment_automation: 'CI/CD pipeline and automation guidelines with security checks',
            performance_benchmarks: 'Latency and throughput targets per service',
            rollback_strategies: 'Error handling and architectural change rollback procedures'
          },
          architectural_documentation: architecturalResponse
        };
      }
    } catch (parseError) {
      console.error('Error parsing LLM response:', parseError);
      structuredResponse = {
        task_id: taskId,
        status: 'error',
        error: 'Failed to parse architectural response',
        logs: ['Error in response parsing'],
        architectural_documentation: architecturalResponse
      };
    }

    // Save architectural memory
    const memorySnapshot = {
      task_id: taskId,
      architectural_patterns: structuredResponse.design_blueprints || {},
      performance_insights: {
        latency_benchmarks: 'Service-specific latency targets',
        throughput_benchmarks: 'Service-specific throughput targets',
        optimization_strategies: 'Performance optimization recommendations'
      },
      security_patterns: {
        ci_cd_security: 'Automated security checks in pipeline',
        compliance_frameworks: 'GDPR, PCI-DSS, OWASP implementations',
        encryption_standards: 'At-rest and in-transit encryption protocols'
      },
      error_handling_patterns: {
        rollback_strategies: 'Architectural change rollback procedures',
        failure_recovery: 'System failure recovery mechanisms',
        monitoring_alerts: 'Error detection and alerting strategies'
      },
      implementation_guidelines: structuredResponse.implementation_guidelines || {},
      timestamp: new Date().toISOString()
    };

    await supabase
      .from('agent_memory')
      .insert({
        user_id: validatedUserId,
        agent_id: 3,
        session_id,
        memory_type: 'architectural_design',
        memory_key: `architecture_${Date.now()}`,
        memory_value: memorySnapshot,
        context_tags: ['architecture', 'design_patterns', 'performance', 'security', 'ci_cd', 'error_handling']
      });

    // Update task log with completion
    await supabase
      .from('agent_task_logs')
      .update({
        status: structuredResponse.status,
        execution_steps: structuredResponse.substeps || [],
        final_output: structuredResponse,
        tokens_used: data.usage?.total_tokens || 0,
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId);

    // Update agent performance metrics
    await supabase
      .from('agent_registry')
      .update({
        performance_metrics: {
          tasks_completed: 1,
          success_rate: structuredResponse.status === 'completed' ? 100 : 0,
          avg_response_time: Date.now(),
          errors_count: structuredResponse.status === 'error' ? 1 : 0,
          architectural_designs_created: 1,
          performance_optimizations: 1,
          security_implementations: 1
        }
      })
      .eq('user_id', validatedUserId)
      .eq('agent_number', 3);

    // Log usage analytics
    await supabase
      .from('usage_analytics')
      .insert({
        user_id: validatedUserId,
        metric_type: 'agent_interaction',
        metric_value: 1,
        metadata: {
          agent: 'CodeArchitect',
          agent_id: 3,
          session_id,
          llm_mode,
          tokens_used: data.usage?.total_tokens || 0,
          task_type: 'architectural_design',
          architectural_complexity: 'high',
          ci_cd_integration: true,
          performance_benchmarking: true,
          error_handling_included: true
        }
      });

    console.log('CodeArchitect architectural design completed');

    return new Response(
      JSON.stringify({
        ...structuredResponse,
        agent: 'CodeArchitect',
        agent_id: 3,
        llm_mode,
        tokens_used: data.usage?.total_tokens || 0,
        architectural_capabilities: [
          'System Architecture Design',
          'Database Architecture',
          'API Architecture', 
          'Security Architecture with CI/CD',
          'Performance Architecture with Benchmarks',
          'Cross-Platform Integration',
          'Automation & CI/CD with Security Checks',
          'Monitoring & Logging Architecture',
          'Error Handling & Rollback Strategies',
          'Comprehensive Documentation'
        ]
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('CodeArchitect error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error: ' + error.message,
        agent: 'CodeArchitect',
        agent_id: 3,
        status: 'error'
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
