import { createContext, useContext, useState, ReactNode } from 'react';

interface DemoModeContextType {
  demoMode: boolean;
  setDemoMode: (value: boolean) => void;
}

const DemoModeContext = createContext<DemoModeContextType>({ demoMode: true, setDemoMode: () => {} });

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [demoMode, setDemoMode] = useState(true);
  return (
    <DemoModeContext.Provider value={{ demoMode, setDemoMode }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  return useContext(DemoModeContext);
}
