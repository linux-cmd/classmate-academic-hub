import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { toast } from './use-toast';
import type { Block } from '@/components/notes/BlockEditor';

export interface Note {
  id: string;
  title: string;
  content: string;
  content_blocks: Block[];
  notebook_id: string | null;
  user_id: string;
  status: 'draft' | 'published' | 'archived' | 'locked';
  is_public: boolean;
  is_favorite: boolean;
  cover_url: string | null;
  created_at: string;
  updated_at: string;
  folder: string | null;
  tags: string[];
  version: number;
}

export interface Notebook {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  visibility: 'private' | 'shared' | 'public';
  created_at: string;
  updated_at: string;
}

export const useNotes = () => {
  const { user } = useSupabaseAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchNotebooks();
      fetchNotes();
    }
  }, [user]);

  const fetchNotebooks = async () => {
    try {
      const { data, error } = await supabase
        .from('notebooks')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotebooks((data || []) as Notebook[]);
    } catch (error) {
      console.error('Error fetching notebooks:', error);
      toast({
        title: "Error",
        description: "Failed to load notebooks",
        variant: "destructive"
      });
    }
  };

  const fetchNotes = async (notebookId?: string | null) => {
    try {
      let query = supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (notebookId) {
        query = query.eq('notebook_id', notebookId);
      } else if (notebookId === null) {
        query = query.is('notebook_id', null);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Ensure content_blocks is always an array
      const processedData = (data || []).map(note => ({
        ...note,
        content_blocks: Array.isArray(note.content_blocks) 
          ? (note.content_blocks as unknown as Block[])
          : [{ id: crypto.randomUUID(), type: 'paragraph' as const, content: note.content || '' }]
      })) as Note[];
      
      setNotes(processedData);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (title: string, notebookId?: string | null) => {
    if (!user) return;

    try {
      const initialBlock: Block = {
        id: crypto.randomUUID(),
        type: 'paragraph',
        content: ''
      };

      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title,
          content: '',
          content_blocks: [initialBlock] as any,
          notebook_id: notebookId || null,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      const processedNote = {
        ...data,
        content_blocks: Array.isArray(data.content_blocks)
          ? (data.content_blocks as unknown as Block[])
          : [initialBlock]
      } as Note;
      
      setNotes(prev => [processedNote, ...prev]);
      
      toast({
        title: "Success",
        description: "Note created"
      });

      return processedNote;
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive"
      });
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    try {
      // Extract blocks content to plain text for search
      if (updates.content_blocks) {
        const plainText = updates.content_blocks
          .map(block => block.content)
          .join('\n');
        updates.content = plainText;
      }

      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      // Cast content_blocks to any for database insertion
      if (updates.content_blocks) {
        updateData.content_blocks = updates.content_blocks as any;
      }
      
      const { error } = await supabase
        .from('notes')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setNotes(prev => prev.map(n => 
        n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString() } : n
      ));

      return true;
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotes(prev => prev.filter(n => n.id !== id));
      
      toast({
        title: "Success",
        description: "Note deleted"
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive"
      });
    }
  };

  const createNotebook = async (title: string, description?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notebooks')
        .insert({
          owner_id: user.id,
          title,
          description: description || null
        })
        .select()
        .single();

      if (error) throw error;

      setNotebooks(prev => [data as Notebook, ...prev]);
      
      toast({
        title: "Success",
        description: "Notebook created"
      });

      return data;
    } catch (error) {
      console.error('Error creating notebook:', error);
      toast({
        title: "Error",
        description: "Failed to create notebook",
        variant: "destructive"
      });
    }
  };

  const toggleFavorite = async (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    await updateNote(noteId, { is_favorite: !note.is_favorite });
  };

  const searchNotes = async (query: string) => {
    if (!query.trim()) {
      fetchNotes(selectedNotebook);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      const processedData = (data || []).map(note => ({
        ...note,
        content_blocks: Array.isArray(note.content_blocks) 
          ? (note.content_blocks as unknown as Block[])
          : [{ id: crypto.randomUUID(), type: 'paragraph' as const, content: note.content || '' }]
      })) as Note[];
      
      setNotes(processedData);
    } catch (error) {
      console.error('Error searching notes:', error);
      toast({
        title: "Error",
        description: "Search failed",
        variant: "destructive"
      });
    }
  };

  return {
    notes,
    notebooks,
    loading,
    selectedNotebook,
    setSelectedNotebook,
    createNote,
    updateNote,
    deleteNote,
    createNotebook,
    toggleFavorite,
    searchNotes,
    refreshNotes: () => fetchNotes(selectedNotebook)
  };
};
