export type AppMode = 'all-around' | 'creativity' | 'learning' | 'daily-life' | 'reflection';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  mode: AppMode;
  audioUrl?: string;
  isAudioPlaying?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  mode: AppMode;
  messages: Message[];
  isEphemeral?: boolean;
}

export interface CreativeSpark {
  id: string;
  title: string;
  concept: string;
  twist: string;
  category: 'story' | 'philosophy' | 'metaphor' | 'divergence';
  createdAt: number;
  saved: boolean;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  keyTakeaway: string;
  lastReviewed?: number;
  confidence?: 'low' | 'medium' | 'high';
}

export interface FlashcardDeck {
  id: string;
  topic: string;
  depth: 'eli5' | 'high-school' | 'university' | 'expert';
  cards: Flashcard[];
  createdAt: number;
}

export interface DailyTask {
  id: string;
  title: string;
  completed: boolean;
  timeEstimateMinutes: number;
  isNorthStar?: boolean;
  breakdown?: string[];
  createdAt: number;
}

export interface Habit {
  id: string;
  name: string;
  category: 'mind' | 'body' | 'craft' | 'rest';
  frequency: 'daily' | 'weekdays';
  history: Record<string, boolean>; // 'YYYY-MM-DD': true
  streak: number;
}

export interface ReflectionEntry {
  id: string;
  date: string;
  mood: 'peaceful' | 'energized' | 'contemplative' | 'fatigued' | 'grateful';
  highlight: string;
  insight: string;
  tomorrowIntention: string;
  createdAt: number;
}

export interface LinkedDevice {
  id: string;
  name: string;
  platform: string;
  lastSyncTime: number;
  isCurrent: boolean;
}

export interface VaultMetadata {
  initialized: boolean;
  keySalt: string;
  syncId: string;
  syncSecretPhrase: string;
  piiMaskingEnabled: boolean;
  autoSyncEnabled: boolean;
  lastSyncedAt?: number;
  devices: LinkedDevice[];
}

export interface FullEncryptedPayload {
  conversations: Conversation[];
  creativeSparks: CreativeSpark[];
  flashcardDecks: FlashcardDeck[];
  dailyTasks: DailyTask[];
  habits: Habit[];
  reflectionEntries: ReflectionEntry[];
  exportedAt: number;
}
