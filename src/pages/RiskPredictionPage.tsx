import { useRelease } from '@/contexts/ReleaseContext';
import { getRiskDataForRelease } from '@/data/releaseDataHelper';
import { motion } from 'framer-motion';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { useDemoMode } from '@/contexts/DemoModeContext';
import NoDataPlaceholder from '@/components/NoDataPlaceholder';

export default function RiskPredictionPage() {
  const { demoMode } = useDemoMode();
  const { activeRelease, selectedEnv } = useRelease();

  if (!demoMode) return (<div className="space-y-6"><div><h1 className="text-xl font-bold text-foreground">AI Risk Prediction</h1><p className="text-sm text-muted-foreground mt-0.5">Predictive risk analysis</p></div><NoDataPlaceholder title="Risk Prediction" /></div>);

  const riskData = getRiskDataForRelease(activeRelease, selectedEnv);
  const overallRisk = riskData.length > 0 ? Math.round(riskData.reduce((sum, r) => sum + r.risk, 0) / riskData.length) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">AI Risk Prediction</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Risk analysis for {activeRelease.version}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="dashboard-card col-span-1">
          <p className="metric-label">Overall Risk Score</p>
          <motion.p
            key={overallRisk}
            className={`text-5xl font-bold mt-2 ${overallRisk > 50 ? 'text-destructive' : overallRisk > 25 ? 'text-warning' : 'text-success'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {overallRisk}%
          </motion.p>
          <p className="text-xs text-muted-foreground mt-2">Based on historical patterns and current signals</p>
        </div>

        <div className="dashboard-card col-span-2">
          <div className="dashboard-card-header">
            <span className="dashboard-card-title">Risk by Service</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} width={130} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="risk" radius={[0, 4, 4, 0]} barSize={10}>
                  {riskData.map((entry) => (
                    <Cell key={entry.name} fill={entry.risk > 50 ? 'hsl(var(--destructive))' : entry.risk > 25 ? 'hsl(var(--warning))' : 'hsl(var(--success))'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
