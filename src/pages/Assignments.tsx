import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, CheckSquare, Search, Filter } from "lucide-react";
import { useAssignments } from "@/hooks/useData";
import AddAssignmentDialog from "@/components/AddAssignmentDialog";
import { useState } from "react";

const Assignments = () => {
  const { assignments, addAssignment, updateAssignment, deleteAssignment } = useAssignments();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.course.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === "all" || assignment.priority === filterPriority;
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "completed" && assignment.completed) ||
                         (filterStatus === "pending" && !assignment.completed);
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

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

  const getAssignmentStats = () => {
    const total = assignments.length;
    const completed = assignments.filter(a => a.completed).length;
    const overdue = assignments.filter(a => {
      const due = new Date(a.dueDate);
      const now = new Date();
      return due < now && !a.completed;
    }).length;
    
    return { total, completed, overdue, pending: total - completed };
  };

  const stats = getAssignmentStats();

  return (
    <div className="min-h-screen bg-gradient-subtle pt-16">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Assignments</h1>
            <p className="text-muted-foreground">Track and manage your academic tasks</p>
          </div>
          <AddAssignmentDialog />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.overdue}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assignments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Assignments List */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckSquare className="w-5 h-5 text-primary" />
              <span>Your Assignments ({filteredAssignments.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredAssignments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No assignments found</h3>
                <p>
                  {assignments.length === 0 
                    ? "Create your first assignment to get started!"
                    : "Try adjusting your search or filters."
                  }
                </p>
              </div>
            ) : (
              filteredAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className={`flex items-start space-x-4 p-4 rounded-lg border transition-colors ${
                    assignment.completed 
                      ? 'bg-muted/50 opacity-75' 
                      : 'hover:bg-muted/20'
                  }`}
                >
                  <Checkbox 
                    checked={assignment.completed}
                    onCheckedChange={() => handleToggleComplete(assignment.id, assignment.completed)}
                    className="shrink-0 mt-1"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium mb-1 ${
                      assignment.completed ? 'line-through text-muted-foreground' : ''
                    }`}>
                      {assignment.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">{assignment.course}</p>
                    {assignment.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {assignment.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span className={assignment.completed ? 'text-success' : 'text-warning'}>
                          {assignment.completed ? 'Completed' : formatTimeLeft(assignment.dueDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <Badge variant={getPriorityColor(assignment.priority) as any}>
                      {assignment.priority}
                    </Badge>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteAssignment(assignment.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Assignments;