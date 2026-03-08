/**
 * QA Dashboard — Server-Side Proxy
 *
 * This lightweight Express server holds integration credentials
 * as server-side environment variables and proxies API requests
 * so tokens never reach the browser.
 *
 * Usage:
 *   1. Copy .env.example → .env and fill in your credentials
 *   2. npm install && npm start
 *   3. Set VITE_PROXY_URL=http://localhost:3001 in the frontend .env
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PROXY_PORT || 3001;

const { setupStrategies, requireAuth, requireAdmin } = require('./auth');

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ── Authentication ───────────────────────────────────────────
setupStrategies(app);

// ── Integration credential registry ──────────────────────────
// Maps integration type → { url, token } from server-side env vars

function getCredentials(type) {
  const map = {
    'azure-devops': { url: process.env.AZURE_DEVOPS_URL, token: process.env.AZURE_DEVOPS_TOKEN },
    'jira':         { url: process.env.JIRA_URL,         token: process.env.JIRA_TOKEN },
    'sonarqube':    { url: process.env.SONARQUBE_URL,    token: process.env.SONARQUBE_TOKEN },
    'github':       { url: process.env.GITHUB_URL,       token: process.env.GITHUB_TOKEN },
    'gitlab':       { url: process.env.GITLAB_URL,       token: process.env.GITLAB_TOKEN },
    'jenkins':      { url: process.env.JENKINS_URL,      token: process.env.JENKINS_TOKEN },
    'bitbucket':    { url: process.env.BITBUCKET_URL,    token: process.env.BITBUCKET_TOKEN },
    'aws':          { url: process.env.AWS_URL,           token: process.env.AWS_TOKEN },
    'selenium':     { url: process.env.SELENIUM_URL,     token: process.env.SELENIUM_TOKEN },
  };
  return map[type] || null;
}

// ── GET /api/integrations — list configured integrations (no tokens!) ──
app.get('/api/integrations', (req, res) => {
  const types = [
    { id: '1', name: 'Azure DevOps', type: 'azure-devops', provides: ['release','deployment','pipeline','test'] },
    { id: '2', name: 'Jira Cloud',   type: 'jira',         provides: ['defect'] },
    { id: '3', name: 'SonarQube',    type: 'sonarqube',    provides: ['test'] },
    { id: '4', name: 'GitHub',       type: 'github',       provides: ['release','deployment','pipeline'] },
    { id: '5', name: 'GitLab',       type: 'gitlab',       provides: ['release','deployment','pipeline'] },
    { id: '6', name: 'Jenkins',      type: 'jenkins',      provides: ['pipeline'] },
    { id: '7', name: 'Bitbucket',    type: 'bitbucket',    provides: ['release','deployment','pipeline'] },
    { id: '8', name: 'AWS',          type: 'aws',          provides: ['pipeline','deployment'] },
    { id: '9', name: 'Selenium Grid',type: 'selenium',     provides: ['test'] },
  ];

  const result = types.map(t => {
    const creds = getCredentials(t.type);
    const connected = Boolean(creds?.url && creds?.token);
    return {
      ...t,
      status: connected ? 'connected' : 'disconnected',
      // Expose base URL (not token) so frontend can build deep-links
      url: creds?.url || undefined,
    };
  });

  res.json(result);
});

// ── POST /api/proxy/:type — forward a request through the proxy ──
// Body: { method, path, body?, headers? }
app.post('/api/proxy/:type', async (req, res) => {
  const { type } = req.params;
  const creds = getCredentials(type);

  if (!creds?.url || !creds?.token) {
    return res.status(404).json({ error: `Integration '${type}' is not configured` });
  }

  const { method = 'GET', path = '', body, headers: extraHeaders = {} } = req.body;
  const targetUrl = `${creds.url.replace(/\/+$/, '')}${path}`;

  // Build auth headers per provider
  const authHeaders = buildAuthHeaders(type, creds.token);

  try {
    const fetchModule = await import('node-fetch');
    const fetchFn = fetchModule.default;

    const response = await fetchFn(targetUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...extraHeaders,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const contentType = response.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    res.status(response.status).json({
      status: response.status,
      data,
    });
  } catch (err) {
    console.error(`Proxy error [${type}]:`, err.message);
    res.status(502).json({ error: 'Proxy request failed', message: err.message });
  }
});

// ── GET /api/proxy/:type/test — test integration connectivity ──
app.get('/api/proxy/:type/test', async (req, res) => {
  const { type } = req.params;
  const creds = getCredentials(type);

  if (!creds?.url || !creds?.token) {
    return res.json({ ok: false, error: `Integration '${type}' is not configured on the server. Add credentials to server/.env` });
  }

  const start = Date.now();
  try {
    const fetchModule = await import('node-fetch');
    const fetchFn = fetchModule.default;
    const headers = buildAuthHeaders(type, creds.token);

    // Use a lightweight endpoint per provider
    const testPaths = {
      'github': '/user',
      'gitlab': '/api/v4/user',
      'bitbucket': '/2.0/user',
      'azure-devops': '/_apis/projects?api-version=7.0&$top=1',
      'jira': '/rest/api/3/myself',
      'sonarqube': '/api/authentication/validate',
      'jenkins': '/api/json',
      'aws': '/',
      'selenium': '/status',
    };

    const baseUrl = creds.url.replace(/\/+$/, '');
    const testPath = testPaths[type] || '/';
    const response = await fetchFn(`${baseUrl}${testPath}`, { method: 'GET', headers });
    const responseTimeMs = Date.now() - start;

    if (response.ok || response.status === 200) {
      res.json({ ok: true, responseTimeMs });
    } else if (response.status === 401 || response.status === 403) {
      res.json({ ok: false, error: `Authentication failed (HTTP ${response.status}). Check credentials in server/.env`, responseTimeMs });
    } else {
      res.json({ ok: false, error: `Service responded with HTTP ${response.status}`, responseTimeMs });
    }
  } catch (err) {
    res.json({ ok: false, error: `Could not reach ${type}: ${err.message}`, responseTimeMs: Date.now() - start });
  }
});

// ── GET /api/proxy/:type/health — quick health check via proxy ──
app.get('/api/proxy/:type/health', async (req, res) => {
  const { type } = req.params;
  const { healthUrl } = req.query;
  const creds = getCredentials(type);

  const url = healthUrl || creds?.url;
  if (!url) {
    return res.status(404).json({ error: `No URL for '${type}'` });
  }

  const start = Date.now();
  try {
    const fetchModule = await import('node-fetch');
    const fetchFn = fetchModule.default;
    const headers = creds?.token ? buildAuthHeaders(type, creds.token) : {};

    const response = await fetchFn(url, {
      method: 'GET',
      headers,
    });

    const responseTimeMs = Date.now() - start;
    let body = {};
    try { body = await response.json(); } catch { /* not json */ }

    res.json({
      status: response.status,
      responseTimeMs,
      body,
    });
  } catch (err) {
    res.status(502).json({
      error: 'Health check failed',
      responseTimeMs: Date.now() - start,
      message: err.message,
    });
  }
});

function buildAuthHeaders(type, token) {
  switch (type) {
    case 'azure-devops':
      return { Authorization: `Basic ${Buffer.from(`:${token}`).toString('base64')}` };
    case 'github':
      return { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' };
    case 'gitlab':
      return { 'PRIVATE-TOKEN': token };
    case 'jira':
      return { Authorization: `Basic ${token}` };
    case 'jenkins':
      return { Authorization: `Basic ${token}` };
    case 'bitbucket':
      return { Authorization: `Bearer ${token}` };
    case 'sonarqube':
      return { Authorization: `Basic ${Buffer.from(`${token}:`).toString('base64')}` };
    default:
      return { Authorization: `Bearer ${token}` };
  }
}

// ── Settings persistence (JSON file) ─────────────────────────
const fs = require('fs');
const path = require('path');
const SETTINGS_FILE = path.join(__dirname, 'data', 'settings.json');

function loadSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Failed to load settings:', err.message);
  }
  return {};
}

function saveSettings(data) {
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to save settings:', err.message);
    return false;
  }
}

// GET /api/settings — read all settings (authenticated)
app.get('/api/settings', requireAuth, (req, res) => {
  res.json(loadSettings());
});

// GET /api/settings/:section — read a specific section
app.get('/api/settings/:section', requireAuth, (req, res) => {
  const settings = loadSettings();
  const section = req.params.section;
  res.json({ [section]: settings[section] || null });
});

// PUT /api/settings/:section — update a specific section (admin only)
app.put('/api/settings/:section', requireAuth, requireAdmin, (req, res) => {
  const section = req.params.section;
  const allowedSections = ['integrations', 'providers', 'environments', 'channels', 'branding', 'governance', 'notifications'];
  if (!allowedSections.includes(section)) {
    return res.status(400).json({ error: `Invalid settings section: ${section}` });
  }

  const settings = loadSettings();
  settings[section] = req.body.data;
  settings._lastModified = new Date().toISOString();
  settings._lastModifiedBy = req.user.email;

  if (saveSettings(settings)) {
    res.json({ ok: true, section, _lastModified: settings._lastModified });
  } else {
    res.status(500).json({ error: 'Failed to persist settings' });
  }
});

// PUT /api/settings — bulk update all settings (admin only)
app.put('/api/settings', requireAuth, requireAdmin, (req, res) => {
  const settings = { ...loadSettings(), ...req.body };
  settings._lastModified = new Date().toISOString();
  settings._lastModifiedBy = req.user.email;

  if (saveSettings(settings)) {
    res.json({ ok: true, _lastModified: settings._lastModified });
  } else {
    res.status(500).json({ error: 'Failed to persist settings' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ QA Dashboard Proxy running on http://localhost:${PORT}`);
  
  // Log which integrations are configured
  const configured = [];
  const unconfigured = [];
  for (const t of ['azure-devops','jira','sonarqube','github','gitlab','jenkins','bitbucket','aws','selenium']) {
    const c = getCredentials(t);
    (c?.url && c?.token ? configured : unconfigured).push(t);
  }
  if (configured.length) console.log(`   Connected: ${configured.join(', ')}`);
  if (unconfigured.length) console.log(`   Not configured: ${unconfigured.join(', ')}`);
});
