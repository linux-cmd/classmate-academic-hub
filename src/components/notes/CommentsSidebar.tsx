import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useComments, Comment } from '@/hooks/useComments';
import { MessageSquare, Reply, ThumbsUp, Heart, Flame, CheckCircle2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface CommentsSidebarProps {
  noteId: string;
  onClose: () => void;
}

const CommentItem = ({
  comment,
  onReply,
  onToggleReaction,
  onResolve,
  onDelete,
  currentUserId,
  depth = 0,
}: {
  comment: Comment;
  onReply: (commentId: string) => void;
  onToggleReaction: (commentId: string, type: string) => void;
  onResolve: (commentId: string, resolved: boolean) => void;
  onDelete: (commentId: string) => void;
  currentUserId?: string;
  depth?: number;
}) => {
  const reactionIcons = {
    like: ThumbsUp,
    heart: Heart,
    fire: Flame,
    thumbsup: ThumbsUp,
  };

  return (
    <div className={`space-y-2 ${depth > 0 ? 'ml-8 mt-2' : 'mt-4'}`}>
      <div className={`p-3 rounded-lg border ${comment.resolved ? 'bg-muted/50' : 'bg-card'}`}>
        <div className="flex items-start gap-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={comment.author?.avatar_url} />
            <AvatarFallback>{comment.author?.display_name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{comment.author?.display_name || 'Unknown'}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
              {comment.resolved && (
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Resolved
                </Badge>
              )}
            </div>
            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>

            <div className="flex items-center gap-2 mt-2">
              {comment.reactions?.map((reaction) => {
                const Icon = reactionIcons[reaction.reaction_type as keyof typeof reactionIcons];
                return (
                  <Button
                    key={reaction.reaction_type}
                    variant={reaction.user_reacted ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => onToggleReaction(comment.id, reaction.reaction_type)}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {reaction.count}
                  </Button>
                );
              })}

              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => onReply(comment.id)}
              >
                <Reply className="w-3 h-3 mr-1" />
                Reply
              </Button>

              {!comment.parent_id && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => onResolve(comment.id, !comment.resolved)}
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {comment.resolved ? 'Reopen' : 'Resolve'}
                </Button>
              )}

              {comment.author_id === currentUserId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-destructive"
                  onClick={() => onDelete(comment.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          onReply={onReply}
          onToggleReaction={onToggleReaction}
          onResolve={onResolve}
          onDelete={onDelete}
          currentUserId={currentUserId}
          depth={depth + 1}
        />
      ))}
    </div>
  );
};

export const CommentsSidebar = ({ noteId, onClose }: CommentsSidebarProps) => {
  const { user } = useSupabaseAuth();
  const { comments, loading, addComment, toggleReaction, resolveComment, deleteComment } = useComments(noteId);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    await addComment(newComment, undefined, replyingTo || undefined);
    setNewComment('');
    setReplyingTo(null);
  };

  const unresolvedCount = comments.filter((c) => !c.resolved).length;

  return (
    <div className="w-96 border-l bg-background flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <h3 className="font-semibold">Comments</h3>
          {unresolvedCount > 0 && (
            <Badge variant="secondary">{unresolvedCount} unresolved</Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ✕
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="text-center text-muted-foreground">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No comments yet. Start the discussion!
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={setReplyingTo}
                onToggleReaction={toggleReaction}
                onResolve={resolveComment}
                onDelete={deleteComment}
                currentUserId={user?.id}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t">
        {replyingTo && (
          <div className="mb-2 text-xs text-muted-foreground flex items-center justify-between">
            <span>Replying to comment...</span>
            <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
              Cancel
            </Button>
          </div>
        )}
        <Textarea
          placeholder="Add a comment... Use @ to mention someone"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="mb-2 resize-none"
          rows={3}
        />
        <Button onClick={handleSubmit} disabled={!newComment.trim()} className="w-full">
          {replyingTo ? 'Reply' : 'Comment'}
        </Button>
      </div>
    </div>
  );
};
