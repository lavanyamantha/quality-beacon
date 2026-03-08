import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Platform configuration and administration</p>
      </div>

      <div className="grid gap-4">
        {[
          { title: 'Integrations', desc: 'Configure Azure DevOps, Jira, and SonarQube connections' },
          { title: 'AI Providers', desc: 'Manage LLM providers, API keys, and model settings' },
          { title: 'Environments', desc: 'Configure Dev, QA, Stage, Prod, and Performance environments' },
          { title: 'Projects & Teams', desc: 'Manage project structure, team assignments, and mappings' },
          { title: 'Branding', desc: 'Customize logo, colors, and application theme' },
          { title: 'Notifications', desc: 'Configure alert thresholds and notification channels' },
          { title: 'Demo Mode', desc: 'Enable or disable synthetic data for demonstrations' },
          { title: 'Governance', desc: 'AI decision support mode, audit logs, and data residency' },
        ].map(item => (
          <div key={item.title} className="dashboard-card flex items-center gap-4 cursor-pointer hover:bg-secondary/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Settings size={16} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
