import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { toast } from './use-toast';
import { Block } from '@/components/notes/BlockEditor';

export interface Template {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  preview_url: string | null;
  content_blocks: Block[];
  is_public: boolean;
  category: string | null;
  tags: string[];
  usage_count: number;
  created_at: string;
  updated_at: string;
  owner?: {
    display_name: string;
  };
}

export const useTemplates = () => {
  const { user } = useSupabaseAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTemplates();
    }
  }, [user]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select(`
          *,
          owner:profiles!templates_owner_id_fkey(display_name)
        `)
        .or(`is_public.eq.true,owner_id.eq.${user?.id}`)
        .order('usage_count', { ascending: false });

      if (error) throw error;

      const processedTemplates = (data || []).map((t) => ({
        ...t,
        content_blocks: Array.isArray(t.content_blocks)
          ? (t.content_blocks as unknown as Block[])
          : [],
        owner: Array.isArray(t.owner) ? t.owner[0] : t.owner,
      })) as Template[];

      setTemplates(processedTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load templates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (
    title: string,
    contentBlocks: Block[],
    options?: {
      description?: string;
      category?: string;
      tags?: string[];
      isPublic?: boolean;
    }
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('templates')
        .insert({
          owner_id: user.id,
          title,
          description: options?.description || null,
          content_blocks: contentBlocks as any,
          category: options?.category || null,
          tags: options?.tags || [],
          is_public: options?.isPublic || false,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Template created',
      });

      fetchTemplates();
      return data;
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: 'Error',
        description: 'Failed to create template',
        variant: 'destructive',
      });
    }
  };

  const useTemplate = async (templateId: string) => {
    try {
      const template = templates.find((t) => t.id === templateId);
      if (!template) throw new Error('Template not found');

      // Increment usage count
      await supabase
        .from('templates')
        .update({ usage_count: template.usage_count + 1 })
        .eq('id', templateId);

      return template.content_blocks;
    } catch (error) {
      console.error('Error using template:', error);
      toast({
        title: 'Error',
        description: 'Failed to use template',
        variant: 'destructive',
      });
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Template deleted',
      });

      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      });
    }
  };

  return {
    templates,
    loading,
    createTemplate,
    useTemplate,
    deleteTemplate,
    refreshTemplates: fetchTemplates,
  };
};
