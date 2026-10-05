import React from 'react';
import { HavenLogo } from '../../components/HavenLogo';
import {
  MessageSquare,
  Box,
  Clapperboard,
  FolderArchive,
  Wrench,
  Activity,
  User,
  ShieldCheck,
  RefreshCw,
  KeyRound,
  CalendarCheck2,
  GitBranch,
} from 'lucide-react';

export type NavPage = 'chat' | 'create' | 'movies' | 'planner' | 'library' | 'tools' | 'evolution' | 'cockpit' | 'profile' | 'vault';

interface NavigationProps {
  activePage: NavPage;
  setActivePage: (page: NavPage) => void;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  onOpenSync: () => void;
  onOpenPrivacy: () => void;
  isVIP: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activePage,
  setActivePage,
  syncStatus,
  onOpenSync,
  onOpenPrivacy,
  isVIP,
}) => {
  const navItems: { id: NavPage; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'chat', label: 'Chat', icon: <MessageSquare className="h-4 w-4 text-amber-400" /> },
    { id: 'create', label: 'Create 3D', icon: <Box className="h-4 w-4 text-emerald-400" /> },
    { id: 'movies', label: 'Movies', icon: <Clapperboard className="h-4 w-4 text-sky-400" /> },
    { id: 'planner', label: 'Planner', icon: <CalendarCheck2 className="h-4 w-4 text-emerald-400" /> },
    { id: 'library', label: 'Library', icon: <FolderArchive className="h-4 w-4 text-indigo-400" /> },
    { id: 'tools', label: 'Tools', icon: <Wrench className="h-4 w-4 text-amber-300" /> },
    { id: 'evolution', label: 'Evolution', icon: <GitBranch className="h-4 w-4 text-teal-400" /> },
    { id: 'cockpit', label: 'Cockpit', icon: <Activity className="h-4 w-4 text-rose-400" /> },
    { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4 text-neutral-300" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1f242e] bg-[#0c0e14]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark with Gold H Gem */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePage('chat')}
            className="flex items-center gap-2.5 focus:outline-none group text-left"
          >
            <HavenLogo size={34} />
            <span className="font-serif text-xl font-bold tracking-tight text-white group-hover:text-amber-200 transition-colors">
              Haven
            </span>
          </button>
        </div>

        {/* Zone 2: 4-7 clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activePage === item.id
                  ? 'bg-[#181d28] text-white shadow-inner font-semibold'
                  : 'text-neutral-400 hover:bg-[#131720] hover:text-neutral-200'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isVIP && (
            <button
              onClick={() => setActivePage('profile')}
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-xs font-mono font-medium text-amber-300"
              title="Secret Code Alpha@091904 Active"
            >
              <KeyRound className="h-3.5 w-3.5 text-amber-400" />
              <span>Alpha VIP</span>
            </button>
          )}

          <button
            onClick={onOpenPrivacy}
            className="flex items-center gap-1.5 rounded-lg border border-[#272e3b] bg-[#141820] px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:border-emerald-500/40 hover:bg-[#181d26] transition-all"
            title="E2EE Vault Status"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">AES-256</span>
          </button>

          <button
            onClick={onOpenSync}
            className="flex items-center gap-1.5 rounded-lg border border-[#272e3b] bg-[#141820] px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:border-amber-500/40 hover:bg-[#181d26] transition-all"
            title="Cross-Device Mesh Sync"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-amber-400 ${
                syncStatus === 'syncing' ? 'animate-spin' : ''
              }`}
            />
            <span className="hidden sm:inline">Sync</span>
          </button>
        </div>
      </div>

      {/* Responsive Navigation for tablets & mobile */}
      <div className="flex lg:hidden border-t border-[#1a1e28] bg-[#0d1016] px-2 py-1.5 overflow-x-auto gap-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium ${
              activePage === item.id ? 'bg-[#1f2533] text-white' : 'text-neutral-400'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
};
