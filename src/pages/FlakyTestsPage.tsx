import { flakyTests } from '@/data/mockData';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useDemoMode } from '@/contexts/DemoModeContext';
import NoDataPlaceholder from '@/components/NoDataPlaceholder';

export default function FlakyTestsPage() {
  const { demoMode } = useDemoMode();
  if (!demoMode) return (<div className="space-y-6"><div><h1 className="text-xl font-bold text-foreground">Flaky Test Detection</h1><p className="text-sm text-muted-foreground mt-0.5">Identify and track unreliable tests across pipelines</p></div><NoDataPlaceholder title="Flaky Tests" /></div>);
  const sorted = [...flakyTests].sort((a, b) => b.flakinessScore - a.flakinessScore);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Flaky Test Detection</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Identify and track unreliable tests across pipelines</p>
      </div>

      <div className="dashboard-card">
        <table className="w-full">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
              <th className="pb-3 font-medium">Test Name</th>
              <th className="pb-3 font-medium">Module</th>
              <th className="pb-3 font-medium text-center">Pass</th>
              <th className="pb-3 font-medium text-center">Fail</th>
              <th className="pb-3 font-medium">Flakiness</th>
              <th className="pb-3 font-medium">Last Flaky</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t, i) => (
              <motion.tr
                key={t.id}
                className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <Zap size={12} className="text-warning" />
                    <span className="text-sm font-mono text-foreground">{t.name}</span>
                  </div>
                </td>
                <td className="py-3 text-sm text-muted-foreground">{t.module}</td>
                <td className="py-3 text-sm text-center text-success font-mono">{t.passCount}</td>
                <td className="py-3 text-sm text-center text-destructive font-mono">{t.failCount}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full" style={{
                        width: `${t.flakinessScore}%`,
                        backgroundColor: t.flakinessScore > 25 ? 'hsl(var(--destructive))' : 'hsl(var(--warning))',
                      }} />
                    </div>
                    <span className="text-xs font-mono text-warning">{t.flakinessScore}%</span>
                  </div>
                </td>
                <td className="py-3 text-xs text-muted-foreground font-mono">{t.lastFlaky}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
