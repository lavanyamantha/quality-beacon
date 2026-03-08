import { NavLink, useLocation } from 'react-router-dom';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useBranding } from '@/contexts/BrandingContext';
import { useAuth } from '@/contexts/AuthContext';
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
  X,
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
  { to: '/settings', icon: Settings, label: 'Settings', adminOnly: true },
];

interface AppSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function AppSidebar({ mobileOpen, onMobileClose }: AppSidebarProps) {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { demoMode } = useDemoMode();
  const { brandName, brandLogo } = useBranding();

  const sidebarContent = (
    <>
      <div className="p-5 border-b border-sidebar-border flex items-center justify-between">
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
        {/* Close button visible only on mobile */}
        {onMobileClose && (
          <button onClick={onMobileClose} className="lg:hidden p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onMobileClose}
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
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 bg-sidebar border-r border-sidebar-border flex-col z-50">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
