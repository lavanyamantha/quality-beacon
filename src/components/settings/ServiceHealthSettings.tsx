import { useState } from 'react';
import { useServiceHealthConfig, ServiceHealthEndpoint } from '@/contexts/ServiceHealthConfigContext';
import { fetchAllServiceHealth } from '@/services/healthCheckFetcher';
import { Plus, Trash2, Save, Loader2, Check, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

export default function ServiceHealthSettings() {
  const { endpoints, addEndpoint, updateEndpoint, removeEndpoint } = useServiceHealthConfig();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, 'success' | 'failed'>>({});

  // New endpoint form
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newProvider, setNewProvider] = useState<ServiceHealthEndpoint['provider']>('generic');
  const [newStatusField, setNewStatusField] = useState('status');
  const [newHealthyValue, setNewHealthyValue] = useState('healthy');
  const [newAuthHeader, setNewAuthHeader] = useState('');

  const handleAdd = () => {
    if (!newName.trim() || !newUrl.trim()) {
      toast({ title: 'Missing fields', description: 'Name and Health URL are required.', variant: 'destructive' });
      return;
    }
    const id = `svc-${Date.now()}`;
    addEndpoint({
      id,
      name: newName.trim(),
      healthUrl: newUrl.trim(),
      provider: newProvider,
      statusField: newStatusField || 'status',
      healthyValue: newHealthyValue || 'healthy',
      authHeader: newAuthHeader || undefined,
      enabled: true,
    });
    setNewName('');
    setNewUrl('');
    setNewProvider('generic');
    setNewStatusField('status');
    setNewHealthyValue('healthy');
    setNewAuthHeader('');
    setAddDialogOpen(false);
    toast({ title: 'Endpoint added', description: `${newName} health endpoint configured.` });
  };

  const handleTest = async (ep: ServiceHealthEndpoint) => {
    setTestingId(ep.id);
    try {
      const results = await fetchAllServiceHealth([ep]);
      if (results.length > 0 && results[0].health !== 'down') {
        setTestResults(prev => ({ ...prev, [ep.id]: 'success' }));
        toast({ title: 'Connection successful', description: `${ep.name} responded with status: ${results[0].health} (${results[0].responseTimeMs}ms)` });
      } else {
        setTestResults(prev => ({ ...prev, [ep.id]: 'failed' }));
        toast({
          title: 'Connection failed',
          description: results[0]?.errorMessage || `${ep.name} is unreachable or returned an error.`,
          variant: 'destructive',
        });
      }
    } catch {
      setTestResults(prev => ({ ...prev, [ep.id]: 'failed' }));
      toast({ title: 'Test failed', description: 'Could not reach the endpoint.', variant: 'destructive' });
    } finally {
      setTestingId(null);
    }
  };

  const providerLabels: Record<string, string> = {
    generic: 'Generic HTTP',
    azure: 'Azure',
    aws: 'AWS',
    gcp: 'GCP',
    custom: 'Custom',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Configure health check endpoints for your microservices. These will be polled every 30 seconds on the Service Health page.
        </p>
        <Button size="sm" onClick={() => setAddDialogOpen(true)}>
          <Plus size={14} className="mr-1" /> Add Endpoint
        </Button>
      </div>

      {endpoints.length === 0 ? (
        <Card className="bg-muted/20 border-dashed">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">No health endpoints configured</p>
            <p className="text-xs text-muted-foreground">Add a service health endpoint to start monitoring real services.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {endpoints.map(ep => (
            <Card key={ep.id} className="bg-card">
              <CardContent className="py-4 px-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{ep.name}</span>
                      <Badge variant="outline" className="text-[9px] uppercase">{providerLabels[ep.provider]}</Badge>
                      {testResults[ep.id] === 'success' && (
                        <Badge className="bg-success/20 text-success border-success/30 text-[9px]">
                          <Check size={8} className="mr-0.5" /> Connected
                        </Badge>
                      )}
                      {testResults[ep.id] === 'failed' && (
                        <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-[9px]">
                          <AlertTriangle size={8} className="mr-0.5" /> Failed
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs font-mono text-muted-foreground truncate">{ep.healthUrl}</p>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                      <span>Status field: <code className="text-foreground">{ep.statusField || 'status'}</code></span>
                      <span>Healthy value: <code className="text-foreground">{ep.healthyValue || 'healthy'}</code></span>
                      {ep.authHeader && <span>Auth: configured</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={ep.enabled}
                      onCheckedChange={(checked) => updateEndpoint(ep.id, { enabled: checked })}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[10px]"
                      onClick={() => handleTest(ep)}
                      disabled={testingId === ep.id}
                    >
                      {testingId === ep.id ? <Loader2 size={10} className="mr-1 animate-spin" /> : <Wifi size={10} className="mr-1" />}
                      Test
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-destructive hover:text-destructive"
                      onClick={() => {
                        removeEndpoint(ep.id);
                        toast({ title: 'Endpoint removed', description: `${ep.name} has been removed.` });
                      }}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Endpoint Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Health Endpoint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs">Service Name</Label>
              <Input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g., PaymentService"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Health Check URL</Label>
              <Input
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                placeholder="https://api.company.com/health"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Cloud Provider</Label>
              <Select value={newProvider} onValueChange={(v: ServiceHealthEndpoint['provider']) => setNewProvider(v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="generic">Generic HTTP</SelectItem>
                  <SelectItem value="azure">Azure</SelectItem>
                  <SelectItem value="aws">AWS</SelectItem>
                  <SelectItem value="gcp">GCP</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">JSON Status Field</Label>
                <Input
                  value={newStatusField}
                  onChange={e => setNewStatusField(e.target.value)}
                  placeholder="status"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Healthy Value</Label>
                <Input
                  value={newHealthyValue}
                  onChange={e => setNewHealthyValue(e.target.value)}
                  placeholder="healthy"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Authorization Header <span className="text-muted-foreground">(optional)</span></Label>
              <Input
                value={newAuthHeader}
                onChange={e => setNewAuthHeader(e.target.value)}
                placeholder="Bearer your-token-here"
                className="mt-1"
                type="password"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Full Authorization header value. Leave empty if the health endpoint is public.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Endpoint</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
