import { useState, useEffect, useRef } from 'react';
import { Wind, Settings2, Volume2, VolumeX, Smartphone } from 'lucide-react';
import { Button } from '../ui/Button';

interface BreathingExerciseProps {
    phases: number[]; // [inhale, hold, exhale, hold-empty]
    onComplete?: () => void;
}

type Phase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

const PRESETS = [
    { name: '4-7-8 Relax', phases: [4, 7, 8, 0] },
    { name: 'Box Breathing', phases: [4, 4, 4, 4] },
    { name: 'Coherent (5-5)', phases: [5, 0, 5, 0] },
];

export const BreathingExercise = ({ phases: initialPhases, onComplete }: BreathingExerciseProps) => {
    const [currentPhases, setCurrentPhases] = useState(initialPhases);
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [count, setCount] = useState(currentPhases[0]);
    const [isActive] = useState(true);
    const [hapticsEnabled, setHapticsEnabled] = useState(true);
    const [showSettings, setShowSettings] = useState(false);

    // Audio/Haptic refs
    const lastPhase = useRef(phaseIndex);

    const phaseNames: Phase[] = ['inhale', 'hold-in', 'exhale', 'hold-out'];
    const currentPhase = phaseNames[phaseIndex];

    // Reset when changing patterns
    const handlePatternChange = (newPhases: number[]) => {
        setCurrentPhases(newPhases);
        setPhaseIndex(0);
        setCount(newPhases[0]);
        setShowSettings(false);
    };

    useEffect(() => {
        if (!isActive) return;

        // Vibrate helper
        const vibrate = (pattern: number | number[]) => {
            if (hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(pattern);
            }
        };

        // Vibrate on phase change
        if (lastPhase.current !== phaseIndex) {
            if (currentPhase === 'inhale') vibrate(50);
            if (currentPhase === 'hold-in') vibrate(20);
            if (currentPhase === 'exhale') vibrate([30, 30]);
            if (currentPhase === 'hold-out') vibrate(20);
            lastPhase.current = phaseIndex;
        }

        const timer = setInterval(() => {
            setCount((prev) => {
                if (prev > 1) return prev - 1;

                // Phase switch logic
                let nextPhaseIndex = (phaseIndex + 1) % 4;
                let nextDuration = currentPhases[nextPhaseIndex];

                // Skip 0-length phases (like hold-out in 4-7-8)
                if (nextDuration === 0) {
                    nextPhaseIndex = (nextPhaseIndex + 1) % 4;
                    nextDuration = currentPhases[nextPhaseIndex];
                }

                setPhaseIndex(nextPhaseIndex);
                return nextDuration;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [phaseIndex, currentPhases, isActive, currentPhase, hapticsEnabled]);

    // Instructions
    const getInstruction = () => {
        switch (currentPhase) {
            case 'inhale': return 'Breathe In...';
            case 'hold-in': return 'Hold...';
            case 'exhale': return 'Breathe Out...';
            case 'hold-out': return 'Hold Empty...';
        }
    };

    // Dynamic scales for animation
    const getScale = () => {
        switch (currentPhase) {
            case 'inhale': return 1.5;
            case 'hold-in': return 1.5;
            case 'exhale': return 1;
            case 'hold-out': return 1;
        }
    };

    const getDuration = () => {
        // Return duration in 's' string
        switch (currentPhase) {
            case 'inhale': return `${currentPhases[0]}s`;
            case 'exhale': return `${currentPhases[2]}s`;
            default: return '0s'; // Instant for holds (state persists)
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-8 space-y-8 w-full max-w-md mx-auto">

            {/* Header Controls */}
            <div className="flex w-full justify-between items-center px-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setHapticsEnabled(!hapticsEnabled)}
                    className="text-[var(--anchor-text-muted)] hover:text-[var(--anchor-text)]"
                >
                    {hapticsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </Button>

                <div className="relative">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSettings(!showSettings)}
                        className={`text-[var(--anchor-text-muted)] hover:text-[var(--anchor-text)] ${showSettings ? 'bg-[var(--anchor-surface)]' : ''}`}
                    >
                        <Settings2 size={18} />
                    </Button>

                    {/* Settings Dropdown */}
                    {showSettings && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--anchor-surface)] border border-[var(--anchor-border)] rounded-lg shadow-[var(--shadow-lg)] p-2 z-50 animate-in fade-in zoom-in-95">
                            <p className="text-xs font-semibold text-[var(--anchor-text-muted)] px-2 py-1 mb-1">Breathing Pattern</p>
                            {PRESETS.map((preset) => (
                                <button
                                    key={preset.name}
                                    onClick={() => handlePatternChange(preset.phases)}
                                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${JSON.stringify(currentPhases) === JSON.stringify(preset.phases)
                                        ? 'bg-[var(--anchor-primary)]/10 text-[var(--anchor-primary)] font-medium'
                                        : 'text-[var(--anchor-text)] hover:bg-[var(--anchor-bg)]'
                                        }`}
                                >
                                    {preset.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Visualizer */}
            <div className="relative flex items-center justify-center w-80 h-80">
                {/* Outer ripples - purely decorative, slightly delayed */}
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="absolute inset-0 rounded-full border border-[var(--anchor-primary)]/10 transition-transform ease-in-out"
                        style={{
                            transform: `scale(${getScale() + (i * 0.1)})`,
                            transitionDuration: getDuration(),
                            opacity: currentPhase === 'inhale' || currentPhase === 'hold-in' ? 0.5 - (i * 0.1) : 0,
                        }}
                    />
                ))}

                {/* Main Action Circle */}
                <div
                    className="absolute inset-4 rounded-full bg-gradient-to-br from-[var(--anchor-primary)]/20 to-[var(--anchor-accent)]/20 backdrop-blur-sm border border-[var(--anchor-primary)]/30 shadow-[var(--shadow-lg)] transition-all ease-in-out flex items-center justify-center z-10"
                    style={{
                        transform: `scale(${getScale()})`,
                        transitionDuration: getDuration(),
                    }}
                >
                    <div className="text-[var(--anchor-primary)] opacity-80">
                        <Wind size={48} className={`transition-opacity duration-500 ${currentPhase === 'inhale' ? 'opacity-100' : 'opacity-50'}`} />
                    </div>
                </div>

                {/* Text Overlay (doesn't scale) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
                    <span className="text-6xl font-display font-bold text-[var(--anchor-text)] drop-shadow-md">
                        {count}
                    </span>
                    <span className="mt-2 text-lg font-medium text-[var(--anchor-text-muted)] tracking-wider uppercase">
                        {getInstruction()}
                    </span>
                </div>
            </div>

            {/* Footer Text */}
            <p className="text-center text-[var(--anchor-text-muted)] max-w-xs text-sm animate-pulse">
                {hapticsEnabled && (
                    <span className="flex items-center justify-center gap-1 opacity-60">
                        <Smartphone size={12} /> Haptics Active
                    </span>
                )}
            </p>

            <Button
                onClick={onComplete}
                size="lg"
                className="w-full max-w-xs rounded-full shadow-lg hover:translate-y-[-2px] transition-transform"
            >
                I'm feeling grounded
            </Button>
        </div>
    );
};
