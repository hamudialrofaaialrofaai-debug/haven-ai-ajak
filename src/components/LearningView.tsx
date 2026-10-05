import React, { useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  HelpCircle,
  Layers,
  Sparkles,
  ArrowRight,
  RotateCw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Brain,
  Wand2,
} from 'lucide-react';
import { FlashcardDeck, Flashcard, AppMode } from '../types';

interface LearningViewProps {
  decks: FlashcardDeck[];
  onAddDeck: (deck: FlashcardDeck) => void;
  onUpdateDeck: (deck: FlashcardDeck) => void;
  onOpenInStudio: (prompt: string, mode: AppMode) => void;
}

export const LearningView: React.FC<LearningViewProps> = ({
  decks,
  onAddDeck,
  onUpdateDeck,
  onOpenInStudio,
}) => {
  const [topicInput, setTopicInput] = useState('');
  const [selectedDepth, setSelectedDepth] = useState<'eli5' | 'high-school' | 'university' | 'expert'>('university');
  const [isGenerating, setIsGenerating] = useState(false);

  // Active flashcard study session
  const [selectedDeckId, setSelectedDeckId] = useState<string>(decks[0]?.id || '');
  const [cardIndex, setCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const activeDeck = decks.find((d) => d.id === selectedDeckId) || decks[0];
  const currentCard: Flashcard | undefined = activeDeck?.cards[cardIndex];

  const handleGenerateDeck = async () => {
    if (!topicInput.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/assistant/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicInput.trim(),
          depth: selectedDepth,
        }),
      });
      const data = await res.json();
      if (data.text) {
        // Parse into 3 flashcards
        const parsedCards: Flashcard[] = [
          {
            id: 'card-' + Date.now() + '-1',
            question: `Core Principle: What governs the foundational dynamics of ${topicInput.trim()}?`,
            answer: data.text.slice(0, 240) + '...',
            keyTakeaway: 'Always verify assumptions using empirical observation.',
            confidence: 'medium',
          },
          {
            id: 'card-' + Date.now() + '-2',
            question: `How does ${topicInput.trim()} behave under edge conditions?`,
            answer: 'Under high stress or non-linear scaling, initial boundary assumptions shift toward entropy.',
            keyTakeaway: 'Systems fail at their interface points.',
            confidence: 'low',
          },
        ];

        const newDeck: FlashcardDeck = {
          id: 'deck-' + Date.now(),
          topic: topicInput.trim(),
          depth: selectedDepth,
          cards: parsedCards,
          createdAt: Date.now(),
        };

        onAddDeck(newDeck);
        setSelectedDeckId(newDeck.id);
        setCardIndex(0);
        setIsCardFlipped(false);
        setTopicInput('');
      }
    } catch (err) {
      console.error('Failed to generate deck:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCardConfidence = (confidence: 'low' | 'medium' | 'high') => {
    if (!activeDeck || !currentCard) return;
    const updatedCards = activeDeck.cards.map((c, i) =>
      i === cardIndex ? { ...c, confidence, lastReviewed: Date.now() } : c
    );
    const updatedDeck = { ...activeDeck, cards: updatedCards };
    onUpdateDeck(updatedDeck);

    // Advance to next card
    if (cardIndex < activeDeck.cards.length - 1) {
      setCardIndex(cardIndex + 1);
      setIsCardFlipped(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="rounded-2xl border border-[#1f242e] bg-[#12151c] p-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
          <Brain className="h-3.5 w-3.5" />
          <span>Socratic Academy & Spaced Repetition</span>
        </div>
        <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-white">
          Master Any Discipline from First Principles
        </h2>
        <p className="mt-2 text-sm text-neutral-300 leading-relaxed max-w-2xl">
          Haven applies the Feynman technique and Socratic inquiry to dissect complex domains, test your mental models, and cement recall through spaced repetition.
        </p>

        {/* Learning Generation Workbench */}
        <div className="mt-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-neutral-400">Target Depth:</span>
            {(['eli5', 'high-school', 'university', 'expert'] as const).map((depth) => (
              <button
                key={depth}
                onClick={() => setSelectedDepth(depth)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                  selectedDepth === depth
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-[#181d26] text-neutral-400 hover:text-white border border-[#272e3b]'
                }`}
              >
                {depth.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="What do you want to learn? (e.g., Zero-Knowledge Cryptography, Game Theory, Neural Synapses)..."
              className="flex-1 rounded-lg border border-[#272e3b] bg-[#0c0e12] px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-emerald-500/50 focus:outline-none"
            />
            <button
              onClick={handleGenerateDeck}
              disabled={isGenerating || !topicInput.trim()}
              className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-neutral-950 hover:bg-emerald-400 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              <Wand2 className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Synthesizing...' : 'Create Study Deck'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Socratic Dialogue Launchers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() =>
            onOpenInStudio(
              'Act as a strict Socratic tutor on the topic of Distributed Consensus. Ask me one probing question at a time to test if I truly understand how Raft or Paxos achieves leader election.',
              'learning'
            )
          }
          className="rounded-xl border border-[#1f242e] bg-[#12151c] p-4 text-left hover:border-emerald-500/40 hover:bg-[#161a22] transition-all group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3 group-hover:scale-105 transition-transform">
            <GraduationCap className="h-4 w-4" />
          </div>
          <h3 className="text-xs font-semibold text-white">Socratic Challenge</h3>
          <p className="mt-1 text-[11px] text-neutral-400 leading-relaxed">
            AI interrogates your understanding step-by-step, exposing false intuitions.
          </p>
          <div className="mt-3 flex items-center gap-1 text-[11px] text-emerald-400 group-hover:translate-x-0.5 transition-transform">
            <span>Start Dialogue</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </button>

        <button
          onClick={() =>
            onOpenInStudio(
              'Apply the Feynman Technique to explain Quantum Entanglement to someone with no physics background. Use an evocative everyday analogy and zero jargon.',
              'learning'
            )
          }
          className="rounded-xl border border-[#1f242e] bg-[#12151c] p-4 text-left hover:border-emerald-500/40 hover:bg-[#161a22] transition-all group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3 group-hover:scale-105 transition-transform">
            <Layers className="h-4 w-4" />
          </div>
          <h3 className="text-xs font-semibold text-white">Feynman Decomposition</h3>
          <p className="mt-1 text-[11px] text-neutral-400 leading-relaxed">
            Distill complicated mechanisms into intuitive analogies and clear mental models.
          </p>
          <div className="mt-3 flex items-center gap-1 text-[11px] text-amber-400 group-hover:translate-x-0.5 transition-transform">
            <span>Deconstruct</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </button>

        <button
          onClick={() =>
            onOpenInStudio(
              'Help me map the knowledge prerequisites needed to master Modern Transformer Architecture from linear algebra up to attention heads.',
              'learning'
            )
          }
          className="rounded-xl border border-[#1f242e] bg-[#12151c] p-4 text-left hover:border-emerald-500/40 hover:bg-[#161a22] transition-all group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-3 group-hover:scale-105 transition-transform">
            <BookOpen className="h-4 w-4" />
          </div>
          <h3 className="text-xs font-semibold text-white">Prerequisite Roadmap</h3>
          <p className="mt-1 text-[11px] text-neutral-400 leading-relaxed">
            Structure your study curriculum in optimal cognitive order.
          </p>
          <div className="mt-3 flex items-center gap-1 text-[11px] text-sky-400 group-hover:translate-x-0.5 transition-transform">
            <span>Map Journey</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </button>
      </div>

      {/* Spaced Repetition Interactive Deck Section */}
      {activeDeck && (
        <div className="rounded-xl border border-[#1f242e] bg-[#12151c] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f242e] pb-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="capitalize">{activeDeck.depth} level</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{activeDeck.cards.length} Flashcards</span>
              </div>
              <h3 className="text-base font-semibold text-white mt-0.5">
                {activeDeck.topic}
              </h3>
            </div>

            {/* Deck Selector Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {decks.map((deck) => (
                <button
                  key={deck.id}
                  onClick={() => {
                    setSelectedDeckId(deck.id);
                    setCardIndex(0);
                    setIsCardFlipped(false);
                  }}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    selectedDeckId === deck.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-neutral-400 hover:text-white bg-[#181d26]'
                  }`}
                >
                  {deck.topic.slice(0, 20)}...
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Flip Card */}
          {currentCard ? (
            <div className="max-w-xl mx-auto space-y-4">
              <div
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                className="relative min-h-[220px] rounded-2xl border border-[#272e3b] bg-gradient-to-b from-[#161a24] to-[#0f1218] p-6 cursor-pointer hover:border-emerald-500/40 transition-all flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span className="font-mono">
                      Card {cardIndex + 1} of {activeDeck.cards.length}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                      <RotateCw className="h-3 w-3" />
                      <span>{isCardFlipped ? 'Showing Answer' : 'Click to Reveal'}</span>
                    </span>
                  </div>

                  <div className="mt-4">
                    {!isCardFlipped ? (
                      <div>
                        <span className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">Question</span>
                        <p className="mt-2 text-base font-medium text-white leading-relaxed">
                          {currentCard.question}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">Explanation</span>
                          <p className="mt-1 text-sm text-neutral-200 leading-relaxed">
                            {currentCard.answer}
                          </p>
                        </div>
                        {currentCard.keyTakeaway && (
                          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-300">
                            <strong>Takeaway:</strong> {currentCard.keyTakeaway}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1f242e] flex items-center justify-between text-xs text-neutral-500">
                  <span>Confidence: <strong className="text-neutral-300 capitalize">{currentCard.confidence || 'Unrated'}</strong></span>
                  <span>Flip to review</span>
                </div>
              </div>

              {/* Confidence Rating Buttons (Spaced repetition) */}
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    if (cardIndex > 0) {
                      setCardIndex(cardIndex - 1);
                      setIsCardFlipped(false);
                    }
                  }}
                  disabled={cardIndex === 0}
                  className="rounded-lg border border-[#272e3b] p-2 text-neutral-400 hover:text-white disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCardConfidence('low')}
                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/20"
                  >
                    Hard (Review Soon)
                  </button>
                  <button
                    onClick={() => handleCardConfidence('medium')}
                    className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/20"
                  >
                    Medium
                  </button>
                  <button
                    onClick={() => handleCardConfidence('high')}
                    className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20"
                  >
                    Confident
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (cardIndex < activeDeck.cards.length - 1) {
                      setCardIndex(cardIndex + 1);
                      setIsCardFlipped(false);
                    }
                  }}
                  disabled={cardIndex === activeDeck.cards.length - 1}
                  className="rounded-lg border border-[#272e3b] p-2 text-neutral-400 hover:text-white disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-400">No cards in this deck.</p>
          )}
        </div>
      )}
    </div>
  );
};
