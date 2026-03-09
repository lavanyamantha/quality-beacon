import { useRelease } from '@/contexts/ReleaseContext';
import { getFlakyTestsForRelease } from '@/data/releaseDataHelper';
import { Zap } from 'lucide-react';

export default function FlakyTestCard() {
  const { activeRelease } = useRelease();
  const flakyTests = getFlakyTestsForRelease(activeRelease);
  const sorted = [...flakyTests].sort((a, b) => b.flakinessScore - a.flakinessScore);

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-warning" />
          <span className="dashboard-card-title">Top Flaky Tests</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {sorted.slice(0, 5).map(t => (
          <div key={t.id} className="flex items-center gap-3 min-w-0">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono text-foreground truncate">{t.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{t.module}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-12 sm:w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${t.flakinessScore}%`,
                    backgroundColor: t.flakinessScore > 25 ? 'hsl(var(--destructive))' : 'hsl(var(--warning))',
                  }}
                />
              </div>
              <span className="text-xs font-mono text-warning w-8 text-right">{t.flakinessScore}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
