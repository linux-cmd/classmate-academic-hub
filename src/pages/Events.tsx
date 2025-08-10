import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, MapPin, Calendar, Clock, TrendingUp, Search, Filter, Plus } from "lucide-react";

const Events = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const events: Array<any> = [];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "academic": return "primary";
      case "social": return "accent";
      case "career": return "success";
      case "club": return "warning";
      default: return "secondary";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "academic": return BookOpen;
      case "social": return Users;
      case "career": return TrendingUp;
      case "club": return Users;
      default: return Calendar;
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const featuredEvents = events.filter(event => event.featured);
  const myEvents = events.filter(event => event.rsvp);

  const handleRSVP = (eventId: number) => {
    // This would connect to your backend
    console.log("RSVP for event:", eventId);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle pt-16">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Campus Events</h1>
            <p className="text-muted-foreground">Discover and join campus activities</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="career">Career</SelectItem>
                  <SelectItem value="club">Club</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="my-events">My Events</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredEvents.map((event) => {
                const IconComponent = getCategoryIcon(event.category);
                
                return (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className={`w-12 h-12 rounded-full bg-${getCategoryColor(event.category)}/10 flex items-center justify-center shrink-0`}>
                            <IconComponent className={`w-6 h-6 text-${getCategoryColor(event.category)}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg mb-1">{event.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">{event.organizer}</p>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                          <Badge variant={getCategoryColor(event.category) as any}>
                            {event.category}
                          </Badge>
                          {event.featured && (
                            <Badge variant="outline" className="text-xs">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{event.date}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{event.time}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{event.attendees} attending</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant={event.rsvp ? "default" : "outline"}
                          className="flex-1"
                          onClick={() => handleRSVP(event.id)}
                        >
                          {event.rsvp ? "RSVP'd ✓" : "RSVP"}
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Calendar className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="featured">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredEvents.map((event) => {
                const IconComponent = getCategoryIcon(event.category);
                
                return (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow border-primary/20">
                    {/* Same card content as above */}
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className={`w-12 h-12 rounded-full bg-${getCategoryColor(event.category)}/10 flex items-center justify-center shrink-0`}>
                            <IconComponent className={`w-6 h-6 text-${getCategoryColor(event.category)}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg mb-1">{event.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">{event.organizer}</p>
                          </div>
                        </div>

                        <Badge variant={getCategoryColor(event.category) as any}>
                          {event.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{event.date}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{event.time}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{event.attendees} attending</span>
                        </div>
                      </div>

                      <Button
                        variant={event.rsvp ? "default" : "outline"}
                        className="w-full"
                        onClick={() => handleRSVP(event.id)}
                      >
                        {event.rsvp ? "RSVP'd ✓" : "RSVP"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="my-events">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {myEvents.length > 0 ? (
                myEvents.map((event) => {
                  const IconComponent = getCategoryIcon(event.category);
                  
                  return (
                    <Card key={event.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className={`w-12 h-12 rounded-full bg-${getCategoryColor(event.category)}/10 flex items-center justify-center shrink-0`}>
                              <IconComponent className={`w-6 h-6 text-${getCategoryColor(event.category)}`} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg mb-1">{event.title}</CardTitle>
                              <p className="text-sm text-muted-foreground">{event.organizer}</p>
                            </div>
                          </div>

                          <Badge variant="default">RSVP'd</Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{event.date}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{event.time}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>{event.attendees} attending</span>
                          </div>
                        </div>

                        <Button variant="outline" className="w-full">
                          Cancel RSVP
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card className="lg:col-span-2">
                  <CardContent className="p-8 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No events yet</h3>
                    <p className="text-muted-foreground">RSVP to events to see them here</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Events;