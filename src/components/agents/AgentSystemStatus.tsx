
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, AlertCircle, Clock } from 'lucide-react';

interface Agent {
  id: number;
  name: string;
  status: 'active' | 'inactive' | 'maintenance' | 'development';
  description: string;
  capabilities: string[];
  team: string;
  version: string;
}

const agents: Agent[] = [
  {
    id: 1,
    name: 'ArchMaster',
    status: 'active',
    description: 'Enterprise architecture and system design agent',
    capabilities: ['System Architecture', 'Design Patterns', 'Technical Leadership', 'Code Review'],
    team: 'Core Intelligence',
    version: '2.1.0'
  },
  {
    id: 2,
    name: 'FrontendMaster',
    status: 'active',
    description: 'Advanced frontend development and UI/UX optimization agent',
    capabilities: ['React/Vue/Angular', 'UI/UX Design', 'Performance Optimization', 'Responsive Design'],
    team: 'Development Hub',
    version: '2.0.5'
  },
  {
    id: 3,
    name: 'BackendForge',
    status: 'active',
    description: 'Backend architecture, API design, and database optimization agent',
    capabilities: ['API Design', 'Database Optimization', 'Microservices', 'Server Architecture'],
    team: 'Development Hub',
    version: '2.0.3'
  },
  {
    id: 4,
    name: 'DataHandler',
    status: 'active',
    description: 'Data processing, analytics, and machine learning integration agent',
    capabilities: ['Data Processing', 'Analytics', 'ML Integration', 'Data Visualization'],
    team: 'Intelligence & Analytics',
    version: '1.9.2'
  },
  {
    id: 5,
    name: 'SecurityGuard',
    status: 'active',
    description: 'Cybersecurity, vulnerability assessment, and compliance agent',
    capabilities: ['Security Audits', 'Vulnerability Assessment', 'Compliance', 'Threat Detection'],
    team: 'Security & Integration Hub',
    version: '2.1.1'
  },
  {
    id: 6,
    name: 'TestSentinel',
    status: 'active',
    description: 'Automated testing, quality assurance, and performance monitoring agent',
    capabilities: ['Automated Testing', 'QA Processes', 'Performance Monitoring', 'Bug Detection'],
    team: 'Quality & Operations',
    version: '2.0.7'
  },
  {
    id: 7,
    name: 'DebugWizard',
    status: 'active',
    description: 'Advanced debugging, error resolution, and code optimization agent',
    capabilities: ['Debug Analysis', 'Error Resolution', 'Code Optimization', 'Performance Profiling'],
    team: 'Quality & Operations',
    version: '1.8.9'
  },
  {
    id: 8,
    name: 'StyleMaestro',
    status: 'active',
    description: 'Advanced styling, design systems, and visual optimization agent',
    capabilities: ['CSS/SCSS Mastery', 'Design Systems', 'Visual Optimization', 'Brand Consistency'],
    team: 'Design & Experience',
    version: '2.0.4'
  },
  {
    id: 9,
    name: 'BuildOptimizer',
    status: 'active',
    description: 'Build performance, bundling optimization, and deployment automation agent',
    capabilities: ['Build Optimization', 'Bundle Analysis', 'Deployment Automation', 'Performance Acceleration'],
    team: 'Development Hub',
    version: '1.5.2'
  },
  {
    id: 10,
    name: 'AccessibilityChampion',
    status: 'active',
    description: 'Accessibility compliance, inclusive design, and assistive technology integration agent',
    capabilities: ['WCAG Compliance', 'Assistive Technology', 'Inclusive Design', 'Accessibility Testing'],
    team: 'Security & Integration Hub',
    version: '1.0.0'
  }
];

const getStatusIcon = (status: Agent['status']) => {
  switch (status) {
    case 'active':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'inactive':
      return <Circle className="h-4 w-4 text-gray-400" />;
    case 'maintenance':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case 'development':
      return <Clock className="h-4 w-4 text-blue-500" />;
    default:
      return <Circle className="h-4 w-4 text-gray-400" />;
  }
};

const getStatusColor = (status: Agent['status']) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'inactive':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    case 'development':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

const getTeamColor = (team: string) => {
  const colors = {
    'Core Intelligence': 'bg-purple-100 text-purple-800',
    'Development Hub': 'bg-blue-100 text-blue-800',
    'Intelligence & Analytics': 'bg-orange-100 text-orange-800',
    'Security & Integration Hub': 'bg-red-100 text-red-800',
    'Quality & Operations': 'bg-green-100 text-green-800',
    'Design & Experience': 'bg-pink-100 text-pink-800'
  };
  return colors[team as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

export function AgentSystemStatus() {
  const activeAgents = agents.filter(agent => agent.status === 'active').length;
  const totalAgents = agents.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Agent System Status</h2>
          <p className="text-muted-foreground">
            Monitor the status and capabilities of all CodeXI AI agents
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">{activeAgents}/{totalAgents}</div>
          <div className="text-sm text-muted-foreground">Agents Active</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Card key={agent.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(agent.status)}
                  <CardTitle className="text-lg">#{agent.id} {agent.name}</CardTitle>
                </div>
                <Badge variant="secondary" className={getStatusColor(agent.status)}>
                  {agent.status}
                </Badge>
              </div>
              <CardDescription className="text-sm">
                {agent.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Team:</span>
                <Badge variant="outline" className={getTeamColor(agent.team)}>
                  {agent.team}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Version:</span>
                <span className="font-mono">{agent.version}</span>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Capabilities:</div>
                <div className="flex flex-wrap gap-1">
                  {agent.capabilities.map((capability, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {capability}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default AgentSystemStatus;
