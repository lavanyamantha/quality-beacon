import { useState } from 'react';
import { useRelease } from '@/contexts/ReleaseContext';
import { getTestExecutionsForRelease } from '@/data/releaseDataHelper';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend } from 'recharts';
import { useDemoMode } from '@/contexts/DemoModeContext';
import NoDataPlaceholder from '@/components/NoDataPlaceholder';
import ReleaseCompareSelector from '@/components/ReleaseCompareSelector';
import { Release } from '@/data/mockData';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function StatCard({ label, value, color = 'text-foreground', delta, deltaLabel }: {
  label: string; value: string; color?: string; delta?: number; deltaLabel?: string;
}) {
  const DeltaIcon = delta && delta > 0 ? TrendingUp : delta && delta < 0 ? TrendingDown : Minus;
  const deltaColor = delta && delta > 0 ? 'text-success' : delta && delta < 0 ? 'text-destructive' : 'text-muted-foreground';

  return (
    <div className="dashboard-card">
      <p className="metric-label">{label}</p>
      <p className={`metric-value ${color}`}>{value}</p>
      {delta !== undefined && (
        <div className={`flex items-center gap-1 mt-1 ${deltaColor}`}>
          <DeltaIcon size={10} />
          <span className="text-[10px] font-medium">
            {delta > 0 ? '+' : ''}{delta.toFixed(1)}% {deltaLabel || 'vs compare'}
          </span>
        </div>
      )}
    </div>
  );
}

export default function TestAnalyticsPage() {
  const { demoMode } = useDemoMode();
  const { activeRelease } = useRelease();
  const [compareRelease, setCompareRelease] = useState<Release | null>(null);

  if (!demoMode) return (<div className="space-y-6"><div><h1 className="text-xl font-bold text-foreground">Test Analytics</h1><p className="text-sm text-muted-foreground mt-0.5">Test execution trends and metrics</p></div><NoDataPlaceholder title="Test Analytics" /></div>);

  const testExecutions = getTestExecutionsForRelease(activeRelease);
  const latest = testExecutions[testExecutions.length - 1];
  const passRate = (latest.passed / latest.total) * 100;

  const compareData = compareRelease ? getTestExecutionsForRelease(compareRelease) : null;
  const compareLatest = compareData ? compareData[compareData.length - 1] : null;
  const comparePassRate = compareLatest ? (compareLatest.passed / compareLatest.total) * 100 : null;

  // Build comparison bar data
  const comparisonBarData = compareRelease && compareLatest ? [
    {
      metric: 'Total Tests',
      [activeRelease.version]: latest.total,
      [compareRelease.version]: compareLatest.total,
    },
    {
      metric: 'Passed',
      [activeRelease.version]: latest.passed,
      [compareRelease.version]: compareLatest.passed,
    },
    {
      metric: 'Failed',
      [activeRelease.version]: latest.failed,
      [compareRelease.version]: compareLatest.failed,
    },
    {
      metric: 'Skipped',
      [activeRelease.version]: latest.skipped,
      [compareRelease.version]: compareLatest.skipped,
    },
  ] : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Test Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Test execution trends for {activeRelease.version}</p>
      </div>

      <ReleaseCompareSelector compareRelease={compareRelease} onCompareChange={setCompareRelease} />

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Tests"
          value={latest.total.toLocaleString()}
          delta={compareLatest ? ((latest.total - compareLatest.total) / compareLatest.total) * 100 : undefined}
        />
        <StatCard
          label="Passed"
          value={latest.passed.toLocaleString()}
          color="text-success"
          delta={compareLatest ? ((latest.passed - compareLatest.passed) / compareLatest.passed) * 100 : undefined}
        />
        <StatCard
          label="Failed"
          value={latest.failed.toLocaleString()}
          color="text-destructive"
          delta={compareLatest ? ((latest.failed - compareLatest.failed) / compareLatest.failed) * 100 : undefined}
        />
        <StatCard
          label="Pass Rate"
          value={`${passRate.toFixed(1)}%`}
          color="text-primary"
          delta={comparePassRate ? passRate - comparePassRate : undefined}
        />
      </div>

      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <span className="dashboard-card-title">Execution Trend — {activeRelease.version}</span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={testExecutions}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="passed" stackId="1" stroke="hsl(var(--success))" fill="hsl(var(--success) / 0.2)" />
              <Area type="monotone" dataKey="failed" stackId="1" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive) / 0.2)" />
              <Area type="monotone" dataKey="skipped" stackId="1" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted) / 0.3)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison Chart */}
      {comparisonBarData && (
        <motion.div
          className="dashboard-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="dashboard-card-header">
            <span className="dashboard-card-title">
              Release Comparison: {activeRelease.version} vs {compareRelease!.version}
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonBarData}>
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
    </div>
  );
}
