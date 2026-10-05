import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  ShieldCheck,
  Copy,
  Check,
  Trash2,
  EyeOff,
  CornerDownLeft,
  ArrowRight,
  BookOpen,
  Compass,
  Moon,
  Zap,
} from 'lucide-react';
import { marked } from 'marked';
import { Message, Conversation, AppMode } from '../types';
import { scrubPII } from '../lib/crypto';

interface StudioChatProps {
  conversation: Conversation;
  onSendMessage: (content: string, mode: AppMode, isEphemeral: boolean) => Promise<void>;
  onClearConversation: () => void;
  piiMaskingEnabled: boolean;
  activeMode: AppMode;
  setActiveMode: (mode: AppMode) => void;
  isGenerating: boolean;
}

export const StudioChat: React.FC<StudioChatProps> = ({
  conversation,
  onSendMessage,
  onClearConversation,
  piiMaskingEnabled,
  activeMode,
  setActiveMode,
  isGenerating,
}) => {
  const [inputText, setInputText] = useState('');
  const [isEphemeral, setIsEphemeral] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // Audio speech synthesis state
  const [activeAudioMsgId, setActiveAudioMsgId] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioLoadingMsgId, setAudioLoadingMsgId] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages, isGenerating]);

  // Handle prompt submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isGenerating) return;
    const msg = inputText.trim();
    setInputText('');
    await onSendMessage(msg, activeMode, isEphemeral);
  };

  // Copy message text
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Play voice synthesis using Gemini 3.8 Flash Lite TTS
  const handlePlayVoice = async (msg: Message) => {
    // If already playing this message, pause/stop
    if (activeAudioMsgId === msg.id && isPlayingAudio) {
      currentAudioRef.current?.pause();
      setIsPlayingAudio(false);
      setActiveAudioMsgId(null);
      return;
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }

    setAudioLoadingMsgId(msg.id);
    try {
      // If we already cached audioUrl on message
      if (msg.audioUrl) {
        playAudioFromUrl(msg.audioUrl, msg.id);
        setAudioLoadingMsgId(null);
        return;
      }

      // Request speech synthesis from server
      const res = await fetch('/api/assistant/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: msg.content.replace(/[#*`_\[\]()]/g, ''), // strip markdown tokens for speech
          voice: 'Kore',
        }),
      });

      if (!res.ok) {
        throw new Error('Speech synthesis failed');
      }

      const data = await res.json();
      if (data.audio) {
        const audioSrc = `data:audio/wav;base64,${data.audio}`;
        msg.audioUrl = audioSrc;
        playAudioFromUrl(audioSrc, msg.id);
      }
    } catch (err) {
      console.error('Audio playback error:', err);
    } finally {
      setAudioLoadingMsgId(null);
    }
  };

  const playAudioFromUrl = (url: string, msgId: string) => {
    const audio = new Audio(url);
    currentAudioRef.current = audio;
    audio.play();
    setIsPlayingAudio(true);
    setActiveAudioMsgId(msgId);

    audio.onended = () => {
      setIsPlayingAudio(false);
      setActiveAudioMsgId(null);
    };
  };

  // Quick prompt starters per mode
  const promptStarters: Record<AppMode, string[]> = {
    'all-around': [
      'What should I know about zero-knowledge encryption in simple terms?',
      'Help me synthesize my priorities for this afternoon.',
      'Suggest a short philosophical reflection on creative discipline.',
    ],
    'creativity': [
      'Give me 3 unexpected narrative openings about an astronomer discovering a dead star.',
      'Help me break down a creative block regarding a title for my new project.',
      'Craft 4 evocative sensory metaphors describing the smell of rain on limestone.',
    ],
    'learning': [
      'Explain the Feynman Technique using a tangible everyday example.',
      'Socratically test my understanding of how public-key cryptography works.',
      'Deconstruct the core trade-offs between speed and accuracy in heuristic algorithms.',
    ],
    'daily-life': [
      'Help me isolate the single North Star task for today and timebox it.',
      'What is an easy 2-minute friction-reduction routine for starting deep work?',
      'Help me resolve a decision dilemma between two competing obligations.',
    ],
    'reflection': [
      'Ask me two thoughtful questions to help me close out and decompress from today.',
      'What is a helpful reframing for feeling that today did not accomplish enough?',
      'Synthesize an evening gratitude reflection based on simple sensory moments.',
    ],
  };

  return (
    <div className="flex h-[calc(100vh-8.5rem)] flex-col rounded-2xl border border-[#1f242e] bg-[#10131a] overflow-hidden">
      {/* Studio Header & Persona Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1f242e] bg-[#0c0e12]/80 px-4 py-3 backdrop-blur-md">
        {/* Persona Mode Switcher */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-[#161a22] rounded-xl border border-[#272e3b]">
          <button
            onClick={() => setActiveMode('all-around')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeMode === 'all-around'
                ? 'bg-[#222836] text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Zap className="h-3 w-3 text-amber-400" />
            <span>All-Around</span>
          </button>

          <button
            onClick={() => setActiveMode('creativity')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeMode === 'creativity'
                ? 'bg-[#222836] text-amber-300 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-3 w-3 text-amber-300" />
            <span>Creative Muse</span>
          </button>

          <button
            onClick={() => setActiveMode('learning')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeMode === 'learning'
                ? 'bg-[#222836] text-emerald-300 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BookOpen className="h-3 w-3 text-emerald-400" />
            <span>Socratic Tutor</span>
          </button>

          <button
            onClick={() => setActiveMode('daily-life')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeMode === 'daily-life'
                ? 'bg-[#222836] text-sky-300 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Compass className="h-3 w-3 text-sky-400" />
            <span>Daily Compass</span>
          </button>

          <button
            onClick={() => setActiveMode('reflection')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeMode === 'reflection'
                ? 'bg-[#222836] text-indigo-300 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Moon className="h-3 w-3 text-indigo-400" />
            <span>Reflection</span>
          </button>
        </div>

        {/* Security / Ephemeral Controls */}
        <div className="flex items-center gap-2">
          {/* Ephemeral mode toggle */}
          <button
            onClick={() => setIsEphemeral(!isEphemeral)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors border ${
              isEphemeral
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-[#161a22] text-neutral-400 border-[#272e3b] hover:text-white'
            }`}
            title="Ephemeral mode does not save this session into your encrypted local vault."
          >
            <EyeOff className="h-3 w-3" />
            <span>{isEphemeral ? 'Ephemeral' : 'Vault Saved'}</span>
          </button>

          <button
            onClick={onClearConversation}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-[#1a1f29] hover:text-neutral-200 transition-colors"
            title="Clear current thread"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Privacy Guarantee Status Sub-Bar */}
      <div className="flex items-center justify-between border-b border-[#181c24] bg-[#0c0e12]/40 px-4 py-1.5 text-[11px] text-neutral-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3 w-3 text-emerald-400" />
          <span>Client-Side AES-256 Encrypted</span>
          {piiMaskingEnabled && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-amber-400/90">PII Scrubber Active</span>
            </>
          )}
        </div>
        <span className="font-mono text-[10px] text-neutral-500">
          Powered by Gemini 3.8 Flash
        </span>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {conversation.messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/10 border border-amber-500/30 text-amber-300">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-white">
                How may Haven accompany your mind today?
              </h3>
              <p className="mt-1 text-xs text-neutral-400 max-w-md mx-auto">
                Explore creative breakthroughs, dissect deep concepts, or plan mindful momentum in complete privacy.
              </p>
            </div>

            {/* Prompt Starters */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full max-w-2xl">
              {promptStarters[activeMode].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(prompt, activeMode, isEphemeral)}
                  className="rounded-xl border border-[#1f242e] bg-[#141822] p-3 text-left text-xs text-neutral-300 hover:border-amber-500/40 hover:bg-[#1a1f2c] transition-all"
                >
                  <p className="line-clamp-3">"{prompt}"</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          conversation.messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-emerald-500/10 border border-amber-500/30 text-amber-300 text-xs font-serif font-bold">
                    H
                  </div>
                )}

                <div
                  className={`relative max-w-2xl rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-amber-500/15 border border-amber-500/30 text-white rounded-tr-none'
                      : 'bg-[#151922] border border-[#222836] text-neutral-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  {/* Message Content */}
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div
                      className="prose prose-invert prose-xs max-w-none text-neutral-200 space-y-2 [&_h1]:text-base [&_h1]:font-serif [&_h1]:text-white [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-amber-200 [&_h3]:text-xs [&_h3]:font-semibold [&_p]:my-1.5 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_blockquote]:border-l-2 [&_blockquote]:border-amber-400 [&_blockquote]:pl-3 [&_blockquote]:italic [&_code]:font-mono [&_code]:bg-[#0c0e12] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded"
                      dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) as string }}
                    />
                  )}

                  {/* Actions footer on model response */}
                  {!isUser && (
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#1e2330] text-[11px] text-neutral-400">
                      <div className="flex items-center gap-1.5">
                        <span className="capitalize">{msg.mode}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Audio Speech Button */}
                        <button
                          onClick={() => handlePlayVoice(msg)}
                          disabled={audioLoadingMsgId === msg.id}
                          className={`flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors ${
                            activeAudioMsgId === msg.id && isPlayingAudio
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'hover:bg-[#202634] text-neutral-400 hover:text-white'
                          }`}
                          title="Listen with Haven voice companion"
                        >
                          {audioLoadingMsgId === msg.id ? (
                            <span className="h-3 w-3 animate-spin rounded-full border border-amber-400 border-t-transparent" />
                          ) : activeAudioMsgId === msg.id && isPlayingAudio ? (
                            <VolumeX className="h-3.5 w-3.5 text-amber-400" />
                          ) : (
                            <Volume2 className="h-3.5 w-3.5" />
                          )}
                          <span className="hidden sm:inline">
                            {audioLoadingMsgId === msg.id
                              ? 'Synthesizing...'
                              : activeAudioMsgId === msg.id && isPlayingAudio
                              ? 'Pause'
                              : 'Listen'}
                          </span>
                        </button>

                        {/* Copy Button */}
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="rounded p-1 hover:bg-[#202634] text-neutral-400 hover:text-white transition-colors"
                          title="Copy text"
                        >
                          {copiedMsgId === msg.id ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isGenerating && (
          <div className="flex gap-3 justify-start items-center">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 text-xs font-serif font-bold">
              H
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl bg-[#151922] border border-[#222836] px-4 py-3 text-xs text-neutral-400">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse delay-75" />
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse delay-150" />
              <span className="ml-1 font-mono text-[11px]">Haven is formulating...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Area */}
      <div className="border-t border-[#1f242e] bg-[#0c0e12] p-3 sm:p-4">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            rows={1}
            placeholder={`Ask Haven in ${activeMode.replace('-', ' ')} mode...`}
            className="w-full resize-none rounded-xl border border-[#272e3b] bg-[#141822] py-3 pl-4 pr-12 text-xs sm:text-sm text-white placeholder-neutral-500 focus:border-amber-500/50 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isGenerating}
            className="absolute right-2 rounded-lg bg-amber-500 p-2 text-neutral-950 hover:bg-amber-400 transition-colors disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500 px-1">
          <span>Press Enter to send, Shift + Enter for new line</span>
          {isEphemeral && (
            <span className="text-amber-400 font-medium">
              Ephemeral session active: Not saved to disk
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
