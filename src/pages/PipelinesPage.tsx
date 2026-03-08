import { useEffect, useState } from 'react';
import { useRelease } from '@/contexts/ReleaseContext';
import { getPipelinesForRelease } from '@/data/releaseDataHelper';
import { CheckCircle, XCircle, AlertTriangle, Loader2, Database, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useIntegrations } from '@/contexts/IntegrationsContext';
import { fetchAllPipelines, type PipelineWithSource } from '@/services/pipelineFetcher';
import NoDataPlaceholder from '@/components/NoDataPlaceholder';
import { Badge } from '@/components/ui/badge';

const statusConfig = {
  passing: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/5' },
  failing: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/5' },
  unstable: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/5' },
};

export default function PipelinesPage() {
  const { demoMode } = useDemoMode();
  const { activeRelease } = useRelease();
  const { getPipelineSources } = useIntegrations();

  const [livePipelines, setLivePipelines] = useState<PipelineWithSource[]>([]);
  const [liveSourceNames, setLiveSourceNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const pipelineSources = getPipelineSources();

  // Fetch real data from connected sources
  useEffect(() => {
    if (pipelineSources.length === 0) {
      setLivePipelines([]);
      setLiveSourceNames([]);
      setHasFetched(true);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchAllPipelines(pipelineSources).then(({ pipelines, fetchedFrom }) => {
      if (!cancelled) {
        setLivePipelines(pipelines);
        setLiveSourceNames(fetchedFrom);
        setHasFetched(true);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) {
        setLivePipelines([]);
        setLiveSourceNames([]);
        setHasFetched(true);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [pipelineSources.map(s => `${s.id}-${s.token}`).join(',')]);

  // Determine what to display
  const hasLiveData = livePipelines.length > 0;
  const showMock = demoMode && !hasLiveData;

  const mockPipelines: PipelineWithSource[] = showMock
    ? getPipelinesForRelease(activeRelease).map(p => ({
        ...p,
        source: 'Demo',
        sourceType: 'demo',
        isLive: false,
      }))
    : [];

  const displayPipelines = hasLiveData ? livePipelines : mockPipelines;

  if (!demoMode && !hasLiveData && hasFetched && !loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">CI/CD Pipelines</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Pipeline stability and execution metrics</p>
        </div>
        <NoDataPlaceholder title="Pipelines" />
        <p className="text-xs text-muted-foreground text-center">
          Connect GitHub or GitLab in Settings → Integrations with a valid token to see live pipeline data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">CI/CD Pipelines</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Pipeline metrics{hasLiveData ? '' : ` for ${activeRelease.version}`}
        </p>
      </div>

      {/* Data Source Banner */}
      <div className="flex items-center gap-2 flex-wrap">
        {hasLiveData && liveSourceNames.map(name => (
          <div key={name} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success/10 border border-success/30">
            <Wifi size={12} className="text-success" />
            <span className="text-[11px] font-semibold text-success">Live — {name}</span>
          </div>
        ))}
        {showMock && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-warning/10 border border-warning/30">
            <Database size={12} className="text-warning" />
            <span className="text-[11px] font-semibold text-warning">Sample Data — No live sources configured</span>
          </div>
        )}
        {loading && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/30 border border-border">
            <Loader2 size={12} className="text-muted-foreground animate-spin" />
            <span className="text-[11px] font-medium text-muted-foreground">Fetching live data…</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayPipelines.map((p, i) => {
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
                <span className="font-mono text-sm font-semibold text-foreground flex-1 truncate">{p.name}</span>
                <Badge
                  variant={p.isLive ? 'default' : 'secondary'}
                  className={`text-[9px] uppercase ${p.isLive ? 'bg-success/20 text-success border-success/30' : 'bg-muted text-muted-foreground'}`}
                >
                  {p.isLive ? p.source : 'Demo'}
                </Badge>
                <span className={`text-[10px] font-medium uppercase ${cfg.color}`}>{p.status}</span>
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
