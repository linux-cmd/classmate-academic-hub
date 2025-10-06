import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { commentId, commentText, noteId, authorId } = await req.json();

    // Extract mentions from comment text (@username pattern)
    const mentionRegex = /@(\w+)/g;
    const mentions = [...commentText.matchAll(mentionRegex)].map((m: RegExpMatchArray) => m[1]);

    if (mentions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, mentionsCount: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find user IDs for mentioned usernames
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name')
      .in('display_name', mentions);

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ success: true, mentionsCount: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get note title
    const { data: note } = await supabase
      .from('notes')
      .select('title')
      .eq('id', noteId)
      .single();

    // Get author name
    const { data: author } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', authorId)
      .single();

    // Create notifications for each mentioned user
    const notifications = profiles.map((profile) => ({
      user_id: profile.user_id,
      type: 'mention',
      title: `${author?.display_name || 'Someone'} mentioned you`,
      content: `You were mentioned in a comment on "${note?.title || 'Untitled'}"`,
      data: {
        noteId,
        commentId,
        authorId,
      },
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, mentionsCount: notifications.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in notify-mentions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
