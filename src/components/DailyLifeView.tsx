import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  Circle,
  Plus,
  Flame,
  Moon,
  Clock,
  Wand2,
  Calendar,
  Sparkles,
  ArrowRight,
  Split,
  Smile,
} from 'lucide-react';
import { DailyTask, Habit, ReflectionEntry, AppMode } from '../types';
import sanctuaryImg from '../assets/images/haven_hero_sanctuary_1791075226430.jpg';

interface DailyLifeViewProps {
  tasks: DailyTask[];
  habits: Habit[];
  reflections: ReflectionEntry[];
  onAddTask: (task: DailyTask) => void;
  onToggleTask: (taskId: string) => void;
  onToggleHabit: (habitId: string, dateStr: string) => void;
  onAddReflection: (entry: ReflectionEntry) => void;
  onOpenInStudio: (prompt: string, mode: AppMode) => void;
}

export const DailyLifeView: React.FC<DailyLifeViewProps> = ({
  tasks,
  habits,
  reflections,
  onAddTask,
  onToggleTask,
  onToggleHabit,
  onAddReflection,
  onOpenInStudio,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'compass' | 'habits' | 'reflection' | 'decision'>('compass');

  // Task & timebox inputs
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isTimeboxing, setIsTimeboxing] = useState(false);
  const [timeboxGoal, setTimeboxGoal] = useState('');
  const [timeboxResult, setTimeboxResult] = useState<string | null>(null);

  // Reflection form state
  const [mood, setMood] = useState<'peaceful' | 'energized' | 'contemplative' | 'fatigued' | 'grateful'>('peaceful');
  const [highlight, setHighlight] = useState('');
  const [insight, setInsight] = useState('');
  const [tomorrowIntention, setTomorrowIntention] = useState('');
  const [reflectionSaved, setReflectionSaved] = useState(false);

  // Decision matrix state
  const [dilemma, setDilemma] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: DailyTask = {
      id: 'task-' + Date.now(),
      title: newTaskTitle.trim(),
      completed: false,
      timeEstimateMinutes: 30,
      isNorthStar: tasks.length === 0,
      createdAt: Date.now(),
    };
    onAddTask(newTask);
    setNewTaskTitle('');
  };

  const handleTimeboxBreakdown = async () => {
    if (!timeboxGoal.trim()) return;
    setIsTimeboxing(true);
    try {
      const res = await fetch('/api/assistant/timebox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: timeboxGoal.trim(),
          availableMinutes: 90,
        }),
      });
      const data = await res.json();
      if (data.text) {
        setTimeboxResult(data.text);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTimeboxing(false);
    }
  };

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!highlight.trim() && !insight.trim()) return;
    const newRef: ReflectionEntry = {
      id: 'ref-' + Date.now(),
      date: todayStr,
      mood,
      highlight: highlight.trim(),
      insight: insight.trim(),
      tomorrowIntention: tomorrowIntention.trim(),
      createdAt: Date.now(),
    };
    onAddReflection(newRef);
    setHighlight('');
    setInsight('');
    setTomorrowIntention('');
    setReflectionSaved(true);
    setTimeout(() => setReflectionSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Visual Hero Sanctuary */}
      <div className="relative overflow-hidden rounded-2xl border border-[#1f242e] bg-[#12151c]">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="p-6 md:col-span-2 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
              <Compass className="h-3.5 w-3.5" />
              <span>Daily Compass & Mindful Momentum</span>
            </div>
            <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-white">
              Intentional Action Without Cognitive Overload
            </h2>
            <p className="mt-2 text-sm text-neutral-300 leading-relaxed max-w-xl">
              Anchor your day around one true North Star priority. Let Haven assist in breaking down intimidating objectives, tracking nourishing habits, and unwinding with reflective clarity.
            </p>

            <div className="mt-4 flex items-center gap-4 text-xs text-neutral-400 font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>{tasks.filter((t) => t.completed).length}/{tasks.length} Tasks Done</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <Flame className="h-4 w-4" />
                <span>Streak Active</span>
              </span>
            </div>
          </div>

          <div className="relative hidden md:block h-full min-h-[170px]">
            <img
              src={sanctuaryImg}
              alt="Haven sanctuary serene desk"
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

      {/* Sub Tabs */}
      <div className="flex border-b border-[#1f242e] gap-4">
        <button
          onClick={() => setActiveSubTab('compass')}
          className={`pb-3 text-xs font-semibold transition-colors border-b-2 ${
            activeSubTab === 'compass'
              ? 'border-sky-400 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Daily Horizon & Tasks
        </button>
        <button
          onClick={() => setActiveSubTab('habits')}
          className={`pb-3 text-xs font-semibold transition-colors border-b-2 ${
            activeSubTab === 'habits'
              ? 'border-sky-400 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Habit Streaks
        </button>
        <button
          onClick={() => setActiveSubTab('reflection')}
          className={`pb-3 text-xs font-semibold transition-colors border-b-2 ${
            activeSubTab === 'reflection'
              ? 'border-sky-400 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Evening Reflection Journal
        </button>
        <button
          onClick={() => setActiveSubTab('decision')}
          className={`pb-3 text-xs font-semibold transition-colors border-b-2 ${
            activeSubTab === 'decision'
              ? 'border-sky-400 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Decision Matrix
        </button>
      </div>

      {/* SubTab 1: Compass & Tasks */}
      {activeSubTab === 'compass' && (
        <div className="space-y-5">
          {/* North Star Task Spotlight */}
          {tasks.find((t) => t.isNorthStar) && (
            <div className="rounded-xl border border-sky-500/30 bg-gradient-to-r from-sky-950/20 to-[#12151c] p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Today's North Star Priority</span>
              </div>
              {(() => {
                const northStar = tasks.find((t) => t.isNorthStar)!;
                return (
                  <div className="mt-3 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => onToggleTask(northStar.id)}
                        className="mt-0.5 text-sky-400 hover:text-sky-300 transition-colors"
                      >
                        {northStar.completed ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>
                      <div>
                        <h3 className={`text-base font-semibold ${northStar.completed ? 'line-through text-neutral-500' : 'text-white'}`}>
                          {northStar.title}
                        </h3>
                        {northStar.breakdown && (
                          <ul className="mt-2 space-y-1 text-xs text-neutral-300">
                            {northStar.breakdown.map((step, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        onOpenInStudio(
                          `Help me tackle my North Star task today: "${northStar.title}". What is the highest leverage first 15-minute action I can take?`,
                          'daily-life'
                        )
                      }
                      className="flex items-center gap-1 rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-300 hover:bg-sky-500/20 transition-all whitespace-nowrap"
                    >
                      <span>Timebox with AI</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Quick Task Creator */}
          <div className="rounded-xl border border-[#1f242e] bg-[#12151c] p-4">
            <form onSubmit={handleCreateTask} className="flex items-center gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add a mindful task or priority..."
                className="flex-1 rounded-lg border border-[#272e3b] bg-[#0c0e12] px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-sky-500/50 focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-neutral-950 hover:bg-sky-400 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Task</span>
              </button>
            </form>

            <div className="mt-4 divide-y divide-[#1f242e]">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="text-neutral-400 hover:text-sky-400 transition-colors"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </button>
                    <span className={`text-xs ${task.completed ? 'line-through text-neutral-500' : 'text-neutral-200'}`}>
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                    <span className="font-mono tabular-nums">{task.timeEstimateMinutes}m</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timebox Micro-Step Assistant */}
          <div className="rounded-xl border border-[#1f242e] bg-[#12151c] p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
              <Clock className="h-4 w-4" />
              <span>AI Timebox Breakdown Assistant</span>
            </div>
            <p className="mt-1 text-xs text-neutral-400">
              Turn an overwhelming 90-minute project into clear, low-friction micro-phases:
            </p>
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={timeboxGoal}
                onChange={(e) => setTimeboxGoal(e.target.value)}
                placeholder="e.g. Write comprehensive quarterly reflection..."
                className="flex-1 rounded-lg border border-[#272e3b] bg-[#0c0e12] px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-sky-500/50 focus:outline-none"
              />
              <button
                onClick={handleTimeboxBreakdown}
                disabled={isTimeboxing || !timeboxGoal.trim()}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-xs font-medium text-sky-300 hover:bg-sky-500/20 disabled:opacity-50"
              >
                <Wand2 className={`h-3.5 w-3.5 ${isTimeboxing ? 'animate-spin' : ''}`} />
                <span>{isTimeboxing ? 'Structuring...' : 'Generate Plan'}</span>
              </button>
            </div>

            {timeboxResult && (
              <div className="mt-3 rounded-lg border border-[#272e3b] bg-[#0c0e12] p-3 text-xs text-neutral-300 leading-relaxed whitespace-pre-line font-sans">
                {timeboxResult}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SubTab 2: Habit Streaks */}
      {activeSubTab === 'habits' && (
        <div className="rounded-xl border border-[#1f242e] bg-[#12151c] p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Mindful Habit Matrix</h3>
            <p className="mt-1 text-xs text-neutral-400">
              Consistency over intensity. Your habits are stored with local AES-256 zero-knowledge encryption.
            </p>
          </div>

          <div className="divide-y divide-[#1f242e]">
            {habits.map((habit) => {
              const isDoneToday = !!habit.history[todayStr];
              return (
                <div key={habit.id} className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onToggleHabit(habit.id, todayStr)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
                        isDoneToday
                          ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-400'
                          : 'border-[#272e3b] bg-[#0c0e12] text-neutral-500 hover:text-white'
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                    <div>
                      <h4 className="text-xs font-semibold text-white">{habit.name}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                        <span className="capitalize">{habit.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{habit.frequency}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300 font-mono">
                      <Flame className="h-3.5 w-3.5" />
                      <span>{habit.streak} day streak</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SubTab 3: Evening Reflection Journal */}
      {activeSubTab === 'reflection' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-[#1f242e] bg-[#12151c] p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
              <Moon className="h-4 w-4" />
              <span>Evening Mindful Reflection</span>
            </div>
            <h3 className="mt-1 text-sm font-semibold text-white">
              Decompress, Process, and Anchor the Day
            </h3>

            {reflectionSaved && (
              <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-300">
                Reflection saved to your private encrypted vault.
              </div>
            )}

            <form onSubmit={handleSaveReflection} className="mt-4 space-y-4">
              {/* Mood selector */}
              <div>
                <label className="text-xs font-medium text-neutral-400">State of Mind</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(['peaceful', 'energized', 'contemplative', 'fatigued', 'grateful'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                        mood === m
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                          : 'bg-[#0c0e12] text-neutral-400 border border-[#272e3b]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-400">
                  What was the single brightest highlight or victory today?
                </label>
                <textarea
                  value={highlight}
                  onChange={(e) => setHighlight(e.target.value)}
                  rows={2}
                  placeholder="A breakthrough conversation, focused work block, or quiet moment..."
                  className="mt-1 w-full rounded-lg border border-[#272e3b] bg-[#0c0e12] p-2.5 text-xs text-white placeholder-neutral-500 focus:border-indigo-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-400">
                  What insight or lesson revealed itself?
                </label>
                <textarea
                  value={insight}
                  onChange={(e) => setInsight(e.target.value)}
                  rows={2}
                  placeholder="Something you noticed about your energy, resistance, or curiosity..."
                  className="mt-1 w-full rounded-lg border border-[#272e3b] bg-[#0c0e12] p-2.5 text-xs text-white placeholder-neutral-500 focus:border-indigo-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-400">
                  Tomorrow's Single Intention
                </label>
                <input
                  type="text"
                  value={tomorrowIntention}
                  onChange={(e) => setTomorrowIntention(e.target.value)}
                  placeholder="e.g. Approach morning creative session with effortless curiosity..."
                  className="mt-1 w-full rounded-lg border border-[#272e3b] bg-[#0c0e12] px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-indigo-500/50 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
                >
                  Save Reflection to Vault
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onOpenInStudio(
                      `Guide me through an evening decompression reflection. I feel ${mood} right now. Ask me 2 gentle questions to close out the day.`,
                      'reflection'
                    )
                  }
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
                >
                  <span>Decompress with Haven in Studio</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </form>
          </div>

          {/* Past Reflections Archive */}
          {reflections.length > 0 && (
            <div className="rounded-xl border border-[#1f242e] bg-[#12151c] p-5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Encrypted Reflection Archive
              </h4>
              <div className="mt-3 space-y-3">
                {reflections.map((ref) => (
                  <div key={ref.id} className="rounded-lg border border-[#1f242e] bg-[#0c0e12] p-3 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-neutral-500">
                      <span>{ref.date}</span>
                      <span className="capitalize text-indigo-300">{ref.mood}</span>
                    </div>
                    {ref.highlight && <p className="text-neutral-200"><strong>Highlight:</strong> {ref.highlight}</p>}
                    {ref.insight && <p className="text-neutral-400 italic">"{ref.insight}"</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SubTab 4: Decision Matrix */}
      {activeSubTab === 'decision' && (
        <div className="rounded-xl border border-[#1f242e] bg-[#12151c] p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
            <Split className="h-4 w-4" />
            <span>Private Decision Deliberation</span>
          </div>
          <h3 className="text-sm font-semibold text-white">
            Weight Trade-Offs with Socratic Objectivity
          </h3>
          <p className="text-xs text-neutral-400">
            Confidential choices (career, life, financial, creative directions) evaluated with zero external telemetry.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-neutral-300">The Dilemma</label>
              <input
                type="text"
                value={dilemma}
                onChange={(e) => setDilemma(e.target.value)}
                placeholder="e.g. Should I accept an advisory role or focus exclusively on solo writing?"
                className="mt-1 w-full rounded-lg border border-[#272e3b] bg-[#0c0e12] px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-sky-500/50 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-400">Option A</label>
                <input
                  type="text"
                  value={optionA}
                  onChange={(e) => setOptionA(e.target.value)}
                  placeholder="e.g. Accept advisory role"
                  className="mt-1 w-full rounded-lg border border-[#272e3b] bg-[#0c0e12] px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-sky-500/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-400">Option B</label>
                <input
                  type="text"
                  value={optionB}
                  onChange={(e) => setOptionB(e.target.value)}
                  placeholder="e.g. Double down on solo writing"
                  className="mt-1 w-full rounded-lg border border-[#272e3b] bg-[#0c0e12] px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-sky-500/50 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={() =>
                onOpenInStudio(
                  `Help me deliberate this private decision with structured objectivity:
Dilemma: "${dilemma || 'Key life choice'}"
Option A: "${optionA || 'First path'}"
Option B: "${optionB || 'Second path'}"

Analyze:
1. Reversibility (Type 1 vs Type 2 decision)
2. Cognitive cost of maintenance
3. Regret minimization in 5 years
4. Concrete test balloon to reduce uncertainty`,
                  'daily-life'
                )
              }
              className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-neutral-950 hover:bg-sky-400 transition-colors"
            >
              <span>Analyze Dilemma in Studio</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
