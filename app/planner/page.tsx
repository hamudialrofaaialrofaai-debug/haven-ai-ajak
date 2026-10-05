import React, { useState, useEffect } from 'react';
import { HavenLogo } from '../../components/HavenLogo';
import {
  CalendarCheck2,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Flame,
  Target,
  Clock,
  Sparkles,
  Award,
  ListTodo,
} from 'lucide-react';

interface PlannerItem {
  id: string;
  type: 'goal' | 'habit' | 'reminder' | 'task';
  title: string;
  category: string;
  completed: boolean;
  dueDate?: string;
  streak?: number;
  priority?: 'low' | 'medium' | 'high';
  createdAt: number;
}

export default function PlannerPage() {
  const [items, setItems] = useState<PlannerItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'goal' | 'habit' | 'reminder' | 'task'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // New item form
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'goal' | 'habit' | 'reminder' | 'task'>('task');
  const [newCategory, setNewCategory] = useState('Productivity');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/planner?uid=user-haven-sovereign');
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
      }
    } catch (err) {
      console.error('Failed to load planner items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleComplete = async (item: PlannerItem) => {
    const updated = !item.completed;
    const nextStreak = item.type === 'habit' ? (updated ? (item.streak || 0) + 1 : Math.max(0, (item.streak || 1) - 1)) : undefined;

    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, completed: updated, streak: nextStreak } : i))
    );

    try {
      await fetch(`/api/planner/${item.id}?uid=user-haven-sovereign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: updated, streak: nextStreak }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      await fetch(`/api/planner/${id}?uid=user-haven-sovereign`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch('/api/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: 'user-haven-sovereign',
          title: newTitle.trim(),
          type: newType,
          category: newCategory,
          priority: newPriority,
          dueDate: newDueDate || undefined,
        }),
      });

      const data = await res.json();
      if (data.item) {
        setItems((prev) => [data.item, ...prev]);
        setNewTitle('');
        setNewDueDate('');
        setShowAddModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = items.filter((i) => activeTab === 'all' || i.type === activeTab);
  const completedCount = items.filter((i) => i.completed).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222836] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <CalendarCheck2 className="h-4 w-4" />
            <span>Haven Sovereign Life Architecture</span>
          </div>
          <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Personal Planner & Habits
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-mono text-amber-300 border border-amber-500/30">
              Dr. Ajak Alrofaai Aling
            </span>
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            Harmonize daily discipline, ambitious goals, smart reminders, and continuous personal growth.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-neutral-950 hover:bg-amber-400 transition-colors shadow-md"
        >
          <Plus className="h-4 w-4" />
          <span>New Entry</span>
        </button>
      </div>

      {/* Progress & Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[#222836] bg-[#121620] p-4 shadow-lg flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-neutral-400">Total Milestones</div>
            <div className="font-serif text-2xl font-bold text-white">{items.length}</div>
            <div className="text-[10px] text-amber-400 font-mono">Active tracking</div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#222836] bg-[#121620] p-4 shadow-lg flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-neutral-400">Execution Rate</div>
            <div className="font-serif text-2xl font-bold text-white">{progressPercent}%</div>
            <div className="text-[10px] text-emerald-400 font-mono">{completedCount} of {items.length} completed</div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#222836] bg-[#121620] p-4 shadow-lg flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-neutral-400">Habit Streaks</div>
            <div className="font-serif text-2xl font-bold text-white">
              {Math.max(0, ...items.filter((i) => i.type === 'habit').map((i) => i.streak || 0))} Days
            </div>
            <div className="text-[10px] text-rose-400 font-mono">Daily momentum</div>
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#222836] pb-2">
        {[
          { id: 'all', label: 'All Milestones' },
          { id: 'goal', label: '🎯 Goals' },
          { id: 'habit', label: '⚡ Daily Habits' },
          { id: 'reminder', label: '⏰ Reminders' },
          { id: 'task', label: '📋 Action Tasks' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-neutral-400 hover:bg-[#141824] hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Milestones List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-[#222836] bg-[#121620] p-12 text-center text-neutral-400">
            <ListTodo className="h-10 w-10 mx-auto text-neutral-600 mb-3" />
            <p className="text-sm font-medium text-neutral-300">No milestones in this category</p>
            <p className="text-xs text-neutral-500 mt-1">Create your first goal, habit, or reminder with Haven AI.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                item.completed
                  ? 'border-[#1a202c] bg-[#0d1017] opacity-60'
                  : 'border-[#222836] bg-[#121620] hover:border-amber-500/40'
              }`}
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <button
                  onClick={() => handleToggleComplete(item)}
                  className="flex-shrink-0 text-amber-400 hover:scale-110 transition-transform"
                >
                  {item.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <Circle className="h-5 w-5 text-neutral-500" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium truncate ${
                        item.completed ? 'line-through text-neutral-500' : 'text-white'
                      }`}
                    >
                      {item.title}
                    </span>
                    <span className="rounded bg-[#1a202c] px-2 py-0.5 text-[10px] font-mono text-neutral-400 uppercase">
                      {item.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-neutral-400 mt-1">
                    <span>{item.category}</span>
                    {item.dueDate && (
                      <span className="flex items-center gap-1 text-amber-300/80">
                        <Clock className="h-3 w-3" />
                        {item.dueDate}
                      </span>
                    )}
                    {item.type === 'habit' && item.streak !== undefined && (
                      <span className="flex items-center gap-1 text-rose-400 font-mono">
                        <Flame className="h-3 w-3" />
                        {item.streak} days streak
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="rounded-lg p-1.5 text-neutral-500 hover:bg-[#1a202c] hover:text-rose-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#222836] bg-[#121620] p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-amber-400" />
              Add Sovereign Milestone
            </h3>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="text-xs text-neutral-400">Title / Objective</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Master African Tech Innovations..."
                  className="mt-1 w-full rounded-xl border border-[#272e3b] bg-[#0c0e14] p-3 text-xs text-white placeholder-neutral-500 focus:border-amber-500/50 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-[#272e3b] bg-[#0c0e14] p-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="goal">Goal (Long-term)</option>
                    <option value="habit">Daily Habit</option>
                    <option value="reminder">Reminder</option>
                    <option value="task">Action Task</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-neutral-400">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#272e3b] bg-[#0c0e14] p-2.5 text-xs text-white focus:outline-none"
                  >
                    <option>Productivity</option>
                    <option>Learning & ICT</option>
                    <option>Creativity</option>
                    <option>Health & Wellness</option>
                    <option>Business & Strategy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-neutral-400">Due Date / Time (Optional)</label>
                <input
                  type="text"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  placeholder="e.g. Tomorrow at 5:00 PM or End of Month"
                  className="mt-1 w-full rounded-xl border border-[#272e3b] bg-[#0c0e14] p-3 text-xs text-white placeholder-neutral-500 focus:border-amber-500/50 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1c2230]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-neutral-950 hover:bg-amber-400 disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
