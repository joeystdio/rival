import { redirect } from 'next/navigation';
import { getUser, getLoginUrl } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Search, 
  MoreVertical,
  Shield,
  Users as UsersIcon,
  Mail,
  Calendar,
  CreditCard
} from 'lucide-react';

export default async function AdminUsersPage() {
  const user = await getUser();
  
  if (!user) {
    redirect(getLoginUrl('/admin/users'));
  }

  // Check if user is super admin
  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, user.email)
  });

  if (!dbUser || dbUser.role !== 'super_admin') {
    redirect('/');
  }

  // Fetch all users
  const allUsers = await db.query.users.findMany({
    orderBy: [desc(users.createdAt)]
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-surface-hover transition-colors">
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold">User Management</h1>
              <p className="text-sm text-zinc-500">{allUsers.length} total users</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users by email or name..."
              className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">Role</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">Plan</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">Subscription</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-400">Joined</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allUsers.map((u) => (
                <tr key={u.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent-gradient flex items-center justify-center text-white font-medium">
                        {u.name?.charAt(0) || u.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{u.name || 'No name'}</p>
                        <p className="text-sm text-zinc-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.role === 'super_admin' 
                        ? 'bg-red-500/10 text-red-400'
                        : u.role === 'admin'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-zinc-500/10 text-zinc-400'
                    }`}>
                      {u.role === 'super_admin' ? 'Super Admin' : u.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.plan === 'business'
                        ? 'bg-purple-500/10 text-purple-400'
                        : u.plan === 'pro'
                        ? 'bg-blue-500/10 text-blue-400'
                        : u.plan === 'starter'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-zinc-500/10 text-zinc-400'
                    }`}>
                      {u.plan ? u.plan.charAt(0).toUpperCase() + u.plan.slice(1) : 'Free'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${
                      u.subscriptionStatus === 'active'
                        ? 'text-green-400'
                        : u.subscriptionStatus === 'past_due'
                        ? 'text-amber-400'
                        : 'text-zinc-500'
                    }`}>
                      {u.subscriptionStatus || 'No subscription'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 rounded-lg hover:bg-zinc-700 transition-colors">
                      <MoreVertical className="w-4 h-4 text-zinc-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
