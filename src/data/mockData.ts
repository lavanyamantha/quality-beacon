// Mock data for AI QA Command Center - Financial Platform Demo

export interface Release {
  id: string;
  name: string;
  version: string;
  status: 'ready' | 'risk' | 'blocked' | 'released';
  readinessScore: number;
  date: string;
  environment: string;
}

export interface Microservice {
  id: string;
  name: string;
  health: 'healthy' | 'degraded' | 'down';
  errorRate: number;
  latency: number;
  lastDeployment: string;
  pipelineStatus: 'passing' | 'failing' | 'unstable';
  coverage: number;
  defectDensity: number;
}

export interface TestExecution {
  date: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
}

export interface Defect {
  id: string;
  title: string;
  severity: 'critical' | 'major' | 'minor' | 'trivial';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  service: string;
  age: number;
  release: string;
}

export interface FlakyTest {
  id: string;
  name: string;
  module: string;
  passCount: number;
  failCount: number;
  flakinessScore: number;
  lastFlaky: string;
}

export interface Pipeline {
  id: string;
  name: string;
  status: 'passing' | 'failing' | 'unstable';
  lastRun: string;
  duration: number;
  successRate: number;
}

export const currentRelease: Release = {
  id: 'rel-2026-04',
  name: 'Release 2026.04',
  version: '2026.04.0',
  status: 'risk',
  readinessScore: 78,
  date: '2026-04-15',
  environment: 'Stage',
};

export const releases: Release[] = [
  { id: 'rel-2026-01', name: 'Release 2026.01', version: '2026.01.0', status: 'released', readinessScore: 94, date: '2026-01-20', environment: 'Prod' },
  { id: 'rel-2026-02', name: 'Release 2026.02', version: '2026.02.0', status: 'released', readinessScore: 88, date: '2026-02-18', environment: 'Prod' },
  { id: 'rel-2026-03', name: 'Release 2026.03', version: '2026.03.0', status: 'released', readinessScore: 91, date: '2026-03-15', environment: 'Prod' },
  currentRelease,
  { id: 'rel-2026-05', name: 'Release 2026.05', version: '2026.05.0', status: 'blocked', readinessScore: 45, date: '2026-05-20', environment: 'Dev' },
];

export const microservices: Microservice[] = [
  { id: 'svc-1', name: 'PaymentService', health: 'degraded', errorRate: 2.4, latency: 340, lastDeployment: '2026-03-06', pipelineStatus: 'unstable', coverage: 72, defectDensity: 3.2 },
  { id: 'svc-2', name: 'AuthenticationService', health: 'healthy', errorRate: 0.1, latency: 45, lastDeployment: '2026-03-07', pipelineStatus: 'passing', coverage: 89, defectDensity: 0.8 },
  { id: 'svc-3', name: 'AccountService', health: 'healthy', errorRate: 0.3, latency: 120, lastDeployment: '2026-03-05', pipelineStatus: 'passing', coverage: 85, defectDensity: 1.1 },
  { id: 'svc-4', name: 'TransactionService', health: 'healthy', errorRate: 0.5, latency: 200, lastDeployment: '2026-03-07', pipelineStatus: 'passing', coverage: 81, defectDensity: 1.5 },
  { id: 'svc-5', name: 'NotificationService', health: 'healthy', errorRate: 0.2, latency: 80, lastDeployment: '2026-03-04', pipelineStatus: 'passing', coverage: 78, defectDensity: 0.9 },
  { id: 'svc-6', name: 'CheckoutAPI', health: 'degraded', errorRate: 1.8, latency: 450, lastDeployment: '2026-03-06', pipelineStatus: 'failing', coverage: 65, defectDensity: 4.1 },
  { id: 'svc-7', name: 'FraudDetection', health: 'healthy', errorRate: 0.4, latency: 180, lastDeployment: '2026-03-03', pipelineStatus: 'passing', coverage: 91, defectDensity: 0.6 },
  { id: 'svc-8', name: 'ReportingService', health: 'healthy', errorRate: 0.1, latency: 300, lastDeployment: '2026-03-02', pipelineStatus: 'passing', coverage: 74, defectDensity: 1.3 },
  { id: 'svc-9', name: 'LoanService', health: 'healthy', errorRate: 0.6, latency: 220, lastDeployment: '2026-03-07', pipelineStatus: 'passing', coverage: 83, defectDensity: 1.0 },
  { id: 'svc-10', name: 'KYCService', health: 'down', errorRate: 8.2, latency: 1200, lastDeployment: '2026-03-01', pipelineStatus: 'failing', coverage: 58, defectDensity: 5.4 },
  { id: 'svc-11', name: 'MarketDataService', health: 'healthy', errorRate: 0.2, latency: 95, lastDeployment: '2026-03-06', pipelineStatus: 'passing', coverage: 87, defectDensity: 0.7 },
  { id: 'svc-12', name: 'ComplianceService', health: 'healthy', errorRate: 0.3, latency: 150, lastDeployment: '2026-03-05', pipelineStatus: 'passing', coverage: 92, defectDensity: 0.4 },
];

export const testExecutions: TestExecution[] = [
  { date: '2026-02-20', total: 8420, passed: 7980, failed: 320, skipped: 120 },
  { date: '2026-02-25', total: 8550, passed: 8100, failed: 300, skipped: 150 },
  { date: '2026-03-01', total: 8700, passed: 8200, failed: 350, skipped: 150 },
  { date: '2026-03-03', total: 8850, passed: 8050, failed: 580, skipped: 220 },
  { date: '2026-03-05', total: 9100, passed: 8500, failed: 400, skipped: 200 },
  { date: '2026-03-07', total: 9300, passed: 8700, failed: 380, skipped: 220 },
  { date: '2026-03-08', total: 9450, passed: 8900, failed: 340, skipped: 210 },
];

export const defects: Defect[] = [
  { id: 'DEF-1042', title: 'Payment gateway timeout on high load', severity: 'critical', status: 'open', service: 'PaymentService', age: 3, release: '2026.04' },
  { id: 'DEF-1045', title: 'KYC verification failing for international users', severity: 'critical', status: 'open', service: 'KYCService', age: 5, release: '2026.04' },
  { id: 'DEF-1038', title: 'Checkout cart total calculation rounding error', severity: 'major', status: 'in-progress', service: 'CheckoutAPI', age: 7, release: '2026.04' },
  { id: 'DEF-1041', title: 'Transaction history pagination not loading', severity: 'major', status: 'open', service: 'TransactionService', age: 4, release: '2026.04' },
  { id: 'DEF-1039', title: 'Notification delivery delay exceeds SLA', severity: 'major', status: 'in-progress', service: 'NotificationService', age: 6, release: '2026.04' },
  { id: 'DEF-1044', title: 'Report export formatting issue in PDF', severity: 'minor', status: 'open', service: 'ReportingService', age: 2, release: '2026.04' },
  { id: 'DEF-1036', title: 'Login session not refreshing correctly', severity: 'minor', status: 'resolved', service: 'AuthenticationService', age: 10, release: '2026.04' },
  { id: 'DEF-1043', title: 'UI alignment issue on loan calculator', severity: 'trivial', status: 'open', service: 'LoanService', age: 1, release: '2026.04' },
];

export const flakyTests: FlakyTest[] = [
  { id: 'ft-1', name: 'CheckoutPaymentTest', module: 'CheckoutAPI', passCount: 15, failCount: 5, flakinessScore: 25, lastFlaky: '2026-03-07' },
  { id: 'ft-2', name: 'KYCVerificationE2E', module: 'KYCService', passCount: 12, failCount: 8, flakinessScore: 40, lastFlaky: '2026-03-08' },
  { id: 'ft-3', name: 'PaymentRetryMechanism', module: 'PaymentService', passCount: 18, failCount: 4, flakinessScore: 18, lastFlaky: '2026-03-06' },
  { id: 'ft-4', name: 'TransactionConcurrencyTest', module: 'TransactionService', passCount: 16, failCount: 3, flakinessScore: 16, lastFlaky: '2026-03-05' },
  { id: 'ft-5', name: 'FraudRuleEngineStress', module: 'FraudDetection', passCount: 19, failCount: 2, flakinessScore: 10, lastFlaky: '2026-03-04' },
  { id: 'ft-6', name: 'NotificationDeliveryAsync', module: 'NotificationService', passCount: 14, failCount: 6, flakinessScore: 30, lastFlaky: '2026-03-07' },
];

export const pipelines: Pipeline[] = [
  { id: 'pl-1', name: 'payment-ci', status: 'unstable', lastRun: '2026-03-08 09:14', duration: 12.4, successRate: 78 },
  { id: 'pl-2', name: 'auth-ci', status: 'passing', lastRun: '2026-03-08 08:45', duration: 5.2, successRate: 98 },
  { id: 'pl-3', name: 'checkout-ci', status: 'failing', lastRun: '2026-03-08 09:30', duration: 8.7, successRate: 65 },
  { id: 'pl-4', name: 'transaction-ci', status: 'passing', lastRun: '2026-03-08 07:55', duration: 6.1, successRate: 95 },
  { id: 'pl-5', name: 'kyc-ci', status: 'failing', lastRun: '2026-03-08 09:00', duration: 15.3, successRate: 52 },
  { id: 'pl-6', name: 'notification-ci', status: 'passing', lastRun: '2026-03-08 08:20', duration: 4.8, successRate: 92 },
  { id: 'pl-7', name: 'fraud-ci', status: 'passing', lastRun: '2026-03-08 08:10', duration: 9.5, successRate: 97 },
  { id: 'pl-8', name: 'compliance-ci', status: 'passing', lastRun: '2026-03-08 07:30', duration: 7.2, successRate: 99 },
];

export const readinessMetrics = {
  testPassRate: { value: 94.2, weight: 30, threshold: 95 },
  defectSeverity: { value: 68, weight: 20, threshold: 80 },
  automationCoverage: { value: 79, weight: 15, threshold: 80 },
  pipelineStability: { value: 84, weight: 15, threshold: 90 },
  serviceHealth: { value: 83, weight: 10, threshold: 95 },
  codeCoverage: { value: 78, weight: 10, threshold: 80 },
};

export const readinessTrend = [
  { release: '2026.01', score: 94 },
  { release: '2026.02', score: 88 },
  { release: '2026.03', score: 91 },
  { release: '2026.04', score: 78 },
];

export const aiAdvisorRecommendation = {
  recommendation: 'HOLD' as const,
  confidence: 74,
  reasons: [
    '2 critical defects remain open (PaymentService, KYCService)',
    'Automation pass rate (94.2%) below 95% threshold',
    'KYCService failing health checks with 8.2% error rate',
    'CheckoutAPI pipeline failing with 65% success rate',
    'Flaky test rate in CheckoutAPI at 25%',
  ],
  mitigations: [
    'Resolve DEF-1042: Payment gateway timeout',
    'Restore KYCService health endpoint',
    'Fix CheckoutAPI pipeline build failures',
    'Quarantine flaky tests in CheckoutAPI module',
  ],
};

export const releaseTimeline = [
  { date: '2026-02-28', event: 'Release 2026.04 branch created', type: 'release' as const },
  { date: '2026-03-01', event: 'Feature freeze applied', type: 'release' as const },
  { date: '2026-03-02', event: 'KYCService deployment failed', type: 'deployment' as const },
  { date: '2026-03-03', event: 'Pipeline failures spike (3 pipelines)', type: 'pipeline' as const },
  { date: '2026-03-04', event: '2 critical defects opened', type: 'defect' as const },
  { date: '2026-03-05', event: 'Automation coverage increased to 79%', type: 'test' as const },
  { date: '2026-03-06', event: 'PaymentService hotfix deployed', type: 'deployment' as const },
  { date: '2026-03-07', event: 'Test execution: 9,300 tests run', type: 'test' as const },
  { date: '2026-03-08', event: 'Release candidate under review', type: 'release' as const },
];

export const coverageByService = microservices.map(s => ({
  service: s.name,
  api: Math.round(s.coverage * (0.85 + Math.random() * 0.3)),
  ui: Math.round(s.coverage * (0.6 + Math.random() * 0.4)),
  manual: Math.round(s.coverage * (0.7 + Math.random() * 0.3)),
  code: s.coverage,
}));

export const defectsByRelease = [
  { release: '2026.01', critical: 0, major: 2, minor: 5, trivial: 3 },
  { release: '2026.02', critical: 1, major: 4, minor: 8, trivial: 5 },
  { release: '2026.03', critical: 0, major: 3, minor: 6, trivial: 4 },
  { release: '2026.04', critical: 2, major: 3, minor: 2, trivial: 1 },
];
