import { createContext, useContext, useState, type ReactNode } from 'react';

interface BrandingContextType {
  brandName: string;
  setBrandName: (name: string) => void;
  brandLogo: string | null;
  setBrandLogo: (logo: string | null) => void;
  brandLogoName: string | null;
  setBrandLogoName: (name: string | null) => void;
  brandTheme: string;
  setBrandTheme: (theme: string) => void;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [brandName, setBrandName] = useState('AI QA Command Center');
  const [brandLogo, setBrandLogo] = useState<string | null>(null);
  const [brandLogoName, setBrandLogoName] = useState<string | null>(null);
  const [brandTheme, setBrandTheme] = useState('dark');

  return (
    <BrandingContext.Provider value={{ brandName, setBrandName, brandLogo, setBrandLogo, brandLogoName, setBrandLogoName, brandTheme, setBrandTheme }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error('useBranding must be used within BrandingProvider');
  return ctx;
}
