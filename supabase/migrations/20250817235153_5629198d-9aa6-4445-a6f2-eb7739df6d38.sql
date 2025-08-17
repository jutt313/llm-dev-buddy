
-- Create storage buckets for user uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('user-uploads', 'user-uploads', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'text/plain', 'application/json', 'application/javascript', 'text/html', 'text/css', 'application/zip', 'application/pdf']),
  ('screenshots', 'screenshots', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('codebase-files', 'codebase-files', false, 104857600, ARRAY['text/plain', 'application/json', 'application/javascript', 'text/html', 'text/css', 'application/zip', 'text/markdown']);

-- Create file metadata table
CREATE TABLE public.user_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  bucket_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('upload', 'screenshot', 'codebase', 'github')),
  metadata JSONB DEFAULT '{}',
  processed BOOLEAN DEFAULT false,
  processing_status TEXT DEFAULT 'pending',
  processing_results JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent file access table
CREATE TABLE public.agent_file_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id INTEGER NOT NULL,
  user_id UUID NOT NULL,
  file_id UUID NOT NULL REFERENCES public.user_files(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL CHECK (access_type IN ('read', 'analyze', 'process')),
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  access_context JSONB DEFAULT '{}',
  session_id UUID
);

-- Create GitHub repository integration table
CREATE TABLE public.github_repositories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  repo_name TEXT NOT NULL,
  repo_url TEXT NOT NULL,
  branch TEXT DEFAULT 'main',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'pending',
  file_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_file_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_repositories ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_files
CREATE POLICY "Users can manage their own files" ON public.user_files
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for agent_file_access
CREATE POLICY "Users can view their own agent file access" ON public.agent_file_access
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for github_repositories
CREATE POLICY "Users can manage their own GitHub repos" ON public.github_repositories
  FOR ALL USING (auth.uid() = user_id);

-- Storage RLS policies
CREATE POLICY "Users can upload their own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('user-uploads', 'screenshots', 'codebase-files') AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own files" ON storage.objects
  FOR SELECT USING (
    bucket_id IN ('user-uploads', 'screenshots', 'codebase-files') AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own files" ON storage.objects
  FOR UPDATE USING (
    bucket_id IN ('user-uploads', 'screenshots', 'codebase-files') AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (
    bucket_id IN ('user-uploads', 'screenshots', 'codebase-files') AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Update agent_memory table to include file references
ALTER TABLE public.agent_memory 
ADD COLUMN IF NOT EXISTS file_references UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS file_context JSONB DEFAULT '{}';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_files_user_id ON public.user_files(user_id);
CREATE INDEX IF NOT EXISTS idx_user_files_file_type ON public.user_files(file_type);
CREATE INDEX IF NOT EXISTS idx_agent_file_access_agent_user ON public.agent_file_access(agent_id, user_id);
CREATE INDEX IF NOT EXISTS idx_github_repositories_user_id ON public.github_repositories(user_id);
