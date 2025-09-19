import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import type { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

export type GroupFile = Tables<"group_files">;

export const useGroupFiles = (groupId: string | null) => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<GroupFile[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = useCallback(async () => {
    if (!groupId) {
      setFiles([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("group_files")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (e: any) {
      console.error("Failed to fetch files", e);
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [groupId, toast]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Real-time subscription
  useEffect(() => {
    if (!groupId) return;

    const channel = supabase
      .channel(`group-files-${groupId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'group_files', filter: `group_id=eq.${groupId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setFiles(prev => [payload.new as GroupFile, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setFiles(prev => prev.filter(file => file.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  const uploadFile = useCallback(async (file: File) => {
    if (!user || !groupId) return null;

    try {
      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${groupId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('group-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Add file record to database
      const { data: fileData, error: dbError } = await supabase
        .from("group_files")
        .insert({
          group_id: groupId,
          user_id: user.id,
          file_name: file.name,
          file_type: file.type,
          file_path: uploadData.path,
          size: file.size,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast({ title: "Success", description: "File uploaded successfully" });
      return fileData;
    } catch (e: any) {
      console.error("File upload failed:", e);
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return null;
    }
  }, [user, groupId, toast]);

  const deleteFile = useCallback(async (fileId: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('group-files')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("group_files")
        .delete()
        .eq("id", fileId);

      if (dbError) throw dbError;

      toast({ title: "Success", description: "File deleted successfully" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }, [toast]);

  const getFileUrl = useCallback(async (filePath: string) => {
    try {
      const { data } = await supabase.storage
        .from('group-files')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      return data?.signedUrl || null;
    } catch (e) {
      console.error("Failed to get file URL:", e);
      return null;
    }
  }, []);

  return {
    files,
    loading,
    uploadFile,
    deleteFile,
    getFileUrl,
    refresh: fetchFiles,
  };
};