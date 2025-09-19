import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  CheckSquare, 
  Calendar, 
  FileText, 
  Users, 
  Settings,
  Plus,
  Bell,
  Clock,
  MapPin
} from "lucide-react";
import { GroupChat } from "./GroupChat";
import { TaskManager } from "./TaskManager";
import { FileManager } from "./FileManager";
import { EventCalendar } from "./EventCalendar";
import { MembersList } from "./MembersList";
import { GroupSettings } from "./GroupSettings";
import { NotificationsPanel } from "./NotificationsPanel";
import type { StudyGroup } from "@/hooks/useStudyGroups";
import { useGroupNotifications } from "@/hooks/useGroupNotifications";

interface GroupDashboardProps {
  group: StudyGroup;
  isMember: boolean;
  isAdmin: boolean;
}

export function GroupDashboard({ group, isMember, isAdmin }: GroupDashboardProps) {
  const [activeTab, setActiveTab] = useState("chat");
  const { unreadCount } = useGroupNotifications();

  if (!isMember) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Join to access group features</h2>
            <p className="text-muted-foreground mb-4">
              You need to be a member to access tasks, files, events, and chat.
            </p>
            <p className="text-sm text-muted-foreground">
              This group is {group.is_public ? 'public' : 'private'}. Use the sidebar to join or request access.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Group Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                {group.image_url ? (
                  <AvatarImage src={group.image_url} alt={group.name} />
                ) : (
                  <AvatarFallback className="text-lg">
                    {group.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{group.name}</CardTitle>
                <CardDescription className="text-base">
                  {group.subject} • {group.description}
                </CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={group.is_public ? "secondary" : "outline"}>
                    {group.is_public ? "Public" : "Private"}
                  </Badge>
                  {isAdmin && (
                    <Badge variant="default">Admin</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("notifications")}
                className="relative"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              {isAdmin && (
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Files
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <Badge className="h-5 w-5 p-0 text-xs">{unreadCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-4">
          <GroupChat group={group} isMember={isMember} />
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <TaskManager groupId={group.id} isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="files" className="mt-4">
          <FileManager groupId={group.id} />
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <EventCalendar groupId={group.id} isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <MembersList groupId={group.id} isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <NotificationsPanel />
        </TabsContent>

        {isAdmin && activeTab === "settings" && (
          <TabsContent value="settings" className="mt-4">
            <GroupSettings group={group} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}