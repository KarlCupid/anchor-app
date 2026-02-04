import { useState } from 'react';
import { Button } from '../ui/Button';
import type { GroundingExercise } from '../../utils/grounding';
import { getRandomValidation } from '../../utils/grounding';
import { BreathingExercise } from './BreathingExercise';
import { SensoryExercise } from './SensoryExercise';
import { RefreshCw, Check } from 'lucide-react';

interface GroundingSessionProps {
    exercise: GroundingExercise;
    onClose: () => void;
    onSwitchExercise: () => void;
}

type SessionState = 'intro' | 'active' | 'complete';

export const GroundingSession = ({ exercise, onClose, onSwitchExercise }: GroundingSessionProps) => {
    const [status, setStatus] = useState<SessionState>('intro');
    const [validationMessage] = useState(() => getRandomValidation());

    // Auto-advance from intro to active after reading delay (optional) or manual button?
    // Let's do manual "Start" to give them time to read the message.

    const handleComplete = () => {
        setStatus('complete');
    };

    const renderActiveContent = () => {
        if (exercise.type === 'breathing' && exercise.config?.phases) {
            return <BreathingExercise phases={exercise.config.phases} onComplete={handleComplete} />;
        }

        if (exercise.type === 'sensory' && exercise.config?.steps) {
            return <SensoryExercise steps={exercise.config.steps} onComplete={handleComplete} />;
        }

        // Fallback for exercises without enhanced config (like PMR currently)
        // Show the list text as before, but styled
        return (
            <div className="py-8 space-y-6 animate-in fade-in">
                <h3 className="heading text-2xl text-[var(--anchor-text)] text-center mb-6">Follow along slowly</h3>
                <ul className="space-y-4">
                    {exercise.instructions.map((step, i) => (
                        <li key={i} className="flex gap-4 p-4 bg-[var(--anchor-surface)] rounded-lg border border-[var(--anchor-border)]">
                            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[var(--anchor-primary-muted)]/10 text-[var(--anchor-primary)] font-bold rounded-full text-sm">
                                {i + 1}
                            </span>
                            <span className="text-[var(--anchor-text)] text-lg">{step}</span>
                        </li>
                    ))}
                </ul>
                <div className="pt-8 flex justify-center">
                    <Button onClick={handleComplete} size="lg" className="w-full max-w-xs shadow-lg">
                        I've Finished
                    </Button>
                </div>
            </div>
        );
    };

    if (status === 'intro') {
        return (
            <div className="py-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Validation Card */}
                <div className="p-8 bg-gradient-to-br from-[var(--anchor-primary-muted)]/10 to-[var(--anchor-surface)] border-l-4 border-[var(--anchor-primary)] rounded-r-[var(--radius-lg)] shadow-sm">
                    <p className="text-xl md:text-2xl font-medium leading-relaxed text-[var(--anchor-text)] italic">
                        "{validationMessage}"
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between text-[var(--anchor-text-muted)]">
                        <span className="text-sm font-semibold uppercase tracking-wider">Up Next</span>
                        <span className="px-3 py-1 bg-[var(--anchor-surface)] rounded-full text-xs border border-[var(--anchor-border)]">
                            ~{Math.floor(exercise.duration / 60)}m
                        </span>
                    </div>
                    <h2 className="heading text-4xl text-[var(--anchor-secondary)]">{exercise.name}</h2>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-4">
                    <Button
                        size="lg"
                        className="w-full text-lg py-6 shadow-[var(--shadow-lg)]"
                        onClick={() => setStatus('active')}
                    >
                        Begin Exercise
                    </Button>
                    <Button
                        variant="ghost"
                        size="lg"
                        onClick={onSwitchExercise}
                        className="w-full text-[var(--anchor-text-muted)] hover:text-[var(--anchor-text)]"
                    >
                        <RefreshCw size={18} className="mr-2" />
                        Try something else
                    </Button>
                </div>
            </div>
        );
    }

    if (status === 'complete') {
        return (
            <div className="py-12 flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-[var(--anchor-success)]/10 rounded-full flex items-center justify-center mb-4">
                    <Check size={48} className="text-[var(--anchor-success)]" />
                </div>

                <h2 className="heading text-3xl text-[var(--anchor-text)] text-center">
                    You're anchored.
                </h2>
                <p className="text-[var(--anchor-text-muted)] text-center max-w-md">
                    Well done taking this moment for yourself.
                </p>

                <div className="pt-8 w-full max-w-sm grid gap-4">
                    <Button variant="primary" size="lg" className="w-full" onClick={onClose}>
                        Return to Dashboard
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={onSwitchExercise}>
                        Do another exercise
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Header / Nav during exercise */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--anchor-border)]">
                <h3 className="font-semibold text-[var(--anchor-text-muted)]">{exercise.name}</h3>
                <button onClick={onClose} className="text-sm text-[var(--anchor-text-muted)] hover:text-[var(--anchor-text)]">
                    End Session
                </button>
            </div>

            {renderActiveContent()}
        </div>
    );
};
