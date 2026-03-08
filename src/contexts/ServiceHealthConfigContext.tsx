import { createContext, useContext, useState, ReactNode } from 'react';

export interface ServiceHealthEndpoint {
  id: string;
  name: string;
  healthUrl: string;
  /** Optional base URL for metrics (Azure Monitor, Prometheus, etc.) */
  metricsUrl?: string;
  /** Cloud provider hint for specialized fetching */
  provider: 'generic' | 'azure' | 'aws' | 'gcp' | 'custom';
  /** Expected response field for status (e.g., "status", "health") */
  statusField?: string;
  /** Expected healthy value (e.g., "Healthy", "UP", "ok") */
  healthyValue?: string;
  /** Auth header value if needed */
  authHeader?: string;
  /** Polling interval in seconds (default 30) */
  intervalSeconds?: number;
  enabled: boolean;
}

export interface LiveServiceHealth {
  id: string;
  name: string;
  health: 'healthy' | 'degraded' | 'down' | 'unknown';
  responseTimeMs: number;
  lastChecked: string;
  statusCode?: number;
  errorMessage?: string;
  source: string;
  isLive: true;
}

interface ServiceHealthConfigContextType {
  endpoints: ServiceHealthEndpoint[];
  setEndpoints: (endpoints: ServiceHealthEndpoint[]) => void;
  addEndpoint: (endpoint: ServiceHealthEndpoint) => void;
  updateEndpoint: (id: string, updates: Partial<ServiceHealthEndpoint>) => void;
  removeEndpoint: (id: string) => void;
  enabledEndpoints: ServiceHealthEndpoint[];
}

const ServiceHealthConfigContext = createContext<ServiceHealthConfigContextType | undefined>(undefined);

const defaultEndpoints: ServiceHealthEndpoint[] = [];

export function ServiceHealthConfigProvider({ children }: { children: ReactNode }) {
  const [endpoints, setEndpoints] = useState<ServiceHealthEndpoint[]>(defaultEndpoints);

  const addEndpoint = (endpoint: ServiceHealthEndpoint) => {
    setEndpoints(prev => [...prev, endpoint]);
  };

  const updateEndpoint = (id: string, updates: Partial<ServiceHealthEndpoint>) => {
    setEndpoints(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const removeEndpoint = (id: string) => {
    setEndpoints(prev => prev.filter(e => e.id !== id));
  };

  const enabledEndpoints = endpoints.filter(e => e.enabled);

  return (
    <ServiceHealthConfigContext.Provider value={{
      endpoints, setEndpoints, addEndpoint, updateEndpoint, removeEndpoint, enabledEndpoints,
    }}>
      {children}
    </ServiceHealthConfigContext.Provider>
  );
}

export function useServiceHealthConfig() {
  const ctx = useContext(ServiceHealthConfigContext);
  if (!ctx) throw new Error('useServiceHealthConfig must be used within ServiceHealthConfigProvider');
  return ctx;
}
