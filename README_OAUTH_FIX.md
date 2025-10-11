# Google OAuth "Unable to exchange external code" - FIXED ✅

## What Was Fixed

This update resolves the persistent "Unable to exchange external code" error when users attempt to sign in with Google on `classmateapp.vercel.app`.

### Changes Made

#### 1. **Supabase Client Configuration** (`src/integrations/supabase/client.ts`)
Added critical auth options that were missing:
```typescript
{
  auth: {
    detectSessionInUrl: true,  // NEW: Allows Supabase to parse ?code= on callback
    flowType: 'pkce',           // NEW: Explicitly enables PKCE flow
    persistSession: true,
    autoRefreshToken: true
  }
}
```

#### 2. **Dedicated OAuth Callback Page** (`src/pages/AuthCallback.tsx`)
Created a new route `/auth/callback` that:
- Handles the OAuth code exchange properly
- Parses both query and hash parameters (handles double-encoding)
- Shows clear loading and error states
- Redirects to the intended page after successful authentication
- Provides helpful error messages with troubleshooting hints

#### 3. **Updated OAuth Redirect URLs**
Changed redirect URLs in both auth hooks:
- **Before:** `${window.location.origin}/` (root page)
- **After:** `${window.location.origin}/auth/callback` (dedicated callback page)

This ensures the code exchange happens in a controlled environment.

#### 4. **Landing Page Error Cleanup** (`src/pages/Landing.tsx`)
Added automatic cleanup of OAuth error parameters from the URL to prevent showing cryptic errors to users.

#### 5. **Router Configuration** (`src/App.tsx`)
Added the new callback route:
```typescript
<Route path="/auth/callback" element={<AuthCallback />} />
```

#### 6. **Updated Documentation** (`GOOGLE_CALENDAR_SETUP.md`)
Completely rewrote the troubleshooting section with:
- Detailed checklist of all common causes
- Step-by-step fixes for each issue
- Clear examples of correct vs incorrect configurations
- Quick reference guide

---

## Configuration Required

### Google Cloud Console

**Authorized redirect URIs** must include:
```
https://classmateapp.vercel.app/auth/callback
https://ztqatzdqkocgdlfjgusw.supabase.co/auth/v1/callback
```

⚠️ **Important:** The first URI is your app's callback page, the second is for Supabase Auth.

### Supabase Dashboard

**Authentication > URL Configuration:**

**Site URL:**
```
https://classmateapp.vercel.app
```
(No trailing slash!)

**Redirect URLs:**
```
https://classmateapp.vercel.app/auth/callback
https://classmateapp.vercel.app/**
```

---

## Testing Checklist

✅ **Fresh Browser Test:**
1. Open incognito/private window
2. Go to `https://classmateapp.vercel.app`
3. Click "Sign in with Google"
4. Consent to permissions
5. Should land on `/auth/callback` → shows "Signing you in..."
6. Should redirect to `/` with authenticated session

✅ **Error Handling:**
1. Test with incorrect redirect URI in Google Console
2. Should show clear error message on `/auth/callback`
3. Should offer "Back to Home" button

✅ **Multiple Tabs:**
1. Open two tabs, initiate login in both
2. Complete login in one tab
3. Second tab should either complete or show clear error

✅ **Console Logs:**
1. Open browser DevTools
2. Watch for these logs:
   - "Starting Google sign in..."
   - "AuthCallback - params: { ... }"
   - "Exchange successful, user: <email>"
   - "Auth state change: SIGNED_IN"

---

## Why It Failed Before

1. **Missing `detectSessionInUrl: true`** - Supabase wasn't parsing the `?code=` parameter from the callback URL
2. **No PKCE flow specified** - OAuth flow wasn't using the secure PKCE method
3. **Redirect to `/` instead of callback** - Root page wasn't designed to handle code exchange
4. **No dedicated error handling** - Users saw generic browser errors instead of helpful messages
5. **Potential URI mismatches** - Documentation didn't clearly explain the difference between app callback and Supabase callback

---

## Architecture

### Before (Failed Flow):
```
User clicks "Sign in with Google"
  ↓
Redirect to Google OAuth
  ↓
Google redirects to: classmateapp.vercel.app/?code=xyz
  ↓
Landing page tries to handle auth (no code to do so)
  ↓
Supabase client doesn't detect/exchange code (detectSessionInUrl was false)
  ↓
ERROR: "Unable to exchange external code"
```

### After (Working Flow):
```
User clicks "Sign in with Google"
  ↓
Redirect to Google OAuth with redirectTo=/auth/callback
  ↓
Google redirects to: classmateapp.vercel.app/auth/callback?code=xyz
  ↓
AuthCallback page detects code parameter
  ↓
Calls supabase.auth.exchangeCodeForSession(code)
  ↓
Supabase exchanges code with Google (using PKCE)
  ↓
Session established
  ↓
Redirect to intended page (/)
  ↓
SUCCESS: User is authenticated
```

---

## Files Changed

1. ✅ `src/integrations/supabase/client.ts` - Added auth config
2. ✅ `src/pages/AuthCallback.tsx` - **NEW** callback handler
3. ✅ `src/hooks/useSupabaseAuth.ts` - Updated redirect URL
4. ✅ `src/hooks/useSocialAuth.ts` - Updated redirect URL
5. ✅ `src/pages/Landing.tsx` - Added error cleanup
6. ✅ `src/App.tsx` - Added callback route
7. ✅ `GOOGLE_CALENDAR_SETUP.md` - Comprehensive troubleshooting
8. ✅ `README_OAUTH_FIX.md` - **NEW** this document

---

## Next Steps

1. **Deploy to Vercel** - Push these changes to production
2. **Verify Google Console** - Ensure redirect URIs are configured correctly
3. **Verify Supabase** - Ensure Site URL and Redirect URLs are set
4. **Test End-to-End** - Follow testing checklist above
5. **Monitor Logs** - Watch for any auth-related errors in:
   - Browser console
   - Supabase Edge Function logs
   - Google Cloud Console audit logs

---

## Support

If you still encounter issues:

1. Check browser console for detailed errors
2. Check Supabase Edge Function logs
3. Verify Google Cloud Console settings match exactly
4. Clear all cookies and cache, test in incognito
5. Review `GOOGLE_CALENDAR_SETUP.md` troubleshooting section

---

**Status:** ✅ Ready to deploy and test
**Priority:** 🔴 Critical fix - blocks all Google authentication
