-- Fix naming conflicts and complete RLS policies

-- Drop the conflicting group_messages table and recreate with different name
DROP TABLE IF EXISTS public.group_messages CASCADE;

-- Create group chat messages table with proper name
CREATE TABLE IF NOT EXISTS public.group_chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id uuid NOT NULL REFERENCES public.group_chats(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  attachments jsonb DEFAULT '[]',
  message_type text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  is_edited boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  edited_at timestamp with time zone
);

-- Enable RLS on the new table
ALTER TABLE public.group_chat_messages ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for all remaining tables
CREATE POLICY "Users can view all follows" ON public.user_follows
  FOR SELECT USING (true);

CREATE POLICY "Users can create follows for themselves" ON public.user_follows
  FOR INSERT WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Users can delete their own follows" ON public.user_follows
  FOR DELETE USING (follower_id = auth.uid());

-- Communities policies
CREATE POLICY "Anyone can view public communities" ON public.communities
  FOR SELECT USING (is_public = true OR owner_id = auth.uid() OR EXISTS(
    SELECT 1 FROM community_members WHERE community_id = communities.id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own communities" ON public.communities
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their communities" ON public.communities
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their communities" ON public.communities
  FOR DELETE USING (owner_id = auth.uid());

-- Community members policies
CREATE POLICY "Members and admins can view community membership" ON public.community_members
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS(SELECT 1 FROM community_members cm WHERE cm.community_id = community_members.community_id AND cm.user_id = auth.uid())
  );

CREATE POLICY "Users can join public communities" ON public.community_members
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND 
    EXISTS(SELECT 1 FROM communities c WHERE c.id = community_id AND c.is_public = true)
  );

CREATE POLICY "Admins and owners can manage membership" ON public.community_members
  FOR UPDATE USING (
    EXISTS(SELECT 1 FROM communities c WHERE c.id = community_id AND c.owner_id = auth.uid()) OR
    EXISTS(SELECT 1 FROM community_members cm WHERE cm.community_id = community_members.community_id 
           AND cm.user_id = auth.uid() AND cm.role IN ('admin', 'owner'))
  );

CREATE POLICY "Users can leave communities" ON public.community_members
  FOR DELETE USING (
    user_id = auth.uid() OR
    EXISTS(SELECT 1 FROM communities c WHERE c.id = community_id AND c.owner_id = auth.uid()) OR
    EXISTS(SELECT 1 FROM community_members cm WHERE cm.community_id = community_members.community_id 
           AND cm.user_id = auth.uid() AND cm.role IN ('admin', 'owner'))
  );

-- Community channels policies
CREATE POLICY "Members can view channels" ON public.community_channels
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM community_members cm WHERE cm.community_id = community_channels.community_id AND cm.user_id = auth.uid())
  );

CREATE POLICY "Admins can create channels" ON public.community_channels
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND (
      EXISTS(SELECT 1 FROM communities c WHERE c.id = community_id AND c.owner_id = auth.uid()) OR
      EXISTS(SELECT 1 FROM community_members cm WHERE cm.community_id = community_channels.community_id 
             AND cm.user_id = auth.uid() AND cm.role IN ('admin', 'owner'))
    )
  );

CREATE POLICY "Admins can update channels" ON public.community_channels
  FOR UPDATE USING (
    EXISTS(SELECT 1 FROM communities c WHERE c.id = community_id AND c.owner_id = auth.uid()) OR
    EXISTS(SELECT 1 FROM community_members cm WHERE cm.community_id = community_channels.community_id 
           AND cm.user_id = auth.uid() AND cm.role IN ('admin', 'owner'))
  );

CREATE POLICY "Admins can delete channels" ON public.community_channels
  FOR DELETE USING (
    EXISTS(SELECT 1 FROM communities c WHERE c.id = community_id AND c.owner_id = auth.uid()) OR
    EXISTS(SELECT 1 FROM community_members cm WHERE cm.community_id = community_channels.community_id 
           AND cm.user_id = auth.uid() AND cm.role IN ('admin', 'owner'))
  );

-- Posts policies
CREATE POLICY "Users can view posts based on visibility" ON public.posts
  FOR SELECT USING (
    visibility = 'public' OR
    (visibility = 'followers' AND EXISTS(SELECT 1 FROM user_follows uf WHERE uf.following_id = posts.author_id AND uf.follower_id = auth.uid())) OR
    (visibility = 'community' AND EXISTS(SELECT 1 FROM community_members cm WHERE cm.community_id = posts.community_id AND cm.user_id = auth.uid())) OR
    author_id = auth.uid()
  );

CREATE POLICY "Users can create posts" ON public.posts
  FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can update their posts" ON public.posts
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Authors and admins can delete posts" ON public.posts
  FOR DELETE USING (
    author_id = auth.uid() OR
    (community_id IS NOT NULL AND EXISTS(SELECT 1 FROM community_members cm WHERE cm.community_id = posts.community_id 
     AND cm.user_id = auth.uid() AND cm.role IN ('admin', 'owner', 'moderator')))
  );

-- Post reactions policies
CREATE POLICY "Users can view all reactions" ON public.post_reactions
  FOR SELECT USING (true);

CREATE POLICY "Users can react to posts" ON public.post_reactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their reactions" ON public.post_reactions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their reactions" ON public.post_reactions
  FOR DELETE USING (user_id = auth.uid());

-- Comments policies
CREATE POLICY "Users can view comments for posts they can see" ON public.comments
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM posts p WHERE p.id = comments.post_id AND (
      p.visibility = 'public' OR
      (p.visibility = 'followers' AND EXISTS(SELECT 1 FROM user_follows uf WHERE uf.following_id = p.author_id AND uf.follower_id = auth.uid())) OR
      (p.visibility = 'community' AND EXISTS(SELECT 1 FROM community_members cm WHERE cm.community_id = p.community_id AND cm.user_id = auth.uid())) OR
      p.author_id = auth.uid()
    ))
  );

CREATE POLICY "Users can create comments" ON public.comments
  FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can update their comments" ON public.comments
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Authors and moderators can delete comments" ON public.comments
  FOR DELETE USING (
    author_id = auth.uid() OR
    EXISTS(SELECT 1 FROM posts p JOIN community_members cm ON p.community_id = cm.community_id 
           WHERE p.id = comments.post_id AND cm.user_id = auth.uid() AND cm.role IN ('admin', 'owner', 'moderator'))
  );

-- Comment reactions policies
CREATE POLICY "Users can view comment reactions" ON public.comment_reactions
  FOR SELECT USING (true);

CREATE POLICY "Users can react to comments" ON public.comment_reactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their comment reactions" ON public.comment_reactions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their comment reactions" ON public.comment_reactions
  FOR DELETE USING (user_id = auth.uid());

-- Direct messages policies
CREATE POLICY "Users can view their own messages" ON public.direct_messages
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages" ON public.direct_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Senders can update their messages" ON public.direct_messages
  FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "Participants can delete messages" ON public.direct_messages
  FOR DELETE USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Group chats policies
CREATE POLICY "Members can view group chats" ON public.group_chats
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM group_chat_members gcm WHERE gcm.chat_id = group_chats.id AND gcm.user_id = auth.uid())
  );

CREATE POLICY "Users can create group chats" ON public.group_chats
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admins can update group chats" ON public.group_chats
  FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS(SELECT 1 FROM group_chat_members gcm WHERE gcm.chat_id = group_chats.id AND gcm.user_id = auth.uid() AND gcm.role = 'admin')
  );

CREATE POLICY "Creators can delete group chats" ON public.group_chats
  FOR DELETE USING (created_by = auth.uid());

-- Group chat members policies
CREATE POLICY "Members can view group membership" ON public.group_chat_members
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM group_chat_members gcm WHERE gcm.chat_id = group_chat_members.chat_id AND gcm.user_id = auth.uid())
  );

CREATE POLICY "Admins can add members" ON public.group_chat_members
  FOR INSERT WITH CHECK (
    EXISTS(SELECT 1 FROM group_chats gc WHERE gc.id = chat_id AND gc.created_by = auth.uid()) OR
    EXISTS(SELECT 1 FROM group_chat_members gcm WHERE gcm.chat_id = group_chat_members.chat_id AND gcm.user_id = auth.uid() AND gcm.role = 'admin')
  );

CREATE POLICY "Members can leave groups" ON public.group_chat_members
  FOR DELETE USING (
    user_id = auth.uid() OR
    EXISTS(SELECT 1 FROM group_chats gc WHERE gc.id = chat_id AND gc.created_by = auth.uid()) OR
    EXISTS(SELECT 1 FROM group_chat_members gcm WHERE gcm.chat_id = group_chat_members.chat_id AND gcm.user_id = auth.uid() AND gcm.role = 'admin')
  );

-- Group chat messages policies (fixed table name)
CREATE POLICY "Members can view group messages" ON public.group_chat_messages
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM group_chat_members gcm WHERE gcm.chat_id = group_chat_messages.chat_id AND gcm.user_id = auth.uid())
  );

CREATE POLICY "Members can send messages" ON public.group_chat_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS(SELECT 1 FROM group_chat_members gcm WHERE gcm.chat_id = group_chat_messages.chat_id AND gcm.user_id = auth.uid())
  );

CREATE POLICY "Senders can update messages" ON public.group_chat_messages
  FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "Senders and admins can delete messages" ON public.group_chat_messages
  FOR DELETE USING (
    sender_id = auth.uid() OR
    EXISTS(SELECT 1 FROM group_chat_members gcm WHERE gcm.chat_id = group_chat_messages.chat_id AND gcm.user_id = auth.uid() AND gcm.role = 'admin')
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications" ON public.notifications
  FOR DELETE USING (user_id = auth.uid());

-- User badges policies
CREATE POLICY "Users can view all badges" ON public.user_badges
  FOR SELECT USING (true);

CREATE POLICY "System can create badges" ON public.user_badges
  FOR INSERT WITH CHECK (true);

-- User blocks policies
CREATE POLICY "Users can view their own blocks" ON public.user_blocks
  FOR SELECT USING (blocker_id = auth.uid());

CREATE POLICY "Users can create blocks" ON public.user_blocks
  FOR INSERT WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "Users can delete their own blocks" ON public.user_blocks
  FOR DELETE USING (blocker_id = auth.uid());

-- Reports policies
CREATE POLICY "Users can view their own reports" ON public.reports
  FOR SELECT USING (reporter_id = auth.uid());

CREATE POLICY "Users can create reports" ON public.reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_communities_updated_at
  BEFORE UPDATE ON public.communities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_channels_updated_at
  BEFORE UPDATE ON public.community_channels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_group_chats_updated_at
  BEFORE UPDATE ON public.group_chats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_group_chat_messages_updated_at
  BEFORE UPDATE ON public.group_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_communities_public ON public.communities(is_public);
CREATE INDEX IF NOT EXISTS idx_community_members_user ON public.community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_community ON public.community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_community ON public.posts(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON public.posts(visibility);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON public.post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;