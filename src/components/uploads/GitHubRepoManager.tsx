
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Github, Plus, RefreshCw, Trash2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const GitHubRepoManager = () => {
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [newRepoBranch, setNewRepoBranch] = useState('main');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: repositories, isLoading } = useQuery({
    queryKey: ['github-repositories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('github_repositories')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const addRepoMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Extract repo name from URL
      const repoName = newRepoUrl.split('/').pop()?.replace('.git', '') || 'unknown';

      const { data, error } = await supabase
        .from('github_repositories')
        .insert({
          user_id: user.id,
          repo_name: repoName,
          repo_url: newRepoUrl,
          branch: newRepoBranch,
          sync_status: 'pending',
          metadata: {
            added_at: new Date().toISOString(),
            source: 'manual'
          }
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['github-repositories'] });
      setNewRepoUrl('');
      setNewRepoBranch('main');
      toast({
        title: "Repository added",
        description: "GitHub repository has been added for agent access.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add repository",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const syncRepoMutation = useMutation({
    mutationFn: async (repoId: string) => {
      const { data, error } = await supabase
        .from('github_repositories')
        .update({
          last_sync_at: new Date().toISOString(),
          sync_status: 'syncing'
        })
        .eq('id', repoId)
        .select()
        .single();

      if (error) throw error;
      
      // Here you would implement actual GitHub API integration
      // For now, we'll simulate a sync by updating status after delay
      setTimeout(async () => {
        await supabase
          .from('github_repositories')
          .update({ sync_status: 'synced', file_count: Math.floor(Math.random() * 100) + 10 })
          .eq('id', repoId);
        
        queryClient.invalidateQueries({ queryKey: ['github-repositories'] });
      }, 3000);

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Sync started",
        description: "Repository sync has been initiated.",
      });
    },
  });

  const deleteRepoMutation = useMutation({
    mutationFn: async (repoId: string) => {
      const { error } = await supabase
        .from('github_repositories')
        .delete()
        .eq('id', repoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['github-repositories'] });
      toast({
        title: "Repository removed",
        description: "Repository has been removed from agent access.",
      });
    },
  });

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'default';
      case 'syncing': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            GitHub Repository Manager
          </CardTitle>
          <CardDescription>
            Connect GitHub repositories for agent codebase analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="https://github.com/username/repository.git"
              value={newRepoUrl}
              onChange={(e) => setNewRepoUrl(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Branch (default: main)"
              value={newRepoBranch}
              onChange={(e) => setNewRepoBranch(e.target.value)}
              className="w-32"
            />
            <Button 
              onClick={() => addRepoMutation.mutate()}
              disabled={!newRepoUrl || addRepoMutation.isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connected Repositories ({repositories?.length || 0})</CardTitle>
          <CardDescription>
            Repositories available for agent analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading repositories...</p>
          ) : repositories?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No repositories connected yet</p>
          ) : (
            <div className="space-y-3">
              {repositories?.map((repo) => (
                <div key={repo.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Github className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{repo.repo_name}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(repo.repo_url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Branch: {repo.branch} • Files: {repo.file_count || 0} • 
                        {repo.last_sync_at ? ` Last synced: ${new Date(repo.last_sync_at).toLocaleDateString()}` : ' Never synced'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getSyncStatusColor(repo.sync_status)}>
                      {repo.sync_status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => syncRepoMutation.mutate(repo.id)}
                      disabled={syncRepoMutation.isPending || repo.sync_status === 'syncing'}
                    >
                      <RefreshCw className={`h-4 w-4 ${repo.sync_status === 'syncing' ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRepoMutation.mutate(repo.id)}
                      disabled={deleteRepoMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GitHubRepoManager;
