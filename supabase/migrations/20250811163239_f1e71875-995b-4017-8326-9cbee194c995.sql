-- Study Groups schema, functions, RLS, and storage policies

-- 1) Enums
CREATE TYPE public.group_member_role AS ENUM ('admin', 'member', 'banned');
CREATE TYPE public.join_request_status AS ENUM ('pending', 'approved', 'denied');
CREATE TYPE public.rsvp_status AS ENUM ('yes', 'no', 'maybe');

-- 2) Tables
CREATE TABLE public.study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role public.group_member_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);
CREATE INDEX idx_group_members_group ON public.group_members(group_id);
CREATE INDEX idx_group_members_user ON public.group_members(user_id);

CREATE TABLE public.group_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL,
  requester_id UUID NOT NULL,
  status public.join_request_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_group_join_requests_group ON public.group_join_requests(group_id);
CREATE INDEX idx_group_join_requests_requester ON public.group_join_requests(requester_id);
CREATE UNIQUE INDEX uniq_pending_request ON public.group_join_requests (group_id, requester_id, status)
WHERE status = 'pending';

CREATE TABLE public.group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  attachments JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_group_messages_group_time ON public.group_messages(group_id, created_at DESC);

CREATE TABLE public.group_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL,
  user_id UUID NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT,
  file_type TEXT,
  size BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_group_files_group_time ON public.group_files(group_id, created_at DESC);

CREATE TABLE public.group_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_group_events_group_start ON public.group_events(group_id, start_time DESC);

CREATE TABLE public.group_event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  user_id UUID NOT NULL,
  status public.rsvp_status NOT NULL DEFAULT 'yes',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);
CREATE INDEX idx_group_event_rsvps_event ON public.group_event_rsvps(event_id);
CREATE INDEX idx_group_event_rsvps_user ON public.group_event_rsvps(user_id);

-- 3) Enable RLS
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_event_rsvps ENABLE ROW LEVEL SECURITY;

-- 4) Helper functions for RLS (security definer)
CREATE OR REPLACE FUNCTION public.is_group_member(_group_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members m
    WHERE m.group_id = _group_id
      AND m.user_id = _user_id
      AND m.role <> 'banned'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_admin(_group_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members m
    WHERE m.group_id = _group_id
      AND m.user_id = _user_id
      AND m.role = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM public.study_groups g
    WHERE g.id = _group_id AND g.owner_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.can_join_public_group(_group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.study_groups g
    WHERE g.id = _group_id AND g.is_public = true
  ) AND NOT EXISTS (
    SELECT 1 FROM public.group_members m
    WHERE m.group_id = _group_id AND m.user_id = auth.uid()
  );
$$;

-- 5) Policies
-- study_groups
CREATE POLICY "Groups are viewable if public or member" ON public.study_groups
FOR SELECT
USING (
  is_public = true OR owner_id = auth.uid() OR public.is_group_member(id, auth.uid())
);

CREATE POLICY "Users can create groups they own" ON public.study_groups
FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Admins/owners can update groups" ON public.study_groups
FOR UPDATE
USING (owner_id = auth.uid() OR public.is_group_admin(id, auth.uid()));

CREATE POLICY "Only owners can delete groups" ON public.study_groups
FOR DELETE
USING (owner_id = auth.uid());

-- group_members
CREATE POLICY "Members can view membership of their groups" ON public.group_members
FOR SELECT
USING (public.is_group_member(group_id, auth.uid()) OR EXISTS (SELECT 1 FROM public.study_groups g WHERE g.id = group_id AND g.is_public = true));

CREATE POLICY "Users can join public groups themselves" ON public.group_members
FOR INSERT
WITH CHECK (user_id = auth.uid() AND public.can_join_public_group(group_id));

CREATE POLICY "Admins can add members" ON public.group_members
FOR INSERT
WITH CHECK (public.is_group_admin(group_id, auth.uid()));

CREATE POLICY "Admins can update membership roles" ON public.group_members
FOR UPDATE
USING (public.is_group_admin(group_id, auth.uid()));

CREATE POLICY "Admins can remove members" ON public.group_members
FOR DELETE
USING (public.is_group_admin(group_id, auth.uid()));

CREATE POLICY "Members can leave groups by deleting themselves" ON public.group_members
FOR DELETE
USING (user_id = auth.uid());

-- group_join_requests
CREATE POLICY "Requester and admins can view join requests" ON public.group_join_requests
FOR SELECT
USING (
  requester_id = auth.uid() OR public.is_group_admin(group_id, auth.uid())
);

CREATE POLICY "Users can create their own join requests" ON public.group_join_requests
FOR INSERT
WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Admins can update join requests" ON public.group_join_requests
FOR UPDATE
USING (public.is_group_admin(group_id, auth.uid()));

CREATE POLICY "Requester can delete their own join request" ON public.group_join_requests
FOR DELETE
USING (requester_id = auth.uid());

-- group_messages
CREATE POLICY "Members can read messages" ON public.group_messages
FOR SELECT
USING (public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Members can send messages as themselves" ON public.group_messages
FOR INSERT
WITH CHECK (public.is_group_member(group_id, auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Senders or admins can delete messages" ON public.group_messages
FOR DELETE
USING (user_id = auth.uid() OR public.is_group_admin(group_id, auth.uid()));

-- group_files
CREATE POLICY "Members can view files" ON public.group_files
FOR SELECT
USING (public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Members can add files as themselves" ON public.group_files
FOR INSERT
WITH CHECK (public.is_group_member(group_id, auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Admins or uploaders can delete files" ON public.group_files
FOR DELETE
USING (public.is_group_admin(group_id, auth.uid()) OR user_id = auth.uid());

-- group_events
CREATE POLICY "Members can view events" ON public.group_events
FOR SELECT
USING (public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Admins can create events" ON public.group_events
FOR INSERT
WITH CHECK (public.is_group_admin(group_id, auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Admins can update events" ON public.group_events
FOR UPDATE
USING (public.is_group_admin(group_id, auth.uid()));

CREATE POLICY "Admins can delete events" ON public.group_events
FOR DELETE
USING (public.is_group_admin(group_id, auth.uid()));

-- group_event_rsvps
CREATE POLICY "Members can view RSVPs" ON public.group_event_rsvps
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.group_events e
    WHERE e.id = event_id AND public.is_group_member(e.group_id, auth.uid())
  )
);

CREATE POLICY "Members can RSVP for themselves" ON public.group_event_rsvps
FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.group_events e
    WHERE e.id = event_id AND public.is_group_member(e.group_id, auth.uid())
  )
);

CREATE POLICY "Users can update their own RSVP" ON public.group_event_rsvps
FOR UPDATE
USING (user_id = auth.uid());

-- 6) Timestamps triggers
CREATE TRIGGER update_study_groups_updated_at
BEFORE UPDATE ON public.study_groups
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_group_events_updated_at
BEFORE UPDATE ON public.group_events
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7) Storage bucket and policies for group files
INSERT INTO storage.buckets (id, name, public) VALUES ('group-files', 'group-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies on storage.objects
-- Allow members to read files in their groups
CREATE POLICY "Group members can read files"
ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'group-files'
  AND EXISTS (
    SELECT 1 FROM public.group_members m
    WHERE m.group_id = ((storage.foldername(name))[1])::uuid
      AND m.user_id = auth.uid()
      AND m.role <> 'banned'
  )
);

-- Allow members to upload files to their own folder under the group
CREATE POLICY "Members can upload to group folders"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'group-files'
  AND auth.uid()::text = (storage.foldername(name))[2]
  AND EXISTS (
    SELECT 1 FROM public.group_members m
    WHERE m.group_id = ((storage.foldername(name))[1])::uuid
      AND m.user_id = auth.uid()
      AND m.role <> 'banned'
  )
);

-- Allow uploaders to delete their own files
CREATE POLICY "Uploaders can delete their files"
ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'group-files'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow admins to delete any file in their group
CREATE POLICY "Admins can delete any group file"
ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'group-files'
  AND public.is_group_admin(((storage.foldername(name))[1])::uuid, auth.uid())
);
