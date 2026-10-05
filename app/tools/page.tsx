import React, { useState } from 'react';
import { HavenLogo } from '../../components/HavenLogo';
import {
  Download,
  Volume2,
  KeyRound,
  Sparkles,
  Play,
  Check,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

export default function ToolsPage() {
  // Cobalt Downloader state
  const [downloadUrl, setDownloadUrl] = useState('');
  const [videoQuality, setVideoQuality] = useState('1080');
  const [downloadMode, setDownloadMode] = useState<'auto' | 'audio'>('auto');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadResult, setDownloadResult] = useState<any>(null);

  // ElevenLabs Voice state
  const [voiceText, setVoiceText] = useState('Welcome to Haven. All neural tools are active, unmetered, and encrypted.');
  const [selectedVoice, setSelectedVoice] = useState('Rachel');
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Secret code state
  const [secretCode, setSecretCode] = useState('');
  const [secretStatus, setSecretStatus] = useState<string | null>(null);
  const [secretUnlocked, setSecretUnlocked] = useState(false);

  // Handle Cobalt Media Download
  const handleCobaltDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!downloadUrl.trim() || isDownloading) return;

    setIsDownloading(true);
    setDownloadResult(null);

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: downloadUrl.trim(),
          videoQuality,
          downloadMode,
        }),
      });

      const data = await res.json();
      setDownloadResult(data);
    } catch (err: any) {
      setDownloadResult({ error: err.message || 'Download error' });
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle ElevenLabs Voice Generation
  const handleVoiceGen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceText.trim() || isGeneratingVoice) return;

    setIsGeneratingVoice(true);
    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: voiceText.trim(),
          voice: selectedVoice,
        }),
      });

      const data = await res.json();
      if (data.audio) {
        const url = `data:${data.mimeType || 'audio/wav'};base64,${data.audio}`;
        setAudioUrl(url);
        new Audio(url).play();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  // Handle Secret Code Check: Alpha@091904
  const handleCheckSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretCode.trim()) return;

    try {
      const res = await fetch('/api/check-secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: secretCode.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        setSecretStatus(data.message);
        setSecretUnlocked(true);
        localStorage.setItem('haven_vip_secret', secretCode.trim());
      } else {
        setSecretStatus(data.error || 'Access Denied: Invalid Key');
        setSecretUnlocked(false);
      }
    } catch (err: any) {
      setSecretStatus('Network validation error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222836] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Cpu className="h-4 w-4" />
            <span>Power Utilities Suite</span>
          </div>
          <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-white">
            Specialized Tool Suite
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            Cobalt Universal Media Downloader, ElevenLabs Neural Voice Studio, and Secret Code Terminal.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tool 1: Cobalt Universal Downloader */}
        <div className="rounded-2xl border border-[#222836] bg-[#121620] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Cobalt Media Downloader</h3>
                <p className="text-[11px] text-neutral-400">YouTube, Twitter, TikTok, Reddit, Instagram</p>
              </div>
            </div>
            <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[10px] font-mono text-sky-300 border border-sky-500/20">
              Cobalt 10 API
            </span>
          </div>

          <form onSubmit={handleCobaltDownload} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-neutral-300">Media URL</label>
              <input
                type="url"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or https://x.com/..."
                className="mt-1 w-full rounded-xl border border-[#272e3b] bg-[#0c0e14] px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-sky-500/50 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-400">Quality</label>
                <select
                  value={videoQuality}
                  onChange={(e) => setVideoQuality(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#272e3b] bg-[#0c0e14] px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="1080">1080p Full HD</option>
                  <option value="720">720p HD</option>
                  <option value="1440">1440p 2K</option>
                  <option value="2160">2160p 4K Ultra</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-400">Mode</label>
                <select
                  value={downloadMode}
                  onChange={(e) => setDownloadMode(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-[#272e3b] bg-[#0c0e14] px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="auto">Video & Audio</option>
                  <option value="audio">Audio Only (MP3)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isDownloading || !downloadUrl.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-500 py-2.5 text-xs font-bold text-neutral-950 hover:bg-sky-400 transition-colors disabled:opacity-50"
            >
              <Download className={`h-4 w-4 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>{isDownloading ? 'Processing Stream via Cobalt...' : 'Fetch Media Stream'}</span>
            </button>
          </form>

          {downloadResult && (
            <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Stream Ready:</span>
                <span className="font-mono text-[10px] text-sky-400">{downloadResult.provider}</span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                {downloadResult.notice || 'Direct media link generated successfully.'}
              </p>
              {downloadResult.downloadUrl && (
                <a
                  href={downloadResult.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-neutral-950 hover:bg-sky-400 transition-colors"
                >
                  <span>Open & Save Stream</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Tool 2: ElevenLabs Neural Voice Studio */}
        <div className="rounded-2xl border border-[#222836] bg-[#121620] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Volume2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">ElevenLabs Neural Voice</h3>
                <p className="text-[11px] text-neutral-400">High-fidelity studio speech synthesis</p>
              </div>
            </div>
            <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono text-amber-300 border border-amber-500/20">
              Turbo 2.5
            </span>
          </div>

          <form onSubmit={handleVoiceGen} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-neutral-300">Spoken Text</label>
              <textarea
                value={voiceText}
                onChange={(e) => setVoiceText(e.target.value)}
                rows={3}
                placeholder="Enter text to synthesize with human cadence..."
                className="mt-1 w-full rounded-xl border border-[#272e3b] bg-[#0c0e14] p-3 text-xs text-white placeholder-neutral-500 focus:border-amber-500/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-400">Neural Persona</label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {['Rachel', 'Adam', 'Bella', 'Antoni', 'Kore', 'Fenrir'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSelectedVoice(v)}
                    className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                      selectedVoice === v
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-[#0c0e14] text-neutral-400 border border-[#272e3b] hover:text-white'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isGeneratingVoice || !voiceText.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-neutral-950 hover:bg-amber-400 transition-colors disabled:opacity-50"
            >
              <Volume2 className={`h-4 w-4 ${isGeneratingVoice ? 'animate-pulse' : ''}`} />
              <span>{isGeneratingVoice ? 'Synthesizing Neural Speech...' : `Speak as ${selectedVoice}`}</span>
            </button>
          </form>

          {audioUrl && (
            <div className="mt-3 flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-950/20 p-3">
              <span className="text-xs text-amber-300 font-mono">Audio waveform ready (24kHz WAV)</span>
              <button
                onClick={() => new Audio(audioUrl).play()}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1 text-xs font-bold text-neutral-950 hover:bg-amber-400"
              >
                <Play className="h-3 w-3 fill-current" />
                <span>Replay</span>
              </button>
            </div>
          )}
        </div>

        {/* Tool 3: SECRET CODE Alpha@091904 Terminal */}
        <div className="lg:col-span-2 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-[#181510] via-[#121620] to-[#0f1218] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Secret Creator Access Terminal
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-mono text-amber-300 border border-amber-500/30">
                    SECRET CODE: Alpha@091904
                  </span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Authenticate using the sovereign secret master key to unlock Alpha VIP status, unlimited tokens, and unmetered engine capabilities.
                </p>
              </div>
            </div>

            {secretUnlocked && (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
                <ShieldCheck className="h-4 w-4" />
                <span>VIP Active</span>
              </span>
            )}
          </div>

          <form onSubmit={handleCheckSecret} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="text"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              placeholder="Enter SECRET CODE (e.g. Alpha@091904)..."
              className="flex-1 rounded-xl border border-amber-500/30 bg-[#0c0e14] px-4 py-2.5 font-mono text-xs text-amber-300 placeholder-neutral-600 focus:border-amber-400 focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-neutral-950 hover:bg-amber-400 transition-colors shadow-md whitespace-nowrap"
            >
              <KeyRound className="h-4 w-4" />
              <span>Verify & Unlock VIP</span>
            </button>
          </form>

          {secretStatus && (
            <div
              className={`rounded-xl p-3 text-xs flex items-center gap-2 font-mono ${
                secretUnlocked
                  ? 'border border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                  : 'border border-red-500/30 bg-red-950/20 text-red-300'
              }`}
            >
              {secretUnlocked ? <Check className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span>{secretStatus}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
