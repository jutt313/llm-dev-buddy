
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploadManager, GitHubRepoManager, AgentFileAccess } from '@/components/uploads';

const FileManager = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">File Manager</h1>
        <p className="text-muted-foreground">
          Upload files, connect repositories, and manage agent access to your content
        </p>
      </div>

      <Tabs defaultValue="uploads" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="uploads">File Uploads</TabsTrigger>
          <TabsTrigger value="github">GitHub Repos</TabsTrigger>
          <TabsTrigger value="access">Agent Access</TabsTrigger>
        </TabsList>

        <TabsContent value="uploads">
          <FileUploadManager />
        </TabsContent>

        <TabsContent value="github">
          <GitHubRepoManager />
        </TabsContent>

        <TabsContent value="access">
          <AgentFileAccess />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FileManager;
