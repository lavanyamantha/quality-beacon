import { useRelease } from '@/contexts/ReleaseContext';
import { getDefectsForRelease, getDefectsByReleaseForRelease } from '@/data/releaseDataHelper';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { useDemoMode } from '@/contexts/DemoModeContext';
import NoDataPlaceholder from '@/components/NoDataPlaceholder';

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

  if (!demoMode) return (<div className="space-y-6"><div><h1 className="text-xl font-bold text-foreground">Defect Analytics</h1><p className="text-sm text-muted-foreground mt-0.5">Track and analyze defects across releases</p></div><NoDataPlaceholder title="Defect Analytics" /></div>);

  const defects = getDefectsForRelease(activeRelease);
  const defectsByRelease = getDefectsByReleaseForRelease(activeRelease);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Defect Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Defects for {activeRelease.version}</p>
      </div>

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
                <td className="py-2.5 text-xs font-mono text-primary">{d.id}</td>
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
