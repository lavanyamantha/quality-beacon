import { useRelease } from '@/contexts/ReleaseContext';
import { getMicroservicesForRelease } from '@/data/releaseDataHelper';
import { motion } from 'framer-motion';
import { useDemoMode } from '@/contexts/DemoModeContext';
import NoDataPlaceholder from '@/components/NoDataPlaceholder';

const healthStyles: Record<string, { dot: string; bg: string }> = {
  healthy: { dot: 'status-dot-healthy', bg: 'bg-success/5' },
  degraded: { dot: 'status-dot-degraded', bg: 'bg-warning/5' },
  down: { dot: 'status-dot-down', bg: 'bg-destructive/5' },
};

const pipelineColor: Record<string, string> = {
  passing: 'text-success',
  failing: 'text-destructive',
  unstable: 'text-warning',
};

export default function ServiceHealthPage() {
  const { demoMode } = useDemoMode();
  const { activeRelease, selectedEnv } = useRelease();

  if (!demoMode) return (<div className="space-y-6"><div><h1 className="text-xl font-bold text-foreground">Microservice Health</h1><p className="text-sm text-muted-foreground mt-0.5">Real-time health monitoring across all services</p></div><NoDataPlaceholder title="Service Health" /></div>);

  const services = getMicroservicesForRelease(activeRelease, selectedEnv);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Microservice Health</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Health monitoring for {activeRelease.version} — {selectedEnv === 'All' ? 'All environments' : selectedEnv}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {services.map((svc, i) => (
          <motion.div
            key={svc.id}
            className={`dashboard-card ${healthStyles[svc.health].bg}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className={healthStyles[svc.health].dot} />
              <h3 className="text-sm font-semibold text-foreground">{svc.name}</h3>
              <span className="ml-auto text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{svc.health}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Metric label="Error Rate" value={`${svc.errorRate.toFixed(1)}%`} warn={svc.errorRate > 1} />
              <Metric label="Latency" value={`${svc.latency}ms`} warn={svc.latency > 300} />
              <Metric label="Coverage" value={`${svc.coverage}%`} warn={svc.coverage < 75} />
              <Metric label="Defect Density" value={svc.defectDensity.toFixed(1)} warn={svc.defectDensity > 3} />
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className="text-[10px] text-muted-foreground">Pipeline: <span className={`font-medium ${pipelineColor[svc.pipelineStatus]}`}>{svc.pipelineStatus}</span></span>
              <span className="text-[10px] text-muted-foreground">Deploy: {svc.lastDeployment}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value, warn }: { label: string; value: string; warn: boolean }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`text-sm font-mono font-semibold ${warn ? 'text-warning' : 'text-foreground'}`}>{value}</p>
    </div>
  );
}
