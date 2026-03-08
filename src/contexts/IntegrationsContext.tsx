import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { loadIntegrationsFromEnv } from '@/config/integrations';
import { isProxyEnabled, fetchIntegrationsFromProxy } from '@/services/proxyClient';
import { isProxyEnabled, fetchIntegrationsFromProxy } from '@/services/proxyClient';

export interface IntegrationSource {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  /** Which timeline event types this source provides */
  provides: Array<'release' | 'deployment' | 'pipeline' | 'defect' | 'test'>;
  /** Base URL for the integration (safe — no token) */
  url?: string;
  /** Authentication token / API key — only present in non-proxy mode */
  token?: string;
}

interface IntegrationsContextType {
  integrations: IntegrationSource[];
  setIntegrations: (integrations: IntegrationSource[]) => void;
  updateStatus: (id: string, status: IntegrationSource['status'], lastSync?: string) => void;
  updateCredentials: (id: string, url: string, token: string) => void;
  getSourcesForType: (type: string) => IntegrationSource[];
  connectedSources: IntegrationSource[];
  disconnectedSources: IntegrationSource[];
  getPipelineSources: () => IntegrationSource[];
  /** Whether API calls are routed through the secure proxy */
  proxyEnabled: boolean;
}

const IntegrationsContext = createContext<IntegrationsContextType | undefined>(undefined);

export function IntegrationsProvider({ children }: { children: ReactNode }) {
  const [integrations, setIntegrations] = useState<IntegrationSource[]>(() => loadIntegrationsFromEnv());
  const proxyEnabled = isProxyEnabled();

  // If proxy is enabled, fetch the real integration list from the server
  useEffect(() => {
    if (!proxyEnabled) return;

    fetchIntegrationsFromProxy()
      .then((serverIntegrations) => {
        setIntegrations(
          serverIntegrations.map((i: any) => ({
            id: i.id,
            name: i.name,
            type: i.type,
            status: i.status,
            provides: i.provides,
            url: i.url, // base URL only, no token
          }))
        );
      })
      .catch((err) => {
        console.warn('Failed to fetch integrations from proxy, using env fallback:', err);
      });
  }, [proxyEnabled]);

  const updateStatus = (id: string, status: IntegrationSource['status'], lastSync?: string) => {
    setIntegrations(prev =>
      prev.map(i => i.id === id ? { ...i, status, lastSync: lastSync ?? i.lastSync } : i)
    );
  };

  const updateCredentials = (id: string, url: string, token: string) => {
    setIntegrations(prev =>
      prev.map(i => i.id === id ? { ...i, url, token } : i)
    );
  };

  const getSourcesForType = (type: string) =>
    integrations.filter(i => i.provides.includes(type as any));

  const getPipelineSources = () =>
    integrations.filter(i =>
      i.provides.includes('pipeline') &&
      i.status === 'connected' &&
      // In proxy mode, tokens are server-side so we just check connected status
      (proxyEnabled || i.token)
    );

  const connectedSources = integrations.filter(i => i.status === 'connected');
  const disconnectedSources = integrations.filter(i => i.status !== 'connected');

  return (
    <IntegrationsContext.Provider value={{
      integrations, setIntegrations, updateStatus, updateCredentials,
      getSourcesForType, connectedSources, disconnectedSources,
      getPipelineSources, proxyEnabled,
    }}>
      {children}
    </IntegrationsContext.Provider>
  );
}

export function useIntegrations() {
  const ctx = useContext(IntegrationsContext);
  if (!ctx) throw new Error('useIntegrations must be used within IntegrationsProvider');
  return ctx;
}
