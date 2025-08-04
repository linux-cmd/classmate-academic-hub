import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

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

interface UseGoogleTasksReturn {
  isConnected: boolean;
  isLoading: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  getTaskLists: () => Promise<GoogleTaskList[]>;
  getTasks: (taskListId: string) => Promise<GoogleTask[]>;
  createTask: (taskListId: string, task: Partial<GoogleTask>) => Promise<GoogleTask>;
  updateTask: (taskListId: string, taskId: string, task: Partial<GoogleTask>) => Promise<GoogleTask>;
  deleteTask: (taskListId: string, taskId: string) => Promise<void>;
}

export const useGoogleTasks = (): UseGoogleTasksReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const initializeGapi = useCallback(async () => {
    if (typeof window === 'undefined' || !window.gapi) {
      throw new Error('Google API not loaded');
    }

    await new Promise<void>((resolve) => {
      window.gapi.load('client:auth2', resolve);
    });

    await window.gapi.client.init({
      apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      discoveryDocs: [
        'https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest',
        'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'
      ],
      scope: 'https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/calendar'
    });
  }, []);

  const connect = useCallback(async () => {
    setIsLoading(true);
    try {
      await initializeGapi();
      
      const authInstance = window.gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      
      if (user.isSignedIn()) {
        setIsConnected(true);
        toast({
          title: "Google Services Connected!",
          description: "Calendar and Tasks are now synced.",
        });
      }
    } catch (error) {
      console.error('Failed to connect to Google services:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Google services. Please check your API configuration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [initializeGapi, toast]);

  const disconnect = useCallback(() => {
    if (window.gapi?.auth2) {
      const authInstance = window.gapi.auth2.getAuthInstance();
      authInstance.signOut();
    }
    setIsConnected(false);
    toast({
      title: "Google Services Disconnected",
      description: "Calendar and Tasks have been disconnected.",
    });
  }, [toast]);

  const getTaskLists = useCallback(async (): Promise<GoogleTaskList[]> => {
    if (!isConnected) {
      throw new Error('Not connected to Google Tasks');
    }

    try {
      const response = await window.gapi.client.tasks.tasklists.list();
      return response.result.items || [];
    } catch (error) {
      console.error('Failed to get task lists:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync task lists.",
        variant: "destructive",
      });
      throw error;
    }
  }, [isConnected, toast]);

  const getTasks = useCallback(async (taskListId: string): Promise<GoogleTask[]> => {
    if (!isConnected) {
      throw new Error('Not connected to Google Tasks');
    }

    try {
      const response = await window.gapi.client.tasks.tasks.list({
        tasklist: taskListId,
        showCompleted: true,
        showDeleted: false,
        showHidden: true
      });
      return response.result.items || [];
    } catch (error) {
      console.error('Failed to get tasks:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync tasks.",
        variant: "destructive",
      });
      throw error;
    }
  }, [isConnected, toast]);

  const createTask = useCallback(async (taskListId: string, task: Partial<GoogleTask>): Promise<GoogleTask> => {
    if (!isConnected) {
      throw new Error('Not connected to Google Tasks');
    }

    try {
      const response = await window.gapi.client.tasks.tasks.insert({
        tasklist: taskListId,
        resource: task
      });

      toast({
        title: "Task Created",
        description: `Task "${task.title}" has been added to Google Tasks.`,
      });

      return response.result;
    } catch (error) {
      console.error('Failed to create task:', error);
      toast({
        title: "Task Creation Failed",
        description: "Failed to create task in Google Tasks.",
        variant: "destructive",
      });
      throw error;
    }
  }, [isConnected, toast]);

  const updateTask = useCallback(async (taskListId: string, taskId: string, task: Partial<GoogleTask>): Promise<GoogleTask> => {
    if (!isConnected) {
      throw new Error('Not connected to Google Tasks');
    }

    try {
      const response = await window.gapi.client.tasks.tasks.update({
        tasklist: taskListId,
        task: taskId,
        resource: task
      });

      toast({
        title: "Task Updated",
        description: "Task has been updated in Google Tasks.",
      });

      return response.result;
    } catch (error) {
      console.error('Failed to update task:', error);
      toast({
        title: "Task Update Failed",
        description: "Failed to update task in Google Tasks.",
        variant: "destructive",
      });
      throw error;
    }
  }, [isConnected, toast]);

  const deleteTask = useCallback(async (taskListId: string, taskId: string): Promise<void> => {
    if (!isConnected) {
      throw new Error('Not connected to Google Tasks');
    }

    try {
      await window.gapi.client.tasks.tasks.delete({
        tasklist: taskListId,
        task: taskId
      });

      toast({
        title: "Task Deleted",
        description: "Task has been deleted from Google Tasks.",
      });
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast({
        title: "Task Deletion Failed",
        description: "Failed to delete task from Google Tasks.",
        variant: "destructive",
      });
      throw error;
    }
  }, [isConnected, toast]);

  return {
    isConnected,
    isLoading,
    connect,
    disconnect,
    getTaskLists,
    getTasks,
    createTask,
    updateTask,
    deleteTask
  };
};
