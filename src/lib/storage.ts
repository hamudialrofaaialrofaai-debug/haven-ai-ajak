import {
  deriveKey,
  encryptData,
  decryptData,
  generateSyncPhrase,
  generateSalt,
} from './crypto';
import {
  Conversation,
  CreativeSpark,
  FlashcardDeck,
  DailyTask,
  Habit,
  ReflectionEntry,
  VaultMetadata,
  FullEncryptedPayload,
} from '../types';

const VAULT_META_KEY = 'haven_vault_meta_v1';
const VAULT_DATA_KEY = 'haven_vault_data_v1';

// Initial seeds for rich immediate experience
export const INITIAL_CREATIVE_SPARKS: CreativeSpark[] = [
  {
    id: 'spark-1',
    title: 'The Cartographer of Lost Senses',
    concept: 'A speculative story about an archivist mapping extinct acoustic frequencies and scents in a neon metropolis.',
    twist: 'The protagonist discovers their own childhood memories were forged to preserve a symphony.',
    category: 'story',
    createdAt: Date.now() - 3600000 * 24,
    saved: true,
  },
  {
    id: 'spark-2',
    title: 'The Silent Architecture of Decisions',
    concept: 'Exploring how non-action and negative space in daily routines shape human destiny more than explicit choices.',
    twist: 'Every door we deliberately refrain from opening becomes a load-bearing column of identity.',
    category: 'philosophy',
    createdAt: Date.now() - 3600000 * 12,
    saved: true,
  },
  {
    id: 'spark-3',
    title: 'Bioluminescent Chronometers',
    concept: 'A visual concept for timekeeping using living microscopic algae that shift luminescence based on circadian solar tides.',
    twist: 'Time is experienced as an organic ebb and glow rather than mechanical ticks.',
    category: 'divergence',
    createdAt: Date.now() - 3600000 * 4,
    saved: true,
  },
];

export const INITIAL_FLASHCARD_DECKS: FlashcardDeck[] = [
  {
    id: 'deck-1',
    topic: 'First Principles Thinking (Feynman Technique)',
    depth: 'university',
    createdAt: Date.now() - 3600000 * 48,
    cards: [
      {
        id: 'card-1',
        question: 'What is the fundamental difference between reasoning by analogy vs. reasoning from first principles?',
        answer: 'Analogy copies existing solutions with slight iterations ("others do it this way"). First principles boils things down to the most fundamental physical truths and reasons upward from scratch.',
        keyTakeaway: 'Always ask: "What is undeniably true here without relying on consensus?"',
        confidence: 'high',
      },
      {
        id: 'card-2',
        question: 'How do you test whether you truly understand a concept or merely memorized its terminology?',
        answer: 'Explain it without using jargon to a twelve-year-old. When you encounter a vocabulary bottleneck where you reach for technical words, you have pinpointed a gap in your conceptual understanding.',
        keyTakeaway: 'Naming something is not the same as knowing something.',
        confidence: 'medium',
      },
      {
        id: 'card-3',
        question: 'Why does spaced repetition dramatically improve long-term retention compared to massed practice (cramming)?',
        answer: 'The forgetting curve triggers neuroplastic reinforcement when recall occurs right at the threshold of forgetting (desirable difficulty), signaling the hippocampus to consolidate synaptic connections into long-term cortex storage.',
        keyTakeaway: 'Effortful retrieval right before forgetting cements memory.',
        confidence: 'medium',
      },
    ],
  },
];

export const INITIAL_TASKS: DailyTask[] = [
  {
    id: 'task-1',
    title: 'Deep Focus: Draft creative project core chapter',
    completed: false,
    timeEstimateMinutes: 90,
    isNorthStar: true,
    breakdown: [
      'Clear desk and silence notifications (5m)',
      'Review thesis & raw character notes (15m)',
      'High-velocity draft writing sprint (50m)',
      'Tag unresolved plot knots for tomorrow (20m)',
    ],
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'task-2',
    title: 'Review Socratic Flashcards on First Principles',
    completed: true,
    timeEstimateMinutes: 15,
    isNorthStar: false,
    createdAt: Date.now() - 3600000 * 8,
  },
  {
    id: 'task-3',
    title: 'Evening 20-minute digital sunset & reflection',
    completed: false,
    timeEstimateMinutes: 20,
    isNorthStar: false,
    createdAt: Date.now() - 3600000 * 1,
  },
];

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit-1',
    name: 'Morning Mindful Intention',
    category: 'mind',
    frequency: 'daily',
    history: {
      [getTodayStr(-3)]: true,
      [getTodayStr(-2)]: true,
      [getTodayStr(-1)]: true,
      [getTodayStr(0)]: true,
    },
    streak: 4,
  },
  {
    id: 'habit-2',
    name: '45m Creative Deep Sprint',
    category: 'craft',
    frequency: 'weekdays',
    history: {
      [getTodayStr(-2)]: true,
      [getTodayStr(-1)]: true,
      [getTodayStr(0)]: false,
    },
    streak: 2,
  },
  {
    id: 'habit-3',
    name: 'Read 20 pages of non-fiction',
    category: 'rest',
    frequency: 'daily',
    history: {
      [getTodayStr(-4)]: true,
      [getTodayStr(-3)]: true,
      [getTodayStr(-2)]: true,
      [getTodayStr(-1)]: true,
      [getTodayStr(0)]: false,
    },
    streak: 4,
  },
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-intro',
    title: 'Welcome to Haven Sanctuary',
    mode: 'all-around',
    createdAt: Date.now() - 3600000 * 5,
    updatedAt: Date.now() - 3600000 * 5,
    messages: [
      {
        id: 'msg-1',
        role: 'assistant',
        content: `Welcome to **Haven** — your private personal AI companion for creativity, learning, and daily life.

Here is how your privacy is guaranteed:
- **Zero-Knowledge Architecture**: Everything you write here is encrypted with an AES-GCM 256-bit key stored solely in your browser.
- **Cross-Device Sync**: Pair your laptop, phone, or tablet using your 6-word Sync Phrase. Even when data relays across devices, the server only ever handles encrypted ciphertext.
- **No Telemetry**: No third-party analytics, tracking pixels, or data profiling.

How can we direct your creative energy or thoughtful focus today?`,
        timestamp: Date.now() - 3600000 * 5,
        mode: 'all-around',
      },
    ],
  },
];

function getTodayStr(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

function detectPlatform(): string {
  if (typeof navigator === 'undefined') return 'Desktop Web';
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'Apple Mobile';
  if (/Android/.test(ua)) return 'Android Device';
  if (/Mac/.test(ua)) return 'MacBook / macOS';
  if (/Win/.test(ua)) return 'Windows PC';
  if (/Linux/.test(ua)) return 'Linux Workstation';
  return 'Web Browser';
}

/**
 * Loads or initializes vault metadata
 */
export function getOrCreateVaultMetadata(): VaultMetadata {
  const raw = localStorage.getItem(VAULT_META_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // Re-initialize
    }
  }

  const syncSecretPhrase = generateSyncPhrase();
  const keySalt = generateSalt();
  const syncId = 'haven-' + Math.random().toString(36).substring(2, 10);
  const platform = detectPlatform();

  const newMeta: VaultMetadata = {
    initialized: true,
    keySalt,
    syncId,
    syncSecretPhrase,
    piiMaskingEnabled: true,
    autoSyncEnabled: true,
    lastSyncedAt: Date.now(),
    devices: [
      {
        id: 'dev-' + Math.random().toString(36).substring(2, 8),
        name: `${platform} (Active)`,
        platform,
        lastSyncTime: Date.now(),
        isCurrent: true,
      },
    ],
  };

  localStorage.setItem(VAULT_META_KEY, JSON.stringify(newMeta));
  return newMeta;
}

export function saveVaultMetadata(meta: VaultMetadata): void {
  localStorage.setItem(VAULT_META_KEY, JSON.stringify(meta));
}

/**
 * Loads and decrypts full payload from local storage
 */
export async function loadEncryptedVault(meta: VaultMetadata): Promise<FullEncryptedPayload> {
  const rawEncrypted = localStorage.getItem(VAULT_DATA_KEY);
  if (!rawEncrypted) {
    // Return initial state
    const initialPayload: FullEncryptedPayload = {
      conversations: INITIAL_CONVERSATIONS,
      creativeSparks: INITIAL_CREATIVE_SPARKS,
      flashcardDecks: INITIAL_FLASHCARD_DECKS,
      dailyTasks: INITIAL_TASKS,
      habits: INITIAL_HABITS,
      reflectionEntries: [
        {
          id: 'ref-1',
          date: getTodayStr(-1),
          mood: 'peaceful',
          highlight: 'Completed writing draft without distraction.',
          insight: 'Friction vanishes when the first step is ridiculously small.',
          tomorrowIntention: 'Focus on the singular North Star project before noon.',
          createdAt: Date.now() - 3600000 * 24,
        },
      ],
      exportedAt: Date.now(),
    };
    await saveEncryptedVault(initialPayload, meta);
    return initialPayload;
  }

  try {
    const { ciphertext, iv } = JSON.parse(rawEncrypted);
    const key = await deriveKey(meta.syncSecretPhrase, meta.keySalt);
    return await decryptData(ciphertext, iv, key);
  } catch (err) {
    console.error('Failed to decrypt vault, fallback to fresh seed:', err);
    return {
      conversations: INITIAL_CONVERSATIONS,
      creativeSparks: INITIAL_CREATIVE_SPARKS,
      flashcardDecks: INITIAL_FLASHCARD_DECKS,
      dailyTasks: INITIAL_TASKS,
      habits: INITIAL_HABITS,
      reflectionEntries: [],
      exportedAt: Date.now(),
    };
  }
}

/**
 * Encrypts and writes full payload to local storage
 */
export async function saveEncryptedVault(payload: FullEncryptedPayload, meta: VaultMetadata): Promise<void> {
  const key = await deriveKey(meta.syncSecretPhrase, meta.keySalt);
  const encrypted = await encryptData(payload, key);
  localStorage.setItem(VAULT_DATA_KEY, JSON.stringify(encrypted));
}

/**
 * Emergency Panic Action: Wipes all cryptographic secrets, data, and sessions
 */
export function panicWipeVault(): void {
  localStorage.removeItem(VAULT_META_KEY);
  localStorage.removeItem(VAULT_DATA_KEY);
  sessionStorage.clear();
}
