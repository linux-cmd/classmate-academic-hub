import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import type { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

export type GroupEvent = Tables<"group_events">;
export type EventRsvp = Tables<"group_event_rsvps">;

export const useGroupEvents = (groupId: string | null) => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<GroupEvent[]>([]);
  const [rsvps, setRsvps] = useState<Record<string, EventRsvp>>({});
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    if (!groupId) {
      setEvents([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("group_events")
        .select("*")
        .eq("group_id", groupId)
        .order("start_time", { ascending: true });

      if (error) throw error;
      setEvents(data || []);

      // Fetch user's RSVPs
      if (user) {
        const eventIds = (data || []).map(e => e.id);
        if (eventIds.length > 0) {
          const { data: rsvpData, error: rsvpError } = await supabase
            .from("group_event_rsvps")
            .select("*")
            .in("event_id", eventIds)
            .eq("user_id", user.id);

          if (!rsvpError && rsvpData) {
            const rsvpMap: Record<string, EventRsvp> = {};
            rsvpData.forEach(rsvp => {
              rsvpMap[rsvp.event_id as string] = rsvp;
            });
            setRsvps(rsvpMap);
          }
        }
      }
    } catch (e: any) {
      console.error("Failed to fetch events", e);
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [groupId, user, toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Real-time subscription
  useEffect(() => {
    if (!groupId) return;

    const channel = supabase
      .channel(`group-events-${groupId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'group_events', filter: `group_id=eq.${groupId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setEvents(prev => [...prev, payload.new as GroupEvent].sort((a, b) => 
              new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
            ));
          } else if (payload.eventType === 'UPDATE') {
            setEvents(prev => prev.map(event => 
              event.id === payload.new.id ? payload.new as GroupEvent : event
            ));
          } else if (payload.eventType === 'DELETE') {
            setEvents(prev => prev.filter(event => event.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  const createEvent = useCallback(async (eventData: Omit<GroupEvent, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user || !groupId) return;

    try {
      const { error } = await supabase.from("group_events").insert({
        ...eventData,
        group_id: groupId,
        created_by: user.id,
      });

      if (error) throw error;
      toast({ title: "Success", description: "Event created successfully" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }, [user, groupId, toast]);

  const updateEvent = useCallback(async (eventId: string, updates: Partial<GroupEvent>) => {
    try {
      const { error } = await supabase
        .from("group_events")
        .update(updates)
        .eq("id", eventId);

      if (error) throw error;
      toast({ title: "Success", description: "Event updated successfully" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }, [toast]);

  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      const { error } = await supabase
        .from("group_events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;
      toast({ title: "Success", description: "Event deleted successfully" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }, [toast]);

  const updateRsvp = useCallback(async (eventId: string, status: 'yes' | 'no' | 'maybe') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("group_event_rsvps")
        .upsert({
          event_id: eventId,
          user_id: user.id,
          status,
        });

      if (error) throw error;

      // Update local state
      setRsvps(prev => ({
        ...prev,
        [eventId]: { event_id: eventId, user_id: user.id, status, id: '', created_at: '' } as EventRsvp
      }));

      toast({ title: "Success", description: "RSVP updated successfully" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }, [user, toast]);

  return {
    events,
    rsvps,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    updateRsvp,
    refresh: fetchEvents,
  };
};