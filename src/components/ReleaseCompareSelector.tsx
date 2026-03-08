import { useState } from 'react';
import { releases, Release } from '@/data/mockData';
import { useRelease } from '@/contexts/ReleaseContext';
import { GitCompareArrows, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface ReleaseCompareSelectorProps {
  onCompareChange: (compareRelease: Release | null) => void;
  compareRelease: Release | null;
}

const statusColors: Record<string, string> = {
  released: 'bg-success/15 text-success border-success/30',
  ready: 'bg-primary/15 text-primary border-primary/30',
  risk: 'bg-warning/15 text-warning border-warning/30',
  blocked: 'bg-destructive/15 text-destructive border-destructive/30',
};

export default function ReleaseCompareSelector({ onCompareChange, compareRelease }: ReleaseCompareSelectorProps) {
  const { activeRelease } = useRelease();

  const otherReleases = releases.filter(r => r.id !== activeRelease.id);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Current</span>
        <span className="text-xs font-semibold font-mono text-primary">{activeRelease.version}</span>
        <Badge variant="outline" className={`text-[9px] uppercase ${statusColors[activeRelease.status]}`}>
          {activeRelease.status}
        </Badge>
      </div>

      {compareRelease ? (
        <>
          <GitCompareArrows size={16} className="text-accent" />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/30">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Compare</span>
            <span className="text-xs font-semibold font-mono text-accent">{compareRelease.version}</span>
            <Badge variant="outline" className={`text-[9px] uppercase ${statusColors[compareRelease.status]}`}>
              {compareRelease.status}
            </Badge>
            <button
              onClick={() => onCompareChange(null)}
              className="ml-1 p-0.5 rounded hover:bg-destructive/20 transition-colors"
            >
              <X size={12} className="text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        </>
      ) : (
        <Select onValueChange={(id) => {
          const rel = releases.find(r => r.id === id);
          if (rel) onCompareChange(rel);
        }}>
          <SelectTrigger className="w-[200px] h-8 text-xs bg-secondary/50 border-border">
            <div className="flex items-center gap-1.5">
              <GitCompareArrows size={12} className="text-muted-foreground" />
              <SelectValue placeholder="Compare with release…" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {otherReleases.map(r => (
              <SelectItem key={r.id} value={r.id} className="text-xs">
                <span className="font-mono">{r.version}</span>
                <span className="text-muted-foreground ml-2">({r.status})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
