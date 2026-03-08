import { useRelease } from '@/contexts/ReleaseContext';
import { getPipelinesForRelease } from '@/data/releaseDataHelper';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDemoMode } from '@/contexts/DemoModeContext';
import NoDataPlaceholder from '@/components/NoDataPlaceholder';

const statusConfig = {
  passing: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/5' },
  failing: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/5' },
  unstable: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/5' },
};

export default function PipelinesPage() {
  const { demoMode } = useDemoMode();
  const { activeRelease } = useRelease();

  if (!demoMode) return (<div className="space-y-6"><div><h1 className="text-xl font-bold text-foreground">CI/CD Pipelines</h1><p className="text-sm text-muted-foreground mt-0.5">Pipeline stability and execution metrics</p></div><NoDataPlaceholder title="Pipelines" /></div>);

  const pipelines = getPipelinesForRelease(activeRelease);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">CI/CD Pipelines</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Pipeline metrics for {activeRelease.version}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pipelines.map((p, i) => {
          const cfg = statusConfig[p.status];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={p.id}
              className={`dashboard-card ${cfg.bg}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Icon size={16} className={cfg.color} />
                <span className="font-mono text-sm font-semibold text-foreground">{p.name}</span>
                <span className={`ml-auto text-[10px] font-medium uppercase ${cfg.color}`}>{p.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Success Rate</p>
                  <p className={`text-lg font-bold font-mono ${p.successRate < 80 ? 'text-warning' : 'text-foreground'}`}>{p.successRate}%</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Duration</p>
                  <p className="text-lg font-bold font-mono text-foreground">{p.duration}m</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Last Run</p>
                  <p className="text-xs font-mono text-muted-foreground mt-1">{p.lastRun}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
