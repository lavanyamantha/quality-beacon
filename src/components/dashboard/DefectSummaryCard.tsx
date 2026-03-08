import { defects } from '@/data/mockData';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts';

const severityColors: Record<string, string> = {
  critical: 'hsl(var(--risk-critical))',
  major: 'hsl(var(--risk-high))',
  minor: 'hsl(var(--risk-medium))',
  trivial: 'hsl(var(--muted-foreground))',
};

export default function DefectSummaryCard() {
  const open = defects.filter(d => d.status === 'open' || d.status === 'in-progress');
  const bySeverity = ['critical', 'major', 'minor', 'trivial'].map(sev => ({
    severity: sev,
    count: open.filter(d => d.severity === sev).length,
  }));

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <span className="dashboard-card-title">Open Defects</span>
      </div>

      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="metric-value text-foreground">{open.length}</p>
          <p className="metric-label">Active Defects</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-destructive">
            {open.filter(d => d.severity === 'critical').length}
          </p>
          <p className="metric-label">Critical</p>
        </div>
      </div>

      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bySeverity} barSize={20}>
            <XAxis dataKey="severity" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {bySeverity.map(entry => (
                <Cell key={entry.severity} fill={severityColors[entry.severity]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
