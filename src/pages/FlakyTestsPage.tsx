import { useState } from 'react';
import { useRelease } from '@/contexts/ReleaseContext';
import { getFlakyTestsForRelease } from '@/data/releaseDataHelper';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useDemoMode } from '@/contexts/DemoModeContext';
import NoDataPlaceholder from '@/components/NoDataPlaceholder';
import ReleaseCompareSelector from '@/components/ReleaseCompareSelector';
import { Release } from '@/data/mockData';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export default function FlakyTestsPage() {
  const { demoMode } = useDemoMode();
  const { activeRelease } = useRelease();
  const [compareRelease, setCompareRelease] = useState<Release | null>(null);

  if (!demoMode) return (<div className="space-y-6"><div><h1 className="text-xl font-bold text-foreground">Flaky Test Detection</h1><p className="text-sm text-muted-foreground mt-0.5">Identify and track unreliable tests across pipelines</p></div><NoDataPlaceholder title="Flaky Tests" /></div>);

  const flakyTests = getFlakyTestsForRelease(activeRelease);
  const sorted = [...flakyTests].sort((a, b) => b.flakinessScore - a.flakinessScore);

  const compareFlakyTests = compareRelease ? getFlakyTestsForRelease(compareRelease) : null;
  const compareMap = compareFlakyTests
    ? new Map(compareFlakyTests.map(t => [t.id, t]))
    : null;

  // Summary metrics
  const avgFlakiness = Math.round(flakyTests.reduce((s, t) => s + t.flakinessScore, 0) / flakyTests.length);
  const totalFailures = flakyTests.reduce((s, t) => s + t.failCount, 0);
  const compareAvgFlakiness = compareFlakyTests
    ? Math.round(compareFlakyTests.reduce((s, t) => s + t.flakinessScore, 0) / compareFlakyTests.length)
    : null;
  const compareTotalFailures = compareFlakyTests
    ? compareFlakyTests.reduce((s, t) => s + t.failCount, 0)
    : null;

  // Comparison chart data
  const comparisonChartData = compareRelease && compareFlakyTests
    ? sorted.map(t => {
        const ct = compareMap?.get(t.id);
        return {
          name: t.name.length > 18 ? t.name.slice(0, 18) + '…' : t.name,
          [activeRelease.version]: t.flakinessScore,
          [compareRelease.version]: ct?.flakinessScore || 0,
        };
      })
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Flaky Test Detection</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Flaky tests for {activeRelease.version}</p>
      </div>

      <ReleaseCompareSelector compareRelease={compareRelease} onCompareChange={setCompareRelease} />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Avg Flakiness" value={`${avgFlakiness}%`} delta={compareAvgFlakiness !== null ? avgFlakiness - compareAvgFlakiness : undefined} invertDelta />
        <SummaryCard label="Total Failures" value={totalFailures.toString()} delta={compareTotalFailures !== null ? ((totalFailures - compareTotalFailures) / compareTotalFailures) * 100 : undefined} invertDelta />
        <SummaryCard label="Flaky Tests" value={flakyTests.length.toString()} />
      </div>

      {/* Comparison chart */}
      {comparisonChartData && (
        <motion.div className="dashboard-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="dashboard-card-header">
            <span className="dashboard-card-title">Flakiness Comparison: {activeRelease.version} vs {compareRelease!.version}</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} width={140} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey={activeRelease.version} fill="hsl(var(--primary))" radius={[0, 2, 2, 0]} barSize={8} />
                <Bar dataKey={compareRelease!.version} fill="hsl(var(--accent))" radius={[0, 2, 2, 0]} barSize={8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      <div className="dashboard-card">
        <table className="w-full">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
              <th className="pb-3 font-medium">Test Name</th>
              <th className="pb-3 font-medium">Module</th>
              <th className="pb-3 font-medium text-center">Pass</th>
              <th className="pb-3 font-medium text-center">Fail</th>
              <th className="pb-3 font-medium">Flakiness</th>
              {compareRelease && <th className="pb-3 font-medium">vs {compareRelease.version}</th>}
              <th className="pb-3 font-medium">Last Flaky</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t, i) => {
              const ct = compareMap?.get(t.id);
              const delta = ct ? t.flakinessScore - ct.flakinessScore : null;
              return (
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
                  {compareRelease && (
                    <td className="py-3">
                      {delta !== null && (
                        <span className={`text-xs font-mono font-medium ${delta > 0 ? 'text-destructive' : delta < 0 ? 'text-success' : 'text-muted-foreground'}`}>
                          {delta > 0 ? '▲' : delta < 0 ? '▼' : '—'} {Math.abs(delta)}%
                        </span>
                      )}
                    </td>
                  )}
                  <td className="py-3 text-xs text-muted-foreground font-mono">{t.lastFlaky}</td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, delta, invertDelta }: {
  label: string; value: string; delta?: number; invertDelta?: boolean;
}) {
  const isPositive = invertDelta ? (delta && delta < 0) : (delta && delta > 0);
  const isNegative = invertDelta ? (delta && delta > 0) : (delta && delta < 0);
  const DeltaIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const deltaColor = isPositive ? 'text-success' : isNegative ? 'text-destructive' : 'text-muted-foreground';

  return (
    <div className="dashboard-card">
      <p className="metric-label">{label}</p>
      <p className="metric-value text-foreground">{value}</p>
      {delta !== undefined && (
        <div className={`flex items-center gap-1 mt-1 ${deltaColor}`}>
          <DeltaIcon size={10} />
          <span className="text-[10px] font-medium">{delta > 0 ? '+' : ''}{delta.toFixed(1)}</span>
        </div>
      )}
    </div>
  );
}
