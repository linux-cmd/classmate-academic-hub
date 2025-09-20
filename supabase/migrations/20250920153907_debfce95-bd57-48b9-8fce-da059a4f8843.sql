-- Add foreign key relationship between group_members and profiles
-- This will allow Supabase to properly join these tables

ALTER TABLE public.group_members 
ADD CONSTRAINT fk_group_members_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Also ensure we have the relationship for group_id to study_groups
ALTER TABLE public.group_members 
ADD CONSTRAINT fk_group_members_group_id 
FOREIGN KEY (group_id) REFERENCES public.study_groups(id) ON DELETE CASCADE;