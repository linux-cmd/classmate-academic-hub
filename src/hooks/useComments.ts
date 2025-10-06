import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { toast } from './use-toast';

export interface Comment {
  id: string;
  note_id: string;
  block_ref: string | null;
  author_id: string;
  parent_id: string | null;
  content: string;
  resolved: boolean;
  created_at: string;
  updated_at: string;
  author?: {
    display_name: string;
    avatar_url?: string;
  };
  replies?: Comment[];
  reactions?: {
    reaction_type: string;
    count: number;
    user_reacted: boolean;
  }[];
}

export const useComments = (noteId: string | null) => {
  const { user } = useSupabaseAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!noteId) return;
    fetchComments();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`note_comments:${noteId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'note_comments',
          filter: `note_id=eq.${noteId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [noteId]);

  const fetchComments = async () => {
    if (!noteId) return;

    try {
      // Fetch comments with author info
      const { data: commentsData, error } = await supabase
        .from('note_comments')
        .select(`
          *,
          author:profiles!note_comments_author_id_fkey(display_name, avatar_url)
        `)
        .eq('note_id', noteId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch reactions for all comments
      const commentIds = commentsData?.map((c) => c.id) || [];
      const { data: reactionsData } = await supabase
        .from('comment_reactions')
        .select('comment_id, reaction_type, user_id')
        .in('comment_id', commentIds);

      // Group reactions by comment
      const reactionsByComment = (reactionsData || []).reduce((acc, r) => {
        if (!acc[r.comment_id]) acc[r.comment_id] = [];
        acc[r.comment_id].push(r);
        return acc;
      }, {} as Record<string, any[]>);

      // Build comment tree
      const commentsMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      commentsData?.forEach((comment) => {
        const reactions = reactionsByComment[comment.id] || [];
        const reactionSummary = ['like', 'heart', 'fire', 'thumbsup'].map((type) => ({
          reaction_type: type,
          count: reactions.filter((r) => r.reaction_type === type).length,
          user_reacted: reactions.some((r) => r.reaction_type === type && r.user_id === user?.id),
        })).filter((r) => r.count > 0);

        const commentWithReplies: Comment = {
          ...comment,
          author: Array.isArray(comment.author) ? comment.author[0] : comment.author,
          replies: [],
          reactions: reactionSummary,
        };

        commentsMap.set(comment.id, commentWithReplies);

        if (!comment.parent_id) {
          rootComments.push(commentWithReplies);
        }
      });

      // Attach replies to parents
      commentsData?.forEach((comment) => {
        if (comment.parent_id) {
          const parent = commentsMap.get(comment.parent_id);
          const child = commentsMap.get(comment.id);
          if (parent && child) {
            parent.replies!.push(child);
          }
        }
      });

      setComments(rootComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load comments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string, blockRef?: string, parentId?: string) => {
    if (!user || !noteId) return;

    try {
      const { data, error } = await supabase
        .from('note_comments')
        .insert({
          note_id: noteId,
          author_id: user.id,
          content,
          block_ref: blockRef || null,
          parent_id: parentId || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Check for mentions and notify
      if (content.includes('@')) {
        await supabase.functions.invoke('notify-mentions', {
          body: {
            commentId: data.id,
            commentText: content,
            noteId,
            authorId: user.id,
          },
        });
      }

      toast({
        title: 'Success',
        description: 'Comment added',
      });

      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    }
  };

  const toggleReaction = async (commentId: string, reactionType: string) => {
    if (!user) return;

    try {
      // Check if user already reacted
      const { data: existing } = await supabase
        .from('comment_reactions')
        .select()
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .eq('reaction_type', reactionType)
        .single();

      if (existing) {
        // Remove reaction
        const { error } = await supabase
          .from('comment_reactions')
          .delete()
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Add reaction
        const { error } = await supabase
          .from('comment_reactions')
          .insert({
            comment_id: commentId,
            user_id: user.id,
            reaction_type: reactionType,
          });

        if (error) throw error;
      }

      fetchComments();
    } catch (error) {
      console.error('Error toggling reaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to update reaction',
        variant: 'destructive',
      });
    }
  };

  const resolveComment = async (commentId: string, resolved: boolean) => {
    try {
      const { error } = await supabase
        .from('note_comments')
        .update({ resolved })
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: resolved ? 'Comment resolved' : 'Comment reopened',
      });
    } catch (error) {
      console.error('Error resolving comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update comment',
        variant: 'destructive',
      });
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('note_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Comment deleted',
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete comment',
        variant: 'destructive',
      });
    }
  };

  return {
    comments,
    loading,
    addComment,
    toggleReaction,
    resolveComment,
    deleteComment,
    refreshComments: fetchComments,
  };
};
