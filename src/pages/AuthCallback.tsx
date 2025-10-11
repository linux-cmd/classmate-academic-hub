import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AuthCallback() {
  const [status, setStatus] = useState<'idle' | 'exchanging' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const navigate = useNavigate();
  
  const search = window.location.search;
  const hash = window.location.hash;

  const qp = useMemo(() => {
    // Merge query + hash params and decode once
    const params = new URLSearchParams(search || '');
    if (hash?.startsWith('#')) {
      const hashParams = new URLSearchParams(hash.slice(1));
      for (const [k, v] of hashParams.entries()) {
        if (!params.has(k)) params.set(k, v);
      }
    }
    return params;
  }, [search, hash]);

  useEffect(() => {
    const error = qp.get('error') || qp.get('error_code');
    const errorDesc = qp.get('error_description');
    const code = qp.get('code');
    
    console.log('AuthCallback - params:', { error, errorDesc, code: code ? 'present' : 'absent' });
    
    if (error) {
      console.error('OAuth error:', error, errorDesc);
      setStatus('error');
      setErrorMessage(
        errorDesc 
          ? decodeURIComponent(errorDesc.replace(/\+/g, ' '))
          : 'Authentication failed. Please try again.'
      );
      return;
    }
    
    if (!code) {
      console.error('No code in callback');
      setStatus('error');
      setErrorMessage('Missing authorization code. Please try signing in again.');
      return;
    }
    
    setStatus('exchanging');
    
    supabase.auth.exchangeCodeForSession(code)
      .then(({ data, error }) => {
        if (error) {
          console.error('exchangeCodeForSession error:', error);
          setStatus('error');
          setErrorMessage(error.message || 'Failed to complete sign-in.');
          return;
        }
        
        console.log('Exchange successful, user:', data.user?.email);
        setStatus('success');
        
        // Get redirect target
        const next = qp.get('next') || '/';
        
        // Clean redirect and navigate
        setTimeout(() => {
          window.history.replaceState({}, document.title, next);
          navigate(next, { replace: true });
        }, 500);
      })
      .catch((e) => {
        console.error('exchange exception:', e);
        setStatus('error');
        setErrorMessage('An unexpected error occurred. Please try again.');
      });
  }, [qp, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        {status === 'exchanging' && (
          <div className="flex flex-col items-center space-y-4 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Signing you in...</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Please wait while we complete your authentication.
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Success!</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Redirecting you to your dashboard...
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Sign-in failed</AlertTitle>
              <AlertDescription className="mt-2">
                {errorMessage}
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                This could be due to:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Incorrect Google OAuth configuration</li>
                <li>Redirect URI mismatch</li>
                <li>Browser blocking third-party cookies</li>
                <li>Session expired or invalid</li>
              </ul>
            </div>
            
            <Button 
              onClick={() => navigate('/', { replace: true })}
              className="w-full"
            >
              Back to Home
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
