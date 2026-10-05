import React, { useState, useEffect } from 'react';
import { HavenLogo } from '../../components/HavenLogo';
import {
  FolderArchive,
  Box,
  Volume2,
  Clapperboard,
  Globe,
  Trash2,
  Download,
  ExternalLink,
  Play,
  Check,
  Search,
} from 'lucide-react';

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<'all' | '3d' | 'voice' | 'cinema' | 'web'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Initial library collections
  const [items, setItems] = useState<any[]>([
    {
      id: 'lib-1',
      title: 'Haven Gold Obsidian Monolith',
      type: '3d',
      engine: 'Luma Dream Machine',
      details: '64,800 Polygons · Faceted Gem PBR Shader',
      date: '2026-10-04',
      badge: '3D Mesh',
    },
    {
      id: 'lib-2',
      title: 'First Principles on Distributed Systems',
      type: 'voice',
      engine: 'ElevenLabs Neural Turbo',
      details: '42s Audio Speech Synthesis · Voice: Kore',
      date: '2026-10-04',
      badge: 'Audio Voice',
    },
    {
      id: 'lib-3',
      title: 'The Cartographer of Extinct Frequencies',
      type: 'cinema',
      engine: 'Runway Gen-3 Alpha',
      details: 'Full Cinematic Scene Shotlist & Anamorphic Lighting',
      date: '2026-10-03',
      badge: 'Screenplay',
    },
    {
      id: 'lib-4',
      title: 'Quantum Entanglement & Superposition Citations',
      type: 'web',
      engine: 'Tavily + Gemini Grounding',
      details: '5 Verified Academic Sources with DOI references',
      date: '2026-10-02',
      badge: 'Grounded Web',
    },
  ]);

  // Load dynamically saved 3D assets from Create page
  useEffect(() => {
    try {
      const localAssets = JSON.parse(localStorage.getItem('haven_saved_3d_assets') || '[]');
      if (Array.isArray(localAssets) && localAssets.length > 0) {
        const mapped = localAssets.map((a: any) => ({
          id: a.id,
          title: a.title,
          type: '3d',
          engine: a.engine || 'Luma Dream Machine',
          details: `${a.polycount || '48,000 Polygons'} · Procedural Mesh`,
          date: new Date(a.createdAt).toISOString().split('T')[0],
          badge: '3D Mesh',
        }));
        setItems((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          const uniqueNew = mapped.filter((m: any) => !ids.has(m.id));
          return [...uniqueNew, ...prev];
        });
      }
    } catch {
      // ignore
    }
  }, []);

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const filteredItems = items
    .filter((i) => (activeTab === 'all' ? true : i.type === activeTab))
    .filter((i) =>
      searchQuery ? i.title.toLowerCase().includes(searchQuery.toLowerCase()) : true
    );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222836] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <FolderArchive className="h-4 w-4" />
            <span>Sovereign Storage Vault</span>
          </div>
          <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-white">
            Personal Creation Library
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            All your generated 3D meshes, neural audio, cinematic scripts, and verified web citations in one encrypted hub.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved creations..."
            className="w-full rounded-xl border border-[#272e3b] bg-[#121620] py-2 pl-3.5 pr-8 text-xs text-white placeholder-neutral-500 focus:border-amber-500/50 focus:outline-none"
          />
          <Search className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-neutral-500" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1f2533] pb-3 overflow-x-auto">
        {[
          { key: 'all', label: 'All Artifacts' },
          { key: '3d', label: '3D Meshes' },
          { key: 'voice', label: 'Neural Audio' },
          { key: 'cinema', label: 'Cinema Scripts' },
          { key: 'web', label: 'Web Citations' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-neutral-400 hover:text-white bg-[#121620] border border-[#222836]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Artifacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-2xl border border-[#222836] bg-[#121620] p-5 hover:border-amber-500/40 hover:bg-[#151a26] transition-all group shadow-md"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="rounded bg-neutral-800/80 px-2 py-0.5 text-[10px] font-mono text-neutral-300 border border-neutral-700">
                  {item.badge}
                </span>
                <span className="font-mono text-[10px] text-neutral-500">{item.date}</span>
              </div>

              <h3 className="mt-3 text-sm font-semibold text-white group-hover:text-amber-200 transition-colors">
                {item.title}
              </h3>

              <p className="mt-1 text-xs text-neutral-400 leading-relaxed">{item.details}</p>

              <div className="mt-2 text-[11px] font-mono text-amber-400/90">
                Engine: {item.engine}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#1c2230] flex items-center justify-between text-xs">
              <span className="text-emerald-400 text-[11px] font-mono">Encrypted in Vault</span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="rounded p-1.5 text-neutral-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  title="Delete artifact"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="rounded-2xl border border-[#222836] bg-[#121620] p-12 text-center">
          <FolderArchive className="mx-auto h-8 w-8 text-neutral-600 mb-2" />
          <p className="text-xs text-neutral-400">No artifacts matching this filter.</p>
        </div>
      )}
    </div>
  );
}
