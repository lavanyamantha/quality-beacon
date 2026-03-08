import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isProxyEnabled } from '@/services/proxyClient';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * If proxy is not enabled (demo/dev mode), bypasses auth.
 * If proxy is enabled, requires authentication.
 * If requireAdmin is true, also checks admin role.
 */
export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isLoading, isAdmin } = useAuth();

  // In demo mode (no proxy), allow everything
  if (!isProxyEnabled()) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-foreground">Access Denied</p>
          <p className="text-sm text-muted-foreground">
            You need administrator privileges to access this page.
          </p>
          <p className="text-xs text-muted-foreground">
            Contact your organization admin to request access.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
