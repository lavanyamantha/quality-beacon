import { Database, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NoDataPlaceholder({ title }: { title?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Database size={28} className="text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-2">No Data Available</h2>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        {title ? `${title} data is unavailable. ` : ''}Demo mode is disabled and no integrations are connected. Connect your tools or enable demo mode to see data.
      </p>
      <div className="flex gap-3">
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Settings size={14} /> Configure Integrations
        </Link>
      </div>
    </div>
  );
}
