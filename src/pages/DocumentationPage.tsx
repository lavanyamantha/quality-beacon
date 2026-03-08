import { useState } from 'react';
import {
  BookOpen, Shield, Settings, TestTube2, BarChart3, Bot,
  Users, Palette, Bell, Lock, ChevronRight, ExternalLink,
  LayoutDashboard, Activity, Bug, Zap, GitBranch, Cpu
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const roleGuides = [
  {
    role: 'Admin',
    icon: Lock,
    color: 'text-destructive',
    badge: 'Full Access',
    sections: [
      {
        title: 'AI Provider Configuration',
        content: 'Navigate to Settings → AI Configuration to set up providers (OpenAI, Anthropic, Google, Meta). Enter API keys, select models, configure temperature and token limits. Assign providers to modules like Risk Prediction, QA Assistant, and Defect Analysis.',
      },
      {
        title: 'Integration Setup',
        content: 'Connect external systems via Settings → Integrations. Supported: Azure DevOps (pipelines, test results, work items), Jira (defect tracking), SonarQube (code coverage reports).',
      },
      {
        title: 'Environment Management',
        content: 'Configure environments (Dev, QA, Stage, Prod, Performance) via Settings → Environments. Map pipelines, set service health endpoints, and configure health check URLs (/health, /actuator/health).',
      },
      {
        title: 'User & Role Management',
        content: 'Manage users and assign roles (Admin, QA Manager, QA Engineer, Developer, Viewer). Authentication integrates with Microsoft Entra ID for enterprise SSO.',
      },
      {
        title: 'Branding & Customization',
        content: 'Upload company logo, set brand colors, change application name, and select dashboard themes via Settings → Branding.',
      },
      {
        title: 'Demo Mode',
        content: 'Toggle Demo Mode in Settings to populate the platform with synthetic data (12 microservices, 8 pipelines, 20 releases, 10,000+ test executions) for demonstrations.',
      },
    ],
  },
  {
    role: 'QA Manager',
    icon: Users,
    color: 'text-primary',
    badge: 'Dashboard + Config',
    sections: [
      {
        title: 'Release Readiness Monitoring',
        content: 'Use the main Dashboard to monitor the Release Readiness Score (0–100). The score is calculated from test pass rates, defect severity, automation coverage, pipeline stability, service health, and code coverage.',
      },
      {
        title: 'Release Advisor',
        content: 'Check the Release Advisor page for AI-generated Go/Hold/No-Go recommendations. Each recommendation includes confidence levels and explainable reasons for the decision.',
      },
      {
        title: 'Defect Tracking',
        content: 'Use Defect Analytics to monitor severity distribution, defect aging, density, and leakage between environments. Track trends per release to identify quality patterns.',
      },
      {
        title: 'Coverage Analysis',
        content: 'Review Coverage Insights to identify undertested areas. View heatmaps across API automation, UI automation, manual tests, and code coverage (SonarQube).',
      },
      {
        title: 'Risk Assessment',
        content: 'Use Risk Prediction to identify high-risk components before release. The AI engine analyzes defect density, pipeline failures, automation coverage, and code churn.',
      },
    ],
  },
  {
    role: 'QA Engineer',
    icon: TestTube2,
    color: 'text-success',
    badge: 'Testing Focus',
    sections: [
      {
        title: 'Test Analytics',
        content: 'Track execution results (total, passed, failed, skipped) with automation pass percentages and execution trend charts. Filter by project, team, pipeline, service, release, or date range.',
      },
      {
        title: 'Flaky Test Detection',
        content: 'Monitor the Flaky Tests page to identify unreliable tests in your area. View flakiness scores, historical pass/fail patterns, and AI-suggested root causes.',
      },
      {
        title: 'Pipeline Monitoring',
        content: 'Check Pipelines for build failures and their impact on your test suites. Track build duration trends and stage-level breakdowns.',
      },
      {
        title: 'QA AI Assistant',
        content: 'Use the AI Assistant for quick quality queries. Ask natural language questions like "Which services have the most failures?" or "Show the top flaky tests."',
      },
    ],
  },
  {
    role: 'Developer',
    icon: GitBranch,
    color: 'text-accent',
    badge: 'Service Focus',
    sections: [
      {
        title: 'Service Health',
        content: 'Monitor your microservices health status (Healthy/Degraded/Unhealthy), error rates, latency, and last deployment timestamps. Switch between environments to check different stages.',
      },
      {
        title: 'Risk Prediction',
        content: 'Before releases, check the Risk Prediction page for your services. View per-service risk scores and understand contributing factors.',
      },
      {
        title: 'Coverage Insights',
        content: 'Verify test coverage for your code changes. View coverage heatmaps by microservice and identify gaps in API, UI, and unit test coverage.',
      },
      {
        title: 'Release Timeline',
        content: 'Track the release timeline to see commits, builds, test executions, defects, and deployments in chronological order.',
      },
    ],
  },
  {
    role: 'Viewer',
    icon: BookOpen,
    color: 'text-muted-foreground',
    badge: 'Read Only',
    sections: [
      {
        title: 'Dashboard Access',
        content: 'View all dashboards in read-only mode. Monitor release readiness, service health, test analytics, defect trends, and coverage metrics without modification capabilities.',
      },
      {
        title: 'Reports',
        content: 'Access all visualizations including readiness gauges, trend charts, heatmaps, and timeline views. Export data for offline analysis when needed.',
      },
    ],
  },
];

const moduleReference = [
  { path: '/', icon: LayoutDashboard, name: 'Dashboard', desc: 'Release readiness score, trend analysis, and risk factor overview.' },
  { path: '/release-advisor', icon: Bot, name: 'Release Advisor', desc: 'AI-powered Go/Hold/No-Go recommendations with confidence scores.' },
  { path: '/services', icon: Activity, name: 'Service Health', desc: 'Microservice health monitoring with error rates and latency.' },
  { path: '/test-analytics', icon: TestTube2, name: 'Test Analytics', desc: 'Test execution trends, pass/fail rates, and automation metrics.' },
  { path: '/flaky-tests', icon: Zap, name: 'Flaky Tests', desc: 'Historical flakiness detection with AI root cause suggestions.' },
  { path: '/defects', icon: Bug, name: 'Defect Analytics', desc: 'Severity distribution, aging, density, and leakage tracking.' },
  { path: '/coverage', icon: Shield, name: 'Coverage Insights', desc: 'Multi-layer coverage heatmaps across services and test types.' },
  { path: '/pipelines', icon: GitBranch, name: 'Pipelines', desc: 'CI/CD pipeline stability, failure rates, and build durations.' },
  { path: '/risk', icon: BarChart3, name: 'Risk Prediction', desc: 'ML-based risk scoring per service with historical trends.' },
  { path: '/ai-assistant', icon: Cpu, name: 'QA Assistant', desc: 'Conversational AI for natural language quality queries.' },
  { path: '/settings', icon: Settings, name: 'Settings', desc: 'Platform configuration, integrations, and branding.' },
];

export default function DocumentationPage() {
  const [selectedRole, setSelectedRole] = useState('Admin');
  const activeGuide = roleGuides.find((g) => g.role === selectedRole)!;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Documentation</h1>
            <p className="text-sm text-muted-foreground">Platform guides, module reference, and configuration help</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="role-guides" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="role-guides">Role Guides</TabsTrigger>
          <TabsTrigger value="modules">Module Reference</TabsTrigger>
          <TabsTrigger value="scoring">Scoring Model</TabsTrigger>
          <TabsTrigger value="ai-governance">AI & Governance</TabsTrigger>
        </TabsList>

        {/* Role Guides Tab */}
        <TabsContent value="role-guides" className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {roleGuides.map((guide) => {
              const Icon = guide.icon;
              return (
                <button
                  key={guide.role}
                  onClick={() => setSelectedRole(guide.role)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all text-sm font-medium ${
                    selectedRole === guide.role
                      ? 'bg-primary/10 border-primary/40 text-primary'
                      : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/40'
                  }`}
                >
                  <Icon size={16} />
                  {guide.role}
                </button>
              );
            })}
          </div>

          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <activeGuide.icon className={`w-6 h-6 ${activeGuide.color}`} />
                  <CardTitle className="text-lg">{activeGuide.role} Guide</CardTitle>
                </div>
                <Badge variant="outline" className="text-xs">{activeGuide.badge}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeGuide.sections.map((section, i) => (
                <div key={i} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <ChevronRight size={14} className="text-primary" />
                    <h3 className="font-semibold text-sm text-foreground">{section.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-5">{section.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Module Reference Tab */}
        <TabsContent value="modules" className="space-y-4">
          <div className="grid gap-3">
            {moduleReference.map((mod) => {
              const Icon = mod.icon;
              return (
                <Card key={mod.path} className="bg-card border-border hover:border-primary/30 transition-colors">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-foreground">{mod.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{mod.desc}</p>
                    </div>
                    <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded shrink-0">{mod.path}</code>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Scoring Model Tab */}
        <TabsContent value="scoring" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Release Readiness Scoring Model</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                The Release Readiness Score (0–100) is calculated using transparent weighted metrics. Each factor contributes proportionally to the final score.
              </p>
              <div className="space-y-3">
                {[
                  { factor: 'Test Pass Rate', weight: 30, color: 'bg-primary' },
                  { factor: 'Defect Severity', weight: 20, color: 'bg-destructive' },
                  { factor: 'Automation Coverage', weight: 15, color: 'bg-accent' },
                  { factor: 'Pipeline Stability', weight: 15, color: 'bg-info' },
                  { factor: 'Service Health', weight: 10, color: 'bg-success' },
                  { factor: 'Code Coverage', weight: 10, color: 'bg-warning' },
                ].map((item) => (
                  <div key={item.factor} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground font-medium">{item.factor}</span>
                      <span className="text-muted-foreground">{item.weight}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.weight * 3.3}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border border-border/50 mt-6">
                <h4 className="text-sm font-semibold text-foreground mb-2">Score Interpretation</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-success" /> <span className="text-muted-foreground">90–100: Ready</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-primary" /> <span className="text-muted-foreground">75–89: Low Risk</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-warning" /> <span className="text-muted-foreground">50–74: At Risk</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-destructive" /> <span className="text-muted-foreground">0–49: Not Ready</span></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI & Governance Tab */}
        <TabsContent value="ai-governance" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">AI Engine & Governance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Bot size={16} className="text-primary" /> Supported Providers
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    <li>• OpenAI (GPT-4, GPT-4o, GPT-3.5 Turbo)</li>
                    <li>• Anthropic (Claude 3.5 Sonnet, Claude 3 Opus)</li>
                    <li>• Google (Gemini Pro, Gemini Ultra)</li>
                    <li>• Meta (LLaMA 3)</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Shield size={16} className="text-success" /> Enterprise Safety
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    <li>• Confidence scores on all recommendations</li>
                    <li>• Explainable reasoning for every decision</li>
                    <li>• Full audit logging</li>
                    <li>• Data redaction (PII, source code)</li>
                  </ul>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Lock size={16} className="text-warning" /> Data Residency Options
                </h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground mt-3">
                  <div>
                    <p className="font-medium text-foreground mb-1">Private AI Endpoints</p>
                    <p>Azure OpenAI, AWS Bedrock, or Google Vertex AI in private networks and regional datacenters.</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">Self-Hosted LLMs</p>
                    <p>Run models on internal Kubernetes/GPU clusters for maximum data control.</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">AI-Disabled Mode</p>
                    <p>Run the platform without any AI features for maximum security environments.</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                <h4 className="text-sm font-semibold text-foreground mb-1">Decision Support Mode</h4>
                <p className="text-sm text-muted-foreground">
                  AI provides recommendations but human users retain final release authority. All AI-driven decisions are logged with timestamps, confidence scores, and the data that informed them.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
