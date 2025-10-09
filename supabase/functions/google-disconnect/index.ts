import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'No user found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get token to revoke
    const { data: tokenData } = await supabaseClient
      .from('google_tokens')
      .select('access_token')
      .eq('user_id', user.id)
      .single();

    if (tokenData) {
      // Revoke token with Google
      await fetch(`https://oauth2.googleapis.com/revoke?token=${tokenData.access_token}`, {
        method: 'POST',
      });
    }

    // Delete all user's Google data
    await supabaseClient.from('google_event_links').delete().eq('user_id', user.id);
    await supabaseClient.from('google_calendars').delete().eq('user_id', user.id);
    await supabaseClient.from('google_tokens').delete().eq('user_id', user.id);

    return new Response(
      JSON.stringify({ connected: false }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in google-disconnect:', error);
    return new Response(
      JSON.stringify({ error: 'InternalError', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
