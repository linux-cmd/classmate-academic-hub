import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PresencePayload {
  noteId: string;
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
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: payload } = await req.json() as { data: PresencePayload };
    
    // Broadcast presence update via Realtime
    const channel = supabase.channel(`note:${payload.noteId}`);
    
    await channel.send({
      type: 'broadcast',
      event: 'presence',
      payload: {
        userId: payload.userId,
        userName: payload.userName,
        userAvatar: payload.userAvatar,
        cursor: payload.cursor,
        selection: payload.selection,
        timestamp: new Date().toISOString(),
      }
    });

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in realtime-presence:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
