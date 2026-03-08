import { Bell, Search } from 'lucide-react';
import { currentRelease } from '@/data/mockData';

export default function TopBar() {
  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground">
          <span className="text-xs font-medium">Release:</span>
          <span className="text-xs font-bold text-primary">{currentRelease.version}</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-warning/20 text-warning uppercase">
            {currentRelease.status}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          Env: <span className="font-medium text-foreground">{currentRelease.environment}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          <Search size={16} />
        </button>
        <button className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground relative">
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
        </button>
        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
          QA
        </div>
      </div>
    </header>
  );
}
