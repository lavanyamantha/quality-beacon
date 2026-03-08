import { useRef, useState } from 'react';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useRelease } from '@/contexts/ReleaseContext';
import { useBranding } from '@/contexts/BrandingContext';
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
  const { brandName } = useBranding();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;
    setExporting(true);
    try {
      // Temporarily expand all overflow-hidden containers so nothing is clipped
      const overflowEls = dashboardRef.current.querySelectorAll<HTMLElement>('[class*="overflow"]');
      const origStyles: { el: HTMLElement; overflow: string; maxHeight: string }[] = [];
      overflowEls.forEach(el => {
        origStyles.push({ el, overflow: el.style.overflow, maxHeight: el.style.maxHeight });
        el.style.overflow = 'visible';
        el.style.maxHeight = 'none';
      });

      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0a0a0f',
        logging: false,
        windowWidth: dashboardRef.current.scrollWidth,
        windowHeight: dashboardRef.current.scrollHeight,
      });

      // Restore original styles
      origStyles.forEach(({ el, overflow, maxHeight }) => {
        el.style.overflow = overflow;
        el.style.maxHeight = maxHeight;
      });

      const pageWidth = 595; // A4 width in points
      const pageHeight = 842; // A4 height in points
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;

      const exportDate = new Date();
      const dateStr = exportDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const timeStr = exportDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

      // --- Header ---
      pdf.setFillColor(15, 15, 25);
      pdf.rect(0, 0, pageWidth, 120, 'F');

      // Title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.setTextColor(255, 255, 255);
      pdf.text(brandName, margin, 45);

      // Subtitle
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(160, 160, 180);
      pdf.text('Quality Command Center — Dashboard Report', margin, 62);

      // Metadata line
      pdf.setFontSize(9);
      pdf.setTextColor(120, 120, 140);
      const metaItems = [
        `Release: ${activeRelease.version} (${activeRelease.name})`,
        `Status: ${activeRelease.status.toUpperCase()}`,
        `Environment: ${selectedEnv}`,
      ];
      pdf.text(metaItems.join('   •   '), margin, 82);

      // Export date
      pdf.text(`Exported: ${dateStr} at ${timeStr}`, margin, 98);

      // Divider line
      pdf.setDrawColor(60, 60, 80);
      pdf.setLineWidth(0.5);
      pdf.line(margin, 112, pageWidth - margin, 112);

      // --- Dashboard snapshot ---
      const imgData = canvas.toDataURL('image/png');
      const imgAspect = canvas.height / canvas.width;
      const imgWidth = contentWidth;
      const imgHeight = imgWidth * imgAspect;

      const startY = 130;
      const availableHeight = pageHeight - startY - margin;

      if (imgHeight <= availableHeight) {
        pdf.addImage(imgData, 'PNG', margin, startY, imgWidth, imgHeight);
      } else {
        // Multi-page: slice the canvas image across pages
        const totalPages = Math.ceil(imgHeight / availableHeight);
        for (let page = 0; page < totalPages; page++) {
          if (page > 0) pdf.addPage();
          const yOffset = page === 0 ? startY : margin;
          const sliceHeight = page === 0 ? availableHeight : pageHeight - margin * 2;
          // Use negative y to shift the image up for subsequent pages
          const imgYOffset = yOffset - (page === 0 ? 0 : (availableHeight + (page - 1) * (pageHeight - margin * 2)));
          pdf.addImage(imgData, 'PNG', margin, imgYOffset, imgWidth, imgHeight);
        }
      }

      // --- Footer on last page ---
      const lastPageY = pageHeight - 25;
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 120);
      pdf.text(`${brandName} — Confidential`, margin, lastPageY);
      pdf.text(`Page 1 of ${pdf.getNumberOfPages()}`, pageWidth - margin - 50, lastPageY);

      pdf.save(`dashboard-${activeRelease.version}-${selectedEnv}-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast({ title: 'PDF exported', description: `Dashboard report for ${activeRelease.version} (${selectedEnv}) saved.` });
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
