import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  PlusCircle, 
  Users, 
  TrendingUp, 
  Hash,
  Globe,
  Lock,
  Image,
  Calendar,
  HelpCircle,
  Vote,
  FileText,
  Loader2
} from 'lucide-react';
import { useSocialAuth } from '@/hooks/useSocialAuth';
import { useSocialData } from '@/hooks/useSocialData';
import { PostCard } from '@/components/social/PostCard';
import { ProfileCard } from '@/components/social/ProfileCard';
import { useToast } from '@/hooks/use-toast';

export default function Social() {
  const { isAuthenticated, user, profile } = useSocialAuth();
  const { 
    posts, 
    communities, 
    loading, 
    createPost, 
    toggleCommunityMembership,
    stats 
  } = useSocialData();
  const { toast } = useToast();

  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [postType, setPostType] = useState('text');
  const [postVisibility, setPostVisibility] = useState('public');
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [tags, setTags] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [feedFilter, setFeedFilter] = useState('all');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to Classmate Social</h1>
            <p className="text-muted-foreground mb-8">
              Connect with fellow students, share knowledge, and build your academic network.
            </p>
            <Button size="lg">
              Sign In to Get Started
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some content for your post.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingPost(true);
    try {
      await createPost({
        content: newPostContent,
        title: newPostTitle || undefined,
        post_type: postType,
        visibility: postVisibility,
        community_id: selectedCommunity || undefined,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean)
      });

      // Reset form
      setNewPostContent('');
      setNewPostTitle('');
      setPostType('text');
      setPostVisibility('public');
      setSelectedCommunity('');
      setTags('');
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setIsCreatingPost(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    switch (feedFilter) {
      case 'following':
        // Show posts from followed users (implement following logic)
        return true; // Placeholder
      case 'communities':
        return post.community_id;
      case 'public':
        return post.visibility === 'public';
      default:
        return true;
    }
  });

  const trendingTopics = [
    '#StudyTips', '#ExamPrep', '#GroupProject', '#Homework', 
    '#CareerAdvice', '#Internships', '#ResearchHelp', '#TechHelp'
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Sidebar - Profile & Navigation */}
          <div className="lg:col-span-3">
            <div className="space-y-4 sticky top-6">
              {/* User Profile Card */}
              <ProfileCard profile={profile} showActions={false} />

              {/* Quick Stats */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Your Activity</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <div className="font-bold text-lg">{stats.totalPosts}</div>
                      <div className="text-xs text-muted-foreground">Posts</div>
                    </div>
                    <div>
                      <div className="font-bold text-lg">{stats.totalCommunities}</div>
                      <div className="text-xs text-muted-foreground">Communities</div>
                    </div>
                    <div>
                      <div className="font-bold text-lg">{stats.followingCount}</div>
                      <div className="text-xs text-muted-foreground">Following</div>
                    </div>
                    <div>
                      <div className="font-bold text-lg">{stats.followersCount}</div>
                      <div className="text-xs text-muted-foreground">Followers</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trending Topics */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Trending Topics
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1">
                    {trendingTopics.map((topic, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs cursor-pointer hover:bg-accent"
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-6">
            <div className="space-y-6">
              
              {/* Create Post Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Create Post
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Post Type & Visibility */}
                  <div className="grid grid-cols-2 gap-3">
                    <Select value={postType} onValueChange={setPostType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Post type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            Text Post
                          </div>
                        </SelectItem>
                        <SelectItem value="question">
                          <div className="flex items-center">
                            <HelpCircle className="h-4 w-4 mr-2" />
                            Question
                          </div>
                        </SelectItem>
                        <SelectItem value="assignment">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            Assignment
                          </div>
                        </SelectItem>
                        <SelectItem value="event">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            Event
                          </div>
                        </SelectItem>
                        <SelectItem value="poll">
                          <div className="flex items-center">
                            <Vote className="h-4 w-4 mr-2" />
                            Poll
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={postVisibility} onValueChange={setPostVisibility}>
                      <SelectTrigger>
                        <SelectValue placeholder="Visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 mr-2" />
                            Public
                          </div>
                        </SelectItem>
                        <SelectItem value="followers">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            Followers Only
                          </div>
                        </SelectItem>
                        <SelectItem value="community">
                          <div className="flex items-center">
                            <Lock className="h-4 w-4 mr-2" />
                            Community Only
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Community Selection */}
                  {postVisibility === 'community' && (
                    <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select community" />
                      </SelectTrigger>
                      <SelectContent>
                        {communities
                          .filter(c => c.user_membership)
                          .map(community => (
                          <SelectItem key={community.id} value={community.id}>
                            {community.display_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Title (for certain post types) */}
                  {['question', 'assignment', 'event'].includes(postType) && (
                    <input
                      type="text"
                      placeholder="Title..."
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      className="w-full p-2 border rounded-md bg-background"
                    />
                  )}

                  {/* Content */}
                  <Textarea
                    placeholder="What's on your mind? Share your thoughts, ask questions, or help a fellow student..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />

                  {/* Tags */}
                  <input
                    type="text"
                    placeholder="Tags (comma-separated, e.g., math, homework, help)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full p-2 border rounded-md bg-background text-sm"
                  />

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Image className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button 
                      onClick={handleCreatePost}
                      disabled={!newPostContent.trim() || isCreatingPost}
                      className="min-w-20"
                    >
                      {isCreatingPost ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Post'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Feed Filter */}
              <Tabs value={feedFilter} onValueChange={setFeedFilter}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="following">Following</TabsTrigger>
                  <TabsTrigger value="communities">Communities</TabsTrigger>
                  <TabsTrigger value="public">Public</TabsTrigger>
                </TabsList>

                <TabsContent value={feedFilter} className="mt-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                      <p className="text-muted-foreground">Loading posts...</p>
                    </div>
                  ) : filteredPosts.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <h3 className="font-semibold mb-2">No posts yet</h3>
                        <p className="text-muted-foreground">
                          Be the first to share something with the community!
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {filteredPosts.map(post => (
                        <PostCard key={post.id} post={post} showCommunity />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right Sidebar - Communities & Suggestions */}
          <div className="lg:col-span-3">
            <div className="space-y-4 sticky top-6">
              
              {/* Communities */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Communities
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {communities.slice(0, 8).map(community => (
                        <div key={community.id} className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1 min-w-0">
                            {community.icon_url && (
                              <img 
                                src={community.icon_url} 
                                alt=""
                                className="h-8 w-8 rounded"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">
                                {community.display_name}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {community.member_count} members
                              </p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant={community.user_membership ? "secondary" : "outline"}
                            onClick={() => toggleCommunityMembership(community.id)}
                          >
                            {community.user_membership ? 'Joined' : 'Join'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Hash className="h-4 w-4 mr-2" />
                    Explore Tags
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Find People
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Community
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}