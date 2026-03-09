import { useRelease } from '@/contexts/ReleaseContext';
import { getPipelinesForRelease } from '@/data/releaseDataHelper';
import { GitBranch, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const statusIcon = {
  passing: <CheckCircle size={12} className="text-success flex-shrink-0" />,
  failing: <XCircle size={12} className="text-destructive flex-shrink-0" />,
  unstable: <AlertTriangle size={12} className="text-warning flex-shrink-0" />,
};

export default function PipelineStatusCard() {
  const { activeRelease } = useRelease();
  const pipelines = getPipelinesForRelease(activeRelease);
  const passing = pipelines.filter(p => p.status === 'passing').length;

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <div className="flex items-center gap-2">
          <GitBranch size={14} className="text-primary" />
          <span className="dashboard-card-title">Pipelines</span>
        </div>
      </div>

      <div className="mb-3">
        <p className="metric-value text-foreground">{passing}/{pipelines.length}</p>
        <p className="metric-label">Passing</p>
      </div>

      <div className="space-y-1.5 overflow-hidden">
        {pipelines.map(p => (
          <div key={p.id} className="flex items-center gap-2 text-xs min-w-0">
            {statusIcon[p.status]}
            <span className="font-mono text-foreground flex-1 truncate min-w-0">{p.name}</span>
            <span className="text-muted-foreground flex-shrink-0">{p.successRate}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
