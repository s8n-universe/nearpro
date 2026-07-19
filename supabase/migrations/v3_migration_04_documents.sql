-- v3_migration_04_documents.sql
-- Documents library table for PDF and brochure attachments

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users manage own documents"
        ON documents FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);

-- Ensure documents storage bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents', 
    'documents', 
    true, 
    5242880, -- 5MB limit
    ARRAY['application/pdf'] -- Only PDF brochures allowed
)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['application/pdf'];

-- RLS policies for storage objects (bucket_id = 'documents')
-- 1. Public Read Access
DO $$ BEGIN
    CREATE POLICY "Allow public read access to documents"
        ON storage.objects FOR SELECT USING (bucket_id = 'documents');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Authenticated Insert (strictly in own user folder)
DO $$ BEGIN
    CREATE POLICY "Allow users to upload documents to own folder"
        ON storage.objects FOR INSERT WITH CHECK (
            bucket_id = 'documents' 
            AND auth.role() = 'authenticated'
            AND (storage.foldername(name))[1] = auth.uid()::text
        );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Authenticated Delete (strictly in own user folder)
DO $$ BEGIN
    CREATE POLICY "Allow users to delete own documents"
        ON storage.objects FOR DELETE USING (
            bucket_id = 'documents' 
            AND auth.role() = 'authenticated'
            AND (storage.foldername(name))[1] = auth.uid()::text
        );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
