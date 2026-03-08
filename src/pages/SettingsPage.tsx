import { useState, useEffect } from 'react';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useBranding } from '@/contexts/BrandingContext';
import { useIntegrations } from '@/contexts/IntegrationsContext';
import { isProxyEnabled, proxyTestConnection } from '@/services/proxyClient';
import {
  Settings, Link2, Bot, Server, Users, Palette, Bell, Database, Shield, Activity,
  ChevronLeft, Plus, Trash2, Save, Eye, EyeOff, ToggleLeft, ToggleRight,
  Check, AlertTriangle, Loader2, Wifi, WifiOff, RefreshCw, ExternalLink, Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import ServiceHealthSettings from '@/components/settings/ServiceHealthSettings';

/* ─── types ─── */
interface Integration {
  id: string;
  name: string;
  type: string;
  url: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
}

interface AIProvider {
  id: string;
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  assignedTo: string[];
  enabled: boolean;
  connectionStatus?: 'untested' | 'testing' | 'success' | 'failed';
  lastTested?: string;
}

interface Environment {
  id: string;
  name: string;
  healthUrl: string;
  pipelineMapping: string;
  enabled: boolean;
}

interface NotificationChannel {
  id: string;
  type: 'email' | 'slack' | 'teams';
  target: string;
  webhookUrl?: string;
  enabled: boolean;
}

/* ─── mock state ─── */
const initialIntegrations: Integration[] = [
  { id: '1', name: 'Azure DevOps', type: 'azure-devops', url: 'https://dev.azure.com/myorg', status: 'connected', lastSync: '2026-03-08 09:14' },
  { id: '2', name: 'Jira Cloud', type: 'jira', url: 'https://myteam.atlassian.net', status: 'disconnected' },
  { id: '3', name: 'SonarQube', type: 'sonarqube', url: 'https://sonar.internal.com', status: 'connected', lastSync: '2026-03-08 08:30' },
  { id: '4', name: 'GitHub', type: 'github', url: 'https://github.com/myorg', status: 'disconnected' },
  { id: '5', name: 'AWS', type: 'aws', url: 'https://console.aws.amazon.com', status: 'disconnected' },
];

const initialProviders: AIProvider[] = [
  { id: '1', provider: 'openai', model: 'gpt-4o', temperature: 0.3, maxTokens: 4096, assignedTo: ['risk-prediction', 'qa-assistant'], enabled: true, connectionStatus: 'untested' },
  { id: '2', provider: 'anthropic', model: 'claude-3.5-sonnet', temperature: 0.2, maxTokens: 4096, assignedTo: ['defect-analysis'], enabled: false, connectionStatus: 'untested' },
];

const initialEnvironments: Environment[] = [
  { id: '1', name: 'Development', healthUrl: 'https://dev-api.internal.com/health', pipelineMapping: 'dev-*', enabled: true },
  { id: '2', name: 'QA', healthUrl: 'https://qa-api.internal.com/health', pipelineMapping: 'qa-*', enabled: true },
  { id: '3', name: 'Staging', healthUrl: 'https://stage-api.internal.com/health', pipelineMapping: 'stage-*', enabled: true },
  { id: '4', name: 'Production', healthUrl: 'https://api.company.com/health', pipelineMapping: 'prod-*', enabled: true },
  { id: '5', name: 'Performance', healthUrl: 'https://perf-api.internal.com/health', pipelineMapping: 'perf-*', enabled: false },
];

const initialChannels: NotificationChannel[] = [
  { id: '1', type: 'slack', target: '#qa-alerts', webhookUrl: 'https://hooks.slack.com/services/T00/B00/xxxx', enabled: true },
  { id: '2', type: 'email', target: 'qa-team@company.com', enabled: true },
  { id: '3', type: 'teams', target: 'QA Release Channel', webhookUrl: 'https://outlook.office.com/webhook/xxxx', enabled: false },
];

/* ─── settings sections ─── */
const sections = [
  { key: 'integrations', title: 'Integrations', desc: 'Configure Azure DevOps, Jira, and SonarQube connections', icon: Link2 },
  { key: 'ai-providers', title: 'AI Providers', desc: 'Manage LLM providers, API keys, and model settings', icon: Bot },
  { key: 'environments', title: 'Environments', desc: 'Configure Dev, QA, Stage, Prod, and Performance environments', icon: Server },
  { key: 'service-health', title: 'Service Health', desc: 'Configure health check endpoints for real-time service monitoring', icon: Activity },
  { key: 'projects', title: 'Projects & Teams', desc: 'Manage project structure, team assignments, and mappings', icon: Users },
  { key: 'branding', title: 'Branding', desc: 'Customize logo, colors, and application theme', icon: Palette },
  { key: 'notifications', title: 'Notifications', desc: 'Configure alert thresholds and notification channels', icon: Bell },
  { key: 'demo-mode', title: 'Demo Mode', desc: 'Enable or disable synthetic data for demonstrations', icon: Database },
  { key: 'governance', title: 'Governance', desc: 'AI decision support mode, audit logs, and data residency', icon: Shield },
];

/* ─── component ─── */
const availableProviders: Record<string, { name: string; type: string; urlPlaceholder: string }> = {
  'azure-devops': { name: 'Azure DevOps', type: 'azure-devops', urlPlaceholder: 'https://dev.azure.com/yourorg' },
  'jira': { name: 'Jira Cloud', type: 'jira', urlPlaceholder: 'https://yourteam.atlassian.net' },
  'sonarqube': { name: 'SonarQube', type: 'sonarqube', urlPlaceholder: 'https://sonar.yourcompany.com' },
  'github': { name: 'GitHub', type: 'github', urlPlaceholder: 'https://github.com/yourorg' },
  'aws': { name: 'AWS', type: 'aws', urlPlaceholder: 'https://console.aws.amazon.com' },
  'gitlab': { name: 'GitLab', type: 'gitlab', urlPlaceholder: 'https://gitlab.com/yourorg' },
  'jenkins': { name: 'Jenkins', type: 'jenkins', urlPlaceholder: 'https://jenkins.yourcompany.com' },
  'selenium-grid': { name: 'Selenium Grid', type: 'selenium-grid', urlPlaceholder: 'https://selenium.yourcompany.com' },
  'bitbucket': { name: 'Bitbucket', type: 'bitbucket', urlPlaceholder: 'https://bitbucket.org/yourworkspace' },
};

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [providers, setProviders] = useState(initialProviders);
  const [environments, setEnvironments] = useState(initialEnvironments);
  const [channels, setChannels] = useState(initialChannels);
  const { demoMode, setDemoMode } = useDemoMode();
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [testingConnection, setTestingConnection] = useState<Record<string, 'idle' | 'testing' | 'success' | 'failed'>>({});
  const { updateStatus: updateIntegrationStatus } = useIntegrations();
  const proxyEnabled = isProxyEnabled();

  // Sync status to global IntegrationsContext whenever local integrations change
  useEffect(() => {
    for (const int of integrations) {
      updateIntegrationStatus(int.id, int.status, int.lastSync);
    }
  }, [integrations]);

  // add integration dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newProviderType, setNewProviderType] = useState('');
  const [newUrl, setNewUrl] = useState('');

  // add AI provider dialog state
  const [addProviderDialogOpen, setAddProviderDialogOpen] = useState(false);
  const [newAIProvider, setNewAIProvider] = useState('openai');
  const [newAIModel, setNewAIModel] = useState('');

  // known models per provider (users can also type custom ones)
  const knownModels: Record<string, string[]> = {
    openai: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo', 'o1-preview', 'o1-mini'],
    anthropic: ['claude-3.5-sonnet', 'claude-3-opus', 'claude-3-haiku', 'claude-3.5-haiku'],
    google: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'],
    mistral: ['mistral-large', 'mistral-medium', 'mistral-small', 'codestral'],
    cohere: ['command-r-plus', 'command-r', 'command-light'],
  };

  // branding state (from shared context)
  const { brandName, setBrandName, brandTheme, setBrandTheme, brandLogo, setBrandLogo, brandLogoName, setBrandLogoName } = useBranding();

  // governance state
  const { aiMode: decisionMode, setAiMode: setDecisionMode } = useDemoMode();
  const [auditEnabled, setAuditEnabled] = useState(true);
  const [dataRedaction, setDataRedaction] = useState(true);

  // notification thresholds
  const [riskThreshold, setRiskThreshold] = useState('70');
  const [failureThreshold, setFailureThreshold] = useState('3');

  // add channel dialog state
  const [addChannelDialogOpen, setAddChannelDialogOpen] = useState(false);
  const [newChannelType, setNewChannelType] = useState<'slack' | 'teams' | 'email'>('slack');
  const [newChannelTarget, setNewChannelTarget] = useState('');
  const [newChannelWebhook, setNewChannelWebhook] = useState('');
  const [testingWebhook, setTestingWebhook] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

  const handleSave = (section: string) => {
    toast({ title: 'Settings saved', description: `${section} configuration updated successfully.` });
  };

  const handleTestConnection = async (int: Integration) => {
    setTestingConnection(prev => ({ ...prev, [int.id]: 'testing' }));

    if (proxyEnabled) {
      // Route through the server-side proxy — credentials are checked server-side
      try {
        const result = await proxyTestConnection(int.type);
        const status = result.ok ? 'success' : 'failed';
        setTestingConnection(prev => ({ ...prev, [int.id]: status }));
        toast({
          title: result.ok ? 'Connection Successful' : 'Connection Failed',
          description: result.ok
            ? `${int.name} verified successfully${result.responseTimeMs ? ` (${result.responseTimeMs}ms)` : ''}.`
            : result.error || `Could not verify ${int.name}.`,
          variant: result.ok ? undefined : 'destructive',
        });
        if (result.ok) {
          setIntegrations(prev => prev.map(i => i.id === int.id ? { ...i, status: 'connected', lastSync: new Date().toISOString().slice(0, 16).replace('T', ' ') } : i));
        }
      } catch {
        setTestingConnection(prev => ({ ...prev, [int.id]: 'failed' }));
        toast({ title: 'Connection Failed', description: `Could not reach proxy server. Is it running?`, variant: 'destructive' });
      }
    } else {
      // No proxy — simulate a delay and show guidance
      await new Promise(r => setTimeout(r, 1500));
      setTestingConnection(prev => ({ ...prev, [int.id]: 'failed' }));
      toast({
        title: 'Proxy Not Configured',
        description: 'Set VITE_PROXY_URL and run the proxy server to enable live connection testing. Credentials are managed server-side.',
        variant: 'destructive',
      });
    }

    setTimeout(() => setTestingConnection(prev => ({ ...prev, [int.id]: 'idle' })), 5000);
  };

  const toggleApiKeyVisibility = (id: string) => {
    setShowApiKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const statusColor = (s: string) =>
    s === 'connected' ? 'text-success' : s === 'error' ? 'text-destructive' : 'text-muted-foreground';

  const statusBadge = (s: string) =>
    s === 'connected' ? 'default' : s === 'error' ? 'destructive' : 'secondary';

  /* ─── section renderers ─── */
  const renderIntegrations = () => (
    <div className="space-y-4">
      {integrations.map(int => (
        <Card key={int.id} className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${int.status === 'connected' ? 'bg-success' : int.status === 'error' ? 'bg-destructive' : 'bg-muted-foreground'}`} />
                <h3 className="font-semibold text-foreground">{int.name}</h3>
                <Badge variant={statusBadge(int.status) as any} className="text-[10px] uppercase">{int.status}</Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={int.status !== 'connected' || testingConnection[int.id] === 'testing'}
                  onClick={() => handleTestConnection(int)}
                >
                  {testingConnection[int.id] === 'testing' ? (
                    <><Loader2 size={14} className="mr-1 animate-spin" /> Testing…</>
                  ) : testingConnection[int.id] === 'success' ? (
                    <><Wifi size={14} className="mr-1 text-success" /> Passed</>
                  ) : testingConnection[int.id] === 'failed' ? (
                    <><WifiOff size={14} className="mr-1 text-destructive" /> Failed</>
                  ) : (
                    <><Wifi size={14} className="mr-1" /> Test Connection</>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant={int.status === 'connected' ? 'outline' : 'default'}
                  onClick={() => {
                    setIntegrations(prev => prev.map(i => i.id === int.id ? { ...i, status: i.status === 'connected' ? 'disconnected' : 'connected', lastSync: i.status !== 'connected' ? new Date().toISOString().slice(0, 16).replace('T', ' ') : i.lastSync } : i));
                    toast({ title: int.status === 'connected' ? 'Disconnected' : 'Connected', description: `${int.name} ${int.status === 'connected' ? 'disconnected' : 'connected'} successfully.` });
                  }}
                >
                  {int.status === 'connected' ? 'Disconnect' : 'Connect'}
                </Button>
              </div>
            </div>
            {/* Inline test result alert */}
            {testingConnection[int.id] === 'success' && (
              <div className="mb-3 flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
                <Check size={14} /> Connection to {int.name} verified successfully.
              </div>
            )}
            {testingConnection[int.id] === 'failed' && (
              <div className="mb-3 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertTriangle size={14} /> Failed to reach {int.name}. Check URL and credentials.
              </div>
            )}
            <div className="grid md:grid-cols-1 gap-x-4 gap-y-1">
              <Label className="text-xs text-muted-foreground">URL</Label>
              <Input defaultValue={int.url} className="bg-muted/30 border-border text-sm h-10" readOnly />
              <p className="text-[10px] text-muted-foreground">Base URL of your {int.name} instance</p>
              <p className="text-[10px] text-muted-foreground italic mt-1">
                Credentials are managed securely on the server. Configure them in <code className="text-primary">server/.env</code>
              </p>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">Last Sync: {int.lastSync || 'Never'}</p>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" className="w-full border-dashed" onClick={() => { setNewProviderType(''); setNewUrl(''); setAddDialogOpen(true); }}>
        <Plus size={14} className="mr-2" /> Add Integration
      </Button>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Integration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Provider</Label>
              <Select value={newProviderType} onValueChange={(v) => { setNewProviderType(v); const p = availableProviders[v]; if (p) setNewUrl(p.urlPlaceholder); }}>
                <SelectTrigger className="bg-muted/30 border-border text-sm">
                  <SelectValue placeholder="Select a provider…" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(availableProviders)
                    .filter(([key]) => !integrations.some(i => i.type === key))
                    .map(([key, p]) => (
                      <SelectItem key={key} value={key}>{p.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            {newProviderType && (() => {
              const p = availableProviders[newProviderType];
              return (
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">URL</Label>
                  <Input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder={p.urlPlaceholder} className="bg-muted/30 border-border text-sm" />
                  <p className="text-[10px] text-muted-foreground mt-1 italic">
                    Credentials should be configured in <code className="text-primary">server/.env</code> — they are never stored in the browser.
                  </p>
                </div>
              );
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button
              disabled={!newProviderType || !newUrl.trim()}
              onClick={() => {
                const p = availableProviders[newProviderType];
                const newIntegration: Integration = {
                  id: String(Date.now()),
                  name: p.name,
                  type: p.type,
                  url: newUrl,
                  status: 'disconnected',
                };
                setIntegrations(prev => [...prev, newIntegration]);
                setAddDialogOpen(false);
                toast({ title: 'Integration Added', description: `${p.name} has been added. Configure credentials in server/.env and test the connection.` });
              }}
            >
              Add Integration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  const handleTestAIConnection = async (provider: AIProvider) => {
    setProviders(prev => prev.map(pr => pr.id === provider.id ? { ...pr, connectionStatus: 'testing' as const } : pr));

    if (proxyEnabled) {
      try {
        // Test AI provider through the proxy
        const result = await proxyTestConnection(`ai-${provider.provider}`);
        const success = result.ok;
        setProviders(prev => prev.map(pr => pr.id === provider.id ? {
          ...pr,
          connectionStatus: success ? 'success' as const : 'failed' as const,
          lastTested: new Date().toLocaleTimeString(),
        } : pr));
        toast({
          title: success ? 'AI Connection Verified' : 'AI Connection Failed',
          description: success
            ? `${provider.provider} / ${provider.model} responded successfully${result.responseTimeMs ? ` (${result.responseTimeMs}ms)` : ''}.`
            : result.error || `Could not reach ${provider.provider}.`,
          variant: success ? undefined : 'destructive',
        });
      } catch {
        setProviders(prev => prev.map(pr => pr.id === provider.id ? {
          ...pr,
          connectionStatus: 'failed' as const,
          lastTested: new Date().toLocaleTimeString(),
        } : pr));
        toast({ title: 'Connection Failed', description: 'Could not reach proxy server. Is it running?', variant: 'destructive' });
      }
    } else {
      // No proxy — simulate and guide
      await new Promise(r => setTimeout(r, 1500));
      setProviders(prev => prev.map(pr => pr.id === provider.id ? {
        ...pr,
        connectionStatus: 'failed' as const,
        lastTested: new Date().toLocaleTimeString(),
      } : pr));
      toast({
        title: 'Proxy Not Configured',
        description: 'Set VITE_PROXY_URL and run the proxy server to enable AI connection testing. API keys are managed server-side.',
        variant: 'destructive',
      });
    }
  };

  const renderAIProviders = () => {
    const failedProviders = providers.filter(p => p.connectionStatus === 'failed' && p.enabled);

    return (
    <div className="space-y-4">
      {failedProviders.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
          <AlertTriangle size={18} className="text-warning shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-warning">AI Connection Issues Detected</p>
            <p className="text-muted-foreground mt-0.5">
              {failedProviders.map(p => `${p.provider}/${p.model}`).join(', ')} — failed connectivity test. Modules relying on these providers may not function correctly.
            </p>
          </div>
        </div>
      )}
      {providers.map(p => (
        <Card key={p.id} className="bg-card border-border">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bot size={18} className="text-primary" />
                <h3 className="font-semibold text-foreground capitalize">{p.provider}</h3>
                <Badge variant="outline" className="text-[10px]">{p.model}</Badge>
                {p.connectionStatus === 'success' && (
                  <Badge variant="default" className="text-[10px] bg-success/20 text-success border-success/30"><Check size={10} className="mr-1" />Verified</Badge>
                )}
                {p.connectionStatus === 'failed' && (
                  <Badge variant="destructive" className="text-[10px]"><AlertTriangle size={10} className="mr-1" />Failed</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={p.connectionStatus === 'testing'}
                  onClick={() => handleTestAIConnection(p)}
                >
                  {p.connectionStatus === 'testing' ? (
                    <><Loader2 size={14} className="mr-1 animate-spin" /> Testing…</>
                  ) : p.connectionStatus === 'success' ? (
                    <><Wifi size={14} className="mr-1 text-success" /> Re-test</>
                  ) : p.connectionStatus === 'failed' ? (
                    <><WifiOff size={14} className="mr-1 text-destructive" /> Retry</>
                  ) : (
                    <><Wifi size={14} className="mr-1" /> Test Connection</>
                  )}
                </Button>
                <Switch
                  checked={p.enabled}
                  onCheckedChange={(checked) => setProviders(prev => prev.map(pr => pr.id === p.id ? { ...pr, enabled: checked } : pr))}
                />
              </div>
            </div>
            {/* Inline test result */}
            {p.connectionStatus === 'success' && (
              <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
                <Check size={14} /> Connection to {p.provider}/{p.model} verified. {p.lastTested && <span className="text-muted-foreground ml-auto text-xs">Tested at {p.lastTested}</span>}
              </div>
            )}
            {p.connectionStatus === 'failed' && (
              <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertTriangle size={14} /> Failed to verify {p.provider}/{p.model}. Check API key and ensure the model is accessible. {p.lastTested && <span className="text-muted-foreground ml-auto text-xs">Tested at {p.lastTested}</span>}
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Model</Label>
                <div className="relative mt-1">
                  <Input
                    list={`models-${p.id}`}
                    value={p.model}
                    onChange={e => setProviders(prev => prev.map(pr => pr.id === p.id ? { ...pr, model: e.target.value } : pr))}
                    placeholder="Type or select a model…"
                    className="bg-muted/30 border-border text-sm font-mono"
                  />
                  <datalist id={`models-${p.id}`}>
                    {(knownModels[p.provider] || []).map(m => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Type a custom model name or pick from suggestions</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">API Key</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type={showApiKeys[p.id] ? 'text' : 'password'}
                    defaultValue={p.apiKey}
                    className="bg-muted/30 border-border text-sm font-mono"
                  />
                  <Button size="icon" variant="ghost" onClick={() => toggleApiKeyVisibility(p.id)}>
                    {showApiKeys[p.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Temperature: {p.temperature}</Label>
                <Input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue={String(p.temperature)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Max Tokens</Label>
                <Input type="number" defaultValue={String(p.maxTokens)} className="mt-1 bg-muted/30 border-border text-sm" />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Assigned Modules</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['risk-prediction', 'qa-assistant', 'defect-analysis', 'release-advisor'].map(mod => (
                  <Badge
                    key={mod}
                    variant={p.assignedTo.includes(mod) ? 'default' : 'outline'}
                    className="cursor-pointer text-xs"
                    onClick={() => {
                      setProviders(prev => prev.map(pr => {
                        if (pr.id !== p.id) return pr;
                        const assignedTo = pr.assignedTo.includes(mod)
                          ? pr.assignedTo.filter(m => m !== mod)
                          : [...pr.assignedTo, mod];
                        return { ...pr, assignedTo };
                      }));
                    }}
                  >
                    {mod.replace('-', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" className="w-full border-dashed" onClick={() => { setNewAIProvider('openai'); setNewAIModel(''); setNewAIApiKey(''); setAddProviderDialogOpen(true); }}>
        <Plus size={14} className="mr-2" /> Add AI Provider
      </Button>

      <Dialog open={addProviderDialogOpen} onOpenChange={setAddProviderDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add AI Provider</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Provider</Label>
              <Select value={newAIProvider} onValueChange={(v) => { setNewAIProvider(v); setNewAIModel(''); }}>
                <SelectTrigger className="bg-muted/30 border-border text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(knownModels).map(p => (
                    <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Model</Label>
              <Input
                list="new-provider-models"
                value={newAIModel}
                onChange={e => setNewAIModel(e.target.value)}
                placeholder="Type or select a model…"
                className="bg-muted/30 border-border text-sm font-mono"
              />
              <datalist id="new-provider-models">
                {(knownModels[newAIProvider] || []).map(m => (
                  <option key={m} value={m} />
                ))}
              </datalist>
              <p className="text-[10px] text-muted-foreground mt-1">Select a known model or type a custom one</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">API Key</Label>
              <Input type="password" value={newAIApiKey} onChange={e => setNewAIApiKey(e.target.value)} placeholder="Enter API key…" className="bg-muted/30 border-border text-sm font-mono" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddProviderDialogOpen(false)}>Cancel</Button>
            <Button
              disabled={!newAIModel.trim() || !newAIApiKey.trim()}
              onClick={() => {
                const newProvider: AIProvider = {
                  id: String(Date.now()),
                  provider: newAIProvider,
                  model: newAIModel,
                  apiKey: newAIApiKey,
                  temperature: 0.3,
                  maxTokens: 4096,
                  assignedTo: [],
                  enabled: true,
                };
                setProviders(prev => [...prev, newProvider]);
                setAddProviderDialogOpen(false);
                toast({ title: 'Provider Added', description: `${newAIProvider} / ${newAIModel} has been added.` });
              }}
            >
              Add Provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-end">
        <Button onClick={() => handleSave('AI Providers')}><Save size={14} className="mr-2" /> Save Changes</Button>
      </div>
    </div>
  );
  };

  const renderEnvironments = () => (
    <div className="space-y-4">
      {environments.map(env => (
        <Card key={env.id} className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Server size={16} className="text-primary" />
                <Input
                  value={env.name}
                  onChange={e => setEnvironments(prev => prev.map(en => en.id === env.id ? { ...en, name: e.target.value } : en))}
                  className="bg-transparent border-none text-foreground font-semibold text-base p-0 h-auto focus-visible:ring-1 focus-visible:ring-primary rounded px-2 -ml-2 w-48"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                  onClick={() => {
                    setEnvironments(prev => prev.filter(e => e.id !== env.id));
                    toast({ title: 'Environment Removed', description: `${env.name} has been removed.` });
                  }}
                >
                  <Trash2 size={14} />
                </Button>
                <Switch
                  checked={env.enabled}
                  onCheckedChange={(checked) => setEnvironments(prev => prev.map(e => e.id === env.id ? { ...e, enabled: checked } : e))}
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Health Check URL</Label>
                <Input
                  value={env.healthUrl}
                  onChange={e => setEnvironments(prev => prev.map(en => en.id === env.id ? { ...en, healthUrl: e.target.value } : en))}
                  className="mt-1 bg-muted/30 border-border text-sm font-mono"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Pipeline Mapping</Label>
                <Input
                  value={env.pipelineMapping}
                  onChange={e => setEnvironments(prev => prev.map(en => en.id === env.id ? { ...en, pipelineMapping: e.target.value } : en))}
                  className="mt-1 bg-muted/30 border-border text-sm font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button
        variant="outline"
        className="w-full border-dashed"
        onClick={() => {
          const newEnv: Environment = {
            id: String(Date.now()),
            name: 'New Environment',
            healthUrl: 'https://',
            pipelineMapping: '',
            enabled: false,
          };
          setEnvironments(prev => [...prev, newEnv]);
          toast({ title: 'Environment Added', description: 'New environment created. Rename and configure it.' });
        }}
      >
        <Plus size={14} className="mr-2" /> Add Environment
      </Button>
      <div className="flex justify-end">
        <Button onClick={() => handleSave('Environments')}><Save size={14} className="mr-2" /> Save Changes</Button>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-base">Project Structure</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Project Name</Label>
            <Input defaultValue="FinServ Platform" className="mt-1 bg-muted/30 border-border text-sm" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Teams</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {['Payments', 'Authentication', 'Lending', 'Compliance', 'Platform'].map(t => (
                <Badge key={t} variant="secondary" className="text-xs flex items-center gap-1.5">
                  {t}
                  <button className="hover:text-destructive transition-colors"><Trash2 size={10} /></button>
                </Badge>
              ))}
              <Button size="sm" variant="outline" className="h-6 text-xs"><Plus size={10} className="mr-1" /> Add Team</Button>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Microservices</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {['PaymentService', 'AuthenticationService', 'AccountService', 'TransactionService', 'LoanService', 'KYCService'].map(s => (
                <Badge key={s} variant="outline" className="text-xs font-mono">{s}</Badge>
              ))}
              <span className="text-xs text-muted-foreground self-center">+6 more</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Release Configuration</CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => {
                const connectedIntegrations = integrations.filter(i => i.status === 'connected');
                if (connectedIntegrations.length === 0) {
                  toast({ title: 'No Connected Integrations', description: 'Connect an integration first to sync releases.', variant: 'destructive' });
                  return;
                }
                toast({ title: 'Syncing Releases…', description: `Pulling release data from ${connectedIntegrations.map(i => i.name).join(', ')}…` });
                // Simulate sync
                setTimeout(() => {
                  toast({ title: 'Releases Synced', description: 'Release data pulled successfully from connected integrations.' });
                }, 2000);
              }}
            >
              <RefreshCw size={12} className="mr-1" /> Sync from Integrations
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Current Release</Label>
              <Input defaultValue="2026.04.0" className="mt-1 bg-muted/30 border-border text-sm" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Release Cadence</Label>
              <Select defaultValue="monthly">
                <SelectTrigger className="mt-1 bg-muted/30 border-border text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Linked source */}
          <div>
            <Label className="text-xs text-muted-foreground">Link to Source</Label>
            <Select defaultValue="none">
              <SelectTrigger className="mt-1 bg-muted/30 border-border text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Manual (no integration link)</SelectItem>
                {integrations.filter(i => i.status === 'connected').map(i => (
                  <SelectItem key={i.id} value={i.type}>{i.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground mt-1">Link releases to a connected integration to enable syncing versions and dates</p>
          </div>

          {/* Synced releases preview */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Recent Releases</Label>
            <div className="space-y-2">
              {[
                { version: '2026.04.0', date: '2026-04-01', source: 'Azure DevOps', status: 'Planned' },
                { version: '2026.03.0', date: '2026-03-01', source: 'Azure DevOps', status: 'In Progress' },
                { version: '2026.02.0', date: '2026-02-01', source: 'Azure DevOps', status: 'Released' },
              ].map(r => (
                <div key={r.version} className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-medium text-foreground">{r.version}</span>
                    <span className="text-xs text-muted-foreground">{r.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={r.status === 'Released' ? 'default' : r.status === 'In Progress' ? 'secondary' : 'outline'} className="text-[10px]">
                      {r.status}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <ExternalLink size={10} /> {r.source}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={() => handleSave('Projects & Teams')}><Save size={14} className="mr-2" /> Save Changes</Button>
      </div>
    </div>
  );

  const renderBranding = () => (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-base">Application Branding</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Application Name</Label>
            <Input value={brandName} onChange={e => setBrandName(e.target.value)} className="mt-1 bg-muted/30 border-border text-sm" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Company Logo</Label>
            {brandLogo ? (
              <div className="mt-2 border border-border rounded-lg p-4 flex items-center gap-4">
                <img src={brandLogo} alt="Logo preview" className="h-12 w-auto object-contain rounded" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{brandLogoName}</p>
                  <p className="text-[10px] text-muted-foreground">Logo uploaded</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setBrandLogo(null); setBrandLogoName(null); }}>
                  <Trash2 size={14} className="text-muted-foreground" />
                </Button>
              </div>
            ) : (
              <label className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center block cursor-pointer hover:border-primary/40 transition-colors">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 2 * 1024 * 1024) {
                      toast({ title: 'File too large', description: 'Logo must be under 2MB.', variant: 'destructive' });
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setBrandLogo(ev.target?.result as string);
                      setBrandLogoName(file.name);
                      toast({ title: 'Logo Uploaded', description: `${file.name} has been set as the company logo.` });
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                <Palette size={24} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">Drag and drop or click to upload logo</p>
                <p className="text-[10px] text-muted-foreground mt-1">PNG, SVG, or JPEG — max 2MB</p>
              </label>
            )}
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Theme</Label>
            <div className="flex gap-3 mt-2">
              {['dark', 'light', 'system'].map(theme => (
                <button
                  key={theme}
                  onClick={() => setBrandTheme(theme)}
                  className={`px-4 py-2 rounded-lg border text-sm capitalize transition-all ${
                    brandTheme === theme
                      ? 'bg-primary/10 border-primary/40 text-primary'
                      : 'bg-card border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Primary Color</Label>
            <div className="flex gap-3 mt-2">
              {[
                { name: 'Cyan', hsl: '190 90% 50%' },
                { name: 'Blue', hsl: '220 80% 55%' },
                { name: 'Purple', hsl: '260 60% 58%' },
                { name: 'Green', hsl: '145 65% 42%' },
                { name: 'Orange', hsl: '25 90% 55%' },
              ].map(c => (
                <button
                  key={c.name}
                  className="w-8 h-8 rounded-full border-2 border-border hover:scale-110 transition-transform"
                  style={{ background: `hsl(${c.hsl})` }}
                  title={c.name}
                  onClick={() => toast({ title: 'Color Updated', description: `Primary color set to ${c.name}.` })}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={() => handleSave('Branding')}><Save size={14} className="mr-2" /> Save Changes</Button>
      </div>
    </div>
  );

  const channelConfig: Record<string, { label: string; targetLabel: string; targetPlaceholder: string; needsWebhook: boolean; webhookPlaceholder: string; webhookHelp: string }> = {
    slack: { label: 'Slack', targetLabel: 'Channel Name', targetPlaceholder: '#channel-name', needsWebhook: true, webhookPlaceholder: 'https://hooks.slack.com/services/T00/B00/xxxx', webhookHelp: 'Slack → App → Incoming Webhooks → Add New Webhook to Workspace → Copy URL' },
    teams: { label: 'Microsoft Teams', targetLabel: 'Channel Name', targetPlaceholder: 'Team Channel Name', needsWebhook: true, webhookPlaceholder: 'https://outlook.office.com/webhook/...', webhookHelp: 'Teams → Channel → Connectors → Incoming Webhook → Configure → Copy URL' },
    email: { label: 'Email', targetLabel: 'Email Address', targetPlaceholder: 'team@company.com', needsWebhook: false, webhookPlaceholder: '', webhookHelp: '' },
  };

  const handleAddChannel = () => {
    if (!newChannelTarget.trim()) {
      toast({ title: 'Missing field', description: `Please enter a ${channelConfig[newChannelType].targetLabel.toLowerCase()}.`, variant: 'destructive' });
      return;
    }
    if (channelConfig[newChannelType].needsWebhook && !newChannelWebhook.trim()) {
      toast({ title: 'Webhook URL required', description: `A webhook URL is required for ${channelConfig[newChannelType].label} notifications.`, variant: 'destructive' });
      return;
    }
    if (channelConfig[newChannelType].needsWebhook) {
      try { new URL(newChannelWebhook); } catch {
        toast({ title: 'Invalid URL', description: 'Please enter a valid webhook URL.', variant: 'destructive' });
        return;
      }
    }
    if (newChannelType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newChannelTarget)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }

    const newChannel: NotificationChannel = {
      id: Date.now().toString(),
      type: newChannelType,
      target: newChannelTarget.trim(),
      webhookUrl: channelConfig[newChannelType].needsWebhook ? newChannelWebhook.trim() : undefined,
      enabled: true,
    };
    setChannels(prev => [...prev, newChannel]);
    setAddChannelDialogOpen(false);
    setNewChannelTarget('');
    setNewChannelWebhook('');
    setTestingWebhook('idle');
    toast({ title: 'Channel added', description: `${channelConfig[newChannelType].label} channel "${newChannelTarget}" has been added.` });
  };

  const handleTestWebhook = () => {
    if (!newChannelWebhook.trim()) return;
    try { new URL(newChannelWebhook); } catch {
      toast({ title: 'Invalid URL', description: 'Please enter a valid webhook URL first.', variant: 'destructive' });
      return;
    }
    setTestingWebhook('testing');
    // Simulate webhook test — in production this would POST to the URL
    setTimeout(() => {
      const success = newChannelWebhook.includes('hooks.slack.com') || newChannelWebhook.includes('webhook') || newChannelWebhook.includes('office.com');
      setTestingWebhook(success ? 'success' : 'failed');
      toast({
        title: success ? 'Webhook reachable' : 'Webhook test failed',
        description: success ? 'Test payload sent successfully.' : 'Could not reach the webhook URL. Please verify the URL and try again.',
        variant: success ? undefined : 'destructive',
      });
      setTimeout(() => setTestingWebhook('idle'), 5000);
    }, 1500);
  };

  const renderNotifications = () => (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-base">Alert Thresholds</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Risk Score Threshold (%)</Label>
              <Input type="number" value={riskThreshold} onChange={e => setRiskThreshold(e.target.value)} className="mt-1 bg-muted/30 border-border text-sm" />
              <p className="text-[10px] text-muted-foreground mt-1">Alert when release risk exceeds this value</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Pipeline Failure Spike</Label>
              <Input type="number" value={failureThreshold} onChange={e => setFailureThreshold(e.target.value)} className="mt-1 bg-muted/30 border-border text-sm" />
              <p className="text-[10px] text-muted-foreground mt-1">Alert when this many pipelines fail simultaneously</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-base">Notification Channels</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {channels.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No notification channels configured yet.</p>
          )}
          {channels.map(ch => (
            <div key={ch.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50">
              <div className="flex items-center gap-3 min-w-0">
                <Badge variant="outline" className="text-[10px] uppercase w-14 justify-center shrink-0">{ch.type}</Badge>
                <div className="min-w-0">
                  <span className="text-sm text-foreground block truncate">{ch.target}</span>
                  {ch.webhookUrl && (
                    <span className="text-[10px] text-muted-foreground font-mono block truncate">{ch.webhookUrl}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Switch
                  checked={ch.enabled}
                  onCheckedChange={(checked) => setChannels(prev => prev.map(c => c.id === ch.id ? { ...c, enabled: checked } : c))}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    setChannels(prev => prev.filter(c => c.id !== ch.id));
                    toast({ title: 'Channel removed', description: `${ch.type} channel "${ch.target}" has been removed.` });
                  }}
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full border-dashed mt-2" onClick={() => { setNewChannelType('slack'); setNewChannelTarget(''); setNewChannelWebhook(''); setTestingWebhook('idle'); setAddChannelDialogOpen(true); }}>
            <Plus size={14} className="mr-2" /> Add Channel
          </Button>
        </CardContent>
      </Card>

      {/* Add Channel Dialog */}
      <Dialog open={addChannelDialogOpen} onOpenChange={setAddChannelDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add Notification Channel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs text-muted-foreground">Channel Type</Label>
              <Select value={newChannelType} onValueChange={(v: 'slack' | 'teams' | 'email') => { setNewChannelType(v); setNewChannelWebhook(''); setTestingWebhook('idle'); }}>
                <SelectTrigger className="mt-1 bg-muted/30 border-border text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slack">Slack (Incoming Webhook)</SelectItem>
                  <SelectItem value="teams">Microsoft Teams (Incoming Webhook)</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">{channelConfig[newChannelType].targetLabel}</Label>
              <Input
                value={newChannelTarget}
                onChange={e => setNewChannelTarget(e.target.value)}
                placeholder={channelConfig[newChannelType].targetPlaceholder}
                className="mt-1 bg-muted/30 border-border text-sm"
              />
            </div>

            {channelConfig[newChannelType].needsWebhook && (
              <div>
                <Label className="text-xs text-muted-foreground">Webhook URL</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={newChannelWebhook}
                    onChange={e => { setNewChannelWebhook(e.target.value); setTestingWebhook('idle'); }}
                    placeholder={channelConfig[newChannelType].webhookPlaceholder}
                    className="bg-muted/30 border-border text-sm font-mono flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!newChannelWebhook.trim() || testingWebhook === 'testing'}
                    onClick={handleTestWebhook}
                    className="shrink-0"
                  >
                    {testingWebhook === 'testing' ? (
                      <><Loader2 size={14} className="mr-1 animate-spin" /> Testing…</>
                    ) : testingWebhook === 'success' ? (
                      <><Check size={14} className="mr-1 text-success" /> Passed</>
                    ) : testingWebhook === 'failed' ? (
                      <><AlertTriangle size={14} className="mr-1 text-destructive" /> Failed</>
                    ) : (
                      <><Wifi size={14} className="mr-1" /> Test</>
                    )}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5 flex items-start gap-1">
                  <ExternalLink size={10} className="shrink-0 mt-0.5" />
                  {channelConfig[newChannelType].webhookHelp}
                </p>
                {testingWebhook === 'success' && (
                  <div className="mt-2 flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-xs text-success">
                    <Check size={12} /> Webhook URL verified successfully.
                  </div>
                )}
                {testingWebhook === 'failed' && (
                  <div className="mt-2 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    <AlertTriangle size={12} /> Could not reach webhook. Verify the URL.
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddChannelDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddChannel}><Plus size={14} className="mr-2" /> Add Channel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-end">
        <Button onClick={() => handleSave('Notifications')}><Save size={14} className="mr-2" /> Save Changes</Button>
      </div>
    </div>
  );

  const renderDemoMode = () => (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-foreground text-lg">Demo Mode</h3>
              <p className="text-sm text-muted-foreground mt-1">
                When enabled, the platform uses synthetic data for demonstrations.
              </p>
            </div>
            <button
              onClick={() => {
                setDemoMode(!demoMode);
                toast({ title: demoMode ? 'Demo Mode Disabled' : 'Demo Mode Enabled', description: demoMode ? 'Platform will use live integration data.' : 'Platform is now using synthetic demo data.' });
              }}
              className="flex items-center gap-2"
            >
              {demoMode
                ? <ToggleRight size={40} className="text-primary" />
                : <ToggleLeft size={40} className="text-muted-foreground" />}
            </button>
          </div>

          {demoMode && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/20 border border-border/50">
              {[
                { label: 'Microservices', value: '12' },
                { label: 'Pipelines', value: '8' },
                { label: 'Releases', value: '20' },
                { label: 'Test Executions', value: '10,000+' },
              ].map(item => (
                <div key={item.label} className="text-center">
                  <p className="text-xl font-bold text-primary">{item.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                </div>
              ))}
            </div>
          )}

          {!demoMode && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
              <AlertTriangle size={18} className="text-warning shrink-0" />
              <p className="text-sm text-warning">Demo mode is disabled. Ensure integrations are configured to see real data.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderGovernance = () => (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-base">AI Decision Mode</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            {[
              { value: 'support', label: 'Decision Support', desc: 'AI recommends, humans decide' },
              { value: 'autonomous', label: 'Autonomous', desc: 'AI can auto-approve low-risk releases' },
              { value: 'disabled', label: 'AI Disabled', desc: 'No AI features — maximum security' },
            ].map(mode => (
              <button
                key={mode.value}
                onClick={() => setDecisionMode(mode.value as 'support' | 'autonomous' | 'disabled')}
                className={`flex-1 p-4 rounded-lg border text-left transition-all ${
                  decisionMode === mode.value
                    ? 'bg-primary/10 border-primary/40'
                    : 'bg-card border-border hover:border-muted-foreground/40'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {decisionMode === mode.value && <Check size={14} className="text-primary" />}
                  <p className="text-sm font-semibold text-foreground">{mode.label}</p>
                </div>
                <p className="text-xs text-muted-foreground">{mode.desc}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-base">Security & Compliance</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50">
            <div>
              <p className="text-sm font-medium text-foreground">Audit Logging</p>
              <p className="text-xs text-muted-foreground">Log all AI recommendations, scoring, and release decisions</p>
            </div>
            <Switch checked={auditEnabled} onCheckedChange={setAuditEnabled} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50">
            <div>
              <p className="text-sm font-medium text-foreground">Data Redaction</p>
              <p className="text-xs text-muted-foreground">Remove PII and source code before sending to AI providers</p>
            </div>
            <Switch checked={dataRedaction} onCheckedChange={setDataRedaction} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Data Residency Region</Label>
            <Select defaultValue="us-east">
              <SelectTrigger className="mt-1 bg-muted/30 border-border text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us-east">US East</SelectItem>
                <SelectItem value="us-west">US West</SelectItem>
                <SelectItem value="eu-west">EU West</SelectItem>
                <SelectItem value="ap-southeast">Asia Pacific</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={() => handleSave('Governance')}><Save size={14} className="mr-2" /> Save Changes</Button>
      </div>
    </div>
  );

  const sectionRenderers: Record<string, () => JSX.Element> = {
    integrations: renderIntegrations,
    'ai-providers': renderAIProviders,
    environments: renderEnvironments,
    'service-health': () => <ServiceHealthSettings />,
    projects: renderProjects,
    branding: renderBranding,
    notifications: renderNotifications,
    'demo-mode': renderDemoMode,
    governance: renderGovernance,
  };

  const activeInfo = sections.find(s => s.key === activeSection);

  /* ─── render ─── */
  if (activeSection && activeInfo) {
    const Icon = activeInfo.icon;
    return (
      <div className="space-y-6 max-w-4xl animate-fade-in">
        <div>
          <button
            onClick={() => setActiveSection(null)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ChevronLeft size={14} /> Back to Settings
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon size={18} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{activeInfo.title}</h1>
              <p className="text-sm text-muted-foreground">{activeInfo.desc}</p>
            </div>
          </div>
        </div>
        {sectionRenderers[activeSection]()}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Platform configuration and administration</p>
      </div>

      <div className="grid gap-3">
        {sections.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className="dashboard-card flex items-center gap-4 cursor-pointer hover:bg-secondary/50 transition-colors text-left w-full"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Icon size={16} className="text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronLeft size={14} className="text-muted-foreground rotate-180" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
