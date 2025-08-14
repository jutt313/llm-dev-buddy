
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AGENT_SYSTEM_PROMPT = `You are CodeArchitect (Agent #1), the master of system design and architecture in the CodeXI ecosystem. You are an absolute expert in designing scalable, maintainable, and high-performance software systems. Your work is critical for the Development Hub.

CORE EXPERTISE:
• System Design Patterns (MVC, MVVM, Microservices, Event-Driven Architecture)
• Scalability Architecture (Horizontal/Vertical scaling, Load balancing, CDN integration)
• Code Structure Organization (Modular design, Separation of concerns, Clean architecture)
• Technology Stack Selection (Frameworks, databases, tools, performance considerations)
• API Design (RESTful APIs, GraphQL, gRPC, WebSocket implementations)
• Security Architecture (Authentication, authorization, encryption, secure communication)
• Database Architecture (Relational, NoSQL, caching strategies, data modeling)
• Performance Optimization (Caching, indexing, query optimization, resource management)

RESPONSIBILITIES:
1. Receive architecture tasks from ArchMaster indirectly via Agent #19 (ValidationCore).
2. Analyze requirements, design architecture, and create actionable blueprints.
3. Execute file modifications, code updates, and configuration changes within the scope of your task.
4. Test and verify all changes against your internal checklist.
5. Document errors, fixes, and clarifications in structured logs.
6. Maintain memory of all prior conversations, changes, and task history, both locally (agent-specific) and universally (shared context) for project continuity.
7. Communicate only through Agent #19 for clarifications, approvals, or cross-agent collaboration.
8. Always follow Agent #19 instructions and confirm execution of all tasks and validations.
9. Provide clear, actionable outputs, summaries, and error reports after completing each task.

COLLABORATION WITH AGENT #19:
- All requests for clarification, validation, or cross-agent information must be formatted like:
  {
    "task_summary": "Describe the task in concise terms",
    "clarifications_needed": ["List specific points of confusion or missing data"],
    "errors_found": ["List errors, bugs, or conflicts encountered"],
    "actions_taken": ["List actions executed so far"],
    "confirmation_required": true
  }
- Agent #19 will either provide guidance, query other agents, or approve your action.
- You must obey all instructions from Agent #19 before executing critical changes.
- All communications with Agent #19 are logged in your memory for future reference.

THOUGHT PROCESS & ACTIONS:
1. **Think:** Analyze the task deeply, check prior memory and universal memory for relevant context.
2. **Plan:** Generate a detailed step-by-step architectural solution or modification plan.
3. **Ask:** If anything is unclear, formulate precise questions and ask Agent #19.
4. **Act:** Execute the task, modify files, or implement architecture changes following best practices.
5. **Validate:** Test changes internally using your checklist, and cross-reference with memory for consistency.
6. **Report:** Submit structured results, errors, and solutions to Agent #19.
7. **Iterate:** Incorporate feedback from Agent #19 and redo steps if necessary until task is fully validated.

ERROR HANDLING & FALLBACK:
- Detect errors precisely, log them, and create actionable solutions.
- Never execute changes that are ambiguous; ask Agent #19 first.
- Maintain dynamic fallback:
  - If a solution requires input from another agent, request it through Agent #19.
  - Confirm all cross-agent information before implementing.
- Always update memory with tasks completed, fixes applied, and clarifications received.

MEMORY USAGE:
- Maintain **local memory**: All actions, conversations, and modifications you perform.
- Maintain **universal memory**: Shared project-wide memory for reference across all agents.
- Use memory to validate actions, prevent redundant errors, and improve future performance.

OUTPUT REQUIREMENTS:
- Always provide structured and actionable outputs:
  - Architecture diagrams (if possible)
  - Technical specifications
  - Code and file changes
  - Error reports
  - Actionable checklist
- Include a summary of task execution and memory updates.
- Include the number of tokens used, LLM mode, and session ID for analytics.

PRIORITIES:
1. Accuracy, consistency, and completeness.
2. Collaboration with Agent #19 for all non-trivial actions.
3. Maintain memory and logs for auditing and validation.
4. Deliver actionable, testable outputs.
5. Self-verify and iterate until task meets all checklist requirements.`;

// Memory Management Functions
async function loadAgentMemory(supabase: any, agentId: number, userId: string, sessionId?: string) {
  console.log(`Loading memory for Agent ${agentId}, User: ${userId}`);
  
  const { data: memories, error } = await supabase
    .from('agent_memory')
    .select('*')
    .eq('agent_id', agentId)
    .eq('user_id', userId)
    .or(`session_id.is.null,session_id.eq.${sessionId || 'null'}`)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error loading agent memory:', error);
    return { local: [], universal: [], conversation: [], task_history: [], error_log: [] };
  }

  const memoryByType = {
    local: memories?.filter(m => m.memory_type === 'local') || [],
    universal: memories?.filter(m => m.memory_type === 'universal') || [],
    conversation: memories?.filter(m => m.memory_type === 'conversation') || [],
    task_history: memories?.filter(m => m.memory_type === 'task_history') || [],
    error_log: memories?.filter(m => m.memory_type === 'error_log') || []
  };

  return memoryByType;
}

async function saveAgentMemory(supabase: any, agentId: number, userId: string, sessionId: string, memoryType: string, key: string, value: any, tags: string[] = []) {
  console.log(`Saving memory: Agent ${agentId}, Type: ${memoryType}, Key: ${key}`);
  
  const { error } = await supabase
    .from('agent_memory')
    .upsert({
      agent_id: agentId,
      user_id: userId,
      session_id: sessionId,
      memory_type: memoryType,
      memory_key: key,
      memory_value: value,
      context_tags: tags,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'agent_id,user_id,memory_type,memory_key'
    });

  if (error) {
    console.error('Error saving agent memory:', error);
  }
}

// ValidationCore Communication Functions
async function requestValidationFromCore(supabase: any, requestingAgentId: number, userId: string, sessionId: string, requestType: string, requestData: any) {
  console.log(`Requesting validation from Agent #19: ${requestType}`);
  
  const { data, error } = await supabase
    .from('agent_validations')
    .insert({
      requesting_agent_id: requestingAgentId,
      validation_agent_id: 19,
      user_id: userId,
      session_id: sessionId,
      request_type: requestType,
      request_data: requestData,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating validation request:', error);
    return null;
  }

  // Call ValidationCore agent
  try {
    const validationResponse = await supabase.functions.invoke('validation-core', {
      body: {
        query: `Agent #1 (CodeArchitect) requests ${requestType}: ${JSON.stringify(requestData)}`,
        token: 'system-validation-token',
        llm_mode: 'codexi',
        session_id: sessionId,
        user_id: userId
      }
    });

    if (validationResponse.data) {
      // Update validation record
      await supabase
        .from('agent_validations')
        .update({
          response_data: validationResponse.data,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', data.id);

      return validationResponse.data;
    }
  } catch (validationError) {
    console.error('Error calling ValidationCore:', validationError);
    await supabase
      .from('agent_validations')
      .update({
        status: 'rejected',
        completed_at: new Date().toISOString()
      })
      .eq('id', data.id);
  }

  return null;
}

// NEW: Process Individual Checklist Items
async function processChecklistItem(item: string, agentResponse: string, context: string, taskData: any) {
  console.log(`Processing checklist item: ${item}`);
  
  // Advanced item validation logic
  const itemLower = item.toLowerCase();
  const responseLower = agentResponse.toLowerCase();
  const contextLower = context?.toLowerCase() || '';
  
  let completed = false;
  let details = '';
  let confidence = 0;
  
  // Check if item is addressed in response
  if (responseLower.includes(itemLower)) {
    completed = true;
    confidence += 40;
    details += `Item mentioned in response. `;
  }
  
  // Check if item is addressed in context
  if (contextLower.includes(itemLower)) {
    completed = true;
    confidence += 20;
    details += `Item addressed in context. `;
  }
  
  // Specific validation patterns for common checklist items
  const validationPatterns = {
    'requirements documented': ['requirements', 'specification', 'documented', 'defined'],
    'constraints identified': ['constraint', 'limitation', 'restriction', 'boundary'],
    'success criteria defined': ['success', 'criteria', 'metric', 'benchmark', 'kpi'],
    'system components identified': ['component', 'service', 'module', 'system'],
    'data flow documented': ['data flow', 'dataflow', 'flow diagram', 'data movement'],
    'integration points defined': ['integration', 'api', 'endpoint', 'interface'],
    'scalability considerations': ['scalability', 'scaling', 'performance', 'load'],
    'authentication strategy': ['authentication', 'auth', 'login', 'identity'],
    'authorization model': ['authorization', 'permission', 'access control', 'rbac'],
    'data encryption': ['encryption', 'encrypt', 'security', 'cryptography'],
    'security vulnerabilities': ['security', 'vulnerability', 'risk', 'threat'],
    'performance benchmarks': ['performance', 'benchmark', 'metric', 'speed'],
    'caching strategy': ['cache', 'caching', 'redis', 'memcached'],
    'database optimization': ['database', 'db', 'optimization', 'query', 'index'],
    'load balancing': ['load balancing', 'load balancer', 'distribute load'],
    'code structure': ['structure', 'architecture', 'organization', 'pattern'],
    'documentation': ['documentation', 'docs', 'readme', 'comment'],
    'error handling': ['error handling', 'exception', 'try catch', 'error'],
    'testing strategy': ['testing', 'test', 'unit test', 'integration test']
  };
  
  // Check against validation patterns
  for (const [pattern, keywords] of Object.entries(validationPatterns)) {
    if (itemLower.includes(pattern)) {
      const keywordFound = keywords.some(keyword => 
        responseLower.includes(keyword) || contextLower.includes(keyword)
      );
      if (keywordFound) {
        completed = true;
        confidence += 30;
        details += `Pattern matching for "${pattern}" found. `;
        break;
      }
    }
  }
  
  // Final validation
  if (!details) {
    details = `Item "${item}" not clearly addressed in response or context.`;
  }
  
  return {
    completed,
    confidence,
    details: details.trim(),
    timestamp: new Date().toISOString()
  };
}

// NEW: Validate Checklist Completion
async function validateChecklistCompletion(checklistResults: any[]) {
  console.log('Validating checklist completion');
  
  const totalItems = checklistResults.length;
  const completedItems = checklistResults.filter(item => item.status === 'completed').length;
  const failedItems = checklistResults.filter(item => item.status === 'failed');
  
  const completionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  const isComplete = completionRate >= 80; // 80% threshold for completion
  
  return {
    isComplete,
    completionRate,
    totalItems,
    completedItems,
    failedItems: failedItems.length,
    failedItemDetails: failedItems,
    summary: `${completedItems}/${totalItems} items completed (${completionRate.toFixed(1)}%)`
  };
}

// NEW: Send Checklist Results to ValidationCore
async function sendChecklistResultsToValidationCore(
  supabase: any, userId: string, sessionId: string, 
  task: string, checklistResults: any[], agentResponse: string, 
  checklistValidation: any
) {
  console.log('Sending checklist results to ValidationCore for final approval');
  
  const approvalRequest = {
    task_summary: task,
    checklist_results: checklistResults,
    checklist_validation: checklistValidation,
    agent_response: agentResponse,
    completion_rate: checklistValidation.completionRate,
    failed_items: checklistValidation.failedItemDetails,
    requires_final_approval: true,
    request_type: 'checklist_approval'
  };
  
  const validationResponse = await requestValidationFromCore(
    supabase, 1, userId, sessionId, 'approval', approvalRequest
  );
  
  return validationResponse;
}

// Task Execution Framework
async function createTaskLog(supabase: any, agentId: number, userId: string, sessionId: string, taskSummary: string, taskData: any) {
  const { data, error } = await supabase
    .from('agent_task_logs')
    .insert({
      agent_id: agentId,
      user_id: userId,
      session_id: sessionId,
      task_summary: taskSummary,
      task_data: taskData,
      status: 'started'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating task log:', error);
    return null;
  }

  return data.id;
}

async function updateTaskLog(supabase: any, taskId: string, updates: any) {
  const { error } = await supabase
    .from('agent_task_logs')
    .update(updates)
    .eq('id', taskId);

  if (error) {
    console.error('Error updating task log:', error);
  }
}

// Checklist Validation System
async function loadAgentChecklist(supabase: any, agentId: number, userId: string) {
  const { data: checklist, error } = await supabase
    .from('agent_checklists')
    .select('*')
    .eq('agent_id', agentId)
    .eq('is_default', true)
    .single();

  if (error) {
    console.error('Error loading agent checklist:', error);
    return null;
  }

  return checklist;
}

// Enhanced LLM Configuration
function getEnhancedLLMConfig(llmMode: string, apiKey: string, taskComplexity: 'simple' | 'medium' | 'complex' = 'medium') {
  const configs = {
    codexi: {
      simple: { model: 'gpt-4o-mini', max_tokens: 4000 },
      medium: { model: 'gpt-4.1-2025-04-14', max_tokens: 16000 },
      complex: { model: 'o3-2025-04-16', max_tokens: 100000 }
    },
    custom: {
      simple: { model: 'gpt-4o-mini', max_tokens: 4000 },
      medium: { model: 'gpt-4', max_tokens: 8000 },
      complex: { model: 'gpt-4', max_tokens: 32000 }
    }
  };

  const config = configs[llmMode as keyof typeof configs] || configs.codexi;
  const selectedConfig = config[taskComplexity];

  return {
    provider: 'openai',
    model: selectedConfig.model,
    api_key: apiKey,
    base_url: 'https://api.openai.com/v1/chat/completions',
    max_tokens: selectedConfig.max_tokens,
    temperature: 0.7
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    console.log('CodeArchitect Agent #1 enhanced request received');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { task, token, llm_mode = 'codexi', session_id, context, task_complexity = 'medium' } = await req.json();

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

    // Create task log
    const taskId = await createTaskLog(supabase, 1, validatedUserId, session_id, task, { context, complexity: task_complexity });

    // Step 1: Think - Load agent memory for context
    console.log('Step 1: Loading agent memory for context');
    const agentMemory = await loadAgentMemory(supabase, 1, validatedUserId, session_id);
    
    await updateTaskLog(supabase, taskId, {
      status: 'planning',
      execution_steps: [{ step: 'memory_loaded', timestamp: new Date().toISOString(), details: 'Agent memory loaded successfully' }]
    });

    // Step 2: Plan - Analyze task complexity and determine if ValidationCore consultation is needed
    const needsValidation = task_complexity === 'complex' || task.toLowerCase().includes('critical') || task.toLowerCase().includes('security');
    
    let validationResponse = null;
    if (needsValidation) {
      console.log('Step 2: Requesting validation from Agent #19');
      await updateTaskLog(supabase, taskId, { status: 'validating' });
      
      validationResponse = await requestValidationFromCore(supabase, 1, validatedUserId, session_id, 'validation', {
        task_summary: task,
        complexity: task_complexity,
        requires_approval: true
      });

      // Save validation conversation to memory
      await saveAgentMemory(supabase, 1, validatedUserId, session_id, 'conversation', `validation_${Date.now()}`, {
        request: task,
        response: validationResponse,
        timestamp: new Date().toISOString()
      }, ['validation', 'agent_19']);
    }

    // Step 3: Act - Get LLM configuration and execute task
    console.log('Step 3: Executing architectural task');
    await updateTaskLog(supabase, taskId, { status: 'executing' });

    let llmConfig;
    if (llm_mode === 'codexi') {
      llmConfig = getEnhancedLLMConfig('codexi', Deno.env.get('OPENAI_API_KEY') ?? '', task_complexity as any);
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

      llmConfig = getEnhancedLLMConfig('custom', credentials.api_key_encrypted, task_complexity as any);
    }

    // Prepare enhanced context with memory
    const memoryContext = `
AGENT MEMORY CONTEXT:
- Local Memory Entries: ${agentMemory.local.length}
- Universal Memory Entries: ${agentMemory.universal.length}
- Previous Conversations: ${agentMemory.conversation.length}
- Task History: ${agentMemory.task_history.length}
- Error Logs: ${agentMemory.error_log.length}

${validationResponse ? `VALIDATION FROM AGENT #19:\n${JSON.stringify(validationResponse, null, 2)}` : ''}

CURRENT TASK:
${task}

${context ? `ADDITIONAL CONTEXT:\n${context}` : ''}

Execute this architectural task following your THOUGHT PROCESS & ACTIONS framework. Provide detailed, actionable architectural solutions with clear implementation guidance.
`;

    // Call LLM with enhanced context
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
          { role: 'user', content: memoryContext }
        ],
        temperature: llmConfig.temperature,
        max_tokens: llmConfig.max_tokens
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const agentResponse = data.choices[0].message.content;

    // Step 4: Validate - Load and EXECUTE checklist (FIXED - No longer just loading!)
    console.log('Step 4: Loading and EXECUTING quality checklist');
    const checklist = await loadAgentChecklist(supabase, 1, validatedUserId);
    
    let checklistResults: any[] = [];
    let checklistValidation: any = null;
    let finalApprovalResponse: any = null;

    if (checklist) {
      console.log('EXECUTING checklist items...');
      
      // Process each checklist category and item
      const checklistItems = checklist.checklist_items;
      
      for (const [category, categoryData] of Object.entries(checklistItems)) {
        console.log(`Processing category: ${category}`);
        
        if (categoryData && typeof categoryData === 'object' && 'items' in categoryData) {
          const items = (categoryData as any).items;
          
          for (const item of items) {
            console.log(`Processing item: ${item}`);
            
            const itemResult = await processChecklistItem(
              item, 
              agentResponse, 
              context || '', 
              { task, complexity: task_complexity }
            );
            
            checklistResults.push({
              category,
              item,
              status: itemResult.completed ? 'completed' : 'failed',
              confidence: itemResult.confidence,
              details: itemResult.details,
              timestamp: itemResult.timestamp
            });
          }
        }
      }
      
      // Validate overall checklist completion
      checklistValidation = await validateChecklistCompletion(checklistResults);
      console.log(`Checklist validation result: ${checklistValidation.summary}`);
      
      // CRITICAL FIX: Send checklist results to ValidationCore for final approval
      console.log('Sending checklist results to Agent #19 for final approval...');
      finalApprovalResponse = await sendChecklistResultsToValidationCore(
        supabase, validatedUserId, session_id, task, 
        checklistResults, agentResponse, checklistValidation
      );
      
      // Handle Agent #19's approval/rejection
      if (finalApprovalResponse) {
        const approvalText = finalApprovalResponse.validation || '';
        const isApproved = approvalText.toLowerCase().includes('approve') || 
                          approvalText.toLowerCase().includes('accept') ||
                          checklistValidation.completionRate >= 80;
        
        if (!isApproved && checklistValidation.completionRate < 60) {
          // Return error if not approved and completion rate is too low
          return new Response(JSON.stringify({
            error: 'Task not approved by ValidationCore - insufficient checklist completion',
            details: {
              validation_response: approvalText,
              completion_rate: checklistValidation.completionRate,
              failed_items: checklistValidation.failedItemDetails
            },
            agent: 'CodeArchitect',
            agent_id: 1,
            task_id: taskId,
            checklist_results: checklistResults
          }), { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
        }
        
        console.log(`Final approval from Agent #19: ${isApproved ? 'APPROVED' : 'CONDITIONALLY APPROVED'}`);
      }
    }

    // Step 5: Report - Save task results and update memory
    const executionTime = Date.now() - startTime;
    
    await updateTaskLog(supabase, taskId, {
      status: 'completed',
      final_output: { 
        response: agentResponse, 
        validation: validationResponse,
        checklist_results: checklistResults,
        checklist_validation: checklistValidation,
        final_approval: finalApprovalResponse
      },
      tokens_used: data.usage?.total_tokens || 0,
      execution_time_ms: executionTime,
      completed_at: new Date().toISOString()
    });

    // Save task to memory
    await saveAgentMemory(supabase, 1, validatedUserId, session_id, 'task_history', `task_${taskId}`, {
      task,
      response: agentResponse,
      tokens_used: data.usage?.total_tokens || 0,
      execution_time_ms: executionTime,
      validation_used: needsValidation,
      checklist_executed: checklist ? true : false,
      checklist_completion_rate: checklistValidation?.completionRate || 0,
      final_approval_received: finalApprovalResponse ? true : false
    }, ['completed', task_complexity]);

    // Update universal memory with successful patterns
    await saveAgentMemory(supabase, 1, validatedUserId, session_id, 'universal', 'successful_patterns', {
      pattern_type: 'architectural_task',
      complexity: task_complexity,
      validation_required: needsValidation,
      checklist_completion_rate: checklistValidation?.completionRate || 0,
      success_indicators: [
        'task_completed', 
        'memory_updated', 
        'checklist_executed',
        'validation_core_approved'
      ]
    }, ['pattern', 'success']);

    // Log usage analytics
    await supabase
      .from('usage_analytics')
      .insert({
        user_id: validatedUserId,
        metric_type: 'agent_interaction',
        metric_value: 1,
        metadata: {
          agent: 'CodeArchitect',
          agent_id: 1,
          session_id,
          llm_mode,
          tokens_used: data.usage?.total_tokens || 0,
          task_complexity,
          execution_time_ms: executionTime,
          validation_used: needsValidation,
          memory_entries_loaded: agentMemory.local.length + agentMemory.universal.length,
          checklist_executed: checklist ? true : false,
          checklist_completion_rate: checklistValidation?.completionRate || 0,
          checklist_items_processed: checklistResults.length,
          final_approval_received: finalApprovalResponse ? true : false
        }
      });

    console.log('CodeArchitect Agent #1 enhanced task completed successfully');

    return new Response(
      JSON.stringify({
        response: agentResponse,
        agent: 'CodeArchitect',
        agent_id: 1,
        team: 'Development Hub',
        llm_mode,
        task_id: taskId,
        tokens_used: data.usage?.total_tokens || 0,
        execution_time_ms: executionTime,
        task_complexity,
        validation_used: needsValidation,
        memory_context_loaded: true,
        checklist_executed: checklist ? true : false,
        checklist_results: checklistResults,
        checklist_validation: checklistValidation,
        final_approval_response: finalApprovalResponse,
        task_completed: true,
        workflow_complete: true
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('CodeArchitect Agent #1 enhanced error:', error);
    
    // Log error to memory if we have user context
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      // Save error to memory for learning
      await saveAgentMemory(supabase, 1, 'system', 'error_session', 'error_log', `error_${Date.now()}`, {
        error: error.message,
        timestamp: new Date().toISOString(),
        stack: error.stack
      }, ['error', 'system']);
    } catch (memoryError) {
      console.error('Failed to save error to memory:', memoryError);
    }

    return new Response(
      JSON.stringify({ 
        error: 'Internal server error: ' + error.message,
        agent: 'CodeArchitect',
        agent_id: 1,
        enhanced_mode: true
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
