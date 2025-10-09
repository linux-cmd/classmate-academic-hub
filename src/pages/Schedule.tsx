import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, MapPin, Users, ChevronLeft, ChevronRight, Plus, Link, RefreshCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { toast } from "@/hooks/use-toast";
import { useGoogleCalendarIntegration } from "@/hooks/useGoogleCalendarIntegration";

interface ScheduleEvent {
  id: string;
  title: string;
  start_time: string;
  end_time?: string | null;
  location: string | null;
  event_type: 'class' | 'study' | 'event' | 'meeting';
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

const Schedule = () => {
  const { user } = useSupabaseAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showLocalEvents, setShowLocalEvents] = useState(true);
  const [newEvent, setNewEvent] = useState({
    title: '',
    start_time: '',
    end_time: '',
    location: '',
    event_type: 'class' as 'class' | 'study' | 'event' | 'meeting',
    description: ''
  });

  const {
    isConnected: isGoogleConnected,
    isLoading: isGoogleLoading,
    calendars: googleCalendars,
    connect: connectGoogle,
    disconnect: disconnectGoogle,
    toggleCalendar,
    handleCallback,
    syncCalendar,
  } = useGoogleCalendarIntegration();

  useEffect(() => {
    if (user) {
      fetchEvents();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      handleCallback(code, state);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [handleCallback]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents((data || []) as ScheduleEvent[]);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async () => {
    if (!user || !newEvent.title.trim()) return;

    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          user_id: user.id,
          title: newEvent.title,
          start_time: newEvent.start_time,
          end_time: newEvent.end_time || null,
          location: newEvent.location,
          event_type: newEvent.event_type,
          description: newEvent.description
        })
        .select()
        .single();

      if (error) throw error;

      setEvents(prev => [...prev, data as ScheduleEvent].sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      ));
      
      setNewEvent({
        title: '',
        start_time: '',
        end_time: '',
        location: '',
        event_type: 'class',
        description: ''
      });
      setShowAddDialog(false);
      
      toast({
        title: "Success",
        description: "Event created successfully"
      });
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive"
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'class': return 'primary';
      case 'study': return 'secondary';
      case 'event': return 'destructive';
      case 'meeting': return 'outline';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'class': return Calendar;
      case 'study': return Users;
      case 'event': return MapPin;
      case 'meeting': return Clock;
      default: return Calendar;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const todaysEvents = events.filter(event => {
    const eventDate = new Date(event.start_time);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-subtle pt-16 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to access schedule</h2>
          <p className="text-muted-foreground">You need to be authenticated to manage your schedule.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pt-16">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Schedule</h1>
            <p className="text-muted-foreground">Manage your academic calendar and events</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Event</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Event title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Start Time</label>
                      <Input
                        type="datetime-local"
                        value={newEvent.start_time}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, start_time: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">End Time</label>
                      <Input
                        type="datetime-local"
                        value={newEvent.end_time}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, end_time: e.target.value }))}
                      />
                    </div>
                  </div>
                  <Input
                    placeholder="Location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                  />
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={newEvent.event_type}
                    onChange={(e) => setNewEvent(prev => ({ 
                      ...prev, 
                      event_type: e.target.value as 'class' | 'study' | 'event' | 'meeting' 
                    }))}
                  >
                    <option value="class">Class</option>
                    <option value="study">Study Session</option>
                    <option value="event">Event</option>
                    <option value="meeting">Meeting</option>
                  </select>
                  <Textarea
                    placeholder="Description (optional)"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createEvent} disabled={!newEvent.title.trim()}>
                      Add Event
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button
              variant={viewMode === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('day')}
            >
              Day
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              Week
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('month')}
            >
              Month
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Schedule View */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date Navigation */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateDate('prev')}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <div className="text-center">
                    <h2 className="text-xl font-semibold">{formatDate(currentDate)}</h2>
                    <p className="text-sm text-muted-foreground capitalize">{viewMode} view</p>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateDate('next')}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Events List */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>Today's Schedule ({todaysEvents.length} events)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Loading events...</p>
                  </div>
                ) : todaysEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No events scheduled for today</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setShowAddDialog(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Event
                    </Button>
                  </div>
                ) : (
                  todaysEvents.map((event) => {
                    const IconComponent = getTypeIcon(event.event_type);
                    
                    return (
                      <div
                        key={event.id}
                        className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-primary" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{event.title}</h4>
                            <Badge variant={getTypeColor(event.event_type) as any}>
                              {event.event_type}
                            </Badge>
                          </div>
                          
                          {event.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {event.description}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>
                                {formatTime(event.start_time)}
                                {event.end_time && ` - ${formatTime(event.end_time)}`}
                              </span>
                            </div>
                            
                            {event.location && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Calendar Integration */}
          <div className="space-y-6">
            {/* Google Calendar Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Google Calendar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isGoogleConnected ? (
                  <div className="text-center space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Connect your Google Calendar to sync events
                    </p>
                    <Button 
                      onClick={connectGoogle} 
                      disabled={isGoogleLoading}
                      className="w-full"
                    >
                      {isGoogleLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Link className="w-4 h-4 mr-2" />
                          Connect Google Calendar
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm font-medium">Connected</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={disconnectGoogle}
                        disabled={isGoogleLoading}
                      >
                        Disconnect
                      </Button>
                    </div>

                    <Separator />

                    {/* Calendar Filters */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Event Sources</Label>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="local-events" className="text-sm cursor-pointer">
                          Local Events
                        </Label>
                        <Switch
                          id="local-events"
                          checked={showLocalEvents}
                          onCheckedChange={setShowLocalEvents}
                        />
                      </div>

                      {googleCalendars.map((cal) => (
                        <div key={cal.id} className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <Label 
                              htmlFor={`cal-${cal.gcal_id}`}
                              className="text-sm cursor-pointer truncate block"
                            >
                              {cal.summary}
                            </Label>
                          </div>
                          <Switch
                            id={`cal-${cal.gcal_id}`}
                            checked={cal.selected}
                            onCheckedChange={(checked) =>
                              toggleCalendar(cal.gcal_id, checked)
                            }
                          />
                        </div>
                      ))}
                    </div>

                    {googleCalendars.length > 0 && (
                      <>
                        <Separator />
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            googleCalendars.forEach(cal => {
                              if (cal.selected) syncCalendar(cal.gcal_id);
                            });
                          }}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Sync All Calendars
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Event Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Events</span>
                  <Badge variant="outline">{events.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Today</span>
                  <Badge variant="default">{todaysEvents.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">This Week</span>
                  <Badge variant="secondary">
                    {events.filter(event => {
                      const eventDate = new Date(event.start_time);
                      const today = new Date();
                      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                      return eventDate >= today && eventDate <= weekFromNow;
                    }).length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;