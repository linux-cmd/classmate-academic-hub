import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users,
  Edit,
  Trash2,
  Check,
  X
} from "lucide-react";
import { useGroupEvents } from "@/hooks/useGroupEvents";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { format, isToday, isFuture, isPast } from "date-fns";

interface EventCalendarProps {
  groupId: string;
  isAdmin: boolean;
}

export function EventCalendar({ groupId, isAdmin }: EventCalendarProps) {
  const { user } = useSupabaseAuth();
  const { events, rsvps, loading, createEvent, updateEvent, deleteEvent, updateRsvp } = useGroupEvents(groupId);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list");

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    location: ""
  });

  const handleCreateEvent = async () => {
    await createEvent({
      title: newEvent.title,
      description: newEvent.description,
      start_time: new Date(newEvent.start_time).toISOString(),
      end_time: newEvent.end_time ? new Date(newEvent.end_time).toISOString() : null,
      location: newEvent.location,
      group_id: groupId,
      created_by: user?.id || ""
    });

    setNewEvent({
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      location: ""
    });
    setIsCreateDialogOpen(false);
  };

  const handleRsvp = (eventId: string, status: 'yes' | 'no' | 'maybe') => {
    updateRsvp(eventId, status);
  };

  const getEventStatus = (event: any) => {
    const now = new Date();
    const startTime = new Date(event.start_time);
    const endTime = event.end_time ? new Date(event.end_time) : null;

    if (endTime && isPast(endTime)) {
      return { status: 'past', label: 'Completed', color: 'bg-gray-100 text-gray-800' };
    }
    if (isToday(startTime)) {
      return { status: 'today', label: 'Today', color: 'bg-blue-100 text-blue-800' };
    }
    if (isFuture(startTime)) {
      return { status: 'upcoming', label: 'Upcoming', color: 'bg-green-100 text-green-800' };
    }
    return { status: 'ongoing', label: 'Ongoing', color: 'bg-yellow-100 text-yellow-800' };
  };

  const getRsvpStatus = (eventId: string) => {
    return rsvps[eventId]?.status || null;
  };

  const upcomingEvents = events.filter(event => isFuture(new Date(event.start_time)));
  const todayEvents = events.filter(event => isToday(new Date(event.start_time)));
  const pastEvents = events.filter(event => {
    const endTime = event.end_time ? new Date(event.end_time) : new Date(event.start_time);
    return isPast(endTime) && !isToday(new Date(event.start_time));
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Events & Calendar</CardTitle>
            <CardDescription>
              Schedule study sessions, meetings, and group activities
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-r-none"
              >
                List
              </Button>
              <Button
                variant={viewMode === "calendar" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("calendar")}
                className="rounded-l-none"
              >
                Calendar
              </Button>
            </div>
            {isAdmin && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="title">Event Title</Label>
                      <Input
                        id="title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Study session, project meeting, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="What's this event about?"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                          id="startTime"
                          type="datetime-local"
                          value={newEvent.start_time}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, start_time: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="endTime">End Time (Optional)</Label>
                        <Input
                          id="endTime"
                          type="datetime-local"
                          value={newEvent.end_time}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, end_time: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Library, Zoom link, classroom, etc."
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateEvent} disabled={!newEvent.title.trim() || !newEvent.start_time}>
                        Create Event
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
      </Card>

      {viewMode === "calendar" ? (
        /* Calendar View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
          <div className="lg:col-span-2 space-y-4">
            {selectedDate && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Events on {format(selectedDate, "MMMM d, yyyy")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {events
                    .filter(event => 
                      format(new Date(event.start_time), "yyyy-MM-dd") === 
                      format(selectedDate, "yyyy-MM-dd")
                    )
                    .map(event => {
                      const status = getEventStatus(event);
                      const userRsvp = getRsvpStatus(event.id);
                      
                      return (
                        <div key={event.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{event.title}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {format(new Date(event.start_time), "h:mm a")}
                                  {event.end_time && ` - ${format(new Date(event.end_time), "h:mm a")}`}
                                </div>
                                {event.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {event.location}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Badge className={status.color}>
                              {status.label}
                            </Badge>
                          </div>
                          
                          {event.description && (
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">RSVP:</span>
                              <div className="flex gap-1">
                                <Button
                                  variant={userRsvp === 'yes' ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleRsvp(event.id, 'yes')}
                                  className="h-7 px-2"
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant={userRsvp === 'maybe' ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleRsvp(event.id, 'maybe')}
                                  className="h-7 px-2"
                                >
                                  ?
                                </Button>
                                <Button
                                  variant={userRsvp === 'no' ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleRsvp(event.id, 'no')}
                                  className="h-7 px-2"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteEvent(event.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-6">
          {/* Today's Events */}
          {todayEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Today's Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {todayEvents.map(event => {
                  const userRsvp = getRsvpStatus(event.id);
                  return (
                    <div key={event.id} className="border rounded-lg p-4 space-y-3 bg-blue-50/50">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {format(new Date(event.start_time), "h:mm a")}
                              {event.end_time && ` - ${format(new Date(event.end_time), "h:mm a")}`}
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {event.location}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">Today</Badge>
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">RSVP:</span>
                          <div className="flex gap-1">
                            <Button
                              variant={userRsvp === 'yes' ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleRsvp(event.id, 'yes')}
                              className="h-7 px-2"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                            <Button
                              variant={userRsvp === 'maybe' ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleRsvp(event.id, 'maybe')}
                              className="h-7 px-2"
                            >
                              ?
                            </Button>
                            <Button
                              variant={userRsvp === 'no' ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleRsvp(event.id, 'no')}
                              className="h-7 px-2"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteEvent(event.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingEvents.map(event => {
                  const userRsvp = getRsvpStatus(event.id);
                  return (
                    <div key={event.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="w-4 h-4" />
                              {format(new Date(event.start_time), "MMM d, yyyy")}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {format(new Date(event.start_time), "h:mm a")}
                              {event.end_time && ` - ${format(new Date(event.end_time), "h:mm a")}`}
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {event.location}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Upcoming</Badge>
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">RSVP:</span>
                          <div className="flex gap-1">
                            <Button
                              variant={userRsvp === 'yes' ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleRsvp(event.id, 'yes')}
                              className="h-7 px-2"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                            <Button
                              variant={userRsvp === 'maybe' ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleRsvp(event.id, 'maybe')}
                              className="h-7 px-2"
                            >
                              ?
                            </Button>
                            <Button
                              variant={userRsvp === 'no' ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleRsvp(event.id, 'no')}
                              className="h-7 px-2"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteEvent(event.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Past Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pastEvents.slice(0, 5).map(event => (
                  <div key={event.id} className="border rounded-lg p-4 space-y-3 opacity-75">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            {format(new Date(event.start_time), "MMM d, yyyy")}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {format(new Date(event.start_time), "h:mm a")}
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-gray-100 text-gray-800">Completed</Badge>
                    </div>
                    
                    {event.description && (
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {events.length === 0 && (
        <Card className="p-8 text-center">
          <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-medium mb-2">No events scheduled</h3>
          <p className="text-muted-foreground">
            {isAdmin 
              ? 'Create your first event to get started' 
              : 'Check back later for upcoming events'
            }
          </p>
        </Card>
      )}
    </div>
  );
}