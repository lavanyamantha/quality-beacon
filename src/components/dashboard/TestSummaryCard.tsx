import { testExecutions } from '@/data/mockData';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

export default function TestSummaryCard() {
  const latest = testExecutions[testExecutions.length - 1];
  const passRate = ((latest.passed / latest.total) * 100).toFixed(1);

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <span className="dashboard-card-title">Test Executions</span>
      </div>

      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="metric-value text-foreground">{latest.total.toLocaleString()}</p>
          <p className="metric-label">Total Tests</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-success">{passRate}%</p>
          <p className="metric-label">Pass Rate</p>
        </div>
      </div>

      <div className="flex gap-3 mb-3">
        <Stat label="Passed" value={latest.passed} color="var(--success)" />
        <Stat label="Failed" value={latest.failed} color="var(--destructive)" />
        <Stat label="Skipped" value={latest.skipped} color="var(--muted-foreground)" />
      </div>

      <div className="h-16 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={testExecutions}>
            <defs>
              <linearGradient id="passGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" hide />
            <Tooltip
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
              labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
            />
            <Area type="monotone" dataKey="passed" stroke="hsl(var(--success))" fill="url(#passGrad)" strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: `hsl(${color})` }} />
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className="text-xs font-mono font-medium text-foreground">{value.toLocaleString()}</span>
    </div>
  );
}
