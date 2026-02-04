import { useState, useEffect } from 'react';
import { Timer, Play, Pause, Wind, Eye, MessageSquare, Brain, Heart } from 'lucide-react';
import { Button } from '../ui/Button';
import { BreathingGuide } from '../session/BreathingGuide';
import { SensoryGrounding } from '../session/SensoryGrounding';
import { GroundingPrompt } from '../session/GroundingPrompt';
import { UrgeSurfing } from './UrgeSurfing';
import { CognitiveDefusion } from './CognitiveDefusion';
import { ValuesReminder } from './ValuesReminder';
import { getRandomValidation } from '../../utils/grounding';

interface ReassuranceTimerProps {
    durationSeconds: number;
    onComplete: (copingToolsUsed: string[]) => void;
    onGiveIn: (copingToolsUsed: string[]) => void;
}

type CopingTool = 'breathing' | 'grounding' | 'validation' | 'urge-surfing' | 'defusion' | 'values';

export const ReassuranceTimer = ({ durationSeconds, onComplete, onGiveIn }: ReassuranceTimerProps) => {
    const [timeRemaining, setTimeRemaining] = useState(durationSeconds);
    const [isRunning, setIsRunning] = useState(true);
    const [activeTool, setActiveTool] = useState<CopingTool | null>(null);
    const [toolsUsed, setToolsUsed] = useState<Set<string>>(new Set());
    const [groundingMessage] = useState(getRandomValidation());

    useEffect(() => {
        if (!isRunning || timeRemaining <= 0) return;

        const interval = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    setIsRunning(false);
                    onComplete(Array.from(toolsUsed));
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning, timeRemaining, onComplete, toolsUsed]);

    const handleToolClick = (tool: CopingTool) => {
        setActiveTool(tool);
        setToolsUsed((prev) => new Set([...prev, tool]));
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = ((durationSeconds - timeRemaining) / durationSeconds) * 100;

    return (
        <div className="space-y-8">
            {/* Timer Display */}
            <div className="relative">
                <div className="absolute -inset-4 bg-[var(--anchor-accent)]/10 blur-3xl opacity-50 rounded-full" />
                <div className="relative bg-gradient-to-br from-[var(--anchor-surface)] to-[var(--anchor-primary-muted)]/5 border-2 border-[var(--anchor-accent)]/30 rounded-2xl p-8 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Timer size={32} className="text-[var(--anchor-accent)]" />
                        <h2 className="heading text-3xl text-[var(--anchor-text)]">Riding the Wave</h2>
                    </div>

                    <div className="text-6xl font-bold text-[var(--anchor-accent)] mb-4 font-mono">
                        {formatTime(timeRemaining)}
                    </div>

                    {/* Progress ring */}
                    <div className="relative w-48 h-48 mx-auto mb-6">
                        <svg className="transform -rotate-90 w-48 h-48">
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                className="text-gray-200"
                            />
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 88}`}
                                strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                                className="text-[var(--anchor-accent)] transition-all duration-1000"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-semibold text-[var(--anchor-text)]">
                                {Math.round(progress)}%
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-center">
                        <Button
                            variant="ghost"
                            onClick={() => setIsRunning(!isRunning)}
                            className="px-6"
                        >
                            {isRunning ? <Pause size={20} className="mr-2" /> : <Play size={20} className="mr-2" />}
                            {isRunning ? 'Pause' : 'Resume'}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => onGiveIn(Array.from(toolsUsed))}
                            className="px-6 text-red-600 hover:bg-red-50"
                        >
                            I Need to Ask
                        </Button>
                    </div>
                </div>
            </div>

            {/* Coping Tools */}
            <div>
                <h3 className="heading text-xl mb-4 text-[var(--anchor-text)]">Coping Tools</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <button
                        onClick={() => handleToolClick('urge-surfing')}
                        className={`p-4 rounded-lg border-2 transition-all ${activeTool === 'urge-surfing'
                            ? 'border-[var(--anchor-accent)] bg-[var(--anchor-accent)]/10'
                            : 'border-[var(--anchor-border)] bg-[var(--anchor-surface)] hover:border-[var(--anchor-accent)]/50'
                            }`}
                    >
                        <Timer size={24} className="mx-auto mb-2 text-[var(--anchor-accent)]" />
                        <span className="text-sm font-semibold">Urge Surfing</span>
                    </button>

                    <button
                        onClick={() => handleToolClick('defusion')}
                        className={`p-4 rounded-lg border-2 transition-all ${activeTool === 'defusion'
                            ? 'border-[var(--anchor-primary)] bg-[var(--anchor-primary)]/10'
                            : 'border-[var(--anchor-border)] bg-[var(--anchor-surface)] hover:border-[var(--anchor-primary)]/50'
                            }`}
                    >
                        <Brain size={24} className="mx-auto mb-2 text-[var(--anchor-primary)]" />
                        <span className="text-sm font-semibold">Defusion</span>
                    </button>

                    <button
                        onClick={() => handleToolClick('values')}
                        className={`p-4 rounded-lg border-2 transition-all ${activeTool === 'values'
                            ? 'border-[var(--anchor-secondary)] bg-[var(--anchor-secondary)]/10'
                            : 'border-[var(--anchor-border)] bg-[var(--anchor-surface)] hover:border-[var(--anchor-secondary)]/50'
                            }`}
                    >
                        <Heart size={24} className="mx-auto mb-2 text-[var(--anchor-secondary)]" />
                        <span className="text-sm font-semibold">Your Why</span>
                    </button>

                    <button
                        onClick={() => handleToolClick('breathing')}
                        className={`p-4 rounded-lg border-2 transition-all ${activeTool === 'breathing'
                            ? 'border-[var(--anchor-secondary)] bg-[var(--anchor-secondary)]/10'
                            : 'border-[var(--anchor-border)] bg-[var(--anchor-surface)] hover:border-[var(--anchor-secondary)]/50'
                            }`}
                    >
                        <Wind size={24} className="mx-auto mb-2 text-[var(--anchor-secondary)]" />
                        <span className="text-sm font-semibold">Breathe</span>
                    </button>

                    <button
                        onClick={() => handleToolClick('grounding')}
                        className={`p-4 rounded-lg border-2 transition-all ${activeTool === 'grounding'
                            ? 'border-[var(--anchor-accent)] bg-[var(--anchor-accent)]/10'
                            : 'border-[var(--anchor-border)] bg-[var(--anchor-surface)] hover:border-[var(--anchor-accent)]/50'
                            }`}
                    >
                        <Eye size={24} className="mx-auto mb-2 text-[var(--anchor-accent)]" />
                        <span className="text-sm font-semibold">Senses</span>
                    </button>

                    <button
                        onClick={() => handleToolClick('validation')}
                        className={`p-4 rounded-lg border-2 transition-all ${activeTool === 'validation'
                            ? 'border-[var(--anchor-primary)] bg-[var(--anchor-primary)]/10'
                            : 'border-[var(--anchor-border)] bg-[var(--anchor-surface)] hover:border-[var(--anchor-primary)]/50'
                            }`}
                    >
                        <MessageSquare size={24} className="mx-auto mb-2 text-[var(--anchor-primary)]" />
                        <span className="text-sm font-semibold">Whisper</span>
                    </button>
                </div>
            </div>

            {/* Active Tool Display */}
            {activeTool && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-[var(--anchor-surface)] border-2 border-[var(--anchor-border)] rounded-lg p-6">
                        {activeTool === 'urge-surfing' && <UrgeSurfing />}
                        {activeTool === 'defusion' && <CognitiveDefusion />}
                        {activeTool === 'values' && <ValuesReminder />}
                        {activeTool === 'breathing' && <BreathingGuide patternType="box" />}
                        {activeTool === 'grounding' && <SensoryGrounding />}
                        {activeTool === 'validation' && <GroundingPrompt message={groundingMessage} />}
                    </div>
                </div>
            )}
        </div>
    );
};
