import { useState, useEffect } from 'react';
import { Wind } from 'lucide-react';

type BreathingPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

interface BreathingPattern {
    name: string;
    phases: { phase: BreathingPhase; duration: number; label: string }[];
    rounds: number;
}

const patterns: Record<string, BreathingPattern> = {
    box: {
        name: 'Box Breathing',
        phases: [
            { phase: 'inhale', duration: 4, label: 'Breathe In' },
            { phase: 'hold1', duration: 4, label: 'Hold' },
            { phase: 'exhale', duration: 4, label: 'Breathe Out' },
            { phase: 'hold2', duration: 4, label: 'Hold' },
        ],
        rounds: 4,
    },
    '478': {
        name: '4-7-8 Breathing',
        phases: [
            { phase: 'inhale', duration: 4, label: 'Breathe In' },
            { phase: 'hold1', duration: 7, label: 'Hold' },
            { phase: 'exhale', duration: 8, label: 'Breathe Out' },
        ],
        rounds: 4,
    },
};

interface BreathingGuideProps {
    patternType?: 'box' | '478';
    onComplete?: () => void;
}

export const BreathingGuide = ({ patternType = 'box', onComplete }: BreathingGuideProps) => {
    const pattern = patterns[patternType];
    const [isActive, setIsActive] = useState(false);
    const [currentRound, setCurrentRound] = useState(1);
    const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
    const [countdown, setCountdown] = useState(pattern.phases[0].duration);

    const currentPhase = pattern.phases[currentPhaseIndex];

    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    // Move to next phase
                    const nextPhaseIndex = (currentPhaseIndex + 1) % pattern.phases.length;

                    if (nextPhaseIndex === 0) {
                        // Completed a round
                        if (currentRound >= pattern.rounds) {
                            // Completed all rounds
                            setIsActive(false);
                            onComplete?.();
                            return pattern.phases[0].duration;
                        }
                        setCurrentRound((r) => r + 1);
                    }

                    setCurrentPhaseIndex(nextPhaseIndex);
                    return pattern.phases[nextPhaseIndex].duration;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, currentPhaseIndex, currentRound, pattern, onComplete]);

    const handleStart = () => {
        setIsActive(true);
        setCurrentRound(1);
        setCurrentPhaseIndex(0);
        setCountdown(pattern.phases[0].duration);
    };

    const handleStop = () => {
        setIsActive(false);
        setCurrentRound(1);
        setCurrentPhaseIndex(0);
        setCountdown(pattern.phases[0].duration);
    };

    const getCircleScale = () => {
        if (currentPhase.phase === 'inhale') {
            return 1 + (pattern.phases[0].duration - countdown) / pattern.phases[0].duration * 0.5;
        }
        if (currentPhase.phase === 'exhale') {
            return 1.5 - (pattern.phases[currentPhaseIndex].duration - countdown) / pattern.phases[currentPhaseIndex].duration * 0.5;
        }
        return currentPhase.phase === 'hold1' ? 1.5 : 1;
    };

    const getCircleColor = () => {
        switch (currentPhase.phase) {
            case 'inhale': return 'oklch(70% 0.15 200)'; // Blue
            case 'hold1': return 'oklch(75% 0.12 80)'; // Amber
            case 'exhale': return 'oklch(70% 0.15 140)'; // Green
            case 'hold2': return 'oklch(70% 0.05 250)'; // Gray
        }
    };

    return (
        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3 mb-6">
                <Wind size={24} className="text-blue-600" />
                <div>
                    <h3 className="heading text-lg">{pattern.name}</h3>
                    <p className="text-sm text-muted">
                        Round {currentRound} of {pattern.rounds}
                    </p>
                </div>
            </div>

            {/* Breathing Circle */}
            <div className="flex flex-col items-center gap-6 py-8">
                <div className="relative w-64 h-64 flex items-center justify-center">
                    <div
                        className="absolute rounded-full transition-all duration-1000 ease-in-out"
                        style={{
                            width: '200px',
                            height: '200px',
                            backgroundColor: getCircleColor(),
                            transform: `scale(${getCircleScale()})`,
                            opacity: 0.3,
                        }}
                    />
                    <div className="relative z-10 text-center">
                        <div className="text-5xl font-bold heading mb-2">{countdown}</div>
                        <div className="text-xl text-gray-700">{currentPhase.label}</div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-3">
                    {!isActive ? (
                        <button onClick={handleStart} className="btn btn-primary px-8 py-3">
                            Start
                        </button>
                    ) : (
                        <button onClick={handleStop} className="btn btn-secondary px-8 py-3">
                            Stop
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
