import ReadinessGauge from '@/components/dashboard/ReadinessGauge';
import AIAdvisorCard from '@/components/dashboard/AIAdvisorCard';
import ServiceHealthGrid from '@/components/dashboard/ServiceHealthGrid';
import TestSummaryCard from '@/components/dashboard/TestSummaryCard';
import DefectSummaryCard from '@/components/dashboard/DefectSummaryCard';
import PipelineStatusCard from '@/components/dashboard/PipelineStatusCard';
import FlakyTestCard from '@/components/dashboard/FlakyTestCard';
import ReadinessTrendCard from '@/components/dashboard/ReadinessTrendCard';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Quality Command Center</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Real-time quality intelligence for Release 2026.04</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <ReadinessGauge />
        <AIAdvisorCard />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <TestSummaryCard />
        <DefectSummaryCard />
        <ReadinessTrendCard />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <ServiceHealthGrid />
        <PipelineStatusCard />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FlakyTestCard />
      </div>
    </div>
  );
}
