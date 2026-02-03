
import { Pause, Play, Plus } from 'lucide-react';

interface DelayTimerProps {
    durationSeconds: number;
    elapsedSeconds: number;
    isRunning: boolean;
    onToggle: () => void;
    onExtend: (seconds: number) => void;
}

export const DelayTimer = ({
    durationSeconds,
    elapsedSeconds,
    isRunning,
    onToggle,
    onExtend
}: DelayTimerProps) => {
    const remainingSeconds = Math.max(0, durationSeconds - elapsedSeconds);
    const progress = (elapsedSeconds / durationSeconds) * 100;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Color based on progress
    const getColor = () => {
        if (progress < 33) return 'oklch(70% 0.1 180)'; // Green
        if (progress < 66) return 'oklch(75% 0.12 80)'; // Amber
        return 'oklch(60% 0.18 25)'; // Red
    };

    return (
        <div className="flex flex-col items-center gap-6">
            {/* Circular Progress */}
            <div className="relative w-64 h-64">
                <svg className="w-full h-full transform -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx="128"
                        cy="128"
                        r="120"
                        fill="none"
                        stroke="oklch(95% 0.01 250)"
                        strokeWidth="16"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="128"
                        cy="128"
                        r="120"
                        fill="none"
                        stroke={getColor()}
                        strokeWidth="16"
                        strokeDasharray={`${2 * Math.PI * 120}`}
                        strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
                    />
                </svg>

                {/* Time Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-6xl font-bold heading" style={{ color: getColor() }}>
                        {formatTime(remainingSeconds)}
                    </div>
                    <div className="text-sm text-muted mt-2">remaining</div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
                <button
                    onClick={onToggle}
                    className="btn btn-primary px-8 py-3 flex items-center gap-2"
                >
                    {isRunning ? (
                        <>
                            <Pause size={20} />
                            Pause
                        </>
                    ) : (
                        <>
                            <Play size={20} />
                            Resume
                        </>
                    )}
                </button>

                <button
                    onClick={() => onExtend(300)}
                    className="btn btn-secondary px-6 py-3 flex items-center gap-2"
                    title="Add 5 minutes"
                >
                    <Plus size={20} />
                    +5 min
                </button>
            </div>
        </div>
    );
};
