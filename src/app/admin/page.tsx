import { redirect } from 'next/navigation';
import { getUser, getLoginUrl } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, organizations, competitors, changes } from '@/lib/schema';
import { eq, desc, count, sql } from 'drizzle-orm';
import Link from 'next/link';
import { 
  Users, 
  Building2, 
  Target, 
  TrendingUp,
  ArrowLeft,
  Shield,
  DollarSign,
  Activity
} from 'lucide-react';

export default async function AdminDashboard() {
  const user = await getUser();
  
  if (!user) {
    redirect(getLoginUrl('/admin'));
  }

  // Check if user is super admin
  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, user.email)
  });

  if (!dbUser || dbUser.role !== 'super_admin') {
    redirect('/');
  }

  // Fetch stats
  const [userCount] = await db.select({ count: count() }).from(users);
  const [orgCount] = await db.select({ count: count() }).from(organizations);
  const [competitorCount] = await db.select({ count: count() }).from(competitors);
  const [changeCount] = await db.select({ count: count() }).from(changes);

  // Recent users
  const recentUsers = await db.query.users.findMany({
    orderBy: [desc(users.createdAt)],
    limit: 5
  });

  const stats = [
    { label: 'Total Users', value: userCount.count, icon: Users, color: 'purple' },
    { label: 'Organizations', value: orgCount.count, icon: Building2, color: 'blue' },
    { label: 'Competitors Tracked', value: competitorCount.count, icon: Target, color: 'green' },
    { label: 'Changes Detected', value: changeCount.count, icon: TrendingUp, color: 'amber' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 rounded-lg hover:bg-surface-hover transition-colors">
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Admin Panel</h1>
                <p className="text-sm text-zinc-500">Super Admin Access</p>
              </div>
            </div>
          </div>
          <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-sm font-medium">
            Super Admin
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <Link
            href="/admin/users"
            className="bg-surface rounded-2xl border border-border p-6 hover:border-border-light transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-semibold mb-1">Manage Users</h3>
            <p className="text-sm text-zinc-500">View, edit, and manage all users</p>
          </Link>

          <Link
            href="/admin/organizations"
            className="bg-surface rounded-2xl border border-border p-6 hover:border-border-light transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
              <Building2 className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-semibold mb-1">Organizations</h3>
            <p className="text-sm text-zinc-500">Manage client organizations</p>
          </Link>

          <Link
            href="/admin/billing"
            className="bg-surface rounded-2xl border border-border p-6 hover:border-border-light transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="font-semibold mb-1">Billing & Revenue</h3>
            <p className="text-sm text-zinc-500">Stripe subscriptions and MRR</p>
          </Link>
        </div>

        {/* Recent Users */}
        <div className="bg-surface rounded-2xl border border-border">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">Recent Users</h2>
            <Link href="/admin/users" className="text-sm text-accent hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentUsers.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">No users yet</div>
            ) : (
              recentUsers.map((u) => (
                <div key={u.id} className="px-6 py-4 flex items-center justify-between hover:bg-surface-hover transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent-gradient flex items-center justify-center text-white font-medium">
                      {u.name?.charAt(0) || u.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{u.name || 'No name'}</p>
                      <p className="text-sm text-zinc-500">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.role === 'super_admin' 
                        ? 'bg-red-500/10 text-red-400'
                        : u.role === 'admin'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-zinc-500/10 text-zinc-400'
                    }`}>
                      {u.role}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.plan === 'business'
                        ? 'bg-purple-500/10 text-purple-400'
                        : u.plan === 'pro'
                        ? 'bg-blue-500/10 text-blue-400'
                        : u.plan === 'starter'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-zinc-500/10 text-zinc-400'
                    }`}>
                      {u.plan}
                    </span>
                    <span className="text-sm text-zinc-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
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
  color 
}: { 
  icon: any; 
  label: string; 
  value: number;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    purple: 'bg-purple-500/10 text-purple-400',
    blue: 'bg-blue-500/10 text-blue-400',
    amber: 'bg-amber-500/10 text-amber-400',
    green: 'bg-green-500/10 text-green-400',
  };

  return (
    <div className="bg-surface rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-3xl font-semibold">{value}</p>
      <p className="text-sm text-zinc-500 mt-1">{label}</p>
    </div>
  );
}
