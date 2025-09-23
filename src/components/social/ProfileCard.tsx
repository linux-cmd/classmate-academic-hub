import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, School, Calendar, Users, Heart, MessageCircle, Shield } from 'lucide-react';
import { useSocialAuth } from '@/hooks/useSocialAuth';
import { useSocialData } from '@/hooks/useSocialData';

interface ProfileCardProps {
  userId?: string;
  profile?: any;
  showActions?: boolean;
  compact?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ 
  userId, 
  profile: externalProfile, 
  showActions = true,
  compact = false 
}) => {
  const { user, profile: currentUserProfile } = useSocialAuth();
  const { toggleFollow, following, followers } = useSocialData();
  
  // Use external profile or current user's profile
  const profile = externalProfile || currentUserProfile;
  const isOwnProfile = user?.id === (userId || profile?.user_id);
  
  // Check if current user follows this profile
  const isFollowing = following.some(f => f.following_id === (userId || profile?.user_id));
  const followerCount = followers.filter(f => f.following_id === (userId || profile?.user_id)).length;
  const followingCount = following.filter(f => f.follower_id === (userId || profile?.user_id)).length;

  if (!profile) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-muted animate-pulse" />
          <div className="h-4 w-24 bg-muted animate-pulse mx-auto mt-2" />
        </CardHeader>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors">
        <div className="relative">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback>
              {getInitials(profile.display_name || 'User')}
            </AvatarFallback>
          </Avatar>
          <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background ${getStatusColor(profile.status || 'offline')}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-sm truncate">
              {profile.display_name || 'Anonymous User'}
            </h3>
            {profile.is_verified && (
              <Shield className="h-4 w-4 text-blue-500" />
            )}
          </div>
          {profile.username && (
            <p className="text-xs text-muted-foreground">@{profile.username}</p>
          )}
          {profile.status_message && (
            <p className="text-xs text-muted-foreground truncate">
              {profile.status_emoji} {profile.status_message}
            </p>
          )}
        </div>

        {showActions && !isOwnProfile && (
          <Button
            variant={isFollowing ? "secondary" : "default"}
            size="sm"
            onClick={() => toggleFollow(userId || profile.user_id)}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full">
      {/* Cover Image */}
      {profile.cover_image_url && (
        <div 
          className="h-32 bg-cover bg-center rounded-t-lg" 
          style={{ backgroundImage: `url(${profile.cover_image_url})` }}
        />
      )}
      
      <CardHeader className="text-center pb-4">
        <div className="relative mx-auto">
          <Avatar className="h-20 w-20 mx-auto border-4 border-background">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback className="text-lg">
              {getInitials(profile.display_name || 'User')}
            </AvatarFallback>
          </Avatar>
          <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-background ${getStatusColor(profile.status || 'offline')}`} />
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-center space-x-2">
            <h2 className="text-xl font-bold">
              {profile.display_name || 'Anonymous User'}
            </h2>
            {profile.is_verified && (
              <Badge variant="secondary" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          
          {profile.username && (
            <p className="text-muted-foreground">@{profile.username}</p>
          )}

          {profile.status_message && (
            <p className="text-sm text-muted-foreground mt-1">
              {profile.status_emoji} {profile.status_message}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex justify-center space-x-6 mt-4">
          <div className="text-center">
            <div className="font-bold text-lg">{profile.karma_points || 0}</div>
            <div className="text-xs text-muted-foreground">Karma</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">{followingCount}</div>
            <div className="text-xs text-muted-foreground">Following</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">{followerCount}</div>
            <div className="text-xs text-muted-foreground">Followers</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">Lv. {profile.level || 1}</div>
            <div className="text-xs text-muted-foreground">Level</div>
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && !isOwnProfile && (
          <div className="flex space-x-2 mt-4">
            <Button
              variant={isFollowing ? "secondary" : "default"}
              size="sm"
              className="flex-1"
              onClick={() => toggleFollow(userId || profile.user_id)}
            >
              <Users className="h-4 w-4 mr-2" />
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Bio */}
        {profile.bio && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">{profile.bio}</p>
          </div>
        )}

        <Separator className="mb-4" />

        {/* Details */}
        <div className="space-y-2 text-sm">
          {profile.location && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{profile.location}</span>
            </div>
          )}
          
          {profile.school && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <School className="h-4 w-4" />
              <span>{profile.school}</span>
              {profile.grade && <span>• {profile.grade}</span>}
            </div>
          )}

          <div className="flex items-center space-x-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Interests</h4>
            <div className="flex flex-wrap gap-1">
              {profile.interests.slice(0, 6).map((interest: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Classes */}
        {profile.classes && profile.classes.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Classes</h4>
            <div className="flex flex-wrap gap-1">
              {profile.classes.slice(0, 4).map((className: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {className}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        {profile.links && Object.keys(profile.links).length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Links</h4>
            <div className="space-y-1">
              {Object.entries(profile.links).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline block"
                >
                  {platform}: {url}
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};