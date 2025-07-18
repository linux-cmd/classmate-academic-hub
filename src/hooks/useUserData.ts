import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_type: 'exam' | 'quiz' | 'project' | 'study_session' | 'class' | 'other';
  start_time: string;
  end_time?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface Grade {
  id: string;
  subject: string;
  assignment_name: string;
  grade: number;
  max_grade: number;
  weight: number;
  semester?: string;
  date_graded: string;
  created_at: string;
  updated_at: string;
}

export const useUserData = () => {
  const { user, isAuthenticated } = useSupabaseAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAssignments = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setAssignments((data || []) as Assignment[]);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchEvents = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents((data || []) as Event[]);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchGrades = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .eq('user_id', user.id)
        .order('date_graded', { ascending: false });

      if (error) throw error;
      setGrades((data || []) as Grade[]);
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const fetchAllData = async () => {
    if (!isAuthenticated || !user) return;
    
    setLoading(true);
    try {
      await Promise.all([
        fetchAssignments(),
        fetchEvents(),
        fetchGrades()
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchAllData();
    }
  }, [isAuthenticated, user]);

  const addAssignment = async (assignment: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('assignments')
        .insert({ ...assignment, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      setAssignments(prev => [...prev, data as Assignment]);
      return data;
    } catch (error) {
      console.error('Error adding assignment:', error);
      throw error;
    }
  };

  const updateAssignment = async (id: string, updates: Partial<Assignment>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('assignments')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setAssignments(prev => prev.map(a => a.id === id ? data as Assignment : a));
      return data;
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  };

  const deleteAssignment = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setAssignments(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  };

  // Calculate stats
  const stats = {
    totalAssignments: assignments.length,
    pendingAssignments: assignments.filter(a => a.status === 'pending').length,
    completedAssignments: assignments.filter(a => a.status === 'completed').length,
    upcomingEvents: events.filter(e => new Date(e.start_time) > new Date()).length,
    averageGrade: grades.length > 0 
      ? grades.reduce((sum, g) => sum + (g.grade / g.max_grade) * 100, 0) / grades.length 
      : 0,
    recentGrades: grades.slice(0, 5)
  };

  return {
    assignments,
    events,
    grades,
    loading,
    stats,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    refreshData: fetchAllData
  };
};