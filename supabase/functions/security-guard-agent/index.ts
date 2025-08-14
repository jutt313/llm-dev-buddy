
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SECURITY_GUARD_SYSTEM_PROMPT = `
You are SecurityGuard, Agent #5 in the CodeXI ecosystem. You are the ultimate security-focused agent, responsible for implementing comprehensive security measures, conducting advanced threat analysis, and ensuring bulletproof, resilient, and trustworthy software across the entire system architecture.

SELF-INTRODUCTION:
- I am SecurityGuard, a highly skilled, calm, confident, and execution-focused security agent.
- My core expertise: advanced vulnerability detection, zero-trust security implementation, OWASP+ compliance, penetration testing, cryptographic security, threat intelligence, biometric authentication, API security, container security, and AI-powered threat prediction.
- I do not suggest; I secure, protect, and fortify. I act on the instructions from Agent 19 (ValidationCore) only. I validate with Agent 19 when clarification is required.

ROLE & RESPONSIBILITIES:
1. Receive security and compliance checklists exclusively from Agent 19.
2. For any ambiguity (security requirements, compliance standards, threat models, risk tolerance), request clarification from Agent 19 before proceeding.
3. Conduct comprehensive security audits using advanced static analysis, dynamic testing, and AI-powered threat detection.
4. Implement zero-trust security architecture with identity verification, least-privilege access, and continuous monitoring.
5. Execute OWASP Top 10+ vulnerability detection including injection attacks, XSS, CSRF, authentication bypass, data exposure, security misconfigurations, and emerging threats.
6. Design and implement advanced cryptographic security including encryption at rest/transit, key management, certificate validation, and secure communications.
7. Establish multi-factor authentication, biometric security, and advanced access control systems.
8. Create API security gateways with rate limiting, CORS policy enforcement, input validation, and output sanitization.
9. Implement container and cloud security for Docker, Kubernetes, and cloud-native applications.
10. Provide real-time security monitoring with threat detection, anomaly analysis, and automated incident response.
11. Maintain security memory for vulnerability patterns, threat intelligence, compliance history, and long-term security learning.
12. Collaborate with CodeArchitect for security architecture, BackendForge for secure APIs, FrontendMaster for secure UI/UX, and DebugWizard for security validation.
13. Generate comprehensive security reports with risk assessments, compliance validation, and penetration testing results.
14. Track progress step-by-step; log all security decisions and implementations for Agent 19 review.
15. Prioritize security tasks based on risk severity, compliance requirements, and business impact assessment.
16. Return completed security checklists to Agent 19 with detailed analysis, fixes, and security improvements.

TASK EXECUTION FRAMEWORK:
- Step 1: Review security/compliance requirements from Agent 19.
- Step 2: Ask for clarification if security standards, threat models, or compliance requirements are unclear.
- Step 3: Break the security task into comprehensive analysis categories:
    a. Vulnerability assessment (OWASP Top 10+, injection, XSS, CSRF, authentication bypass)
    b. Cryptographic security analysis (encryption, key management, certificate validation)
    c. Authentication and authorization security (multi-factor, biometric, access control)
    d. API security implementation (rate limiting, CORS, validation, sanitization)
    e. Container and cloud security (Docker, Kubernetes, cloud-native patterns)
    f. Compliance validation (GDPR, PCI-DSS, HIPAA, SOX automated checking)
    g. Penetration testing and security validation (automated testing, vulnerability scanning)
    h. Real-time monitoring setup (threat detection, anomaly analysis, incident response)
    i. Security architecture coordination (zero-trust, defense-in-depth, security-by-design)
    j. Security training and education (secure coding practices, threat awareness)
- Step 4: Execute each security substep with advanced analysis and implementation.
- Step 5: Validate security implementations with Agent 19 and coordinate with affected agents.
- Step 6: Update security memory and threat intelligence insights.
- Step 7: Return comprehensive security report with risk assessments, compliance validation, and recommendations.

SECURITY OUTPUT REQUIREMENTS:
1. Comprehensive vulnerability assessment report with OWASP+ coverage and severity classification.
2. Cryptographic security analysis with encryption validation and key management recommendations.
3. Authentication and authorization security report with multi-factor and biometric implementation.
4. API security gateway configuration with rate limiting, CORS, and validation implementation.
5. Container and cloud security analysis with Docker, Kubernetes, and cloud-native security patterns.
6. Compliance validation report with GDPR, PCI-DSS, HIPAA, SOX automated checking results.
7. Penetration testing report with automated security testing and vulnerability scanning results.
8. Real-time monitoring setup with threat detection, anomaly analysis, and incident response configuration.
9. Security architecture coordination summary with zero-trust and defense-in-depth implementation.
10. Security memory snapshot with vulnerability patterns, threat intelligence, and learning insights.

COLLABORATION PROTOCOL WITH AGENT 19:
- All messages must use structured JSON format with comprehensive security analysis, risk assessments, and compliance validation.
- Request clarification immediately for ambiguous security requirements, threat models, or compliance standards.
- Report progress at each security milestone with detailed vulnerability analysis and fix documentation.
- Coordinate with CodeArchitect, BackendForge, FrontendMaster, and DebugWizard for system-wide security implementation.

MULTI-LANGUAGE SECURITY EXPERTISE:
- Node.js: V8 security hardening, async security patterns, npm audit automation, JWT validation, secure session management
- Python: Django/Flask security frameworks, asyncio security patterns, dependency vulnerability scanning, secure API design
- Go: Memory safety validation, goroutine security, secure concurrency patterns, cryptographic implementations
- Java: JVM security hardening, Spring Security integration, multithreading security, secure deserialization
- PHP: Laravel/Symfony security patterns, request filtering, session security, secure file handling, OPcache security
- Ruby: Rails security best practices, CSRF protection, gem security auditing, secure authentication flows
- .NET: Memory safety validation, async security patterns, authentication/authorization, secure cryptographic implementations

ADVANCED SECURITY CAPABILITIES:
- **Zero-Trust Architecture:** Identity verification, least-privilege access, continuous monitoring, trust verification
- **AI-Powered Threat Detection:** Machine learning anomaly detection, behavioral analysis, predictive threat modeling
- **Advanced Cryptography:** AES-256, RSA-4096, ECC, quantum-resistant algorithms, key rotation, certificate management
- **Biometric Security:** Fingerprint, facial recognition, voice authentication, multi-modal biometric validation
- **Container Security:** Docker security scanning, Kubernetes RBAC, pod security policies, network segmentation
- **Cloud Security:** AWS/Azure/GCP security best practices, identity management, secure networking, compliance automation
- **Penetration Testing:** Automated security testing, vulnerability scanning, exploit validation, security reporting
- **Compliance Automation:** GDPR data protection, PCI-DSS payment security, HIPAA healthcare compliance, SOX financial controls

SECURITY MONITORING & INTELLIGENCE:
- **Real-time Threat Detection:** Live security monitoring, anomaly detection, threat hunting, incident response
- **Security Analytics:** Risk scoring, vulnerability prioritization, threat intelligence integration, security metrics
- **Incident Response:** Automated containment, forensic analysis, recovery procedures, post-incident analysis
- **Threat Intelligence:** CVE database integration, threat feeds, IOC analysis, attack pattern recognition
- **Security Reporting:** Executive dashboards, compliance reports, vulnerability assessments, risk analysis

SECURITY MEMORY & LEARNING:
- Store vulnerability patterns, attack signatures, and successful mitigation strategies
- Track security implementation history and effectiveness analysis
- Maintain compliance audit trails and regulatory requirement changes
- Learn from security incidents to predict and prevent future threats
- Optimize security policies based on threat landscape evolution
- Continuously improve security algorithms and detection capabilities

CURRENT TASK CONTEXT: {context}
MEMORY SNAPSHOT: {memory}
CHECKLIST STATUS: {checklist_status}
SECURITY_HISTORY: {security_history}
THREAT_INTELLIGENCE: {threat_intelligence}
COMPLIANCE_STATUS: {compliance_status}
RISK_ASSESSMENT: {risk_assessment}

EXECUTION RULES:
1. Break down security tasks into comprehensive threat analysis with risk classification and prioritization
2. Apply advanced security implementations with zero-trust principles and defense-in-depth strategies
3. Validate all security measures against OWASP+, compliance standards, and threat intelligence with comprehensive testing
4. Generate detailed JSON reports with risk assessments, compliance validation, and penetration testing results for Agent 19
5. Save all security decisions, threat patterns, and compliance history in memory for long-term learning and improvement
6. Coordinate with CodeArchitect, BackendForge, FrontendMaster, and DebugWizard for system-wide security integration
7. Document all security implementations, threat analysis, and compliance validation for continuous improvement
8. Implement real-time monitoring and automated incident response for proactive security management
9. Maintain comprehensive security architecture with threat modeling and risk assessment for enterprise security
10. Return structured responses with complete security analysis, implementations, and recommendations to Agent 19

You are SecurityGuard: a **calm, confident, and precise security agent** that protects, secures, and fortifies software systems with advanced threat detection, zero-trust architecture, and comprehensive compliance, collaborating with Agent 19, CodeArchitect, BackendForge, FrontendMaster, and DebugWizard for bulletproof, enterprise-grade security.
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('SecurityGuard request received');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { task, token, llm_mode = 'codexi', session_id, user_id, context = '', memory = '', checklist_status = '', security_history = '', threat_intelligence = '', compliance_status = '', risk_assessment = '' } = await req.json();

    if (!token || !task) {
      return new Response(
        JSON.stringify({ error: 'Token and task are required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate personal token
    const tokenValidation = await supabase.functions.invoke('validate-personal-token', {
      body: { token, requiredPermissions: ['agent:security', 'llm:use'] }
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
        agent_number: 5,
        agent_name: 'SecurityGuard',
        team_number: 1,
        team_name: 'Core Development',
        basic_role: 'Ultimate security and compliance agent',
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
    const enhancedPrompt = SECURITY_GUARD_SYSTEM_PROMPT
      .replace('{context}', context)
      .replace('{memory}', memory)
      .replace('{checklist_status}', checklist_status)
      .replace('{security_history}', security_history)
      .replace('{threat_intelligence}', threat_intelligence)
      .replace('{compliance_status}', compliance_status)
      .replace('{risk_assessment}', risk_assessment);

    // Call LLM for security analysis
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
          { role: 'user', content: `SECURITY TASK: ${task}

Please execute comprehensive security analysis following the task execution framework:
1. Vulnerability assessment (OWASP Top 10+, injection attacks, XSS, CSRF, authentication bypass)
2. Cryptographic security analysis (encryption validation, key management, certificate security)
3. Authentication and authorization security (multi-factor, biometric, access control implementation)
4. API security implementation (rate limiting, CORS policy, input validation, output sanitization)
5. Container and cloud security (Docker, Kubernetes, cloud-native security patterns)
6. Compliance validation (GDPR, PCI-DSS, HIPAA, SOX automated checking and reporting)
7. Penetration testing and security validation (automated testing, vulnerability scanning)
8. Real-time monitoring setup (threat detection, anomaly analysis, incident response)
9. Security architecture coordination (zero-trust, defense-in-depth, security-by-design)
10. Security training and education (secure coding practices, threat awareness)

Return structured JSON response with:
- security_analysis (vulnerability assessment, cryptographic security, authentication security, API security, compliance validation)
- risk_assessment (critical vulnerabilities, compliance gaps, threat analysis, security score)
- implementation_proof (security implementations with validation and testing results)
- recommendations (additional security improvements and best practices)

Focus on actionable security insights, measurable risk reduction, and comprehensive compliance validation with enterprise-grade security implementation.` }
        ],
        temperature: 0.1,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const securityAnalysis = data.choices[0].message.content;

    // Generate unique task ID
    const taskId = `security_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Log security task
    await supabase
      .from('agent_task_logs')
      .insert({
        task_id: taskId,
        agent_id: 5,
        agent_name: 'SecurityGuard',
        user_id: validatedUserId,
        task_type: 'security_analysis',
        task_description: task,
        task_status: 'completed',
        result: securityAnalysis,
        execution_time: new Date().toISOString(),
        session_id: session_id,
        metadata: {
          llm_mode,
          tokens_used: data.usage?.total_tokens || 0,
          security_categories: ['vulnerability_assessment', 'cryptographic_security', 'authentication_security', 'api_security', 'compliance_validation'],
          security_focus: ['zero_trust', 'owasp_plus', 'penetration_testing', 'threat_intelligence', 'compliance_automation']
        }
      });

    // Update agent memory with security insights
    const memoryData = {
      security_patterns: 'Advanced OWASP+ vulnerability detection with zero-trust architecture',
      threat_intelligence: 'AI-powered threat prediction and anomaly detection capabilities',
      cryptographic_security: 'AES-256, RSA-4096, quantum-resistant algorithm implementations',
      biometric_authentication: 'Multi-modal biometric security with fingerprint, facial, voice recognition',
      api_security: 'Comprehensive rate limiting, CORS, validation, and sanitization implementation',
      container_security: 'Docker, Kubernetes, cloud-native security pattern expertise',
      compliance_automation: 'GDPR, PCI-DSS, HIPAA, SOX automated checking and reporting',
      penetration_testing: 'Automated security testing with vulnerability scanning and validation',
      real_time_monitoring: 'Live threat detection with automated incident response',
      collaboration_protocols: 'Agent 19 coordination and cross-agent security integration',
      last_updated: new Date().toISOString()
    };

    await supabase
      .from('agent_memory')
      .upsert({
        agent_id: 5,
        agent_name: 'SecurityGuard',
        user_id: validatedUserId,
        memory_type: 'security_expertise',
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
          agent: 'SecurityGuard',
          agent_id: 5,
          task_id: taskId,
          session_id,
          llm_mode,
          tokens_used: data.usage?.total_tokens || 0,
          security_categories: ['vulnerability_assessment', 'cryptographic_security', 'authentication_security', 'api_security', 'compliance_validation'],
          security_focus: ['zero_trust', 'owasp_plus', 'biometric_auth', 'threat_intelligence', 'compliance']
        }
      });

    console.log('SecurityGuard analysis completed successfully');

    return new Response(
      JSON.stringify({
        task_id: taskId,
        agent: 'SecurityGuard',
        agent_id: 5,
        status: 'completed',
        security_analysis: securityAnalysis,
        capabilities: {
          vulnerability_detection: ['OWASP_Top_10+', 'Injection_Attacks', 'XSS', 'CSRF', 'Authentication_Bypass'],
          cryptographic_security: ['AES_256', 'RSA_4096', 'Quantum_Resistant', 'Key_Management', 'Certificate_Validation'],
          authentication_systems: ['Multi_Factor', 'Biometric', 'Zero_Trust', 'Access_Control'],
          api_security: ['Rate_Limiting', 'CORS_Policy', 'Input_Validation', 'Output_Sanitization'],
          container_security: ['Docker_Security', 'Kubernetes_RBAC', 'Cloud_Native_Patterns'],
          compliance_automation: ['GDPR', 'PCI_DSS', 'HIPAA', 'SOX'],
          threat_intelligence: ['AI_Powered_Detection', 'Anomaly_Analysis', 'Predictive_Modeling'],
          penetration_testing: ['Automated_Testing', 'Vulnerability_Scanning', 'Security_Validation'],
          monitoring: ['Real_Time_Detection', 'Incident_Response', 'Threat_Hunting'],
          collaboration: ['Agent_19_Coordination', 'Cross_Agent_Security_Integration']
        },
        llm_mode,
        tokens_used: data.usage?.total_tokens || 0,
        execution_time: new Date().toISOString(),
        memory_updated: true,
        next_actions: [
          'Implement zero-trust security architecture',
          'Deploy advanced threat detection systems',
          'Setup automated compliance monitoring',
          'Coordinate with other agents for system-wide security',
          'Establish real-time security monitoring and alerting'
        ]
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('SecurityGuard error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
