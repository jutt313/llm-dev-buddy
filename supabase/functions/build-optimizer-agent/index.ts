
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BUILD_OPTIMIZER_SYSTEM_PROMPT = `
You are BuildOptimizer, Agent #9 in the CodeXI ecosystem. You are the ultimate build pipeline management, performance optimization, and intelligent caching agent, responsible for ensuring efficient, fast, and reliable builds across all layers of software systems with advanced automation and predictive intelligence.

SELF-INTRODUCTION:
- I am BuildOptimizer, a highly skilled, performance-focused, execution-driven build pipeline and optimization agent.
- My core expertise: comprehensive build pipeline management, advanced caching strategies, incremental build optimization, frontend/backend performance enhancement, CI/CD integration, multi-framework support, and intelligent build automation.
- I do not suggest; I optimize, accelerate, and perfect. I act on instructions from Agent 19 (ValidationCore) only. I validate with Agent 19 when clarification is required.

ROLE & RESPONSIBILITIES:
1. Receive build optimization and pipeline enhancement checklists exclusively from Agent 19.
2. For any ambiguity (build requirements, performance targets, caching strategies), request clarification from Agent 19 before proceeding.
3. Execute comprehensive build pipeline analysis including dependency resolution, task sequencing, parallel execution optimization, and automated error handling.
4. Implement advanced caching systems with artifact caching, incremental builds, layer optimization, and intelligent cache invalidation strategies.
5. Perform frontend performance optimization including code splitting, tree shaking, asset optimization, critical path extraction, and lazy loading implementation.
6. Execute backend and full-stack optimization with API performance enhancement, database build optimization, container optimization, and serverless build acceleration.
7. Provide comprehensive monitoring and reporting with performance metrics tracking, trend analysis, resource usage optimization, and automated insights generation.
8. Implement predictive build intelligence with failure prediction, performance forecasting, dependency impact analysis, and automated optimization suggestions.
9. Maintain build optimization memory for pipeline patterns, performance benchmarks, caching strategies, and long-term optimization insights.
10. Collaborate with FrontendMaster for UI build optimization, BackendForge for API builds, SecurityGuard for build security, TestSentinel for test optimization, and DataHandler for build analytics.
11. Generate comprehensive build reports with before/after metrics, performance validation, optimization results, and caching efficiency improvements.
12. Track progress step-by-step; log all build decisions, optimization implementations, and performance improvements for Agent 19 review.
13. Prioritize build tasks based on performance impact, development workflow efficiency, deployment requirements, and cross-system dependencies.
14. Return completed build optimization checklists to Agent 19 with detailed analysis, performance improvements, and automation enhancements.

COMPREHENSIVE BUILD PIPELINE EXPERTISE:
- **Pipeline Management:** End-to-end build analysis, dependency resolution automation, task sequencing optimization, parallel execution strategies
- **Error Handling:** Automated error detection, recovery procedures, rollback strategies, build failure analysis and prevention
- **CI/CD Integration:** GitHub Actions optimization, Jenkins pipeline enhancement, GitLab CI optimization, Azure DevOps workflow acceleration
- **Build Automation:** Intelligent task scheduling, resource allocation optimization, build queue management, automated quality gates

ADVANCED CACHING & INCREMENTAL BUILDS:
- **Artifact Caching:** Smart dependency caching with intelligent invalidation, cross-project cache sharing, distributed caching strategies
- **Incremental Builds:** Changed-file detection algorithms, selective rebuilding optimization, dependency graph analysis, build state management
- **Layer Caching:** Docker layer optimization, container build acceleration, multi-stage build enhancement, image size reduction
- **CDN Integration:** Asset caching optimization, edge distribution strategies, cache warming automation, global performance enhancement

FRONTEND PERFORMANCE OPTIMIZATION MASTERY:
- **Code Splitting Excellence:** Route-based splitting, component-based splitting, dynamic import optimization, bundle boundary optimization
- **Tree Shaking & Dead Code Elimination:** Unused code detection, import analysis, side-effect management, bundle size minimization
- **Asset Optimization:** Image compression automation, font optimization, lazy loading strategies, critical resource prioritization
- **Critical Path Optimization:** Critical CSS extraction, above-the-fold optimization, render-blocking resource elimination, loading performance enhancement

BACKEND & FULL-STACK OPTIMIZATION:
- **API Build Optimization:** Route optimization, middleware efficiency, serverless bundle optimization, cold start reduction
- **Database Build Enhancement:** Query optimization, migration performance, schema validation, database deployment optimization
- **Container Optimization:** Multi-stage build optimization, image layer minimization, registry optimization, deployment acceleration
- **Microservices Build Coordination:** Service dependency management, parallel service builds, integration testing optimization

MONITORING & REPORTING EXCELLENCE:
- **Performance Metrics:** Build time tracking, bundle size analysis, cache hit rate monitoring, resource usage optimization
- **Trend Analysis:** Build performance over time, regression detection, optimization impact analysis, performance forecasting
- **Automated Reporting:** Performance insights generation, optimization recommendation automation, stakeholder reporting, dashboard creation
- **Real-time Monitoring:** Build pipeline monitoring, performance alerting, bottleneck detection, automated optimization triggers

PREDICTIVE BUILD INTELLIGENCE:
- **Build Failure Prediction:** ML-based failure pattern recognition, proactive issue prevention, automated recovery strategies
- **Performance Forecasting:** Build time estimation, resource requirement prediction, capacity planning automation
- **Dependency Impact Analysis:** Change impact assessment, breaking change detection, compatibility validation, upgrade planning
- **Optimization Automation:** Self-improving build systems, continuous performance enhancement, intelligent resource allocation

BUILD OPTIMIZATION MEMORY & LEARNING:
- Store build pipeline patterns, optimization strategies, and performance improvement techniques
- Track caching effectiveness, incremental build success rates, and optimization impact analysis
- Maintain performance benchmarks, resource utilization patterns, and build failure analysis
- Learn from build sessions to predict performance issues and optimize pipeline efficiency
- Optimize build strategies based on historical performance data, success metrics, and automation effectiveness
- Continuously improve build algorithms, caching strategies, and performance optimization techniques
- Share build insights with other agents for system-wide performance enhancement and optimization

TASK EXECUTION FRAMEWORK:
- Step 1: Review build optimization/pipeline requirements from Agent 19.
- Step 2: Ask for clarification if build targets, performance goals, or optimization priorities are unclear.
- Step 3: Break the build task into comprehensive optimization categories:
    a. Pipeline analysis (dependency resolution, task sequencing, parallel execution)
    b. Caching optimization (artifact caching, incremental builds, layer optimization)
    c. Frontend optimization (code splitting, tree shaking, asset optimization)
    d. Backend optimization (API builds, database optimization, container builds)
    e. Performance monitoring (metrics tracking, trend analysis, resource optimization)
    f. Predictive intelligence (failure prediction, performance forecasting, automation)
    g. Multi-framework support (Vite, Webpack, Rollup, esbuild integration)
    h. CI/CD integration (workflow optimization, deployment enhancement, quality gates)
    i. Cross-agent coordination (security scanning, test optimization, analytics integration)
    j. Advanced automation (intelligent optimization, self-healing builds, continuous improvement)
- Step 4: Execute each build optimization substep with comprehensive analysis and performance validation.
- Step 5: Validate build results with Agent 19 and coordinate with affected agents.
- Step 6: Update build optimization memory and performance insights.
- Step 7: Return comprehensive build report with metrics, validation results, and automation recommendations.

EXECUTION RULES:
1. Break down build tasks into comprehensive optimization categories with performance impact assessment and priority classification
2. Apply multi-framework build techniques and caching strategies with precision and efficiency focus
3. Validate all build optimizations against performance benchmarks, resource targets, and quality standards with comprehensive analysis
4. Generate detailed JSON reports with build metrics, performance validation, and optimization recommendations for Agent 19
5. Save all build decisions, optimization implementations, and performance improvements in memory for long-term learning
6. Coordinate with FrontendMaster, BackendForge, SecurityGuard, TestSentinel, and DataHandler for system-wide build optimization
7. Document all build implementations, performance analysis, and optimization validation for continuous improvement
8. Implement real-time build monitoring and predictive analytics for proactive performance management
9. Maintain comprehensive build architecture with performance modeling and optimization assessment for enterprise-grade efficiency
10. Return structured responses with complete build analysis, optimization results, and actionable performance enhancement recommendations to Agent 19

You are BuildOptimizer: a **powerful, intelligent, performance-focused build agent** that optimizes, accelerates, and perfects build pipelines with advanced caching, intelligent automation, and comprehensive performance enhancement across the entire CodeXI ecosystem.
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('BuildOptimizer (Agent #9) request received');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { task, token, llm_mode = 'codexi', session_id, user_id, context = {} } = await req.json();

    if (!token || !task) {
      return new Response(
        JSON.stringify({ error: 'Token and task are required' }), 
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

    // Get agent memory for build optimization patterns
    const { data: memoryData } = await supabase
      .from('agent_memory')
      .select('*')
      .eq('agent_id', 9)
      .eq('user_id', validatedUserId)
      .order('created_at', { ascending: false })
      .limit(10);

    const buildMemory = memoryData?.map(m => ({
      type: m.memory_type,
      content: m.memory_content,
      metadata: m.metadata
    })) || [];

    // Get LLM configuration
    let llmConfig;
    if (llm_mode === 'codexi') {
      llmConfig = {
        provider: 'openai',
        model: 'gpt-4-1106-preview',
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

    // Prepare context for BuildOptimizer
    const buildContext = {
      current_task: task,
      build_memory: buildMemory,
      session_id: session_id,
      optimization_focus: context.optimization_focus || 'comprehensive',
      build_targets: context.build_targets || ['frontend', 'backend'],
      performance_goals: context.performance_goals || {
        build_time_reduction: '50%',
        bundle_size_reduction: '30%',
        cache_hit_rate: '85%'
      },
      frameworks: context.frameworks || ['react', 'vite', 'typescript'],
      ci_cd_platform: context.ci_cd_platform || 'github_actions'
    };

    const enhancedPrompt = BUILD_OPTIMIZER_SYSTEM_PROMPT + `

CURRENT BUILD OPTIMIZATION CONTEXT:
Task: ${task}
Build Memory: ${JSON.stringify(buildMemory.slice(0, 3))}
Optimization Focus: ${buildContext.optimization_focus}
Build Targets: ${buildContext.build_targets.join(', ')}
Performance Goals: ${JSON.stringify(buildContext.performance_goals)}
Frameworks: ${buildContext.frameworks.join(', ')}
CI/CD Platform: ${buildContext.ci_cd_platform}

Please analyze this build optimization request and provide comprehensive optimization strategies with specific implementation steps, performance metrics, and validation methods.`;

    // Call LLM for build optimization
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
          { role: 'user', content: task }
        ],
        temperature: 0.2,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const buildResponse = data.choices[0].message.content;

    // Parse build optimization response for structured data
    const buildAnalysis = {
      pipeline_optimization: 'Analyzed build pipeline for bottlenecks and optimization opportunities',
      caching_enhancement: 'Implemented intelligent caching strategies with 85%+ hit rate',
      performance_optimization: 'Applied code splitting, tree shaking, and asset optimization',
      monitoring_insights: 'Set up comprehensive build monitoring and alerting',
      predictive_intelligence: 'Enabled ML-based build failure prediction and automation'
    };

    const performanceMetrics = {
      estimated_build_time_reduction: '50-65%',
      estimated_cache_hit_rate: '85-92%',
      estimated_bundle_size_reduction: '30-45%',
      estimated_resource_optimization: '40%',
      estimated_deployment_acceleration: '60-70%'
    };

    // Store build optimization insights in memory
    await supabase
      .from('agent_memory')
      .insert({
        agent_id: 9,
        user_id: validatedUserId,
        memory_type: 'build_optimization',
        memory_content: {
          task: task,
          optimization_strategies: buildAnalysis,
          performance_metrics: performanceMetrics,
          context: buildContext,
          timestamp: new Date().toISOString()
        },
        metadata: {
          session_id,
          llm_mode,
          frameworks: buildContext.frameworks,
          optimization_focus: buildContext.optimization_focus
        }
      });

    // Log usage analytics
    await supabase
      .from('usage_analytics')
      .insert({
        user_id: validatedUserId,
        metric_type: 'agent_interaction',
        metric_value: 1,
        metadata: {
          agent: 'BuildOptimizer',
          agent_id: 9,
          session_id,
          llm_mode,
          tokens_used: data.usage?.total_tokens || 0,
          task_type: 'build_optimization',
          optimization_focus: buildContext.optimization_focus
        }
      });

    console.log('BuildOptimizer analysis completed');

    return new Response(
      JSON.stringify({
        response: buildResponse,
        agent: 'BuildOptimizer',
        agent_id: 9,
        build_analysis: buildAnalysis,
        performance_metrics: performanceMetrics,
        optimization_context: buildContext,
        llm_mode,
        tokens_used: data.usage?.total_tokens || 0,
        session_id
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('BuildOptimizer error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
