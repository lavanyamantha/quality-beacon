import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

/**
 * Handles OAuth callback — the token is picked up by AuthContext
 * from the URL query param, then we redirect to home.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // AuthContext handles token extraction; just redirect after a tick
    const timer = setTimeout(() => navigate('/', { replace: true }), 500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-sm text-muted-foreground">Signing you in…</p>
      </div>
    </div>
  );
}
