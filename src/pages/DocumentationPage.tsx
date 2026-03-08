import { useState } from 'react';
import {
  BookOpen, Shield, Settings, TestTube2, BarChart3, Bot,
  Users, Palette, Bell, Lock, ChevronRight, ChevronDown,
  LayoutDashboard, Activity, Bug, Zap, GitBranch, Cpu,
  Eye, Monitor, Database, Globe, Key, Layers, AlertTriangle,
  CheckCircle2, XCircle, Clock, TrendingUp, FileText, Search,
  Workflow, Server, Gauge, Brain, MessageSquare, Target,
  Terminal, Network, HardDrive, ShieldCheck, Plug, Cog
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

import dashboardImg from '@/assets/docs/dashboard-overview.jpg';
import settingsImg from '@/assets/docs/settings-admin.jpg';
import testAnalyticsImg from '@/assets/docs/test-analytics.jpg';
import serviceHealthImg from '@/assets/docs/service-health.jpg';
import aiAssistantImg from '@/assets/docs/ai-assistant.jpg';

/* ─── Image Component ─── */
function DocImage({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <div className="my-6 rounded-xl overflow-hidden border border-border shadow-lg">
      <img src={src} alt={alt} className="w-full h-auto" loading="lazy" />
      {caption && (
        <div className="px-4 py-2.5 bg-muted/50 border-t border-border">
          <p className="text-xs text-muted-foreground italic">{caption}</p>
        </div>
      )}
    </div>
  );
}

/* ─── Collapsible Section ─── */
function DocSection({ title, icon: Icon, children, defaultOpen = false }: {
  title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-primary" />
        </div>
        <span className="font-semibold text-sm text-foreground flex-1">{title}</span>
        {open ? <ChevronDown size={16} className="text-muted-foreground" /> : <ChevronRight size={16} className="text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 space-y-4 border-t border-border/50">
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── Info Callout ─── */
function Callout({ type = 'info', children }: { type?: 'info' | 'warning' | 'tip'; children: React.ReactNode }) {
  const styles = {
    info: 'border-primary/30 bg-primary/5 text-primary',
    warning: 'border-warning/30 bg-warning/5 text-warning',
    tip: 'border-success/30 bg-success/5 text-success',
  };
  const icons = { info: Eye, warning: AlertTriangle, tip: CheckCircle2 };
  const Icon = icons[type];
  return (
    <div className={`flex gap-3 p-4 rounded-lg border ${styles[type]}`}>
      <Icon size={16} className="shrink-0 mt-0.5" />
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

/* ─── Step List ─── */
function StepList({ steps }: { steps: { title: string; desc: string }[] }) {
  return (
    <div className="space-y-3">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-3">
          <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-xs font-bold text-primary">{i + 1}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{step.title}</p>
            <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{step.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Permission Matrix ─── */
function PermissionMatrix() {
  const features = [
    { name: 'Dashboard & Readiness Score', admin: 'full', viewer: 'read' },
    { name: 'Release Advisor (AI)', admin: 'full', viewer: 'read' },
    { name: 'Service Health Monitoring', admin: 'full', viewer: 'read' },
    { name: 'Test Analytics', admin: 'full', viewer: 'read' },
    { name: 'Flaky Test Detection', admin: 'full', viewer: 'read' },
    { name: 'Defect Analytics', admin: 'full', viewer: 'read' },
    { name: 'Coverage Insights', admin: 'full', viewer: 'read' },
    { name: 'Pipeline Monitoring', admin: 'full', viewer: 'read' },
    { name: 'Risk Prediction', admin: 'full', viewer: 'read' },
    { name: 'QA AI Assistant', admin: 'full', viewer: 'read' },
    { name: 'Release Timeline', admin: 'full', viewer: 'read' },
    { name: 'Settings & Configuration', admin: 'full', viewer: 'none' },
    { name: 'Integration Management', admin: 'full', viewer: 'none' },
    { name: 'AI Provider Configuration', admin: 'full', viewer: 'none' },
    { name: 'Branding & Customization', admin: 'full', viewer: 'none' },
    { name: 'Environment Management', admin: 'full', viewer: 'none' },
    { name: 'User & Role Management', admin: 'full', viewer: 'none' },
    { name: 'Demo Mode Toggle', admin: 'full', viewer: 'none' },
  ];

  const badge = (level: string) => {
    if (level === 'full') return <Badge className="bg-success/15 text-success border-success/30 text-[10px]">Full Access</Badge>;
    if (level === 'read') return <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px]">Read Only</Badge>;
    return <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-[10px]">No Access</Badge>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-semibold text-foreground">Feature / Module</th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">Admin</th>
            <th className="text-center py-3 px-4 font-semibold text-foreground">Viewer</th>
          </tr>
        </thead>
        <tbody>
          {features.map((f, i) => (
            <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
              <td className="py-2.5 px-4 text-muted-foreground">{f.name}</td>
              <td className="py-2.5 px-4 text-center">{badge(f.admin)}</td>
              <td className="py-2.5 px-4 text-center">{badge(f.viewer)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Module Reference Data ─── */
const modules = [
  {
    path: '/', icon: LayoutDashboard, name: 'Dashboard', badge: 'Core',
    shortDesc: 'Release readiness score, trend analysis, and risk factor overview.',
    details: 'The main dashboard provides a centralized view of your release quality posture. The Release Readiness Gauge (0–100) aggregates six weighted metrics into a single actionable score. Below the gauge, summary cards surface test pass/fail counts, critical defect counts, pipeline stability percentages, and flaky test alerts. The AI Advisor card provides a natural-language summary of the current release risk.',
    features: ['Real-time readiness gauge with historical trend line', 'Summary cards for tests, defects, pipelines, flaky tests, and service health', 'AI-generated advisor summary with key risk factors', 'Release comparison selector to switch between active releases'],
  },
  {
    path: '/release-advisor', icon: Bot, name: 'Release Advisor', badge: 'AI',
    shortDesc: 'AI-powered Go/Hold/No-Go recommendations with confidence scores.',
    details: 'The Release Advisor analyzes all quality signals — test results, defect severity, pipeline health, coverage gaps, and service status — to produce an actionable recommendation. Each recommendation includes a confidence percentage, a list of contributing factors with their impact weights, and a detailed rationale explaining the reasoning.',
    features: ['Go / Hold / No-Go recommendation with confidence level', 'Factor-by-factor breakdown showing what influenced the decision', 'Historical recommendation timeline for past releases', 'Explainable AI — every decision is fully transparent'],
  },
  {
    path: '/services', icon: Activity, name: 'Service Health', badge: 'Monitoring',
    shortDesc: 'Microservice health monitoring with error rates and latency.',
    details: 'Monitor the operational health of all your microservices across environments (Dev, QA, Staging, Production). Each service card shows real-time status (Healthy / Degraded / Unhealthy), error rate percentages, average latency in milliseconds, and the last deployment timestamp. Health checks are performed against configurable endpoints (/health, /actuator/health).',
    features: ['Per-service health status with color-coded indicators', 'Error rate and latency tracking with sparkline charts', 'Multi-environment switching (Dev, QA, Stage, Prod)', 'Configurable health check endpoints per service'],
  },
  {
    path: '/test-analytics', icon: TestTube2, name: 'Test Analytics', badge: 'Testing',
    shortDesc: 'Test execution trends, pass/fail rates, and automation metrics.',
    details: 'Comprehensive test execution analytics with filterable views by project, team, pipeline, service, release, or date range. Track total executions, passed/failed/skipped counts, and automation pass rates over time. The execution trend chart reveals patterns across sprints or releases.',
    features: ['Execution summary with pass/fail/skip breakdowns', 'Trend charts showing quality trajectory over time', 'Multi-dimensional filtering (project, team, pipeline, service, release, date)', 'Automation vs. manual test ratio tracking'],
  },
  {
    path: '/flaky-tests', icon: Zap, name: 'Flaky Tests', badge: 'Testing',
    shortDesc: 'Historical flakiness detection with AI root cause suggestions.',
    details: 'Identifies unreliable tests that produce inconsistent results. Each flaky test shows a flakiness score (0–100), the number of flip-flops in recent runs, historical pass/fail patterns, and AI-suggested root causes (timing issues, resource contention, test isolation problems). Prioritize remediation by impact on overall test reliability.',
    features: ['Flakiness scoring algorithm based on historical patterns', 'Pass/fail pattern visualization per test', 'AI-generated root cause suggestions', 'Impact ranking to prioritize fixes'],
  },
  {
    path: '/defects', icon: Bug, name: 'Defect Analytics', badge: 'Quality',
    shortDesc: 'Severity distribution, aging, density, and leakage tracking.',
    details: 'Track defects across their full lifecycle. Analyze severity distribution (Critical, High, Medium, Low), defect aging (how long defects remain open), density per module or service, and leakage between environments (defects escaping from QA to Production). Trend views reveal whether quality is improving or degrading across releases.',
    features: ['Severity distribution charts (Critical / High / Medium / Low)', 'Defect aging analysis with SLA tracking', 'Density metrics per service or module', 'Environment leakage tracking (QA → Staging → Production)'],
  },
  {
    path: '/coverage', icon: Shield, name: 'Coverage Insights', badge: 'Quality',
    shortDesc: 'Multi-layer coverage heatmaps across services and test types.',
    details: 'Visualize test coverage across multiple dimensions: API automation, UI automation, manual testing, and code coverage (from SonarQube). The coverage heatmap highlights undertested areas, making it easy to identify gaps before release. Each cell in the heatmap shows the coverage percentage and is color-coded from red (low) to green (high).',
    features: ['Multi-layer heatmap (API, UI, Manual, Code coverage)', 'Per-service and per-module coverage breakdown', 'SonarQube integration for code coverage data', 'Gap identification with visual highlighting'],
  },
  {
    path: '/pipelines', icon: GitBranch, name: 'Pipelines', badge: 'CI/CD',
    shortDesc: 'CI/CD pipeline stability, failure rates, and build durations.',
    details: 'Monitor your CI/CD pipeline health with success/failure rate tracking, build duration trends, and stage-level breakdowns. Identify bottleneck stages, recurring failures, and long-running builds. Pipeline data integrates with Azure DevOps and other CI/CD systems.',
    features: ['Pipeline success/failure rate tracking', 'Build duration trends with stage-level breakdown', 'Failure pattern detection across runs', 'Integration with Azure DevOps and CI/CD systems'],
  },
  {
    path: '/risk', icon: BarChart3, name: 'Risk Prediction', badge: 'AI',
    shortDesc: 'ML-based risk scoring per service with historical trends.',
    details: 'The Risk Prediction engine uses machine learning to score each service or component for release risk. Factors include defect density, pipeline failure frequency, automation coverage gaps, code churn rate, and historical defect patterns. The risk matrix shows all services plotted by likelihood and impact, making it easy to focus on the highest-risk areas.',
    features: ['Per-service risk scores (0–100) with contributing factors', 'Risk matrix visualization (likelihood × impact)', 'Historical risk trend charts per release', 'AI-powered predictions based on multiple quality signals'],
  },
  {
    path: '/timeline', icon: Clock, name: 'Release Timeline', badge: 'Tracking',
    shortDesc: 'Chronological view of commits, builds, tests, defects, and deployments.',
    details: 'A unified chronological timeline showing all release activities — code commits, build triggers, test executions, defect discoveries, and deployments. Filter by event type, service, or date range to focus on specific areas. The timeline provides a complete audit trail of everything that happened during a release cycle.',
    features: ['Unified event timeline across all quality activities', 'Event type filtering (commits, builds, tests, defects, deployments)', 'Service and date range filters', 'Complete release audit trail'],
  },
  {
    path: '/ai-assistant', icon: Cpu, name: 'QA Assistant', badge: 'AI',
    shortDesc: 'Conversational AI for natural language quality queries.',
    details: 'Ask quality questions in plain English and get instant, data-backed answers. The QA Assistant can query test results, identify flaky tests, surface risk areas, and provide recommendations. It understands context from your project data and generates actionable insights with supporting charts and metrics.',
    features: ['Natural language queries about quality data', 'Context-aware responses using your project data', 'Inline charts and metrics in responses', 'Suggested follow-up questions for deeper analysis'],
  },
  {
    path: '/settings', icon: Settings, name: 'Settings', badge: 'Admin Only',
    shortDesc: 'Platform configuration, integrations, AI providers, and branding.',
    details: 'The Settings hub is exclusively available to Admin users. It provides comprehensive platform configuration including external integrations (Azure DevOps, Jira, SonarQube), AI provider management (OpenAI, Anthropic, Google, Meta), environment configuration, custom branding (logo, colors, theme), notification channels, governance & compliance settings, and Demo Mode control.',
    features: ['Integration management with connection testing', 'AI provider configuration with model selection', 'Environment CRUD with health endpoint mapping', 'Custom branding (logo, colors, theme, app name)', 'Notification channel setup with webhook testing', 'Governance controls (PII redaction, data residency)', 'Demo Mode toggle for synthetic data'],
  },
];

/* ─── Scoring Factors ─── */
const scoringFactors = [
  { factor: 'Test Pass Rate', weight: 30, color: 'bg-primary', icon: TestTube2, desc: 'Percentage of test cases passing in the current release. Calculated from the most recent test execution results across all configured pipelines and test suites. A 100% pass rate contributes the full 30 points.' },
  { factor: 'Defect Severity', weight: 20, color: 'bg-destructive', icon: Bug, desc: 'Weighted severity of open defects. Critical defects have 4× impact, High defects 3×, Medium 2×, and Low 1×. The score decreases as the total weighted severity increases relative to the service count.' },
  { factor: 'Automation Coverage', weight: 15, color: 'bg-accent', icon: Layers, desc: 'Ratio of automated tests to total test cases. Includes API automation, UI automation, and unit tests. Higher automation coverage indicates more repeatable and reliable testing.' },
  { factor: 'Pipeline Stability', weight: 15, color: 'bg-info', icon: Workflow, desc: 'Success rate of CI/CD pipeline runs over the last 14 days. Frequent pipeline failures indicate build instability, environment issues, or integration problems that could delay releases.' },
  { factor: 'Service Health', weight: 10, color: 'bg-success', icon: Server, desc: 'Aggregate health status of all monitored microservices. Based on real-time health check responses, error rates, and latency measurements. Degraded or unhealthy services reduce this score.' },
  { factor: 'Code Coverage', weight: 10, color: 'bg-warning', icon: FileText, desc: 'Code coverage percentage from SonarQube or similar tools. Measures the percentage of code lines, branches, or statements exercised by tests. Industry standard target is 80%+.' },
];

/* ═══════════════════════════════════════════════════════ */
export default function DocumentationPage() {
  const [selectedRole, setSelectedRole] = useState<'Admin' | 'Viewer'>('Admin');

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Documentation</h1>
            <p className="text-sm text-muted-foreground">Comprehensive platform guide — roles, modules, scoring, and governance</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="getting-started" className="space-y-6">
        <TabsList className="bg-card border border-border flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="role-guides">Role Guides</TabsTrigger>
          <TabsTrigger value="modules">Module Reference</TabsTrigger>
          <TabsTrigger value="scoring">Scoring Model</TabsTrigger>
          <TabsTrigger value="ai-governance">AI & Governance</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure & Setup</TabsTrigger>
        </TabsList>

        {/* ═══ Getting Started ═══ */}
        <TabsContent value="getting-started" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Monitor size={20} className="text-primary" />
                Welcome to QA Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                QA Dashboard is an enterprise-grade release quality intelligence platform that aggregates data from your CI/CD pipelines,
                test automation frameworks, defect trackers, and code analysis tools into a unified view. It uses AI to provide actionable
                release recommendations and predictive risk analysis.
              </p>

              <DocImage src={dashboardImg} alt="Dashboard overview showing release readiness gauge and metrics" caption="Figure 1: Main Dashboard — The Release Readiness Gauge shows an aggregate score calculated from six weighted quality factors. Summary cards below provide at-a-glance metrics." />

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Target size={14} className="text-primary" /> Who Is This For?
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    <li>• <strong className="text-foreground">Admins</strong> — Configure integrations, AI providers, environments, branding, and manage the platform</li>
                    <li>• <strong className="text-foreground">Viewers</strong> — Monitor quality dashboards, review analytics, and track release health in read-only mode</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Key size={14} className="text-primary" /> Authentication
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The platform supports federated SSO via <strong className="text-foreground">GitHub</strong>, <strong className="text-foreground">Google</strong>,{' '}
                    <strong className="text-foreground">Microsoft Entra ID</strong>, and <strong className="text-foreground">AWS IAM Identity Center</strong>.
                    Roles (Admin or Viewer) are assigned based on the <code className="text-xs bg-muted px-1 py-0.5 rounded">ADMIN_EMAILS</code> environment variable on the server.
                  </p>
                </div>
              </div>

              <Callout type="tip">
                <strong>Demo Mode:</strong> When no proxy server is configured, the platform runs in Demo Mode with synthetic data
                (12 microservices, 8 pipelines, 20+ releases, 10,000+ test executions) — perfect for evaluation and demonstrations.
                All features are accessible without authentication.
              </Callout>

              <Separator />

              <h3 className="text-base font-semibold text-foreground">Quick Start for Admins</h3>
              <StepList steps={[
                { title: 'Log in via SSO', desc: 'Navigate to the platform URL and authenticate using your configured SSO provider (GitHub, Google, Microsoft Entra ID, or AWS IAM).' },
                { title: 'Configure Integrations', desc: 'Go to Settings → Integrations to connect Azure DevOps (pipelines & test results), Jira (defect tracking), and SonarQube (code coverage). Test each connection to verify.' },
                { title: 'Set Up AI Providers', desc: 'Navigate to Settings → AI Configuration to add API keys for OpenAI, Anthropic, Google, or Meta. Assign providers to modules (Release Advisor, Risk Prediction, QA Assistant).' },
                { title: 'Configure Environments', desc: 'In Settings → Environments, set up your deployment stages (Dev, QA, Staging, Production) and map health check endpoints for each service.' },
                { title: 'Customize Branding', desc: 'Upload your company logo, set brand colors, change the application name, and select a theme (Dark/Light) in Settings → Branding.' },
                { title: 'Review Dashboard', desc: 'Return to the main Dashboard to see your Release Readiness Score populated with live data from your integrations.' },
              ]} />

              <Separator />

              <h3 className="text-base font-semibold text-foreground">Quick Start for Viewers</h3>
              <StepList steps={[
                { title: 'Log in via SSO', desc: 'Authenticate using the same SSO provider configured for your organization.' },
                { title: 'Explore the Dashboard', desc: 'The main Dashboard shows the overall Release Readiness Score, test summaries, defect counts, and pipeline health.' },
                { title: 'Navigate Modules', desc: 'Use the sidebar to explore Test Analytics, Defect Analytics, Coverage Insights, Pipeline Monitoring, Service Health, and more.' },
                { title: 'Use the AI Assistant', desc: 'Ask natural-language questions about quality data in the QA Assistant module (e.g., "Which services have the most failures?").' },
              ]} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Role Guides ═══ */}
        <TabsContent value="role-guides" className="space-y-6">
          {/* Role Selector */}
          <div className="flex gap-3">
            {(['Admin', 'Viewer'] as const).map((role) => {
              const Icon = role === 'Admin' ? Lock : Eye;
              const isActive = selectedRole === role;
              return (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all text-sm font-medium ${
                    isActive
                      ? 'bg-primary/10 border-primary/40 text-primary shadow-sm'
                      : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/40'
                  }`}
                >
                  <Icon size={16} />
                  {role}
                  <Badge variant="outline" className="text-[10px] ml-1">
                    {role === 'Admin' ? 'Full Access' : 'Read Only'}
                  </Badge>
                </button>
              );
            })}
          </div>

          {/* Admin Guide */}
          {selectedRole === 'Admin' && (
            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                      <Lock size={20} className="text-destructive" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Admin Role</CardTitle>
                      <p className="text-sm text-muted-foreground mt-0.5">Full platform access including all configuration and management capabilities</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Admins have unrestricted access to every module and feature. In addition to all the analytics and monitoring capabilities
                    available to Viewers, Admins can configure integrations, manage AI providers, set up environments, customize branding,
                    manage governance policies, and control Demo Mode.
                  </p>
                </CardContent>
              </Card>

              <DocSection title="Integration Setup" icon={Globe} defaultOpen>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Connect your external toolchain to feed real data into the platform. Navigate to <strong className="text-foreground">Settings → Integrations</strong> to configure:
                </p>
                <div className="grid md:grid-cols-3 gap-3 mt-3">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <p className="text-sm font-semibold text-foreground mb-1">Azure DevOps</p>
                    <p className="text-xs text-muted-foreground">CI/CD pipelines, test results, work items, and build data. Requires a Personal Access Token (PAT) with read access to pipelines, test runs, and work items.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <p className="text-sm font-semibold text-foreground mb-1">Jira</p>
                    <p className="text-xs text-muted-foreground">Defect tracking and issue management. Connect using an API token and configure project keys, issue types, and severity field mappings.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <p className="text-sm font-semibold text-foreground mb-1">SonarQube</p>
                    <p className="text-xs text-muted-foreground">Code coverage reports and static analysis. Provide the SonarQube server URL and authentication token. Maps coverage data to services.</p>
                  </div>
                </div>
                <Callout type="info">
                  Each integration card includes a <strong>"Test Connection"</strong> button that validates your credentials and connectivity before saving.
                  Always test before deploying to production.
                </Callout>
                <DocImage src={settingsImg} alt="Admin settings panel with integration and configuration options" caption="Figure 2: Admin Settings — Configure integrations, API keys, AI providers, and platform branding from a unified settings hub." />
              </DocSection>

              <DocSection title="AI Provider Configuration" icon={Brain}>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Navigate to <strong className="text-foreground">Settings → AI Configuration</strong> to manage AI providers that power the Release Advisor, Risk Prediction, and QA Assistant modules.
                </p>
                <div className="mt-3 space-y-2">
                  {[
                    { name: 'OpenAI', models: 'GPT-4, GPT-4o, GPT-3.5 Turbo' },
                    { name: 'Anthropic', models: 'Claude 3.5 Sonnet, Claude 3 Opus' },
                    { name: 'Google', models: 'Gemini Pro, Gemini Ultra' },
                    { name: 'Meta', models: 'LLaMA 3' },
                  ].map(p => (
                    <div key={p.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                      <span className="text-sm font-medium text-foreground">{p.name}</span>
                      <span className="text-xs text-muted-foreground">{p.models}</span>
                    </div>
                  ))}
                </div>
                <StepList steps={[
                  { title: 'Add a Provider', desc: 'Click "Add Provider", select the vendor, enter your API key, and choose the default model.' },
                  { title: 'Configure Parameters', desc: 'Set temperature (0.0–1.0), max tokens, and response format for each module assignment.' },
                  { title: 'Assign to Modules', desc: 'Map providers to specific modules: Release Advisor, Risk Prediction, QA Assistant, and Defect Analysis.' },
                  { title: 'Test Connectivity', desc: 'Use the "Test" button to send a sample prompt and verify the provider responds correctly.' },
                ]} />
              </DocSection>

              <DocSection title="Environment Management" icon={Server}>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Configure deployment environments in <strong className="text-foreground">Settings → Environments</strong>. Each environment maps to a set of services with health check endpoints.
                </p>
                <div className="grid grid-cols-5 gap-2 mt-3">
                  {['Dev', 'QA', 'Staging', 'Performance', 'Production'].map(env => (
                    <div key={env} className="p-2 rounded-lg bg-muted/30 border border-border/50 text-center">
                      <span className="text-xs font-medium text-foreground">{env}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                  For each environment, you can map pipelines, set base URLs, configure health check endpoints
                  (<code className="text-xs bg-muted px-1 py-0.5 rounded">/health</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">/actuator/health</code>),
                  and define service-specific overrides.
                </p>
              </DocSection>

              <DocSection title="Branding & Customization" icon={Palette}>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Customize the platform's visual identity in <strong className="text-foreground">Settings → Branding</strong>:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1.5 mt-2">
                  <li>• <strong className="text-foreground">Application Name</strong> — Displayed in the sidebar header and browser tab</li>
                  <li>• <strong className="text-foreground">Company Logo</strong> — Upload PNG/SVG, displayed in the sidebar and login page</li>
                  <li>• <strong className="text-foreground">Primary Color</strong> — Choose from preset swatches or enter a custom HSL value; affects buttons, links, and accents</li>
                  <li>• <strong className="text-foreground">Theme</strong> — Dark, Light, or System (auto-detects OS preference)</li>
                </ul>
              </DocSection>

              <DocSection title="Governance & Compliance" icon={Shield}>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Enterprise security controls available in <strong className="text-foreground">Settings → Governance</strong>:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1.5 mt-2">
                  <li>• <strong className="text-foreground">PII Redaction</strong> — Automatically redact personally identifiable information from AI prompts</li>
                  <li>• <strong className="text-foreground">Source Code Protection</strong> — Prevent source code snippets from being sent to external AI providers</li>
                  <li>• <strong className="text-foreground">Data Residency</strong> — Choose between public cloud, private endpoints (Azure OpenAI, AWS Bedrock), or self-hosted LLMs</li>
                  <li>• <strong className="text-foreground">Audit Logging</strong> — All AI interactions, configuration changes, and user actions are logged with timestamps</li>
                </ul>
              </DocSection>

              <DocSection title="Demo Mode" icon={Database}>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Toggle Demo Mode in <strong className="text-foreground">Settings → Demo Mode</strong> to populate the platform with realistic synthetic data:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  {[
                    { label: '12', desc: 'Microservices' },
                    { label: '8', desc: 'CI/CD Pipelines' },
                    { label: '20+', desc: 'Releases' },
                    { label: '10,000+', desc: 'Test Executions' },
                  ].map(s => (
                    <div key={s.desc} className="p-3 rounded-lg bg-muted/30 border border-border/50 text-center">
                      <p className="text-lg font-bold text-primary">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  ))}
                </div>
                <Callout type="warning">
                  Demo Mode replaces live data with synthetic data. Do not enable in production environments where real-time monitoring is critical.
                </Callout>
              </DocSection>
            </div>
          )}

          {/* Viewer Guide */}
          {selectedRole === 'Viewer' && (
            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Eye size={20} className="text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Viewer Role</CardTitle>
                      <p className="text-sm text-muted-foreground mt-0.5">Read-only access to all dashboards, analytics, and monitoring modules</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Viewers can access all analytics dashboards, monitoring views, and AI-powered insights without the ability to modify
                    configurations or platform settings. This role is ideal for stakeholders, team leads, and developers who need visibility
                    into quality metrics.
                  </p>
                </CardContent>
              </Card>

              <DocSection title="Dashboard & Release Readiness" icon={Gauge} defaultOpen>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The main <strong className="text-foreground">Dashboard</strong> provides an at-a-glance view of your release quality posture:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1.5 mt-2">
                  <li>• <strong className="text-foreground">Readiness Gauge</strong> — A 0–100 score showing overall release readiness</li>
                  <li>• <strong className="text-foreground">Readiness Trend</strong> — Historical chart showing how the score has changed over time</li>
                  <li>• <strong className="text-foreground">Test Summary</strong> — Total tests, passed, failed, and skipped counts</li>
                  <li>• <strong className="text-foreground">Defect Summary</strong> — Open defects by severity with trend indicators</li>
                  <li>• <strong className="text-foreground">Pipeline Status</strong> — Recent pipeline run success/failure rates</li>
                  <li>• <strong className="text-foreground">Service Health</strong> — Quick grid showing service status across environments</li>
                  <li>• <strong className="text-foreground">AI Advisor</strong> — Natural-language summary of current risk factors</li>
                </ul>
                <DocImage src={dashboardImg} alt="Dashboard with readiness gauge and metrics" caption="Figure 3: Viewer Dashboard — All metrics are visible in read-only mode. Use the release selector at the top to switch between releases." />
              </DocSection>

              <DocSection title="Test Analytics & Flaky Tests" icon={TestTube2}>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Navigate to <strong className="text-foreground">Test Analytics</strong> to explore test execution data with powerful filtering.
                  Switch to <strong className="text-foreground">Flaky Tests</strong> to identify unreliable tests that need attention.
                </p>
                <DocImage src={testAnalyticsImg} alt="Test analytics with charts and execution data" caption="Figure 4: Test Analytics — Bar charts, pie charts, and trend lines provide comprehensive visibility into test execution patterns." />
                <Callout type="tip">
                  Use the multi-dimensional filters (project, team, pipeline, service, release, date range) to drill down into specific areas of interest.
                </Callout>
              </DocSection>

              <DocSection title="Service Health Monitoring" icon={Activity}>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The <strong className="text-foreground">Service Health</strong> page displays a grid of all monitored microservices with real-time status indicators.
                  Switch between environments using the environment selector at the top.
                </p>
                <DocImage src={serviceHealthImg} alt="Service health monitoring grid" caption="Figure 5: Service Health Grid — Each card shows status, error rate, and latency with sparkline charts. Color coding: Green = Healthy, Yellow = Degraded, Red = Unhealthy." />
              </DocSection>

              <DocSection title="AI-Powered Features" icon={Brain}>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  As a Viewer, you have full access to all AI-powered features:
                </p>
                <div className="grid md:grid-cols-3 gap-3 mt-3">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <p className="text-sm font-semibold text-foreground mb-1 flex items-center gap-1.5"><Bot size={14} className="text-primary" /> Release Advisor</p>
                    <p className="text-xs text-muted-foreground">View Go/Hold/No-Go recommendations with confidence scores and explainable reasoning.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <p className="text-sm font-semibold text-foreground mb-1 flex items-center gap-1.5"><BarChart3 size={14} className="text-primary" /> Risk Prediction</p>
                    <p className="text-xs text-muted-foreground">Review per-service risk scores and the risk matrix showing likelihood × impact.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <p className="text-sm font-semibold text-foreground mb-1 flex items-center gap-1.5"><MessageSquare size={14} className="text-primary" /> QA Assistant</p>
                    <p className="text-xs text-muted-foreground">Ask natural-language questions and get data-backed answers with inline charts.</p>
                  </div>
                </div>
                <DocImage src={aiAssistantImg} alt="QA AI Assistant conversational interface" caption="Figure 6: QA Assistant — Ask questions in plain English and receive contextual answers with supporting data visualizations." />
              </DocSection>

              <DocSection title="Additional Modules" icon={Layers}>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Viewers also have read-only access to:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1.5 mt-2">
                  <li>• <strong className="text-foreground">Defect Analytics</strong> — Severity distribution, aging, density, and environment leakage</li>
                  <li>• <strong className="text-foreground">Coverage Insights</strong> — Multi-layer heatmaps (API, UI, Manual, Code coverage)</li>
                  <li>• <strong className="text-foreground">Pipelines</strong> — CI/CD pipeline health, failure rates, and build duration trends</li>
                  <li>• <strong className="text-foreground">Release Timeline</strong> — Chronological audit trail of all release activities</li>
                </ul>
              </DocSection>

              <Callout type="info">
                <strong>Need Admin access?</strong> Contact your organization's administrator to upgrade your role. Admin privileges are required
                to access Settings, configure integrations, and manage AI providers.
              </Callout>
            </div>
          )}

          {/* Permission Matrix */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users size={20} className="text-primary" />
                Permission Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PermissionMatrix />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Module Reference ═══ */}
        <TabsContent value="modules" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Detailed reference for every module in the platform. Click to expand each module for full documentation.
          </p>
          {modules.map((mod) => (
            <DocSection key={mod.path} title={mod.name} icon={mod.icon}>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="text-[10px]">{mod.badge}</Badge>
                <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">{mod.path}</code>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{mod.details}</p>
              <div className="mt-4">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Key Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  {mod.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-success shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </DocSection>
          ))}
        </TabsContent>

        {/* ═══ Scoring Model ═══ */}
        <TabsContent value="scoring" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Gauge size={20} className="text-primary" />
                Release Readiness Scoring Model
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                The Release Readiness Score is a transparent, weighted composite metric ranging from <strong className="text-foreground">0 (Not Ready)</strong> to{' '}
                <strong className="text-foreground">100 (Fully Ready)</strong>. It is calculated in real-time from six quality factors,
                each contributing proportionally based on configurable weights.
              </p>

              <div className="space-y-4">
                {scoringFactors.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.factor} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon size={16} className="text-primary" />
                          <span className="text-sm font-semibold text-foreground">{item.factor}</span>
                        </div>
                        <Badge variant="outline" className="text-xs font-mono">{item.weight}%</Badge>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.weight * 3.3}%` }} />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>

              <Separator />

              <div>
                <h3 className="text-base font-semibold text-foreground mb-4">Score Interpretation</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { range: '90–100', label: 'Ready to Release', color: 'bg-success', desc: 'All quality gates pass. Minimal risk. Recommend Go.' },
                    { range: '75–89', label: 'Low Risk', color: 'bg-primary', desc: 'Minor concerns. Proceed with awareness. Likely Go.' },
                    { range: '50–74', label: 'At Risk', color: 'bg-warning', desc: 'Significant issues detected. Recommend Hold for review.' },
                    { range: '0–49', label: 'Not Ready', color: 'bg-destructive', desc: 'Critical blockers present. Recommend No-Go.' },
                  ].map(tier => (
                    <div key={tier.range} className="p-4 rounded-lg bg-muted/30 border border-border/50 text-center">
                      <div className={`w-4 h-4 rounded-full ${tier.color} mx-auto mb-2`} />
                      <p className="text-sm font-bold text-foreground">{tier.range}</p>
                      <p className="text-xs font-medium text-foreground mt-1">{tier.label}</p>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{tier.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-base font-semibold text-foreground mb-3">Formula</h3>
                <div className="p-4 rounded-lg bg-muted/50 border border-border font-mono text-sm text-foreground">
                  <p>Score = (TestPassRate × 0.30) + (DefectSeverity × 0.20) + (AutomationCoverage × 0.15)</p>
                  <p className="mt-1 ml-[4.5rem]">+ (PipelineStability × 0.15) + (ServiceHealth × 0.10) + (CodeCoverage × 0.10)</p>
                </div>
                <Callout type="info">
                  Each factor is normalized to a 0–100 scale before weighting. The weights shown above are defaults and can be adjusted by Admins in future versions.
                </Callout>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ AI & Governance ═══ */}
        <TabsContent value="ai-governance" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain size={20} className="text-primary" />
                AI Engine & Governance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                The platform integrates AI capabilities across multiple modules to provide intelligent recommendations,
                predictive analysis, and natural-language querying. All AI features are designed with enterprise-grade
                safety and transparency requirements.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Bot size={16} className="text-primary" /> Supported AI Providers
                  </h4>
                  <div className="space-y-2">
                    {[
                      { name: 'OpenAI', models: 'GPT-4, GPT-4o, GPT-3.5 Turbo', use: 'General purpose, excellent for natural language' },
                      { name: 'Anthropic', models: 'Claude 3.5 Sonnet, Claude 3 Opus', use: 'Strong reasoning, safety-focused' },
                      { name: 'Google', models: 'Gemini Pro, Gemini Ultra', use: 'Multimodal, good for data analysis' },
                      { name: 'Meta', models: 'LLaMA 3', use: 'Self-hostable, privacy-first' },
                    ].map(p => (
                      <div key={p.name} className="p-2.5 rounded bg-muted/40 border border-border/30">
                        <p className="text-sm font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.models}</p>
                        <p className="text-xs text-muted-foreground italic mt-0.5">{p.use}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Shield size={16} className="text-success" /> Enterprise Safety
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-success shrink-0 mt-0.5" /> Confidence scores on all AI recommendations</li>
                      <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-success shrink-0 mt-0.5" /> Explainable reasoning for every decision</li>
                      <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-success shrink-0 mt-0.5" /> Complete audit logging of all AI interactions</li>
                      <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-success shrink-0 mt-0.5" /> PII and source code redaction before AI processing</li>
                      <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-success shrink-0 mt-0.5" /> Human-in-the-loop: AI advises, humans decide</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Activity size={16} className="text-primary" /> AI-Powered Modules
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1.5">
                      <li>• <strong className="text-foreground">Release Advisor</strong> — Go/Hold/No-Go decisions</li>
                      <li>• <strong className="text-foreground">Risk Prediction</strong> — Per-service risk scoring</li>
                      <li>• <strong className="text-foreground">QA Assistant</strong> — Natural-language queries</li>
                      <li>• <strong className="text-foreground">Flaky Test Analysis</strong> — Root cause suggestions</li>
                      <li>• <strong className="text-foreground">Dashboard Advisor</strong> — Risk factor summaries</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-base font-semibold text-foreground mb-4">Data Residency Options</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    {
                      title: 'Public Cloud APIs',
                      icon: Globe,
                      desc: 'Use OpenAI, Anthropic, or Google cloud APIs directly. Fastest to set up. Data is processed by the provider\'s cloud infrastructure.',
                      best: 'Best for: Teams without strict data residency requirements',
                    },
                    {
                      title: 'Private AI Endpoints',
                      icon: Lock,
                      desc: 'Use Azure OpenAI Service, AWS Bedrock, or Google Vertex AI within your own cloud tenancy and region. Data stays within your network.',
                      best: 'Best for: Enterprises with regional data residency requirements',
                    },
                    {
                      title: 'Self-Hosted LLMs',
                      icon: Server,
                      desc: 'Run open-source models (LLaMA 3, Mistral) on your own Kubernetes clusters or GPU infrastructure. Maximum data control.',
                      best: 'Best for: Air-gapped or maximum-security environments',
                    },
                  ].map(opt => (
                    <div key={opt.title} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <opt.icon size={16} className="text-primary" />
                        <h4 className="text-sm font-semibold text-foreground">{opt.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{opt.desc}</p>
                      <p className="text-xs text-primary mt-2 italic">{opt.best}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Shield size={16} className="text-primary" /> Decision Support Mode
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  All AI features operate in <strong className="text-foreground">Decision Support Mode</strong> — the AI provides
                  recommendations, predictions, and insights, but <strong className="text-foreground">human users retain final release authority</strong>.
                  Every AI-driven decision is logged with timestamps, confidence scores, the model used, and the input data that informed the recommendation.
                  This ensures full auditability and compliance with enterprise governance policies.
                </p>
              </div>

              <Callout type="info">
                <strong>AI-Disabled Mode:</strong> The platform can run entirely without AI features enabled. All dashboards, analytics, and monitoring
                modules function independently using rule-based logic. AI features can be enabled incrementally as your organization's policies allow.
              </Callout>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
