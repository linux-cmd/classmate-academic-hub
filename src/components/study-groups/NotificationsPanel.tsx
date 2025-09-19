import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  CheckCheck, 
  FileText, 
  CheckSquare, 
  Calendar, 
  Users,
  Trash2
} from "lucide-react";
import { useGroupNotifications } from "@/hooks/useGroupNotifications";
import { format, formatDistanceToNow } from "date-fns";

export function NotificationsPanel() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useGroupNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'file_uploaded': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'task_assigned': 
      case 'task_completed': return <CheckSquare className="w-4 h-4 text-green-500" />;
      case 'event_created': return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'member_joined': 
      case 'member_left': return <Users className="w-4 h-4 text-orange-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string, read: boolean) => {
    if (read) return "border-l-gray-200";
    
    switch (type) {
      case 'file_uploaded': return "border-l-blue-500 bg-blue-50/30";
      case 'task_assigned': 
      case 'task_completed': return "border-l-green-500 bg-green-50/30";
      case 'event_created': return "border-l-purple-500 bg-purple-50/30";
      case 'member_joined': 
      case 'member_left': return "border-l-orange-500 bg-orange-50/30";
      default: return "border-l-gray-500 bg-gray-50/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="bg-primary text-primary-foreground">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Stay updated with group activities and events
            </CardDescription>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </CardHeader>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            {notifications.length > 0 ? (
              <div className="divide-y">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 transition-colors hover:bg-muted/50 ${
                      getNotificationColor(notification.type, notification.read)
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className={`font-medium text-sm ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                          {notification.message && (
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </span>
                            <span>
                              {format(new Date(notification.created_at), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-8 px-2 text-xs"
                          >
                            Mark Read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">No notifications yet</h3>
                <p className="text-muted-foreground">
                  You'll see updates about group activities here
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Notification Types Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notification Types</CardTitle>
          <CardDescription>
            Here's what you'll be notified about
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <FileText className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium text-sm">File Uploads</p>
                <p className="text-xs text-muted-foreground">When new files are shared</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <CheckSquare className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-sm">Tasks</p>
                <p className="text-xs text-muted-foreground">Task assignments & completions</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <Calendar className="w-5 h-5 text-purple-500" />
              <div>
                <p className="font-medium text-sm">Events</p>
                <p className="text-xs text-muted-foreground">New events & reminders</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <Users className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-medium text-sm">Members</p>
                <p className="text-xs text-muted-foreground">Member joins & leaves</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}