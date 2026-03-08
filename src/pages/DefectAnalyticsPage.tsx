import { useState, useCallback } from 'react';
import { useRelease } from '@/contexts/ReleaseContext';
import { getDefectsForRelease, getDefectsByReleaseForRelease } from '@/data/releaseDataHelper';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useIntegrations } from '@/contexts/IntegrationsContext';
import NoDataPlaceholder from '@/components/NoDataPlaceholder';
import ReleaseCompareSelector from '@/components/ReleaseCompareSelector';
import { Release } from '@/data/mockData';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';

const severityBg: Record<string, string> = {
  critical: 'bg-destructive/10 text-destructive',
  major: 'bg-risk-high/10 text-risk-high',
  minor: 'bg-warning/10 text-warning',
  trivial: 'bg-muted text-muted-foreground',
};

const statusBg: Record<string, string> = {
  open: 'bg-destructive/10 text-destructive',
  'in-progress': 'bg-info/10 text-info',
  resolved: 'bg-success/10 text-success',
  closed: 'bg-muted text-muted-foreground',
};

export default function DefectAnalyticsPage() {
  const { demoMode } = useDemoMode();
  const { activeRelease } = useRelease();
  const { integrations } = useIntegrations();
  const [compareRelease, setCompareRelease] = useState<Release | null>(null);

  // Find connected defect source for deep-linking
  const defectSource = integrations.find(i => i.provides.includes('defect') && i.status === 'connected');

  const buildDefectUrl = useCallback((defectId: string) => {
    if (!defectSource?.url) return null;
    const baseUrl = defectSource.url.replace(/\/+$/, '');
    switch (defectSource.type) {
      case 'jira':
        return `${baseUrl}/browse/${defectId}`;
      case 'azure-devops':
        return `${baseUrl}/_workitems/edit/${defectId.replace(/\D/g, '')}`;
      case 'github':
        return `${baseUrl}/issues?q=${encodeURIComponent(defectId)}`;
      case 'gitlab':
        return `${baseUrl}/-/issues?search=${encodeURIComponent(defectId)}`;
      default:
        return null;
    }
  }, [defectSource]);

  const buildQueryUrl = useCallback((filter: { severity?: string; status?: string }) => {
    if (!defectSource?.url) return null;
    const baseUrl = defectSource.url.replace(/\/+$/, '');
    switch (defectSource.type) {
      case 'jira': {
        const jql = [
          filter.severity ? `priority = "${filter.severity}"` : '',
          filter.status ? `status = "${filter.status}"` : '',
        ].filter(Boolean).join(' AND ');
        return `${baseUrl}/issues/?jql=${encodeURIComponent(jql)}`;
      }
      case 'azure-devops': {
        const wiql = [
          '[System.WorkItemType] = "Bug"',
          filter.severity ? `[Microsoft.VSTS.Common.Severity] = "${filter.severity}"` : '',
          filter.status ? `[System.State] = "${filter.status}"` : '',
        ].filter(Boolean).join(' AND ');
        return `${baseUrl}/_queries?wiql=${encodeURIComponent(wiql)}`;
      }
      default:
        return null;
    }
  }, [defectSource]);

  if (!demoMode) return (<div className="space-y-6"><div><h1 className="text-xl font-bold text-foreground">Defect Analytics</h1><p className="text-sm text-muted-foreground mt-0.5">Track and analyze defects across releases</p></div><NoDataPlaceholder title="Defect Analytics" /></div>);

  const defects = getDefectsForRelease(activeRelease);
  const defectsByRelease = getDefectsByReleaseForRelease(activeRelease);

  const compareDefects = compareRelease ? getDefectsForRelease(compareRelease) : null;

  // Summary stats
  const criticalCount = defects.filter(d => d.severity === 'critical').length;
  const openCount = defects.filter(d => d.status === 'open').length;
  const compareCritical = compareDefects ? compareDefects.filter(d => d.severity === 'critical').length : null;
  const compareOpen = compareDefects ? compareDefects.filter(d => d.status === 'open').length : null;

  // Comparison bar data
  const comparisonData = compareRelease && compareDefects ? [
    {
      metric: 'Total',
      [activeRelease.version]: defects.length,
      [compareRelease.version]: compareDefects.length,
    },
    {
      metric: 'Critical',
      [activeRelease.version]: criticalCount,
      [compareRelease.version]: compareCritical!,
    },
    {
      metric: 'Open',
      [activeRelease.version]: openCount,
      [compareRelease.version]: compareOpen!,
    },
    {
      metric: 'Resolved',
      [activeRelease.version]: defects.filter(d => d.status === 'resolved' || d.status === 'closed').length,
      [compareRelease.version]: compareDefects.filter(d => d.status === 'resolved' || d.status === 'closed').length,
    },
  ] : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Defect Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Defects for {activeRelease.version}</p>
      </div>

      <ReleaseCompareSelector compareRelease={compareRelease} onCompareChange={setCompareRelease} />

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Total Defects" value={defects.length} compare={compareDefects?.length} invertDelta href={buildQueryUrl({})} />
        <MetricCard label="Critical" value={criticalCount} compare={compareCritical} invertDelta color="text-destructive" href={buildQueryUrl({ severity: 'critical' })} />
        <MetricCard label="Open" value={openCount} compare={compareOpen} invertDelta color="text-warning" href={buildQueryUrl({ status: 'open' })} />
        <MetricCard
          label="Resolution Rate"
          value={`${Math.round((defects.filter(d => d.status === 'resolved' || d.status === 'closed').length / defects.length) * 100)}%`}
          color="text-success"
          href={buildQueryUrl({ status: 'resolved' })}
        />
      </div>

      {/* Comparison chart */}
      {comparisonData && (
        <motion.div className="dashboard-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="dashboard-card-header">
            <span className="dashboard-card-title">Defect Comparison: {activeRelease.version} vs {compareRelease!.version}</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="metric" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey={activeRelease.version} fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                <Bar dataKey={compareRelease!.version} fill="hsl(var(--accent))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <span className="dashboard-card-title">Defects by Release</span>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={defectsByRelease}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="release" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="critical" fill="hsl(var(--risk-critical))" radius={[2, 2, 0, 0]} />
              <Bar dataKey="major" fill="hsl(var(--risk-high))" radius={[2, 2, 0, 0]} />
              <Bar dataKey="minor" fill="hsl(var(--risk-medium))" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <span className="dashboard-card-title">Active Defects — {activeRelease.version}</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
              <th className="pb-3 font-medium">ID</th>
              <th className="pb-3 font-medium">Title</th>
              <th className="pb-3 font-medium">Severity</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Service</th>
              <th className="pb-3 font-medium text-right">Age (days)</th>
            </tr>
          </thead>
          <tbody>
            {defects.map(d => (
              <tr key={d.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="py-2.5 text-xs font-mono">
                  {buildDefectUrl(d.id) ? (
                    <a href={buildDefectUrl(d.id)!} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      {d.id} <ExternalLink size={10} />
                    </a>
                  ) : (
                    <span className="text-primary">{d.id}</span>
                  )}
                </td>
                <td className="py-2.5 text-sm text-foreground">{d.title}</td>
                <td className="py-2.5"><span className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded-full ${severityBg[d.severity]}`}>{d.severity}</span></td>
                <td className="py-2.5"><span className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded-full ${statusBg[d.status]}`}>{d.status}</span></td>
                <td className="py-2.5 text-xs text-muted-foreground">{d.service}</td>
                <td className="py-2.5 text-xs font-mono text-right text-muted-foreground">{d.age}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricCard({ label, value, compare, invertDelta, color = 'text-foreground' }: {
  label: string; value: number | string; compare?: number | null; invertDelta?: boolean; color?: string;
}) {
  const numVal = typeof value === 'number' ? value : null;
  const delta = numVal !== null && compare !== null && compare !== undefined && compare !== 0
    ? ((numVal - compare) / compare) * 100 : null;
  const isGood = invertDelta ? (delta && delta < 0) : (delta && delta > 0);
  const isBad = invertDelta ? (delta && delta > 0) : (delta && delta < 0);
  const DeltaIcon = isGood ? TrendingDown : isBad ? TrendingUp : Minus;
  const deltaColor = isGood ? 'text-success' : isBad ? 'text-destructive' : 'text-muted-foreground';

  return (
    <div className="dashboard-card">
      <p className="metric-label">{label}</p>
      <p className={`metric-value ${color}`}>{value}</p>
      {delta !== null && (
        <div className={`flex items-center gap-1 mt-1 ${deltaColor}`}>
          <DeltaIcon size={10} />
          <span className="text-[10px] font-medium">{delta > 0 ? '+' : ''}{delta.toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
}
