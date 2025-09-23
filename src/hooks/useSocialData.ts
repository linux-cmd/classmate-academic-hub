import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSocialAuth } from './useSocialAuth';
import { useToast } from '@/hooks/use-toast';

export interface Post {
  id: string;
  author_id: string;
  community_id?: string;
  channel_id?: string;
  title?: string;
  content: string;
  post_type: 'text' | 'image' | 'video' | 'link' | 'poll' | 'assignment' | 'event' | 'question';
  visibility: 'public' | 'followers' | 'community' | 'private';
  attachments?: any[];
  tags?: string[];
  metadata?: any;
  is_pinned: boolean;
  is_locked: boolean;
  like_count: number;
  comment_count: number;
  share_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  edited_at?: string;
  // Joined data
  author?: {
    id: string;
    display_name: string;
    username: string;
    avatar_url: string;
    is_verified: boolean;
  };
  community?: {
    id: string;
    name: string;
    display_name: string;
    icon_url: string;
  };
  user_reaction?: {
    reaction_type: string;
  };
}

export interface Community {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  cover_image_url?: string;
  icon_url?: string;
  owner_id: string;
  is_public: boolean;
  requires_approval: boolean;
  member_count: number;
  rules?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  // Joined data
  owner?: {
    display_name: string;
    username: string;
    avatar_url: string;
  };
  user_membership?: {
    role: string;
    joined_at: string;
  };
}

export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  following_user?: {
    id: string;
    display_name: string;
    username: string;
    avatar_url: string;
    is_verified: boolean;
  };
  follower_user?: {
    id: string;
    display_name: string;
    username: string;
    avatar_url: string;
    is_verified: boolean;
  };
}

export const useSocialData = () => {
  const { user, isAuthenticated } = useSocialAuth();
  const { toast } = useToast();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [following, setFollowing] = useState<UserFollow[]>([]);
  const [followers, setFollowers] = useState<UserFollow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's feed posts
  const fetchFeedPosts = async () => {
    if (!isAuthenticated || !user) return;

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_author_id_fkey(id, display_name, username, avatar_url, is_verified),
          community:communities(id, name, display_name, icon_url),
          user_reaction:post_reactions(reaction_type)
        `)
        .or(`visibility.eq.public,and(visibility.eq.followers,author_id.in.(${user.id})),and(visibility.eq.community,community_id.in.(select community_id from community_members where user_id.eq.${user.id})),author_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setPosts(data || []);
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      setError(err.message);
    }
  };

  // Fetch communities (public ones + user's communities)
  const fetchCommunities = async () => {
    if (!isAuthenticated) return;

    try {
      const { data, error } = await supabase
        .from('communities')
        .select(`
          *,
          owner:profiles!communities_owner_id_fkey(display_name, username, avatar_url),
          user_membership:community_members(role, joined_at)
        `)
        .order('member_count', { ascending: false })
        .limit(20);

      if (error) throw error;

      setCommunities(data || []);
    } catch (err: any) {
      console.error('Error fetching communities:', err);
      setError(err.message);
    }
  };

  // Fetch user's follows and followers
  const fetchFollowData = async () => {
    if (!isAuthenticated || !user) return;

    try {
      // Fetch following
      const { data: followingData, error: followingError } = await supabase
        .from('user_follows')
        .select(`
          *,
          following_user:profiles!user_follows_following_id_fkey(id, display_name, username, avatar_url, is_verified)
        `)
        .eq('follower_id', user.id);

      if (followingError) throw followingError;

      // Fetch followers
      const { data: followersData, error: followersError } = await supabase
        .from('user_follows')
        .select(`
          *,
          follower_user:profiles!user_follows_follower_id_fkey(id, display_name, username, avatar_url, is_verified)
        `)
        .eq('following_id', user.id);

      if (followersError) throw followersError;

      setFollowing(followingData || []);
      setFollowers(followersData || []);
    } catch (err: any) {
      console.error('Error fetching follow data:', err);
      setError(err.message);
    }
  };

  // Load all data
  const loadAllData = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchFeedPosts(),
        fetchCommunities(),
        fetchFollowData()
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Create a new post
  const createPost = async (postData: {
    content: string;
    title?: string;
    post_type?: string;
    visibility?: string;
    community_id?: string;
    tags?: string[];
    attachments?: any[];
    metadata?: any;
  }) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([{
          author_id: user.id,
          content: postData.content,
          title: postData.title,
          post_type: postData.post_type || 'text',
          visibility: postData.visibility || 'public',
          community_id: postData.community_id,
          tags: postData.tags || [],
          attachments: postData.attachments || [],
          metadata: postData.metadata || {}
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Post created",
        description: "Your post has been shared successfully.",
      });

      // Refresh posts
      await fetchFeedPosts();
      
      return data;
    } catch (err: any) {
      toast({
        title: "Error creating post",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    }
  };

  // React to a post
  const togglePostReaction = async (postId: string, reactionType: string = 'like') => {
    if (!user) return;

    try {
      // Check if user already reacted
      const { data: existing } = await supabase
        .from('post_reactions')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .eq('reaction_type', reactionType)
        .single();

      if (existing) {
        // Remove reaction
        await supabase
          .from('post_reactions')
          .delete()
          .eq('id', existing.id);

        // Update post like count
        await supabase.rpc('decrement_post_likes', { post_id: postId });
      } else {
        // Add reaction
        await supabase
          .from('post_reactions')
          .insert([{
            post_id: postId,
            user_id: user.id,
            reaction_type: reactionType
          }]);

        // Update post like count
        await supabase.rpc('increment_post_likes', { post_id: postId });
      }

      // Refresh posts to show updated counts
      await fetchFeedPosts();
    } catch (err: any) {
      console.error('Error toggling reaction:', err);
    }
  };

  // Follow/unfollow a user
  const toggleFollow = async (targetUserId: string) => {
    if (!user || user.id === targetUserId) return;

    try {
      const { data: existing } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .single();

      if (existing) {
        // Unfollow
        await supabase
          .from('user_follows')
          .delete()
          .eq('id', existing.id);
      } else {
        // Follow
        await supabase
          .from('user_follows')
          .insert([{
            follower_id: user.id,
            following_id: targetUserId
          }]);
      }

      // Refresh follow data
      await fetchFollowData();
    } catch (err: any) {
      console.error('Error toggling follow:', err);
    }
  };

  // Join/leave a community
  const toggleCommunityMembership = async (communityId: string) => {
    if (!user) return;

    try {
      const { data: existing } = await supabase
        .from('community_members')
        .select('id')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Leave community
        await supabase
          .from('community_members')
          .delete()
          .eq('id', existing.id);
      } else {
        // Join community
        await supabase
          .from('community_members')
          .insert([{
            community_id: communityId,
            user_id: user.id,
            role: 'member'
          }]);
      }

      // Refresh communities
      await fetchCommunities();
    } catch (err: any) {
      console.error('Error toggling community membership:', err);
    }
  };

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadAllData();
    } else {
      setPosts([]);
      setCommunities([]);
      setFollowing([]);
      setFollowers([]);
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Subscribe to new posts
    const postsChannel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        () => {
          fetchFeedPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
    };
  }, [isAuthenticated, user?.id]);

  return {
    posts,
    communities,
    following,
    followers,
    loading,
    error,
    createPost,
    togglePostReaction,
    toggleFollow,
    toggleCommunityMembership,
    refreshPosts: fetchFeedPosts,
    refreshCommunities: fetchCommunities,
    refreshFollows: fetchFollowData,
    refreshAll: loadAllData,
    // Stats
    stats: {
      totalPosts: posts.length,
      totalCommunities: communities.filter(c => c.user_membership).length,
      followingCount: following.length,
      followersCount: followers.length,
    }
  };
};