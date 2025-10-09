import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getValidToken(supabaseClient: any, userId: string): Promise<string> {
  const { data: tokenData } = await supabaseClient
    .from('google_tokens')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!tokenData) {
    throw new Error('No token found');
  }

  const expiresAt = new Date(tokenData.expires_at);
  const now = new Date();

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
      throw new Error('Token refresh failed');
    }

    const refreshData = await refreshResponse.json();

    await supabaseClient
      .from('google_tokens')
      .update({
        access_token: refreshData.access_token,
        expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    return refreshData.access_token;
  }

  return tokenData.access_token;
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

    const { gcal_id } = await req.json();
    const calendarId = gcal_id || 'primary';

    const accessToken = await getValidToken(supabaseClient, user.id);

    // Get calendar sync token
    const { data: calendarData } = await supabaseClient
      .from('google_calendars')
      .select('sync_token')
      .eq('user_id', user.id)
      .eq('gcal_id', calendarId)
      .single();

    const params = new URLSearchParams();
    
    if (calendarData?.sync_token) {
      // Incremental sync
      params.set('syncToken', calendarData.sync_token);
    } else {
      // Full sync - last 90 days + next 90 days
      const now = new Date();
      const past = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      const future = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      
      params.set('timeMin', past.toISOString());
      params.set('timeMax', future.toISOString());
      params.set('singleEvents', 'true');
    }

    let allEvents: any[] = [];
    let pageToken: string | null = null;
    let newSyncToken: string | null = null;

    do {
      if (pageToken) {
        params.set('pageToken', pageToken);
      }

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );

      if (!response.ok) {
        // If sync token is invalid, do a full sync
        if (response.status === 410) {
          params.delete('syncToken');
          const now = new Date();
          const past = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          const future = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
          
          params.set('timeMin', past.toISOString());
          params.set('timeMax', future.toISOString());
          params.set('singleEvents', 'true');
          continue;
        }

        const errorData = await response.json();
        return new Response(
          JSON.stringify({ error: 'GoogleAPI', message: errorData.error?.message || 'Sync failed' }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      allEvents = allEvents.concat(data.items || []);
      pageToken = data.nextPageToken || null;
      newSyncToken = data.nextSyncToken || newSyncToken;
    } while (pageToken);

    // Update sync token
    if (newSyncToken) {
      await supabaseClient
        .from('google_calendars')
        .update({
          sync_token: newSyncToken,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('gcal_id', calendarId);
    }

    return new Response(
      JSON.stringify({
        synced: true,
        events_count: allEvents.length,
        sync_token: newSyncToken,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in google-sync:', error);
    return new Response(
      JSON.stringify({ error: 'InternalError', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
