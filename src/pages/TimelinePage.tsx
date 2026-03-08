import { releaseTimeline } from '@/data/mockData';
import { motion } from 'framer-motion';
import { GitBranch, Rocket, TestTube2, Bug, Clock } from 'lucide-react';

const typeConfig = {
  release: { icon: Rocket, color: 'text-primary', dot: 'bg-primary' },
  deployment: { icon: GitBranch, color: 'text-accent', dot: 'bg-accent' },
  pipeline: { icon: Clock, color: 'text-warning', dot: 'bg-warning' },
  defect: { icon: Bug, color: 'text-destructive', dot: 'bg-destructive' },
  test: { icon: TestTube2, color: 'text-success', dot: 'bg-success' },
};

export default function TimelinePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-foreground">Release Quality Timeline</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Key events during Release 2026.04 cycle</p>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
        <div className="space-y-0">
          {releaseTimeline.map((item, i) => {
            const cfg = typeConfig[item.type];
            const Icon = cfg.icon;
            return (
              <motion.div
                key={i}
                className="relative flex items-start gap-4 py-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${cfg.dot}/20`}>
                  <Icon size={14} className={cfg.color} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{item.event}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{item.date}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
