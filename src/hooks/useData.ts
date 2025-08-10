import { useState, useEffect } from 'react';
import { Assignment, Course, Event, ScheduleEvent, StudyGroup, Message, User } from '@/types';
import {
  getAssignments, saveAssignments,
  getCourses, saveCourses,
  getEvents, saveEvents,
  getSchedule, saveSchedule,
  getStudyGroups, saveStudyGroups,
  getMessages, saveMessages,
  getUser, saveUser
} from '@/lib/storage';

export const useAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    setAssignments(getAssignments());
  }, []);

  const addAssignment = (assignment: Omit<Assignment, 'id'>) => {
    const newAssignment = {
      ...assignment,
      id: Date.now().toString(),
    };
    const updated = [...assignments, newAssignment];
    setAssignments(updated);
    saveAssignments(updated);
  };

  const updateAssignment = (id: string, updates: Partial<Assignment>) => {
    const updated = assignments.map(assignment =>
      assignment.id === id ? { ...assignment, ...updates } : assignment
    );
    setAssignments(updated);
    saveAssignments(updated);
  };

  const deleteAssignment = (id: string) => {
    const updated = assignments.filter(assignment => assignment.id !== id);
    setAssignments(updated);
    saveAssignments(updated);
  };

  return {
    assignments,
    addAssignment,
    updateAssignment,
    deleteAssignment,
  };
};

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    setCourses(getCourses());
  }, []);

  const addCourse = (course: Omit<Course, 'id'>) => {
    const newCourse = {
      ...course,
      id: Date.now().toString(),
    };
    const updated = [...courses, newCourse];
    setCourses(updated);
    saveCourses(updated);
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    const updated = courses.map(course =>
      course.id === id ? { ...course, ...updates } : course
    );
    setCourses(updated);
    saveCourses(updated);
  };

  return {
    courses,
    addCourse,
    updateCourse,
  };
};

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    setEvents(getEvents());
  }, []);

  const addEvent = (event: Omit<Event, 'id'>) => {
    const newEvent = {
      ...event,
      id: Date.now().toString(),
    };
    const updated = [...events, newEvent];
    setEvents(updated);
    saveEvents(updated);
  };

  const toggleRSVP = (id: string) => {
    const updated = events.map(event =>
      event.id === id ? { ...event, rsvp: !event.rsvp } : event
    );
    setEvents(updated);
    saveEvents(updated);
  };

  return {
    events,
    addEvent,
    toggleRSVP,
  };
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedUser = getUser();
    if (savedUser) {
      setUser(savedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (email: string, password: string) => {
    // Frontend-only demo login
    const demoUser: User = {
      id: Date.now().toString(),
      name: email.split('@')[0],
      email,
      initials: email.substring(0, 2).toUpperCase(),
      gpa: '0.0'
    };
    setUser(demoUser);
    setIsAuthenticated(true);
    saveUser(demoUser);
    return Promise.resolve(demoUser);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('classmate_user');
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      saveUser(updatedUser);
    }
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
    updateProfile,
  };
};