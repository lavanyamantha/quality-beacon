import type { Pipeline } from '@/data/mockData';
import type { IntegrationSource } from '@/contexts/IntegrationsContext';

export interface PipelineWithSource extends Pipeline {
  source: string;       // e.g. "GitHub", "GitLab"
  sourceType: string;   // e.g. "github", "gitlab"
  isLive: boolean;
}

/**
 * Fetch real pipeline data from connected integrations.
 * Supports GitHub Actions and GitLab CI (CORS-friendly from browser).
 * Returns empty array if fetch fails or source not supported.
 */
export async function fetchPipelinesFromSource(
  integration: IntegrationSource
): Promise<PipelineWithSource[]> {
  switch (integration.type) {
    case 'github':
      return fetchGitHubPipelines(integration);
    case 'gitlab':
      return fetchGitLabPipelines(integration);
    case 'azure-devops':
      return fetchAzureDevOpsPipelines(integration);
    default:
      return [];
  }
}

async function fetchGitHubPipelines(int: IntegrationSource): Promise<PipelineWithSource[]> {
  if (!int.token || !int.url) return [];

  try {
    // Extract owner from URL like https://github.com/myorg
    const urlParts = new URL(int.url).pathname.split('/').filter(Boolean);
    const owner = urlParts[0];
    if (!owner) return [];

    // Fetch repos for the org/user
    const reposResp = await fetch(`https://api.github.com/users/${owner}/repos?per_page=10&sort=updated`, {
      headers: {
        Authorization: `Bearer ${int.token}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (!reposResp.ok) return [];
    const repos: any[] = await reposResp.json();

    const pipelines: PipelineWithSource[] = [];

    // Fetch workflow runs for each repo (limit to 5 repos for performance)
    const repoSlice = repos.slice(0, 5);
    const promises = repoSlice.map(async (repo) => {
      try {
        const runsResp = await fetch(
          `https://api.github.com/repos/${owner}/${repo.name}/actions/runs?per_page=10`,
          {
            headers: {
              Authorization: `Bearer ${int.token}`,
              Accept: 'application/vnd.github+json',
            },
          }
        );
        if (!runsResp.ok) return [];
        const data = await runsResp.json();
        const runs: any[] = data.workflow_runs || [];

        if (runs.length === 0) return [];

        // Group by workflow name
        const workflowMap = new Map<string, any[]>();
        for (const run of runs) {
          const name = run.name || run.workflow_id;
          if (!workflowMap.has(name)) workflowMap.set(name, []);
          workflowMap.get(name)!.push(run);
        }

        return Array.from(workflowMap.entries()).map(([name, wfRuns]) => {
          const successCount = wfRuns.filter(r => r.conclusion === 'success').length;
          const failCount = wfRuns.filter(r => r.conclusion === 'failure').length;
          const total = wfRuns.length;
          const successRate = total > 0 ? Math.round((successCount / total) * 100) : 0;

          const latestRun = wfRuns[0];
          const duration = latestRun.run_started_at && latestRun.updated_at
            ? Math.round((new Date(latestRun.updated_at).getTime() - new Date(latestRun.run_started_at).getTime()) / 60000 * 10) / 10
            : 0;

          const status: Pipeline['status'] =
            latestRun.conclusion === 'success' ? 'passing'
            : latestRun.conclusion === 'failure' ? 'failing'
            : 'unstable';

          const lastRun = latestRun.updated_at
            ? new Date(latestRun.updated_at).toISOString().slice(0, 16).replace('T', ' ')
            : 'N/A';

          return {
            id: `gh-${repo.name}-${name}`.replace(/\s+/g, '-'),
            name: `${repo.name}/${name}`,
            status,
            lastRun,
            duration,
            successRate,
            source: 'GitHub',
            sourceType: 'github',
            isLive: true,
          } as PipelineWithSource;
        });
      } catch {
        return [];
      }
    });

    const results = await Promise.all(promises);
    return results.flat();
  } catch {
    return [];
  }
}

async function fetchAzureDevOpsPipelines(int: IntegrationSource): Promise<PipelineWithSource[]> {
  if (!int.token || !int.url) return [];

  try {
    // URL expected: https://dev.azure.com/{organization}/{project}
    // or https://dev.azure.com/{organization}
    const urlParts = new URL(int.url).pathname.split('/').filter(Boolean);
    const organization = urlParts[0];
    if (!organization) return [];

    const baseApi = `https://dev.azure.com/${organization}`;
    const authHeader = 'Basic ' + btoa(`:${int.token}`);
    const headers = {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    };

    // If a specific project is provided, use it; otherwise list projects
    const specificProject = urlParts[1];
    let projectNames: string[] = [];

    if (specificProject) {
      projectNames = [specificProject];
    } else {
      const projResp = await fetch(`${baseApi}/_apis/projects?api-version=7.1&$top=10`, { headers });
      if (!projResp.ok) return [];
      const projData = await projResp.json();
      projectNames = (projData.value || []).slice(0, 5).map((p: any) => p.name);
    }

    const allPipelines: PipelineWithSource[] = [];

    for (const project of projectNames) {
      try {
        // Fetch recent pipeline runs (builds)
        const buildsResp = await fetch(
          `${baseApi}/${encodeURIComponent(project)}/_apis/build/builds?api-version=7.1&$top=20&queryOrder=startTimeDescending`,
          { headers }
        );
        if (!buildsResp.ok) continue;
        const buildsData = await buildsResp.json();
        const builds: any[] = buildsData.value || [];
        if (builds.length === 0) continue;

        // Group by pipeline definition
        const defMap = new Map<number, any[]>();
        for (const build of builds) {
          const defId = build.definition?.id;
          if (defId == null) continue;
          if (!defMap.has(defId)) defMap.set(defId, []);
          defMap.get(defId)!.push(build);
        }

        for (const [defId, defBuilds] of defMap) {
          const defName = defBuilds[0].definition?.name || `Pipeline ${defId}`;
          const successCount = defBuilds.filter((b: any) => b.result === 'succeeded').length;
          const total = defBuilds.length;
          const successRate = total > 0 ? Math.round((successCount / total) * 100) : 0;

          const latest = defBuilds[0];
          const duration =
            latest.startTime && latest.finishTime
              ? Math.round(
                  ((new Date(latest.finishTime).getTime() - new Date(latest.startTime).getTime()) / 60000) * 10
                ) / 10
              : 0;

          const status: Pipeline['status'] =
            latest.result === 'succeeded'
              ? 'passing'
              : latest.result === 'failed'
              ? 'failing'
              : 'unstable';

          const lastRun = latest.finishTime
            ? new Date(latest.finishTime).toISOString().slice(0, 16).replace('T', ' ')
            : latest.startTime
            ? new Date(latest.startTime).toISOString().slice(0, 16).replace('T', ' ')
            : 'N/A';

          allPipelines.push({
            id: `ado-${project}-${defId}`,
            name: `${project}/${defName}`,
            status,
            lastRun,
            duration,
            successRate,
            source: 'Azure DevOps',
            sourceType: 'azure-devops',
            isLive: true,
          });
        }
      } catch {
        continue;
      }
    }

    return allPipelines;
  } catch {
    return [];
  }
}

async function fetchGitLabPipelines(int: IntegrationSource): Promise<PipelineWithSource[]> {
  if (!int.token || !int.url) return [];

  try {
    // Fetch user's projects
    const projResp = await fetch('https://gitlab.com/api/v4/projects?membership=true&per_page=5&order_by=updated_at', {
      headers: { 'PRIVATE-TOKEN': int.token },
    });
    if (!projResp.ok) return [];
    const projects: any[] = await projResp.json();

    const pipelines: PipelineWithSource[] = [];

    for (const project of projects.slice(0, 5)) {
      try {
        const pipResp = await fetch(
          `https://gitlab.com/api/v4/projects/${project.id}/pipelines?per_page=10`,
          { headers: { 'PRIVATE-TOKEN': int.token } }
        );
        if (!pipResp.ok) continue;
        const pips: any[] = await pipResp.json();
        if (pips.length === 0) continue;

        const successCount = pips.filter(p => p.status === 'success').length;
        const failCount = pips.filter(p => p.status === 'failed').length;
        const total = pips.length;
        const successRate = total > 0 ? Math.round((successCount / total) * 100) : 0;

        const latest = pips[0];
        const duration = latest.duration ? Math.round(latest.duration / 60 * 10) / 10 : 0;

        const status: Pipeline['status'] =
          latest.status === 'success' ? 'passing'
          : latest.status === 'failed' ? 'failing'
          : 'unstable';

        const lastRun = latest.updated_at
          ? new Date(latest.updated_at).toISOString().slice(0, 16).replace('T', ' ')
          : 'N/A';

        pipelines.push({
          id: `gl-${project.id}`,
          name: project.path_with_namespace || project.name,
          status,
          lastRun,
          duration,
          successRate,
          source: 'GitLab',
          sourceType: 'gitlab',
          isLive: true,
        });
      } catch {
        continue;
      }
    }

    return pipelines;
  } catch {
    return [];
  }
}

/**
 * Fetch pipelines from all connected pipeline sources.
 * Falls back to mock data with source attribution.
 */
export async function fetchAllPipelines(
  sources: IntegrationSource[]
): Promise<{ pipelines: PipelineWithSource[]; fetchedFrom: string[] }> {
  const fetchedFrom: string[] = [];
  const allPipelines: PipelineWithSource[] = [];

  const promises = sources.map(async (src) => {
    const results = await fetchPipelinesFromSource(src);
    if (results.length > 0) {
      fetchedFrom.push(src.name);
    }
    return results;
  });

  const results = await Promise.all(promises);
  for (const batch of results) {
    allPipelines.push(...batch);
  }

  return { pipelines: allPipelines, fetchedFrom };
}
