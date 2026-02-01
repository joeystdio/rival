import { redirect } from 'next/navigation';
import { getUser, getLoginUrl } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import { 
  Users, 
  TrendingUp, 
  Bell, 
  Clock,
  ArrowUpRight,
  Sparkles,
  Plus
} from 'lucide-react';
import Link from 'next/link';

export default async function Dashboard() {
  const user = await getUser();
  
  if (!user) {
    redirect(getLoginUrl('/'));
  }

  // Mock data - will be replaced with real DB queries
  const stats = {
    competitors: 0,
    changesThisWeek: 0,
    pendingAlerts: 0,
    lastScan: 'Never'
  };

  const recentChanges: any[] = [];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 glass border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Dashboard</h1>
              <p className="text-zinc-500 text-sm mt-1">
                Welcome back, {user.name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-xl bg-surface hover:bg-surface-hover transition-colors relative">
                <Bell className="w-5 h-5 text-zinc-400" />
                {stats.pendingAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                    {stats.pendingAlerts}
                  </span>
                )}
              </button>
              <div className="w-9 h-9 rounded-full bg-accent-gradient flex items-center justify-center text-white font-medium">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Users}
              label="Competitors"
              value={stats.competitors}
              trend={null}
              color="purple"
            />
            <StatCard
              icon={TrendingUp}
              label="Changes This Week"
              value={stats.changesThisWeek}
              trend={null}
              color="blue"
            />
            <StatCard
              icon={Bell}
              label="Pending Alerts"
              value={stats.pendingAlerts}
              trend={null}
              color="amber"
            />
            <StatCard
              icon={Clock}
              label="Last Scan"
              value={stats.lastScan}
              trend={null}
              color="green"
            />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-3 gap-6">
            {/* Recent Changes */}
            <div className="col-span-2 bg-surface rounded-2xl border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold">Recent Changes</h2>
                <Link 
                  href="/timeline" 
                  className="text-sm text-accent hover:underline flex items-center gap-1"
                >
                  View all
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
              
              {recentChanges.length === 0 ? (
                <EmptyState
                  icon={Sparkles}
                  title="No changes detected yet"
                  description="Add competitors to start monitoring. We'll notify you when something changes."
                  action={
                    <Link
                      href="/competitors/new"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-gradient rounded-xl text-white font-medium text-sm hover:opacity-90 transition-opacity"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Competitor
                    </Link>
                  }
                />
              ) : (
                <div className="divide-y divide-border">
                  {recentChanges.map((change) => (
                    <ChangeItem key={change.id} change={change} />
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <div className="bg-surface rounded-2xl border border-border p-6">
                <h2 className="font-semibold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link
                    href="/competitors/new"
                    className="flex items-center gap-3 p-4 rounded-xl bg-surface-hover hover:bg-zinc-700/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                      <Plus className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Add Competitor</p>
                      <p className="text-xs text-zinc-500">Start tracking a new rival</p>
                    </div>
                  </Link>
                  <Link
                    href="/timeline"
                    className="flex items-center gap-3 p-4 rounded-xl bg-surface-hover hover:bg-zinc-700/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                      <Clock className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">View Timeline</p>
                      <p className="text-xs text-zinc-500">See all changes over time</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Upgrade CTA */}
              <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl border border-purple-500/30 p-6">
                <h3 className="font-semibold mb-2">Upgrade to Pro</h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Track more competitors, get weekly AI digests, and unlock 1-year history.
                </p>
                <button className="w-full py-2.5 bg-white text-zinc-900 rounded-xl font-medium text-sm hover:bg-zinc-100 transition-colors">
                  View Plans
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  trend,
  color 
}: { 
  icon: any; 
  label: string; 
  value: string | number;
  trend: number | null;
  color: 'purple' | 'blue' | 'amber' | 'green';
}) {
  const colorClasses = {
    purple: 'bg-purple-500/10 text-purple-400',
    blue: 'bg-blue-500/10 text-blue-400',
    amber: 'bg-amber-500/10 text-amber-400',
    green: 'bg-green-500/10 text-green-400',
  };

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 hover:border-border-light transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== null && (
          <span className={`text-xs font-medium ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-zinc-500 mt-1">{label}</p>
    </div>
  );
}

function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}: { 
  icon: any; 
  title: string; 
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="p-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-zinc-600" />
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">{description}</p>
      {action}
    </div>
  );
}

function ChangeItem({ change }: { change: any }) {
  return (
    <div className="px-6 py-4 hover:bg-surface-hover transition-colors cursor-pointer">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-surface-hover flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-5 h-5 text-zinc-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{change.title}</p>
          <p className="text-sm text-zinc-500 line-clamp-2 mt-1">{change.summary}</p>
        </div>
        <span className="text-xs text-zinc-500 flex-shrink-0">{change.time}</span>
      </div>
    </div>
  );
}
