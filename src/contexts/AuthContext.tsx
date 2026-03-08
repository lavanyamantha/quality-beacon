import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { getProxyUrl } from '@/services/proxyClient';

export interface AuthUser {
  sub: string;
  email: string;
  name: string;
  avatar: string;
  role: 'admin' | 'viewer';
  provider: string;
}

export interface AuthProvider {
  id: string;
  name: string;
  icon: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  providers: AuthProvider[];
  login: (providerId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'qa_dash_token';

export function AuthProviderWrapper({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [providers, setProviders] = useState<AuthProvider[]>([]);
  const proxyUrl = getProxyUrl();

  // Fetch available providers
  useEffect(() => {
    if (!proxyUrl) {
      setIsLoading(false);
      return;
    }
    fetch(`${proxyUrl}/api/auth/providers`)
      .then(r => r.json())
      .then(data => setProviders(data.providers || []))
      .catch(() => setProviders([]))
      .finally(() => setIsLoading(false));
  }, [proxyUrl]);

  // Check for token in URL (OAuth callback) or localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const callbackToken = params.get('token');
    if (callbackToken) {
      localStorage.setItem(TOKEN_KEY, callbackToken);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }

    const token = callbackToken || localStorage.getItem(TOKEN_KEY);
    if (!token || !proxyUrl) {
      setIsLoading(false);
      return;
    }

    // Verify token with server
    fetch(`${proxyUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (!r.ok) throw new Error('Invalid token');
        return r.json();
      })
      .then(data => setUser(data.user))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, [proxyUrl]);

  const login = useCallback((providerId: string) => {
    if (proxyUrl) {
      window.location.href = `${proxyUrl}/api/auth/${providerId}`;
    }
  }, [proxyUrl]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    if (proxyUrl) {
      fetch(`${proxyUrl}/api/auth/logout`, { method: 'POST' }).catch(() => {});
    }
  }, [proxyUrl]);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAdmin: user?.role === 'admin',
      providers,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProviderWrapper');
  return ctx;
}
