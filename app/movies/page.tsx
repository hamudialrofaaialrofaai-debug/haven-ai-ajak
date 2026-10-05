import React, { useState, useEffect } from 'react';
import { HavenLogo } from '../../components/HavenLogo';
import {
  Clapperboard,
  Film,
  Camera,
  Wand2,
  Play,
  Volume2,
  Sparkles,
  Download,
  Bookmark,
  Share2,
  Search,
  Star,
  Flame,
  Award,
} from 'lucide-react';

export default function MoviesPage() {
  const [activeTab, setActiveTab] = useState<'trending' | 'director'>('trending');
  const [movies, setMovies] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingMovies, setIsLoadingMovies] = useState(false);

  // Director storyboard state
  const [scenePremise, setScenePremise] = useState('An undercover quantum cryptographer meets their former mentor in a rain-slicked neon Tokyo tea room at 3 AM');
  const [lensStyle, setLensStyle] = useState('35mm Anamorphic (2.39:1)');
  const [isGenerating, setIsGenerating] = useState(false);
  const [storyboard, setStoryboard] = useState<any[]>([
    {
      shotNumber: '01',
      shotType: 'EXT. WIDE ESTABLISHING',
      visual: 'Tokyo skyline veiled in torrential rain. Holographic kanji reflects on wet asphalt. Camera slowly cranes down.',
      lighting: 'Cyan and deep amber neon reflections, heavy atmospheric fog.',
      audio: 'Muffled traffic drone, steady rhythm of raindrops against glass.',
      cameraMovement: 'Slow vertical crane descent with gentle push-in.',
    },
    {
      shotNumber: '02',
      shotType: 'INT. MEDIUM CLOSE-UP',
      visual: 'Protagonist sitting across the wooden table, fingers nervously tracing a cipher card. Steam rises from a porcelain cup.',
      lighting: 'Warm 2700K tungsten table lamp providing gentle fill, deep shadows in background.',
      audio: 'Subtle acoustic cello drone rising in tension.',
      cameraMovement: 'Static handheld with subtle breathing motion.',
    },
    {
      shotNumber: '03',
      shotType: 'INT. EXTREME CLOSE-UP',
      visual: 'The mentor slides an optical memory crystal across the wet lacquer surface.',
      lighting: 'Hard specular rim light catching the faceted crystal edges with rainbow dispersion.',
      audio: 'Crystal chiming against lacquer. Whisper: "The key was never in the ledger."',
      cameraMovement: 'Macro push with shallow depth of field.',
    },
  ]);

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    setIsLoadingMovies(true);
    try {
      const res = await fetch('/api/tmdb/trending');
      const data = await res.json();
      if (data.movies) {
        setMovies(data.movies);
      }
    } catch (err) {
      console.error('Failed to load movies:', err);
    } finally {
      setIsLoadingMovies(false);
    }
  };

  const handleSearchMovies = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadTrending();
      return;
    }

    setIsLoadingMovies(true);
    try {
      const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (data.movies) {
        setMovies(data.movies);
      }
    } catch (err) {
      console.error('Movie search error:', err);
    } finally {
      setIsLoadingMovies(false);
    }
  };

  const handleGenerateScript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenePremise.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `You are a visionary film director and cinematographer working with Panavision anamorphic lenses.
Create 3 cinematic storyboard shots for this scene: "${scenePremise}".
Style format:
Shot 01: [Type] - Visual - Lighting - Audio - Camera Movement.
Keep it visceral, evocative, and director-ready.`,
          useWebSearch: false,
        }),
      });

      const data = await res.json();
      const text = data.answer || data.text || '';
      if (text) {
        setStoryboard([
          {
            shotNumber: '01',
            shotType: 'CINEMATIC VISION',
            visual: text.slice(0, 220) + '...',
            lighting: 'Anamorphic blue streak flare with high-contrast chiaroscuro.',
            audio: 'Atmospheric cinematic sound design.',
            cameraMovement: 'Steadicam tracking shot.',
          },
          ...storyboard.slice(0, 2),
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Movies Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222836] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Clapperboard className="h-4 w-4" />
            <span>TMDB Entertainment & Cinema Studio</span>
          </div>
          <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Movie Discovery & Directing Studio
            <span className="rounded bg-sky-500/20 px-2 py-0.5 text-xs font-mono text-sky-300 border border-sky-500/30">
              TMDB · African & World Cinema
            </span>
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            Explore acclaimed cinema, Sudanese film masterpieces, and engineer director-grade cinematic storyboards.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 rounded-xl border border-[#272e3b] bg-[#121620] p-1">
          <button
            onClick={() => setActiveTab('trending')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'trending'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            🍿 Discover Cinema
          </button>
          <button
            onClick={() => setActiveTab('director')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'director'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            🎬 Director Storyboard
          </button>
        </div>
      </div>

      {activeTab === 'trending' ? (
        <div className="space-y-6">
          {/* Search Bar */}
          <form onSubmit={handleSearchMovies} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search TMDB movies, directors, Sudanese films, or genres..."
                className="w-full rounded-xl border border-[#272e3b] bg-[#121620] py-3 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-neutral-500 focus:border-amber-500/50 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-amber-500 px-5 py-3 text-xs font-bold text-neutral-950 hover:bg-amber-400 transition-colors shadow"
            >
              Search
            </button>
          </form>

          {/* Movies Showcase Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#222836] bg-[#121620] shadow-xl hover:border-amber-500/50 transition-all"
              >
                {movie.posterPath && (
                  <div className="relative h-48 w-full overflow-hidden bg-[#0c0e14]">
                    <img
                      src={movie.posterPath}
                      alt={movie.title}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121620] via-transparent to-transparent" />
                    {movie.tag && (
                      <span className="absolute bottom-2 left-2 rounded-md bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-neutral-950">
                        {movie.tag}
                      </span>
                    )}
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                        {movie.title}
                      </h3>
                      {movie.rating && (
                        <span className="flex items-center gap-1 rounded bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-xs font-mono font-bold text-amber-300 flex-shrink-0">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {typeof movie.rating === 'number' ? movie.rating.toFixed(1) : movie.rating}
                        </span>
                      )}
                    </div>

                    {movie.genre && (
                      <div className="text-[11px] font-mono text-neutral-400 mt-1">
                        {movie.genre} · {movie.releaseDate}
                      </div>
                    )}

                    <p className="mt-2.5 text-xs text-neutral-300 line-clamp-3 leading-relaxed">
                      {movie.overview}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#1c2230] flex items-center justify-between">
                    <button
                      onClick={() => {
                        setScenePremise(`Cinematic adaptation of "${movie.title}": ${movie.overview?.slice(0, 100)}...`);
                        setActiveTab('director');
                      }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300"
                    >
                      <Wand2 className="h-3.5 w-3.5" />
                      <span>Draft Screenplay</span>
                    </button>
                    <span className="text-[10px] text-neutral-500 font-mono">TMDB Verified</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Director Mode */
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#222836] bg-[#121620] p-6 shadow-xl space-y-4">
            <form onSubmit={handleGenerateScript} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-neutral-300">Scene Premise & Narrative Conflict</label>
                <textarea
                  value={scenePremise}
                  onChange={(e) => setScenePremise(e.target.value)}
                  rows={3}
                  placeholder="Describe scene, character tension, emotional stakes, and world atmosphere..."
                  className="mt-1 w-full rounded-xl border border-[#272e3b] bg-[#0c0e14] p-3 text-xs text-white placeholder-neutral-500 focus:border-amber-500/50 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">Cinematography Format:</span>
                  <select
                    value={lensStyle}
                    onChange={(e) => setLensStyle(e.target.value)}
                    className="rounded-lg border border-[#272e3b] bg-[#0c0e14] px-3 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option>35mm Anamorphic (2.39:1)</option>
                    <option>70mm IMAX Aspect Ratio</option>
                    <option>Vintage Super 16mm Film</option>
                    <option>Steadicam Modern Digital 8K</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-neutral-950 hover:bg-amber-400 transition-colors shadow-md disabled:opacity-50"
                >
                  <Wand2 className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Directing Scene...' : 'Generate Director Shotlist'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Storyboard Cards */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Film className="h-4 w-4 text-amber-400" />
              <span>Active Scene Storyboard & Camera Rig</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {storyboard.map((shot, idx) => (
                <div
                  key={idx}
                  className="flex flex-col justify-between rounded-2xl border border-[#222836] bg-[#121620] p-5 shadow-lg hover:border-amber-500/40 transition-all space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-[#1c2230] pb-2.5">
                      <span className="font-mono text-xs font-bold text-amber-300">SHOT {shot.shotNumber}</span>
                      <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] font-mono text-neutral-300">
                        {shot.shotType}
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-white leading-relaxed font-medium">
                      {shot.visual}
                    </p>

                    <div className="mt-3 space-y-2 text-[11px] text-neutral-400">
                      <div>
                        <strong className="text-neutral-300">Lighting:</strong> {shot.lighting}
                      </div>
                      <div>
                        <strong className="text-neutral-300">Audio:</strong> {shot.audio}
                      </div>
                      <div>
                        <strong className="text-amber-400/90 font-mono">Camera:</strong> {shot.cameraMovement}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#1c2230] flex items-center justify-between text-xs text-neutral-500">
                    <span className="font-mono">{lensStyle.split(' ')[0]}</span>
                    <span className="text-emerald-400 font-mono">Render Ready</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
