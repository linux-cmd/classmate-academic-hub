import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

const ScheduleOverview = () => {
  const todayEvents: Array<{ id: number; title: string; time: string; location: string; type: string; participants: number; }> = [];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "class": return "primary";
      case "study": return "success";
      case "event": return "accent";
      default: return "secondary";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "class": return Calendar;
      case "study": return Users;
      case "event": return MapPin;
      default: return Calendar;
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-primary" />
          <span>Today's Schedule</span>
        </CardTitle>
        <Button variant="outline" size="sm">
          View Calendar
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {todayEvents.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground rounded-lg border">
            No events today — add items or connect Google Calendar.
          </div>
        ) : (
          todayEvents.map((event) => {
            const IconComponent = getTypeIcon(event.type);
            
            return (
              <div
                key={event.id}
                className="flex items-start space-x-4 p-3 rounded-lg border hover:bg-muted/20 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-10 h-10 rounded-full bg-${getTypeColor(event.type)}/10 flex items-center justify-center`}>
                    <IconComponent className={`w-5 h-5 text-${getTypeColor(event.type)}`} />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{event.title}</h4>
                  
                  <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{event.time}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{event.participants}</span>
                    </div>
                  </div>
                </div>
  
                <Badge variant={getTypeColor(event.type) as any} className="shrink-0">
                  {event.type}
                </Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduleOverview;