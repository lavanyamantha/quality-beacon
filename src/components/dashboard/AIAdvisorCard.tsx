import { motion } from 'framer-motion';
import { Bot, AlertTriangle, ArrowRight } from 'lucide-react';
import { aiAdvisorRecommendation } from '@/data/mockData';
import { Link } from 'react-router-dom';

export default function AIAdvisorCard() {
  const { recommendation, confidence, reasons } = aiAdvisorRecommendation;

  return (
    <div className="dashboard-card glow-accent">
      <div className="dashboard-card-header">
        <div className="flex items-center gap-2">
          <Bot size={14} className="text-accent" />
          <span className="dashboard-card-title">AI Release Advisor</span>
        </div>
        <Link to="/release-advisor" className="text-xs text-primary hover:underline flex items-center gap-1">
          Details <ArrowRight size={12} />
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <motion.div
          className="px-4 py-2 rounded-md text-sm font-bold"
          style={{ background: 'hsl(var(--warning) / 0.15)', color: 'hsl(var(--warning))' }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <AlertTriangle size={14} className="inline mr-1.5 -mt-0.5" />
          {recommendation}
        </motion.div>
        <div>
          <span className="text-xs text-muted-foreground">Confidence</span>
          <p className="text-lg font-bold text-foreground">{confidence}%</p>
        </div>
      </div>

      <ul className="space-y-1.5">
        {reasons.slice(0, 3).map((r, i) => (
          <motion.li
            key={i}
            className="flex items-start gap-2 text-xs text-muted-foreground"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          >
            <span className="status-dot-degraded mt-1 flex-shrink-0" />
            {r}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
