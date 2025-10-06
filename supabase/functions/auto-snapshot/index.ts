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

    // Find notes updated in the last 10 minutes that don't have a recent snapshot
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data: recentlyUpdatedNotes, error: fetchError } = await supabase
      .from('notes')
      .select('id, user_id, title, content, content_blocks, version')
      .gte('updated_at', tenMinutesAgo)
      .order('updated_at', { ascending: false });

    if (fetchError) throw fetchError;

    if (!recentlyUpdatedNotes || recentlyUpdatedNotes.length === 0) {
      return new Response(
        JSON.stringify({ success: true, snapshotsCreated: 0, message: 'No recently updated notes' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check which notes need snapshots
    const notesNeedingSnapshots = [];
    
    for (const note of recentlyUpdatedNotes) {
      const { data: lastSnapshot } = await supabase
        .from('note_versions')
        .select('created_at')
        .eq('note_id', note.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Create snapshot if no snapshot exists or last snapshot is older than 5 minutes
      if (!lastSnapshot || lastSnapshot.created_at < fiveMinutesAgo) {
        notesNeedingSnapshots.push(note);
      }
    }

    if (notesNeedingSnapshots.length === 0) {
      return new Response(
        JSON.stringify({ success: true, snapshotsCreated: 0, message: 'All notes have recent snapshots' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create snapshots
    const snapshots = notesNeedingSnapshots.map((note) => ({
      note_id: note.id,
      version: (note.version || 1) + 1,
      title: note.title,
      content: note.content || '',
      content_blocks: note.content_blocks || [],
      changed_by: note.user_id,
      change_summary: 'Auto-saved snapshot',
    }));

    const { error: insertError } = await supabase
      .from('note_versions')
      .insert(snapshots);

    if (insertError) throw insertError;

    // Update version numbers on notes
    for (const note of notesNeedingSnapshots) {
      await supabase
        .from('notes')
        .update({ version: (note.version || 1) + 1 })
        .eq('id', note.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        snapshotsCreated: snapshots.length,
        noteIds: notesNeedingSnapshots.map(n => n.id)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in auto-snapshot:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
