import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import type { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

export type GroupTask = Tables<"group_tasks">;

export const useGroupTasks = (groupId: string | null) => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<GroupTask[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!groupId) {
      setTasks([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("group_tasks")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (e: any) {
      console.error("Failed to fetch tasks", e);
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [groupId, toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Real-time subscription
  useEffect(() => {
    if (!groupId) return;

    const channel = supabase
      .channel(`group-tasks-${groupId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'group_tasks', filter: `group_id=eq.${groupId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks(prev => [payload.new as GroupTask, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setTasks(prev => prev.map(task => 
              task.id === payload.new.id ? payload.new as GroupTask : task
            ));
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(task => task.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  const createTask = useCallback(async (taskData: Omit<GroupTask, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user || !groupId) return;

    try {
      const { error } = await supabase.from("group_tasks").insert({
        ...taskData,
        group_id: groupId,
        created_by: user.id,
      });

      if (error) throw error;
      toast({ title: "Success", description: "Task created successfully" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }, [user, groupId, toast]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<GroupTask>) => {
    try {
      const { error } = await supabase
        .from("group_tasks")
        .update(updates)
        .eq("id", taskId);

      if (error) throw error;
      toast({ title: "Success", description: "Task updated successfully" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }, [toast]);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("group_tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;
      toast({ title: "Success", description: "Task deleted successfully" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }, [toast]);

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    refresh: fetchTasks,
  };
};