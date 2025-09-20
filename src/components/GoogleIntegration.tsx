import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, CheckSquare, Loader2, ExternalLink } from 'lucide-react';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { useGoogleTasks } from '@/hooks/useGoogleTasks';

interface GoogleIntegrationProps {
  onSync?: () => void;
}

export const GoogleIntegration: React.FC<GoogleIntegrationProps> = ({ onSync }) => {
  const [showCalendarEvents, setShowCalendarEvents] = useState(true);
  const [showTasks, setShowTasks] = useState(true);
  
  const { 
    isConnected: calendarConnected, 
    isLoading: calendarLoading, 
    connect: connectCalendar, 
    disconnect: disconnectCalendar,
    syncEvents 
  } = useGoogleCalendar();
  
  const { 
    isConnected: tasksConnected, 
    isLoading: tasksLoading, 
    connect: connectTasks, 
    disconnect: disconnectTasks,
    getTaskLists,
    getTasks 
  } = useGoogleTasks();

  const handleConnectAll = async () => {
    try {
      await connectCalendar();
      await connectTasks();
    } catch (error) {
      console.error('Failed to connect to Google services:', error);
    }
  };

  const handleDisconnectAll = () => {
    disconnectCalendar();
    disconnectTasks();
  };

  const handleSyncAll = async () => {
    try {
      if (calendarConnected) {
        await syncEvents();
      }
      if (tasksConnected) {
        const taskLists = await getTaskLists();
        // Sync first task list as example
        if (taskLists.length > 0) {
          await getTasks(taskLists[0].id);
        }
      }
      onSync?.();
    } catch (error) {
      console.error('Failed to sync:', error);
    }
  };

  const isConnected = calendarConnected || tasksConnected;
  const isLoading = calendarLoading || tasksLoading;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Google Integration
            </CardTitle>
            <CardDescription>
              Connect your Google Calendar and Tasks
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {calendarConnected && (
              <Badge variant="secondary" className="gap-1">
                <Calendar className="h-3 w-3" />
                Calendar
              </Badge>
            )}
            {tasksConnected && (
              <Badge variant="secondary" className="gap-1">
                <CheckSquare className="h-3 w-3" />
                Tasks
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Connection Status
            </p>
            <p className="text-sm text-muted-foreground">
              {isConnected ? 'Connected to Google services' : 'Not connected'}
            </p>
          </div>
          <div className="flex gap-2">
            {!isConnected ? (
              <Button 
                onClick={handleConnectAll} 
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Calendar className="h-4 w-4" />
                    <CheckSquare className="h-4 w-4" />
                  </>
                )}
                Connect Google Services
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleSyncAll} 
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Sync All
                </Button>
                <Button 
                  onClick={handleDisconnectAll} 
                  variant="outline" 
                  size="sm"
                >
                  Disconnect
                </Button>
              </>
            )}
          </div>
        </div>

        {isConnected && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Display Options</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-calendar" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Show Google Calendar events
                  </Label>
                  <Switch
                    id="show-calendar"
                    checked={showCalendarEvents}
                    onCheckedChange={setShowCalendarEvents}
                    disabled={!calendarConnected}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-tasks" className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Show Google Tasks
                  </Label>
                  <Switch
                    id="show-tasks"
                    checked={showTasks}
                    onCheckedChange={setShowTasks}
                    disabled={!tasksConnected}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {!isConnected && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Setup Instructions</h4>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>To connect Google services, you'll need to:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Set up Google API credentials</li>
                  <li>Enable Calendar and Tasks APIs</li>
                  <li>Configure OAuth consent screen</li>
                  <li>Add your domain to authorized origins</li>
                </ol>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href="https://console.cloud.google.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Google Cloud Console
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {isConnected && (
          <div className="rounded-lg border p-3 bg-muted/50">
            <p className="text-sm text-muted-foreground">
              ✅ Google integration is active. Your calendar events and tasks will sync automatically.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};