import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { toast } from './use-toast';
import { Block } from '@/components/notes/BlockEditor';

export interface NoteVersion {
  id: string;
  note_id: string;
  version: number;
  title: string;
  content: string;
  content_blocks: Block[];
  changed_by: string;
  change_summary: string | null;
  created_at: string;
  author?: {
    display_name: string;
    avatar_url?: string;
  };
}

export const useVersionHistory = (noteId: string | null) => {
  const { user } = useSupabaseAuth();
  const [versions, setVersions] = useState<NoteVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (noteId) {
      fetchVersions();
    }
  }, [noteId]);

  const fetchVersions = async () => {
    if (!noteId) return;

    try {
      const { data, error } = await supabase
        .from('note_versions')
        .select(`
          *,
          author:profiles!note_versions_changed_by_fkey(display_name, avatar_url)
        `)
        .eq('note_id', noteId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedVersions = (data || []).map((v) => ({
        ...v,
        content_blocks: Array.isArray(v.content_blocks)
          ? (v.content_blocks as unknown as Block[])
          : [],
        author: Array.isArray(v.author) ? v.author[0] : v.author,
      })) as NoteVersion[];

      setVersions(processedVersions);
    } catch (error) {
      console.error('Error fetching versions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load version history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveVersion = async (summary?: string) => {
    if (!user || !noteId) return;

    try {
      // Get current note data
      const { data: note, error: fetchError } = await supabase
        .from('notes')
        .select('title, content, content_blocks, version')
        .eq('id', noteId)
        .single();

      if (fetchError) throw fetchError;

      const newVersion = (note.version || 1) + 1;

      // Create version
      const { error } = await supabase
        .from('note_versions')
        .insert({
          note_id: noteId,
          version: newVersion,
          title: note.title,
          content: note.content || '',
          content_blocks: note.content_blocks || [],
          changed_by: user.id,
          change_summary: summary || 'Manual save',
        });

      if (error) throw error;

      // Update note version number
      await supabase
        .from('notes')
        .update({ version: newVersion })
        .eq('id', noteId);

      toast({
        title: 'Success',
        description: 'Version saved',
      });

      fetchVersions();
    } catch (error) {
      console.error('Error saving version:', error);
      toast({
        title: 'Error',
        description: 'Failed to save version',
        variant: 'destructive',
      });
    }
  };

  const restoreVersion = async (versionId: string) => {
    if (!noteId) return;

    try {
      const version = versions.find((v) => v.id === versionId);
      if (!version) throw new Error('Version not found');

      const { error } = await supabase
        .from('notes')
        .update({
          title: version.title,
          content: version.content,
          content_blocks: version.content_blocks as any,
          version: (version.version || 1) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', noteId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Version restored',
      });

      return true;
    } catch (error) {
      console.error('Error restoring version:', error);
      toast({
        title: 'Error',
        description: 'Failed to restore version',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    versions,
    loading,
    saveVersion,
    restoreVersion,
    refreshVersions: fetchVersions,
  };
};
