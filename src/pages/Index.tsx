import { useRef, useState } from 'react';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useRelease } from '@/contexts/ReleaseContext';
import ReadinessGauge from '@/components/dashboard/ReadinessGauge';
import AIAdvisorCard from '@/components/dashboard/AIAdvisorCard';
import ServiceHealthGrid from '@/components/dashboard/ServiceHealthGrid';
import TestSummaryCard from '@/components/dashboard/TestSummaryCard';
import DefectSummaryCard from '@/components/dashboard/DefectSummaryCard';
import PipelineStatusCard from '@/components/dashboard/PipelineStatusCard';
import FlakyTestCard from '@/components/dashboard/FlakyTestCard';
import ReadinessTrendCard from '@/components/dashboard/ReadinessTrendCard';
import { Database, Settings, Download, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { releases } from '@/data/mockData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const environments = ['All', 'Dev', 'QA', 'Stage', 'Prod'];

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

const statusColor: Record<string, string> = {
  released: 'bg-success/20 text-success',
  ready: 'bg-primary/20 text-primary',
  risk: 'bg-warning/20 text-warning',
  blocked: 'bg-destructive/20 text-destructive',
};

export default function Dashboard() {
  const { demoMode } = useDemoMode();
  const { selectedReleaseId, selectedEnv, setSelectedReleaseId, setSelectedEnv, activeRelease } = useRelease();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0a0a0f',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`dashboard-${activeRelease.version}-${selectedEnv}-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast({ title: 'PDF exported', description: `Dashboard snapshot for ${activeRelease.version} (${selectedEnv}) saved.` });
    } catch {
      toast({ title: 'Export failed', description: 'Could not generate PDF. Please try again.', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  if (!demoMode) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Quality Command Center</h1>
          <p className="text-sm text-muted-foreground mt-0.5">No release data — connect integrations or enable demo mode</p>
        </div>
        <NoDataPlaceholder />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Quality Command Center</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time quality intelligence for {activeRelease.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedReleaseId} onValueChange={setSelectedReleaseId}>
            <SelectTrigger className="w-[200px] h-9 text-xs">
              <SelectValue placeholder="Select Release" />
            </SelectTrigger>
            <SelectContent>
              {releases.map(r => (
                <SelectItem key={r.id} value={r.id}>
                  <span className="flex items-center gap-2">
                    {r.version}
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusColor[r.status]}`}>
                      {r.status}
                    </Badge>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedEnv} onValueChange={setSelectedEnv}>
            <SelectTrigger className="w-[130px] h-9 text-xs">
              <SelectValue placeholder="Environment" />
            </SelectTrigger>
            <SelectContent>
              {environments.map(env => (
                <SelectItem key={env} value={env}>{env}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="h-9 text-xs" onClick={handleExportPDF} disabled={exporting}>
            {exporting ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Download size={14} className="mr-1.5" />}
            {exporting ? 'Exporting…' : 'Export PDF'}
          </Button>
        </div>
      </div>

      <div ref={dashboardRef} className="space-y-4">
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
    </div>
  );
}
