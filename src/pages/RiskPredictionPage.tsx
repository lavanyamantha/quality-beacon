import { microservices } from '@/data/mockData';
import { motion } from 'framer-motion';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { useDemoMode } from '@/contexts/DemoModeContext';
import NoDataPlaceholder from '@/components/NoDataPlaceholder';

export default function RiskPredictionPage() {
  const { demoMode } = useDemoMode();
  if (!demoMode) return (<div className="space-y-6"><div><h1 className="text-xl font-bold text-foreground">AI Risk Prediction</h1><p className="text-sm text-muted-foreground mt-0.5">Predictive risk analysis for Release 2026.04</p></div><NoDataPlaceholder title="Risk Prediction" /></div>);
  const riskData = microservices.map(s => ({
    name: s.name,
    risk: Math.round((s.errorRate * 10 + s.defectDensity * 12 + (100 - s.coverage) * 0.5 + (s.health === 'down' ? 30 : s.health === 'degraded' ? 15 : 0))),
  })).sort((a, b) => b.risk - a.risk);

  const overallRisk = 72;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">AI Risk Prediction</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Predictive risk analysis for Release 2026.04</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="dashboard-card col-span-1">
          <p className="metric-label">Overall Risk Score</p>
          <motion.p
            className="text-5xl font-bold text-warning mt-2"
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
