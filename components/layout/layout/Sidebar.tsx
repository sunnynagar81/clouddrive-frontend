'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  Cloud, HardDrive, Star, Clock, Trash2, LogOut,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'My Drive', icon: HardDrive },
  { href: '/dashboard/recent', label: 'Recent', icon: Clock },
  { href: '/dashboard/starred', label: 'Starred', icon: Star },
  { href: '/dashboard/trash', label: 'Trash', icon: Trash2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-slate-100 flex flex-col z-20">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100">
        <div className="bg-blue-600 p-1.5 rounded-lg">
          <Cloud className="text-white w-5 h-5" />
        </div>
        <span className="text-lg font-bold text-slate-800">CloudDrive</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              pathname === href
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="text-slate-400 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}