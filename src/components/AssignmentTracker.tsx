import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Calendar, Clock, CheckSquare } from "lucide-react";

const AssignmentTracker = () => {
  const assignments = [
    {
      id: 1,
      title: "Math 101 - Problem Set 4",
      course: "Calculus I",
      dueDate: "Mar 15",
      priority: "high",
      completed: false,
      timeLeft: "2 days"
    },
    {
      id: 2,
      title: "History Essay - Renaissance Art",
      course: "Art History",
      dueDate: "Mar 18",
      priority: "medium",
      completed: false,
      timeLeft: "5 days"
    },
    {
      id: 3,
      title: "Physics Lab Report",
      course: "Physics II",
      dueDate: "Mar 12",
      priority: "high",
      completed: true,
      timeLeft: "Completed"
    },
    {
      id: 4,
      title: "Literature Review",
      course: "English 201",
      dueDate: "Mar 22",
      priority: "low",
      completed: false,
      timeLeft: "1 week"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "warning";
      case "low": return "success";
      default: return "secondary";
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <CheckSquare className="w-5 h-5 text-primary" />
          <span>Assignment Tracker</span>
        </CardTitle>
        <Button size="sm" className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Assignment</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className={`flex items-center space-x-4 p-3 rounded-lg border transition-colors ${
              assignment.completed 
                ? 'bg-muted/50 opacity-75' 
                : 'hover:bg-muted/20'
            }`}
          >
            <Checkbox 
              checked={assignment.completed}
              className="shrink-0"
            />
            
            <div className="flex-1 min-w-0">
              <h4 className={`font-medium truncate ${
                assignment.completed ? 'line-through text-muted-foreground' : ''
              }`}>
                {assignment.title}
              </h4>
              <p className="text-sm text-muted-foreground">{assignment.course}</p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <Badge variant={getPriorityColor(assignment.priority) as any}>
                {assignment.priority}
              </Badge>
              
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{assignment.dueDate}</span>
              </div>
              
              <div className="flex items-center space-x-1 text-sm">
                <Clock className="w-3 h-3" />
                <span className={assignment.completed ? 'text-success' : 'text-warning'}>
                  {assignment.timeLeft}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AssignmentTracker;