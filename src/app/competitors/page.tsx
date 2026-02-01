import { redirect } from 'next/navigation';
import { getUser, getLoginUrl } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  ExternalLink,
  Clock,
  TrendingUp,
  Globe,
  Users as UsersIcon
} from 'lucide-react';

export default async function CompetitorsPage() {
  const user = await getUser();
  
  if (!user) {
    redirect(getLoginUrl('/competitors'));
  }

  // Get user role for sidebar
  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, user.email)
  });

  // Mock data
  const competitors: any[] = [];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole={dbUser?.role} />
      
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 glass border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Competitors</h1>
              <p className="text-zinc-500 text-sm mt-1">
                {competitors.length} competitor{competitors.length !== 1 ? 's' : ''} tracked
              </p>
            </div>
            <Link
              href="/competitors/new"
              className="flex items-center gap-2 px-5 py-2.5 bg-accent-gradient rounded-xl text-white font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Add Competitor
            </Link>
          </div>
        </header>

        <div className="p-8">
          {/* Search & Filter */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search competitors..."
                className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          {/* Competitors Grid */}
          {competitors.length === 0 ? (
            <div className="bg-surface rounded-2xl border border-border p-16 text-center">
              <div className="w-20 h-20 rounded-2xl bg-surface-hover flex items-center justify-center mx-auto mb-6">
                <UsersIcon className="w-10 h-10 text-zinc-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No competitors yet</h2>
              <p className="text-zinc-500 mb-8 max-w-md mx-auto">
                Start by adding your first competitor. We'll monitor their website and notify you when something changes.
              </p>
              <Link
                href="/competitors/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent-gradient rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="w-5 h-5" />
                Add Your First Competitor
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {competitors.map((competitor) => (
                <CompetitorCard key={competitor.id} competitor={competitor} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function CompetitorCard({ competitor }: { competitor: any }) {
  return (
    <div className="bg-surface rounded-2xl border border-border hover:border-border-light transition-all group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-surface-hover flex items-center justify-center overflow-hidden">
              {competitor.logoUrl ? (
                <img src={competitor.logoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-semibold text-zinc-400">
                  {competitor.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{competitor.name}</h3>
              <a 
                href={competitor.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-zinc-500 hover:text-accent flex items-center gap-1"
              >
                <Globe className="w-3 h-3" />
                {competitor.website}
              </a>
            </div>
          </div>
          <button className="p-2 rounded-lg hover:bg-surface-hover transition-colors opacity-0 group-hover:opacity-100">
            <MoreVertical className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
          {competitor.description || 'No description added'}
        </p>

        <div className="flex items-center gap-6 text-sm text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Globe className="w-4 h-4" />
            {competitor.urlCount || 0} URLs
          </span>
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" />
            {competitor.changeCount || 0} changes
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {competitor.lastChecked || 'Never checked'}
          </span>
        </div>
      </div>
      
      <div className="px-6 py-4 border-t border-border flex items-center justify-between">
        <Link
          href={`/competitors/${competitor.id}`}
          className="text-sm text-accent hover:underline flex items-center gap-1"
        >
          View Details
          <ExternalLink className="w-3 h-3" />
        </Link>
        <span className={`text-xs px-2.5 py-1 rounded-full ${
          competitor.status === 'active' 
            ? 'bg-green-500/10 text-green-400'
            : 'bg-zinc-500/10 text-zinc-400'
        }`}>
          {competitor.status || 'Active'}
        </span>
      </div>
    </div>
  );
}
