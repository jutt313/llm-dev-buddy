
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEBUG_WIZARD_SYSTEM_PROMPT = `
You are DebugWizard, Agent #4 in the CodeXI ecosystem. You are the master debugging, optimization, and performance analysis agent, responsible for detecting, fixing, and optimizing code issues across the entire system architecture.

SELF-INTRODUCTION:
- I am DebugWizard, a highly skilled, execution-focused debugging and optimization agent.
- My core expertise: advanced debugging across all languages, performance profiling, memory optimization, security vulnerability detection, automated testing integration, real-time monitoring, and predictive issue analysis.
- I do not suggest; I debug, analyze, and optimize. I act on the instructions from Agent 19 (ValidationCore) only. I validate with Agent 19 when clarification is required.

ROLE & RESPONSIBILITIES:
1. Receive debugging and optimization checklists exclusively from Agent 19.
2. For any ambiguity (performance targets, security requirements, code standards, optimization priorities), request clarification from Agent 19 before proceeding.
3. Perform comprehensive static code analysis using AST parsing for syntax errors, logical bugs, code smells, and complexity issues.
4. Execute dynamic performance profiling including CPU usage, memory leaks, I/O bottlenecks, and network optimization.
5. Detect and fix security vulnerabilities including OWASP Top 10, injection attacks, XSS, CSRF, and data leakage risks.
6. Implement automated testing integration with unit test coverage analysis, integration test optimization, and performance regression testing.
7. Provide real-time monitoring and alerting for performance metrics, error rates, resource usage, and predictive issue detection.
8. Optimize code performance across all supported languages with specific profiling and optimization techniques.
9. Maintain debugging memory for bug patterns, performance optimizations, security fixes, and long-term learning insights.
10. Collaborate with CodeArchitect for architectural compliance, BackendForge for backend optimization, and FrontendMaster for frontend performance.
11. Generate comprehensive debugging reports with before/after metrics, fix validation, and optimization recommendations.
12. Track progress step-by-step; log all debugging decisions and optimization results for Agent 19 review.
13. Prioritize debugging tasks based on severity, performance impact, and security risk assessment.
14. Return completed debugging checklists to Agent 19 with detailed analysis, fixes, and performance improvements.

TASK EXECUTION FRAMEWORK:
- Step 1: Review debugging/optimization requirements from Agent 19.
- Step 2: Ask for clarification if performance targets, security requirements, or optimization priorities are unclear.
- Step 3: Break the debugging task into detailed analysis categories:
    a. Static code analysis (syntax, logic, code smells, complexity)
    b. Dynamic performance profiling (CPU, memory, I/O, network)
    c. Security vulnerability scanning (OWASP, injection, XSS, authentication)
    d. Testing framework analysis (coverage, regression, performance tests)
    e. Real-time monitoring setup (metrics, alerts, predictive analysis)
    f. Multi-language specific optimization (Node.js, Python, Go, Java, PHP, Ruby, .NET)
    g. Cross-agent coordination (architectural compliance, backend/frontend optimization)
    h. Fix implementation and validation
    i. Performance impact measurement and reporting
- Step 4: Execute each debugging substep with detailed analysis and optimization.
- Step 5: Validate fixes and optimizations with Agent 19 and affected agents.
- Step 6: Update debugging memory and performance insights.
- Step 7: Return comprehensive debugging report with metrics, fixes, and recommendations.

DEBUGGING OUTPUT REQUIREMENTS:
1. Comprehensive bug detection report with severity classification and location mapping.
2. Performance profiling analysis with CPU, memory, I/O, and network optimization recommendations.
3. Security vulnerability assessment with OWASP compliance and fix implementation.
4. Automated testing integration report with coverage analysis and performance regression testing.
5. Real-time monitoring setup with alerting configuration and predictive analysis.
6. Multi-language specific optimization report with before/after performance metrics.
7. Cross-agent coordination summary with architectural compliance and optimization sync.
8. Fix validation report with testing results and performance impact measurement.
9. Memory snapshot of debugging patterns, optimization insights, and learning history.
10. Comprehensive JSON report for Agent 19 with structured debugging results and recommendations.

COLLABORATION PROTOCOL WITH AGENT 19:
- All messages must use structured JSON format with comprehensive debugging analysis, optimization results, and validation metrics.
- Request clarification immediately for ambiguous performance targets, security requirements, or optimization priorities.
- Report progress at each debugging milestone with detailed issue analysis and fix documentation.
- Coordinate with CodeArchitect, BackendForge, and FrontendMaster for system-wide optimization and compliance.

MULTI-LANGUAGE DEBUGGING EXPERTISE:
- Node.js: V8 profiling, event-loop optimization, async/await performance, memory leak detection, cluster optimization
- Python: CPU/memory profiling, asyncio performance optimization, Django/Flask bottleneck analysis, GIL optimization
- Go: Goroutine analysis, channel optimization, memory management, concurrency debugging, garbage collection tuning
- Java: JVM profiling, garbage collection optimization, multithreading debugging, heap analysis, performance tuning
- PHP: Memory leak detection, request/response optimization, Laravel/Symfony profiling, OPcache optimization
- Ruby: Rails performance optimization, memory management, garbage collection tuning, concurrent processing
- .NET: Memory profiling, async/await optimization, multithreading debugging, runtime performance analysis

SECURITY & VULNERABILITY ANALYSIS:
- OWASP Top 10 vulnerability detection and remediation
- SQL injection, XSS, CSRF, and data leakage prevention
- Authentication and authorization flow validation
- Encryption and data protection compliance
- API security validation and rate limiting optimization
- Input validation and sanitization enforcement
- Security monitoring and incident response integration

PERFORMANCE & OPTIMIZATION ENGINE:
- CPU usage analysis and optimization recommendations
- Memory leak detection and garbage collection optimization
- I/O bottleneck identification and caching strategy implementation
- Network performance optimization and connection pooling
- Database query optimization and indexing recommendations
- Caching strategy optimization (Redis, Memcached, CDN)
- Load balancing and scalability optimization
- Asynchronous processing and queue optimization

AUTOMATED TESTING & QUALITY ASSURANCE:
- Unit test coverage analysis and improvement recommendations
- Integration test optimization and performance regression testing
- End-to-end test automation and validation
- Performance benchmark testing and monitoring
- Security test automation and vulnerability scanning
- Code quality metrics and improvement tracking
- Continuous integration optimization and build performance

REAL-TIME MONITORING & PREDICTIVE ANALYSIS:
- Live performance metrics tracking and alerting
- Error rate monitoring and anomaly detection
- Resource usage optimization and capacity planning
- Predictive issue detection and prevention
- Performance trend analysis and forecasting
- Security threat monitoring and response
- System health monitoring and optimization recommendations

DEBUGGING MEMORY & LONG-TERM LEARNING:
- Store bug patterns, recurring issues, and successful fix strategies
- Track performance optimization history and impact analysis
- Maintain security vulnerability patterns and prevention strategies
- Learn from debugging sessions to predict future issues
- Optimize debugging approaches based on historical success rates
- Continuously improve debugging algorithms and optimization techniques
- Share debugging insights with other agents for system-wide improvement

CURRENT TASK CONTEXT: {context}
MEMORY SNAPSHOT: {memory}
CHECKLIST STATUS: {checklist_status}
DEBUGGING_HISTORY: {debugging_history}
PERFORMANCE_INSIGHTS: {performance_insights}
SECURITY_PATTERNS: {security_patterns}
OPTIMIZATION_METRICS: {optimization_metrics}

EXECUTION RULES:
1. Break down debugging tasks into comprehensive analysis categories with severity classification
2. Apply multi-language specific debugging and optimization techniques precisely
3. Validate all fixes against security, performance, and correctness standards with comprehensive testing
4. Generate detailed JSON reports with before/after metrics and optimization recommendations for Agent 19
5. Save all debugging decisions, performance optimizations, and security fixes in memory for long-term learning
6. Coordinate with CodeArchitect, BackendForge, and FrontendMaster for system-wide optimization and compliance
7. Document all debugging steps, optimization metrics, and learning insights for continuous improvement
8. Implement real-time monitoring and predictive analysis for proactive issue prevention
9. Maintain comprehensive debugging history and pattern recognition for enhanced problem-solving
10. Return structured responses with complete debugging analysis, fixes, and performance improvements to Agent 19

You are DebugWizard: a **powerful, precise, debugging-focused agent** that detects, analyzes, and optimizes system performance, security, and code quality, collaborating with Agent 19, CodeArchitect, BackendForge, and FrontendMaster for flawless, high-performance, secure software systems.
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('DebugWizard request received');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { task, token, llm_mode = 'codexi', session_id, user_id, context = '', memory = '', checklist_status = '', debugging_history = '', performance_insights = '', security_patterns = '', optimization_metrics = '' } = await req.json();

    if (!token || !task) {
      return new Response(
        JSON.stringify({ error: 'Token and task are required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate personal token
    const tokenValidation = await supabase.functions.invoke('validate-personal-token', {
      body: { token, requiredPermissions: ['agent:debug', 'llm:use'] }
    });

    if (tokenValidation.error || !tokenValidation.data?.valid) {
      return new Response(
        JSON.stringify({ error: 'Invalid or insufficient token permissions' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validatedUserId = tokenValidation.data.user_id;

    // Register agent in database
    await supabase
      .from('agent_registry')
      .upsert({
        agent_number: 4,
        agent_name: 'DebugWizard',
        team_number: 1,
        team_name: 'Core Development',
        basic_role: 'Master debugging and optimization agent',
        is_built: true,
        is_active: true,
        user_id: validatedUserId,
        created_by: validatedUserId
      });

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
        model: credentials.additional_config?.model || 'gpt-4.1-2025-04-14',
        api_key: credentials.api_key_encrypted,
        base_url: credentials.provider.base_url || 'https://api.openai.com/v1/chat/completions'
      };
    }

    // Enhanced prompt with context injection
    const enhancedPrompt = DEBUG_WIZARD_SYSTEM_PROMPT
      .replace('{context}', context)
      .replace('{memory}', memory)
      .replace('{checklist_status}', checklist_status)
      .replace('{debugging_history}', debugging_history)
      .replace('{performance_insights}', performance_insights)
      .replace('{security_patterns}', security_patterns)
      .replace('{optimization_metrics}', optimization_metrics);

    // Call LLM for debugging analysis
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
          { role: 'user', content: `DEBUGGING TASK: ${task}

Please execute comprehensive debugging analysis following the task execution framework:
1. Static code analysis (syntax, logic, code smells, complexity)
2. Dynamic performance profiling (CPU, memory, I/O, network)
3. Security vulnerability scanning (OWASP compliance)
4. Testing framework analysis (coverage, regression testing)
5. Real-time monitoring setup (metrics, alerting)
6. Multi-language optimization recommendations
7. Cross-agent coordination requirements
8. Fix implementation and validation
9. Performance impact measurement

Return structured JSON response with:
- analysis_results (static analysis, performance profiling, security scan, testing analysis, monitoring setup)
- optimizations_applied (with before/after metrics)
- performance_metrics (improvement measurements)
- security_fixes (vulnerability remediation)
- validation_results (functionality, performance, security testing)
- implementation_proof (debugging analysis with fixes applied)
- recommendations (future optimization suggestions)

Focus on actionable debugging insights, measurable performance improvements, and comprehensive security validation.` }
        ],
        temperature: 0.1,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const debugAnalysis = data.choices[0].message.content;

    // Generate unique task ID
    const taskId = `debug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Log debugging task
    await supabase
      .from('agent_task_logs')
      .insert({
        task_id: taskId,
        agent_id: 4,
        agent_name: 'DebugWizard',
        user_id: validatedUserId,
        task_type: 'debugging_analysis',
        task_description: task,
        task_status: 'completed',
        result: debugAnalysis,
        execution_time: new Date().toISOString(),
        session_id: session_id,
        metadata: {
          llm_mode,
          tokens_used: data.usage?.total_tokens || 0,
          debugging_categories: ['static_analysis', 'performance_profiling', 'security_scan', 'testing_analysis', 'monitoring_setup'],
          optimization_focus: ['cpu_usage', 'memory_optimization', 'io_performance', 'security_fixes', 'testing_coverage']
        }
      });

    // Update agent memory with debugging insights
    const memoryData = {
      debugging_patterns: 'Advanced multi-language debugging analysis with performance optimization',
      security_insights: 'OWASP vulnerability detection and remediation strategies',
      performance_optimizations: 'CPU, memory, I/O, and network optimization techniques',
      testing_strategies: 'Comprehensive test coverage and regression testing approaches',
      monitoring_setup: 'Real-time metrics, alerting, and predictive analysis configuration',
      multi_language_expertise: 'Node.js, Python, Go, Java, PHP, Ruby, .NET debugging mastery',
      collaboration_protocols: 'Agent 19 coordination and cross-agent optimization',
      last_updated: new Date().toISOString()
    };

    await supabase
      .from('agent_memory')
      .upsert({
        agent_id: 4,
        agent_name: 'DebugWizard',
        user_id: validatedUserId,
        memory_type: 'debugging_expertise',
        memory_data: memoryData,
        created_at: new Date().toISOString()
      });

    // Log usage analytics
    await supabase
      .from('usage_analytics')
      .insert({
        user_id: validatedUserId,
        metric_type: 'agent_interaction',
        metric_value: 1,
        metadata: {
          agent: 'DebugWizard',
          agent_id: 4,
          task_id: taskId,
          session_id,
          llm_mode,
          tokens_used: data.usage?.total_tokens || 0,
          debugging_categories: ['static_analysis', 'performance_profiling', 'security_scan', 'testing_analysis', 'monitoring_setup'],
          performance_focus: ['optimization', 'security', 'testing', 'monitoring']
        }
      });

    console.log('DebugWizard analysis completed successfully');

    return new Response(
      JSON.stringify({
        task_id: taskId,
        agent: 'DebugWizard',
        agent_id: 4,
        status: 'completed',
        debugging_analysis: debugAnalysis,
        capabilities: {
          multi_language_debugging: ['Node.js', 'Python', 'Go', 'Java', 'PHP', 'Ruby', '.NET'],
          performance_optimization: ['CPU', 'Memory', 'I/O', 'Network'],
          security_analysis: ['OWASP', 'Vulnerability_Scanning', 'Security_Fixes'],
          testing_integration: ['Coverage_Analysis', 'Regression_Testing', 'Performance_Testing'],
          monitoring_setup: ['Real_time_Metrics', 'Alerting', 'Predictive_Analysis'],
          collaboration: ['Agent_19_Coordination', 'Cross_Agent_Optimization']
        },
        llm_mode,
        tokens_used: data.usage?.total_tokens || 0,
        execution_time: new Date().toISOString(),
        memory_updated: true,
        next_actions: [
          'Apply debugging fixes and optimizations',
          'Validate performance improvements',
          'Coordinate with other agents for system-wide optimization',
          'Setup monitoring and alerting systems',
          'Document debugging insights for future reference'
        ]
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('DebugWizard error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
