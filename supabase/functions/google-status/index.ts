import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoogleCalendar {
  id: string;
  summary: string;
  timeZone: string;
  selected?: boolean;
}

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

    // Check if user has tokens
    const { data: tokenData } = await supabaseClient
      .from('google_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!tokenData) {
      return new Response(
        JSON.stringify({ connected: false, message: 'No Google connection found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if token is expired
    const expiresAt = new Date(tokenData.expires_at);
    const now = new Date();
    
    let accessToken = tokenData.access_token;

    // Refresh token if expired
    if (expiresAt <= now) {
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: Deno.env.get('GOOGLE_CLIENT_ID'),
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET'),
          refresh_token: tokenData.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      if (!refreshResponse.ok) {
        return new Response(
          JSON.stringify({ connected: false, message: 'Token refresh failed' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const refreshData = await refreshResponse.json();
      accessToken = refreshData.access_token;

      await supabaseClient
        .from('google_tokens')
        .update({
          access_token: refreshData.access_token,
          expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
    }

    // Fetch calendars from Google
    const calendarsResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }
    );

    if (!calendarsResponse.ok) {
      throw new Error('Failed to fetch calendars from Google');
    }

    const calendarsData = await calendarsResponse.json();
    const calendars: GoogleCalendar[] = calendarsData.items || [];

    // Upsert calendars into our DB
    for (const cal of calendars) {
      await supabaseClient
        .from('google_calendars')
        .upsert({
          user_id: user.id,
          gcal_id: cal.id,
          summary: cal.summary,
          time_zone: cal.timeZone,
        }, { onConflict: 'user_id,gcal_id' });
    }

    // Get calendars from DB with selection status
    const { data: dbCalendars } = await supabaseClient
      .from('google_calendars')
      .select('*')
      .eq('user_id', user.id);

    return new Response(
      JSON.stringify({ connected: true, calendars: dbCalendars || [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in google-status:', error);
    return new Response(
      JSON.stringify({ error: 'InternalError', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
