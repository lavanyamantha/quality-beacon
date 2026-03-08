import { useDemoMode } from '@/contexts/DemoModeContext';
import ReadinessGauge from '@/components/dashboard/ReadinessGauge';
import AIAdvisorCard from '@/components/dashboard/AIAdvisorCard';
import ServiceHealthGrid from '@/components/dashboard/ServiceHealthGrid';
import TestSummaryCard from '@/components/dashboard/TestSummaryCard';
import DefectSummaryCard from '@/components/dashboard/DefectSummaryCard';
import PipelineStatusCard from '@/components/dashboard/PipelineStatusCard';
import FlakyTestCard from '@/components/dashboard/FlakyTestCard';
import ReadinessTrendCard from '@/components/dashboard/ReadinessTrendCard';
import { Database, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

function NoDataPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Database size={28} className="text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-2">No Data Available</h2>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        Demo mode is disabled and no integrations are connected. Connect your tools or enable demo mode to see data.
      </p>
      <div className="flex gap-3">
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Settings size={14} /> Configure Integrations
        </Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { demoMode } = useDemoMode();

  if (!demoMode) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Quality Command Center</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time quality intelligence for Release 2026.04</p>
        </div>
        <NoDataPlaceholder />
      </div>
    );
  }

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
