import { useRelease } from '@/contexts/ReleaseContext';
import { getMicroservicesForRelease } from '@/data/releaseDataHelper';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const healthDot: Record<string, string> = {
  healthy: 'status-dot-healthy',
  degraded: 'status-dot-degraded',
  down: 'status-dot-down',
};

export default function ServiceHealthGrid() {
  const { activeRelease, selectedEnv } = useRelease();
  const services = getMicroservicesForRelease(activeRelease, selectedEnv);

  return (
    <div className="dashboard-card col-span-2">
      <div className="dashboard-card-header">
        <span className="dashboard-card-title">Service Health</span>
        <Link to="/services" className="text-xs text-primary hover:underline flex items-center gap-1">
          View all <ArrowRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {services.map((svc, i) => (
          <motion.div
            key={svc.id}
            className="flex items-center gap-2.5 p-2.5 rounded-md bg-secondary/50 hover:bg-secondary transition-colors"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <span className={healthDot[svc.health]} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{svc.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {svc.errorRate.toFixed(1)}% err · {svc.latency}ms
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
