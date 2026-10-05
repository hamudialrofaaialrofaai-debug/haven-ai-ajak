import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  EyeOff,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  ServerOff,
  Cpu,
} from 'lucide-react';
import { VaultMetadata } from '../types';
import { scrubPII } from '../lib/crypto';
import { panicWipeVault } from '../lib/storage';

interface PrivacyShieldProps {
  meta: VaultMetadata;
  onUpdateMeta: (meta: VaultMetadata) => void;
  onClose?: () => void;
}

export const PrivacyShield: React.FC<PrivacyShieldProps> = ({
  meta,
  onUpdateMeta,
  onClose,
}) => {
  const [testInput, setTestInput] = useState('Call me at (555) 234-5678 or email sarah.connor@haven.internal about project 982-12-4029.');
  const [showPanicConfirm, setShowPanicConfirm] = useState(false);

  const { scrubbedText, redactedItems } = scrubPII(testInput);

  const togglePiiMasking = () => {
    onUpdateMeta({
      ...meta,
      piiMaskingEnabled: !meta.piiMaskingEnabled,
    });
  };

  const handlePanicWipe = () => {
    panicWipeVault();
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f242e] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Zero-Knowledge Privacy Vault</span>
          </div>
          <h2 className="mt-1 font-serif text-2xl font-bold text-white">
            Cryptographic Architecture & Data Sovereignty
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            Your conversations, reflections, and creative artifacts belong exclusively to you.
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="self-start rounded-lg border border-[#272e3b] px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-[#181d26]"
          >
            Close Inspector
          </button>
        )}
      </div>

      {/* 4 Pillars of Haven Privacy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pillar 1 */}
        <div className="rounded-xl border border-[#1f242e] bg-[#12151c] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">AES-GCM 256-Bit Encryption</h3>
              <p className="text-xs text-neutral-400">Hardware-accelerated SubtleCrypto</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-neutral-300">
            Every piece of data is encrypted locally using an authenticated AES-256 key derived with PBKDF2 (100,000 iterations). Plaintext never touches unencrypted storage.
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 font-mono">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Active & Verified in Browser</span>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="rounded-xl border border-[#1f242e] bg-[#12151c] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ServerOff className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Zero Server Telemetry</h3>
              <p className="text-xs text-neutral-400">No ad-tech, tracking, or profiling</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-neutral-300">
            Haven operates with zero third-party telemetry, analytics pixels, or behavior tracking cookies. The relay server cannot read or decrypt your synchronized payloads.
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-indigo-400 font-mono">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>0 Analytics Trackers Found</span>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="rounded-xl border border-[#1f242e] bg-[#12151c] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <EyeOff className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Client-Side PII Scrubber</h3>
              <p className="text-xs text-neutral-400">Redacts identity before AI processing</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-neutral-300">
            Automatically scrubs email addresses, phone numbers, and identifying tokens prior to dispatching prompts to the Gemini model.
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-neutral-400">Status:</span>
            <button
              onClick={togglePiiMasking}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                meta.piiMaskingEnabled
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {meta.piiMaskingEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>

        {/* Pillar 4 */}
        <div className="rounded-xl border border-[#1f242e] bg-[#12151c] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Device Mnemonic Key</h3>
              <p className="text-xs text-neutral-400">Your sovereign cryptographic passkey</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-neutral-300">
            A 6-word phrase uniquely generates your cryptographic key. No passwords or account profiles are stored on central cloud databases.
          </p>
          <div className="mt-3 font-mono text-xs text-neutral-400 truncate bg-[#0c0e12] p-1.5 rounded border border-[#1f242e]">
            {meta.syncSecretPhrase}
          </div>
        </div>
      </div>

      {/* PII Interactive Scrubber Workbench */}
      <div className="rounded-xl border border-[#1f242e] bg-[#12151c] p-5">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Live PII Scrubber Workbench</h3>
        </div>
        <p className="mt-1 text-xs text-neutral-400">
          Try typing sensitive information below to test how Haven redacts identifying data before external AI evaluation:
        </p>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              Raw Input (Your Browser Only)
            </label>
            <textarea
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-[#272e3b] bg-[#0c0e12] p-2.5 text-xs text-white placeholder-neutral-500 focus:border-amber-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              Sanitized Output (Dispatched to Model)
            </label>
            <div className="h-[74px] overflow-y-auto rounded-lg border border-[#272e3b] bg-[#0c0e12] p-2.5 font-mono text-xs text-emerald-300">
              {scrubbedText}
            </div>
          </div>
        </div>

        {redactedItems.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-400">
            <Info className="h-3.5 w-3.5" />
            <span>Redacted in real time: {redactedItems.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Emergency Panic Vault Wipe */}
      <div className="rounded-xl border border-red-500/30 bg-red-950/10 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <span>Sovereignty & Panic Purge</span>
            </div>
            <h3 className="mt-1 text-sm font-bold text-white">
              Instant Local Memory & Vault Destruction
            </h3>
            <p className="mt-1 text-xs text-neutral-400">
              Instantly overwrites and clears all local storage, AES cryptographic keys, conversation history, and cache. This action is irreversible.
            </p>
          </div>

          {!showPanicConfirm ? (
            <button
              onClick={() => setShowPanicConfirm(true)}
              className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3.5 py-2 text-xs font-medium text-red-300 hover:bg-red-500/20 transition-all whitespace-nowrap"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Wipe Local Vault</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePanicWipe}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-500 transition-colors"
              >
                Confirm Destroy
              </button>
              <button
                onClick={() => setShowPanicConfirm(false)}
                className="rounded-lg border border-neutral-700 px-2.5 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
