import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, Plus } from "lucide-react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: string | null;
  start_time: string;
  end_time: string | null;
  location: string | null;
}

const NotionSchedule = () => {
  const { user } = useSupabaseAuth();
  const [todayEvents, setTodayEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodayEvents = async () => {
    if (!user) return;

    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setTodayEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayEvents();
  }, [user]);

  const getTypeColor = (type: string | null) => {
    switch (type) {
      case "exam": return "destructive";
      case "quiz": return "warning";
      case "class": return "info";
      case "study_session": return "success";
      default: return "secondary";
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTimeRange = (start: string, end: string | null) => {
    const startTime = formatTime(start);
    if (!end) return startTime;
    const endTime = formatTime(end);
    return `${startTime} - ${endTime}`;
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Calendar className="h-5 w-5" />
            Today's Schedule
          </CardTitle>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Event
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {todayEvents.length === 0 ? (
          <div className="py-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-2">No events scheduled for today</p>
            <p className="text-sm text-muted-foreground">Add events to keep track of your schedule</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-8 bg-primary rounded-full opacity-60"></div>
                      <div>
                        <h4 className="font-medium text-foreground">{event.title}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTimeRange(event.start_time, event.end_time)}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground ml-5 mb-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <Badge variant={getTypeColor(event.event_type) as any} className="text-xs ml-4">
                    {event.event_type?.replace('_', ' ') || 'event'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {todayEvents.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
              View Full Calendar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotionSchedule;