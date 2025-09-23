import type { Tables } from "@/integrations/supabase/types";

export interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  description?: string;
  timeLeft?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  grade: string;
  percentage: number;
  credits: number;
  trend: 'up' | 'down' | 'stable';
}

export interface Event {
  id: string;
  title: string;
  category: 'academic' | 'social' | 'career';
  date: string;
  time: string;
  location: string;
  attendees: number;
  rsvp: boolean;
  description: string;
  source?: 'local' | 'google';
}

export interface ScheduleEvent {
  id: string;
  title: string;
  time: string;
  location: string;
  type: 'class' | 'study' | 'event';
  participants: number;
  source?: 'local' | 'google';
}

export interface StudyGroup {
  id: string;
  name: string;
  course: string;
  members: number;
  nextMeeting: string;
  description: string;
}

export interface Message {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials: string;
  gpa: string;
}

// Social Platform Types
export type ExtendedProfile = Tables<"profiles"> & {
  links: Record<string, string>;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
};

export type Post = Tables<"posts"> & {
  author?: {
    display_name: string;
    username: string;
    avatar_url: string;
  };
  user_reaction?: any[];
};

export type Community = Tables<"communities"> & {
  owner: {
    display_name: string;
    username: string;
    avatar_url: string;
  };
  user_membership?: Array<{ role: string }>;
};