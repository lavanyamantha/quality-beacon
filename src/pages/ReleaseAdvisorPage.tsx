import { Bot, AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import { aiAdvisorRecommendation, currentRelease } from '@/data/mockData';
import { motion } from 'framer-motion';

export default function ReleaseAdvisorPage() {
  const { recommendation, confidence, reasons, mitigations } = aiAdvisorRecommendation;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-foreground">Autonomous Release Advisor</h1>
        <p className="text-sm text-muted-foreground mt-0.5">AI-powered release readiness recommendation for {currentRelease.version}</p>
      </div>

      <motion.div
        className="dashboard-card glow-accent"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-accent)' }}>
            <Bot size={24} className="text-accent-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">AI Recommendation</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-2xl font-bold text-warning">{recommendation}</span>
              <span className="text-sm text-muted-foreground">Confidence: <span className="font-bold text-foreground">{confidence}%</span></span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-md bg-warning/5 border border-warning/20 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={14} className="text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase">Decision Support Mode</span>
          </div>
          <p className="text-xs text-muted-foreground">This is an AI recommendation. Final release authority remains with human decision-makers.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-warning" />
              <span className="dashboard-card-title">Risk Factors</span>
            </div>
          </div>
          <ul className="space-y-3">
            {reasons.map((r, i) => (
              <motion.li key={i} className="flex items-start gap-2.5 text-sm text-foreground"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                <span className="status-dot-degraded mt-1.5 flex-shrink-0" />
                {r}
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-success" />
              <span className="dashboard-card-title">Recommended Mitigations</span>
            </div>
          </div>
          <ul className="space-y-3">
            {mitigations.map((m, i) => (
              <motion.li key={i} className="flex items-start gap-2.5 text-sm text-foreground"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                <span className="status-dot-healthy mt-1.5 flex-shrink-0" />
                {m}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
