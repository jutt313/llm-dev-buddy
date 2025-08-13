
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Users, Activity, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ArchMasterManager = () => {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  const { data: agentRegistry, isLoading, error } = useQuery({
    queryKey: ['agent-registry', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('get-agent-registry', {
        body: { user_id: user.id }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to fetch agent registry');
      }

      if (!data) {
        console.log('No agent registry data found, returning empty array');
        return [];
      }

      console.log('Agent registry loaded successfully:', data);
      return data;
    },
    enabled: !!user?.id,
    retry: 2,
    retryDelay: 1000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            ArchMaster - Agent Registry Manager
          </CardTitle>
          <CardDescription>Loading agent registry...</CardDescription>
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
            ArchMaster - Agent Registry Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading agent registry: {error.message}
              <br />
              Please check your database connection and try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const totalAgents = agentRegistry?.length || 0;
  const builtAgents = agentRegistry?.filter((agent: any) => agent.is_built).length || 0;
  const activeAgents = agentRegistry?.filter((agent: any) => agent.is_active).length || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            ArchMaster - Agent Registry Manager
          </CardTitle>
          <CardDescription>
            Central hub for managing and monitoring all AI agents in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-bold">{totalAgents}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Activity className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Built Agents</p>
                <p className="text-2xl font-bold">{builtAgents}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Bot className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Agents</p>
                <p className="text-2xl font-bold">{activeAgents}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {totalAgents === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Agents Found</h3>
              <p className="text-muted-foreground">
                Your agent registry is empty. Ready to build Agent #19 (ValidationCore)?
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Agent Registry</CardTitle>
            <CardDescription>Overview of all registered agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agentRegistry?.map((agent: any) => (
                <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Agent #{agent.agent_number} - {agent.agent_name}</h4>
                      <p className="text-sm text-muted-foreground">{agent.basic_role}</p>
                      <p className="text-xs text-muted-foreground">Team {agent.team_number}: {agent.team_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={agent.is_built ? "default" : "secondary"}>
                      {agent.is_built ? "Built" : "Not Built"}
                    </Badge>
                    <Badge variant={agent.is_active ? "default" : "destructive"}>
                      {agent.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ArchMasterManager;
