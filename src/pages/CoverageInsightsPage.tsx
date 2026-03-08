import { useState } from 'react';
import { useRelease } from '@/contexts/ReleaseContext';
import { getCoverageForRelease } from '@/data/releaseDataHelper';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend, RadialBarChart, RadialBar, Cell } from 'recharts';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useIntegrations } from '@/contexts/IntegrationsContext';
import NoDataPlaceholder from '@/components/NoDataPlaceholder';
import ReleaseCompareSelector from '@/components/ReleaseCompareSelector';
import { Release } from '@/data/mockData';
import { Database, ShieldCheck, AlertTriangle, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

function CoverageGauge({ value, label, compareValue }: { value: number; label: string; compareValue?: number }) {
  const color = value >= 80 ? 'hsl(var(--success))' : value >= 60 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))';
  const data = [{ value, fill: color }];
  const delta = compareValue !== undefined ? value - compareValue : null;
  const deltaColor = delta && delta > 0 ? 'text-success' : delta && delta < 0 ? 'text-destructive' : 'text-muted-foreground';

  return (
    <div className="flex flex-col items-center">
      <div className="w-24 h-24 relative">
        <RadialBarChart width={96} height={96} cx={48} cy={48} innerRadius={30} outerRadius={44} barSize={8} data={data} startAngle={90} endAngle={-270}>
          <RadialBar background={{ fill: 'hsl(var(--muted))' }} dataKey="value" cornerRadius={4}>
            <Cell fill={color} />
          </RadialBar>
        </RadialBarChart>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold font-mono text-foreground">{value}%</span>
        </div>
      </div>
      <span className="text-[10px] font-medium text-muted-foreground mt-1 uppercase tracking-wider">{label}</span>
      {delta !== null && (
        <span className={`text-[9px] font-mono font-medium mt-0.5 ${deltaColor}`}>
          {delta > 0 ? '▲+' : delta < 0 ? '▼' : '—'}{Math.abs(delta)}%
        </span>
      )}
    </div>
  );
}

export default function CoverageInsightsPage() {
  const { demoMode } = useDemoMode();
  const { activeRelease, selectedEnv } = useRelease();
  const { connectedSources } = useIntegrations();
  const [compareRelease, setCompareRelease] = useState<Release | null>(null);

  const coverageSources = connectedSources.filter(s => s.provides.includes('test') || s.type === 'sonarqube');
  const hasLiveSources = coverageSources.length > 0;

  if (!demoMode && !hasLiveSources) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Test Coverage Insights</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Coverage analytics across testing layers and services</p>
        </div>
        <NoDataPlaceholder title="Coverage" />
        <p className="text-xs text-muted-foreground text-center max-w-md mx-auto">
          Connect a test data source (SonarQube, GitHub, Azure DevOps) in <strong>Settings → Integrations</strong> to see live coverage data.
        </p>
      </div>
    );
  }

  const coverageData = getCoverageForRelease(activeRelease, selectedEnv);
  const compareCoverageData = compareRelease ? getCoverageForRelease(compareRelease, selectedEnv) : null;

  // Aggregates
  const avg = (data: typeof coverageData, key: 'code' | 'api' | 'ui') =>
    Math.round(data.reduce((s, c) => s + c[key], 0) / data.length);

  const avgCode = avg(coverageData, 'code');
  const avgApi = avg(coverageData, 'api');
  const avgUi = avg(coverageData, 'ui');
  const overallAvg = Math.round((avgCode + avgApi + avgUi) / 3);

  const cmpAvgCode = compareCoverageData ? avg(compareCoverageData, 'code') : undefined;
  const cmpAvgApi = compareCoverageData ? avg(compareCoverageData, 'api') : undefined;
  const cmpAvgUi = compareCoverageData ? avg(compareCoverageData, 'ui') : undefined;
  const cmpOverallAvg = cmpAvgCode !== undefined && cmpAvgApi !== undefined && cmpAvgUi !== undefined
    ? Math.round((cmpAvgCode + cmpAvgApi + cmpAvgUi) / 3) : undefined;

  const lowCoverageServices = coverageData.filter(c => c.code < 60 || c.api < 50 || c.ui < 40);
  const sourceLabel = hasLiveSources ? coverageSources.map(s => s.name).join(', ') : 'Sample Data';

  // Comparison chart data
  const compareMap = compareCoverageData ? new Map(compareCoverageData.map(c => [c.service, c])) : null;
  const comparisonTableData = compareRelease && compareCoverageData
    ? coverageData.map(c => ({ ...c, cmp: compareMap?.get(c.service) }))
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Test Coverage Insights</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Coverage for {activeRelease.version} — {selectedEnv === 'All' ? 'All environments' : selectedEnv}
        </p>
      </div>

      <ReleaseCompareSelector compareRelease={compareRelease} onCompareChange={setCompareRelease} />

      {/* Data Source Banner */}
      <div className="flex items-center gap-2 flex-wrap">
        {hasLiveSources ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success/10 border border-success/30">
            <ShieldCheck size={12} className="text-success" />
            <span className="text-[11px] font-semibold text-success">Source: {sourceLabel}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-warning/10 border border-warning/30">
            <Database size={12} className="text-warning" />
            <span className="text-[11px] font-semibold text-warning">Sample Data — Connect SonarQube or CI/CD tool for live metrics</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/40 border border-border">
          <Info size={11} className="text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">Coverage data from code analysis &amp; test execution reports</span>
        </div>
      </div>

      {/* Summary Gauges */}
      <motion.div className="dashboard-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="dashboard-card-header mb-4">
          <span className="dashboard-card-title">Coverage Summary</span>
          <Badge variant="secondary" className="text-[9px] uppercase">{hasLiveSources ? 'Live' : 'Demo'}</Badge>
        </div>
        <div className="flex items-center justify-around flex-wrap gap-4">
          <CoverageGauge value={overallAvg} label="Overall" compareValue={cmpOverallAvg} />
          <CoverageGauge value={avgCode} label="Code" compareValue={cmpAvgCode} />
          <CoverageGauge value={avgApi} label="API Tests" compareValue={cmpAvgApi} />
          <CoverageGauge value={avgUi} label="UI Tests" compareValue={cmpAvgUi} />
        </div>
      </motion.div>

      {/* Low Coverage Alerts */}
      {lowCoverageServices.length > 0 && (
        <motion.div className="dashboard-card bg-warning/5 border-warning/20" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-warning" />
            <span className="text-sm font-semibold text-warning">Low Coverage Alerts</span>
          </div>
          <div className="space-y-2">
            {lowCoverageServices.map(s => {
              const lowest = Math.min(s.code, s.api, s.ui);
              const layer = lowest === s.code ? 'Code' : lowest === s.api ? 'API' : 'UI';
              return (
                <div key={s.service} className="flex items-center justify-between text-xs">
                  <span className="font-mono text-foreground">{s.service}</span>
                  <span className="text-warning font-medium">{layer} coverage at {lowest}%</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Bar Chart */}
      <motion.div className="dashboard-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="dashboard-card-header">
          <span className="dashboard-card-title">Coverage by Service</span>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={coverageData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} />
              <YAxis dataKey="service" type="category" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} width={130} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="code" name="Code Coverage" fill="hsl(var(--primary))" radius={[0, 2, 2, 0]} barSize={6} />
              <Bar dataKey="api" name="API Tests" fill="hsl(var(--accent))" radius={[0, 2, 2, 0]} barSize={6} />
              <Bar dataKey="ui" name="UI Tests" fill="hsl(var(--success))" radius={[0, 2, 2, 0]} barSize={6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Detailed Breakdown with Comparison */}
      <motion.div className="dashboard-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="dashboard-card-header mb-3">
          <span className="dashboard-card-title">Detailed Breakdown</span>
          <div className="flex items-center gap-1">
            <TrendingUp size={12} className="text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">{coverageData.length} services</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 text-muted-foreground font-medium uppercase tracking-wider">Service</th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium uppercase tracking-wider">Code</th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium uppercase tracking-wider">API</th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium uppercase tracking-wider">UI</th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium uppercase tracking-wider">Avg</th>
                {compareRelease && <th className="text-right py-2 px-2 text-muted-foreground font-medium uppercase tracking-wider">Δ vs {compareRelease.version}</th>}
              </tr>
            </thead>
            <tbody>
              {coverageData.map((c) => {
                const avg = Math.round((c.code + c.api + c.ui) / 3);
                const avgColor = avg >= 80 ? 'text-success' : avg >= 60 ? 'text-warning' : 'text-destructive';
                const cmp = compareMap?.get(c.service);
                const cmpAvg = cmp ? Math.round((cmp.code + cmp.api + cmp.ui) / 3) : null;
                const delta = cmpAvg !== null ? avg - cmpAvg : null;

                return (
                  <tr key={c.service} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2 px-2 font-mono font-medium text-foreground">{c.service}</td>
                    <td className="text-right py-2 px-2 font-mono">{c.code}%</td>
                    <td className="text-right py-2 px-2 font-mono">{c.api}%</td>
                    <td className="text-right py-2 px-2 font-mono">{c.ui}%</td>
                    <td className={`text-right py-2 px-2 font-mono font-bold ${avgColor}`}>{avg}%</td>
                    {compareRelease && (
                      <td className="text-right py-2 px-2 font-mono font-medium">
                        {delta !== null && (
                          <span className={delta > 0 ? 'text-success' : delta < 0 ? 'text-destructive' : 'text-muted-foreground'}>
                            {delta > 0 ? '▲+' : delta < 0 ? '▼' : '—'}{Math.abs(delta)}%
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
