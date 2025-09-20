import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{clientId: string, apiKey: string} | null>(null);
  const { toast } = useToast();

  // Load Google credentials from edge function
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('google-credentials');
        if (error) throw error;
        setCredentials(data);
      } catch (error) {
        console.error('Failed to load Google credentials:', error);
      }
    };
    loadCredentials();
  }, []);

  const initializeGapi = useCallback(async () => {
    if (typeof window === 'undefined' || !window.gapi || !credentials) {
      throw new Error('Google API not loaded or credentials not available');
    }

    await new Promise<void>((resolve) => {
      window.gapi.load('client', resolve);
    });

    await window.gapi.client.init({
      apiKey: credentials.apiKey,
      discoveryDocs: [
        'https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest',
        'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'
      ],
    });
  }, [credentials]);

  const connect = useCallback(async () => {
    if (!credentials) {
      toast({
        title: "Configuration Error",
        description: "Google API credentials not loaded. Please check your setup.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await initializeGapi();
      
      // Use the new Google Identity Services
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: credentials.clientId,
        scope: 'https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/calendar',
        callback: (response: any) => {
          if (response.access_token) {
            setAccessToken(response.access_token);
            setIsConnected(true);
            toast({
              title: "Google Services Connected!",
              description: "Calendar and Tasks are now synced.",
            });
          }
          setIsLoading(false);
        },
      });

      tokenClient.requestAccessToken();
    } catch (error) {
      console.error('Failed to connect to Google services:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Google services. Please check your API configuration.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [initializeGapi, credentials, toast]);

  const disconnect = useCallback(() => {
    if (accessToken && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(accessToken);
    }
    setAccessToken(null);
    setIsConnected(false);
    toast({
      title: "Google Services Disconnected",
      description: "Calendar and Tasks have been disconnected.",
    });
  }, [accessToken, toast]);

  const getTaskLists = useCallback(async (): Promise<GoogleTaskList[]> => {
    if (!isConnected || !accessToken) {
      throw new Error('Not connected to Google Tasks');
    }

    try {
      // Set the access token for API requests
      window.gapi.client.setToken({ access_token: accessToken });
      
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
  }, [isConnected, accessToken, toast]);

  const getTasks = useCallback(async (taskListId: string): Promise<GoogleTask[]> => {
    if (!isConnected || !accessToken) {
      throw new Error('Not connected to Google Tasks');
    }

    try {
      // Set the access token for API requests
      window.gapi.client.setToken({ access_token: accessToken });
      
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
  }, [isConnected, accessToken, toast]);

  const createTask = useCallback(async (taskListId: string, task: Partial<GoogleTask>): Promise<GoogleTask> => {
    if (!isConnected || !accessToken) {
      throw new Error('Not connected to Google Tasks');
    }

    try {
      // Set the access token for API requests
      window.gapi.client.setToken({ access_token: accessToken });
      
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
  }, [isConnected, accessToken, toast]);

  const updateTask = useCallback(async (taskListId: string, taskId: string, task: Partial<GoogleTask>): Promise<GoogleTask> => {
    if (!isConnected || !accessToken) {
      throw new Error('Not connected to Google Tasks');
    }

    try {
      // Set the access token for API requests
      window.gapi.client.setToken({ access_token: accessToken });
      
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
  }, [isConnected, accessToken, toast]);

  const deleteTask = useCallback(async (taskListId: string, taskId: string): Promise<void> => {
    if (!isConnected || !accessToken) {
      throw new Error('Not connected to Google Tasks');
    }

    try {
      // Set the access token for API requests
      window.gapi.client.setToken({ access_token: accessToken });
      
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
  }, [isConnected, accessToken, toast]);

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
