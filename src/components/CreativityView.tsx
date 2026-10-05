import React, { useState } from 'react';
import {
  Sparkles,
  Feather,
  BookOpen,
  Wand2,
  Bookmark,
  Share2,
  Copy,
  Check,
  Compass,
  ArrowRight,
  Flame,
  Plus,
} from 'lucide-react';
import { CreativeSpark, AppMode } from '../types';
import museImg from '../assets/images/haven_creative_muse_1791075245571.jpg';

interface CreativityViewProps {
  sparks: CreativeSpark[];
  onAddSpark: (spark: CreativeSpark) => void;
  onToggleSave: (sparkId: string) => void;
  onOpenInStudio: (prompt: string, mode: AppMode) => void;
}

export const CreativityView: React.FC<CreativityViewProps> = ({
  sparks,
  onAddSpark,
  onToggleSave,
  onOpenInStudio,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'story' | 'philosophy' | 'metaphor' | 'divergence'>('all');
  const [themeInput, setThemeInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredSparks = activeCategory === 'all'
    ? sparks
    : sparks.filter((s) => s.category === activeCategory);

  const handleGenerateSparks = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/assistant/sparks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: themeInput.trim() || 'sensory metaphors, human memory, and time' }),
      });
      const data = await res.json();
      if (data.text) {
        // Parse into a new spark
        const newSpark: CreativeSpark = {
          id: 'spark-' + Date.now(),
          title: themeInput ? `Explorations on ${themeInput}` : 'Spontaneous Muse Prompt',
          concept: data.text.slice(0, 300) + '...',
          twist: 'Examine through inversion: What happens if the premise is inverted?',
          category: 'divergence',
          createdAt: Date.now(),
          saved: true,
        };
        onAddSpark(newSpark);
        setThemeInput('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Editorial Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-[#1f242e] bg-[#12151c]">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="p-6 md:col-span-2 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>The Creative Muse</span>
            </div>
            <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-white">
              Cultivate Original Thought & Artistry
            </h2>
            <p className="mt-2 text-sm text-neutral-300 leading-relaxed max-w-xl">
              Break creative blocks, sculpt vivid metaphors, and explore divergent concepts with an AI companion dedicated to your private craft.
            </p>

            {/* Quick Inspiration Trigger */}
            <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-lg">
              <input
                type="text"
                value={themeInput}
                onChange={(e) => setThemeInput(e.target.value)}
                placeholder="Enter a premise (e.g. solitary lighthouse in deep space)..."
                className="flex-1 rounded-lg border border-[#272e3b] bg-[#0c0e12] px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-amber-500/50 focus:outline-none"
              />
              <button
                onClick={handleGenerateSparks}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-neutral-950 hover:bg-amber-400 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                <Wand2 className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Igniting...' : 'Spark Ideas'}</span>
              </button>
            </div>
          </div>

          <div className="relative hidden md:block h-full min-h-[180px]">
            <img
              src={museImg}
              alt="Haven creative sculpture"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover opacity-85"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#12151c] via-transparent to-transparent" />
          </div>
        </div>
      </div>

      {/* Creative Exploration Modes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() =>
            onOpenInStudio(
              'Act as my screenwriting partner. Help me build tension in a dialogue between two estranged archivists uncovering a sealed historical record.',
              'creativity'
            )
          }
          className="flex flex-col justify-between rounded-xl border border-[#1f242e] bg-[#12151c] p-4 text-left hover:border-amber-500/40 hover:bg-[#161a22] transition-all group"
        >
          <div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3 group-hover:scale-105 transition-transform">
              <Feather className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-semibold text-white">Narrative & Script Craft</h3>
            <p className="mt-1 text-[11px] text-neutral-400 leading-relaxed">
              Dialogue pacing, character arcs, dramatic irony, and worldbuilding lore.
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] text-amber-400 group-hover:translate-x-0.5 transition-transform">
            <span>Explore in Studio</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </button>

        <button
          onClick={() =>
            onOpenInStudio(
              'Give me 5 striking, visceral metaphors to describe cognitive fatigue without using cliché analogies like battery drain or darkness.',
              'creativity'
            )
          }
          className="flex flex-col justify-between rounded-xl border border-[#1f242e] bg-[#12151c] p-4 text-left hover:border-amber-500/40 hover:bg-[#161a22] transition-all group"
        >
          <div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3 group-hover:scale-105 transition-transform">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-semibold text-white">Metaphor & Poetry Forge</h3>
            <p className="mt-1 text-[11px] text-neutral-400 leading-relaxed">
              Sensory texture, lyrical phrasing, rhythmic cadence, and evocative imagery.
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] text-emerald-400 group-hover:translate-x-0.5 transition-transform">
            <span>Explore in Studio</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </button>

        <button
          onClick={() =>
            onOpenInStudio(
              'I am experiencing a creative block on how to start an essay about the loss of analog patience. Provide 3 completely unorthodox entry angles.',
              'creativity'
            )
          }
          className="flex flex-col justify-between rounded-xl border border-[#1f242e] bg-[#12151c] p-4 text-left hover:border-amber-500/40 hover:bg-[#161a22] transition-all group"
        >
          <div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3 group-hover:scale-105 transition-transform">
              <Flame className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-semibold text-white">Block Breaker</h3>
            <p className="mt-1 text-[11px] text-neutral-400 leading-relaxed">
              Oblique strategies, creative constraints, and radical perspective flips.
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] text-indigo-400 group-hover:translate-x-0.5 transition-transform">
            <span>Explore in Studio</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </button>

        <button
          onClick={() =>
            onOpenInStudio(
              'Run a lateral thinking exercise: take an everyday object (a wrist watch) and reinvent its purpose for a civilization that lives underwater.',
              'creativity'
            )
          }
          className="flex flex-col justify-between rounded-xl border border-[#1f242e] bg-[#12151c] p-4 text-left hover:border-amber-500/40 hover:bg-[#161a22] transition-all group"
        >
          <div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-3 group-hover:scale-105 transition-transform">
              <Compass className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-semibold text-white">Divergent Brainstorming</h3>
            <p className="mt-1 text-[11px] text-neutral-400 leading-relaxed">
              Counter-intuitive combinations, thought experiments, and speculative design.
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] text-sky-400 group-hover:translate-x-0.5 transition-transform">
            <span>Explore in Studio</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </button>
      </div>

      {/* Sparks Archive & Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f242e] pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">Idea Sparks Vault</h3>
            <span className="text-xs text-neutral-500 font-mono">({filteredSparks.length})</span>
          </div>

          {/* Clean Segmented Controls (no pill capsules) */}
          <div className="flex items-center gap-1 p-1 bg-[#12151c] rounded-lg border border-[#1f242e]">
            {(['all', 'story', 'philosophy', 'metaphor', 'divergence'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#1e2430] text-amber-300 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Sparks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredSparks.map((spark) => (
            <div
              key={spark.id}
              className="flex flex-col justify-between rounded-xl border border-[#1f242e] bg-[#12151c] p-4 hover:border-[#2f3747] transition-all"
            >
              <div>
                {/* Clean unboxed metadata with bullet separator */}
                <div className="flex items-center gap-2 text-[11px] text-neutral-400 capitalize">
                  <span>{spark.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{new Date(spark.createdAt).toLocaleDateString()}</span>
                </div>

                <h4 className="mt-2 text-sm font-semibold text-white leading-snug">
                  {spark.title}
                </h4>

                <p className="mt-2 text-xs text-neutral-300 leading-relaxed">
                  {spark.concept}
                </p>

                {spark.twist && (
                  <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2 text-[11px] text-amber-300/90 italic">
                    {spark.twist}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#1a1f29] flex items-center justify-between">
                <button
                  onClick={() =>
                    onOpenInStudio(
                      `Let's explore this creative spark in depth:\nTitle: ${spark.title}\nConcept: ${spark.concept}`,
                      'creativity'
                    )
                  }
                  className="flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <span>Develop in Studio</span>
                  <ArrowRight className="h-3 w-3" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(spark.id, `${spark.title}\n${spark.concept}\n${spark.twist}`)}
                    className="rounded p-1 text-neutral-400 hover:text-white hover:bg-[#1a1f29] transition-colors"
                    title="Copy concept"
                  >
                    {copiedId === spark.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => onToggleSave(spark.id)}
                    className={`rounded p-1 transition-colors ${
                      spark.saved ? 'text-amber-400' : 'text-neutral-500 hover:text-white'
                    }`}
                    title={spark.saved ? 'Bookmarked in vault' : 'Bookmark'}
                  >
                    <Bookmark className="h-3.5 w-3.5" fill={spark.saved ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
