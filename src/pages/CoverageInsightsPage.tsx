import { useRelease } from '@/contexts/ReleaseContext';
import { getCoverageForRelease } from '@/data/releaseDataHelper';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { useDemoMode } from '@/contexts/DemoModeContext';
import NoDataPlaceholder from '@/components/NoDataPlaceholder';

export default function CoverageInsightsPage() {
  const { demoMode } = useDemoMode();
  const { activeRelease, selectedEnv } = useRelease();

  if (!demoMode) return (<div className="space-y-6"><div><h1 className="text-xl font-bold text-foreground">Test Coverage Insights</h1><p className="text-sm text-muted-foreground mt-0.5">Coverage analytics across testing layers and services</p></div><NoDataPlaceholder title="Coverage" /></div>);

  const coverageData = getCoverageForRelease(activeRelease, selectedEnv);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Test Coverage Insights</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Coverage for {activeRelease.version} — {selectedEnv === 'All' ? 'All environments' : selectedEnv}</p>
      </div>

      <div className="dashboard-card">
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
      </div>
    </div>
  );
}
