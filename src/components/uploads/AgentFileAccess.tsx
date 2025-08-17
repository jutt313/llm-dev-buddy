
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, File, Eye, Search, Wrench } from 'lucide-react';

const AgentFileAccess = () => {
  const { data: fileAccess, isLoading } = useQuery({
    queryKey: ['agent-file-access'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_file_access')
        .select(`
          *,
          user_files (
            file_name,
            file_type,
            mime_type,
            file_size
          )
        `)
        .order('accessed_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: agentRegistry } = useQuery({
    queryKey: ['agent-registry'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_registry')
        .select('agent_number, agent_name')
        .order('agent_number');
      
      if (error) throw error;
      return data || [];
    },
  });

  const getAgentName = (agentId: number) => {
    return agentRegistry?.find(agent => agent.agent_number === agentId)?.agent_name || `Agent #${agentId}`;
  };

  const getAccessIcon = (accessType: string) => {
    switch (accessType) {
      case 'read': return <Eye className="h-4 w-4" />;
      case 'analyze': return <Search className="h-4 w-4" />;
      case 'process': return <Wrench className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  const getAccessColor = (accessType: string) => {
    switch (accessType) {
      case 'read': return 'secondary';
      case 'analyze': return 'default';
      case 'process': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Agent File Access Log
        </CardTitle>
        <CardDescription>
          Track which agents have accessed your uploaded files
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Loading access log...</p>
        ) : fileAccess?.length === 0 ? (
          <div className="text-center py-8">
            <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No File Access Yet</h3>
            <p className="text-muted-foreground">
              Upload files and interact with agents to see access logs here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {fileAccess?.map((access) => (
              <div key={access.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Bot className="h-5 w-5 text-primary" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{getAgentName(access.agent_id)}</p>
                      <Badge variant={getAccessColor(access.access_type)} className="flex items-center gap-1">
                        {getAccessIcon(access.access_type)}
                        {access.access_type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Accessed: {access.user_files?.file_name} • 
                      {new Date(access.accessed_at).toLocaleString()}
                    </p>
                    {access.session_id && (
                      <p className="text-xs text-muted-foreground">
                        Session: {access.session_id.substring(0, 8)}...
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant="outline">
                  {access.user_files?.file_type}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentFileAccess;
