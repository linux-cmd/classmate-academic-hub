import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GoogleCalendar {
  id: string;
  gcal_id: string;
  summary: string;
  time_zone: string;
  selected: boolean;
}

interface NormalizedEvent {
  id?: string;
  title: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
  allDay?: boolean;
}

export const useGoogleCalendarIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [calendars, setCalendars] = useState<GoogleCalendar[]>([]);
  const { toast } = useToast();

  const checkStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsConnected(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('google-status', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setIsConnected(data.connected);
      if (data.calendars) {
        setCalendars(data.calendars);
      }
    } catch (error) {
      console.error('Error checking Google status:', error);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const connect = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to connect Google Calendar',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('google-connect', {
        body: { action: 'start' },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      }
    } catch (error) {
      console.error('Error connecting Google Calendar:', error);
      toast({
        title: 'Connection failed',
        description: 'Failed to connect to Google Calendar',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.functions.invoke('google-disconnect', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setIsConnected(false);
      setCalendars([]);
      toast({
        title: 'Disconnected',
        description: 'Google Calendar disconnected successfully',
      });
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
      toast({
        title: 'Disconnect failed',
        description: 'Failed to disconnect from Google Calendar',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCallback = async (code: string, state: string) => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('google-connect', {
        body: { action: 'callback', code, state },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.connected) {
        setIsConnected(true);
        await checkStatus();
        toast({
          title: 'Connected',
          description: 'Google Calendar connected successfully',
        });
      }
    } catch (error) {
      console.error('Error handling callback:', error);
      toast({
        title: 'Connection failed',
        description: 'Failed to complete Google Calendar connection',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCalendar = async (gcalId: string, selected: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.functions.invoke('google-calendars', {
        method: 'PATCH',
        body: { gcal_id: gcalId, selected },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setCalendars(prev =>
        prev.map(cal =>
          cal.gcal_id === gcalId ? { ...cal, selected } : cal
        )
      );
    } catch (error) {
      console.error('Error toggling calendar:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update calendar selection',
        variant: 'destructive',
      });
    }
  };

  const fetchEvents = async (gcalId: string, timeMin: string, timeMax: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase.functions.invoke('google-events', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      return data.events || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  };

  const createEvent = async (gcalId: string, event: NormalizedEvent) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase.functions.invoke('google-events', {
        method: 'POST',
        body: { gcal_id: gcalId, event },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: 'Event created',
        description: 'Event added to Google Calendar',
      });

      return data.event;
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Creation failed',
        description: 'Failed to create event',
        variant: 'destructive',
      });
      return null;
    }
  };

  const syncCalendar = async (gcalId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('google-sync', {
        body: { gcal_id: gcalId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: 'Synced',
        description: `Synced ${data.events_count} events`,
      });
    } catch (error) {
      console.error('Error syncing calendar:', error);
      toast({
        title: 'Sync failed',
        description: 'Failed to sync calendar',
        variant: 'destructive',
      });
    }
  };

  return {
    isConnected,
    isLoading,
    calendars,
    connect,
    disconnect,
    handleCallback,
    toggleCalendar,
    fetchEvents,
    createEvent,
    syncCalendar,
    checkStatus,
  };
};
