import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
}

interface UseGoogleCalendarReturn {
  isConnected: boolean;
  isLoading: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  syncEvents: () => Promise<GoogleCalendarEvent[]>;
  createEvent: (event: Partial<GoogleCalendarEvent>) => Promise<GoogleCalendarEvent>;
}

export const useGoogleCalendar = (): UseGoogleCalendarReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{clientId: string, apiKey: string} | null>(null);
  const { toast } = useToast();

  // Load Google credentials from edge function
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('google-credentials');
        if (error) throw error;
        setCredentials(data);
      } catch (error) {
        console.error('Failed to load Google credentials:', error);
      }
    };
    loadCredentials();
  }, []);

  const initializeGapi = useCallback(async () => {
    if (typeof window === 'undefined' || !window.gapi || !credentials) {
      throw new Error('Google API not loaded or credentials not available');
    }

    await new Promise<void>((resolve) => {
      window.gapi.load('client', resolve);
    });

    await window.gapi.client.init({
      apiKey: credentials.apiKey,
      discoveryDocs: [
        'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
        'https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest'
      ],
    });
  }, [credentials]);

  const connect = useCallback(async () => {
    if (!credentials) {
      toast({
        title: "Configuration Error",
        description: "Google API credentials not loaded. Please check your setup.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await initializeGapi();
      
      // Use the new Google Identity Services
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: credentials.clientId,
        scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/tasks',
        callback: (response: any) => {
          if (response.access_token) {
            setAccessToken(response.access_token);
            setIsConnected(true);
            toast({
              title: "Google Services Connected!",
              description: "Calendar and Tasks will now sync automatically.",
            });
          }
          setIsLoading(false);
        },
      });

      tokenClient.requestAccessToken();
    } catch (error) {
      console.error('Failed to connect to Google Calendar:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Google Calendar. Please check your API configuration.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [initializeGapi, credentials, toast]);

  const disconnect = useCallback(() => {
    if (accessToken && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(accessToken);
    }
    setAccessToken(null);
    setIsConnected(false);
    toast({
      title: "Google Services Disconnected", 
      description: "Calendar and Tasks have been disconnected from ClassMate.",
    });
  }, [accessToken, toast]);

  const syncEvents = useCallback(async (): Promise<GoogleCalendarEvent[]> => {
    if (!isConnected || !accessToken) {
      throw new Error('Not connected to Google Calendar');
    }

    try {
      // Set the access token for API requests
      window.gapi.client.setToken({ access_token: accessToken });
      
      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 50,
        singleEvents: true,
        orderBy: 'startTime'
      });

      return response.result.items || [];
    } catch (error) {
      console.error('Failed to sync events:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync calendar events.",
        variant: "destructive",
      });
      throw error;
    }
  }, [isConnected, accessToken, toast]);

  const createEvent = useCallback(async (event: Partial<GoogleCalendarEvent>): Promise<GoogleCalendarEvent> => {
    if (!isConnected || !accessToken) {
      throw new Error('Not connected to Google Calendar');
    }

    try {
      // Set the access token for API requests
      window.gapi.client.setToken({ access_token: accessToken });
      
      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });

      toast({
        title: "Event Created",
        description: `Event "${event.summary}" has been added to your Google Calendar.`,
      });

      return response.result;
    } catch (error) {
      console.error('Failed to create event:', error);
      toast({
        title: "Event Creation Failed",
        description: "Failed to create event in Google Calendar.",
        variant: "destructive",
      });
      throw error;
    }
  }, [isConnected, accessToken, toast]);

  return {
    isConnected,
    isLoading,
    connect,
    disconnect,
    syncEvents,
    createEvent
  };
};

// Add Google API types
declare global {
  interface Window {
    gapi: {
      load: (api: string, callback: () => void) => void;
      client: {
        init: (config: {
          apiKey: string;
          discoveryDocs: string[];
        }) => Promise<void>;
        setToken: (token: { access_token: string }) => void;
        calendar: {
          events: {
            list: (params: {
              calendarId: string;
              timeMin: string;
              maxResults: number;
              singleEvents: boolean;
              orderBy: string;
            }) => Promise<{ result: { items: GoogleCalendarEvent[] } }>;
            insert: (params: {
              calendarId: string;
              resource: Partial<GoogleCalendarEvent>;
            }) => Promise<{ result: GoogleCalendarEvent }>;
          };
        };
        tasks: {
          tasklists: {
            list: () => Promise<{ result: { items: any[] } }>;
          };
          tasks: {
            list: (params: {
              tasklist: string;
              showCompleted?: boolean;
              showDeleted?: boolean;
              showHidden?: boolean;
            }) => Promise<{ result: { items: any[] } }>;
            insert: (params: {
              tasklist: string;
              resource: any;
            }) => Promise<{ result: any }>;
            update: (params: {
              tasklist: string;
              task: string;
              resource: any;
            }) => Promise<{ result: any }>;
            delete: (params: {
              tasklist: string;
              task: string;
            }) => Promise<void>;
          };
        };
      };
    };
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: any) => void;
          }) => {
            requestAccessToken: () => void;
          };
          revoke: (accessToken: string) => void;
        };
      };
    };
  }
}