import { useState } from 'react';
import { RotateCcw, Send, Leaf } from 'lucide-react';
import { Button } from '../ui/Button';

const exercises = [
    {
        title: 'Naming the Thought',
        instruction: 'Instead of "I need to know if it\'s safe," say:',
        response: '"I\'m having the thought that I need to know if it\'s safe."'
    },
    {
        title: 'Thanking Your Mind',
        instruction: 'When the urge appears, respond:',
        response: '"Thanks, mind, for trying to protect me. I\'ve got this."'
    },
    {
        title: 'The Passenger',
        instruction: 'The urge is a passenger in your car, not the driver.',
        response: 'It can shout directions, but you choose where to go.'
    }
];

interface ThoughtLeaf {
    id: number;
    text: string;
    style: React.CSSProperties;
}

export const CognitiveDefusion = () => {
    const [mode, setMode] = useState<'learn' | 'practice'>('practice');

    // Learn Mode State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const currentCard = exercises[currentIndex];

    // Practice Mode State
    const [thoughtInput, setThoughtInput] = useState('');
    const [leaves, setLeaves] = useState<ThoughtLeaf[]>([]);
    const [nextId, setNextId] = useState(0);

    const handleNext = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % exercises.length);
    };

    const handlePrevious = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev - 1 + exercises.length) % exercises.length);
    };

    const addThought = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!thoughtInput.trim()) return;

        const newLeaf: ThoughtLeaf = {
            id: nextId,
            text: thoughtInput,
            style: {
                left: `${Math.random() * 60 + 20}%`,
                animationDuration: `${Math.random() * 5 + 5}s`, // 5-10s float time
                animationDelay: '0s',
            }
        };

        setLeaves(prev => [...prev, newLeaf]);
        setNextId(prev => prev + 1);
        setThoughtInput('');

        // Cleanup leaf after animation (approx 8s)
        setTimeout(() => {
            setLeaves(prev => prev.filter(l => l.id !== newLeaf.id));
        }, 8500);
    };

    return (
        <div className="space-y-6">
            {/* Header / Tabs */}
            <div className="flex flex-col items-center space-y-4">
                <div className="bg-[var(--anchor-surface)] p-1 rounded-full border border-[var(--anchor-border)] inline-flex">
                    <button
                        onClick={() => setMode('practice')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${mode === 'practice'
                            ? 'bg-[var(--anchor-primary)] text-white shadow-sm'
                            : 'text-[var(--anchor-text-muted)] hover:text-[var(--anchor-text)]'
                            }`}
                    >
                        Leaves on a Stream
                    </button>
                    <button
                        onClick={() => setMode('learn')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${mode === 'learn'
                            ? 'bg-[var(--anchor-primary)] text-white shadow-sm'
                            : 'text-[var(--anchor-text-muted)] hover:text-[var(--anchor-text)]'
                            }`}
                    >
                        Quick Techniques
                    </button>
                </div>
            </div>

            {mode === 'practice' ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-center text-[var(--anchor-text-muted)] max-w-md mx-auto">
                        Type a thought that is bothering you, and watch it float away. <br />
                        <span className="italic opacity-80">You don't have to keep it.</span>
                    </p>

                    {/* Stream Visualization */}
                    <div className="relative h-64 bg-slate-50 dark:bg-slate-900 rounded-xl border border-[var(--anchor-border)] overflow-hidden shadow-inner group">

                        {/* Stream Water Texture (Flowing Current) */}
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-100/50 to-blue-200/50 dark:from-blue-900/40 dark:to-blue-800/40"></div>

                        {/* Flowing Streaks Layer 1 (Softer) */}
                        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.4),transparent)] bg-[size:100%_200px] [background-repeat:repeat-y] animate-[stream-flow_10s_linear_infinite] blur-[1px]"></div>

                        {/* Flowing Streaks Layer 2 (Offset & Slower) */}
                        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.6),transparent)] bg-[size:100%_400px] [background-repeat:repeat-y] animate-[stream-flow_18s_linear_infinite_reverse] blur-[2px]"></div>

                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.4),transparent_70%)] mix-blend-overlay animate-pulse"></div>

                        {/* Organic Water Blobs */}
                        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl animate-[blob-flow_15s_infinite_alternate]"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-400/20 rounded-full blur-3xl animate-[blob-flow_12s_infinite_alternate-reverse]"></div>

                        {/* Render Leaves */}
                        {leaves.map(leaf => (
                            <div
                                key={leaf.id}
                                className="absolute top-full flex items-center gap-2 max-w-[200px] text-sm font-medium text-emerald-800 dark:text-emerald-100 bg-emerald-100/90 dark:bg-emerald-900/90 px-4 py-3 rounded-tl-none rounded-br-2xl rounded-tr-2xl rounded-bl-2xl border border-emerald-200/50 shadow-md whitespace-normal animate-float-up pointer-events-none z-10"
                                style={leaf.style}
                            >
                                <Leaf size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span className="leading-tight break-words">{leaf.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={addThought} className="relative max-w-sm mx-auto">
                        <input
                            type="text"
                            value={thoughtInput}
                            onChange={(e) => setThoughtInput(e.target.value)}
                            placeholder="I'm having the thought that..."
                            className="w-full px-4 py-3 pr-12 rounded-full border border-[var(--anchor-border)] bg-[var(--anchor-surface)] text-[var(--anchor-text)] shadow-sm focus:ring-2 focus:ring-[var(--anchor-primary)] focus:border-transparent outline-none transition-all"
                        />
                        <Button
                            type="submit"
                            size="sm"
                            disabled={!thoughtInput.trim()}
                            className="absolute right-1.5 top-1.5 rounded-full w-9 h-9 p-0 flex items-center justify-center"
                        >
                            <Send size={16} />
                        </Button>
                    </form>
                </div>
            ) : (
                /* Learn Mode (Existing Cards) */
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div
                        className="relative h-64 cursor-pointer perspective-1000 group"
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        <div
                            className={`absolute inset-0 transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''
                                }`}
                        >
                            {/* Front */}
                            <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-[var(--anchor-primary-muted)]/20 to-[var(--anchor-accent)]/10 border-2 border-[var(--anchor-primary-muted)]/30 rounded-2xl p-8 flex flex-col items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                                <h3 className="text-2xl font-bold text-[var(--anchor-text)] mb-4 text-center">
                                    {currentCard.title}
                                </h3>
                                <p className="text-lg text-[var(--anchor-text-muted)] text-center leading-relaxed">
                                    {currentCard.instruction}
                                </p>
                                <p className="text-xs text-[var(--anchor-text-muted)] mt-8 opacity-60 font-medium tracking-wider uppercase">
                                    Tap to reveal
                                </p>
                            </div>

                            {/* Back */}
                            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-[var(--anchor-accent)]/20 to-[var(--anchor-primary-muted)]/10 border-2 border-[var(--anchor-accent)]/30 rounded-2xl p-8 flex flex-col items-center justify-center shadow-lg">
                                <RotateCcw size={32} className="text-[var(--anchor-accent)] mb-4 opacity-50" />
                                <p className="text-xl text-[var(--anchor-text)] text-center font-medium italic leading-relaxed">
                                    {currentCard.response}
                                </p>
                                <p className="text-xs text-[var(--anchor-text-muted)] mt-8 opacity-60 font-medium tracking-wider uppercase">
                                    Tap to flip back
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-4">
                        <Button variant="ghost" onClick={handlePrevious}>← Prev</Button>
                        <span className="text-xs font-mono text-[var(--anchor-text-muted)]">{currentIndex + 1}/{exercises.length}</span>
                        <Button variant="ghost" onClick={handleNext}>Next →</Button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes float-up {
                    0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    25% { transform: translateY(-80px) translateX(20px) rotate(5deg); }
                    50% { transform: translateY(-160px) translateX(-15px) rotate(-5deg); }
                    75% { transform: translateY(-260px) translateX(10px) rotate(3deg); }
                    100% { transform: translateY(-400px) translateX(0) rotate(10deg); opacity: 0; }
                }
                @keyframes stream-flow {
                    0% { background-position: 0 0; }
                    100% { background-position: 0 400px; }
                }
                @keyframes blob-flow {
                    0% { transform: scale(1) translate(0, 0) rotate(0deg); }
                    100% { transform: scale(1.2) translate(30px, 20px) rotate(10deg); }
                }
                .animate-float-up {
                    animation-name: float-up;
                    animation-timing-function: ease-in-out;
                    animation-fill-mode: forwards;
                }
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .rotate-y-0 { transform: rotateY(0deg); }
            `}</style>
        </div>
    );
};
