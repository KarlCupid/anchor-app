import { useState } from 'react';
import { List, BookOpen, TrendingUp, BarChart3 } from 'lucide-react';
import { PanicButton } from './PanicButton';
import { StreakCounter } from './StreakCounter';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { getRandomExercise, getRandomValidation } from '../../utils/grounding';

interface DashboardProps {
    onNavigate: (view: 'ladder' | 'log' | 'analytics') => void;
    onStartSession: () => void;
}

export const Dashboard = ({ onNavigate, onStartSession }: DashboardProps) => {
    const [showGrounding, setShowGrounding] = useState(false);
    const [groundingExercise, setGroundingExercise] = useState(getRandomExercise());
    const [validationMessage, setValidationMessage] = useState(getRandomValidation());

    const handlePanicPress = () => {
        // Get new random exercise and validation
        setGroundingExercise(getRandomExercise());
        setValidationMessage(getRandomValidation());
        setShowGrounding(true);
    };

    return (
        <div className="min-h-screen bg-(--anchor-bg) pb-32">
            <div className="max-w-2xl mx-auto space-y-10">
                {/* Header */}
                <header className="text-center py-12 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <h1 className="heading text-5xl md:text-6xl mb-3 tracking-tight text-(--anchor-primary)">Anchor</h1>
                    <p className="text-(--anchor-text-muted) text-lg font-medium">Your sanctuary in the storm</p>
                </header>

                {/* Panic Button - Intentional separation */}
                <section className="animate-in fade-in zoom-in-95 duration-700 delay-200 fill-mode-both" data-tour="panic-button">
                    <PanicButton onPress={handlePanicPress} />
                </section>

                {/* Streak Counter */}
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both" data-tour="streak-counter">
                    <StreakCounter />
                </section>

                {/* Quick Actions */}
                <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400 fill-mode-both">
                    <h2 className="heading text-2xl mb-4 px-2">Journey</h2>

                    <div className="grid gap-6">
                        <Card
                            hoverable
                            variant="glass"
                            onClick={() => onNavigate('ladder')}
                            className="group flex items-center gap-8 cursor-pointer border border-white/40 hover:border-[var(--anchor-primary)]/30 transition-all p-2 pr-6 overflow-hidden relative"
                            data-tour="exposure-ladder"
                        >
                            <div className="relative p-6 bg-[var(--anchor-primary)]/5 rounded-[var(--radius-md)] group-hover:bg-[var(--anchor-primary)]/10 transition-colors duration-500">
                                <div className="absolute inset-0 bg-[var(--anchor-primary)]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <List size={32} strokeWidth={1.5} className="relative z-10 text-[var(--anchor-primary)] group-hover:scale-110 transition-transform duration-500 will-change-transform" />
                            </div>
                            <div className="flex-1 py-4">
                                <h3 className="font-display font-semibold text-2xl text-[var(--anchor-text)] mb-1">Exposure Ladder</h3>
                                <p className="text-base text-[var(--anchor-text-muted)] leading-relaxed">Architect your fear hierarchy</p>
                            </div>
                        </Card>

                        <Card
                            hoverable
                            variant="default"
                            onClick={onStartSession}
                            className="group flex items-center gap-8 cursor-pointer bg-gradient-to-br from-[var(--anchor-surface)] to-[var(--anchor-secondary)]/10 border-none shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all p-2 pr-6 overflow-hidden"
                            data-tour="begin-session"
                        >
                            <div className="relative p-6 bg-[var(--anchor-secondary)]/10 rounded-[var(--radius-md)] group-hover:bg-[var(--anchor-secondary)]/15 transition-colors duration-500">
                                <div className="absolute inset-0 bg-[var(--anchor-secondary)]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <BookOpen size={32} strokeWidth={1.5} className="relative z-10 text-[var(--anchor-secondary)] group-hover:scale-110 transition-transform duration-500 will-change-transform" />
                            </div>
                            <div className="flex-1 py-4">
                                <h3 className="font-display font-semibold text-2xl text-[var(--anchor-text)] mb-1">Begin Session</h3>
                                <p className="text-base text-[var(--anchor-text-muted)] leading-relaxed">Practice courageous presence</p>
                            </div>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card
                                hoverable
                                onClick={() => onNavigate('log')}
                                className="group flex flex-col gap-6 cursor-pointer p-6"
                                data-tour="victory-log"
                            >
                                <div className="p-4 bg-[var(--anchor-accent)]/10 w-fit rounded-[var(--radius-md)] group-hover:bg-[var(--anchor-accent)]/20 transition-colors">
                                    <TrendingUp size={28} strokeWidth={1.5} className="text-[var(--anchor-accent)] group-hover:rotate-6 transition-transform" />
                                </div>
                                <div>
                                    <h3 className="font-display font-semibold text-xl mb-1">Victory Log</h3>
                                    <p className="text-base text-[var(--anchor-text-muted)]">Witness your evolution</p>
                                </div>
                            </Card>

                            <Card
                                hoverable
                                onClick={() => onNavigate('analytics')}
                                className="group flex flex-col gap-6 cursor-pointer p-6"
                                data-tour="analytics"
                            >
                                <div className="p-4 bg-[var(--anchor-primary-muted)]/10 w-fit rounded-[var(--radius-md)] group-hover:bg-[var(--anchor-primary-muted)]/20 transition-colors">
                                    <BarChart3 size={28} strokeWidth={1.5} className="text-[var(--anchor-primary)] group-hover:-rotate-3 transition-transform" />
                                </div>
                                <div>
                                    <h3 className="font-display font-semibold text-xl mb-1">Insights</h3>
                                    <p className="text-base text-[var(--anchor-text-muted)]">Trace your path to peace</p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </section>
            </div>

            {/* Grounding Modal Extension */}
            <Modal
                isOpen={showGrounding}
                onClose={() => setShowGrounding(false)}
                title="Sacred Grounding"
                size="md"
            >
                <div className="space-y-8">
                    {/* Validation Message */}
                    <div className="p-6 bg-(--anchor-primary-muted)/5 border-l-4 border-(--anchor-primary) rounded-(--radius-sm)">
                        <p className="text-xl font-medium leading-relaxed text-(--anchor-text)">"{validationMessage}"</p>
                    </div>

                    {/* Exercise */}
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="heading text-2xl text-(--anchor-secondary)">{groundingExercise.name}</h3>
                            <span className="px-3 py-1 bg-(--anchor-bg) rounded-full text-xs font-mono text-(--anchor-text-muted)">
                                ~{Math.floor(groundingExercise.duration / 60)}m
                            </span>
                        </div>

                        <ol className="space-y-4">
                            {groundingExercise.instructions.map((instruction, index) => (
                                <li key={index} className="flex gap-4 group">
                                    <span className="flex-shrink-0 w-8 h-8 bg-(--anchor-primary-muted)/10 text-(--anchor-primary) rounded-full flex items-center justify-center text-sm font-bold group-hover:bg-(--anchor-primary) group-hover:text-white transition-colors duration-300">
                                        {index + 1}
                                    </span>
                                    <span className="pt-1 text-lg leading-snug text-(--anchor-text)">{instruction}</span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setGroundingExercise(getRandomExercise());
                                setValidationMessage(getRandomValidation());
                            }}
                            className="flex-1"
                        >
                            Another Path
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => setShowGrounding(false)}
                            className="flex-1"
                        >
                            I am Anchored
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
