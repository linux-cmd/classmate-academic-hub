import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar, Settings, RefreshCw, Link as LinkIcon, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";

interface CalendarIntegrationProps {
  onSyncCalendar?: () => void;
}

const CalendarIntegration = ({ onSyncCalendar }: CalendarIntegrationProps) => {
  const [showLocalEvents, setShowLocalEvents] = useState(true);
  const [showGoogleEvents, setShowGoogleEvents] = useState(true);
  const { isConnected, isLoading, connect, disconnect, syncEvents } = useGoogleCalendar();

  // Load Google API script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleSync = async () => {
    if (!isConnected) return;
    
    try {
      const events = await syncEvents();
      console.log('Synced events:', events);
      onSyncCalendar?.();
    } catch (error) {
      console.error('Sync failed:', error);
    }
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
            <Button onClick={connect} disabled={isLoading}>
              {isLoading ? (
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
              <Button variant="outline" onClick={handleSync} disabled={isLoading}>
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
              <Button variant="outline" onClick={disconnect}>
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
          <div className="p-3 bg-muted rounded-lg space-y-3">
            <h4 className="font-medium mb-2">API Setup Instructions</h4>
            <p className="text-sm text-muted-foreground mb-2">
              To connect Google Calendar, you'll need to set up your API credentials:
            </p>
            
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => window.open('https://console.cloud.google.com/', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                1. Open Google Cloud Console
              </Button>
              
              <div className="text-sm text-muted-foreground pl-6">
                Create a new project or select an existing one
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => window.open('https://console.cloud.google.com/apis/library/calendar-json.googleapis.com', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                2. Enable Google Calendar API
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => window.open('https://console.cloud.google.com/apis/credentials', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                3. Create OAuth2 Credentials
              </Button>
              
              <div className="text-sm text-muted-foreground pl-6">
                Add your domain to authorized origins and redirect URIs
              </div>
            </div>
            
            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>Need the API keys?</strong> Set VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_API_KEY in your environment variables.
              </p>
            </div>
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