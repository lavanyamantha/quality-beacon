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
      const el = dashboardRef.current;

      // Clone the dashboard into an offscreen container at a fixed wide width
      // so the 3-column grid renders properly without overlap
      const clone = el.cloneNode(true) as HTMLElement;
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'position:fixed;left:-9999px;top:0;width:1400px;background:#0a0a0f;padding:24px;';
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      // Expand all overflow-hidden elements in the clone
      clone.querySelectorAll<HTMLElement>('[class*="overflow"]').forEach(child => {
        child.style.overflow = 'visible';
        child.style.maxHeight = 'none';
      });
      // Ensure truncated text is fully visible
      clone.querySelectorAll<HTMLElement>('[class*="truncate"]').forEach(child => {
        child.style.overflow = 'visible';
        child.style.textOverflow = 'unset';
        child.style.whiteSpace = 'normal';
      });

      // Wait a tick for layout to settle
      await new Promise(r => setTimeout(r, 100));

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0a0a0f',
        logging: false,
        width: 1400,
        windowWidth: 1400,
      });

      document.body.removeChild(wrapper);

      // Use landscape A4 for better fit
      const pageWidth = 842;  // A4 landscape width in pt
      const pageHeight = 595; // A4 landscape height in pt
      const margin = 36;
      const contentWidth = pageWidth - margin * 2;
      const headerHeight = 90;

      const exportDate = new Date();
      const dateStr = exportDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const timeStr = exportDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

      // --- Header on first page ---
      const drawHeader = () => {
        pdf.setFillColor(15, 15, 25);
        pdf.rect(0, 0, pageWidth, headerHeight, 'F');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.setTextColor(255, 255, 255);
        pdf.text(brandName, margin, 30);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(160, 160, 180);
        pdf.text('Quality Command Center — Dashboard Report', margin, 46);

        pdf.setFontSize(8);
        pdf.setTextColor(120, 120, 140);
        const meta = [
          `Release: ${activeRelease.version} (${activeRelease.name})`,
          `Status: ${activeRelease.status.toUpperCase()}`,
          `Environment: ${selectedEnv}`,
          `Exported: ${dateStr} at ${timeStr}`,
        ];
        pdf.text(meta.join('    •    '), margin, 62);

        pdf.setDrawColor(60, 60, 80);
        pdf.setLineWidth(0.5);
        pdf.line(margin, headerHeight - 6, pageWidth - margin, headerHeight - 6);
      };

      const drawFooter = (pageNum: number, totalPages: number) => {
        pdf.setFontSize(7);
        pdf.setTextColor(100, 100, 120);
        pdf.text(`${brandName} — Confidential`, margin, pageHeight - 16);
        pdf.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin - 55, pageHeight - 16);
      };

      // --- Render dashboard image across pages ---
      const imgData = canvas.toDataURL('image/png');
      const imgAspect = canvas.height / canvas.width;
      const imgWidth = contentWidth;
      const imgHeight = imgWidth * imgAspect;

      const firstPageContentHeight = pageHeight - headerHeight - margin - 30; // space after header
      const subsequentPageContentHeight = pageHeight - margin * 2 - 20;

      // Calculate how many pages we need
      let remainingHeight = imgHeight;
      const pageSlices: { srcY: number; sliceH: number; destY: number }[] = [];

      // First page
      const firstSlice = Math.min(remainingHeight, firstPageContentHeight);
      pageSlices.push({ srcY: 0, sliceH: firstSlice, destY: headerHeight + 6 });
      remainingHeight -= firstSlice;

      // Subsequent pages
      while (remainingHeight > 0) {
        const slice = Math.min(remainingHeight, subsequentPageContentHeight);
        pageSlices.push({ srcY: imgHeight - remainingHeight, sliceH: slice, destY: margin });
        remainingHeight -= slice;
      }

      const totalPages = pageSlices.length;

      for (let i = 0; i < pageSlices.length; i++) {
        if (i > 0) pdf.addPage();

        if (i === 0) drawHeader();

        const { srcY, sliceH, destY } = pageSlices[i];

        // Create a temp canvas for this slice
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        // Map slice coordinates back to source canvas pixels
        const srcPixelY = Math.round((srcY / imgHeight) * canvas.height);
        const srcPixelH = Math.round((sliceH / imgHeight) * canvas.height);
        sliceCanvas.height = srcPixelH;
        const ctx = sliceCanvas.getContext('2d')!;
        ctx.drawImage(canvas, 0, srcPixelY, canvas.width, srcPixelH, 0, 0, canvas.width, srcPixelH);

        const sliceData = sliceCanvas.toDataURL('image/png');
        const sliceAspect = srcPixelH / canvas.width;
        const renderH = imgWidth * sliceAspect;
        pdf.addImage(sliceData, 'PNG', margin, destY, imgWidth, renderH);

        drawFooter(i + 1, totalPages);
      }

      pdf.save(`dashboard-${activeRelease.version}-${selectedEnv}-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast({ title: 'PDF exported', description: `Dashboard report for ${activeRelease.version} (${selectedEnv}) saved.` });
    } catch (err) {
      console.error('PDF export error:', err);
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
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Select value={selectedReleaseId} onValueChange={setSelectedReleaseId}>
            <SelectTrigger className="w-[160px] sm:w-[200px] h-9 text-xs">
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
            <SelectTrigger className="w-[110px] sm:w-[130px] h-9 text-xs">
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
            <span className="hidden sm:inline">{exporting ? 'Exporting…' : 'Export PDF'}</span>
            <span className="sm:hidden">{exporting ? '…' : 'PDF'}</span>
          </Button>
        </div>
      </div>

      <div ref={dashboardRef} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ReadinessGauge />
          <AIAdvisorCard />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <TestSummaryCard />
          <DefectSummaryCard />
          <ReadinessTrendCard />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ServiceHealthGrid />
          <PipelineStatusCard />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FlakyTestCard />
        </div>
      </div>
    </div>
  );
}
