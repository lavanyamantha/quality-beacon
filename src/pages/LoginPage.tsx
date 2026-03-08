import { useAuth } from '@/contexts/AuthContext';
import { useBranding } from '@/contexts/BrandingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Loader2 } from 'lucide-react';

const providerIcons: Record<string, string> = {
  microsoft: '🔷',
  github: '🐙',
  google: '🔴',
  aws: '🟠',
};

export default function LoginPage() {
  const { providers, login, isLoading } = useAuth();
  const { brandName } = useBranding();
  const error = new URLSearchParams(window.location.search).get('error');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl text-foreground">{brandName}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in with your organization account to continue
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive text-center">
              Authentication failed. Please try again.
            </div>
          )}

          {providers.length === 0 ? (
            <div className="text-center space-y-2 py-4">
              <p className="text-sm text-muted-foreground">
                No identity providers are configured.
              </p>
              <p className="text-xs text-muted-foreground">
                Configure OAuth credentials in <code className="text-primary">server/.env</code>
              </p>
            </div>
          ) : (
            providers.map(p => (
              <Button
                key={p.id}
                variant="outline"
                className="w-full h-12 justify-start gap-3 text-sm font-medium"
                onClick={() => login(p.id)}
              >
                <span className="text-lg">{providerIcons[p.icon] || '🔐'}</span>
                Sign in with {p.name}
              </Button>
            ))
          )}

          <div className="pt-4 text-center">
            <Badge variant="outline" className="text-[10px] text-muted-foreground">
              SSO · Role-based Access Control
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
