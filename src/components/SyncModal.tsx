import React, { useState } from 'react';
import {
  RefreshCw,
  Copy,
  Check,
  Smartphone,
  Laptop,
  Tablet,
  Download,
  Upload,
  ArrowRight,
  ShieldCheck,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { VaultMetadata, FullEncryptedPayload } from '../types';
import { pushSyncToRelay, pullSyncFromRelay } from '../lib/sync';
import syncDevicesImg from '../assets/images/haven_sync_devices_1791075235561.jpg';

interface SyncModalProps {
  meta: VaultMetadata;
  payload: FullEncryptedPayload;
  onUpdateMeta: (meta: VaultMetadata) => void;
  onUpdatePayload: (payload: FullEncryptedPayload) => void;
  onClose?: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  meta,
  payload,
  onUpdateMeta,
  onUpdatePayload,
  onClose,
}) => {
  const [copiedPhrase, setCopiedPhrase] = useState(false);
  const [copiedSyncId, setCopiedSyncId] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // Pair existing device input state
  const [joinSyncId, setJoinSyncId] = useState('');
  const [joinSecretPhrase, setJoinSecretPhrase] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'pair' | 'backup'>('current');

  const handleCopyPhrase = () => {
    navigator.clipboard.writeText(meta.syncSecretPhrase);
    setCopiedPhrase(true);
    setTimeout(() => setCopiedPhrase(false), 2000);
  };

  const handleCopySyncId = () => {
    navigator.clipboard.writeText(meta.syncId);
    setCopiedSyncId(true);
    setTimeout(() => setCopiedSyncId(false), 2000);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);
    try {
      const result = await pushSyncToRelay(meta, payload);
      if (result.success) {
        setSyncStatusMsg(`Successfully synced with relay. Devices connected: ${result.devices.length || 1}`);
        onUpdateMeta({
          ...meta,
          lastSyncedAt: result.updatedAt,
        });
      } else {
        setSyncStatusMsg(result.error || 'Sync relay push failed.');
      }
    } catch (err: any) {
      setSyncStatusMsg(err?.message || 'Sync failed.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleJoinSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinSyncId.trim() || !joinSecretPhrase.trim()) {
      setJoinError('Both Sync ID and 6-word phrase are required.');
      return;
    }

    setIsJoining(true);
    setJoinError(null);

    try {
      const res = await pullSyncFromRelay(joinSyncId.trim(), joinSecretPhrase.trim());
      if (res.success && res.payload) {
        onUpdatePayload(res.payload);
        onUpdateMeta({
          ...meta,
          syncId: joinSyncId.trim(),
          syncSecretPhrase: joinSecretPhrase.trim(),
          lastSyncedAt: res.updatedAt || Date.now(),
        });
        setSyncStatusMsg('Device successfully linked! State synchronized.');
        setActiveTab('current');
      } else {
        setJoinError(res.error || 'Failed to decrypt remote sync state.');
      }
    } catch (err: any) {
      setJoinError(err?.message || 'Sync link failed.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      meta: {
        syncId: meta.syncId,
        keySalt: meta.keySalt,
        createdAt: Date.now(),
      },
      payload,
    }, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `haven-vault-backup-${new Date().toISOString().split('T')[0]}.json`);
    dlAnchorElem.click();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.payload && json.payload.conversations) {
          onUpdatePayload(json.payload);
          setSyncStatusMsg('Backup restored successfully!');
        } else {
          setSyncStatusMsg('Invalid backup file format.');
        }
      } catch (err) {
        setSyncStatusMsg('Error parsing backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Device Ecosystem Photography */}
      <div className="relative overflow-hidden rounded-2xl border border-[#1f242e] bg-[#12151c]">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="p-6 md:col-span-2 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              <span>Zero-Knowledge Relay</span>
            </div>
            <h2 className="mt-1 font-serif text-2xl font-bold text-white">
              End-to-End Encrypted Device Mesh
            </h2>
            <p className="mt-2 text-sm text-neutral-300 leading-relaxed">
              Haven synchronizes your conversations, creative notes, and daily compass across your phone, tablet, and desktop without storing plaintext on any server.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-neutral-950 hover:bg-amber-400 transition-colors shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Synchronizing...' : 'Sync All Changes Now'}</span>
              </button>
              {meta.lastSyncedAt && (
                <span className="text-xs text-neutral-400">
                  Last synced: {new Date(meta.lastSyncedAt).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          <div className="relative hidden md:block h-full min-h-[160px]">
            <img
              src={syncDevicesImg}
              alt="Haven cross-device synchronization"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover opacity-80"
              onError={(e) => {
                // Graceful fallback
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#12151c] via-transparent to-transparent" />
          </div>
        </div>
      </div>

      {syncStatusMsg && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-300 flex items-center justify-between">
          <span>{syncStatusMsg}</span>
          <button onClick={() => setSyncStatusMsg(null)} className="text-amber-400 hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* Segmented Tab Controls */}
      <div className="flex border-b border-[#1f242e] gap-4">
        <button
          onClick={() => setActiveTab('current')}
          className={`pb-3 text-xs font-semibold transition-colors border-b-2 ${
            activeTab === 'current'
              ? 'border-amber-400 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Active Device & Sync Key
        </button>
        <button
          onClick={() => setActiveTab('pair')}
          className={`pb-3 text-xs font-semibold transition-colors border-b-2 ${
            activeTab === 'pair'
              ? 'border-amber-400 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Link Another Device
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`pb-3 text-xs font-semibold transition-colors border-b-2 ${
            activeTab === 'backup'
              ? 'border-amber-400 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Offline Encrypted Backup
        </button>
      </div>

      {/* Tab 1: Current Device & Credentials */}
      {activeTab === 'current' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#1f242e] bg-[#12151c] p-5">
            <h3 className="text-sm font-semibold text-white">Your Sovereign Sync Credentials</h3>
            <p className="mt-1 text-xs text-neutral-400">
              To mirror your assistant on an iPhone, iPad, or another computer, simply enter this Sync ID and 6-word phrase on the other device.
            </p>

            <div className="mt-4 space-y-3">
              {/* Sync Room ID */}
              <div>
                <label className="text-xs font-medium text-neutral-400">Sync Room ID</label>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex-1 rounded-lg border border-[#272e3b] bg-[#0c0e12] px-3 py-2 font-mono text-xs text-neutral-200">
                    {meta.syncId}
                  </div>
                  <button
                    onClick={handleCopySyncId}
                    className="flex items-center gap-1.5 rounded-lg border border-[#272e3b] bg-[#141820] px-3 py-2 text-xs font-medium text-neutral-300 hover:bg-[#1c222e] transition-colors"
                  >
                    {copiedSyncId ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedSyncId ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* 6-Word Sync Phrase */}
              <div>
                <label className="text-xs font-medium text-neutral-400">6-Word Private Sync Phrase</label>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex-1 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 font-mono text-xs text-amber-300 tracking-wider">
                    {meta.syncSecretPhrase}
                  </div>
                  <button
                    onClick={handleCopyPhrase}
                    className="flex items-center gap-1.5 rounded-lg border border-[#272e3b] bg-[#141820] px-3 py-2 text-xs font-medium text-neutral-300 hover:bg-[#1c222e] transition-colors"
                  >
                    {copiedPhrase ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedPhrase ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-neutral-500">
                  Treat this phrase like a master key. Anyone with this phrase and your Sync ID can decrypt your mirrored vault.
                </p>
              </div>
            </div>
          </div>

          {/* Connected Devices List */}
          <div className="rounded-xl border border-[#1f242e] bg-[#12151c] p-5">
            <h3 className="text-sm font-semibold text-white">Linked Device Mesh</h3>
            <div className="mt-3 divide-y divide-[#1f242e]">
              {meta.devices.map((device) => (
                <div key={device.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#181d26] text-neutral-300">
                      {device.platform.includes('Mobile') ? (
                        <Smartphone className="h-4 w-4 text-emerald-400" />
                      ) : device.platform.includes('Tablet') ? (
                        <Tablet className="h-4 w-4 text-sky-400" />
                      ) : (
                        <Laptop className="h-4 w-4 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-white">{device.name}</span>
                        {device.isCurrent && (
                          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                            This Device
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-neutral-500">
                        Last seen {new Date(device.lastSyncTime).toLocaleDateString()} at {new Date(device.lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-xs text-neutral-400">Connected</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Pair Another Device */}
      {activeTab === 'pair' && (
        <div className="rounded-xl border border-[#1f242e] bg-[#12151c] p-5">
          <h3 className="text-sm font-semibold text-white">Connect to Existing Haven Vault</h3>
          <p className="mt-1 text-xs text-neutral-400">
            If you already set up Haven on another device, paste its Sync ID and 6-word phrase below to synchronize all data here:
          </p>

          <form onSubmit={handleJoinSync} className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-neutral-300">Sync Room ID</label>
              <input
                type="text"
                value={joinSyncId}
                onChange={(e) => setJoinSyncId(e.target.value)}
                placeholder="e.g. haven-x92a4b8"
                className="mt-1 w-full rounded-lg border border-[#272e3b] bg-[#0c0e12] px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-amber-500/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300">6-Word Private Sync Phrase</label>
              <input
                type="text"
                value={joinSecretPhrase}
                onChange={(e) => setJoinSecretPhrase(e.target.value)}
                placeholder="e.g. radiant-beacon-canyon-clarity-ember-summit"
                className="mt-1 w-full rounded-lg border border-[#272e3b] bg-[#0c0e12] px-3 py-2 font-mono text-xs text-amber-300 placeholder-neutral-500 focus:border-amber-500/50 focus:outline-none"
              />
            </div>

            {joinError && (
              <p className="text-xs text-red-400">{joinError}</p>
            )}

            <button
              type="submit"
              disabled={isJoining}
              className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-neutral-950 hover:bg-amber-400 transition-colors disabled:opacity-50"
            >
              <span>{isJoining ? 'Verifying & Decrypting...' : 'Link & Decrypt Vault'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Offline Backup */}
      {activeTab === 'backup' && (
        <div className="rounded-xl border border-[#1f242e] bg-[#12151c] p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Manual Export / Air-Gapped Archival</h3>
            <p className="mt-1 text-xs text-neutral-400">
              Save a complete, offline JSON copy of your conversations, flashcards, creative sparks, and habits directly to your local file system.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleExportBackup}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[#272e3b] bg-[#0c0e12] p-6 hover:border-amber-500/40 hover:bg-[#141820] transition-all text-center group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                <Download className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-white">Export Vault (.JSON)</span>
              <span className="text-[11px] text-neutral-400">Download air-gapped file to disk</span>
            </button>

            <label className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[#272e3b] bg-[#0c0e12] p-6 hover:border-emerald-500/40 hover:bg-[#141820] transition-all text-center group cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                <Upload className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-white">Restore from Backup</span>
              <span className="text-[11px] text-neutral-400">Select a previously exported file</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
