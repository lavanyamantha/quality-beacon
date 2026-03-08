import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DemoModeProvider } from "./contexts/DemoModeContext";
import { ReleaseProvider } from "./contexts/ReleaseContext";
import { BrandingProvider } from "./contexts/BrandingContext";
import { IntegrationsProvider } from "./contexts/IntegrationsContext";
import { ServiceHealthConfigProvider } from "./contexts/ServiceHealthConfigContext";
import { AuthProviderWrapper } from "./contexts/AuthContext";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
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
import LoginPage from "./pages/LoginPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DemoModeProvider>
        <ReleaseProvider>
        <IntegrationsProvider>
        <ServiceHealthConfigProvider>
        <BrandingProvider>
        <AuthProviderWrapper>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />

              {/* Protected routes */}
              <Route element={<AppLayout />}>
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/release-advisor" element={<ProtectedRoute><ReleaseAdvisorPage /></ProtectedRoute>} />
                <Route path="/services" element={<ProtectedRoute><ServiceHealthPage /></ProtectedRoute>} />
                <Route path="/test-analytics" element={<ProtectedRoute><TestAnalyticsPage /></ProtectedRoute>} />
                <Route path="/flaky-tests" element={<ProtectedRoute><FlakyTestsPage /></ProtectedRoute>} />
                <Route path="/defects" element={<ProtectedRoute><DefectAnalyticsPage /></ProtectedRoute>} />
                <Route path="/coverage" element={<ProtectedRoute><CoverageInsightsPage /></ProtectedRoute>} />
                <Route path="/pipelines" element={<ProtectedRoute><PipelinesPage /></ProtectedRoute>} />
                <Route path="/timeline" element={<ProtectedRoute><TimelinePage /></ProtectedRoute>} />
                <Route path="/risk" element={<ProtectedRoute><RiskPredictionPage /></ProtectedRoute>} />
                <Route path="/ai-assistant" element={<ProtectedRoute><QAAssistantPage /></ProtectedRoute>} />
                <Route path="/docs" element={<ProtectedRoute><DocumentationPage /></ProtectedRoute>} />

                {/* Admin-only route */}
                <Route path="/settings" element={<ProtectedRoute requireAdmin><SettingsPage /></ProtectedRoute>} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProviderWrapper>
        </BrandingProvider>
        </ServiceHealthConfigProvider>
        </IntegrationsProvider>
        </ReleaseProvider>
      </DemoModeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
