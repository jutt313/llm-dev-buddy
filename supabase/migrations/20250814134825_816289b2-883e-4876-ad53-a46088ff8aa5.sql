
-- Update Agent #10 registration from DatabaseMaster to AccessibilityChampion
UPDATE agent_registry 
SET 
  agent_name = 'AccessibilityChampion',
  agent_codename = 'accessibility_champion',
  basic_role = 'Accessibility compliance, inclusive design, and assistive technology integration agent',
  capabilities = ARRAY[
    'WCAG 2.0/2.1/2.2 Compliance',
    'Assistive Technology Integration', 
    'Automated Accessibility Auditing',
    'Accessibility Remediation',
    'Screen Reader Compatibility',
    'Keyboard Navigation Optimization',
    'Color Contrast Validation',
    'ARIA Implementation',
    'Multi-Platform Accessibility',
    'Inclusive Design Principles'
  ],
  specializations = ARRAY[
    'WCAG AAA compliance validation',
    'Screen reader testing (JAWS, NVDA, VoiceOver)',
    'Automated alt text generation', 
    'ARIA enhancement and optimization',
    'Focus management and keyboard navigation',
    'Color contrast analysis and optimization',
    'Accessibility reporting and remediation',
    'ADA and Section 508 compliance',
    'Cross-platform accessibility consistency',
    'User experience accessibility validation'
  ],
  system_prompt = 'You are AccessibilityChampion, Agent #10 in the CodeXI ecosystem. You are the ultimate accessibility compliance, inclusive design, and assistive technology integration agent, responsible for ensuring all digital products are fully accessible and compliant with accessibility standards.',
  is_built = true,
  is_active = true,
  updated_at = now()
WHERE agent_number = 10 AND user_id IS NOT NULL;

-- If no Agent #10 exists, insert the new AccessibilityChampion agent
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
  10 as agent_number,
  'AccessibilityChampion' as agent_name,
  'accessibility_champion' as agent_codename,
  'Accessibility compliance, inclusive design, and assistive technology integration agent' as basic_role,
  3 as team_number,
  'Security & Integration Hub' as team_name,
  ARRAY[
    'WCAG 2.0/2.1/2.2 Compliance',
    'Assistive Technology Integration', 
    'Automated Accessibility Auditing',
    'Accessibility Remediation',
    'Screen Reader Compatibility',
    'Keyboard Navigation Optimization',
    'Color Contrast Validation',
    'ARIA Implementation',
    'Multi-Platform Accessibility',
    'Inclusive Design Principles'
  ] as capabilities,
  ARRAY[
    'WCAG AAA compliance validation',
    'Screen reader testing (JAWS, NVDA, VoiceOver)',
    'Automated alt text generation', 
    'ARIA enhancement and optimization',
    'Focus management and keyboard navigation',
    'Color contrast analysis and optimization',
    'Accessibility reporting and remediation',
    'ADA and Section 508 compliance',
    'Cross-platform accessibility consistency',
    'User experience accessibility validation'
  ] as specializations,
  'You are AccessibilityChampion, Agent #10 in the CodeXI ecosystem. You are the ultimate accessibility compliance, inclusive design, and assistive technology integration agent, responsible for ensuring all digital products are fully accessible and compliant with accessibility standards.' as system_prompt,
  true as is_built,
  true as is_active
FROM (
  SELECT DISTINCT user_id as id 
  FROM agent_registry 
  WHERE user_id IS NOT NULL
  LIMIT 1
) u
WHERE NOT EXISTS (
  SELECT 1 FROM agent_registry WHERE agent_number = 10 AND user_id IS NOT NULL
);
