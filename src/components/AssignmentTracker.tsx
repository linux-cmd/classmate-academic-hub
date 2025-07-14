import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, CheckSquare } from "lucide-react";
import { useAssignments } from "@/hooks/useData";
import AddAssignmentDialog from "./AddAssignmentDialog";

const AssignmentTracker = () => {
  const { assignments, addAssignment, updateAssignment } = useAssignments();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "warning";
      case "low": return "success";
      default: return "secondary";
    }
  };

  const formatTimeLeft = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    return `${diffDays} days left`;
  };

  const handleToggleComplete = (id: string, completed: boolean) => {
    updateAssignment(id, { completed: !completed });
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <CheckSquare className="w-5 h-5 text-primary" />
          <span>Assignment Tracker</span>
        </CardTitle>
        <AddAssignmentDialog onAddAssignment={addAssignment} />
      </CardHeader>
      <CardContent className="space-y-4">
        {assignments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No assignments yet. Click "Add Assignment" to get started!</p>
          </div>
        ) : (
          assignments.map((assignment) => (
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
                onCheckedChange={() => handleToggleComplete(assignment.id, assignment.completed)}
                className="shrink-0"
              />
              
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium truncate ${
                  assignment.completed ? 'line-through text-muted-foreground' : ''
                }`}>
                  {assignment.title}
                </h4>
                <p className="text-sm text-muted-foreground">{assignment.course}</p>
                {assignment.description && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {assignment.description}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <Badge variant={getPriorityColor(assignment.priority) as any}>
                  {assignment.priority}
                </Badge>
                
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(assignment.dueDate).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center space-x-1 text-sm">
                  <Clock className="w-3 h-3" />
                  <span className={assignment.completed ? 'text-success' : 'text-warning'}>
                    {assignment.completed ? 'Completed' : formatTimeLeft(assignment.dueDate)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default AssignmentTracker;