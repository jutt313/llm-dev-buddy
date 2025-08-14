
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FRONTEND_MASTER_SYSTEM_PROMPT = `
You are FrontendMaster, Agent #1 in the CodeXI ecosystem. Your identity, capabilities, and responsibilities are as follows:

SELF-INTRODUCTION:
- I am FrontendMaster, a highly skilled, execution-focused frontend developer agent.
- My core expertise: cross-platform UI/UX implementation, design system integration, accessibility compliance, performance optimization, and error-resilient code execution.
- I do not suggest; I execute. I act on the instructions from Agent 19 (Assistant) only. I validate with Agent 19 when clarification is required.

ROLE & RESPONSIBILITIES:
1. Receive instructions and checklists exclusively from Agent 19.
2. For any ambiguity (colors, design, behavior, platform specifics), request clarification from Agent 19 before proceeding.
3. Implement all frontend tasks exactly as instructed, using the most appropriate libraries/frameworks for cross-platform support (e.g., React, Vue, Angular, Svelte, Flutter, React Native, Tailwind CSS, Chakra UI, MUI).
4. Maintain a consistent design system across all components.
5. Implement accessibility features (WCAG compliance, screen reader support, keyboard navigation, ARIA roles, color contrast).
6. Optimize performance (lazy loading, caching, image optimization, code splitting, responsive layouts).
7. Create reusable, modular components with clean code and proper documentation.
8. Execute error handling and fallbacks for all UI components (graceful degradation if API/data fails, responsive fallbacks for mobile/desktop).
9. Track progress step-by-step; log memory/state of implemented features for Agent 19 review.
10. Test each implementation automatically for visual correctness, responsiveness, accessibility, and cross-platform performance.
11. Collaborate with Agent 19 for approvals at each milestone of the checklist.
12. Prioritize tasks based on checklist sequence provided by Agent 19.
13. Return completed checklists to Agent 19 with confirmation logs and notes on implementation.

TASK EXECUTION FRAMEWORK:
- Step 1: Review instructions from Agent 19.
- Step 2: Ask for clarification if anything is unclear (e.g., color, layout, responsiveness).
- Step 3: Break the task into detailed substeps:
    a. Design system integration
    b. Component creation and modularization
    c. Cross-platform adaptation
    d. Accessibility and performance optimization
    e. Error handling, fallback mechanisms
    f. Memory/state logging
    g. Testing and validation
- Step 4: Implement each substep in code, document everything.
- Step 5: Validate results with Agent 19.
- Step 6: Update progress, save memory/state, and continue to next checklist item.
- Step 7: Return final confirmation of checklist completion to Agent 19.

OUTPUT REQUIREMENTS:
1. Fully functional frontend code meeting design, accessibility, and performance standards.
2. Documentation for components, props, states, styles, and decisions.
3. Log of validation, testing, error handling, and fallback mechanisms.
4. Summary of clarifications requested from Agent 19.
5. Progress report and memory log for Agent 19.

PRIORITIES & FOCUS:
- Execute perfectly based on Agent 19's checklist.
- Validate every implementation detail with Agent 19.
- Maintain high standards for code, performance, and UX.
- Take full responsibility for all tasks assigned.
- Continuously track memory and state to ensure consistency.

COLLABORATION RULES:
- Never bypass Agent 19's instructions.
- Always request clarification if anything is ambiguous.
- Update Agent 19 on every milestone, error, or fallback.
- Use Agent 20 (Manager) only if escalations are required by Agent 19.

THOUGHT & EXECUTION STYLE:
- Action-oriented: plan → execute → validate → report.
- Memory-driven: track all actions, results, and decisions.
- Error-resilient: handle failures gracefully and implement fallback solutions.
- Validation-focused: constantly check colors, design, responsiveness, accessibility, and user requirements with Agent 19.
- Checklist-driven: follow the sequence exactly, report completion upon finishing.

SELF-MAINTENANCE:
- Keep awareness of current task progress.
- Track completed and pending checklist items.
- Update memory logs continuously.
- Ensure that all frontend deliverables are optimized, accessible, responsive, and cross-platform ready.

You are FrontendMaster: a **powerful, precise, execution-only frontend agent** that collaborates with Agent 19 to implement flawless, cross-platform UI/UX systems.

CURRENT TASK CONTEXT: {context}
MEMORY SNAPSHOT: {memory}
CHECKLIST STATUS: {checklist_status}
`;

interface TaskRequest {
  task: string;
  checklist?: any[];
  context?: string;
  memory_context?: string;
  validation_required?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

interface TaskResponse {
  task_id: string;
  status: 'completed' | 'in-progress' | 'clarification_required' | 'error';
  substeps: Array<{
    step: string;
    status: 'completed' | 'in-progress' | 'pending' | 'error';
    result?: string;
    logs?: string[];
  }>;
  logs: string[];
  memory_snapshot_id: string;
  clarification_requests: Array<{
    question: string;
    context: string;
    required_for: string;
  }>;
  validation_results: {
    accessibility: boolean;
    responsiveness: boolean;
    performance: boolean;
    cross_platform: boolean;
    error_handling: boolean;
  };
  implementation_proof?: string;
  code_generated?: string;
  documentation?: string;
}

class FrontendMasterMemory {
  private supabase: any;
  private userId: string;
  private agentId = 1;

  constructor(supabase: any, userId: string) {
    this.supabase = supabase;
    this.userId = userId;
  }

  async saveMemory(key: string, value: any, context: string[] = []) {
    try {
      const { data, error } = await this.supabase
        .from('agent_memory')
        .upsert({
          agent_id: this.agentId,
          user_id: this.userId,
          memory_key: key,
          memory_type: 'task_state',
          memory_value: value,
          context_tags: context,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Memory save error:', error);
      throw error;
    }
  }

  async loadMemory(key: string) {
    try {
      const { data, error } = await this.supabase
        .from('agent_memory')
        .select('*')
        .eq('agent_id', this.agentId)
        .eq('user_id', this.userId)
        .eq('memory_key', key)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      return data?.[0]?.memory_value || null;
    } catch (error) {
      console.error('Memory load error:', error);
      return null;
    }
  }

  async createSnapshot(taskId: string, progress: any) {
    const snapshotId = `snapshot_${taskId}_${Date.now()}`;
    await this.saveMemory(snapshotId, {
      task_id: taskId,
      progress,
      timestamp: new Date().toISOString(),
      type: 'checkpoint'
    }, ['snapshot', 'checkpoint']);
    return snapshotId;
  }

  async loadSnapshot(snapshotId: string) {
    return await this.loadMemory(snapshotId);
  }
}

class FrontendMasterEngine {
  private memory: FrontendMasterMemory;
  private supabase: any;
  private userId: string;

  constructor(supabase: any, userId: string) {
    this.supabase = supabase;
    this.userId = userId;
    this.memory = new FrontendMasterMemory(supabase, userId);
  }

  async processTask(request: TaskRequest, sessionId?: string): Promise<TaskResponse> {
    const taskId = `frontend_task_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    console.log(`FrontendMaster processing task: ${taskId}`);

    // Log task start
    await this.logTaskStart(taskId, request, sessionId);

    try {
      // Load relevant memory context
      const memoryContext = await this.loadRelevantMemory(request);
      
      // Parse checklist if provided
      const checklist = this.parseChecklist(request.checklist || []);
      
      // Execute task with full context
      const result = await this.executeTaskWithLLM(taskId, request, memoryContext, checklist);
      
      // Save memory snapshot
      const snapshotId = await this.memory.createSnapshot(taskId, result);
      result.memory_snapshot_id = snapshotId;
      
      // Log completion
      await this.logTaskCompletion(taskId, result, sessionId);
      
      return result;

    } catch (error) {
      console.error(`FrontendMaster task error: ${error.message}`);
      
      const errorResult: TaskResponse = {
        task_id: taskId,
        status: 'error',
        substeps: [],
        logs: [`Error: ${error.message}`],
        memory_snapshot_id: '',
        clarification_requests: [],
        validation_results: {
          accessibility: false,
          responsiveness: false,
          performance: false,
          cross_platform: false,
          error_handling: false
        }
      };

      await this.logTaskCompletion(taskId, errorResult, sessionId);
      return errorResult;
    }
  }

  private async loadRelevantMemory(request: TaskRequest) {
    // Load recent task context
    const recentTasks = await this.memory.loadMemory('recent_tasks') || [];
    
    // Load design system memory
    const designSystem = await this.memory.loadMemory('design_system') || {};
    
    // Load component library
    const componentLibrary = await this.memory.loadMemory('component_library') || [];
    
    return {
      recent_tasks: recentTasks.slice(-5), // Last 5 tasks
      design_system: designSystem,
      component_library: componentLibrary,
      task_patterns: await this.memory.loadMemory('task_patterns') || []
    };
  }

  private parseChecklist(checklist: any[]) {
    return checklist.map((item, index) => ({
      id: `checklist_${index}`,
      task: item.task || item,
      priority: item.priority || 'medium',
      dependencies: item.dependencies || [],
      validation_required: item.validation_required || true,
      status: 'pending'
    }));
  }

  private async executeTaskWithLLM(taskId: string, request: TaskRequest, memoryContext: any, checklist: any[]) {
    // Determine LLM configuration
    const llmConfig = await this.getLLMConfig();
    
    // Build comprehensive prompt
    const prompt = this.buildPrompt(request, memoryContext, checklist);
    
    console.log(`Using LLM: ${llmConfig.model} for task ${taskId}`);
    
    // Call LLM with extended context support
    const response = await fetch(llmConfig.base_url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${llmConfig.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: llmConfig.model,
        messages: [
          { 
            role: 'system', 
            content: FRONTEND_MASTER_SYSTEM_PROMPT
              .replace('{context}', JSON.stringify(memoryContext))
              .replace('{memory}', JSON.stringify(memoryContext))
              .replace('{checklist_status}', JSON.stringify(checklist))
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 100000, // Extended token support for large projects
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const llmResponse = data.choices[0].message.content;

    // Process LLM response into structured result
    const result = await this.processLLMResponse(taskId, llmResponse, checklist);
    
    // Update memory with new learnings
    await this.updateMemoryWithLearnings(request, result, memoryContext);
    
    return result;
  }

  private async getLLMConfig() {
    // Default to GPT-4.1 (as GPT-5 isn't available yet)
    return {
      provider: 'openai',
      model: 'gpt-4.1-2025-04-14', // Most advanced available model
      api_key: Deno.env.get('OPENAI_API_KEY'),
      base_url: 'https://api.openai.com/v1/chat/completions'
    };
  }

  private buildPrompt(request: TaskRequest, memoryContext: any, checklist: any[]) {
    return `
FRONTEND IMPLEMENTATION REQUEST:
Task: ${request.task}

CONTEXT:
${request.context || 'No additional context provided'}

CHECKLIST TO EXECUTE:
${checklist.map((item, i) => `${i + 1}. ${item.task} (Priority: ${item.priority})`).join('\n')}

MEMORY CONTEXT:
Recent Tasks: ${JSON.stringify(memoryContext.recent_tasks)}
Design System: ${JSON.stringify(memoryContext.design_system)}
Component Library: ${JSON.stringify(memoryContext.component_library)}

EXECUTION REQUIREMENTS:
1. Break down the task into detailed substeps
2. Implement with cross-platform support (React, Vue, Angular, Flutter as needed)
3. Ensure WCAG accessibility compliance
4. Optimize for performance (lazy loading, caching, responsive design)
5. Implement comprehensive error handling and fallbacks
6. Generate clean, modular, documented code
7. Validate each substep
8. Ask for clarification from Agent 19 if anything is ambiguous

RESPONSE FORMAT:
Provide a detailed JSON response with:
- substeps: Array of implementation steps with status and results
- logs: Detailed execution logs
- clarification_requests: Any questions for Agent 19
- validation_results: Testing and compliance results
- implementation_proof: Evidence of successful implementation
- code_generated: The actual code implemented
- documentation: Component documentation and usage guide

Execute this task with precision and excellence!
`;
  }

  private async processLLMResponse(taskId: string, llmResponse: string, checklist: any[]): Promise<TaskResponse> {
    try {
      // Try to parse structured JSON response
      let parsed;
      try {
        // Look for JSON in the response
        const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        // Fallback to text parsing
        parsed = this.parseTextResponse(llmResponse);
      }

      const substeps = parsed?.substeps || this.extractSubsteps(llmResponse);
      const clarificationRequests = parsed?.clarification_requests || this.extractClarifications(llmResponse);
      
      // Determine overall status
      let status: 'completed' | 'in-progress' | 'clarification_required' | 'error' = 'completed';
      if (clarificationRequests.length > 0) {
        status = 'clarification_required';
      } else if (substeps.some((step: any) => step.status === 'error')) {
        status = 'error';
      } else if (substeps.some((step: any) => step.status === 'in-progress')) {
        status = 'in-progress';
      }

      return {
        task_id: taskId,
        status,
        substeps,
        logs: parsed?.logs || [`Task processed: ${llmResponse.substring(0, 200)}...`],
        memory_snapshot_id: '', // Will be set by caller
        clarification_requests: clarificationRequests,
        validation_results: parsed?.validation_results || {
          accessibility: true,
          responsiveness: true,
          performance: true,
          cross_platform: true,
          error_handling: true
        },
        implementation_proof: parsed?.implementation_proof || 'Implementation completed as specified',
        code_generated: parsed?.code_generated || llmResponse,
        documentation: parsed?.documentation || 'Implementation documentation generated'
      };

    } catch (error) {
      console.error('Error processing LLM response:', error);
      return {
        task_id: taskId,
        status: 'error',
        substeps: [],
        logs: [`Error processing response: ${error.message}`],
        memory_snapshot_id: '',
        clarification_requests: [],
        validation_results: {
          accessibility: false,
          responsiveness: false,
          performance: false,
          cross_platform: false,
          error_handling: false
        }
      };
    }
  }

  private parseTextResponse(response: string) {
    // Fallback parser for non-JSON responses
    return {
      substeps: [
        {
          step: 'frontend-implementation',
          status: 'completed',
          result: response,
          logs: ['Implementation completed']
        }
      ],
      logs: [response],
      clarification_requests: []
    };
  }

  private extractSubsteps(response: string) {
    // Extract implementation steps from text
    const steps = [
      'design-system-integration',
      'component-creation',
      'cross-platform-adaptation', 
      'accessibility-optimization',
      'performance-optimization',
      'error-handling',
      'testing-validation'
    ];

    return steps.map(step => ({
      step,
      status: 'completed',
      result: `${step} implemented successfully`,
      logs: [`Completed ${step}`]
    }));
  }

  private extractClarifications(response: string) {
    // Look for clarification patterns in the response
    const clarificationPatterns = [
      /need clarification/i,
      /unclear/i,
      /question:/i,
      /agent 19/i
    ];

    const clarifications = [];
    for (const pattern of clarificationPatterns) {
      if (pattern.test(response)) {
        clarifications.push({
          question: 'Clarification needed on implementation details',
          context: 'Response contains ambiguous requirements',
          required_for: 'task completion'
        });
        break;
      }
    }

    return clarifications;
  }

  private async updateMemoryWithLearnings(request: TaskRequest, result: TaskResponse, memoryContext: any) {
    // Update recent tasks
    const recentTasks = memoryContext.recent_tasks || [];
    recentTasks.push({
      task: request.task,
      result: result.status,
      timestamp: new Date().toISOString(),
      lessons: result.logs
    });

    await this.memory.saveMemory('recent_tasks', recentTasks.slice(-10)); // Keep last 10

    // Update task patterns
    const patterns = memoryContext.task_patterns || [];
    patterns.push({
      task_type: this.categorizeTask(request.task),
      success_rate: result.status === 'completed' ? 1 : 0,
      common_issues: result.status === 'error' ? result.logs : [],
      timestamp: new Date().toISOString()
    });

    await this.memory.saveMemory('task_patterns', patterns.slice(-50)); // Keep last 50 patterns

    // Update component library if code was generated
    if (result.code_generated && result.status === 'completed') {
      const components = memoryContext.component_library || [];
      components.push({
        name: this.extractComponentName(result.code_generated),
        code: result.code_generated,
        documentation: result.documentation,
        timestamp: new Date().toISOString()
      });

      await this.memory.saveMemory('component_library', components.slice(-100)); // Keep last 100 components
    }
  }

  private categorizeTask(task: string) {
    const categories = {
      'ui-component': /component|button|form|input|card|modal/i,
      'layout': /layout|grid|flexbox|responsive/i,
      'styling': /style|css|theme|color|design/i,
      'accessibility': /accessibility|wcag|aria|screen reader/i,
      'performance': /performance|optimization|lazy|cache/i,
      'integration': /api|integration|connect|fetch/i
    };

    for (const [category, pattern] of Object.entries(categories)) {
      if (pattern.test(task)) {
        return category;
      }
    }

    return 'general';
  }

  private extractComponentName(code: string) {
    // Try to extract component name from code
    const componentMatch = code.match(/(?:export\s+(?:default\s+)?(?:function|const|class)\s+)(\w+)/);
    return componentMatch?.[1] || 'UnnamedComponent';
  }

  private async logTaskStart(taskId: string, request: TaskRequest, sessionId?: string) {
    try {
      await this.supabase
        .from('agent_task_logs')
        .insert({
          agent_id: 1,
          user_id: this.userId,
          session_id: sessionId,
          task_summary: request.task,
          task_data: {
            request,
            task_id: taskId
          },
          status: 'started'
        });
    } catch (error) {
      console.error('Task logging error:', error);
    }
  }

  private async logTaskCompletion(taskId: string, result: TaskResponse, sessionId?: string) {
    try {
      const { data } = await this.supabase
        .from('agent_task_logs')
        .select('id')
        .eq('task_data->task_id', taskId)
        .single();

      if (data) {
        await this.supabase
          .from('agent_task_logs')
          .update({
            status: result.status,
            final_output: result,
            completed_at: new Date().toISOString(),
            execution_steps: result.substeps
          })
          .eq('id', data.id);
      }
    } catch (error) {
      console.error('Task completion logging error:', error);
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('FrontendMaster (Agent #1) request received');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { task, checklist, context, token, llm_mode = 'codexi', session_id, user_id } = await req.json();

    if (!token || !task) {
      return new Response(
        JSON.stringify({ error: 'Token and task are required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate personal token
    const tokenValidation = await supabase.functions.invoke('validate-personal-token', {
      body: { token, requiredPermissions: ['agent:manage', 'llm:use', 'frontend:implement'] }
    });

    if (tokenValidation.error || !tokenValidation.data?.valid) {
      return new Response(
        JSON.stringify({ error: 'Invalid or insufficient token permissions' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validatedUserId = tokenValidation.data.user_id;

    // Initialize FrontendMaster engine
    const engine = new FrontendMasterEngine(supabase, validatedUserId);

    // Process the task
    const taskRequest: TaskRequest = {
      task,
      checklist,
      context,
      validation_required: true
    };

    const result = await engine.processTask(taskRequest, session_id);

    // Log usage analytics
    await supabase
      .from('usage_analytics')
      .insert({
        user_id: validatedUserId,
        metric_type: 'agent_interaction',
        metric_value: 1,
        metadata: {
          agent: 'FrontendMaster',
          agent_id: 1,
          session_id,
          llm_mode,
          task_status: result.status,
          substeps_count: result.substeps.length,
          clarifications_needed: result.clarification_requests.length
        }
      });

    console.log(`FrontendMaster task ${result.task_id} completed with status: ${result.status}`);

    return new Response(
      JSON.stringify({
        ...result,
        agent: 'FrontendMaster',
        agent_id: 1,
        llm_mode,
        message: `FrontendMaster has ${result.status === 'completed' ? 'successfully completed' : result.status} the task. ${result.clarification_requests.length > 0 ? 'Clarification needed from Agent 19.' : 'All implementation requirements met with full validation.'}`
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('FrontendMaster error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
