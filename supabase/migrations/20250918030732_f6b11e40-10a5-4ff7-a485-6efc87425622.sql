-- Add tables for comprehensive Study Groups functionality

-- Group Tasks table for task management
CREATE TABLE IF NOT EXISTS public.group_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL,
  assigned_to uuid,
  created_by uuid NOT NULL,
  title text NOT NULL,
  description text,
  due_date timestamp with time zone,
  priority text CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status text CHECK (status IN ('todo', 'in_progress', 'completed')) DEFAULT 'todo',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Group Events table for calendar functionality
CREATE TABLE IF NOT EXISTS public.group_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL,
  created_by uuid NOT NULL,
  title text NOT NULL,
  description text,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone,
  location text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Group Event RSVPs table
CREATE TABLE IF NOT EXISTS public.group_event_rsvps (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status public.rsvp_status NOT NULL DEFAULT 'yes',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Group Files table for file sharing
CREATE TABLE IF NOT EXISTS public.group_files (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL,
  user_id uuid NOT NULL,
  file_name text,
  file_type text,
  file_path text NOT NULL,
  size bigint,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Group Notifications table
CREATE TABLE IF NOT EXISTS public.group_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL,
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('file_uploaded', 'task_assigned', 'task_completed', 'event_created', 'member_joined', 'member_left')),
  title text NOT NULL,
  message text,
  read boolean DEFAULT false,
  related_id uuid, -- can reference task, file, event, etc.
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.group_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for group_tasks
CREATE POLICY "Members can view tasks" ON public.group_tasks 
FOR SELECT USING (is_group_member(group_id, auth.uid()));

CREATE POLICY "Members can create tasks" ON public.group_tasks 
FOR INSERT WITH CHECK (is_group_member(group_id, auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Admins or task creators can update tasks" ON public.group_tasks 
FOR UPDATE USING (is_group_admin(group_id, auth.uid()) OR created_by = auth.uid());

CREATE POLICY "Admins or task creators can delete tasks" ON public.group_tasks 
FOR DELETE USING (is_group_admin(group_id, auth.uid()) OR created_by = auth.uid());

-- RLS Policies for group_events
CREATE POLICY "Members can view events" ON public.group_events 
FOR SELECT USING (is_group_member(group_id, auth.uid()));

CREATE POLICY "Admins can create events" ON public.group_events 
FOR INSERT WITH CHECK (is_group_admin(group_id, auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Admins can update events" ON public.group_events 
FOR UPDATE USING (is_group_admin(group_id, auth.uid()));

CREATE POLICY "Admins can delete events" ON public.group_events 
FOR DELETE USING (is_group_admin(group_id, auth.uid()));

-- RLS Policies for group_event_rsvps
CREATE POLICY "Members can view RSVPs" ON public.group_event_rsvps 
FOR SELECT USING (EXISTS (SELECT 1 FROM group_events e WHERE e.id = group_event_rsvps.event_id AND is_group_member(e.group_id, auth.uid())));

CREATE POLICY "Members can RSVP for themselves" ON public.group_event_rsvps 
FOR INSERT WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM group_events e WHERE e.id = group_event_rsvps.event_id AND is_group_member(e.group_id, auth.uid())));

CREATE POLICY "Users can update their own RSVP" ON public.group_event_rsvps 
FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for group_files
CREATE POLICY "Members can view files" ON public.group_files 
FOR SELECT USING (is_group_member(group_id, auth.uid()));

CREATE POLICY "Members can add files as themselves" ON public.group_files 
FOR INSERT WITH CHECK (is_group_member(group_id, auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Admins or uploaders can delete files" ON public.group_files 
FOR DELETE USING (is_group_admin(group_id, auth.uid()) OR user_id = auth.uid());

-- RLS Policies for group_notifications
CREATE POLICY "Users can view their own notifications" ON public.group_notifications 
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.group_notifications 
FOR INSERT WITH CHECK (true); -- Allow system to create notifications

CREATE POLICY "Users can mark their notifications as read" ON public.group_notifications 
FOR UPDATE USING (user_id = auth.uid());

-- Add triggers for updated_at columns
CREATE TRIGGER update_group_tasks_updated_at
  BEFORE UPDATE ON public.group_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_group_events_updated_at
  BEFORE UPDATE ON public.group_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add realtime for all new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_event_rsvps;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_files;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_notifications;