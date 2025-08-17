
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bot, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

const AgentSystemStatus = () => {
  const { data: agentRegistry, isLoading, error } = useQuery({
    queryKey: ['agent-registry-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_registry')
        .select('*')
        .order('agent_number');

      if (error) {
        console.error('Database error:', error);
        throw new Error(error.message);
      }

      return data || [];
    },
    retry: 2,
    retryDelay: 1000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Agent System Status
          </CardTitle>
          <CardDescription>Loading agent system status...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Agent System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Agent Status</h3>
            <p className="text-muted-foreground">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalAgents = agentRegistry.length;
  const activeAgents = agentRegistry.filter(agent => agent.is_active).length;
  const builtAgents = agentRegistry.filter(agent => agent.is_built).length;
  const inactiveAgents = totalAgents - activeAgents;

  // Group agents by team
  const agentsByTeam = agentRegistry.reduce((acc: Record<string, any[]>, agent) => {
    const teamKey = `${agent.team_number}: ${agent.team_name}`;
    if (!acc[teamKey]) {
      acc[teamKey] = [];
    }
    acc[teamKey].push(agent);
    return acc;
  }, {});

  const getStatusIcon = (agent: any) => {
    if (agent.is_active && agent.is_built) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (agent.is_built && !agent.is_active) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (agent: any) => {
    if (agent.is_active && agent.is_built) {
      return <Badge variant="default">Active</Badge>;
    } else if (agent.is_built && !agent.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    } else {
      return <Badge variant="destructive">Not Built</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Agent System Status
          </CardTitle>
          <CardDescription>
            Current status of all AI agents in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalAgents}</div>
              <div className="text-sm text-muted-foreground">Total Agents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{activeAgents}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{builtAgents}</div>
              <div className="text-sm text-muted-foreground">Built</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{inactiveAgents}</div>
              <div className="text-sm text-muted-foreground">Inactive</div>
            </div>
          </div>

          {totalAgents === 0 ? (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Agents Registered</h3>
              <p className="text-muted-foreground">
                No agents are currently registered in the system.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(agentsByTeam).map(([teamName, teamAgents]) => (
                <div key={teamName}>
                  <h3 className="text-lg font-semibold mb-3">{teamName}</h3>
                  <div className="grid gap-3">
                    {teamAgents.map((agent) => (
                      <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(agent)}
                          <div>
                            <div className="font-medium">
                              Agent #{agent.agent_number} - {agent.agent_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {agent.basic_role}
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(agent)}
                      </div>
                    ))}
                  </div>
                  {Object.keys(agentsByTeam).indexOf(teamName) < Object.keys(agentsByTeam).length - 1 && (
                    <Separator className="mt-6" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentSystemStatus;
