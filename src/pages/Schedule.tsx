import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react";
import CalendarIntegration from "@/components/CalendarIntegration";

interface ScheduleEvent {
  id: string;
  title: string;
  time: string;
  endTime?: string;
  location: string;
  type: 'class' | 'study' | 'event' | 'meeting';
  participants?: number;
  source: 'local' | 'google';
  description?: string;
}

const Schedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');

  // Sample schedule data
  const scheduleEvents: ScheduleEvent[] = [
    {
      id: '1',
      title: 'Calculus I - Lecture',
      time: '9:00 AM',
      endTime: '10:30 AM',
      location: 'Math Building 201',
      type: 'class',
      participants: 45,
      source: 'local',
      description: 'Derivatives and applications'
    },
    {
      id: '2',
      title: 'Physics Lab',
      time: '11:00 AM',
      endTime: '1:00 PM',
      location: 'Science Building Lab 3',
      type: 'class',
      participants: 20,
      source: 'local',
      description: 'Oscillations and waves experiment'
    },
    {
      id: '3',
      title: 'Study Group - Physics',
      time: '2:00 PM',
      endTime: '4:00 PM',
      location: 'Library Study Room 3',
      type: 'study',
      participants: 6,
      source: 'local',
      description: 'Problem solving session for midterm'
    },
    {
      id: '4',
      title: 'Career Fair',
      time: '5:00 PM',
      endTime: '7:00 PM',
      location: 'Student Union Hall',
      type: 'event',
      participants: 200,
      source: 'google',
      description: 'Meet industry professionals'
    },
    {
      id: '5',
      title: 'Office Hours - Prof. Smith',
      time: '3:00 PM',
      endTime: '4:00 PM',
      location: 'Math Building 105',
      type: 'meeting',
      participants: 5,
      source: 'google',
      description: 'Calculus questions and review'
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'class': return 'primary';
      case 'study': return 'success';
      case 'event': return 'accent';
      case 'meeting': return 'info';
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

  const todaysEvents = scheduleEvents.filter(event => {
    // For demo, show all events as "today"
    return true;
  });

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
                {todaysEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No events scheduled for this day</p>
                  </div>
                ) : (
                  todaysEvents.map((event) => {
                    const IconComponent = getTypeIcon(event.type);
                    
                    return (
                      <div
                        key={event.id}
                        className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-12 h-12 rounded-full bg-${getTypeColor(event.type)}/10 flex items-center justify-center`}>
                            <IconComponent className={`w-6 h-6 text-${getTypeColor(event.type)}`} />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{event.title}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant={getTypeColor(event.type) as any}>
                                {event.type}
                              </Badge>
                              {event.source === 'google' && (
                                <Badge variant="outline" className="text-xs">
                                  Google
                                </Badge>
                              )}
                            </div>
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
                                {event.time}
                                {event.endTime && ` - ${event.endTime}`}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{event.location}</span>
                            </div>
                            
                            {event.participants && (
                              <div className="flex items-center space-x-1">
                                <Users className="w-3 h-3" />
                                <span>{event.participants}</span>
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
            <CalendarIntegration
              onSyncCalendar={() => {
                console.log('Calendar sync triggered');
              }}
            />

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">This Week</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Classes</span>
                  <Badge variant="primary">12</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Study Sessions</span>
                  <Badge variant="success">4</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Events</span>
                  <Badge variant="accent">3</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Meetings</span>
                  <Badge variant="info">2</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Math Problem Set</span>
                    <span className="text-xs text-muted-foreground">2 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">History Essay</span>
                    <span className="text-xs text-muted-foreground">5 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Physics Lab Report</span>
                    <span className="text-xs text-muted-foreground">1 week</span>
                  </div>
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