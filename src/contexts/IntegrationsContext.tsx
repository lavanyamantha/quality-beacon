import { createContext, useContext, useState, ReactNode } from 'react';

export interface IntegrationSource {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  /** Which timeline event types this source provides */
  provides: Array<'release' | 'deployment' | 'pipeline' | 'defect' | 'test'>;
}

interface IntegrationsContextType {
  integrations: IntegrationSource[];
  setIntegrations: (integrations: IntegrationSource[]) => void;
  updateStatus: (id: string, status: IntegrationSource['status'], lastSync?: string) => void;
  getSourcesForType: (type: string) => IntegrationSource[];
  connectedSources: IntegrationSource[];
  disconnectedSources: IntegrationSource[];
}

const IntegrationsContext = createContext<IntegrationsContextType | undefined>(undefined);

const defaultIntegrations: IntegrationSource[] = [
  {
    id: '1', name: 'Azure DevOps', type: 'azure-devops', status: 'connected', lastSync: '2026-03-08 09:14',
    provides: ['release', 'deployment', 'pipeline', 'test'],
  },
  {
    id: '2', name: 'Jira Cloud', type: 'jira', status: 'disconnected',
    provides: ['defect'],
  },
  {
    id: '3', name: 'SonarQube', type: 'sonarqube', status: 'connected', lastSync: '2026-03-08 08:30',
    provides: ['test'],
  },
  {
    id: '4', name: 'GitHub', type: 'github', status: 'disconnected',
    provides: ['release', 'deployment'],
  },
];

export function IntegrationsProvider({ children }: { children: ReactNode }) {
  const [integrations, setIntegrations] = useState<IntegrationSource[]>(defaultIntegrations);

  const updateStatus = (id: string, status: IntegrationSource['status'], lastSync?: string) => {
    setIntegrations(prev =>
      prev.map(i => i.id === id ? { ...i, status, lastSync: lastSync ?? i.lastSync } : i)
    );
  };

  const getSourcesForType = (type: string) =>
    integrations.filter(i => i.provides.includes(type as any));

  const connectedSources = integrations.filter(i => i.status === 'connected');
  const disconnectedSources = integrations.filter(i => i.status !== 'connected');

  return (
    <IntegrationsContext.Provider value={{ integrations, setIntegrations, updateStatus, getSourcesForType, connectedSources, disconnectedSources }}>
      {children}
    </IntegrationsContext.Provider>
  );
}

export function useIntegrations() {
  const ctx = useContext(IntegrationsContext);
  if (!ctx) throw new Error('useIntegrations must be used within IntegrationsProvider');
  return ctx;
}
