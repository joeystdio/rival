'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Settings, 
  Plus,
  Target,
  ArrowLeft,
  Shield
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  userRole?: string;
}

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/competitors', label: 'Competitors', icon: Users },
  { href: '/timeline', label: 'Timeline', icon: Clock },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const isSuperAdmin = userRole === 'super_admin';

  return (
    <aside className="w-64 h-screen bg-surface border-r border-border flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-gradient flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold">Rival</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-accent/10 text-accent'
                      : 'text-zinc-400 hover:text-white hover:bg-surface-hover'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}

          {/* Admin Link - only for super admins */}
          {isSuperAdmin && (
            <li className="pt-4 mt-4 border-t border-border">
              <Link
                href="/admin"
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  pathname.startsWith('/admin')
                    ? 'bg-red-500/10 text-red-400'
                    : 'text-zinc-400 hover:text-red-400 hover:bg-red-500/10'
                )}
              >
                <Shield className="w-5 h-5" />
                Admin Panel
              </Link>
            </li>
          )}
        </ul>

        {/* Add Competitor Button */}
        <div className="mt-6 pt-6 border-t border-border">
          <Link
            href="/competitors/new"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-gradient text-white font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Add Competitor
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Link 
          href="https://auth.jdms.nl"
          className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </aside>
  );
}
