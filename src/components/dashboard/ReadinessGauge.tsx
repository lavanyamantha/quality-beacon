import { motion } from 'framer-motion';
import { useRelease } from '@/contexts/ReleaseContext';
import { getReadinessForRelease } from '@/data/releaseDataHelper';

function getScoreColor(score: number) {
  if (score >= 90) return 'hsl(var(--success))';
  if (score >= 75) return 'hsl(var(--warning))';
  return 'hsl(var(--destructive))';
}

function getStatusLabel(score: number) {
  if (score >= 90) return 'READY';
  if (score >= 75) return 'AT RISK';
  return 'BLOCKED';
}

export default function ReadinessGauge() {
  const { activeRelease } = useRelease();
  const { score, metrics: readinessMetrics } = getReadinessForRelease(activeRelease);
  const color = getScoreColor(score);
  const circumference = 2 * Math.PI * 70;
  const dashOffset = circumference - (score / 100) * circumference;

  const metrics = Object.entries(readinessMetrics).map(([key, val]) => ({
    label: key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
    ...val,
    belowThreshold: val.value < val.threshold,
  }));

  return (
    <div className="dashboard-card col-span-2">
      <div className="dashboard-card-header">
        <span className="dashboard-card-title">Release Readiness</span>
        <span className="text-xs font-mono text-muted-foreground">{activeRelease.version}</span>
      </div>
      
      <div className="flex items-center gap-8">
        <div className="relative flex-shrink-0">
          <svg width="160" height="160" className="score-gauge -rotate-90">
            <circle cx="80" cy="80" r="70" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
            <motion.circle
              key={score}
              cx="80" cy="80" r="70"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              key={score}
              className="text-4xl font-bold"
              style={{ color }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {score}
            </motion.span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
              {getStatusLabel(score)}
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-2.5">
          {metrics.map(m => (
            <div key={m.label} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-36 truncate">{m.label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: m.belowThreshold ? 'hsl(var(--warning))' : 'hsl(var(--success))' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${m.value}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <span className={`text-xs font-mono w-12 text-right ${m.belowThreshold ? 'text-warning' : 'text-success'}`}>
                {m.value}%
              </span>
              <span className="text-[10px] text-muted-foreground w-6">{m.weight}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
