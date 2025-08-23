
-- 1) Remove over-permissive profiles exposure
DROP POLICY IF EXISTS "Public visibility for study group discovery" ON public.profiles;

-- 2) Lock down group membership visibility
-- Drop the old broad policy
DROP POLICY IF EXISTS "Members can view membership of their groups" ON public.group_members;

-- Add a stricter SELECT policy for membership visibility
CREATE POLICY "Members and admins can view membership of their groups"
  ON public.group_members
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      is_group_member(group_id, auth.uid())
      OR is_group_admin(group_id, auth.uid())
    )
  );
