import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NormalizedEvent {
  id?: string;
  title: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
  recurrence?: string[];
  attendees?: Array<{ email: string; optional?: boolean; responseStatus?: string }>;
  reminders?: { useDefault: boolean; overrides?: Array<{ method: 'email' | 'popup'; minutes: number }> };
  visibility?: 'default' | 'public' | 'private';
  colorId?: string;
  allDay?: boolean;
}

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

function normalizeGoogleEvent(googleEvent: any): NormalizedEvent {
  return {
    id: googleEvent.id,
    title: googleEvent.summary || 'Untitled',
    description: googleEvent.description,
    location: googleEvent.location,
    start: googleEvent.start,
    end: googleEvent.end,
    recurrence: googleEvent.recurrence,
    attendees: googleEvent.attendees,
    reminders: googleEvent.reminders,
    visibility: googleEvent.visibility,
    colorId: googleEvent.colorId,
    allDay: !!googleEvent.start?.date,
  };
}

function denormalizeEvent(event: NormalizedEvent): any {
  const googleEvent: any = {
    summary: event.title,
    description: event.description,
    location: event.location,
    start: event.start,
    end: event.end,
  };

  if (event.recurrence) googleEvent.recurrence = event.recurrence;
  if (event.attendees) googleEvent.attendees = event.attendees;
  if (event.reminders) googleEvent.reminders = event.reminders;
  if (event.visibility) googleEvent.visibility = event.visibility;
  if (event.colorId) googleEvent.colorId = event.colorId;

  return googleEvent;
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

    const accessToken = await getValidToken(supabaseClient, user.id);
    const url = new URL(req.url);

    if (req.method === 'GET') {
      const gcalId = url.searchParams.get('gcal_id') || 'primary';
      const timeMin = url.searchParams.get('timeMin');
      const timeMax = url.searchParams.get('timeMax');
      const q = url.searchParams.get('q');

      const params = new URLSearchParams();
      if (timeMin) params.set('timeMin', timeMin);
      if (timeMax) params.set('timeMax', timeMax);
      if (q) params.set('q', q);
      params.set('singleEvents', 'true');
      params.set('orderBy', 'startTime');

      const eventsResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(gcalId)}/events?${params}`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );

      if (!eventsResponse.ok) {
        const errorData = await eventsResponse.json();
        return new Response(
          JSON.stringify({ error: 'GoogleAPI', message: errorData.error?.message || 'Failed to fetch events' }),
          { status: eventsResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const eventsData = await eventsResponse.json();
      const normalizedEvents = (eventsData.items || []).map(normalizeGoogleEvent);

      return new Response(
        JSON.stringify({ events: normalizedEvents }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'POST') {
      const { gcal_id, event } = await req.json();
      const calendarId = gcal_id || 'primary';
      const googleEvent = denormalizeEvent(event);

      const createResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(googleEvent),
        }
      );

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        return new Response(
          JSON.stringify({ error: 'GoogleAPI', message: errorData.error?.message || 'Failed to create event' }),
          { status: createResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const createdEvent = await createResponse.json();
      return new Response(
        JSON.stringify({ event: normalizeGoogleEvent(createdEvent) }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'PATCH') {
      const { gcal_id, gcal_event_id, event } = await req.json();
      const calendarId = gcal_id || 'primary';
      const googleEvent = denormalizeEvent(event);

      const updateResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${gcal_event_id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(googleEvent),
        }
      );

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        return new Response(
          JSON.stringify({ error: 'GoogleAPI', message: errorData.error?.message || 'Failed to update event' }),
          { status: updateResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const updatedEvent = await updateResponse.json();
      return new Response(
        JSON.stringify({ event: normalizeGoogleEvent(updatedEvent) }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'DELETE') {
      const gcalId = url.searchParams.get('gcal_id') || 'primary';
      const gcalEventId = url.searchParams.get('gcal_event_id');

      if (!gcalEventId) {
        return new Response(
          JSON.stringify({ error: 'BadRequest', message: 'Missing gcal_event_id' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const deleteResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(gcalId)}/events/${gcalEventId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }
      );

      if (!deleteResponse.ok && deleteResponse.status !== 404) {
        const errorData = await deleteResponse.json();
        return new Response(
          JSON.stringify({ error: 'GoogleAPI', message: errorData.error?.message || 'Failed to delete event' }),
          { status: deleteResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'MethodNotAllowed', message: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in google-events:', error);
    return new Response(
      JSON.stringify({ error: 'InternalError', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
