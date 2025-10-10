# Google Calendar Integration Setup Guide

## Overview
This guide will help you set up complete Google Calendar integration with OAuth 2.0, event sync, webhooks, and real-time updates.

## Prerequisites
- A Google Cloud Console account
- Supabase project with Edge Functions
- Deployed app URL (e.g., `https://classmateapp.vercel.app`)

## 1. Google Cloud Console Setup

### Step 1: Create/Select a Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project name for reference

### Step 2: Enable Google Calendar API
1. Navigate to **APIs & Services** > **Library**
2. Search for "Google Calendar API"
3. Click on it and press **Enable**
4. Wait for activation (usually instant)

### Step 3: Configure OAuth Consent Screen
1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type (unless you have a Google Workspace)
3. Fill in required fields:
   - **App name**: Classmate
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Add authorized domains:
   - `classmateapp.vercel.app` (or your custom domain)
5. **Scopes**: Add these non-sensitive scopes:
   - `https://www.googleapis.com/auth/calendar.readonly`
   - `https://www.googleapis.com/auth/calendar.events`
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
6. Save and continue

### Step 4: Create OAuth 2.0 Client ID
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth Client ID**
3. Application type: **Web application**
4. Name: "Classmate Web Client"
5. **Authorized JavaScript origins**:
   ```
   https://classmateapp.vercel.app
   https://ztqatzdqkocgdlfjgusw.supabase.co
   ```
6. **Authorized redirect URIs**:
   ```
   https://classmateapp.vercel.app/auth/callback
   https://ztqatzdqkocgdlfjgusw.supabase.co/auth/v1/callback
   ```
7. Click **Create**
8. **IMPORTANT**: Copy the Client ID and Client Secret - you'll need these!

## 2. Environment Variables Setup

### Supabase Edge Function Secrets
These secrets have been created in your Supabase project. You need to set their values:

1. **GOOGLE_CLIENT_ID**: Your OAuth 2.0 Client ID from Step 4
2. **GOOGLE_CLIENT_SECRET**: Your OAuth 2.0 Client Secret from Step 4
3. **GOOGLE_REDIRECT_URI**: `https://classmateapp.vercel.app/auth/callback`

To set these secrets:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/ztqatzdqkocgdlfjgusw/settings/functions)
2. Click on **Edge Functions** in the sidebar
3. Go to **Secrets** tab
4. Add/update each secret with the values from Google Cloud Console

### Optional: Environment Variables for Development
Create a `.env.local` file (not committed to git):
```env
# These are already set in production
VITE_SUPABASE_URL=https://ztqatzdqkocgdlfjgusw.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 3. Domain Verification (Optional for Webhooks)

For push notifications via webhooks:

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your domain: `classmateapp.vercel.app`
3. Verify ownership via one of these methods:
   - HTML file upload
   - DNS TXT record
   - HTML meta tag
4. Once verified, you can register webhook channels

## 4. Testing the Integration

### Test OAuth Flow
1. Navigate to Schedule page in your app
2. Click "Connect Google Calendar"
3. You should be redirected to Google's consent screen
4. Grant permissions
5. You'll be redirected back with calendars listed

### Test Event Sync
1. Once connected, select calendars you want to sync
2. Click "Sync All Calendars"
3. Events should appear in your schedule view

### Test Event Creation
1. Create a new event in the app
2. Select a Google calendar as the destination
3. Event should appear in both the app and Google Calendar

## 5. Security Checklist

✅ OAuth tokens stored server-side only (never exposed to client)  
✅ All Google API calls go through Edge Functions  
✅ RLS policies protect user data  
✅ JWT verification on all protected endpoints  
✅ CORS configured for your domains only  
✅ Token refresh handled automatically  

## 6. Troubleshooting

### "Unauthorized" Error
- Check that GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set correctly
- Verify redirect URIs match exactly (including https://)

### "Access Denied" Error
- Check OAuth consent screen is configured
- Verify scopes are added correctly
- Make sure user has granted permissions

### Events Not Syncing
- Check that calendar is marked as "selected" in the UI
- Try the "Sync All Calendars" button
- Check Edge Function logs for errors

### Connection Fails
- Verify your domain is added to authorized JavaScript origins
- Check that redirect URI exactly matches what's in Google Console
- Ensure secrets are saved in Supabase

## 7. Architecture Overview

```
┌─────────────┐      OAuth      ┌──────────────┐
│   Browser   │ ←──────────────→ │    Google    │
│   (Client)  │                  │   Calendar   │
└──────┬──────┘                  └──────▲───────┘
       │                                │
       │ JWT Auth                       │ API Key
       │                                │
┌──────▼─────────────────────────────┬──┤
│     Supabase Edge Functions        │  │
│  ┌──────────────────────────────┐  │  │
│  │ google-connect (OAuth)       │  │  │
│  │ google-status (Check conn)   │  │  │
│  │ google-calendars (List/Toggle)│ │  │
│  │ google-events (CRUD)         │  │  │
│  │ google-sync (Incremental)    │──┘  │
│  │ google-webhook (Push notify) │     │
│  └──────────────────────────────┘     │
└────────────────┬──────────────────────┘
                 │
          ┌──────▼──────┐
          │  Supabase   │
          │  Database   │
          │  (RLS)      │
          └─────────────┘
```

## 8. API Endpoints

All endpoints require JWT authentication except webhooks:

- **POST /google-status**: Check connection and refresh calendars
- **POST /google-connect**: Initiate OAuth or handle callback
- **POST /google-disconnect**: Revoke tokens and cleanup
- **GET /google-calendars**: List user's calendars
- **PATCH /google-calendars**: Toggle calendar selection
- **GET /google-events**: Fetch events from a calendar
- **POST /google-events**: Create event in Google Calendar
- **PATCH /google-events**: Update existing event
- **DELETE /google-events**: Delete event
- **POST /google-sync**: Trigger incremental sync
- **POST /google-webhook**: Receive push notifications (public)

## 9. Data Flow

### Event Creation (Local → Google)
```
User creates event in UI
→ Check if Google calendar selected
→ Call google-events Edge Function
→ Function gets valid access token
→ Create event in Google Calendar
→ Store mapping in google_event_links
→ Return normalized event to client
```

### Event Sync (Google → Local)
```
User clicks "Sync Calendar"
→ Call google-sync Edge Function
→ Function checks for sync_token
→ Use incremental sync if available
→ Otherwise do full range sync (90 days back/forward)
→ Update sync_token for next time
→ Return event count
```

### Webhook Push Notifications
```
Google Calendar event changes
→ Google calls /google-webhook
→ Webhook validates headers
→ Looks up calendar by channel ID
→ Triggers sync for that calendar
→ User sees updates in real-time
```

## 10. Next Steps

After setup:

1. ✅ Test connection flow end-to-end
2. ✅ Create test events in both directions
3. ✅ Verify sync works correctly
4. ⬜ Set up webhook channels (optional)
5. ⬜ Configure cron job for periodic syncs (optional)
6. ⬜ Add more calendar providers (Outlook, Apple) (future)

## Support

For issues or questions:
- Check Edge Function logs in Supabase Dashboard
- Review Google Cloud Console audit logs
- Check browser console for client-side errors
- Verify environment variables are set correctly

---

**Security Note**: Never commit or expose:
- GOOGLE_CLIENT_SECRET
- Access tokens
- Refresh tokens
- Service account keys

All sensitive data is stored server-side in Supabase with RLS protection.
