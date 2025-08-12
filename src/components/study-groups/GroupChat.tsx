import { useEffect, useMemo, useRef, useState } from "react";
import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Wifi, WifiOff, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export type GroupMessage = Tables<"group_messages">;
export type Profile = Tables<"profiles">;
export type StudyGroup = Tables<"study_groups">;

interface GroupChatProps {
  group: StudyGroup;
  isMember: boolean;
}

const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export function GroupChat({ group, isMember }: GroupChatProps) {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    if (!isMember) return;
    try {
      const { data, error } = await supabase
        .from("group_messages")
        .select("*")
        .eq("group_id", group.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMessages(data || []);

      // Fetch distinct author profiles
      const authorIds = Array.from(new Set((data || []).map((m) => m.user_id)));
      if (authorIds.length) {
        const { data: profs, error: pErr } = await supabase
          .from("profiles")
          .select("*")
          .in("user_id", authorIds as string[]);
        if (!pErr && profs) {
          const map: Record<string, Profile> = {};
          profs.forEach((p) => (map[p.user_id as string] = p));
          setProfiles(map);
        }
      }
    } catch (e: any) {
      console.error("Failed to load messages", e);
      toast({ title: "Unable to load messages", description: e.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    setMessages([]);
    setProfiles({});
    setConnected(false);

    if (!isMember) return;

    loadMessages();

    // Realtime subscription (only when member)
    const channel = supabase
      .channel(`group-messages-${group.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `group_id=eq.${group.id}` },
        async (payload) => {
          const msg = payload.new as GroupMessage;
          setMessages((prev) => [...prev, msg]);
          // Lazy-load profile for new author
          const uid = msg.user_id as string;
          if (!profiles[uid]) {
            const { data: p } = await supabase.from('profiles').select('*').eq('user_id', uid).single();
            if (p) setProfiles((prev) => ({ ...prev, [uid]: p }));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setConnected(true);
      });

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group.id, isMember]);

  useEffect(() => {
    // auto-scroll to bottom on new messages
    viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    if (!user || !input.trim() || !isMember) return;
    try {
      const { error } = await supabase.from('group_messages').insert({
        group_id: group.id,
        user_id: user.id,
        content: input.trim(),
      });
      if (error) throw error;
      setInput("");
    } catch (e: any) {
      toast({ title: "Message not sent", description: e.message, variant: 'destructive' });
    }
  };

  return (
    <Card className="h-[72vh] md:h-[78vh] flex flex-col backdrop-blur supports-[backdrop-filter]:bg-background/70 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg md:text-xl">
              {group.name}
            </CardTitle>
            <p className="text-xs text-muted-foreground">{group.subject || "General"}</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {isMember && connected ? (
              <><Wifi className="size-4 text-success" /><span>Live</span></>
            ) : (
              <><WifiOff className="size-4 text-muted-foreground" /><span>Offline</span></>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col pt-0">
        {!isMember ? (
          <div className="flex flex-1 items-center justify-center text-center text-muted-foreground">
            <div className="max-w-md space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
                <Lock className="size-3" />
                <span>Join this group to view and send messages</span>
              </div>
              <p className="text-sm">This group is {group.is_public ? 'public' : 'private'}. Use the sidebar to join or request access.</p>
            </div>
          </div>
        ) : (
          <>
            <div ref={viewportRef} className="flex-1 overflow-y-auto rounded-md bg-accent/10 border border-border/50 p-3">
              <ScrollArea className="h-full">
                <div className="space-y-4 pr-2">
                  {messages.map((m) => {
                    const author = profiles[m.user_id as string];
                    const mine = user?.id === m.user_id;
                    return (
                      <div key={m.id} className={`flex items-start gap-3 ${mine ? 'flex-row-reverse text-right' : ''}`}>
                        <Avatar className="size-8 shrink-0">
                          {author?.avatar_url ? (
                            <AvatarImage src={author.avatar_url} alt={`${author.display_name || 'User'} avatar`} />
                          ) : (
                            <AvatarFallback>{(author?.display_name || 'U').slice(0,2).toUpperCase()}</AvatarFallback>
                          )}
                        </Avatar>
                        <div className={`max-w-[80%] ${mine ? 'items-end' : ''}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium">{author?.display_name || 'Unknown'}</span>
                            <span className="text-[10px] text-muted-foreground">{formatTime(m.created_at as string)}</span>
                          </div>
                          <div className={`inline-block rounded-lg px-3 py-2 text-sm shadow-sm ${mine ? 'bg-primary text-primary-foreground' : 'bg-card border'}`}>
                            {m.content}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            <div className="mt-3 border-t pt-3">
              <div className="flex items-end gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Write a message…"
                  className="min-h-[44px] h-[44px] md:h-auto md:min-h-[56px]"
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' && !e.shiftKey)) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button
                  size="lg"
                  className="h-[44px] md:h-[56px]"
                  onClick={handleSend}
                  disabled={!input.trim()}
                  aria-label="Send message"
                >
                  <Send className="size-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
