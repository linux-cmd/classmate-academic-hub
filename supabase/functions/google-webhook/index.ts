import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-goog-resource-id, x-goog-channel-id, x-goog-resource-state',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resourceId = req.headers.get('X-Goog-Resource-ID');
    const channelId = req.headers.get('X-Goog-Channel-ID');
    const resourceState = req.headers.get('X-Goog-Resource-State');

    console.log('Webhook received:', { resourceId, channelId, resourceState });

    if (!resourceId || !channelId) {
      return new Response(
        JSON.stringify({ error: 'BadRequest', message: 'Missing required headers' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify it's a sync notification
    if (resourceState === 'sync') {
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Find the calendar associated with this watch
    const { data: calendarData } = await supabaseClient
      .from('google_calendars')
      .select('user_id, gcal_id')
      .eq('watch_resource_id', resourceId)
      .eq('watch_channel_id', channelId)
      .single();

    if (!calendarData) {
      console.log('Calendar not found for watch');
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    // Trigger sync for this calendar
    // In production, you'd queue this for async processing
    console.log('Triggering sync for calendar:', calendarData.gcal_id);

    // For now, just log it - actual sync would be triggered by client or scheduled job
    // You could invoke google-sync function here or use a queue

    return new Response('OK', { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Error in google-webhook:', error);
    return new Response(
      JSON.stringify({ error: 'InternalError', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
