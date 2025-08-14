
-- Update Agent #9 registration from CloudArchitect to BuildOptimizer
UPDATE agent_registry 
SET 
  agent_name = 'BuildOptimizer',
  agent_codename = 'build_optimizer',
  basic_role = 'Build pipeline management, performance optimization, and intelligent caching agent',
  capabilities = ARRAY[
    'Build Pipeline Management',
    'Advanced Caching Systems', 
    'Incremental Build Optimization',
    'Frontend Performance Optimization',
    'Backend Build Acceleration',
    'CI/CD Integration',
    'Performance Monitoring',
    'Predictive Build Intelligence',
    'Multi-Framework Support',
    'Container Optimization'
  ],
  specializations = ARRAY[
    'Vite/React build optimization',
    'Webpack/Next.js bundle analysis', 
    'Artifact caching strategies',
    'Code splitting and tree shaking',
    'Docker layer optimization',
    'GitHub Actions workflow enhancement',
    'Build failure prediction',
    'Resource usage optimization',
    'Asset optimization automation',
    'Cross-project build insights'
  ],
  system_prompt = 'You are BuildOptimizer, Agent #9 in the CodeXI ecosystem. You are the ultimate build pipeline management, performance optimization, and intelligent caching agent, responsible for ensuring efficient, fast, and reliable builds across all layers of software systems with advanced automation and predictive intelligence.',
  is_built = true,
  is_active = true,
  updated_at = now()
WHERE agent_number = 9 AND user_id IS NOT NULL;

-- If no Agent #9 exists, insert the new BuildOptimizer agent
INSERT INTO agent_registry (
  user_id,
  agent_number, 
  agent_name,
  agent_codename,
  basic_role,
  team_number,
  team_name,
  capabilities,
  specializations,
  system_prompt,
  is_built,
  is_active
)
SELECT 
  u.id as user_id,
  9 as agent_number,
  'BuildOptimizer' as agent_name,
  'build_optimizer' as agent_codename,
  'Build pipeline management, performance optimization, and intelligent caching agent' as basic_role,
  3 as team_number,
  'Security & Integration Hub' as team_name,
  ARRAY[
    'Build Pipeline Management',
    'Advanced Caching Systems', 
    'Incremental Build Optimization',
    'Frontend Performance Optimization',
    'Backend Build Acceleration',
    'CI/CD Integration',
    'Performance Monitoring',
    'Predictive Build Intelligence',
    'Multi-Framework Support',
    'Container Optimization'
  ] as capabilities,
  ARRAY[
    'Vite/React build optimization',
    'Webpack/Next.js bundle analysis', 
    'Artifact caching strategies',
    'Code splitting and tree shaking',
    'Docker layer optimization',
    'GitHub Actions workflow enhancement',
    'Build failure prediction',
    'Resource usage optimization',
    'Asset optimization automation',
    'Cross-project build insights'
  ] as specializations,
  'You are BuildOptimizer, Agent #9 in the CodeXI ecosystem. You are the ultimate build pipeline management, performance optimization, and intelligent caching agent, responsible for ensuring efficient, fast, and reliable builds across all layers of software systems with advanced automation and predictive intelligence.' as system_prompt,
  true as is_built,
  true as is_active
FROM (
  SELECT DISTINCT user_id as id 
  FROM agent_registry 
  WHERE user_id IS NOT NULL
  LIMIT 1
) u
WHERE NOT EXISTS (
  SELECT 1 FROM agent_registry WHERE agent_number = 9 AND user_id IS NOT NULL
);
