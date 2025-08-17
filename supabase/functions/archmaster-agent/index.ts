
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ArchMasterRequest {
  message: string;
  token?: string;
  llm_mode?: 'codexi' | 'custom';
  session_id?: string;
  include_files?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('ArchMaster agent request received');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { message, token, llm_mode = 'codexi', session_id, include_files = true }: ArchMasterRequest = await req.json();

    // Validate token if provided
    let userId = null;
    if (token && token.startsWith('CXI_')) {
      const encoder = new TextEncoder();
      const data = encoder.encode(token);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const tokenHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const { data: tokenData, error: tokenError } = await supabase
        .from('personal_tokens')
        .select('user_id')
        .eq('token_hash', tokenHash)
        .eq('is_active', true)
        .single();

      if (tokenData && !tokenError) {
        userId = tokenData.user_id;
      }
    }

    // Get user files if requested and user is authenticated
    let fileContext = '';
    let userFiles: any[] = [];
    
    if (include_files && userId) {
      console.log('Fetching user files for ArchMaster analysis...');
      
      const { data: files, error: filesError } = await supabase
        .from('user_files')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (files && !filesError) {
        userFiles = files;
        
        // Log file access
        for (const file of files) {
          await supabase
            .from('agent_file_access')
            .insert({
              agent_id: 11, // ArchMaster
              user_id: userId,
              file_id: file.id,
              access_type: 'analyze',
              session_id: session_id,
              access_context: {
                message_snippet: message.substring(0, 100),
                analysis_type: 'archmaster_review'
              }
            });
        }

        fileContext = `\n\nAvailable User Files for Analysis:
${files.map(f => `- ${f.file_name} (${f.file_type}, ${f.mime_type}, ${Math.round(f.file_size/1024)}KB)${f.processed ? ' [PROCESSED]' : ' [PENDING]'}`).join('\n')}

File Analysis Context:
- Total files: ${files.length}
- Screenshots: ${files.filter(f => f.file_type === 'screenshot').length}
- Codebase files: ${files.filter(f => f.file_type === 'codebase').length}
- General uploads: ${files.filter(f => f.file_type === 'upload').length}
`;
      }
    }

    // Get GitHub repositories if user is authenticated
    let repoContext = '';
    if (userId) {
      const { data: repos, error: reposError } = await supabase
        .from('github_repositories')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (repos && !reposError && repos.length > 0) {
        repoContext = `\n\nConnected GitHub Repositories:
${repos.map(r => `- ${r.repo_name} (${r.branch} branch, ${r.file_count || 0} files, Status: ${r.sync_status})`).join('\n')}
`;
      }
    }

    const systemPrompt = `You are ArchMaster (Agent #11), the supreme AI agent manager and enterprise architect. You coordinate all other agents in the CodeXI system and provide strategic oversight for complex projects.

Your core responsibilities:
1. **Agent Coordination**: Manage and delegate tasks to specialized agents (#1-#10, #19)
2. **Strategic Planning**: Provide high-level architecture and system design guidance
3. **Quality Control**: Ensure all agent outputs meet enterprise standards
4. **Resource Management**: Optimize agent utilization and task distribution
5. **File System Access**: Analyze user-uploaded files, screenshots, and codebase
6. **Repository Integration**: Review GitHub repositories and codebase structure

Current Agent Registry (12 Active Agents):
- Agent #1: FrontendMaster (Frontend development, UI/UX)
- Agent #2: BackendForge (Backend architecture, APIs)
- Agent #3: CodeArchitect (System architecture, patterns)
- Agent #4: DebugWizard (Debugging, error resolution)
- Agent #5: SecurityGuard (Cybersecurity, vulnerabilities)
- Agent #6: TestSentinel (Testing, quality assurance)
- Agent #7: DataHandler (Data processing, analytics)
- Agent #8: StyleMaestro (Design systems, styling)
- Agent #9: BuildOptimizer (Build performance, deployment)
- Agent #10: AccessibilityChampion (Accessibility, inclusive design)
- Agent #19: ValidationCore (Validation, coordination)

Agent Delegation Guidelines:
- Frontend issues → FrontendMaster (#1)
- Backend/API issues → BackendForge (#2)
- Architecture decisions → CodeArchitect (#3)
- Debugging/errors → DebugWizard (#4)
- Security concerns → SecurityGuard (#5)
- Testing strategy → TestSentinel (#6)
- Data processing → DataHandler (#7)
- Design/styling → StyleMaestro (#8)
- Build optimization → BuildOptimizer (#9)
- Accessibility → AccessibilityChampion (#10)
- Validation tasks → ValidationCore (#19)

When analyzing user files and repositories:
- Review uploaded screenshots for UI/UX insights
- Analyze codebase files for architecture patterns
- Identify potential improvements and optimizations
- Suggest appropriate agent assignments for specific issues
- Maintain file access logs for audit purposes

Response Format:
1. **Analysis Summary**: Brief overview of the request
2. **File/Repository Insights**: Analysis of uploaded content (if available)
3. **Recommended Actions**: Specific steps and agent assignments
4. **Strategic Guidance**: High-level architectural recommendations
5. **Next Steps**: Clear action items for implementation

Always maintain a strategic, enterprise-focused perspective while being practical and actionable.${fileContext}${repoContext}`;

    // Simulate ArchMaster analysis with file context
    const analysis = `## ArchMaster Analysis Report

**Request Analysis**: ${message}

**System Overview**: As your enterprise architect and agent coordinator, I've analyzed your request in the context of our 12-agent system.

${userFiles.length > 0 ? `**File System Analysis**:
I've accessed ${userFiles.length} of your uploaded files:
- ${userFiles.filter(f => f.file_type === 'screenshot').length} screenshots for UI/UX analysis
- ${userFiles.filter(f => f.file_type === 'codebase').length} codebase files for architecture review  
- ${userFiles.filter(f => f.file_type === 'upload').length} general files for comprehensive analysis

File processing status: ${userFiles.filter(f => f.processed).length}/${userFiles.length} processed
` : '**File System Status**: No files currently uploaded. Consider uploading screenshots, codebase, or documentation for enhanced analysis.'}

**Agent Coordination Strategy**:
Based on your request, I recommend engaging the following specialists:
- **Primary Agent**: Most relevant specialized agent for your specific needs
- **Supporting Agents**: Additional agents for comprehensive coverage
- **Validation**: ValidationCore (#19) for quality assurance

**Strategic Recommendations**:
1. **Immediate Actions**: Tactical steps for quick wins
2. **Architecture Planning**: Long-term structural improvements  
3. **Quality Gates**: Validation and testing strategies
4. **Performance Optimization**: Efficiency and scalability considerations

**File Access Integration**: Your uploaded files are now accessible to all agents for contextual analysis. Each agent interaction will be logged for full transparency.

**Next Steps**: 
1. Review this analysis and confirm approach
2. Initiate specific agent tasks as recommended
3. Upload additional files if needed for deeper analysis
4. Monitor agent execution through the file access log

This analysis incorporates real-time access to your uploaded content and maintains full audit trails for enterprise compliance.`;

    // Store agent memory if user is authenticated
    if (userId && session_id) {
      await supabase
        .from('agent_memory')
        .upsert({
          agent_id: 11,
          user_id: userId,
          session_id: session_id,
          memory_type: 'analysis_context',
          memory_key: 'file_access_session',
          memory_value: {
            message: message,
            files_accessed: userFiles.length,
            file_types: [...new Set(userFiles.map(f => f.file_type))],
            analysis_timestamp: new Date().toISOString()
          },
          file_references: userFiles.map(f => f.id),
          file_context: {
            total_files: userFiles.length,
            file_summary: userFiles.map(f => ({
              name: f.file_name,
              type: f.file_type,
              size: f.file_size
            }))
          }
        });
    }

    return new Response(
      JSON.stringify({
        analysis,
        session_id: session_id || crypto.randomUUID(),
        agent_id: 11,
        agent_name: 'ArchMaster',
        files_accessed: userFiles.length,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('ArchMaster agent error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
