import { useState, useEffect, useRef } from 'react';
import { Waves, Play, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';

export const UrgeSurfing = () => {
    // 3 minutes default for a typical urge peak
    const DURATION = 180;

    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(DURATION);
    const [completed, setCompleted] = useState(false);

    // Wave animation refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const timeRef = useRef(0);
    const animationRef = useRef<number>(0);

    const toggleSession = () => {
        if (completed) {
            // Reset
            setCompleted(false);
            setTimeLeft(DURATION);
            setIsActive(true);
        } else {
            setIsActive(!isActive);
        }
    };

    const reset = () => {
        setIsActive(false);
        setTimeLeft(DURATION);
        setCompleted(false);
    };

    // Timer Logic
    useEffect(() => {
        if (!isActive || timeLeft <= 0) {
            if (timeLeft <= 0 && isActive) {
                setIsActive(false);
                setCompleted(true);
            }
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    // Draw Wave
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const animate = () => {
            if (!canvas) return;
            // Handle high-DPI displays
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();

            // Set actual size in memory (scaled to account for extra pixel density)
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;

            ctx.scale(dpr, dpr);
            ctx.clearRect(0, 0, rect.width, rect.height);

            // Calculate "calmness" progress (0 = storm, 1 = calm)
            const progress = 1 - (timeLeft / DURATION);

            // --- PHYSICS PARAMETERS ---
            // Base Amplitude: Starts at 50, decays to 8
            const baseAmp = 50 - (progress * 42);

            // Vertical Tide (Heave): The whole water moves up and down slowly
            // Starts fast/deep, becomes slow/shallow
            const heaveAmp = 10 - (progress * 8);
            // FIX: Drastically reduced speed multiplier from 0.5 to 0.02 for slow tide
            const verticalShift = Math.sin(timeRef.current * 0.02) * heaveAmp;

            // Wave Component 1: The Swell (Big, Slow)
            const w1_freq = 0.008;
            const w1_speed = 0.01;

            // Wave Component 2: The Chop (Medium, faster)
            const w2_freq = 0.02;
            const w2_speed = 0.025;
            const w2_ampMult = 0.5;

            // Wave Component 3: Surface Noise (Small, fast)
            // This fades out almost completely when calm
            const w3_freq = 0.04;
            const w3_speed = 0.03; // Slightly slower
            const w3_ampMult = 0.2 * (1 - progress);

            // Water gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
            gradient.addColorStop(0, 'rgba(56, 189, 248, 0.4)'); // Sky blue top
            gradient.addColorStop(1, 'rgba(14, 165, 233, 0.1)'); // Fades out

            ctx.beginPath();
            ctx.moveTo(0, rect.height / 2);

            // Draw composed wave (Sum of Sines)
            for (let x = 0; x < rect.width; x++) {
                // Time offsets for parallax
                const t = timeRef.current;

                // Superposition
                const y1 = Math.sin(x * w1_freq + t * w1_speed) * baseAmp;
                const y2 = Math.sin(x * w2_freq + t * w2_speed + 100) * (baseAmp * w2_ampMult);
                const y3 = Math.sin(x * w3_freq + t * w3_speed + 200) * (baseAmp * w3_ampMult);

                // Final Y position + Vertical Tide
                const y = (rect.height / 2) + verticalShift + y1 + y2 + y3;

                ctx.lineTo(x, y);
            }

            // Fill
            ctx.lineTo(rect.width, rect.height);
            ctx.lineTo(0, rect.height);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Top stroke (crest)
            ctx.beginPath();
            for (let x = 0; x < rect.width; x++) {
                const t = timeRef.current;
                const y1 = Math.sin(x * w1_freq + t * w1_speed) * baseAmp;
                const y2 = Math.sin(x * w2_freq + t * w2_speed + 100) * (baseAmp * w2_ampMult);
                const y3 = Math.sin(x * w3_freq + t * w3_speed + 200) * (baseAmp * w3_ampMult);
                const y = (rect.height / 2) + verticalShift + y1 + y2 + y3;
                ctx.lineTo(x, y);
            }
            ctx.strokeStyle = `rgba(14, 165, 233, ${0.9 - (progress * 0.4)})`;
            ctx.lineWidth = 3 - (progress * 1); // Thinner line as it calms
            ctx.lineCap = 'round';
            ctx.stroke();

            // Update time - reduced base speed slightly
            timeRef.current += isActive ? (1.0 - progress * 0.5) : 0.1;

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isActive, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6 w-full max-w-lg mx-auto">
            {/* Header / Context */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--anchor-surface)] border border-[var(--anchor-border)] rounded-full text-sm text-[var(--anchor-text-muted)] animate-in fade-in slide-in-from-bottom-2">
                    <Waves size={16} />
                    <span>{completed ? "Session Complete" : "Urge Surfing"}</span>
                </div>
                <p className="text-[var(--anchor-text)] font-medium text-lg min-h-[1.75rem] transition-all">
                    {completed
                        ? "The wave has passed."
                        : isActive
                            ? "Just watch the wave. Let it settle."
                            : "Urges typically peak and subside in 3 minutes."}
                </p>
            </div>

            {/* Main Visualizer */}
            <div className="relative h-64 bg-gradient-to-b from-[var(--anchor-surface)] to-[var(--anchor-primary)]/5 rounded-3xl border border-[var(--anchor-border)] overflow-hidden shadow-lg transition-all duration-700">
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                    style={{ width: '100%', height: '100%' }}
                />

                {/* Overlay Timer */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="flex flex-col items-center gap-2">
                        {completed ? (
                            <div className="w-16 h-16 bg-[var(--anchor-surface)] rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                                <CheckCircle2 size={32} className="text-[var(--anchor-success)]" />
                            </div>
                        ) : (
                            <span className={`text-4xl font-mono font-bold font-display transition-opacity duration-300 ${isActive ? 'opacity-30 text-[var(--anchor-text)]' : 'opacity-80 text-[var(--anchor-text-muted)]'}`}>
                                {formatTime(timeLeft)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4 pt-2">
                {!completed ? (
                    <>
                        <Button
                            size="lg"
                            className="w-40 rounded-full shadow-md text-lg h-14"
                            onClick={toggleSession}
                        >
                            <span className="flex items-center gap-2">
                                {isActive ? (
                                    <>Pause</>
                                ) : (
                                    <>
                                        <Play size={20} className="fill-current" /> Begin
                                    </>
                                )}
                            </span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="lg"
                            className="w-14 h-14 rounded-full border border-[var(--anchor-border)]"
                            onClick={reset}
                        >
                            <RotateCcw size={20} />
                        </Button>
                    </>
                ) : (
                    <Button
                        size="lg"
                        className="w-48 rounded-full shadow-md text-lg h-14"
                        onClick={reset}
                    >
                        Start Again
                    </Button>
                )}
            </div>

            {/* Footer Tip */}
            <p className="text-center text-xs text-[var(--anchor-text-muted)] max-w-xs mx-auto opacity-70 leading-relaxed">
                You don't have to push the wave away. <br />
                Just stay afloat until it reaches the shore.
            </p>
        </div>
    );
};
