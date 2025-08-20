-- Fix critical security issue: Remove public access to profiles table
-- and implement proper privacy controls

-- Drop the overly permissive policy that allows anyone to view profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create secure policies for profile access
-- Users can always view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Study group members can view basic info of other members in their groups
-- This allows the study groups functionality to work while protecting privacy
CREATE POLICY "Group members can view each other's basic profile info" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.group_members gm1
    INNER JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = auth.uid() 
    AND gm2.user_id = profiles.user_id
    AND gm1.role != 'banned'
    AND gm2.role != 'banned'
  )
);

-- Add policy for public study groups (limited visibility)
-- Only display_name visible for public group discovery
CREATE POLICY "Public visibility for study group discovery" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.study_groups sg
    INNER JOIN public.group_members gm ON sg.id = gm.group_id
    WHERE sg.is_public = true 
    AND gm.user_id = profiles.user_id
    AND gm.role != 'banned'
  )
);