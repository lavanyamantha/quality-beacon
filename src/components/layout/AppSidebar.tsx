import { NavLink, useLocation } from 'react-router-dom';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useBranding } from '@/contexts/BrandingContext';
import {
  LayoutDashboard,
  Activity,
  TestTube2,
  Bug,
  Shield,
  GitBranch,
  Cpu,
  BarChart3,
  Bot,
  Settings,
  Zap,
  Clock,
  BookOpen,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/release-advisor', icon: Bot, label: 'Release Advisor' },
  { to: '/services', icon: Activity, label: 'Service Health' },
  { to: '/test-analytics', icon: TestTube2, label: 'Test Analytics' },
  { to: '/flaky-tests', icon: Zap, label: 'Flaky Tests' },
  { to: '/defects', icon: Bug, label: 'Defect Analytics' },
  { to: '/coverage', icon: Shield, label: 'Coverage Insights' },
  { to: '/pipelines', icon: GitBranch, label: 'Pipelines' },
  { to: '/timeline', icon: Clock, label: 'Release Timeline' },
  { to: '/risk', icon: BarChart3, label: 'Risk Prediction' },
  { to: '/ai-assistant', icon: Cpu, label: 'QA Assistant' },
  { to: '/docs', icon: BookOpen, label: 'Documentation' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppSidebar() {
  const location = useLocation();
  const { demoMode } = useDemoMode();
  const { brandName, brandLogo } = useBranding();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          {brandLogo ? (
            <img src={brandLogo} alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
          ) : (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center glow-primary" style={{ background: 'var(--gradient-primary)' }}>
              <Cpu className="w-4.5 h-4.5 text-primary-foreground" size={18} />
            </div>
          )}
          <h1 className="text-sm font-bold text-foreground leading-snug break-words max-w-[160px]">{brandName}</h1>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={
              location.pathname === to
                ? 'sidebar-item-active'
                : 'sidebar-item'
            }
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-1">
          <div className={demoMode ? 'status-dot-healthy' : 'w-2 h-2 rounded-full bg-muted-foreground'} />
          <span className="text-xs text-muted-foreground">{demoMode ? 'Demo Mode Active' : 'Live Mode'}</span>
        </div>
      </div>
    </aside>
  );
}
