import type { ServiceHealthEndpoint, LiveServiceHealth } from '@/contexts/ServiceHealthConfigContext';

async function checkEndpoint(endpoint: ServiceHealthEndpoint): Promise<LiveServiceHealth> {
  const start = performance.now();
  const now = new Date().toISOString();

  try {
    const headers: Record<string, string> = {};
    if (endpoint.authHeader) {
      headers['Authorization'] = endpoint.authHeader;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(endpoint.healthUrl, {
      method: 'GET',
      headers,
      signal: controller.signal,
      mode: 'cors',
    });

    clearTimeout(timeout);
    const responseTimeMs = Math.round(performance.now() - start);

    let health: LiveServiceHealth['health'] = 'unknown';

    if (response.ok) {
      // Try to parse JSON for status field
      try {
        const body = await response.json();
        const statusField = endpoint.statusField || 'status';
        const healthyValue = (endpoint.healthyValue || 'healthy').toLowerCase();
        const actualValue = String(body[statusField] || '').toLowerCase();

        if (actualValue === healthyValue || actualValue === 'up' || actualValue === 'ok' || actualValue === 'healthy') {
          health = 'healthy';
        } else if (actualValue === 'degraded' || actualValue === 'warning') {
          health = 'degraded';
        } else if (actualValue === 'down' || actualValue === 'unhealthy' || actualValue === 'error') {
          health = 'down';
        } else {
          // Response OK but unknown status field — assume healthy
          health = 'healthy';
        }
      } catch {
        // Not JSON — if status 2xx, consider healthy
        health = 'healthy';
      }
    } else if (response.status >= 500) {
      health = 'down';
    } else if (response.status === 429 || response.status === 503) {
      health = 'degraded';
    } else {
      health = 'down';
    }

    // Latency-based degradation check
    if (health === 'healthy' && responseTimeMs > 3000) {
      health = 'degraded';
    }

    return {
      id: endpoint.id,
      name: endpoint.name,
      health,
      responseTimeMs,
      lastChecked: now,
      statusCode: response.status,
      source: endpoint.provider === 'generic' ? 'Health Endpoint' : endpoint.provider.toUpperCase(),
      isLive: true,
    };
  } catch (err: any) {
    const responseTimeMs = Math.round(performance.now() - start);

    // Differentiate between timeout, CORS, and network errors
    let errorMessage = 'Unknown error';
    let health: LiveServiceHealth['health'] = 'down';

    if (err.name === 'AbortError') {
      errorMessage = 'Request timed out (10s)';
      health = 'degraded';
    } else if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
      errorMessage = 'Network error — possible CORS restriction or service unreachable';
    } else {
      errorMessage = err.message || 'Connection failed';
    }

    return {
      id: endpoint.id,
      name: endpoint.name,
      health,
      responseTimeMs,
      lastChecked: now,
      errorMessage,
      source: endpoint.provider === 'generic' ? 'Health Endpoint' : endpoint.provider.toUpperCase(),
      isLive: true,
    };
  }
}

export async function fetchAllServiceHealth(
  endpoints: ServiceHealthEndpoint[]
): Promise<LiveServiceHealth[]> {
  if (endpoints.length === 0) return [];

  const results = await Promise.allSettled(
    endpoints.map(ep => checkEndpoint(ep))
  );

  return results
    .filter((r): r is PromiseFulfilledResult<LiveServiceHealth> => r.status === 'fulfilled')
    .map(r => r.value);
}
