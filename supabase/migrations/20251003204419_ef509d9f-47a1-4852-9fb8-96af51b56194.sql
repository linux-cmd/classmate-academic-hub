-- Fix security warnings from previous migration

-- Fix search_path for functions that were missing it
DROP FUNCTION IF EXISTS create_note_backlinks();

CREATE OR REPLACE FUNCTION create_note_backlinks()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Extract [[Note Title]] patterns and create backlinks
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
$$;

-- Ensure the function has proper search_path
ALTER FUNCTION update_updated_at_column() SET search_path = public;

-- Add missing RLS policy for public_pages
CREATE POLICY "Public pages are viewable by everyone" ON public.public_pages
  FOR SELECT USING (enabled = true);

-- Add missing RLS policy for note_tasks  
CREATE POLICY "Users can view tasks for their notes" ON public.note_tasks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.notes WHERE id = note_id AND auth.uid() = user_id)
  );

CREATE POLICY "Users can create tasks for their notes" ON public.note_tasks
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.notes WHERE id = note_id AND auth.uid() = user_id)
  );

CREATE POLICY "Users can update tasks for their notes" ON public.note_tasks
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.notes WHERE id = note_id AND auth.uid() = user_id)
  );

CREATE POLICY "Users can delete tasks for their notes" ON public.note_tasks
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.notes WHERE id = note_id AND auth.uid() = user_id)
  );