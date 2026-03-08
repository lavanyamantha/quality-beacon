import type { IntegrationSource } from '@/contexts/IntegrationsContext';

/**
 * Integration registry.
 * Each entry defines the integration metadata and maps to VITE_* env vars.
 * If both URL and token env vars are set, the integration starts as "connected".
 */

interface IntegrationDef {
  id: string;
  name: string;
  type: string;
  provides: IntegrationSource['provides'];
  envUrlKey: string;
  envTokenKey: string;
}

const registry: IntegrationDef[] = [
  {
    id: '1', name: 'Azure DevOps', type: 'azure-devops',
    provides: ['release', 'deployment', 'pipeline', 'test'],
    envUrlKey: 'VITE_AZURE_DEVOPS_URL', envTokenKey: 'VITE_AZURE_DEVOPS_TOKEN',
  },
  {
    id: '2', name: 'Jira Cloud', type: 'jira',
    provides: ['defect'],
    envUrlKey: 'VITE_JIRA_URL', envTokenKey: 'VITE_JIRA_TOKEN',
  },
  {
    id: '3', name: 'SonarQube', type: 'sonarqube',
    provides: ['test'],
    envUrlKey: 'VITE_SONARQUBE_URL', envTokenKey: 'VITE_SONARQUBE_TOKEN',
  },
  {
    id: '4', name: 'GitHub', type: 'github',
    provides: ['release', 'deployment', 'pipeline'],
    envUrlKey: 'VITE_GITHUB_URL', envTokenKey: 'VITE_GITHUB_TOKEN',
  },
  {
    id: '5', name: 'GitLab', type: 'gitlab',
    provides: ['release', 'deployment', 'pipeline'],
    envUrlKey: 'VITE_GITLAB_URL', envTokenKey: 'VITE_GITLAB_TOKEN',
  },
  {
    id: '6', name: 'Jenkins', type: 'jenkins',
    provides: ['pipeline'],
    envUrlKey: 'VITE_JENKINS_URL', envTokenKey: 'VITE_JENKINS_TOKEN',
  },
  {
    id: '7', name: 'Bitbucket', type: 'bitbucket',
    provides: ['release', 'deployment', 'pipeline'],
    envUrlKey: 'VITE_BITBUCKET_URL', envTokenKey: 'VITE_BITBUCKET_TOKEN',
  },
  {
    id: '8', name: 'AWS', type: 'aws',
    provides: ['pipeline', 'deployment'],
    envUrlKey: 'VITE_AWS_URL', envTokenKey: 'VITE_AWS_TOKEN',
  },
  {
    id: '9', name: 'Selenium Grid', type: 'selenium',
    provides: ['test'],
    envUrlKey: 'VITE_SELENIUM_URL', envTokenKey: 'VITE_SELENIUM_TOKEN',
  },
];

function readEnv(key: string): string | undefined {
  try {
    const val = (import.meta.env as Record<string, string | undefined>)[key];
    return val && val.trim() !== '' ? val.trim() : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Build the initial integrations list by merging the registry
 * with any credentials provided via environment variables.
 */
export function loadIntegrationsFromEnv(): IntegrationSource[] {
  return registry.map((def) => {
    const url = readEnv(def.envUrlKey);
    const token = readEnv(def.envTokenKey);
    const hasCredentials = Boolean(url && token);

    return {
      id: def.id,
      name: def.name,
      type: def.type,
      provides: def.provides,
      status: hasCredentials ? ('connected' as const) : ('disconnected' as const),
      ...(url ? { url } : {}),
      ...(token ? { token } : {}),
      ...(hasCredentials ? { lastSync: new Date().toISOString().slice(0, 16).replace('T', ' ') } : {}),
    };
  });
}
