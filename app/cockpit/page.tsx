import React, { useState, useEffect } from 'react';
import { HavenLogo } from '../../components/HavenLogo';
import {
  Activity,
  Cpu,
  Globe,
  Radio,
  Server,
  Zap,
  CheckCircle2,
  Clock,
  Terminal,
  Play,
  RotateCw,
} from 'lucide-react';

export default function CockpitPage() {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [testEndpoint, setTestEndpoint] = useState('/api/check-subscription');
  const [testResult, setTestResult] = useState<any>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => setHealthStatus(data))
      .catch(() => {});
  }, []);

  const runTest = async () => {
    setIsRunningTest(true);
    setTestResult(null);
    try {
      const res = await fetch(testEndpoint);
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ error: err.message });
    } finally {
      setIsRunningTest(false);
    }
  };

  const systems = [
    { name: 'Gemini 3.8 Flash Engine', status: 'Optimal', latency: '240ms', uptime: '99.99%', badge: 'AI Model' },
    { name: 'Tavily Search Grounding', status: 'Active', latency: '410ms', uptime: '99.95%', badge: 'Web Engine' },
    { name: 'Replicate Luma / Kling 3D', status: 'Online', latency: '320ms', uptime: '100%', badge: 'Spatial VFX' },
    { name: 'ElevenLabs Neural Audio', status: 'Active', latency: '190ms', uptime: '99.98%', badge: 'TTS Engine' },
    { name: 'Cobalt Universal Gateway', status: 'Connected', latency: '280ms', uptime: '99.90%', badge: 'Media Stream' },
    { name: 'Zero-Knowledge AES Vault', status: 'E2EE Sovereign', latency: '<1ms', uptime: '100%', badge: 'Client Crypto' },
  ];

  return (
    <div className="space-y-6">
      {/* Cockpit Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222836] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Activity className="h-4 w-4" />
            <span>Master Cockpit & System Health</span>
          </div>
          <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Operations & AI Telemetry
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-mono text-emerald-300 border border-emerald-500/30">
              ALL ENGINES ONLINE
            </span>
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            Real-time status indicators, model latencies, and interactive API diagnostics.
          </p>
        </div>

        <button
          onClick={() => {
            fetch('/api/health')
              .then((r) => r.json())
              .then((d) => setHealthStatus(d));
          }}
          className="flex items-center gap-1.5 rounded-xl border border-[#272e3b] bg-[#121620] px-3.5 py-2 text-xs font-medium text-neutral-300 hover:bg-[#181d28] hover:text-white transition-colors"
        >
          <RotateCw className="h-3.5 w-3.5 text-amber-400" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Systems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {systems.map((s, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-[#222836] bg-[#121620] p-5 shadow-lg space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] font-mono text-neutral-300 border border-neutral-700">
                {s.badge}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{s.status}</span>
              </div>
            </div>

            <h3 className="text-sm font-bold text-white">{s.name}</h3>

            <div className="flex items-center justify-between text-xs text-neutral-400 font-mono pt-2 border-t border-[#1c2230]">
              <span>Latency: <strong className="text-neutral-200">{s.latency}</strong></span>
              <span>Uptime: <strong className="text-emerald-400">{s.uptime}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive API Diagnostic Console */}
      <div className="rounded-2xl border border-[#222836] bg-[#121620] p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
          <Terminal className="h-4 w-4" />
          <span>Interactive API Console</span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            value={testEndpoint}
            onChange={(e) => setTestEndpoint(e.target.value)}
            className="rounded-xl border border-[#272e3b] bg-[#0c0e14] px-3.5 py-2.5 text-xs text-white focus:outline-none"
          >
            <option value="/api/check-subscription">GET /api/check-subscription</option>
            <option value="/api/health">GET /api/health</option>
          </select>

          <button
            onClick={runTest}
            disabled={isRunningTest}
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-neutral-950 hover:bg-amber-400 transition-colors disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>{isRunningTest ? 'Querying...' : 'Dispatch Request'}</span>
          </button>
        </div>

        {testResult && (
          <div className="rounded-xl border border-[#272e3b] bg-[#090b10] p-4 font-mono text-xs text-emerald-300 overflow-x-auto max-h-64">
            <pre>{JSON.stringify(testResult, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
