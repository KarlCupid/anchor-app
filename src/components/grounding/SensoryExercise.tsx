import { useState, useEffect, useRef } from 'react';
import { Eye, Hand, Ear, Sun, Snowflake, CheckCircle2, ArrowRight, Plus } from 'lucide-react';
import { Button } from '../ui/Button';

interface Step {
    count: number;
    label: string;
    verb: string;
}

interface SensoryExerciseProps {
    steps: Step[];
    onComplete?: () => void;
}

export const SensoryExercise = ({ steps, onComplete }: SensoryExerciseProps) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [observations, setObservations] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const currentStep = steps[currentStepIndex];
    const isLastStep = currentStepIndex === steps.length - 1;

    // Focus on mount
    useEffect(() => {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 500);
    }, []);

    const handleAddObservation = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (inputValue.trim() && observations.length < currentStep.count) {
            setObservations(prev => [...prev, inputValue.trim()]);
            setInputValue('');
            // Keep focus for rapid entry unless finished
            if (observations.length + 1 < currentStep.count) {
                inputRef.current?.focus();
            }
        }
    };

    const handleNextStep = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            if (isLastStep) {
                onComplete?.();
            } else {
                setCurrentStepIndex(prev => prev + 1);
                setObservations([]);
                setInputValue('');
                setIsTransitioning(false);
                setTimeout(() => {
                    inputRef.current?.focus();
                }, 50);
            }
        }, 800);
    };

    const getIcon = (verb: string) => {
        const className = "text-[var(--anchor-surface)]";
        switch (verb) {
            case 'find': return <Eye size={48} className={className} />;
            case 'touch': return <Hand size={48} className={className} />;
            case 'hear': return <Ear size={48} className={className} />;
            case 'smell': return <Sun size={48} className={className} />;
            case 'taste': return <Snowflake size={48} className={className} />;
            default: return <CheckCircle2 size={48} className={className} />;
        }
    };

    const getBgColor = (verb: string) => {
        switch (verb) {
            case 'find': return 'bg-blue-500';
            case 'touch': return 'bg-emerald-500';
            case 'hear': return 'bg-purple-500';
            case 'smell': return 'bg-amber-500';
            case 'taste': return 'bg-rose-500';
            default: return 'bg-[var(--anchor-primary)]';
        }
    };

    const progress = ((currentStepIndex + (observations.length / currentStep.count)) / steps.length) * 100;
    const isStepComplete = observations.length >= currentStep.count;

    return (
        <div className="py-6 space-y-6 w-full max-w-lg mx-auto overflow-hidden">
            {/* Minimal Header */}
            <div className="flex items-center justify-between text-sm text-[var(--anchor-text-muted)]">
                <span>Step {currentStepIndex + 1} of {steps.length}</span>
                <span>{Math.round(progress)}%</span>
            </div>

            <div className="w-full h-1.5 bg-[var(--anchor-surface)] border border-[var(--anchor-border)] rounded-full overflow-hidden">
                <div
                    className="h-full bg-[var(--anchor-primary)] transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Main Card */}
            <div className={`relative bg-[var(--anchor-surface)] border border-[var(--anchor-border)] rounded-2xl shadow-xl p-6 md:p-8 transition-all duration-500 transform ${isTransitioning ? 'opacity-0 scale-95 translate-x-4' : 'opacity-100 scale-100 translate-x-0'}`}>

                <div className="flex flex-col items-center text-center space-y-4 mb-6">
                    <div className={`w-16 h-16 ${getBgColor(currentStep.verb)} rounded-2xl shadow-lg flex items-center justify-center text-white transform rotate-3 hover:rotate-6 transition-transform duration-300`}>
                        {getIcon(currentStep.verb)}
                    </div>
                    <div>
                        <h3 className="text-2xl font-display font-bold text-[var(--anchor-text)]">
                            {currentStep.verb.charAt(0).toUpperCase() + currentStep.verb.slice(1)} {currentStep.count} things
                        </h3>
                        <p className="text-[var(--anchor-text-muted)] text-sm">
                            Type what you {currentStep.verb} to anchor yourself.
                        </p>
                    </div>
                </div>

                {/* Observations List (Chips) */}
                <div className="flex flex-wrap gap-2 mb-6 min-h-[40px] justify-center">
                    {observations.map((obs, i) => (
                        <span key={i} className="animate-in zoom-in fade-in duration-300 inline-flex items-center px-3 py-1 rounded-full bg-[var(--anchor-primary)]/10 text-[var(--anchor-primary)] text-sm font-medium border border-[var(--anchor-primary)]/20">
                            {obs}
                            <CheckCircle2 size={12} className="ml-1.5 opacity-60" />
                        </span>
                    ))}
                    {/* Placeholders */}
                    {Array.from({ length: Math.max(0, currentStep.count - observations.length) }).map((_, i) => (
                        <div key={`placeholder-${i}`} className="w-8 h-8 rounded-full border border-dashed border-[var(--anchor-border)] bg-[var(--anchor-bg)] opacity-50" />
                    ))}
                </div>

                {/* Input Area */}
                <div className="relative">
                    {!isStepComplete ? (
                        <form onSubmit={handleAddObservation} className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={`I ${currentStep.verb}...`}
                                className="w-full pl-4 pr-12 py-3.5 rounded-xl border border-[var(--anchor-border)] bg-[var(--anchor-bg)] text-[var(--anchor-text)] shadow-sm focus:ring-2 focus:ring-[var(--anchor-primary)] focus:border-transparent outline-none transition-all text-base"
                                autoFocus
                            />
                            <Button
                                type="submit"
                                size="sm"
                                disabled={!inputValue.trim()}
                                className="absolute right-1.5 top-1.5 h-9 w-9 p-0 rounded-lg flex items-center justify-center"
                            >
                                <Plus size={18} />
                            </Button>
                        </form>
                    ) : (
                        <Button
                            size="lg"
                            variant="primary"
                            className="w-full text-lg h-14 rounded-xl animate-in zoom-in duration-300 shadow-[var(--shadow-lg)]"
                            onClick={handleNextStep}
                        >
                            {isLastStep ? "Complete Exercise" : (
                                <span className="flex items-center gap-2">
                                    Next Step <ArrowRight size={20} />
                                </span>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            <p className="text-center text-xs text-[var(--anchor-text-muted)] opacity-60 animate-pulse">
                {isStepComplete ? "Great job. Take a breath." : "Look around slowly..."}
            </p>
        </div>
    );
};
