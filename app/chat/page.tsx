import React, { useState, useRef, useEffect } from 'react';
import { HavenLogo } from '../../components/HavenLogo';
import { SourceCard, SearchSource } from '../../components/SourceCard';
import {
  UserProfile,
  getCachedFirebaseUser,
  updateCachedFirebaseUser,
} from '../../lib/firebase';
import {
  Send,
  Globe,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
  Copy,
  Check,
  RotateCcw,
  Film,
  Bookmark,
  Mic,
  MicOff,
  Image as ImageIcon,
  Paperclip,
  X,
  Brain,
  Trash2,
  Lock,
  PenTool,
  Code2,
  GraduationCap,
  Briefcase,
  Wand2,
  ArrowRight,
  User,
} from 'lucide-react';
import { marked } from 'marked';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: SearchSource[];
  timestamp: number;
  audioUrl?: string;
  memorySaved?: string | null;
  movieReady?: boolean;
  imagePreview?: string;
  fileName?: string;
}

export type AssistantMode = 'chat' | 'writing' | 'coding' | 'learning' | 'business';

const buildWelcomeMessage = (u: UserProfile): string => {
  const name = u.name || 'Friend';
  const lang = u.preferredLanguage || 'auto';
  if (lang === 'sd') {
    return `حبابك يا **${name}**، نورت **Haven AI**!
عافية وخير إن شاء الله، أنا رفيقك ومساعدك الذكي الخاص.

**جاهز لمساعدتك اليوم:**
- 🎤 **محادثة صوتية وكتابية**: اضغط على المايك وتحدث معي باللهجة السودانية أو العربية أو الإنجليزية.
- 📎 **تحليل المستندات والصور**: ارفع أي صورة أو ملف PDF أو كود لتحليله فوراً.
- ✍️ **أوضاع متخصصة**: الكتابة، البرمجة، والتعلم، وتطوير الأعمال.
- 🧠 **ذاكرتك المستقلة**: قل لي *"احفظ عندك..."* لحفظ ملاحظاتك بشكل خاص بملفك فقط.
- 5️⃣ **ردود ذكية**: جرّب إرسال *"جمعة مباركة"* أو *"صباح الخير"* لتوليد 5 ردود تناسب كل المقامات.

كيف أقدر أساعدك اليوم يا ${name}؟`;
  } else if (lang === 'ar') {
    return `أهلاً وسهلاً بك يا **${name}** في **Haven AI** — مساعدك الشخصي الذكي.

**ما يمكننا استكشافه معاً:**
- 🎤 **محادثة صوتية وكتابية**: تحدث بالعربية الفصحى أو الإنجليزية.
- 📎 **تحليل المستندات والصور**: ارفع ملفات PDF، كود، أو صور لاستخلاص الأفكار فوراً.
- ✍️ **أوضاع إبداعية**: الكتابة، تطوير البرمجيات، والتعلم المعمق.
- 🧠 **الذاكرة الشخصية**: احفظ تفضيلاتك وملاحظاتك بأمان تام ومستقل لحسابك.
- 5️⃣ **الردود الذكية**: أرسل تهنئة أو تحية وسأقترح عليك 5 ردود بأساليب متعددة.

بماذا تحب أن نبدأ اليوم يا ${name}؟`;
  } else {
    return `Welcome, **${name}**! I'm **Haven AI**, your private personal companion for creativity, learning, and daily productivity.

**Explore with Haven:**
- 🎤 **Speak Naturally**: Click the microphone to chat via speech in English or Arabic.
- 📎 **Upload & Analyze**: Attach images or documents (PDF, text, code) for instant breakdown.
- ✍️ **Specialized Modes**: Switch between Writing, Coding, Socratic Tutor, and Business Strategy.
- 🧠 **Private Memory**: Say *"remember this..."* to save personal preferences safely for your account.
- 5️⃣ **5 Smart Replies**: Share a greeting or celebration for 5 tailored cultural responses.

How can I assist you today, ${name}?`;
  }
};

export default function ChatPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(getCachedFirebaseUser());
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gpt-4o-mini' | 'gpt-4o'>('gemini-3.8-flash');
  const [assistantMode, setAssistantMode] = useState<AssistantMode>('chat');
  const [useWebSearch, setUseWebSearch] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Multimodal file & image attachments
  const [attachedImage, setAttachedImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null);

  // Speech-to-text Voice Input state
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Audio Playback
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [audioLoadingId, setAudioLoadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Memory Management Modal
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [memories, setMemories] = useState<string[]>([]);
  const [memoryConsent, setMemoryConsent] = useState(true);
  const [newMemoryText, setNewMemoryText] = useState('');

  // Image Generation Modal
  const [showImageGenModal, setShowImageGenModal] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // Language Menu Dropdown State
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    const user = getCachedFirebaseUser();
    setCurrentUser(user);
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: buildWelcomeMessage(user),
        timestamp: Date.now(),
      },
    ]);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (currentUser.uid) {
      loadMemories(currentUser.uid);
    }
  }, [currentUser.uid]);

  const loadMemories = async (uidToLoad?: string) => {
    const targetUid = uidToLoad || currentUser.uid;
    try {
      const res = await fetch(`/api/memories?uid=${encodeURIComponent(targetUid)}`);
      const data = await res.json();
      if (data.memories) {
        setMemories(data.memories);
        setMemoryConsent(data.consent ?? true);
      }
    } catch (e) {
      console.warn('Memory load note:', e);
    }
  };

  const handleLanguageChange = (lang: 'auto' | 'en' | 'ar' | 'sd') => {
    const updated = updateCachedFirebaseUser({ preferredLanguage: lang });
    setCurrentUser(updated);
    setShowLangMenu(false);
  };

  // Setup Web Speech API for voice dictation
  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'ar-SA'; // Detects Arabic + Sudanese Arabic, or falls back

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition notice:', e);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsRecording(false);
    }
  };

  // Image file handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage({
        data: reader.result as string,
        mimeType: file.type || 'image/jpeg',
      });
    };
    reader.readAsDataURL(file);
  };

  // Document file handler (PDF/Text/Code)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      setAttachedFile({
        name: file.name,
        content: text.slice(0, 10000), // Cap to 10k chars for fast context ingestion
      });
    };
    reader.readAsText(file);
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if ((!textToSend.trim() && !attachedImage) || isLoading) return;

    if (!customText) setInput('');

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: textToSend || 'Analyze this attached media.',
      imagePreview: attachedImage?.data,
      fileName: attachedFile?.name,
      timestamp: Date.now(),
    };

    const currentImage = attachedImage;
    const currentFile = attachedFile;

    // Reset attachments
    setAttachedImage(null);
    setAttachedFile(null);

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: currentUser.uid,
          userName: currentUser.name,
          preferredLanguage: currentUser.preferredLanguage,
          message: textToSend || 'Describe and analyze the attached file',
          model: selectedModel,
          mode: assistantMode,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          useWebSearch: currentImage ? false : useWebSearch,
          image: currentImage,
          fileContext: currentFile?.content,
        }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      const content =
        data.answer ||
        data.text ||
        `حبابك يا ${currentUser.name} — أنا معك في Haven AI. كيف أقدر أساعدك اليوم؟`;

      const assistantMsg: ChatMessage = {
        id: 'assistant-' + Date.now(),
        role: 'assistant',
        content,
        sources: data.sources || [],
        timestamp: Date.now(),
        memorySaved: data.memorySaved,
        movieReady: data.movieReady || content.includes('Ready to generate MP4 in Create Studio'),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If a memory was saved, refresh memories
      if (data.memorySaved) {
        loadMemories(currentUser.uid);
      }
    } catch (err: any) {
      console.warn('Haven network notice:', err?.message || err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content: `أهلاً بك يا ${currentUser.name} — حدث تأخر مؤقت في الاتصال، تفضل بطرح سؤالك مرة أخرى وسأجيبك فوراً.`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoicePlay = async (msg: ChatMessage) => {
    if (activeAudioId === msg.id) {
      audioRef.current?.pause();
      setActiveAudioId(null);
      return;
    }

    if (msg.audioUrl) {
      playAudio(msg.audioUrl, msg.id);
      return;
    }

    setAudioLoadingId(msg.id);
    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: msg.content.replace(/[#*`_\[\]()]/g, ''),
          voice: 'Kore',
        }),
      });

      const data = await res.json();
      if (data.audio) {
        const url = `data:${data.mimeType || 'audio/wav'};base64,${data.audio}`;
        msg.audioUrl = url;
        playAudio(url, msg.id);
      }
    } catch (err) {
      console.error('Voice synthesis error:', err);
    } finally {
      setAudioLoadingId(null);
    }
  };

  const playAudio = (url: string, id: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play();
    setActiveAudioId(id);
    audio.onended = () => setActiveAudioId(null);
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Memory Actions (Strictly isolated by currentUser.uid)
  const handleToggleConsent = async () => {
    const nextConsent = !memoryConsent;
    setMemoryConsent(nextConsent);
    await fetch('/api/memories/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: currentUser.uid, consent: nextConsent }),
    });
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryText.trim()) return;

    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: currentUser.uid, memory: newMemoryText.trim() }),
      });
      const data = await res.json();
      if (data.memories) {
        setMemories(data.memories);
        setNewMemoryText('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMemory = async (idx: number) => {
    try {
      const res = await fetch('/api/memories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: currentUser.uid, index: idx }),
      });
      const data = await res.json();
      if (data.memories) {
        setMemories(data.memories);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Real Image Generation Modal Action
  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePrompt.trim() || isGeneratingImage) return;

    setIsGeneratingImage(true);
    setGeneratedImageUrl(null);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt.trim() }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col rounded-2xl border border-[#222836] bg-[#0e1117] overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#222836] bg-[#121620]/90 px-4 sm:px-6 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <HavenLogo size={36} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Haven AI</h2>
              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-mono text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <User className="h-2.5 w-2.5" />
                <span>{currentUser.name}</span>
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Personal AI Companion · Private Memory Isolation · Real Web Grounding
            </p>
          </div>
        </div>

        {/* Center Controls: Assistant Modes */}
        <div className="hidden md:flex items-center gap-1 rounded-xl border border-[#272e3b] bg-[#141824] p-1">
          {[
            { id: 'chat', label: 'Chat', icon: <Sparkles className="h-3.5 w-3.5" /> },
            { id: 'writing', label: 'Writing', icon: <PenTool className="h-3.5 w-3.5" /> },
            { id: 'coding', label: 'Coding', icon: <Code2 className="h-3.5 w-3.5" /> },
            { id: 'learning', label: 'Tutor', icon: <GraduationCap className="h-3.5 w-3.5" /> },
            { id: 'business', label: 'Business', icon: <Briefcase className="h-3.5 w-3.5" /> },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setAssistantMode(mode.id as AssistantMode)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                assistantMode === mode.id
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {mode.icon}
              <span>{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Action Buttons: Language Selector + Memories + Image Gen */}
        <div className="flex items-center gap-2">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 rounded-lg border border-[#272e3b] bg-[#141824] px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:border-amber-500/50 hover:text-white transition-colors"
              title="Select Conversation Language"
            >
              <Globe className="h-3.5 w-3.5 text-sky-400" />
              <span>
                {currentUser.preferredLanguage === 'sd'
                  ? '🇸🇩 سوداني'
                  : currentUser.preferredLanguage === 'ar'
                  ? '🇸🇦 عربي'
                  : currentUser.preferredLanguage === 'en'
                  ? '🇬🇧 EN'
                  : '🌐 Auto'}
              </span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-1.5 w-44 rounded-xl border border-[#272e3b] bg-[#141824] p-1.5 shadow-2xl z-50 text-xs space-y-0.5">
                {[
                  { id: 'auto', label: 'Auto-Detect', icon: '🌐' },
                  { id: 'sd', label: 'Sudanese Arabic', icon: '🇸🇩' },
                  { id: 'ar', label: 'Standard Arabic', icon: '🇸🇦' },
                  { id: 'en', label: 'English', icon: '🇬🇧' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleLanguageChange(item.id as any)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      currentUser.preferredLanguage === item.id
                        ? 'bg-amber-500/20 text-amber-300 font-semibold'
                        : 'text-neutral-300 hover:bg-[#1f2636]'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Memory Manager Trigger */}
          <button
            onClick={() => setShowMemoryModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-[#272e3b] bg-[#141824] px-2.5 py-1.5 text-xs font-mono text-amber-300 hover:border-amber-500/50 transition-colors"
            title="Private AI Memories"
          >
            <Brain className="h-3.5 w-3.5 text-amber-400" />
            <span>Memories ({memories.length})</span>
          </button>

          {/* Image Gen Trigger */}
          <button
            onClick={() => setShowImageGenModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-[#272e3b] bg-[#141824] px-2.5 py-1.5 text-xs font-medium text-emerald-300 hover:border-emerald-500/50 transition-colors"
            title="Create Visual Imagery"
          >
            <Wand2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Imagen 3</span>
          </button>

          {/* Tavily Web Search Toggle */}
          <button
            onClick={() => setUseWebSearch(!useWebSearch)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all border ${
              useWebSearch
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-[#181d28] text-neutral-400 border-[#272e3b] hover:text-white'
            }`}
            title="Real-time Web Grounding"
          >
            <Globe className={`h-3.5 w-3.5 ${useWebSearch ? 'text-emerald-400 animate-pulse' : ''}`} />
            <span className="hidden sm:inline">{useWebSearch ? 'Search: ON' : 'Search: OFF'}</span>
          </button>

          {/* Reset Thread */}
          <button
            onClick={() => setMessages([messages[0]])}
            className="rounded-lg border border-[#272e3b] p-1.5 text-neutral-400 hover:bg-[#181d28] hover:text-white transition-colors"
            title="Reset thread"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="mt-1 flex-shrink-0">
                  <HavenLogo size={30} />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-amber-500/15 border border-amber-500/30 text-white rounded-tr-none'
                    : 'bg-[#141822] border border-[#222836] text-neutral-200 rounded-tl-none shadow-md'
                }`}
              >
                {/* User Image Attachment Preview */}
                {isUser && msg.imagePreview && (
                  <div className="mb-3 overflow-hidden rounded-xl border border-amber-500/40 max-h-60">
                    <img src={msg.imagePreview} alt="Attached" className="h-full w-full object-cover" />
                  </div>
                )}

                {/* User Document Attachment Badge */}
                {isUser && msg.fileName && (
                  <div className="mb-2 flex items-center gap-1.5 rounded-lg bg-[#0c0e14] px-2.5 py-1 text-xs text-amber-300 font-mono">
                    <Paperclip className="h-3.5 w-3.5 text-amber-400" />
                    <span>Attached Document: {msg.fileName}</span>
                  </div>
                )}

                {/* Memory Notification */}
                {msg.memorySaved && (
                  <div className="mb-3 flex items-center gap-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 p-2 text-xs text-emerald-300 font-mono">
                    <Bookmark className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Memory Saved with Permission: "{msg.memorySaved}"</span>
                  </div>
                )}

                {/* Content */}
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div
                    className="prose prose-invert prose-xs max-w-none space-y-2 [&_h1]:text-base [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-amber-200 [&_code]:bg-[#090b10] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_a]:text-amber-400"
                    dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) as string }}
                  />
                )}

                {/* Movie Studio Trigger */}
                {msg.movieReady && (
                  <div className="mt-4 pt-3 border-t border-[#222836] flex items-center justify-between bg-amber-500/10 p-3 rounded-xl border border-amber-500/30">
                    <div className="flex items-center gap-2">
                      <Film className="h-4 w-4 text-amber-400" />
                      <span className="text-xs font-semibold text-amber-300">
                        Pixar 3D African Luxury 9:16 Script Ready
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        window.location.href = '/create';
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-neutral-950 hover:bg-amber-400 transition-colors shadow-sm"
                    >
                      <span>Generate MP4 in Create Studio</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* Grounded Search Sources */}
                {!isUser && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#222836]">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400 mb-2">
                      <Globe className="h-3 w-3 text-emerald-400" />
                      <span>Sources & Grounded Search Cards</span>
                      <span className="font-mono text-neutral-500">({msg.sources.length})</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.sources.map((src, i) => (
                        <SourceCard key={i} source={src} index={i} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Controls */}
                {!isUser && (
                  <div className="mt-3.5 pt-2 border-t border-[#1c2230] flex items-center justify-between text-[11px] text-neutral-400">
                    <span className="font-mono text-[10px] text-neutral-500">
                      Haven AI · {selectedModel} · {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleVoicePlay(msg)}
                        disabled={audioLoadingId === msg.id}
                        className={`flex items-center gap-1 rounded px-2 py-0.5 text-xs transition-colors ${
                          activeAudioId === msg.id
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'hover:bg-[#202738] text-neutral-400 hover:text-white'
                        }`}
                      >
                        {audioLoadingId === msg.id ? (
                          <span className="h-3 w-3 animate-spin rounded-full border border-amber-400 border-t-transparent" />
                        ) : activeAudioId === msg.id ? (
                          <VolumeX className="h-3.5 w-3.5 text-amber-400" />
                        ) : (
                          <Volume2 className="h-3.5 w-3.5" />
                        )}
                        <span>{activeAudioId === msg.id ? 'Pause' : 'ElevenLabs Voice'}</span>
                      </button>

                      <button
                        onClick={() => copyText(msg.id, msg.content)}
                        className="rounded p-1 hover:bg-[#202738] text-neutral-400 hover:text-white"
                        title="Copy content"
                      >
                        {copiedId === msg.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3.5 items-center">
            <HavenLogo size={30} />
            <div className="flex items-center gap-2 rounded-2xl bg-[#141822] border border-[#222836] px-4 py-3 text-xs text-neutral-300">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-mono text-neutral-400">
                Formulating response with {selectedModel} in {assistantMode} mode...
              </span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Attachment Previews */}
      {(attachedImage || attachedFile) && (
        <div className="border-t border-[#1c2230] bg-[#10141d] px-4 py-2 flex items-center gap-3">
          {attachedImage && (
            <div className="relative flex items-center gap-2 rounded-lg bg-[#181d28] p-1.5 border border-amber-500/40">
              <img src={attachedImage.data} alt="Attach" className="h-8 w-8 rounded object-cover" />
              <span className="text-[11px] text-neutral-300 font-mono">Image attached</span>
              <button onClick={() => setAttachedImage(null)} className="text-neutral-400 hover:text-rose-400">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {attachedFile && (
            <div className="relative flex items-center gap-2 rounded-lg bg-[#181d28] px-2.5 py-1.5 border border-sky-500/40">
              <Paperclip className="h-3.5 w-3.5 text-sky-400" />
              <span className="text-[11px] text-neutral-300 font-mono truncate max-w-[200px]">{attachedFile.name}</span>
              <button onClick={() => setAttachedFile(null)} className="text-neutral-400 hover:text-rose-400">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick Prompts Bar */}
      <div className="border-t border-[#1c2230] bg-[#0c0e14] px-4 py-2 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-semibold text-neutral-500 whitespace-nowrap">Starters:</span>
        {[
          'جمعة مباركة (5 Smart Replies)',
          'Good morning greeting replies',
          'Create 1-min 3D Pixar anime story in 9:16',
          'Explain quantum computing simply (Socratic)',
          'Draft executive pitch for African ICT hub',
          'Remember this: I prioritize sovereign local encryption',
        ].map((starter, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(starter)}
            className="rounded-lg border border-[#272e3b] bg-[#141824] px-2.5 py-1 text-[11px] text-neutral-300 hover:border-amber-500/40 hover:text-amber-200 transition-colors whitespace-nowrap"
          >
            {starter}
          </button>
        ))}
      </div>

      {/* Input Section */}
      <div className="border-t border-[#222836] bg-[#0c0e14] p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center gap-2"
        >
          {/* File Upload Hidden Input */}
          <input
            type="file"
            id="file-upload"
            onChange={handleFileUpload}
            accept=".txt,.md,.json,.pdf,.csv,.ts,.js,.py"
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer rounded-xl border border-[#272e3b] bg-[#141824] p-2.5 text-neutral-400 hover:border-sky-500/40 hover:text-sky-300 transition-colors"
            title="Attach Document / PDF"
          >
            <Paperclip className="h-4 w-4" />
          </label>

          {/* Image Upload Hidden Input */}
          <input
            type="file"
            id="image-upload"
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer rounded-xl border border-[#272e3b] bg-[#141824] p-2.5 text-neutral-400 hover:border-amber-500/40 hover:text-amber-300 transition-colors"
            title="Attach Image for Visual Analysis"
          >
            <ImageIcon className="h-4 w-4" />
          </label>

          {/* Voice Input Microphone */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`rounded-xl border p-2.5 transition-all ${
              isRecording
                ? 'border-rose-500 bg-rose-500/20 text-rose-400 animate-pulse'
                : 'border-[#272e3b] bg-[#141824] text-neutral-400 hover:text-amber-300 hover:border-amber-500/40'
            }`}
            title={isRecording ? 'Listening... Click to stop' : 'Voice Input (Speech-to-Text)'}
          >
            {isRecording ? <MicOff className="h-4 w-4 text-rose-400" /> : <Mic className="h-4 w-4" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isRecording
                ? 'Listening to your voice...'
                : `Message Haven AI in English, Arabic, or Sudanese Arabic (${assistantMode} mode)...`
            }
            className="flex-1 rounded-xl border border-[#272e3b] bg-[#141824] py-3.5 pl-4 pr-12 text-xs sm:text-sm text-white placeholder-neutral-500 focus:border-amber-500/50 focus:outline-none"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!input.trim() && !attachedImage) || isLoading}
            className="rounded-xl bg-amber-500 p-3 text-neutral-950 hover:bg-amber-400 transition-colors disabled:opacity-40 shadow"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* AI Memory Management Modal */}
      {showMemoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#222836] bg-[#121620] p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1c2230] pb-3">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-amber-400" />
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">Private AI Memories for {currentUser.name}</h3>
                  <p className="text-[11px] text-neutral-400 font-mono">
                    Account UID: {currentUser.uid.slice(0, 12)}... · Strictly Isolated Memory Vault
                  </p>
                </div>
              </div>
              <button onClick={() => setShowMemoryModal(false)} className="text-neutral-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Permission Consent Banner */}
            <div className="flex items-center justify-between rounded-xl bg-[#0c0e14] border border-[#272e3b] p-3">
              <div>
                <div className="text-xs font-semibold text-white">Memory Learning Permission</div>
                <div className="text-[11px] text-neutral-400">
                  {memoryConsent
                    ? 'Permission Granted: Haven AI remembers your preferences.'
                    : 'Permission Paused: Haven AI will not record new memories.'}
                </div>
              </div>
              <button
                onClick={handleToggleConsent}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  memoryConsent ? 'bg-emerald-500 text-neutral-950' : 'bg-neutral-700 text-neutral-300'
                }`}
              >
                {memoryConsent ? 'Enabled' : 'Paused'}
              </button>
            </div>

            {/* Add Memory Form */}
            <form onSubmit={handleAddMemory} className="flex gap-2">
              <input
                type="text"
                value={newMemoryText}
                onChange={(e) => setNewMemoryText(e.target.value)}
                placeholder="Manually add a memory (e.g. My primary research is quantum photonics)..."
                className="flex-1 rounded-xl border border-[#272e3b] bg-[#0c0e14] p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
              />
              <button
                type="submit"
                disabled={!newMemoryText.trim()}
                className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-neutral-950 hover:bg-amber-400 disabled:opacity-50"
              >
                Save
              </button>
            </form>

            {/* Memories List */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase text-neutral-400">Stored Sovereign Memories ({memories.length})</div>
              {memories.length === 0 ? (
                <div className="rounded-xl border border-[#1c2230] p-6 text-center text-xs text-neutral-500">
                  No memories saved yet. Say "remember this: [preference]" during chat.
                </div>
              ) : (
                memories.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-xl border border-[#1c2230] bg-[#0c0e14] p-3">
                    <span className="text-xs text-neutral-200">{m}</span>
                    <button
                      onClick={() => handleDeleteMemory(idx)}
                      className="text-neutral-500 hover:text-rose-400 transition-colors p-1"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Imagen 3 Generation Modal */}
      {showImageGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#222836] bg-[#121620] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1c2230] pb-3">
              <div className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-emerald-400" />
                <h3 className="font-serif text-lg font-bold text-white">Imagen 3 Generation</h3>
              </div>
              <button onClick={() => setShowImageGenModal(false)} className="text-neutral-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateImage} className="space-y-3">
              <div>
                <label className="text-xs text-neutral-400">Visual Prompt</label>
                <textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  rows={3}
                  placeholder="e.g. Majestic futuristic African citadel at dusk with golden solar spires and holographic constellations..."
                  className="mt-1 w-full rounded-xl border border-[#272e3b] bg-[#0c0e14] p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowImageGenModal(false)}
                  className="rounded-xl px-4 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!imagePrompt.trim() || isGeneratingImage}
                  className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-neutral-950 hover:bg-emerald-400 disabled:opacity-50"
                >
                  {isGeneratingImage ? 'Synthesizing 8K...' : 'Generate with Imagen 3'}
                </button>
              </div>
            </form>

            {generatedImageUrl && (
              <div className="mt-4 rounded-xl overflow-hidden border border-[#272e3b] bg-[#0c0e14]">
                <img src={generatedImageUrl} alt="Generated" className="w-full h-auto object-cover" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
