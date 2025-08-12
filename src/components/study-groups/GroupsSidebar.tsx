import { useMemo } from "react";
import type { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, LockOpen, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export type StudyGroup = Tables<"study_groups">;

interface GroupsSidebarProps {
  groups: StudyGroup[];
  memberGroupIds: Set<string>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onJoin: (id: string) => Promise<void>;
  onRequest: (id: string) => Promise<void>;
}

export function GroupsSidebar({ groups, memberGroupIds, selectedId, onSelect, onJoin, onRequest }: GroupsSidebarProps) {
  const sorted = useMemo(() => {
    return [...groups].sort((a, b) => Number(!memberGroupIds.has(a.id)) - Number(!memberGroupIds.has(b.id)) || a.name.localeCompare(b.name));
  }, [groups, memberGroupIds]);

  return (
    <Card className="h-[72vh] md:h-[78vh] border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg bg-gradient-to-r from-primary/80 to-accent/80 bg-clip-text text-transparent">
          Study Groups
        </CardTitle>
        <p className="text-xs text-muted-foreground">Join a group to start chatting</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 overflow-y-auto max-h-[60vh] pr-1">
          {sorted.map((g) => {
            const isMember = memberGroupIds.has(g.id);
            return (
              <button
                key={g.id}
                onClick={() => onSelect(g.id)}
                className={cn(
                  "w-full text-left rounded-md border p-3 transition-all hover:shadow-sm",
                  selectedId === g.id ? "bg-accent/20 border-primary/30" : "bg-card",
                )}
                aria-label={`Open group ${g.name}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      {g.image_url ? (
                        <AvatarImage src={g.image_url} alt={`${g.name} image`} />
                      ) : (
                        <AvatarFallback>{(g.subject || g.name || 'SG').slice(0,2).toUpperCase()}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <div className="font-medium leading-tight">{g.name}</div>
                      <div className="text-[11px] text-muted-foreground">{g.subject || 'General'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isMember ? (
                      <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]">
                        <Users className="size-3" /> Member
                      </span>
                    ) : g.is_public ? (
                      <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); onJoin(g.id); }}>
                        <LockOpen className="size-3" /> Join
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onRequest(g.id); }}>
                        <Lock className="size-3" /> Request
                      </Button>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
          {sorted.length === 0 && (
            <div className="text-sm text-muted-foreground">No groups yet. Create one from the main menu.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
