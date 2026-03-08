import { pipelines } from '@/data/mockData';
import { GitBranch, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const statusIcon = {
  passing: <CheckCircle size={12} className="text-success" />,
  failing: <XCircle size={12} className="text-destructive" />,
  unstable: <AlertTriangle size={12} className="text-warning" />,
};

export default function PipelineStatusCard() {
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

      <div className="space-y-1.5">
        {pipelines.map(p => (
          <div key={p.id} className="flex items-center gap-2 text-xs">
            {statusIcon[p.status]}
            <span className="font-mono text-foreground flex-1 truncate">{p.name}</span>
            <span className="text-muted-foreground">{p.successRate}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
