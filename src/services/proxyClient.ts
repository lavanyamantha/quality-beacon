/**
 * Proxy client — routes API calls through the server-side proxy
 * so credentials never reach the browser.
 *
 * If VITE_PROXY_URL is set, all integration API calls go through
 * the proxy. Otherwise, falls back to direct browser-side calls
 * (for local dev / demo mode).
 */

const PROXY_URL = (import.meta.env.VITE_PROXY_URL as string | undefined)?.replace(/\/+$/, '') || '';

export function isProxyEnabled(): boolean {
  return PROXY_URL.length > 0;
}

export function getProxyUrl(): string {
  return PROXY_URL;
}

/**
 * Make an API call through the proxy server.
 * The proxy attaches the correct auth headers server-side.
 */
export async function proxyFetch(
  integrationType: string,
  path: string,
  options: { method?: string; body?: unknown; headers?: Record<string, string> } = {}
): Promise<{ status: number; data: any }> {
  const response = await fetch(`${PROXY_URL}/api/proxy/${integrationType}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      method: options.method || 'GET',
      path,
      body: options.body,
      headers: options.headers,
    }),
  });

  return response.json();
}

/**
 * Fetch the integrations list from the proxy (without tokens).
 */
export async function fetchIntegrationsFromProxy(): Promise<any[]> {
  const response = await fetch(`${PROXY_URL}/api/integrations`);
  return response.json();
}

/**
 * Health check through the proxy.
 */
export async function proxyHealthCheck(
  integrationType: string,
  healthUrl?: string
): Promise<{ status: number; responseTimeMs: number; body: any }> {
  const params = healthUrl ? `?healthUrl=${encodeURIComponent(healthUrl)}` : '';
  const response = await fetch(`${PROXY_URL}/api/proxy/${integrationType}/health${params}`);
  return response.json();
}
