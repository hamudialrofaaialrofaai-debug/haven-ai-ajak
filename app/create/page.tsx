import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { HavenLogo } from '../../components/HavenLogo';
import {
  Box,
  Layers,
  Sparkles,
  Download,
  RotateCw,
  Eye,
  Sliders,
  Play,
  Wand2,
  Bookmark,
  Check,
} from 'lucide-react';

export default function CreatePage() {
  const [prompt, setPrompt] = useState('An ancient hyper-dimensional obsidian artifact inlaid with glowing gold circuit veins');
  const [engine, setEngine] = useState<'Luma Dream Machine' | 'Kling AI' | 'Runway Gen-3' | 'Replicate 3D'>('Luma Dream Machine');
  const [isGenerating, setIsGenerating] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(0.01);
  const [meshColor, setMeshColor] = useState('#f59e0b');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // 3D Scene specs
  const [currentSpec, setCurrentSpec] = useState<any>({
    title: 'Haven Obsidian Prism',
    concept: 'Spatial geometric artifact with crystalline reflections and golden sheen',
    polycount: '64,800 Polygons',
    geometryType: 'faceted_gem',
    metalness: 0.9,
    roughness: 0.15,
  });

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Setup Three.js interactive canvas
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const width = canvasContainerRef.current.clientWidth || 600;
    const height = canvasContainerRef.current.clientHeight || 420;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 4.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Clear previous canvas
    canvasContainerRef.current.innerHTML = '';
    canvasContainerRef.current.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xf59e0b, 2.5);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.5);
    dirLight2.position.set(-5, -3, -2);
    scene.add(dirLight2);

    // Create initial 3D mesh
    createMesh(scene, 'faceted_gem', '#f59e0b', wireframe);

    // Render loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      if (meshRef.current) {
        meshRef.current.rotation.x += rotationSpeed * 0.7;
        meshRef.current.rotation.y += rotationSpeed;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!canvasContainerRef.current || !rendererRef.current) return;
      const w = canvasContainerRef.current.clientWidth;
      const h = canvasContainerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
    };
  }, []);

  // Update mesh geometry and materials
  const createMesh = (
    scene: THREE.Scene,
    type: string,
    colorHex: string,
    isWireframe: boolean
  ) => {
    if (meshRef.current) {
      scene.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      (meshRef.current.material as THREE.Material).dispose();
    }

    let geometry: THREE.BufferGeometry;
    if (type === 'torus_knot') {
      geometry = new THREE.TorusKnotGeometry(1, 0.35, 100, 16);
    } else if (type === 'dodecahedron') {
      geometry = new THREE.DodecahedronGeometry(1.4, 1);
    } else if (type === 'cylinder_cyber') {
      geometry = new THREE.CylinderGeometry(0.8, 1.2, 2, 32);
    } else {
      // Default faceted gem
      geometry = new THREE.IcosahedronGeometry(1.5, 0);
    }

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      metalness: 0.85,
      roughness: 0.2,
      wireframe: isWireframe,
      emissive: new THREE.Color(colorHex).multiplyScalar(0.15),
    });

    const mesh = new THREE.Mesh(geometry, material);
    meshRef.current = mesh;
    scene.add(mesh);
  };

  // Wireframe toggle update
  useEffect(() => {
    if (meshRef.current && sceneRef.current) {
      (meshRef.current.material as THREE.MeshStandardMaterial).wireframe = wireframe;
    }
  }, [wireframe]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/generate-3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          engine,
          style: 'hyper-realistic spatial',
        }),
      });

      if (!res.ok) throw new Error('Generation failed');

      const data = await res.json();
      if (data.spec) {
        setCurrentSpec(data.spec);
        const palette = data.spec.palette || ['#f59e0b'];
        const chosenColor = palette[0] || '#f59e0b';
        setMeshColor(chosenColor);

        if (sceneRef.current) {
          createMesh(sceneRef.current, data.spec.geometryType || 'faceted_gem', chosenColor, wireframe);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToLibrary = () => {
    const savedAssets = JSON.parse(localStorage.getItem('haven_saved_3d_assets') || '[]');
    savedAssets.unshift({
      id: 'asset-' + Date.now(),
      title: currentSpec.title || prompt.slice(0, 30),
      prompt,
      engine,
      polycount: currentSpec.polycount,
      createdAt: Date.now(),
    });
    localStorage.setItem('haven_saved_3d_assets', JSON.stringify(savedAssets));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222836] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Box className="h-4 w-4" />
            <span>3D & Spatial Video Generation Engine</span>
          </div>
          <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Spatial Creator Studio
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Luma · Kling · Runway
            </span>
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            Generate interactive 3D procedural meshes, volumetric spatial assets, and cinema-grade lighting.
          </p>
        </div>

        {/* Engine Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#141822] rounded-xl border border-[#272e3b]">
          {(['Luma Dream Machine', 'Kling AI', 'Runway Gen-3', 'Replicate 3D'] as const).map((eng) => (
            <button
              key={eng}
              onClick={() => setEngine(eng)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                engine === eng
                  ? 'bg-amber-500 text-neutral-950 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {eng}
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive 3D WebGL Viewport */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl border border-[#222836] bg-[#0c0e14] overflow-hidden shadow-2xl">
          {/* Viewport Top Bar */}
          <div className="flex items-center justify-between border-b border-[#1f2533] px-4 py-2.5 bg-[#121620]">
            <div className="flex items-center gap-2 text-xs text-neutral-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">{currentSpec.title}</span>
              <span className="text-neutral-500">·</span>
              <span className="font-mono text-neutral-400">{currentSpec.polycount}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setWireframe(!wireframe)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors border ${
                  wireframe
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-[#181d28] text-neutral-400 border-[#272e3b] hover:text-white'
                }`}
                title="Toggle Wireframe inspection"
              >
                <Layers className="h-3 w-3" />
                <span>Wireframe</span>
              </button>

              <button
                onClick={handleSaveToLibrary}
                className="flex items-center gap-1 px-2.5 py-1 rounded text-xs bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
                title="Save 3D asset to your library"
              >
                {savedSuccess ? <Check className="h-3 w-3 text-emerald-400" /> : <Bookmark className="h-3 w-3" />}
                <span>{savedSuccess ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>

          {/* Interactive WebGL Canvas */}
          <div
            ref={canvasContainerRef}
            className="h-[380px] sm:h-[460px] w-full cursor-grab active:cursor-grabbing relative flex items-center justify-center bg-radial from-[#151a26] via-[#0c0e14] to-[#08090d]"
          >
            {isGenerating && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm gap-3">
                <HavenLogo size={44} />
                <span className="font-mono text-xs text-amber-300 animate-pulse">
                  Synthesizing 3D Spatial Geometry via {engine}...
                </span>
              </div>
            )}
          </div>

          {/* Viewport Control Strip */}
          <div className="flex flex-wrap items-center justify-between border-t border-[#1f2533] px-4 py-3 bg-[#10141e] text-xs text-neutral-400 gap-3">
            <div className="flex items-center gap-3">
              <span className="text-neutral-500">Rotation:</span>
              <input
                type="range"
                min="0"
                max="0.05"
                step="0.005"
                value={rotationSpeed}
                onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                className="w-24 accent-amber-500"
              />
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span>Engine: <strong className="text-white">{engine}</strong></span>
              <span>·</span>
              <span>Renderer: <strong className="text-emerald-400">Three.js WebGL</strong></span>
            </div>
          </div>
        </div>

        {/* Right: Generation Form & Spec Panel */}
        <div className="lg:col-span-5 space-y-5">
          {/* Prompt Creator Box */}
          <div className="rounded-2xl border border-[#222836] bg-[#121620] p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Wand2 className="h-4 w-4" />
              <span>Prompt Synthesizer</span>
            </div>

            <form onSubmit={handleGenerate} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-neutral-300">Spatial Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  placeholder="Describe geometry, physical shaders, environment lighting..."
                  className="mt-1 w-full rounded-xl border border-[#272e3b] bg-[#0c0e14] p-3 text-xs text-white placeholder-neutral-500 focus:border-amber-500/50 focus:outline-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs font-bold text-neutral-950 hover:bg-amber-400 transition-colors shadow-md disabled:opacity-50"
              >
                <Sparkles className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Rendering 3D Model...' : `Generate with ${engine}`}</span>
              </button>
            </form>

            {/* Quick Inspiration Presets */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-neutral-400">Quick Archetypes:</span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[
                  'Crystalline Solitary Obelisk with Golden Facets',
                  'Torus Knot Ring of Cybernetic Micro-Chambers',
                  'Dodecahedron Sacred Geometry with Prismatic Core',
                  'Floating Bioluminescent Coral Structure',
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(preset)}
                    className="rounded-lg border border-[#272e3b] bg-[#0c0e14] px-2.5 py-1 text-[11px] text-neutral-300 hover:border-amber-500/40 hover:text-white transition-all text-left"
                  >
                    {preset.slice(0, 32)}...
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Spec Card */}
          <div className="rounded-2xl border border-[#222836] bg-[#121620] p-5 shadow-lg space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Active Spatial Specifications
            </h3>

            <div className="divide-y divide-[#1c2230] text-xs">
              <div className="flex justify-between py-2">
                <span className="text-neutral-400">Concept</span>
                <span className="text-white text-right max-w-[200px] font-medium">{currentSpec.concept}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-neutral-400">Geometry Class</span>
                <span className="text-amber-300 font-mono capitalize">{currentSpec.geometryType || 'Faceted Gem'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-neutral-400">Metalness / Roughness</span>
                <span className="text-neutral-200 font-mono">0.85 / 0.20</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-neutral-400">Shading Pipeline</span>
                <span className="text-emerald-400 font-mono">PBR MeshStandard</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
