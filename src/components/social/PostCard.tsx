import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  MoreHorizontal, 
  Pin,
  Lock,
  Globe,
  Users,
  Shield,
  Calendar,
  MapPin
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Post } from '@/hooks/useSocialData';
import { useSocialAuth } from '@/hooks/useSocialAuth';
import { useSocialData } from '@/hooks/useSocialData';

interface PostCardProps {
  post: Post;
  showCommunity?: boolean;
  compact?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  showCommunity = true, 
  compact = false 
}) => {
  const { user } = useSocialAuth();
  const { togglePostReaction } = useSocialData();
  const [isReacting, setIsReacting] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="h-4 w-4" />;
      case 'followers': return <Users className="h-4 w-4" />;
      case 'community': return <Shield className="h-4 w-4" />;
      default: return <Lock className="h-4 w-4" />;
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'question': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'assignment': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'event': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'poll': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const handleReaction = async (reactionType: string = 'like') => {
    if (isReacting || !user) return;
    
    setIsReacting(true);
    try {
      await togglePostReaction(post.id, reactionType);
    } finally {
      setIsReacting(false);
    }
  };

  const renderEventMetadata = () => {
    if (post.post_type !== 'event' || !post.metadata) return null;
    
    return (
      <div className="mt-3 p-3 bg-muted rounded-lg">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
          <Calendar className="h-4 w-4" />
          <span>Event Details</span>
        </div>
        <div className="space-y-1 text-sm">
          {post.metadata.date && (
            <div>📅 {new Date(post.metadata.date).toLocaleDateString()}</div>
          )}
          {post.metadata.time && (
            <div>⏰ {post.metadata.time}</div>
          )}
          {post.metadata.location && (
            <div className="flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <span>{post.metadata.location}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPollMetadata = () => {
    if (post.post_type !== 'poll' || !post.metadata?.options) return null;
    
    return (
      <div className="mt-3 space-y-2">
        {post.metadata.options.map((option: any, index: number) => (
          <div key={index} className="p-2 border rounded cursor-pointer hover:bg-muted">
            <div className="flex justify-between items-center">
              <span className="text-sm">{option.text}</span>
              <span className="text-xs text-muted-foreground">{option.votes || 0} votes</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAssignmentMetadata = () => {
    if (post.post_type !== 'assignment' || !post.metadata) return null;
    
    return (
      <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
        <div className="text-sm space-y-1">
          {post.metadata.dueDate && (
            <div className="text-orange-800 dark:text-orange-300">
              📝 Due: {new Date(post.metadata.dueDate).toLocaleDateString()}
            </div>
          )}
          {post.metadata.subject && (
            <div className="text-orange-700 dark:text-orange-400">
              📚 Subject: {post.metadata.subject}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className={compact ? "pb-2" : "pb-4"}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author?.avatar_url || ''} />
              <AvatarFallback>
                {getInitials(post.author?.display_name || 'User')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-sm">
                  {post.author?.display_name || 'Anonymous User'}
                </h3>
                {post.author?.is_verified && (
                  <Shield className="h-4 w-4 text-blue-500" />
                )}
                {post.author?.username && (
                  <span className="text-xs text-muted-foreground">
                    @{post.author.username}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
                
                <div className="flex items-center space-x-1">
                  {getVisibilityIcon(post.visibility)}
                  <span className="text-xs text-muted-foreground capitalize">
                    {post.visibility}
                  </span>
                </div>

                {post.is_pinned && (
                  <Pin className="h-3 w-3 text-yellow-500" />
                )}
                
                {post.post_type !== 'text' && (
                  <Badge variant="secondary" className={`text-xs ${getPostTypeColor(post.post_type)}`}>
                    {post.post_type}
                  </Badge>
                )}
              </div>

              {showCommunity && post.community && (
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-muted-foreground">in</span>
                  <div className="flex items-center space-x-1">
                    {post.community.icon_url && (
                      <img 
                        src={post.community.icon_url} 
                        alt=""
                        className="h-4 w-4 rounded"
                      />
                    )}
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      {post.community.display_name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className={compact ? "pt-0" : ""}>
        {/* Title */}
        {post.title && (
          <h2 className="font-bold text-lg mb-2">{post.title}</h2>
        )}

        {/* Content */}
        <div className="text-sm mb-3 whitespace-pre-wrap">
          {post.content}
        </div>

        {/* Special content based on post type */}
        {renderEventMetadata()}
        {renderPollMetadata()}
        {renderAssignmentMetadata()}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Attachments */}
        {post.attachments && post.attachments.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-muted-foreground mb-2">
              {post.attachments.length} attachment(s)
            </div>
            <div className="grid grid-cols-2 gap-2">
              {post.attachments.map((attachment, index) => (
                <div key={index} className="p-2 border rounded text-xs">
                  📎 {attachment.name || `Attachment ${index + 1}`}
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator className="mb-3" />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className={`text-muted-foreground hover:text-red-500 ${post.user_reaction ? 'text-red-500' : ''}`}
              onClick={() => handleReaction('like')}
              disabled={isReacting}
            >
              <Heart className={`h-4 w-4 mr-1 ${post.user_reaction ? 'fill-current' : ''}`} />
              <span className="text-xs">{post.like_count || 0}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-blue-500"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              <span className="text-xs">{post.comment_count || 0}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-green-500"
            >
              <Share className="h-4 w-4 mr-1" />
              <span className="text-xs">{post.share_count || 0}</span>
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            {post.view_count || 0} views
          </div>
        </div>

        {post.edited_at && (
          <div className="text-xs text-muted-foreground mt-2">
            Edited {formatDistanceToNow(new Date(post.edited_at), { addSuffix: true })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};