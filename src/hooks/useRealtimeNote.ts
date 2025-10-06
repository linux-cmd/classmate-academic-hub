import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Block } from '@/components/notes/BlockEditor';
import { RealtimeChannel } from '@supabase/supabase-js';
import { debounce } from '@/lib/utils';

export interface PresenceUser {
  userId: string;
  userName: string;
  userAvatar?: string;
  cursor?: {
    blockId: string;
    position: number;
  };
  selection?: {
    blockId: string;
    start: number;
    end: number;
  };
  color: string;
  lastSeen: string;
}

export const useRealtimeNote = (noteId: string | null, userId: string | null) => {
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Assign a color to each user
  const getUserColor = useCallback((userId: string) => {
    const colors = [
      'hsl(210, 100%, 50%)', // blue
      'hsl(330, 100%, 50%)', // pink
      'hsl(150, 100%, 40%)', // green
      'hsl(30, 100%, 50%)',  // orange
      'hsl(270, 100%, 50%)', // purple
    ];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }, []);

  // Broadcast presence updates
  const broadcastPresence = useCallback(
    debounce(async (cursor?: PresenceUser['cursor'], selection?: PresenceUser['selection']) => {
      if (!channelRef.current || !userId) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', userId)
        .single();

      await channelRef.current.send({
        type: 'broadcast',
        event: 'presence',
        payload: {
          userId,
          userName: profile?.display_name || 'Anonymous',
          userAvatar: profile?.avatar_url,
          cursor,
          selection,
          timestamp: new Date().toISOString(),
        },
      });
    }, 100),
    [userId]
  );

  // Subscribe to presence updates
  useEffect(() => {
    if (!noteId || !userId) return;

    const channel = supabase.channel(`note:${noteId}`);
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'presence' }, ({ payload }) => {
        if (payload.userId === userId) return; // Ignore own presence

        setPresenceUsers((prev) => {
          const filtered = prev.filter((u) => u.userId !== payload.userId);
          return [
            ...filtered,
            {
              ...payload,
              color: getUserColor(payload.userId),
            },
          ];
        });
      })
      .on('presence', { event: 'sync' }, () => {
        console.log('Presence sync');
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') {
          broadcastPresence();
        }
      });

    // Heartbeat to keep presence alive
    const heartbeat = setInterval(() => {
      broadcastPresence();
    }, 30000);

    // Cleanup old presence (remove users inactive for >1 min)
    const cleanup = setInterval(() => {
      setPresenceUsers((prev) =>
        prev.filter((u) => {
          const lastSeen = new Date(u.lastSeen).getTime();
          return Date.now() - lastSeen < 60000;
        })
      );
    }, 10000);

    return () => {
      clearInterval(heartbeat);
      clearInterval(cleanup);
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [noteId, userId, broadcastPresence, getUserColor]);

  return {
    presenceUsers,
    isConnected,
    broadcastPresence,
  };
};
