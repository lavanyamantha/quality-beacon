import { createContext, useContext, useState, ReactNode } from 'react';

type AIDecisionMode = 'support' | 'autonomous' | 'disabled';

interface DemoModeContextType {
  demoMode: boolean;
  setDemoMode: (value: boolean) => void;
  aiMode: AIDecisionMode;
  setAiMode: (value: AIDecisionMode) => void;
}

const DemoModeContext = createContext<DemoModeContextType>({
  demoMode: true,
  setDemoMode: () => {},
  aiMode: 'support',
  setAiMode: () => {},
});

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [demoMode, setDemoMode] = useState(true);
  const [aiMode, setAiMode] = useState<AIDecisionMode>('support');
  return (
    <DemoModeContext.Provider value={{ demoMode, setDemoMode, aiMode, setAiMode }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  return useContext(DemoModeContext);
}
