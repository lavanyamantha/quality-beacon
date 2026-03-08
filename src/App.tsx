import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DemoModeProvider } from "./contexts/DemoModeContext";
import { ReleaseProvider } from "./contexts/ReleaseContext";
import { BrandingProvider } from "./contexts/BrandingContext";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Index";
import ReleaseAdvisorPage from "./pages/ReleaseAdvisorPage";
import ServiceHealthPage from "./pages/ServiceHealthPage";
import TestAnalyticsPage from "./pages/TestAnalyticsPage";
import FlakyTestsPage from "./pages/FlakyTestsPage";
import DefectAnalyticsPage from "./pages/DefectAnalyticsPage";
import CoverageInsightsPage from "./pages/CoverageInsightsPage";
import PipelinesPage from "./pages/PipelinesPage";
import TimelinePage from "./pages/TimelinePage";
import RiskPredictionPage from "./pages/RiskPredictionPage";
import QAAssistantPage from "./pages/QAAssistantPage";
import SettingsPage from "./pages/SettingsPage";
import DocumentationPage from "./pages/DocumentationPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DemoModeProvider>
        <ReleaseProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/release-advisor" element={<ReleaseAdvisorPage />} />
                <Route path="/services" element={<ServiceHealthPage />} />
                <Route path="/test-analytics" element={<TestAnalyticsPage />} />
                <Route path="/flaky-tests" element={<FlakyTestsPage />} />
                <Route path="/defects" element={<DefectAnalyticsPage />} />
                <Route path="/coverage" element={<CoverageInsightsPage />} />
                <Route path="/pipelines" element={<PipelinesPage />} />
                <Route path="/timeline" element={<TimelinePage />} />
                <Route path="/risk" element={<RiskPredictionPage />} />
                <Route path="/ai-assistant" element={<QAAssistantPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/docs" element={<DocumentationPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ReleaseProvider>
      </DemoModeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
