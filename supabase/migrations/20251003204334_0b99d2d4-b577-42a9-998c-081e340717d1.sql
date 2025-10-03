-- Enhanced Notes Platform Database Schema
-- This migration adds comprehensive tables for the Notes platform

-- 1. Notebooks for organization
CREATE TABLE IF NOT EXISTS public.notebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'shared', 'public')),
  sort_order INTEGER DEFAULT 0,
  archived_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Enhance notes table with content_blocks for rich editing
ALTER TABLE public.notes 
ADD COLUMN IF NOT EXISTS notebook_id UUID REFERENCES public.notebooks(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS content_blocks JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'locked')),
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS published_slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS cover_url TEXT,
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- 3. Note links for backlinks and relationships
CREATE TABLE IF NOT EXISTS public.note_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  to_note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'backlink' CHECK (type IN ('backlink', 'related', 'prerequisite')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(from_note_id, to_note_id, type)
);

-- 4. Note assets for media files
CREATE TABLE IF NOT EXISTS public.note_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'file', 'audio', 'pdf', 'sketch', 'video')),
  file_path TEXT NOT NULL,
  file_name TEXT,
  file_size BIGINT,
  mime_type TEXT,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Comments for collaboration
CREATE TABLE IF NOT EXISTS public.note_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  block_ref TEXT, -- Reference to specific block in note
  content TEXT NOT NULL,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Note sharing
CREATE TABLE IF NOT EXISTS public.note_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'commenter', 'editor')),
  expires_at TIMESTAMP WITH TIME ZONE,
  password_hash TEXT,
  link_token TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Public pages for publishing
CREATE TABLE IF NOT EXISTS public.public_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  enabled BOOLEAN DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. Tags management
CREATE TABLE IF NOT EXISTS public.note_tags_lookup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#64748b',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.note_tag_associations (
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.note_tags_lookup(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

-- 9. Tasks integration
CREATE TABLE IF NOT EXISTS public.note_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  block_ref TEXT, -- Reference to task block in note
  title TEXT NOT NULL,
  due_at TIMESTAMP WITH TIME ZONE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled')),
  assignee_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 10. AI features
CREATE TABLE IF NOT EXISTS public.ai_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('summary', 'flashcards', 'quiz', 'outline', 'extract_key_points')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  result JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 11. Flashcards and spaced repetition
CREATE TABLE IF NOT EXISTS public.flashcard_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  note_id UUID REFERENCES public.notes(id) ON DELETE SET NULL,
  shared TEXT DEFAULT 'private' CHECK (shared IN ('private', 'public')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
  note_id UUID REFERENCES public.notes(id) ON DELETE SET NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  cloze JSONB DEFAULT '{}'::jsonb,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.flashcard_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ease FLOAT DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  due_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_review_at TIMESTAMP WITH TIME ZONE,
  algorithm_state JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 12. Version history
CREATE TABLE IF NOT EXISTS public.note_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  content_blocks JSONB DEFAULT '[]'::jsonb,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  change_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 13. Activity log
CREATE TABLE IF NOT EXISTS public.note_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID NOT NULL,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 14. Embeddings for semantic search
CREATE TABLE IF NOT EXISTS public.note_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  vector FLOAT[] -- Will use pgvector extension if available
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notebooks_owner_id ON public.notebooks(owner_id);
CREATE INDEX IF NOT EXISTS idx_notes_notebook_id ON public.notes(notebook_id);
CREATE INDEX IF NOT EXISTS idx_notes_status ON public.notes(status);
CREATE INDEX IF NOT EXISTS idx_notes_published_slug ON public.notes(published_slug) WHERE published_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_note_links_from_note ON public.note_links(from_note_id);
CREATE INDEX IF NOT EXISTS idx_note_links_to_note ON public.note_links(to_note_id);
CREATE INDEX IF NOT EXISTS idx_note_assets_note_id ON public.note_assets(note_id);
CREATE INDEX IF NOT EXISTS idx_note_comments_note_id ON public.note_comments(note_id);
CREATE INDEX IF NOT EXISTS idx_note_shares_note_id ON public.note_shares(note_id);
CREATE INDEX IF NOT EXISTS idx_note_shares_token ON public.note_shares(link_token);
CREATE INDEX IF NOT EXISTS idx_flashcards_deck_id ON public.flashcards(deck_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_user_due ON public.flashcard_reviews(user_id, due_at);
CREATE INDEX IF NOT EXISTS idx_note_embeddings_note_id ON public.note_embeddings(note_id);

-- Full-text search index on notes content
CREATE INDEX IF NOT EXISTS idx_notes_content_fts ON public.notes USING gin(to_tsvector('english', title || ' ' || COALESCE(content, '')));

-- Enable Row Level Security
ALTER TABLE public.notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_tags_lookup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_tag_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notebooks
CREATE POLICY "Users can create their own notebooks" ON public.notebooks
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can view their own notebooks" ON public.notebooks
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can update their own notebooks" ON public.notebooks
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own notebooks" ON public.notebooks
  FOR DELETE USING (auth.uid() = owner_id);

-- Enhanced RLS policies for notes (considering sharing)
DROP POLICY IF EXISTS "Users can view their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can create their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;

CREATE POLICY "Notes access policy" ON public.notes
  FOR ALL USING (
    auth.uid() = user_id OR -- Owner access
    EXISTS ( -- Shared access
      SELECT 1 FROM public.note_shares ns 
      WHERE ns.note_id = notes.id 
      AND (ns.target_user_id = auth.uid() OR ns.link_token IS NOT NULL)
      AND (ns.expires_at IS NULL OR ns.expires_at > now())
    ) OR
    (is_public = true AND status = 'published') -- Public access
  );

-- RLS policies for other tables
CREATE POLICY "Note links follow note access" ON public.note_links
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.notes WHERE id = from_note_id AND (auth.uid() = user_id OR is_public = true))
  );

CREATE POLICY "Note assets follow note access" ON public.note_assets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.notes WHERE id = note_id AND (auth.uid() = user_id OR is_public = true))
  );

CREATE POLICY "Note comments follow note access" ON public.note_comments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.notes WHERE id = note_id AND (auth.uid() = user_id OR is_public = true))
  );

-- Note shares policies
CREATE POLICY "Users can manage shares for their notes" ON public.note_shares
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.notes WHERE id = note_id AND auth.uid() = user_id)
  );

-- Tags policies
CREATE POLICY "Users can manage tags" ON public.note_tags_lookup
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Tag associations follow note access" ON public.note_tag_associations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.notes WHERE id = note_id AND auth.uid() = user_id)
  );

-- Flashcards policies
CREATE POLICY "Users can manage their flashcard decks" ON public.flashcard_decks
  FOR ALL USING (auth.uid() = owner_id OR shared = 'public');

CREATE POLICY "Flashcards follow deck access" ON public.flashcards
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.flashcard_decks WHERE id = deck_id AND (auth.uid() = owner_id OR shared = 'public'))
  );

CREATE POLICY "Users can manage their flashcard reviews" ON public.flashcard_reviews
  FOR ALL USING (auth.uid() = user_id);

-- Other policies
CREATE POLICY "Users can access AI jobs for their notes" ON public.ai_jobs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.notes WHERE id = note_id AND auth.uid() = user_id)
  );

CREATE POLICY "Users can access versions for their notes" ON public.note_versions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.notes WHERE id = note_id AND auth.uid() = user_id)
  );

CREATE POLICY "Users can view activity logs" ON public.note_activity_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can access embeddings for accessible notes" ON public.note_embeddings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.notes WHERE id = note_id AND (auth.uid() = user_id OR is_public = true))
  );

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;   
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_notebooks_updated_at BEFORE UPDATE ON public.notebooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_note_comments_updated_at BEFORE UPDATE ON public.note_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_note_tasks_updated_at BEFORE UPDATE ON public.note_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create backlinks automatically
CREATE OR REPLACE FUNCTION create_note_backlinks()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract [[Note Title]] patterns and create backlinks
  -- This is a simplified version - in production you'd want more sophisticated parsing
  INSERT INTO public.note_links (from_note_id, to_note_id, type)
  SELECT NEW.id, n.id, 'backlink'
  FROM public.notes n
  WHERE n.title = ANY(
    string_to_array(
      regexp_replace(NEW.content, '\[\[([^\]]+)\]\]', '\1', 'g'),
      '|'
    )
  )
  AND n.id != NEW.id
  ON CONFLICT (from_note_id, to_note_id, type) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;