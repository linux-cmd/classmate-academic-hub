import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const initializeGapi = useCallback(async () => {
    if (typeof window === 'undefined' || !window.gapi) {
      throw new Error('Google API not loaded');
    }

    await new Promise<void>((resolve) => {
      window.gapi.load('client:auth2', resolve);
    });

    await window.gapi.client.init({
      apiKey: process.env.VITE_GOOGLE_API_KEY || '',
      clientId: process.env.VITE_GOOGLE_CLIENT_ID || '',
      discoveryDocs: [
        'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
        'https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest'
      ],
      scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/tasks'
    });
  }, []);

  const connect = useCallback(async () => {
    setIsLoading(true);
    try {
      await initializeGapi();
      
      const authInstance = window.gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      
      if (user.isSignedIn()) {
        setIsConnected(true);
        toast({
          title: "Google Services Connected!",
          description: "Calendar and Tasks will now sync automatically.",
        });
      }
    } catch (error) {
      console.error('Failed to connect to Google Calendar:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Google Calendar. Please check your API configuration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [initializeGapi, toast]);

  const disconnect = useCallback(() => {
    if (window.gapi?.auth2) {
      const authInstance = window.gapi.auth2.getAuthInstance();
      authInstance.signOut();
    }
    setIsConnected(false);
    toast({
      title: "Google Services Disconnected", 
      description: "Calendar and Tasks have been disconnected from ClassMate.",
    });
  }, [toast]);

  const syncEvents = useCallback(async (): Promise<GoogleCalendarEvent[]> => {
    if (!isConnected) {
      throw new Error('Not connected to Google Calendar');
    }

    try {
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
  }, [isConnected, toast]);

  const createEvent = useCallback(async (event: Partial<GoogleCalendarEvent>): Promise<GoogleCalendarEvent> => {
    if (!isConnected) {
      throw new Error('Not connected to Google Calendar');
    }

    try {
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
  }, [isConnected, toast]);

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
          clientId: string;
          discoveryDocs: string[];
          scope: string;
        }) => Promise<void>;
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
      auth2: {
        getAuthInstance: () => {
          signIn: () => Promise<{ isSignedIn: () => boolean }>;
          signOut: () => void;
        };
      };
    };
  }
}