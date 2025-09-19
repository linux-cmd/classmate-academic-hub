import { useEffect, useMemo, useState } from "react";
import { GroupsSidebar } from "@/components/study-groups/GroupsSidebar";
import { GroupChat } from "@/components/study-groups/GroupChat";
import { GroupDashboard } from "@/components/study-groups/GroupDashboard";
import { useStudyGroups } from "@/hooks/useStudyGroups";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const StudyGroups = () => {
  const { user, isAuthenticated } = useSupabaseAuth();
  const { groups, memberGroupIds, isMember, joinPublicGroup, requestToJoin } = useStudyGroups();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Prefer auto-selecting a group the user is a member of
  const firstMemberGroup = useMemo(() => groups.find((g) => memberGroupIds.has(g.id))?.id || null, [groups, memberGroupIds]);
  useEffect(() => {
    if (!selectedId && firstMemberGroup) setSelectedId(firstMemberGroup);
  }, [firstMemberGroup, selectedId]);

  useEffect(() => {
    document.title = "Study Groups Chat | ClassMate";
  }, []);

  const selected = groups.find((g) => g.id === selectedId) || null;

  return (
    <div className="min-h-screen bg-gradient-subtle pt-16">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <header className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Study Groups</h1>
          <p className="text-muted-foreground">Chat with classmates in real-time and collaborate</p>
        </header>

        {!isAuthenticated ? (
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Sign in to access Study Groups</h2>
            <p className="text-muted-foreground mb-4">You need an account to join groups and chat.</p>
            <Button asChild>
              <a href="#auth">Open sign in</a>
            </Button>
          </Card>
        ) : (
          <main className="grid gap-4 md:grid-cols-[320px_1fr]">
            <aside>
              <GroupsSidebar
                groups={groups}
                memberGroupIds={memberGroupIds}
                selectedId={selectedId}
                onSelect={(id) => setSelectedId(id)}
                onJoin={joinPublicGroup}
                onRequest={requestToJoin}
              />
            </aside>

            <section className="animate-enter">
              {selected ? (
                <GroupDashboard 
                  group={selected} 
                  isMember={isMember(selected.id)}
                  isAdmin={false} // You'd need to determine admin status
                />
              ) : (
                <Card className="p-8 text-center">
                  <h2 className="text-lg font-semibold mb-1">Select a group</h2>
                  <p className="text-muted-foreground">Choose a study group from the sidebar to start chatting.</p>
                </Card>
              )}
            </section>
          </main>
        )}
      </div>
    </div>
  );
};

export default StudyGroups;