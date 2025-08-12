import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import type { Tables } from "@/integrations/supabase/types";

export type StudyGroup = Tables<"study_groups">;
export type GroupMessage = Tables<"group_messages">;

export const useStudyGroups = () => {
  const { user } = useSupabaseAuth();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memberGroupIds, setMemberGroupIds] = useState<Set<string>>(new Set());

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("study_groups")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGroups(data || []);
    } catch (e: any) {
      console.error("Failed to fetch groups", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMemberships = useCallback(async () => {
    if (!user) {
      setMemberGroupIds(new Set());
      return;
    }
    try {
      const { data, error } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);
      if (error) throw error;
      const setIds = new Set<string>((data || []).map((r) => r.group_id as string));
      setMemberGroupIds(setIds);
    } catch (e) {
      console.error("Failed to fetch memberships", e);
    }
  }, [user]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    fetchMemberships();
  }, [fetchMemberships]);

  const isMember = useCallback(
    (groupId?: string | null) => (groupId ? memberGroupIds.has(groupId) : false),
    [memberGroupIds]
  );

  const joinPublicGroup = useCallback(
    async (groupId: string) => {
      if (!user) throw new Error("You must be signed in to join groups.");
      const { error } = await supabase.from("group_members").insert({
        group_id: groupId,
        user_id: user.id,
      });
      if (error) throw error;
      await fetchMemberships();
    },
    [user, fetchMemberships]
  );

  const requestToJoin = useCallback(
    async (groupId: string) => {
      if (!user) throw new Error("You must be signed in to request access.");
      const { error } = await supabase.from("group_join_requests").insert({
        group_id: groupId,
        requester_id: user.id,
      });
      if (error) throw error;
    },
    [user]
  );

  const leaveGroup = useCallback(
    async (groupId: string) => {
      if (!user) throw new Error("You must be signed in to leave groups.");
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", user.id);
      if (error) throw error;
      await fetchMemberships();
    },
    [user, fetchMemberships]
  );

  return {
    groups,
    loading,
    error,
    isMember,
    memberGroupIds,
    refresh: fetchGroups,
    joinPublicGroup,
    requestToJoin,
    leaveGroup,
  } as const;
};
