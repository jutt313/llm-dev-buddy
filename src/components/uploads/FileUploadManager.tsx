
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, File, Image, Code, Github, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FileUploadManager = () => {
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userFiles, isLoading } = useQuery({
    queryKey: ['user-files'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_files')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: async ({ file, fileType }: { file: File; fileType: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const bucketName = fileType === 'screenshot' ? 'screenshots' : 
                        fileType === 'codebase' ? 'codebase-files' : 'user-uploads';

      // Upload to storage with progress tracking
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save metadata to database
      const { data: fileRecord, error: dbError } = await supabase
        .from('user_files')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          mime_type: file.type,
          bucket_name: bucketName,
          file_type: fileType,
          metadata: {
            original_name: file.name,
            upload_timestamp: new Date().toISOString(),
            file_extension: fileExt
          }
        })
        .select()
        .single();

      if (dbError) throw dbError;
      return fileRecord;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-files'] });
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[data.file_name];
        return newProgress;
      });
      toast({
        title: "File uploaded successfully",
        description: "Your file has been uploaded and is ready for agent processing.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const file = userFiles?.find(f => f.id === fileId);
      if (!file) throw new Error('File not found');

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(file.bucket_name)
        .remove([file.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('user_files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-files'] });
      toast({
        title: "File deleted",
        description: "File has been removed successfully.",
      });
    },
  });

  const handleFileUpload = (files: FileList | null, fileType: string) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      // Simulate progress for UI feedback
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
      
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev[file.name] || 0;
          if (currentProgress >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return { ...prev, [file.name]: currentProgress + 10 };
        });
      }, 200);

      uploadFileMutation.mutate({ file, fileType });
    });
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'screenshot': return <Image className="h-4 w-4" />;
      case 'codebase': return <Code className="h-4 w-4" />;
      case 'github': return <Github className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            File Upload Manager
          </CardTitle>
          <CardDescription>
            Upload files, screenshots, and codebase for agent analysis and processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium mb-2">General Files</p>
              <Input
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e.target.files, 'upload')}
                className="cursor-pointer"
                accept=".pdf,.txt,.json,.js,.ts,.html,.css,.md,.zip"
              />
            </div>

            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Image className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium mb-2">Screenshots</p>
              <Input
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e.target.files, 'screenshot')}
                className="cursor-pointer"
                accept="image/*"
              />
            </div>

            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Code className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium mb-2">Codebase</p>
              <Input
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e.target.files, 'codebase')}
                className="cursor-pointer"
                accept=".js,.ts,.jsx,.tsx,.html,.css,.json,.md,.txt,.py,.java,.cpp,.c,.php,.rb,.go,.rs"
              />
            </div>
          </div>

          {Object.keys(uploadProgress).length > 0 && (
            <div className="space-y-2 mb-6">
              <h4 className="text-sm font-medium">Upload Progress</h4>
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                <div key={fileName} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{fileName}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Files ({userFiles?.length || 0})</CardTitle>
          <CardDescription>
            Files available for agent processing and analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading files...</p>
          ) : userFiles?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No files uploaded yet</p>
          ) : (
            <div className="space-y-2">
              {userFiles?.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.file_type)}
                    <div>
                      <p className="font-medium text-sm">{file.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={file.processed ? "default" : "secondary"}>
                      {file.processing_status}
                    </Badge>
                    <Badge variant="outline">{file.file_type}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFileMutation.mutate(file.id)}
                      disabled={deleteFileMutation.isPending}
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

export default FileUploadManager;
