import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, MapPin, Calendar, Clock, TrendingUp } from "lucide-react";

const EventsBoard = () => {
  const events: Array<any> = [];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "academic": return "primary";
      case "social": return "accent";
      case "career": return "success";
      default: return "secondary";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "academic": return BookOpen;
      case "social": return Users;
      case "career": return TrendingUp;
      default: return Calendar;
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-primary" />
          <span>Campus Events</span>
        </CardTitle>
        <Button variant="outline" size="sm" onClick={() => window.location.hash = '#events'}>
          View All Events
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map((event) => {
          const IconComponent = getCategoryIcon(event.category);
          
          return (
            <div
              key={event.id}
              className="flex flex-col space-y-3 p-4 rounded-lg border hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`w-10 h-10 rounded-full bg-${getCategoryColor(event.category)}/10 flex items-center justify-center shrink-0`}>
                    <IconComponent className={`w-5 h-5 text-${getCategoryColor(event.category)}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                  </div>
                </div>

                <Badge variant={getCategoryColor(event.category) as any} className="shrink-0">
                  {event.category}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{event.date}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{event.time}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{event.location}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{event.attendees} attending</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={event.rsvp ? "default" : "outline"}
                  className="shrink-0"
                >
                  {event.rsvp ? "RSVP'd" : "RSVP"}
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default EventsBoard;