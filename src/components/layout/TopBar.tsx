import { Bell, Search, Menu, FlaskConical, LogOut, Shield } from 'lucide-react';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useRelease } from '@/contexts/ReleaseContext';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const statusStyle: Record<string, string> = {
  released: 'bg-success/20 text-success',
  ready: 'bg-primary/20 text-primary',
  risk: 'bg-warning/20 text-warning',
  blocked: 'bg-destructive/20 text-destructive',
};

interface TopBarProps {
  onMenuToggle?: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const { demoMode } = useDemoMode();
  const { activeRelease, selectedEnv } = useRelease();
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        {/* Hamburger for mobile */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Menu size={20} />
        </button>

        {demoMode ? (
          <>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground">
              <span className="text-xs font-medium">Release:</span>
              <span className="text-xs font-bold text-primary">{activeRelease.version}</span>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusStyle[activeRelease.status]}`}>
                {activeRelease.status}
              </Badge>
            </div>
            <div className="sm:hidden text-xs font-bold text-primary">{activeRelease.version}</div>
            <div className="hidden md:block text-xs text-muted-foreground">
              Env: <span className="font-medium text-foreground">{selectedEnv}</span>
            </div>
            {demoMode && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-warning/15 border border-warning/30 text-warning">
                <FlaskConical size={13} />
                <span className="text-[11px] font-semibold">Demo Data</span>
              </div>
            )}
          </>
        ) : (
          <div className="text-xs text-muted-foreground">No release data</div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          <Search size={16} />
        </button>
        <button className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground relative">
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
        </button>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1 rounded-md hover:bg-secondary transition-colors">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-7 h-7 rounded-full" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <Badge variant="outline" className="text-[10px] mt-1">
                  {isAdmin ? <><Shield size={10} className="mr-1" /> Admin</> : 'Viewer'}
                </Badge>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                <LogOut size={14} className="mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            QA
          </div>
        )}
      </div>
    </header>
  );
}
