import React, { useState, useEffect } from 'react';
import { HavenLogo } from '../../components/HavenLogo';
import {
  Sparkles,
  GitBranch,
  Cpu,
  Layers,
  Send,
  CheckCircle,
  Lightbulb,
  ShieldCheck,
  RefreshCw,
  Zap,
  Globe2,
} from 'lucide-react';

export default function EvolutionPage() {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [feedbackCategory, setFeedbackCategory] = useState<'idea' | 'feature' | 'model_accuracy' | 'bug'>('idea');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/system-status')
      .then((res) => res.json())
      .then((data) => setSystemStatus(data))
      .catch((err) => console.error(err));
  }, []);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: feedbackCategory,
          message: feedbackMessage.trim(),
          userEmail: userEmail.trim() || undefined,
        }),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setFeedbackMessage('');
        setTimeout(() => setSubmitSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222836] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <GitBranch className="h-4 w-4" />
            <span>Continuous Improvement & Architecture</span>
          </div>
          <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Haven Evolution & Updates
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-mono text-emerald-300 border border-emerald-500/30">
              v2.4.0 Sovereign Live
            </span>
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            Architected by Dr. Ajak Alrofaai Aling with modular pipelines engineered for continuous model adaptation.
          </p>
        </div>
      </div>

      {/* Model & Infrastructure Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {systemStatus?.activeModels?.map((model: any, idx: number) => (
          <div
            key={idx}
            className="rounded-2xl border border-[#222836] bg-[#121620] p-5 shadow-lg flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-amber-400" />
                {model.name}
              </span>
              <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                {model.status}
              </span>
            </div>
            <p className="text-xs text-neutral-300">{model.role}</p>
            <div className="pt-2 border-t border-[#1c2230] flex items-center justify-between text-[11px] text-neutral-500 font-mono">
              <span>Telemetry: Active</span>
              <span className="text-emerald-400">99.98% Latency Target</span>
            </div>
          </div>
        )) || (
          <div className="text-neutral-500 text-xs">Loading active engine cluster...</div>
        )}
      </div>

      {/* Architecture Flow Pipeline Diagram */}
      <div className="rounded-2xl border border-amber-500/30 bg-[#121620] p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#222836] pb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            <h3 className="font-serif text-lg font-bold text-white">Full-Stack Cloud Pipeline Architecture</h3>
          </div>
          <span className="rounded bg-emerald-500/20 px-2.5 py-0.5 text-xs font-mono text-emerald-300 border border-emerald-500/30">
            Pipeline Live
          </span>
        </div>

        <div className="flex flex-col items-center gap-3 py-2">
          {/* Step 1: Haven AI App */}
          <div className="w-full max-w-xl rounded-xl border border-amber-500/40 bg-[#141824] p-3 text-center shadow-md">
            <span className="font-mono text-xs font-bold text-amber-300">Haven AI App (Client Frontend)</span>
            <p className="text-[11px] text-neutral-400 mt-0.5">Vite SPA · Multimodal Voice & Vision UI · Zero-Knowledge AES Vault</p>
          </div>

          <div className="text-amber-400 text-sm font-mono animate-bounce">↓</div>

          {/* Step 2: Firebase Cloud Functions */}
          <div className="w-full max-w-xl rounded-xl border border-sky-500/40 bg-[#141824] p-3 text-center shadow-md">
            <span className="font-mono text-xs font-bold text-sky-300">Firebase Cloud Functions (Backend Orchestrator)</span>
            <p className="text-[11px] text-neutral-400 mt-0.5">Secure proxy routes, token verification & protected API gateway</p>
          </div>

          <div className="text-sky-400 text-sm font-mono animate-bounce">↓</div>

          {/* Step 3: Provider Triad */}
          <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="rounded-xl border border-emerald-500/40 bg-[#0d1017] p-3 text-center">
              <span className="font-mono text-[11px] font-bold text-emerald-300 block">OPENAI_API_KEY</span>
              <span className="text-[10px] text-neutral-400 mt-1 block">AI Chat Brain (GPT-4o & Reasoning)</span>
            </div>

            <div className="rounded-xl border border-purple-500/40 bg-[#0d1017] p-3 text-center">
              <span className="font-mono text-[11px] font-bold text-purple-300 block">REPLICATE_API_KEY</span>
              <span className="text-[10px] text-neutral-400 mt-1 block">AI Image & Video Gen (Flux / Luma)</span>
            </div>

            <div className="rounded-xl border border-amber-500/40 bg-[#0d1017] p-3 text-center">
              <span className="font-mono text-[11px] font-bold text-amber-300 block">Firebase API</span>
              <span className="text-[10px] text-neutral-400 mt-1 block">Authentication & Firestore DB</span>
            </div>
          </div>

          <div className="text-emerald-400 text-sm font-mono animate-bounce">↓</div>

          {/* Step 4: Response back to user */}
          <div className="w-full max-w-xl rounded-xl border border-emerald-500/40 bg-[#0d1017] p-3 text-center shadow-md">
            <span className="font-mono text-xs font-bold text-emerald-300">Response Back to User</span>
            <p className="text-[11px] text-neutral-400 mt-0.5">Real-time streamed answers, audio speech, 3D assets & verified sources</p>
          </div>
        </div>
      </div>

      {/* Feature Capabilities Grid */}
      <div className="rounded-2xl border border-[#222836] bg-[#121620] p-6 shadow-xl space-y-4">
        <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
          <Layers className="h-5 w-5 text-amber-400" />
          Enterprise & Sovereign Capabilities
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { title: 'Multimodal Vision & Files', desc: 'Analyzes documents, charts, PDFs, and high-res imagery.' },
            { title: 'Real-time Web Grounding', desc: 'Tavily Search API & Google Grounding with source citation cards.' },
            { title: 'Permission-Based AI Memories', desc: 'User maintains sovereign consent over what Haven learns.' },
            { title: 'Trilingual Mastery', desc: 'Fluent in English, Modern Standard Arabic, and authentic Sudanese Arabic.' },
            { title: 'Director-Grade 3D & Cinema', desc: 'Pixar 3D 9:16 scriptboards and TMDB entertainment discovery.' },
            { title: 'AES-GCM-256 Sovereign Vault', desc: 'Client-side zero-knowledge encryption with cloud relay sync.' },
          ].map((cap, i) => (
            <div key={i} className="rounded-xl border border-[#1e2433] bg-[#0d1017] p-3.5 space-y-1">
              <div className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                {cap.title}
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">{cap.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Suggestion & Continuous Feedback Form */}
      <div className="rounded-2xl border border-[#222836] bg-[#121620] p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-400" />
              Propose Future Features or Provide Model Feedback
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Haven AI evolves through community ideas and real user requests. Submissions directly inform the engineering backlog.
            </p>
          </div>
        </div>

        {submitSuccess && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-3 text-xs text-emerald-300">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span>Thank you! Your suggestion has been logged for Dr. Ajak Alrofaai Aling and the Haven engineering pipeline.</span>
          </div>
        )}

        <form onSubmit={handleSubmitFeedback} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-neutral-400">Feedback Category</label>
              <select
                value={feedbackCategory}
                onChange={(e) => setFeedbackCategory(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-[#272e3b] bg-[#0c0e14] p-3 text-xs text-white focus:outline-none"
              >
                <option value="idea">💡 New Feature or Tool Idea</option>
                <option value="model_accuracy">🎯 Model Accuracy / Language Nuance</option>
                <option value="feature">⚡ Productivity & Workflow Expansion</option>
                <option value="bug">🛠️ Performance or Bug Report</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-neutral-400">Your Email (Optional, for updates)</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="creator@haven.ai"
                className="mt-1 w-full rounded-xl border border-[#272e3b] bg-[#0c0e14] p-3 text-xs text-white placeholder-neutral-500 focus:border-amber-500/50 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-neutral-400">Your Suggestion or Detailed Observation</label>
            <textarea
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              rows={3}
              placeholder="Describe your feature idea, desired AI model upgrade, or specific language improvement..."
              className="mt-1 w-full rounded-xl border border-[#272e3b] bg-[#0c0e14] p-3 text-xs text-white placeholder-neutral-500 focus:border-amber-500/50 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!feedbackMessage.trim() || isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-neutral-950 hover:bg-amber-400 transition-colors shadow-md disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>{isSubmitting ? 'Transmitting...' : 'Submit to Engineering Roadmap'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
