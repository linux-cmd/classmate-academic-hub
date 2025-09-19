-- Add missing tables and components for comprehensive Study Groups functionality

-- Group Tasks table for task management (this one seems to be missing)
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

-- Group Notifications table (this one seems to be missing)
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

-- Enable RLS on new tables
ALTER TABLE public.group_tasks ENABLE ROW LEVEL SECURITY;
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

-- Add realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_notifications;