import React, { useState, useEffect } from 'react';
import { Navigation, NavPage } from './components/Navigation';
import ChatPage from '../app/chat/page';
import CreatePage from '../app/create/page';
import MoviesPage from '../app/movies/page';
import PlannerPage from '../app/planner/page';
import EvolutionPage from '../app/evolution/page';
import LibraryPage from '../app/library/page';
import ToolsPage from '../app/tools/page';
import CockpitPage from '../app/cockpit/page';
import ProfilePage from '../app/profile/page';
import { PrivacyShield } from './components/PrivacyShield';
import { SyncModal } from './components/SyncModal';
import {
  VaultMetadata,
  FullEncryptedPayload,
} from './types';
import {
  getOrCreateVaultMetadata,
  saveVaultMetadata,
  loadEncryptedVault,
  saveEncryptedVault,
} from './lib/storage';
import { pushSyncToRelay } from './lib/sync';
import { getCachedFirebaseUser } from './lib/firebase';
import { ShieldCheck, X } from 'lucide-react';

export default function App() {
  const [meta, setMeta] = useState<VaultMetadata | null>(null);
  const [payload, setPayload] = useState<FullEncryptedPayload | null>(null);
  const [isLoadingVault, setIsLoadingVault] = useState(true);

  // Active page routing
  const [activePage, setActivePage] = useState<NavPage>('chat');

  // Modals
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');

  // User VIP status
  const [isVIP, setIsVIP] = useState(true);

  // Synchronize with URL path on initial load if present (e.g., /chat, /create, /library, /tools, etc.)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace(/^\//, '');
      const validPages: NavPage[] = ['chat', 'create', 'movies', 'planner', 'library', 'tools', 'evolution', 'cockpit', 'profile', 'vault'];
      if (validPages.includes(path as NavPage)) {
        setActivePage(path as NavPage);
      }
    }
  }, []);

  // Update browser URL silently when page changes
  const handleNavigate = (page: NavPage) => {
    setActivePage(page);
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState(null, '', `/${page}`);
    }
  };

  // Initialize vault on mount
  useEffect(() => {
    async function init() {
      try {
        const metadata = getOrCreateVaultMetadata();
        setMeta(metadata);
        const data = await loadEncryptedVault(metadata);
        setPayload(data);

        // Check VIP status
        const user = getCachedFirebaseUser();
        setIsVIP(Boolean(user.isVIP));
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsLoadingVault(false);
      }
    }
    init();
  }, []);

  const updatePayloadAndPersist = async (newPayload: FullEncryptedPayload) => {
    setPayload(newPayload);
    if (meta) {
      await saveEncryptedVault(newPayload, meta);
      if (meta.autoSyncEnabled) {
        setSyncStatus('syncing');
        pushSyncToRelay(meta, newPayload)
          .then((res) => {
            if (res.success) setSyncStatus('synced');
            else setSyncStatus('offline');
          })
          .catch(() => setSyncStatus('offline'));
      }
    }
  };

  const handleUpdateMeta = (newMeta: VaultMetadata) => {
    setMeta(newMeta);
    saveVaultMetadata(newMeta);
  };

  if (isLoadingVault || !meta || !payload) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0c0e14] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <ShieldCheck className="h-6 w-6 animate-pulse" />
          </div>
          <span className="font-serif text-sm tracking-wide text-neutral-300">
            Initializing Sovereign Haven Vault...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#e1e4ea] flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">
      {/* Top Header Navigation */}
      <Navigation
        activePage={activePage}
        setActivePage={handleNavigate}
        syncStatus={syncStatus}
        onOpenSync={() => setShowSyncModal(true)}
        onOpenPrivacy={() => setShowPrivacyModal(true)}
        isVIP={isVIP}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activePage === 'chat' && <ChatPage />}
        {activePage === 'create' && <CreatePage />}
        {activePage === 'movies' && <MoviesPage />}
        {activePage === 'planner' && <PlannerPage />}
        {activePage === 'library' && <LibraryPage />}
        {activePage === 'tools' && <ToolsPage />}
        {activePage === 'evolution' && <EvolutionPage />}
        {activePage === 'cockpit' && <CockpitPage />}
        {activePage === 'profile' && <ProfilePage />}
        {activePage === 'vault' && (
          <PrivacyShield meta={meta} onUpdateMeta={handleUpdateMeta} />
        )}
      </main>

      {/* Privacy Shield Inspector Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl border border-[#222836] bg-[#0e1118] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-neutral-400 hover:bg-[#1a1f2b] hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <PrivacyShield
              meta={meta}
              onUpdateMeta={handleUpdateMeta}
              onClose={() => setShowPrivacyModal(false)}
            />
          </div>
        </div>
      )}

      {/* Cross-Device Mesh Sync Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-[#222836] bg-[#0e1118] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowSyncModal(false)}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-neutral-400 hover:bg-[#1a1f2b] hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <SyncModal
              meta={meta}
              payload={payload}
              onUpdateMeta={handleUpdateMeta}
              onUpdatePayload={updatePayloadAndPersist}
              onClose={() => setShowSyncModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
