import { redirect } from 'next/navigation';
import { getUser, getLoginUrl } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import { 
  Clock, 
  Filter,
  TrendingUp,
  DollarSign,
  Sparkles,
  FileText,
  ArrowUpRight
} from 'lucide-react';

export default async function TimelinePage() {
  const user = await getUser();
  
  if (!user) {
    redirect(getLoginUrl('/timeline'));
  }

  // Mock data
  const changes: any[] = [];

  const filters = [
    { id: 'all', label: 'All Changes' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'features', label: 'Features' },
    { id: 'content', label: 'Content' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 glass border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Timeline</h1>
              <p className="text-zinc-500 text-sm mt-1">
                All changes across your competitors
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-sm hover:bg-surface-hover transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </header>

        <div className="p-8">
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-8">
            {filters.map((filter) => (
              <button
                key={filter.id}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter.id === 'all'
                    ? 'bg-accent text-white'
                    : 'bg-surface text-zinc-400 hover:text-white hover:bg-surface-hover'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Timeline */}
          {changes.length === 0 ? (
            <div className="bg-surface rounded-2xl border border-border p-16 text-center">
              <div className="w-20 h-20 rounded-2xl bg-surface-hover flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-zinc-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No changes yet</h2>
              <p className="text-zinc-500 max-w-md mx-auto">
                When your competitors make changes to their websites, they'll appear here. 
                Add competitors to start monitoring.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {changes.map((change, index) => (
                <TimelineItem key={change.id} change={change} isFirst={index === 0} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function TimelineItem({ change, isFirst }: { change: any; isFirst: boolean }) {
  const icons: Record<string, any> = {
    pricing: DollarSign,
    features: Sparkles,
    content: FileText,
    default: TrendingUp,
  };

  const colors: Record<string, string> = {
    pricing: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    features: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    content: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    default: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
  };

  const Icon = icons[change.type] || icons.default;
  const colorClass = colors[change.type] || colors.default;

  return (
    <div className="relative pl-8">
      {/* Timeline line */}
      <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
      
      {/* Timeline dot */}
      <div className={`absolute left-0 top-6 w-6 h-6 rounded-full ${colorClass} border flex items-center justify-center`}>
        <Icon className="w-3 h-3" />
      </div>

      <div className="bg-surface rounded-2xl border border-border p-6 hover:border-border-light transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-hover flex items-center justify-center">
              <span className="text-sm font-semibold text-zinc-400">
                {change.competitorName?.charAt(0) || '?'}
              </span>
            </div>
            <div>
              <h3 className="font-semibold">{change.competitorName}</h3>
              <p className="text-sm text-zinc-500">{change.urlType} page changed</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2.5 py-1 rounded-full ${colorClass}`}>
              {change.significance || 'Minor'}
            </span>
            <span className="text-xs text-zinc-500">{change.time}</span>
          </div>
        </div>

        <p className="text-sm text-zinc-300 mb-4">{change.summary}</p>

        <div className="flex items-center gap-4">
          <button className="text-sm text-accent hover:underline flex items-center gap-1">
            View diff
            <ArrowUpRight className="w-3 h-3" />
          </button>
          <button className="text-sm text-zinc-500 hover:text-white">
            Mark as read
          </button>
        </div>
      </div>
    </div>
  );
}
