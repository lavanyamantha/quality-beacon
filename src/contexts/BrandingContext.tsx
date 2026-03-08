import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface BrandingContextType {
  brandName: string;
  setBrandName: (name: string) => void;
  brandLogo: string | null;
  setBrandLogo: (logo: string | null) => void;
  brandLogoName: string | null;
  setBrandLogoName: (name: string | null) => void;
  brandTheme: string;
  setBrandTheme: (theme: string) => void;
  primaryColor: string;
  setPrimaryColor: (hsl: string) => void;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

/** Derive related colors from a primary HSL string like "190 90% 50%" */
function applyPrimaryColor(hsl: string) {
  const root = document.documentElement;
  root.style.setProperty('--primary', hsl);
  root.style.setProperty('--ring', hsl);
  root.style.setProperty('--sidebar-primary', hsl);
  root.style.setProperty('--sidebar-ring', hsl);
  root.style.setProperty('--chart-1', hsl);

  // Parse hue for gradient
  const hue = parseInt(hsl.split(' ')[0], 10);
  root.style.setProperty('--gradient-primary', `linear-gradient(135deg, hsl(${hsl}), hsl(${hue + 20} 80% 55%))`);
  root.style.setProperty('--shadow-glow-primary', `0 0 20px hsl(${hsl} / 0.15)`);
}

function applyTheme(theme: string) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark);

  if (isDark) {
    // Dark theme values
    root.style.setProperty('--background', '220 20% 7%');
    root.style.setProperty('--foreground', '210 20% 92%');
    root.style.setProperty('--card', '220 18% 10%');
    root.style.setProperty('--card-foreground', '210 20% 92%');
    root.style.setProperty('--popover', '220 18% 12%');
    root.style.setProperty('--popover-foreground', '210 20% 92%');
    root.style.setProperty('--secondary', '220 16% 16%');
    root.style.setProperty('--secondary-foreground', '210 20% 80%');
    root.style.setProperty('--muted', '220 14% 14%');
    root.style.setProperty('--muted-foreground', '215 12% 50%');
    root.style.setProperty('--border', '220 14% 18%');
    root.style.setProperty('--input', '220 14% 18%');
    root.style.setProperty('--sidebar-background', '220 20% 5%');
    root.style.setProperty('--sidebar-foreground', '210 15% 70%');
    root.style.setProperty('--sidebar-accent', '220 16% 12%');
    root.style.setProperty('--sidebar-accent-foreground', '210 20% 92%');
    root.style.setProperty('--sidebar-border', '220 14% 14%');
    root.style.setProperty('--shadow-card', '0 4px 24px hsl(0 0% 0% / 0.3)');
  } else {
    // Light theme values
    root.style.setProperty('--background', '0 0% 98%');
    root.style.setProperty('--foreground', '220 20% 12%');
    root.style.setProperty('--card', '0 0% 100%');
    root.style.setProperty('--card-foreground', '220 20% 12%');
    root.style.setProperty('--popover', '0 0% 100%');
    root.style.setProperty('--popover-foreground', '220 20% 12%');
    root.style.setProperty('--secondary', '220 14% 92%');
    root.style.setProperty('--secondary-foreground', '220 16% 30%');
    root.style.setProperty('--muted', '220 14% 94%');
    root.style.setProperty('--muted-foreground', '215 12% 45%');
    root.style.setProperty('--border', '220 14% 86%');
    root.style.setProperty('--input', '220 14% 86%');
    root.style.setProperty('--sidebar-background', '220 14% 96%');
    root.style.setProperty('--sidebar-foreground', '220 15% 40%');
    root.style.setProperty('--sidebar-accent', '220 14% 90%');
    root.style.setProperty('--sidebar-accent-foreground', '220 20% 12%');
    root.style.setProperty('--sidebar-border', '220 14% 88%');
    root.style.setProperty('--shadow-card', '0 4px 24px hsl(0 0% 0% / 0.06)');
  }
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [brandName, setBrandName] = useState('AI QA Command Center');
  const [brandLogo, setBrandLogo] = useState<string | null>(null);
  const [brandLogoName, setBrandLogoName] = useState<string | null>(null);
  const [brandTheme, setBrandThemeState] = useState('dark');
  const [primaryColor, setPrimaryColorState] = useState('190 90% 50%');

  const setBrandTheme = (theme: string) => {
    setBrandThemeState(theme);
    applyTheme(theme);
  };

  const setPrimaryColor = (hsl: string) => {
    setPrimaryColorState(hsl);
    applyPrimaryColor(hsl);
  };

  // Apply on mount
  useEffect(() => {
    applyTheme(brandTheme);
    applyPrimaryColor(primaryColor);
  }, []);

  // Listen for system theme changes when "system" is selected
  useEffect(() => {
    if (brandTheme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [brandTheme]);

  return (
    <BrandingContext.Provider value={{
      brandName, setBrandName, brandLogo, setBrandLogo,
      brandLogoName, setBrandLogoName, brandTheme, setBrandTheme,
      primaryColor, setPrimaryColor,
    }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error('useBranding must be used within BrandingProvider');
  return ctx;
}
