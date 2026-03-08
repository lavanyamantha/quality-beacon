import { useRelease } from '@/contexts/ReleaseContext';
import { getRiskDataForRelease, ServiceRisk } from '@/data/releaseDataHelper';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { useDemoMode } from '@/contexts/DemoModeContext';
import NoDataPlaceholder from '@/components/NoDataPlaceholder';
import { useState } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, ChevronRight, ShieldAlert, ShieldCheck, Info, Target } from 'lucide-react';

const severityColors: Record<string, string> = {
  critical: 'hsl(var(--destructive))',
  high: 'hsl(var(--warning))',
  medium: 'hsl(var(--accent-foreground))',
  low: 'hsl(var(--success))',
};

const severityBg: Record<string, string> = {
  critical: 'hsl(var(--destructive) / 0.12)',
  high: 'hsl(var(--warning) / 0.12)',
  medium: 'hsl(var(--accent) / 0.15)',
  low: 'hsl(var(--success) / 0.12)',
};

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'increasing') return <TrendingUp size={13} className="text-destructive" />;
  if (trend === 'decreasing') return <TrendingDown size={13} className="text-success" />;
  return <Minus size={13} className="text-muted-foreground" />;
};

function RiskLegend() {
  const levels = [
    { label: 'Critical (>60%)', color: severityColors.critical, desc: 'Block release' },
    { label: 'High (40–60%)', color: severityColors.high, desc: 'Escalate & fix' },
    { label: 'Medium (20–40%)', color: severityColors.medium, desc: 'Monitor closely' },
    { label: 'Low (<20%)', color: severityColors.low, desc: 'Acceptable' },
  ];
  return (
    <div className="dashboard-card">
      <div className="flex items-center gap-2 mb-3">
        <Info size={14} className="text-muted-foreground" />
        <span className="text-xs font-semibold text-foreground">Risk Level Legend</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {levels.map(l => (
          <div key={l.label} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: l.color }} />
            <span className="text-muted-foreground">{l.label}</span>
            <span className="text-foreground font-medium ml-auto">{l.desc}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          <strong>Scoring model:</strong> Error Rate ×10 + Defect Density ×12 + Coverage Gap ×0.5 + Health Penalty (degraded: +15, down: +30). Scores are capped at 100%.
        </p>
      </div>
    </div>
  );
}

function ServiceRiskDetail({ service, isExpanded, onToggle }: { service: ServiceRisk; isExpanded: boolean; onToggle: () => void }) {
  return (
    <motion.div
      className="dashboard-card cursor-pointer hover:border-primary/30 transition-colors"
      onClick={onToggle}
      layout
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: severityBg[service.riskLevel] }}>
            {service.riskLevel === 'critical' || service.riskLevel === 'high'
              ? <ShieldAlert size={16} style={{ color: severityColors[service.riskLevel] }} />
              : <ShieldCheck size={16} style={{ color: severityColors[service.riskLevel] }} />
            }
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{service.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: severityBg[service.riskLevel], color: severityColors[service.riskLevel] }}>
                {service.riskLevel.toUpperCase()}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <TrendIcon trend={service.trend} /> {service.trend}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: severityColors[service.riskLevel] }}>{service.risk}%</p>
          </div>
          <ChevronRight size={14} className={`text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-border space-y-4">
              {/* Risk Factor Breakdown */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <Target size={12} className="text-primary" /> Risk Factor Breakdown
                </p>
                <div className="space-y-2">
                  {service.factors.map((f, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: severityColors[f.severity] }} />
                          <span className="font-medium text-foreground">{f.label}</span>
                          <span className="text-[10px] px-1 rounded" style={{ background: severityBg[f.severity], color: severityColors[f.severity] }}>
                            {f.severity}
                          </span>
                        </div>
                        <span className="font-bold text-foreground">+{f.contribution}pts</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground ml-3.5">{f.detail}</p>
                      <div className="ml-3.5 h-1 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: severityColors[f.severity] }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (f.contribution / service.risk) * 100)}%` }}
                          transition={{ delay: 0.1 * i, duration: 0.4 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div className="rounded-md p-3 text-xs" style={{ background: severityBg[service.riskLevel], borderLeft: `3px solid ${severityColors[service.riskLevel]}` }}>
                <p className="font-semibold text-foreground mb-0.5">AI Recommendation</p>
                <p className="text-muted-foreground">{service.recommendation}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function RiskPredictionPage() {
  const { demoMode } = useDemoMode();
  const { activeRelease, selectedEnv } = useRelease();
  const [expandedService, setExpandedService] = useState<string | null>(null);

  if (!demoMode) return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">AI Risk Prediction</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Predictive risk analysis</p>
      </div>
      <NoDataPlaceholder title="Risk Prediction" />
    </div>
  );

  const riskData = getRiskDataForRelease(activeRelease, selectedEnv);
  const overallRisk = riskData.length > 0 ? Math.round(riskData.reduce((sum, r) => sum + r.risk, 0) / riskData.length) : 0;
  const overallLevel: ServiceRisk['riskLevel'] = overallRisk > 60 ? 'critical' : overallRisk > 40 ? 'high' : overallRisk > 20 ? 'medium' : 'low';
  const criticalCount = riskData.filter(r => r.riskLevel === 'critical').length;
  const highCount = riskData.filter(r => r.riskLevel === 'high').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">AI Risk Prediction</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Predictive risk analysis for {activeRelease.version} — {selectedEnv}</p>
      </div>

      {/* Top summary row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="dashboard-card">
          <p className="metric-label">Overall Risk Score</p>
          <motion.p
            key={overallRisk}
            className="text-4xl font-bold mt-1"
            style={{ color: severityColors[overallLevel] }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {overallRisk}%
          </motion.p>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block" style={{ background: severityBg[overallLevel], color: severityColors[overallLevel] }}>
            {overallLevel.toUpperCase()} RISK
          </span>
        </div>

        <div className="dashboard-card">
          <p className="metric-label">Services Analyzed</p>
          <p className="text-4xl font-bold mt-1 text-foreground">{riskData.length}</p>
          <p className="text-[10px] text-muted-foreground mt-1">across {selectedEnv}</p>
        </div>

        <div className="dashboard-card">
          <p className="metric-label">Critical / High Risk</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-bold text-destructive">{criticalCount}</span>
            <span className="text-lg text-muted-foreground">/</span>
            <span className="text-4xl font-bold text-warning">{highCount}</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">services need attention</p>
        </div>

        <RiskLegend />
      </div>

      {/* Chart + warning */}
      {(criticalCount > 0 || highCount > 0) && (
        <motion.div
          className="rounded-lg p-3 flex items-start gap-3 text-xs border"
          style={{ background: severityBg[criticalCount > 0 ? 'critical' : 'high'], borderColor: severityColors[criticalCount > 0 ? 'critical' : 'high'] + '33' }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertTriangle size={16} style={{ color: severityColors[criticalCount > 0 ? 'critical' : 'high'] }} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">
              {criticalCount > 0 ? `${criticalCount} service(s) at critical risk` : `${highCount} service(s) at high risk`}
            </p>
            <p className="text-muted-foreground mt-0.5">
              Click on each service below to see detailed risk factor breakdown and AI recommendations.
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Chart */}
        <div className="dashboard-card lg:col-span-2">
          <div className="dashboard-card-header">
            <span className="dashboard-card-title">Risk Distribution</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} width={130} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
                  formatter={(value: number) => [`${value}%`, 'Risk Score']}
                />
                <Bar dataKey="risk" radius={[0, 4, 4, 0]} barSize={12}>
                  {riskData.map((entry) => (
                    <Cell key={entry.name} fill={severityColors[entry.riskLevel]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service details */}
        <div className="lg:col-span-3 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Service Risk Details — click to expand</p>
          {riskData.map((service) => (
            <ServiceRiskDetail
              key={service.name}
              service={service}
              isExpanded={expandedService === service.name}
              onToggle={() => setExpandedService(expandedService === service.name ? null : service.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
