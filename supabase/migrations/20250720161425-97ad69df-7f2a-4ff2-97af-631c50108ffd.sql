-- Create notes table for Notion-like note taking
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Note',
  content TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_favorite BOOLEAN DEFAULT false,
  folder TEXT DEFAULT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Enable Row Level Security
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own notes" 
ON public.notes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes" 
ON public.notes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" 
ON public.notes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" 
ON public.notes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON public.notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_notes_user_id ON public.notes(user_id);
CREATE INDEX idx_notes_tags ON public.notes USING GIN(tags);
CREATE INDEX idx_notes_created_at ON public.notes(created_at DESC);