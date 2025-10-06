-- Add templates table
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  preview_url TEXT,
  content_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_public BOOLEAN DEFAULT false,
  category TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on templates
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Templates RLS policies
CREATE POLICY "Users can view public templates or their own"
ON public.templates FOR SELECT
USING (is_public = true OR owner_id = auth.uid());

CREATE POLICY "Users can create their own templates"
ON public.templates FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own templates"
ON public.templates FOR UPDATE
USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own templates"
ON public.templates FOR DELETE
USING (owner_id = auth.uid());

-- Add parent_id to note_comments for threading
ALTER TABLE public.note_comments ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.note_comments(id) ON DELETE CASCADE;

-- Create comment_reactions table
CREATE TABLE IF NOT EXISTS public.comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.note_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'heart', 'fire', 'thumbsup')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id, reaction_type)
);

-- Enable RLS on comment_reactions
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;

-- Comment reactions RLS policies
CREATE POLICY "Users can view all reactions"
ON public.comment_reactions FOR SELECT
USING (true);

CREATE POLICY "Users can add reactions"
ON public.comment_reactions FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove their reactions"
ON public.comment_reactions FOR DELETE
USING (user_id = auth.uid());

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_templates_owner ON public.templates(owner_id);
CREATE INDEX IF NOT EXISTS idx_templates_public ON public.templates(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_note_comments_parent ON public.note_comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON public.comment_reactions(comment_id);

-- Trigger for templates updated_at
CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Realtime for collaboration
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.note_comments;

-- Add replica identity full for real-time updates
ALTER TABLE public.notes REPLICA IDENTITY FULL;
ALTER TABLE public.note_comments REPLICA IDENTITY FULL;