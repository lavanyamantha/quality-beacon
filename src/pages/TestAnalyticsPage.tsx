import { testExecutions } from '@/data/mockData';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function TestAnalyticsPage() {
  const latest = testExecutions[testExecutions.length - 1];
  const passRate = ((latest.passed / latest.total) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Test Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Test execution trends and metrics</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Tests" value={latest.total.toLocaleString()} />
        <StatCard label="Passed" value={latest.passed.toLocaleString()} color="text-success" />
        <StatCard label="Failed" value={latest.failed.toLocaleString()} color="text-destructive" />
        <StatCard label="Pass Rate" value={`${passRate}%`} color="text-primary" />
      </div>

      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <span className="dashboard-card-title">Execution Trend</span>
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
    </div>
  );
}

function StatCard({ label, value, color = 'text-foreground' }: { label: string; value: string; color?: string }) {
  return (
    <div className="dashboard-card">
      <p className="metric-label">{label}</p>
      <p className={`metric-value ${color}`}>{value}</p>
    </div>
  );
}
