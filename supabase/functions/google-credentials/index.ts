import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const googleApiKey = Deno.env.get('GOOGLE_API_KEY');

    console.log('Checking Google credentials:', {
      hasClientId: !!googleClientId,
      hasApiKey: !!googleApiKey,
      clientIdLength: googleClientId?.length || 0,
      apiKeyLength: googleApiKey?.length || 0
    });

    if (!googleClientId) {
      console.error('Missing GOOGLE_CLIENT_ID environment variable');
      throw new Error('Google Client ID not configured. Please set GOOGLE_CLIENT_ID in Supabase secrets.');
    }

    if (!googleApiKey) {
      console.error('Missing GOOGLE_API_KEY environment variable');
      throw new Error('Google API Key not configured. Please set GOOGLE_API_KEY in Supabase secrets.');
    }

    if (googleClientId.trim() === '' || googleApiKey.trim() === '') {
      console.error('Empty Google credentials detected');
      throw new Error('Google credentials are empty. Please check your Supabase secrets values.');
    }

    const credentials = {
      clientId: googleClientId.trim(),
      apiKey: googleApiKey.trim(),
    };

    console.log('Successfully returning Google credentials');
    return new Response(
      JSON.stringify(credentials),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      },
    );
  } catch (error) {
    console.error('Google credentials error:', error.message);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString(),
        requestMethod: req.method
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 400 
      },
    );
  }
});