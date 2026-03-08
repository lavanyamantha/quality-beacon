import { createContext, useContext, useState, ReactNode } from 'react';
import { releases, Release } from '@/data/mockData';

interface ReleaseContextType {
  selectedReleaseId: string;
  selectedEnv: string;
  setSelectedReleaseId: (id: string) => void;
  setSelectedEnv: (env: string) => void;
  activeRelease: Release;
}

const ReleaseContext = createContext<ReleaseContextType | undefined>(undefined);

export function ReleaseProvider({ children }: { children: ReactNode }) {
  const [selectedReleaseId, setSelectedReleaseId] = useState(
    releases.find(r => r.status === 'risk')?.id || releases[0].id
  );
  const [selectedEnv, setSelectedEnv] = useState('All');

  const activeRelease = releases.find(r => r.id === selectedReleaseId) || releases[0];

  return (
    <ReleaseContext.Provider value={{ selectedReleaseId, selectedEnv, setSelectedReleaseId, setSelectedEnv, activeRelease }}>
      {children}
    </ReleaseContext.Provider>
  );
}

export function useRelease() {
  const ctx = useContext(ReleaseContext);
  if (!ctx) throw new Error('useRelease must be used within ReleaseProvider');
  return ctx;
}
