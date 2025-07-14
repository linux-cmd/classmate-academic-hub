import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar, Settings, RefreshCw, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CalendarIntegrationProps {
  onSyncCalendar?: () => void;
}

const CalendarIntegration = ({ onSyncCalendar }: CalendarIntegrationProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showLocalEvents, setShowLocalEvents] = useState(true);
  const [showGoogleEvents, setShowGoogleEvents] = useState(true);
  const { toast } = useToast();

  const handleGoogleConnect = async () => {
    setIsSyncing(true);
    
    // Simulate connection process
    setTimeout(() => {
      setIsConnected(true);
      setIsSyncing(false);
      toast({
        title: "Google Calendar Connected!",
        description: "Your calendar events will now sync automatically.",
      });
      onSyncCalendar?.();
    }, 2000);
  };

  const handleSync = async () => {
    if (!isConnected) {
      toast({
        title: "Not Connected",
        description: "Please connect your Google Calendar first.",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    
    // Simulate sync
    setTimeout(() => {
      setIsSyncing(false);
      toast({
        title: "Calendar Synced",
        description: "Your events have been updated successfully.",
      });
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    toast({
      title: "Calendar Disconnected",
      description: "Google Calendar has been disconnected from ClassMate.",
    });
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-primary" />
          <span>Calendar Integration</span>
        </CardTitle>
        <Badge variant={isConnected ? "success" : "secondary"}>
          {isConnected ? "Connected" : "Not Connected"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-success' : 'bg-muted'}`} />
            <div>
              <p className="font-medium">Google Calendar</p>
              <p className="text-sm text-muted-foreground">
                {isConnected ? "Syncing events automatically" : "Ready to connect"}
              </p>
            </div>
          </div>
          
          {!isConnected ? (
            <Button onClick={handleGoogleConnect} disabled={isSyncing}>
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Connect
                </>
              )}
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleSync} disabled={isSyncing}>
                {isSyncing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
              <Button variant="outline" onClick={handleDisconnect}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Event Filters */}
        <div className="space-y-3">
          <h4 className="font-medium">Event Filters</h4>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="local-events" className="flex items-center space-x-2">
              <span>Show Local Events</span>
            </Label>
            <Switch
              id="local-events"
              checked={showLocalEvents}
              onCheckedChange={setShowLocalEvents}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="google-events" className="flex items-center space-x-2">
              <span>Show Google Calendar Events</span>
            </Label>
            <Switch
              id="google-events"
              checked={showGoogleEvents}
              onCheckedChange={setShowGoogleEvents}
              disabled={!isConnected}
            />
          </div>
        </div>

        {/* API Setup Instructions */}
        {!isConnected && (
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Setup Instructions</h4>
            <p className="text-sm text-muted-foreground mb-2">
              To connect Google Calendar, you'll need to:
            </p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Create a Google Cloud Console project</li>
              <li>Enable the Google Calendar API</li>
              <li>Configure OAuth2 credentials</li>
              <li>Add your credentials to the app</li>
            </ol>
            <p className="text-sm text-muted-foreground mt-2">
              The calendar structure is ready for your API integration!
            </p>
          </div>
        )}

        {/* Sync Status */}
        {isConnected && (
          <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
            <p className="text-sm text-success-foreground">
              ✓ Calendar integration is active. Events will sync automatically every 15 minutes.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalendarIntegration;