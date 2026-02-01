import { redirect } from 'next/navigation';
import { getUser, getLoginUrl } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { 
  ArrowLeft, 
  User, 
  CreditCard, 
  Bell, 
  Shield,
  ExternalLink,
  Check
} from 'lucide-react';
import { PLAN_DETAILS } from '@/lib/stripe';

export default async function SettingsPage() {
  const user = await getUser();
  
  if (!user) {
    redirect(getLoginUrl('/settings'));
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, user.email)
  });

  const currentPlan = dbUser?.plan || 'free';
  const planDetails = PLAN_DETAILS[currentPlan as keyof typeof PLAN_DETAILS] || PLAN_DETAILS.free;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userRole={dbUser?.role} />
      
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 glass border-b border-border px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 rounded-lg hover:bg-surface-hover transition-colors">
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </Link>
            <h1 className="text-2xl font-semibold">Settings</h1>
          </div>
        </header>

        <div className="p-8 max-w-3xl">
          {/* Profile Section */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-zinc-400" />
              Profile
            </h2>
            <div className="bg-surface rounded-2xl border border-border p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-accent-gradient flex items-center justify-center text-white text-2xl font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-lg">{user.name}</p>
                  <p className="text-zinc-500">{user.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-500 mb-1">Name</label>
                  <input
                    type="text"
                    defaultValue={user.name}
                    className="w-full px-4 py-2 bg-background border border-border rounded-xl text-sm"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-500 mb-1">Email</label>
                  <input
                    type="email"
                    defaultValue={user.email}
                    className="w-full px-4 py-2 bg-background border border-border rounded-xl text-sm"
                    disabled
                  />
                </div>
              </div>
              <p className="mt-4 text-xs text-zinc-500">
                Profile is managed through auth.jdms.nl
              </p>
            </div>
          </section>

          {/* Subscription Section */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-zinc-400" />
              Subscription
            </h2>
            <div className="bg-surface rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="font-semibold text-lg">{planDetails.name} Plan</p>
                  <p className="text-zinc-500">
                    {planDetails.price === 0 ? 'Free forever' : `$${planDetails.price}/month`}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentPlan === 'business'
                    ? 'bg-purple-500/10 text-purple-400'
                    : currentPlan === 'pro'
                    ? 'bg-blue-500/10 text-blue-400'
                    : currentPlan === 'starter'
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-zinc-500/10 text-zinc-400'
                }`}>
                  {dbUser?.subscriptionStatus === 'active' ? 'Active' : 'Current Plan'}
                </span>
              </div>

              <div className="mb-6">
                <p className="text-sm text-zinc-400 mb-3">Plan includes:</p>
                <ul className="space-y-2">
                  {planDetails.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {currentPlan === 'free' ? (
                <Link
                  href="/pricing"
                  className="block w-full py-3 bg-accent-gradient rounded-xl text-white font-medium text-center hover:opacity-90 transition-opacity"
                >
                  Upgrade Plan
                </Link>
              ) : (
                <button className="w-full py-3 bg-surface-hover rounded-xl font-medium text-sm hover:bg-zinc-700 transition-colors">
                  Manage Subscription
                </button>
              )}
            </div>
          </section>

          {/* Notifications Section */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-zinc-400" />
              Notifications
            </h2>
            <div className="bg-surface rounded-2xl border border-border p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Alerts</p>
                    <p className="text-sm text-zinc-500">Get notified when changes are detected</p>
                  </div>
                  <button className="w-12 h-6 bg-accent rounded-full relative">
                    <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Digest</p>
                    <p className="text-sm text-zinc-500">Summary of all changes each week</p>
                  </div>
                  <button className="w-12 h-6 bg-zinc-700 rounded-full relative">
                    <span className="absolute left-1 top-1 w-4 h-4 bg-zinc-400 rounded-full" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Major Changes Only</p>
                    <p className="text-sm text-zinc-500">Only notify for significant changes</p>
                  </div>
                  <button className="w-12 h-6 bg-zinc-700 rounded-full relative">
                    <span className="absolute left-1 top-1 w-4 h-4 bg-zinc-400 rounded-full" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-400">
              <Shield className="w-5 h-5" />
              Danger Zone
            </h2>
            <div className="bg-surface rounded-2xl border border-red-500/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm text-zinc-500">Permanently delete your account and all data</p>
                </div>
                <button className="px-4 py-2 bg-red-500/10 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
