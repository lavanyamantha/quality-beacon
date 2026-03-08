import { useRelease } from '@/contexts/ReleaseContext';
import { getTimelineForRelease } from '@/data/releaseDataHelper';
import { motion } from 'framer-motion';
import { GitBranch, Rocket, TestTube2, Bug, Clock, CheckCircle2, XCircle, Database, ExternalLink } from 'lucide-react';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useIntegrations } from '@/contexts/IntegrationsContext';
import NoDataPlaceholder from '@/components/NoDataPlaceholder';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const typeConfig: Record<string, { icon: any; color: string; dot: string; label: string }> = {
  release: { icon: Rocket, color: 'text-primary', dot: 'bg-primary', label: 'Release' },
  deployment: { icon: GitBranch, color: 'text-accent', dot: 'bg-accent', label: 'Deployment' },
  pipeline: { icon: Clock, color: 'text-warning', dot: 'bg-warning', label: 'Pipeline' },
  defect: { icon: Bug, color: 'text-destructive', dot: 'bg-destructive', label: 'Defect' },
  test: { icon: TestTube2, color: 'text-success', dot: 'bg-success', label: 'Test' },
};

/** Maps event types → which integration types can provide this data */
const typeToIntegrationMap: Record<string, string[]> = {
  release: ['azure-devops', 'github'],
  deployment: ['azure-devops', 'github'],
  pipeline: ['azure-devops'],
  defect: ['jira'],
  test: ['azure-devops', 'sonarqube'],
};

export default function TimelinePage() {
  const { demoMode } = useDemoMode();
  const { activeRelease } = useRelease();
  const { integrations, connectedSources, disconnectedSources, getSourcesForType } = useIntegrations();

  if (!demoMode) return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Release Quality Timeline</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Key events during release cycle</p>
      </div>
      <NoDataPlaceholder title="Timeline" />
    </div>
  );

  const timeline = getTimelineForRelease(activeRelease);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-foreground">Release Quality Timeline</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Key events during {activeRelease.version} cycle</p>
      </div>

      {/* ── Data Sources Banner ── */}
      <Card className="border-border/60 bg-card/80">
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-2 mb-2.5">
            <Database size={14} className="text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Data Sources</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {integrations.map(src => {
              const isConnected = src.status === 'connected';
              return (
                <Tooltip key={src.id}>
                  <TooltipTrigger asChild>
                    <div
                      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors ${
                        isConnected
                          ? 'border-success/30 bg-success/5 text-success'
                          : 'border-border bg-muted/30 text-muted-foreground'
                      }`}
                    >
                      {isConnected
                        ? <CheckCircle2 size={12} className="flex-shrink-0" />
                        : <XCircle size={12} className="flex-shrink-0" />
                      }
                      <span className="font-medium">{src.name}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[220px]">
                    <p className="font-medium text-xs mb-1">{src.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {isConnected
                        ? `Connected · Last sync: ${src.lastSync ?? 'N/A'}`
                        : 'Not connected — using sample data'
                      }
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Provides: {src.provides.map(p => typeConfig[p]?.label ?? p).join(', ')}
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
          {disconnectedSources.length > 0 && (
            <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
              <ExternalLink size={10} />
              Connect missing sources in <a href="/settings" className="underline text-primary hover:text-primary/80">Settings → Integrations</a> for live data
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Timeline ── */}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
        <div className="space-y-0">
          {timeline.map((item, i) => {
            const cfg = typeConfig[item.type];
            const Icon = cfg.icon;
            const sources = getSourcesForType(item.type);
            const liveSource = sources.find(s => s.status === 'connected');

            return (
              <motion.div
                key={i}
                className="relative flex items-start gap-4 py-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${cfg.dot}/20`}>
                  <Icon size={14} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm text-foreground">{item.event}</p>
                    {liveSource ? (
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-success/30 text-success bg-success/5 font-normal">
                        {liveSource.name}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-border text-muted-foreground font-normal">
                        Sample
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{item.date}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
