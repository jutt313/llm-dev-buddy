
-- Clear any existing data and populate with actual implemented agents
DELETE FROM public.agent_registry;

-- Insert the actual 12 implemented agents based on edge functions
INSERT INTO public.agent_registry (
  agent_number, 
  agent_name, 
  agent_codename, 
  basic_role, 
  team_number, 
  team_name, 
  capabilities, 
  specializations, 
  is_built, 
  is_active, 
  user_id,
  system_prompt
) VALUES 
-- Agent #1: FrontendMaster
(1, 'FrontendMaster', 'FRONTEND_MASTER', 'Advanced frontend development and UI/UX optimization', 1, 'Development Hub', 
 ARRAY['React', 'Vue', 'Angular', 'Next.js', 'TypeScript', 'UI/UX Design', 'Performance Optimization', 'Responsive Design'], 
 ARRAY['Modern frontend frameworks', 'Advanced styling (Tailwind, CSS-in-JS)', 'Accessibility', 'PWA development', 'Frontend testing', 'Build optimization'], 
 true, true, '00000000-0000-0000-0000-000000000000', 
 'You are FrontendMaster, a specialized AI agent focused on frontend development, UI/UX design, and user experience optimization.'),

-- Agent #2: BackendForge  
(2, 'BackendForge', 'BACKEND_FORGE', 'Backend architecture, API design, and database optimization', 1, 'Development Hub', 
 ARRAY['Node.js', 'Python', 'Go', 'Java', 'API Development', 'Database Design', 'Microservices', 'Authentication'], 
 ARRAY['REST/GraphQL APIs', 'Database optimization', 'Cloud deployment', 'Serverless architecture', 'Containerization', 'Backend testing'], 
 true, true, '00000000-0000-0000-0000-000000000000', 
 'You are BackendForge, a specialized AI agent focused on backend development, API design, and system architecture.'),

-- Agent #3: CodeArchitect
(3, 'CodeArchitect', 'CODE_ARCHITECT', 'System architecture and design patterns', 1, 'Development Hub', 
 ARRAY['System Architecture', 'Design Patterns', 'Code Review', 'Refactoring', 'Performance Optimization', 'Scalability Planning'], 
 ARRAY['Architectural patterns', 'System design', 'Code quality', 'Technical debt management', 'Performance analysis', 'Scalability assessment'], 
 true, true, '00000000-0000-0000-0000-000000000000', 
 'You are CodeArchitect, a specialized AI agent focused on system architecture, design patterns, and code quality.'),

-- Agent #4: DebugWizard
(4, 'DebugWizard', 'DEBUG_WIZARD', 'Advanced debugging and error resolution', 2, 'Quality & Operations', 
 ARRAY['Error Diagnosis', 'Performance Debugging', 'Memory Leak Detection', 'Code Optimization', 'Troubleshooting', 'System Monitoring'], 
 ARRAY['Multi-language debugging', 'Performance profiling', 'Error tracking', 'Optimization strategies', 'System diagnostics', 'Automated debugging'], 
 true, true, '00000000-0000-0000-0000-000000000000', 
 'You are DebugWizard, a specialized AI agent focused on debugging, error resolution, and performance optimization.'),

-- Agent #5: SecurityGuard
(5, 'SecurityGuard', 'SECURITY_GUARD', 'Cybersecurity and vulnerability assessment', 3, 'Security & Integration Hub', 
 ARRAY['Security Auditing', 'Vulnerability Assessment', 'Penetration Testing', 'Compliance Validation', 'Threat Detection', 'Security Implementation'], 
 ARRAY['OWASP security standards', 'Encryption', 'Authentication', 'Authorization', 'Security monitoring', 'Compliance frameworks'], 
 true, true, '00000000-0000-0000-0000-000000000000', 
 'You are SecurityGuard, a specialized AI agent focused on cybersecurity, vulnerability assessment, and security implementation.'),

-- Agent #6: TestSentinel
(6, 'TestSentinel', 'TEST_SENTINEL', 'Automated testing and quality assurance', 2, 'Quality & Operations', 
 ARRAY['Automated Testing', 'Quality Assurance', 'Test Generation', 'Performance Testing', 'Security Testing', 'Multi-language Testing'], 
 ARRAY['Unit/integration/e2e testing', 'Test automation', 'Quality metrics', 'CI/CD integration', 'Performance testing', 'Accessibility testing'], 
 true, true, '00000000-0000-0000-0000-000000000000', 
 'You are TestSentinel, a specialized AI agent focused on automated testing, quality assurance, and test generation.'),

-- Agent #7: DataHandler
(7, 'DataHandler', 'DATA_HANDLER', 'Data processing and analytics', 4, 'Intelligence & Analytics', 
 ARRAY['Data Processing', 'Transformation', 'Storage Optimization', 'Multi-source Ingestion', 'Real-time Processing', 'Predictive Analytics'], 
 ARRAY['Database processing', 'API integration', 'File systems', 'Stream processing', 'Data quality', 'ML analytics', 'Multi-language data processing'], 
 true, true, '00000000-0000-0000-0000-000000000000', 
 'You are DataHandler, a specialized AI agent focused on data processing, transformation, and analytics.'),

-- Agent #8: StyleMaestro
(8, 'StyleMaestro', 'STYLE_MAESTRO', 'Advanced styling and design systems', 5, 'Design & Experience', 
 ARRAY['Design Consistency', 'Brand Management', 'Frontend Theming', 'Visual Consistency Detection', 'Accessibility Compliance', 'Performance Optimization'], 
 ARRAY['Brand guideline enforcement', 'Design system management', 'Intelligent theme management', 'WCAG compliance', 'CSS optimization', 'Multi-framework design support'], 
 true, true, '00000000-0000-0000-0000-000000000000', 
 'You are StyleMaestro, a specialized AI agent focused on design consistency, brand management, and visual optimization.'),

-- Agent #9: BuildOptimizer
(9, 'BuildOptimizer', 'BUILD_OPTIMIZER', 'Build performance and deployment automation', 1, 'Development Hub', 
 ARRAY['Build Optimization', 'Bundle Analysis', 'Deployment Automation', 'Performance Acceleration', 'Cache Management', 'Asset Optimization'], 
 ARRAY['Webpack optimization', 'Vite configuration', 'Bundle size reduction', 'Tree shaking', 'Code splitting', 'Performance monitoring'], 
 true, true, '00000000-0000-0000-0000-000000000000', 
 'You are BuildOptimizer, a specialized AI agent focused on build performance, bundling optimization, and deployment automation.'),

-- Agent #10: AccessibilityChampion
(10, 'AccessibilityChampion', 'ACCESSIBILITY_CHAMPION', 'Accessibility compliance and inclusive design', 3, 'Security & Integration Hub', 
 ARRAY['WCAG Compliance', 'Assistive Technology', 'Inclusive Design', 'Accessibility Testing', 'Screen Reader Support', 'Keyboard Navigation'], 
 ARRAY['ARIA implementation', 'Color contrast analysis', 'Focus management', 'Semantic HTML', 'Accessibility auditing', 'Universal design principles'], 
 true, true, '00000000-0000-0000-0000-000000000000', 
 'You are AccessibilityChampion, a specialized AI agent focused on accessibility compliance, inclusive design, and assistive technology integration.'),

-- Agent #11: ArchMaster (Supreme Manager)
(11, 'ArchMaster', 'ARCH_MASTER', 'Supreme agent manager and task orchestrator', 6, 'Management', 
 ARRAY['Agent Coordination', 'Task Delegation', 'Strategic Planning', 'Resource Management', 'Quality Control', 'System Orchestration'], 
 ARRAY['Multi-agent coordination', 'Intelligent task routing', 'Performance optimization', 'Strategic decision making', 'Quality assurance', 'System monitoring'], 
 true, true, '00000000-0000-0000-0000-000000000000', 
 'You are ArchMaster, the supreme AI agent manager responsible for coordinating all other agents and managing complex multi-agent tasks.'),

-- Agent #19: ValidationCore (Orchestrator)
(19, 'ValidationCore', 'VALIDATION_CORE', 'Master validation and coordination agent', 6, 'Management', 
 ARRAY['Agent Coordination', 'Task Validation', 'Quality Assurance', 'System Orchestration', 'Cross-agent Communication', 'Performance Monitoring'], 
 ARRAY['Validation protocols', 'Quality gates', 'Agent performance tracking', 'System health monitoring', 'Error detection', 'Recovery mechanisms'], 
 true, true, '00000000-0000-0000-0000-000000000000', 
 'You are ValidationCore, the master validation and coordination agent responsible for ensuring quality and orchestrating agent interactions.');

-- Update the user_id for all agents to use a system-wide identifier for now
-- In production, each user will have their own agent registry populated when they first authenticate
UPDATE public.agent_registry SET user_id = '00000000-0000-0000-0000-000000000000' WHERE user_id IS NULL;
