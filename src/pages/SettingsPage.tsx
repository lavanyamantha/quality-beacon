import { useState } from 'react';
import { useDemoMode } from '@/contexts/DemoModeContext';
import {
  Settings, Link2, Bot, Server, Users, Palette, Bell, Database, Shield,
  ChevronLeft, Plus, Trash2, Save, Eye, EyeOff, ToggleLeft, ToggleRight,
  Check, AlertTriangle, Loader2, Wifi, WifiOff
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

/* ─── types ─── */
interface Integration {
  id: string;
  name: string;
  type: string;
  url: string;
  authType: 'pat' | 'api-key' | 'oauth';
  authLabel: string;
  authPlaceholder: string;
  token: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
}

interface AIProvider {
  id: string;
  provider: string;
  model: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
  assignedTo: string[];
  enabled: boolean;
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
  enabled: boolean;
}

/* ─── mock state ─── */
const initialIntegrations: Integration[] = [
  { id: '1', name: 'Azure DevOps', type: 'azure-devops', url: 'https://dev.azure.com/myorg', authType: 'pat', authLabel: 'Personal Access Token (PAT)', authPlaceholder: 'Enter your Azure DevOps PAT', token: '', status: 'connected', lastSync: '2026-03-08 09:14' },
  { id: '2', name: 'Jira Cloud', type: 'jira', url: 'https://myteam.atlassian.net', authType: 'api-key', authLabel: 'API Token', authPlaceholder: 'Enter your Atlassian API token', token: '', status: 'disconnected' },
  { id: '3', name: 'SonarQube', type: 'sonarqube', url: 'https://sonar.internal.com', authType: 'api-key', authLabel: 'API Key / Token', authPlaceholder: 'Enter your SonarQube token', token: '', status: 'connected', lastSync: '2026-03-08 08:30' },
  { id: '4', name: 'GitHub', type: 'github', url: 'https://github.com/myorg', authType: 'pat', authLabel: 'Personal Access Token (PAT)', authPlaceholder: 'Enter your GitHub PAT (classic or fine-grained)', token: '', status: 'disconnected' },
  { id: '5', name: 'AWS', type: 'aws', url: 'https://console.aws.amazon.com', authType: 'api-key', authLabel: 'Access Key ID / Secret', authPlaceholder: 'Enter your AWS Access Key ID', token: '', status: 'disconnected' },
];

const initialProviders: AIProvider[] = [
  { id: '1', provider: 'openai', model: 'gpt-4o', apiKey: 'sk-...redacted', temperature: 0.3, maxTokens: 4096, assignedTo: ['risk-prediction', 'qa-assistant'], enabled: true },
  { id: '2', provider: 'anthropic', model: 'claude-3.5-sonnet', apiKey: 'sk-ant-...redacted', temperature: 0.2, maxTokens: 4096, assignedTo: ['defect-analysis'], enabled: false },
];

const initialEnvironments: Environment[] = [
  { id: '1', name: 'Development', healthUrl: 'https://dev-api.internal.com/health', pipelineMapping: 'dev-*', enabled: true },
  { id: '2', name: 'QA', healthUrl: 'https://qa-api.internal.com/health', pipelineMapping: 'qa-*', enabled: true },
  { id: '3', name: 'Staging', healthUrl: 'https://stage-api.internal.com/health', pipelineMapping: 'stage-*', enabled: true },
  { id: '4', name: 'Production', healthUrl: 'https://api.company.com/health', pipelineMapping: 'prod-*', enabled: true },
  { id: '5', name: 'Performance', healthUrl: 'https://perf-api.internal.com/health', pipelineMapping: 'perf-*', enabled: false },
];

const initialChannels: NotificationChannel[] = [
  { id: '1', type: 'slack', target: '#qa-alerts', enabled: true },
  { id: '2', type: 'email', target: 'qa-team@company.com', enabled: true },
  { id: '3', type: 'teams', target: 'QA Release Channel', enabled: false },
];

/* ─── settings sections ─── */
const sections = [
  { key: 'integrations', title: 'Integrations', desc: 'Configure Azure DevOps, Jira, and SonarQube connections', icon: Link2 },
  { key: 'ai-providers', title: 'AI Providers', desc: 'Manage LLM providers, API keys, and model settings', icon: Bot },
  { key: 'environments', title: 'Environments', desc: 'Configure Dev, QA, Stage, Prod, and Performance environments', icon: Server },
  { key: 'projects', title: 'Projects & Teams', desc: 'Manage project structure, team assignments, and mappings', icon: Users },
  { key: 'branding', title: 'Branding', desc: 'Customize logo, colors, and application theme', icon: Palette },
  { key: 'notifications', title: 'Notifications', desc: 'Configure alert thresholds and notification channels', icon: Bell },
  { key: 'demo-mode', title: 'Demo Mode', desc: 'Enable or disable synthetic data for demonstrations', icon: Database },
  { key: 'governance', title: 'Governance', desc: 'AI decision support mode, audit logs, and data residency', icon: Shield },
];

/* ─── component ─── */
const availableProviders: Record<string, { name: string; type: string; urlPlaceholder: string; authType: Integration['authType']; authLabel: string; authPlaceholder: string; helpText: string }> = {
  'azure-devops': { name: 'Azure DevOps', type: 'azure-devops', urlPlaceholder: 'https://dev.azure.com/yourorg', authType: 'pat', authLabel: 'Personal Access Token (PAT)', authPlaceholder: 'Enter your Azure DevOps PAT', helpText: 'Azure DevOps → User Settings → Personal Access Tokens' },
  'jira': { name: 'Jira Cloud', type: 'jira', urlPlaceholder: 'https://yourteam.atlassian.net', authType: 'api-key', authLabel: 'API Token', authPlaceholder: 'Enter your Atlassian API token', helpText: 'Atlassian → Account Settings → Security → API Tokens' },
  'sonarqube': { name: 'SonarQube', type: 'sonarqube', urlPlaceholder: 'https://sonar.yourcompany.com', authType: 'api-key', authLabel: 'API Key / Token', authPlaceholder: 'Enter your SonarQube token', helpText: 'SonarQube → My Account → Security → Tokens' },
  'github': { name: 'GitHub', type: 'github', urlPlaceholder: 'https://github.com/yourorg', authType: 'pat', authLabel: 'Personal Access Token (PAT)', authPlaceholder: 'Enter your GitHub PAT', helpText: 'GitHub → Settings → Developer Settings → Personal Access Tokens' },
  'aws': { name: 'AWS', type: 'aws', urlPlaceholder: 'https://console.aws.amazon.com', authType: 'api-key', authLabel: 'Access Key ID / Secret', authPlaceholder: 'Enter your AWS Access Key ID', helpText: 'AWS → IAM → Security Credentials → Access Keys' },
  'gitlab': { name: 'GitLab', type: 'gitlab', urlPlaceholder: 'https://gitlab.com/yourorg', authType: 'pat', authLabel: 'Personal Access Token', authPlaceholder: 'Enter your GitLab PAT', helpText: 'GitLab → Preferences → Access Tokens' },
  'jenkins': { name: 'Jenkins', type: 'jenkins', urlPlaceholder: 'https://jenkins.yourcompany.com', authType: 'api-key', authLabel: 'API Token', authPlaceholder: 'Enter your Jenkins API token', helpText: 'Jenkins → User → Configure → API Token' },
  'selenium-grid': { name: 'Selenium Grid', type: 'selenium-grid', urlPlaceholder: 'https://selenium.yourcompany.com', authType: 'api-key', authLabel: 'Access Token', authPlaceholder: 'Enter access token (if required)', helpText: 'Selenium Grid Hub URL with optional auth' },
  'bitbucket': { name: 'Bitbucket', type: 'bitbucket', urlPlaceholder: 'https://bitbucket.org/yourworkspace', authType: 'pat', authLabel: 'App Password', authPlaceholder: 'Enter your Bitbucket app password', helpText: 'Bitbucket → Personal Settings → App Passwords' },
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

  // add integration dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newProviderType, setNewProviderType] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newToken, setNewToken] = useState('');

  // add AI provider dialog state
  const [addProviderDialogOpen, setAddProviderDialogOpen] = useState(false);
  const [newAIProvider, setNewAIProvider] = useState('openai');
  const [newAIModel, setNewAIModel] = useState('');
  const [newAIApiKey, setNewAIApiKey] = useState('');

  // known models per provider (users can also type custom ones)
  const knownModels: Record<string, string[]> = {
    openai: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo', 'o1-preview', 'o1-mini'],
    anthropic: ['claude-3.5-sonnet', 'claude-3-opus', 'claude-3-haiku', 'claude-3.5-haiku'],
    google: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'],
    mistral: ['mistral-large', 'mistral-medium', 'mistral-small', 'codestral'],
    cohere: ['command-r-plus', 'command-r', 'command-light'],
  };

  // branding state
  const [brandName, setBrandName] = useState('AI QA Command Center');
  const [brandTheme, setBrandTheme] = useState('dark');

  // governance state
  const { aiMode: decisionMode, setAiMode: setDecisionMode } = useDemoMode();
  const [auditEnabled, setAuditEnabled] = useState(true);
  const [dataRedaction, setDataRedaction] = useState(true);

  // notification thresholds
  const [riskThreshold, setRiskThreshold] = useState('70');
  const [failureThreshold, setFailureThreshold] = useState('3');

  const handleSave = (section: string) => {
    toast({ title: 'Settings saved', description: `${section} configuration updated successfully.` });
  };

  const handleTestConnection = (int: Integration) => {
    // Pre-flight: check token
    if (!int.token.trim()) {
      toast({
        title: 'Credentials Required',
        description: `Please provide a ${int.authLabel} before testing the connection.`,
        variant: 'destructive',
      });
      return;
    }

    setTestingConnection(prev => ({ ...prev, [int.id]: 'testing' }));

    setTimeout(() => {
      let success = false;
      let failReason = '';

      try {
        const parsed = new URL(int.url);
        const validDomains: Record<string, string[]> = {
          'azure-devops': ['dev.azure.com', 'visualstudio.com'],
          'jira': ['atlassian.net'],
          'sonarqube': ['sonarqube', 'sonar'],
          'github': ['github.com'],
          'aws': ['amazonaws.com', 'aws.amazon.com'],
        };
        const allowed = validDomains[int.type] || [];
        const domainMatch = allowed.some(d => parsed.hostname.includes(d));

        if (!domainMatch) {
          failReason = `URL domain does not match expected ${int.name} endpoints.`;
        } else if (int.status !== 'connected') {
          failReason = `Integration is not connected. Connect first, then test.`;
        } else {
          success = true;
        }
      } catch {
        failReason = 'Invalid URL format. Please enter a valid URL.';
      }

      setTestingConnection(prev => ({ ...prev, [int.id]: success ? 'success' : 'failed' }));
      toast({
        title: success ? 'Connection Successful' : 'Connection Failed',
        description: success
          ? `${int.name} authenticated and responded successfully.`
          : `${failReason}`,
        variant: success ? undefined : 'destructive',
      });
      setTimeout(() => {
        setTestingConnection(prev => ({ ...prev, [int.id]: 'idle' }));
      }, 5000);
    }, 2000);
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
            <div className="grid md:grid-cols-2 gap-x-4 gap-y-1">
              <Label className="text-xs text-muted-foreground">URL</Label>
              <Label className="text-xs text-muted-foreground">{int.authLabel}</Label>
              <Input defaultValue={int.url} className="bg-muted/30 border-border text-sm h-10" />
              <div className="relative">
                <Input
                  type={showApiKeys[int.id] ? 'text' : 'password'}
                  value={int.token}
                  placeholder={int.authPlaceholder}
                  onChange={e => setIntegrations(prev => prev.map(i => i.id === int.id ? { ...i, token: e.target.value } : i))}
                  className="bg-muted/30 border-border text-sm font-mono h-10 pr-10"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-0 top-0 h-10 w-10 shrink-0"
                  onClick={() => toggleApiKeyVisibility(int.id)}
                >
                  {showApiKeys[int.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">Base URL of your {int.name} instance</p>
              <p className="text-[10px] text-muted-foreground">
                {int.type === 'azure-devops' && 'Azure DevOps → User Settings → Personal Access Tokens'}
                {int.type === 'jira' && 'Atlassian → Account Settings → Security → API Tokens'}
                {int.type === 'sonarqube' && 'SonarQube → My Account → Security → Tokens'}
                {int.type === 'github' && 'GitHub → Settings → Developer Settings → Personal Access Tokens'}
                {int.type === 'aws' && 'AWS → IAM → Security Credentials → Access Keys'}
              </p>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">Last Sync: {int.lastSync || 'Never'}</p>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" className="w-full border-dashed" onClick={() => { setNewProviderType(''); setNewUrl(''); setNewToken(''); setAddDialogOpen(true); }}>
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
                <>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">URL</Label>
                    <Input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder={p.urlPlaceholder} className="bg-muted/30 border-border text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">{p.authLabel}</Label>
                    <Input type="password" value={newToken} onChange={e => setNewToken(e.target.value)} placeholder={p.authPlaceholder} className="bg-muted/30 border-border text-sm font-mono" />
                    <p className="text-[10px] text-muted-foreground mt-1">{p.helpText}</p>
                  </div>
                </>
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
                  authType: p.authType,
                  authLabel: p.authLabel,
                  authPlaceholder: p.authPlaceholder,
                  token: newToken,
                  status: 'disconnected',
                };
                setIntegrations(prev => [...prev, newIntegration]);
                setAddDialogOpen(false);
                toast({ title: 'Integration Added', description: `${p.name} has been added. Connect and test to verify.` });
              }}
            >
              Add Integration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderAIProviders = () => (
    <div className="space-y-4">
      {providers.map(p => (
        <Card key={p.id} className="bg-card border-border">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bot size={18} className="text-primary" />
                <h3 className="font-semibold text-foreground capitalize">{p.provider}</h3>
                <Badge variant="outline" className="text-[10px]">{p.model}</Badge>
              </div>
              <Switch
                checked={p.enabled}
                onCheckedChange={(checked) => setProviders(prev => prev.map(pr => pr.id === p.id ? { ...pr, enabled: checked } : pr))}
              />
            </div>
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
      <Button variant="outline" className="w-full border-dashed" onClick={() => toast({ title: 'Add Provider', description: 'Provider setup wizard would open here.' })}>
        <Plus size={14} className="mr-2" /> Add AI Provider
      </Button>
      <div className="flex justify-end">
        <Button onClick={() => handleSave('AI Providers')}><Save size={14} className="mr-2" /> Save Changes</Button>
      </div>
    </div>
  );

  const renderEnvironments = () => (
    <div className="space-y-4">
      {environments.map(env => (
        <Card key={env.id} className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Server size={16} className="text-primary" />
                <h3 className="font-semibold text-foreground">{env.name}</h3>
              </div>
              <Switch
                checked={env.enabled}
                onCheckedChange={(checked) => setEnvironments(prev => prev.map(e => e.id === env.id ? { ...e, enabled: checked } : e))}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Health Check URL</Label>
                <Input defaultValue={env.healthUrl} className="mt-1 bg-muted/30 border-border text-sm font-mono" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Pipeline Mapping</Label>
                <Input defaultValue={env.pipelineMapping} className="mt-1 bg-muted/30 border-border text-sm font-mono" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
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
        <CardHeader><CardTitle className="text-base">Release Configuration</CardTitle></CardHeader>
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
            <div className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Palette size={24} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">Drag and drop or click to upload logo</p>
              <p className="text-[10px] text-muted-foreground mt-1">PNG, SVG, or JPEG — max 2MB</p>
            </div>
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
          {channels.map(ch => (
            <div key={ch.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-[10px] uppercase w-14 justify-center">{ch.type}</Badge>
                <span className="text-sm text-foreground">{ch.target}</span>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={ch.enabled}
                  onCheckedChange={(checked) => setChannels(prev => prev.map(c => c.id === ch.id ? { ...c, enabled: checked } : c))}
                />
                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                  <Trash2 size={12} />
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full border-dashed mt-2" onClick={() => toast({ title: 'Add Channel', description: 'Channel setup wizard would open here.' })}>
            <Plus size={14} className="mr-2" /> Add Channel
          </Button>
        </CardContent>
      </Card>
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
