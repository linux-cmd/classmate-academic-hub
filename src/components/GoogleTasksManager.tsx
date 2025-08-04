import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckSquare, 
  Plus, 
  Clock, 
  Calendar, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Check,
  CircleDashed,
  Loader2,
  Star,
  AlertCircle
} from 'lucide-react';
import { useGoogleTasks } from '@/hooks/useGoogleTasks';
import { cn } from '@/lib/utils';

interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  completed?: string;
  parent?: string;
  position?: string;
  links?: Array<{
    type: string;
    link: string;
  }>;
}

interface GoogleTaskList {
  id: string;
  title: string;
  updated: string;
}

const GoogleTasksManager: React.FC = () => {
  const [taskLists, setTaskLists] = useState<GoogleTaskList[]>([]);
  const [tasks, setTasks] = useState<GoogleTask[]>([]);
  const [selectedTaskList, setSelectedTaskList] = useState<string>('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');
  const [editingTask, setEditingTask] = useState<GoogleTask | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    isConnected,
    getTaskLists,
    getTasks,
    createTask,
    updateTask,
    deleteTask
  } = useGoogleTasks();

  useEffect(() => {
    if (isConnected) {
      loadTaskLists();
    }
  }, [isConnected]);

  useEffect(() => {
    if (selectedTaskList) {
      loadTasks();
    }
  }, [selectedTaskList]);

  const loadTaskLists = async () => {
    try {
      const lists = await getTaskLists();
      setTaskLists(lists);
      if (lists.length > 0 && !selectedTaskList) {
        setSelectedTaskList(lists[0].id);
      }
    } catch (error) {
      console.error('Failed to load task lists:', error);
    }
  };

  const loadTasks = async () => {
    if (!selectedTaskList) return;
    
    setIsLoading(true);
    try {
      const taskList = await getTasks(selectedTaskList);
      setTasks(taskList);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || !selectedTaskList) return;

    try {
      const newTask = {
        title: newTaskTitle,
        notes: newTaskNotes || undefined,
        due: newTaskDue || undefined,
        status: 'needsAction' as const
      };

      await createTask(selectedTaskList, newTask);
      setNewTaskTitle('');
      setNewTaskNotes('');
      setNewTaskDue('');
      setIsCreateDialogOpen(false);
      loadTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask || !selectedTaskList) return;

    try {
      await updateTask(selectedTaskList, editingTask.id, editingTask);
      setIsEditDialogOpen(false);
      setEditingTask(null);
      loadTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!selectedTaskList) return;

    try {
      await deleteTask(selectedTaskList, taskId);
      loadTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleToggleComplete = async (task: GoogleTask) => {
    if (!selectedTaskList) return;

    try {
      const updatedTask = {
        ...task,
        status: task.status === 'completed' ? 'needsAction' as const : 'completed' as const,
        completed: task.status === 'completed' ? undefined : new Date().toISOString()
      };
      await updateTask(selectedTaskList, task.id, updatedTask);
      loadTasks();
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const pendingTasks = tasks.filter(task => task.status === 'needsAction');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  if (!isConnected) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <p className="text-sm font-medium">Google Tasks Not Connected</p>
              <p className="text-xs text-muted-foreground">Connect Google Tasks to manage your tasks</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Google Tasks
          </h2>
          <p className="text-muted-foreground">
            Manage your Google Tasks seamlessly
          </p>
        </div>
        <div className="flex items-center gap-3">
          {taskLists.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CheckSquare className="h-4 w-4" />
                  {taskLists.find(list => list.id === selectedTaskList)?.title || 'Select List'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {taskLists.map((list) => (
                  <DropdownMenuItem
                    key={list.id}
                    onClick={() => setSelectedTaskList(list.id)}
                    className={cn(
                      "cursor-pointer",
                      list.id === selectedTaskList && "bg-accent"
                    )}
                  >
                    <CheckSquare className="h-4 w-4 mr-2" />
                    {list.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-primary hover:opacity-90 transition-opacity">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Add a new task to your Google Tasks list
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Task title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Notes (optional)"
                    value={newTaskNotes}
                    onChange={(e) => setNewTaskNotes(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTask} disabled={!newTaskTitle.trim()}>
                    Create Task
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200/50 dark:border-blue-800/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <CircleDashed className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Pending Tasks</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{pendingTasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200/50 dark:border-green-800/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">Completed</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completedTasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50 border-orange-200/50 dark:border-orange-800/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Overdue</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {pendingTasks.filter(task => isOverdue(task.due)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pending" className="gap-2">
                  <CircleDashed className="h-4 w-4" />
                  Pending ({pendingTasks.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="gap-2">
                  <Check className="h-4 w-4" />
                  Completed ({completedTasks.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-3 mt-4">
                <ScrollArea className="h-[400px]">
                  {pendingTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No pending tasks</p>
                      <p className="text-sm text-muted-foreground">Create a new task to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pendingTasks.map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors",
                            isOverdue(task.due) && "border-destructive/30 bg-destructive/5"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-5 w-5 mt-0.5"
                              onClick={() => handleToggleComplete(task)}
                            >
                              <CircleDashed className="h-4 w-4 text-muted-foreground hover:text-primary" />
                            </Button>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm truncate">{task.title}</h4>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setEditingTask(task);
                                        setIsEditDialogOpen(true);
                                      }}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteTask(task.id)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              
                              {task.notes && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {task.notes}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-2 mt-2">
                                {task.due && (
                                  <Badge 
                                    variant={isOverdue(task.due) ? "destructive" : "secondary"}
                                    className="text-xs"
                                  >
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {formatDate(task.due)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="completed" className="space-y-3 mt-4">
                <ScrollArea className="h-[400px]">
                  {completedTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <Check className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No completed tasks</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {completedTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-4 rounded-lg border bg-card/30 opacity-75"
                        >
                          <div className="flex items-start gap-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-5 w-5 mt-0.5"
                              onClick={() => handleToggleComplete(task)}
                            >
                              <Check className="h-4 w-4 text-success" />
                            </Button>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm truncate line-through text-muted-foreground">
                                  {task.title}
                                </h4>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteTask(task.id)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              
                              {task.completed && (
                                <Badge variant="secondary" className="text-xs mt-2">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Completed {formatDate(task.completed)}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update your task details
            </DialogDescription>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Task title"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Notes (optional)"
                  value={editingTask.notes || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, notes: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>
              <div>
                <Input
                  type="date"
                  value={editingTask.due?.split('T')[0] || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, due: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateTask}>
                  Update Task
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GoogleTasksManager;