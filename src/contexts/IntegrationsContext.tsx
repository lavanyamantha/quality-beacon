import { createContext, useContext, useState, ReactNode } from 'react';
import { loadIntegrationsFromEnv } from '@/config/integrations';

export interface IntegrationSource {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  /** Which timeline event types this source provides */
  provides: Array<'release' | 'deployment' | 'pipeline' | 'defect' | 'test'>;
  /** Base URL for the integration */
  url?: string;
  /** Authentication token / API key */
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
}

const IntegrationsContext = createContext<IntegrationsContextType | undefined>(undefined);

export function IntegrationsProvider({ children }: { children: ReactNode }) {
  const [integrations, setIntegrations] = useState<IntegrationSource[]>(() => loadIntegrationsFromEnv());

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
    integrations.filter(i => i.provides.includes('pipeline') && i.status === 'connected' && i.token);

  const connectedSources = integrations.filter(i => i.status === 'connected');
  const disconnectedSources = integrations.filter(i => i.status !== 'connected');

  return (
    <IntegrationsContext.Provider value={{ integrations, setIntegrations, updateStatus, updateCredentials, getSourcesForType, connectedSources, disconnectedSources, getPipelineSources }}>
      {children}
    </IntegrationsContext.Provider>
  );
}

export function useIntegrations() {
  const ctx = useContext(IntegrationsContext);
  if (!ctx) throw new Error('useIntegrations must be used within IntegrationsProvider');
  return ctx;
}
