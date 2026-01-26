-- Create storage buckets for avatars, workspace icons, and project logos
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('workspace-icons', 'workspace-icons', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('project-logos', 'project-logos', true) ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for workspace-icons bucket
CREATE POLICY "Workspace icons are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'workspace-icons');

CREATE POLICY "Authenticated users can upload workspace icons"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'workspace-icons' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update workspace icons"
ON storage.objects FOR UPDATE
USING (bucket_id = 'workspace-icons' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete workspace icons"
ON storage.objects FOR DELETE
USING (bucket_id = 'workspace-icons' AND auth.role() = 'authenticated');

-- Storage policies for project-logos bucket
CREATE POLICY "Project logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-logos');

CREATE POLICY "Authenticated users can upload project logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'project-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update project logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'project-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete project logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'project-logos' AND auth.role() = 'authenticated');

-- Add icon_url column to workspaces table
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS icon_url TEXT;

-- Add logo_url column to projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS logo_url TEXT;