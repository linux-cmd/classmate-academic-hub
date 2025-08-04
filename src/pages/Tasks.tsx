import React from 'react';
import GoogleTasksManager from '@/components/GoogleTasksManager';
import { GoogleIntegration } from '@/components/GoogleIntegration';
import { useGoogleTasks } from '@/hooks/useGoogleTasks';

const Tasks = () => {
  const { isConnected } = useGoogleTasks();

  return (
    <div className="min-h-screen bg-gradient-subtle pt-16">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {!isConnected ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent mb-2">
                Google Tasks Integration
              </h1>
              <p className="text-muted-foreground">
                Connect your Google account to manage tasks seamlessly
              </p>
            </div>
            <GoogleIntegration />
          </div>
        ) : (
          <GoogleTasksManager />
        )}
      </div>
    </div>
  );
};

export default Tasks;