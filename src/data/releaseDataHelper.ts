import { Release, testExecutions, defects, flakyTests, pipelines, microservices, readinessMetrics, readinessTrend, aiAdvisorRecommendation, coverageByService, releaseTimeline, defectsByRelease } from './mockData';

// Simple seeded multiplier based on release readiness score
function vary(base: number, release: Release, factor = 0.15): number {
  const seed = release.readinessScore / 100;
  const variation = 1 - factor + seed * factor * 2;
  return Math.round(base * variation);
}

export function getTestExecutionsForRelease(release: Release) {
  const scale = release.readinessScore / 78; // normalize against current release
  return testExecutions.map(t => ({
    ...t,
    total: vary(t.total, release),
    passed: vary(t.passed, release),
    failed: Math.max(1, vary(t.failed, release, 0.4)),
    skipped: vary(t.skipped, release),
  }));
}

export function getDefectsForRelease(release: Release) {
  const relVersion = release.version.replace('.0', '');
  // For released versions, most defects are resolved
  if (release.status === 'released') {
    return defects.map(d => ({
      ...d,
      release: relVersion,
      status: Math.random() > 0.2 ? 'closed' as const : 'resolved' as const,
      severity: d.severity,
    })).slice(0, Math.max(2, Math.floor(defects.length * (1 - release.readinessScore / 100))));
  }
  if (release.status === 'blocked') {
    return defects.map(d => ({ ...d, release: relVersion })).concat(
      defects.slice(0, 3).map(d => ({
        ...d,
        id: d.id + '-dup',
        release: relVersion,
        severity: 'critical' as const,
        status: 'open' as const,
      }))
    );
  }
  return defects.map(d => ({ ...d, release: relVersion }));
}

export function getFlakyTestsForRelease(release: Release) {
  const scale = (100 - release.readinessScore) / 22; // higher for worse releases
  return flakyTests.map(t => ({
    ...t,
    flakinessScore: Math.min(80, Math.max(5, Math.round(t.flakinessScore * scale))),
    failCount: Math.max(1, Math.round(t.failCount * scale)),
  }));
}

export function getPipelinesForRelease(release: Release) {
  if (release.status === 'released') {
    return pipelines.map(p => ({ ...p, status: 'passing' as const, successRate: Math.min(100, p.successRate + 15) }));
  }
  if (release.status === 'blocked') {
    return pipelines.map(p => ({
      ...p,
      status: p.successRate < 80 ? 'failing' as const : p.status,
      successRate: Math.max(30, p.successRate - 20),
    }));
  }
  return pipelines;
}

export function getMicroservicesForRelease(release: Release, env: string) {
  let services = microservices;
  if (release.status === 'released') {
    services = services.map(s => ({ ...s, health: 'healthy' as const, errorRate: Math.max(0, s.errorRate - 1) }));
  }
  if (release.status === 'blocked') {
    services = services.map(s => ({
      ...s,
      health: s.errorRate > 1 ? 'down' as const : s.health,
      errorRate: s.errorRate * 1.5,
    }));
  }
  // Filter by environment pattern
  if (env !== 'All') {
    // Simulate env filtering by showing subset
    const envIndex = ['Dev', 'QA', 'Stage', 'Prod'].indexOf(env);
    services = services.filter((_, i) => i % 4 <= envIndex);
  }
  return services;
}

export function getReadinessForRelease(release: Release) {
  const scale = release.readinessScore / 78;
  return {
    score: release.readinessScore,
    metrics: Object.fromEntries(
      Object.entries(readinessMetrics).map(([key, val]) => [
        key,
        { ...val, value: Math.min(100, Math.round(val.value * scale)) },
      ])
    ) as typeof readinessMetrics,
  };
}

export function getReadinessTrendForRelease(release: Release) {
  const relVersion = release.version.replace('.0', '');
  // Highlight the selected release in the trend
  return readinessTrend.map(r => ({
    ...r,
    isCurrent: r.release === relVersion,
  }));
}

export function getAIAdvisorForRelease(release: Release) {
  if (release.status === 'released') {
    return {
      recommendation: 'GO' as const,
      confidence: 95,
      reasons: ['All critical defects resolved', 'Pipeline stability above 95%', 'Full regression passed'],
      mitigations: [],
    };
  }
  if (release.status === 'ready') {
    return {
      recommendation: 'GO' as const,
      confidence: 88,
      reasons: ['No critical defects open', 'Automation pass rate above threshold', 'All services healthy'],
      mitigations: ['Monitor PaymentService latency post-deploy'],
    };
  }
  if (release.status === 'blocked') {
    return {
      recommendation: 'NO-GO' as const,
      confidence: 92,
      reasons: [
        '5 critical defects remain open',
        'KYCService and CheckoutAPI pipelines failing',
        'Service health below acceptable threshold',
        'Automation coverage at 58%',
      ],
      mitigations: [
        'Resolve all critical defects before proceeding',
        'Restore pipeline stability above 85%',
        'Increase automation coverage to 75%+',
      ],
    };
  }
  return aiAdvisorRecommendation;
}

export function getCoverageForRelease(release: Release, env: string) {
  const services = getMicroservicesForRelease(release, env);
  const serviceNames = new Set(services.map(s => s.name));
  const scale = release.readinessScore / 78;
  return coverageByService
    .filter(c => serviceNames.has(c.service))
    .map(c => ({
      ...c,
      code: Math.min(100, Math.round(c.code * scale)),
      api: Math.min(100, Math.round(c.api * scale)),
      ui: Math.min(100, Math.round(c.ui * scale)),
    }));
}

export function getTimelineForRelease(release: Release) {
  // Adjust timeline events to match the selected release
  return releaseTimeline.map(item => ({
    ...item,
    event: item.event.replace('2026.04', release.version.replace('.0', '')),
  }));
}

export function getRiskDataForRelease(release: Release, env: string) {
  const services = getMicroservicesForRelease(release, env);
  return services.map(s => ({
    name: s.name,
    risk: Math.round((s.errorRate * 10 + s.defectDensity * 12 + (100 - s.coverage) * 0.5 + (s.health === 'down' ? 30 : s.health === 'degraded' ? 15 : 0))),
  })).sort((a, b) => b.risk - a.risk);
}

export function getDefectsByReleaseForRelease(release: Release) {
  const relVersion = release.version.replace('.0', '');
  return defectsByRelease.map(d => ({
    ...d,
    isCurrent: d.release === relVersion,
  }));
}
