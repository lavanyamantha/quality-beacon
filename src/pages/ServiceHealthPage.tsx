import { useEffect, useState, useCallback } from 'react';
import { useRelease } from '@/contexts/ReleaseContext';
import { getMicroservicesForRelease } from '@/data/releaseDataHelper';
import { useServiceHealthConfig, LiveServiceHealth } from '@/contexts/ServiceHealthConfigContext';
import { fetchAllServiceHealth } from '@/services/healthCheckFetcher';
import { motion } from 'framer-motion';
import { useDemoMode } from '@/contexts/DemoModeContext';
import NoDataPlaceholder from '@/components/NoDataPlaceholder';
import { Badge } from '@/components/ui/badge';
import { Wifi, Database, RefreshCw, Loader2, Clock, AlertTriangle, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const healthStyles: Record<string, { dot: string; bg: string }> = {
  healthy: { dot: 'status-dot-healthy', bg: 'bg-success/5' },
  degraded: { dot: 'status-dot-degraded', bg: 'bg-warning/5' },
  down: { dot: 'status-dot-down', bg: 'bg-destructive/5' },
  unknown: { dot: 'status-dot-degraded', bg: 'bg-muted/20' },
};

const pipelineColor: Record<string, string> = {
  passing: 'text-success',
  failing: 'text-destructive',
  unstable: 'text-warning',
};

export default function ServiceHealthPage() {
  const { demoMode } = useDemoMode();
  const { activeRelease, selectedEnv } = useRelease();
  const { enabledEndpoints } = useServiceHealthConfig();

  const [liveResults, setLiveResults] = useState<LiveServiceHealth[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const hasEndpoints = enabledEndpoints.length > 0;
  const hasLiveData = liveResults.length > 0;

  const fetchHealth = useCallback(async () => {
    if (!hasEndpoints) return;
    setLoading(true);
    try {
      const results = await fetchAllServiceHealth(enabledEndpoints);
      setLiveResults(results);
      setLastRefresh(new Date().toLocaleTimeString());
    } catch {
      // keep previous results on error
    } finally {
      setLoading(false);
    }
  }, [enabledEndpoints]);

  // Initial fetch + auto-refresh
  useEffect(() => {
    if (!hasEndpoints) {
      setLiveResults([]);
      return;
    }
    fetchHealth();

    if (!autoRefresh) return;
    const interval = setInterval(fetchHealth, 30000); // 30s
    return () => clearInterval(interval);
  }, [fetchHealth, autoRefresh, hasEndpoints]);

  // No data state
  if (!demoMode && !hasLiveData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Microservice Health</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time health monitoring across all services</p>
        </div>
        <NoDataPlaceholder title="Service Health" />
        <div className="text-center space-y-3">
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Configure health check endpoints for your services in <strong>Settings → Service Health</strong> to see live status data.
          </p>
          <Link to="/settings">
            <Button variant="outline" size="sm" className="text-xs">
              <Settings size={12} className="mr-1.5" />
              Configure Health Endpoints
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Build display data: live results first, then mock fallback
  const mockServices = demoMode
    ? getMicroservicesForRelease(activeRelease, selectedEnv).map(svc => ({
        id: svc.id,
        name: svc.name,
        health: svc.health as 'healthy' | 'degraded' | 'down',
        errorRate: svc.errorRate,
        latency: svc.latency,
        coverage: svc.coverage,
        defectDensity: svc.defectDensity,
        pipelineStatus: svc.pipelineStatus,
        lastDeployment: svc.lastDeployment,
        isLive: false as const,
        source: 'Demo',
      }))
    : [];

  const liveServiceIds = new Set(liveResults.map(r => r.name.toLowerCase()));

  // Merge: live data takes priority, then mock data for services not covered
  const displayServices = [
    ...liveResults.map(lr => ({
      id: lr.id,
      name: lr.name,
      health: lr.health,
      errorRate: undefined as number | undefined,
      latency: lr.responseTimeMs,
      coverage: undefined as number | undefined,
      defectDensity: undefined as number | undefined,
      pipelineStatus: undefined as string | undefined,
      lastDeployment: undefined as string | undefined,
      isLive: true as const,
      source: lr.source,
      statusCode: lr.statusCode,
      errorMessage: lr.errorMessage,
      lastChecked: lr.lastChecked,
    })),
    ...mockServices.filter(ms => !liveServiceIds.has(ms.name.toLowerCase())),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Microservice Health</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Health monitoring for {activeRelease.version} — {selectedEnv === 'All' ? 'All environments' : selectedEnv}
          </p>
        </div>
        {hasEndpoints && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={fetchHealth}
              disabled={loading}
            >
              {loading ? <Loader2 size={12} className="mr-1 animate-spin" /> : <RefreshCw size={12} className="mr-1" />}
              Refresh
            </Button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium border transition-colors ${
                autoRefresh
                  ? 'bg-success/10 border-success/30 text-success'
                  : 'bg-muted/30 border-border text-muted-foreground'
              }`}
            >
              <Clock size={10} />
              Auto {autoRefresh ? 'ON' : 'OFF'}
            </button>
          </div>
        )}
      </div>

      {/* Data Source Banner */}
      <div className="flex items-center gap-2 flex-wrap">
        {hasLiveData && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success/10 border border-success/30">
            <Wifi size={12} className="text-success" />
            <span className="text-[11px] font-semibold text-success">
              Live — {[...new Set(liveResults.map(r => r.source))].join(', ')}
            </span>
          </div>
        )}
        {mockServices.length > 0 && mockServices.some(ms => !liveServiceIds.has(ms.name.toLowerCase())) && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-warning/10 border border-warning/30">
            <Database size={12} className="text-warning" />
            <span className="text-[11px] font-semibold text-warning">Sample Data for unconfigured services</span>
          </div>
        )}
        {lastRefresh && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/40 border border-border">
            <Clock size={10} className="text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Last check: {lastRefresh}</span>
          </div>
        )}
        {!hasEndpoints && demoMode && (
          <Link to="/settings" className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-colors">
            <Settings size={11} className="text-primary" />
            <span className="text-[11px] font-medium text-primary">Configure health endpoints for live data →</span>
          </Link>
        )}
      </div>

      {/* Summary bar */}
      {displayServices.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          <SummaryCard label="Total Services" value={displayServices.length} />
          <SummaryCard label="Healthy" value={displayServices.filter(s => s.health === 'healthy').length} color="text-success" />
          <SummaryCard label="Degraded" value={displayServices.filter(s => s.health === 'degraded').length} color="text-warning" />
          <SummaryCard label="Down" value={displayServices.filter(s => s.health === 'down').length} color="text-destructive" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {displayServices.map((svc, i) => (
          <motion.div
            key={svc.id}
            className={`dashboard-card ${healthStyles[svc.health]?.bg || 'bg-muted/10'}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className={healthStyles[svc.health]?.dot || 'status-dot-degraded'} />
              <h3 className="text-sm font-semibold text-foreground flex-1 truncate">{svc.name}</h3>
              <Badge
                variant={svc.isLive ? 'default' : 'secondary'}
                className={`text-[9px] uppercase ${svc.isLive ? 'bg-success/20 text-success border-success/30' : 'bg-muted text-muted-foreground'}`}
              >
                {svc.isLive ? 'Live' : 'Demo'}
              </Badge>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{svc.health}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {svc.isLive ? (
                <>
                  <Metric label="Response Time" value={`${svc.latency}ms`} warn={svc.latency > 3000} />
                  {svc.statusCode !== undefined && (
                    <Metric label="Status Code" value={`${svc.statusCode}`} warn={svc.statusCode >= 400} />
                  )}
                  {svc.errorMessage && (
                    <div className="col-span-2">
                      <div className="flex items-start gap-1.5 text-[10px] text-warning">
                        <AlertTriangle size={10} className="shrink-0 mt-0.5" />
                        <span>{svc.errorMessage}</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Metric label="Error Rate" value={`${svc.errorRate?.toFixed(1)}%`} warn={(svc.errorRate || 0) > 1} />
                  <Metric label="Latency" value={`${svc.latency}ms`} warn={(svc.latency || 0) > 300} />
                  <Metric label="Coverage" value={`${svc.coverage}%`} warn={(svc.coverage || 0) < 75} />
                  <Metric label="Defect Density" value={(svc.defectDensity || 0).toFixed(1)} warn={(svc.defectDensity || 0) > 3} />
                </>
              )}
            </div>

            {!svc.isLive && svc.pipelineStatus && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <span className="text-[10px] text-muted-foreground">
                  Pipeline: <span className={`font-medium ${pipelineColor[svc.pipelineStatus]}`}>{svc.pipelineStatus}</span>
                </span>
                <span className="text-[10px] text-muted-foreground">Deploy: {svc.lastDeployment}</span>
              </div>
            )}

            {svc.isLive && svc.lastChecked && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <span className="text-[10px] text-muted-foreground">Source: {svc.source}</span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {new Date(svc.lastChecked).toLocaleTimeString()}
                </span>
              </div>
            )}
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

function SummaryCard({ label, value, color = 'text-foreground' }: { label: string; value: number; color?: string }) {
  return (
    <div className="dashboard-card py-3">
      <p className="metric-label">{label}</p>
      <p className={`text-lg font-bold font-mono ${color}`}>{value}</p>
    </div>
  );
}
