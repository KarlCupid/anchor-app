import { useState, useEffect, useRef } from 'react';
import { useMachine } from '@xstate/react';
import { ArrowLeft, Activity, Wind, Eye, MessageSquare } from 'lucide-react';
import { sessionMachine } from '../../machines/sessionMachine';
import { DelayTimer } from './DelayTimer';
import { GroundingPrompt } from './GroundingPrompt';
import { BreathingGuide } from './BreathingGuide';
import { SensoryGrounding } from './SensoryGrounding';
import { VoiceMemo } from './VoiceMemo';
import { SUDSMiniChart } from './SUDSMiniChart';
import { Slider } from '../ui/Slider';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { Exposure } from '../../db';
import { createSession, updateExposure, incrementStreak, createOutcomeCheckIn } from '../../db';
import { getRandomValidation } from '../../utils/grounding';
import { useHaptic } from '../../hooks/useHaptic';
import { scheduleOutcomeCheckIn } from '../../utils/notifications';

interface ActiveSessionProps {
    exposure: Exposure;
    onComplete: () => void;
    onCancel: () => void;
}

type GroundingMode = 'validation' | 'breathing' | 'sensory';

export const ActiveSession = ({ exposure, onComplete, onCancel }: ActiveSessionProps) => {
    const [state, send] = useMachine(sessionMachine, {
        input: {
            exposure,
            sudsLog: [],
            startTime: Date.now(),
            timerDuration: 600,
            elapsedTime: 0,
            reflection: ''
        }
    });

    const haptic = useHaptic();

    // Start the session when component mounts
    useEffect(() => {
        send({ type: 'START_SESSION', exposure });
    }, [exposure, send]);

    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [currentSuds, setCurrentSuds] = useState(exposure.sudsCurrent);
    const [groundingMessage, setGroundingMessage] = useState(getRandomValidation());
    const [groundingMode, setGroundingMode] = useState<GroundingMode>('validation');
    const [reflection, setReflection] = useState('');
    const [audioMemo, setAudioMemo] = useState<string | undefined>(undefined);
    const [lastMilestone, setLastMilestone] = useState(0);

    // Keep track of state for interval closures
    const stateRef = useRef(state);
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // Timer effect
    useEffect(() => {
        if (!isTimerRunning || !state.matches('delay')) return;

        const interval = setInterval(() => {
            const currentState = stateRef.current;
            send({ type: 'TIMER_TICK' });

            // Check for 2-minute milestones
            const currentMinutes = Math.floor(currentState.context.elapsedTime / 120);
            if (currentMinutes > lastMilestone) {
                setLastMilestone(currentMinutes);
                haptic.milestone();
            }

            // Check if timer is complete
            if (currentState.context.elapsedTime >= currentState.context.timerDuration) {
                send({ type: 'TIMER_COMPLETE' });
                setIsTimerRunning(false);
                haptic.success();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isTimerRunning, state.value, send, haptic, lastMilestone]);

    // Grounding prompts every 2 minutes (for validation mode)
    useEffect(() => {
        if (!state.matches('delay') || groundingMode !== 'validation') return;

        const interval = setInterval(() => {
            setGroundingMessage(getRandomValidation());
        }, 120000); // 2 minutes

        return () => clearInterval(interval);
    }, [state.value, groundingMode]);

    const handleBeginDelay = () => {
        send({ type: 'BEGIN_DELAY' });
        setIsTimerRunning(true);
        haptic.pulse();
    };

    const handleToggleTimer = () => {
        setIsTimerRunning(!isTimerRunning);
        haptic.pulse();
    };

    const handleExtendTimer = (seconds: number) => {
        send({ type: 'EXTEND_TIMER', additionalSeconds: seconds });
        haptic.pulse();
    };

    const handleLogSuds = () => {
        send({ type: 'LOG_SUDS', suds: currentSuds });
        haptic.pulse();
    };

    const handleCompleteEarly = () => {
        send({ type: 'COMPLETE_EARLY' });
        setIsTimerRunning(false);
        haptic.success();
    };

    const handleSubmitReflection = async () => {
        send({ type: 'SUBMIT_REFLECTION', reflection });

        // Save session to database
        const outcome = state.context.elapsedTime >= state.context.timerDuration ? 'completed' : 'partial';
        const sessionId = await createSession({
            exposureId: exposure.id!,
            startedAt: new Date(state.context.startTime!),
            completedAt: new Date(),
            durationSeconds: state.context.elapsedTime,
            sudsStart: exposure.sudsCurrent,
            sudsEnd: currentSuds,
            sudsLog: state.context.sudsLog,
            reflection,
            audioBlob: audioMemo,
            outcome
        });

        // Schedule outcome check-in if there's a feared outcome
        if (exposure.fearedOutcome && exposure.fearedProbability !== undefined) {
            const scheduledAt = new Date();
            scheduledAt.setHours(scheduledAt.getHours() + 48); // 48 hours from now

            await createOutcomeCheckIn({
                sessionId,
                exposureId: exposure.id!,
                fearedOutcome: exposure.fearedOutcome,
                predictedProbability: exposure.fearedProbability,
                scheduledAt,
                outcomeOccurred: null
            });

            // Schedule the notification
            await scheduleOutcomeCheckIn(sessionId, exposure.fearedOutcome, scheduledAt);
        }

        // Update exposure
        await updateExposure(exposure.id!, {
            sudsCurrent: currentSuds,
            completedCount: exposure.completedCount + 1
        });

        // Increment streak
        await incrementStreak();

        onComplete();
    };

    const handleSkipReflection = async () => {
        send({ type: 'SKIP_REFLECTION' });

        // Save session without reflection
        const sessionId = await createSession({
            exposureId: exposure.id!,
            startedAt: new Date(state.context.startTime!),
            completedAt: new Date(),
            durationSeconds: state.context.elapsedTime,
            sudsStart: exposure.sudsCurrent,
            sudsEnd: currentSuds,
            sudsLog: state.context.sudsLog,
            audioBlob: audioMemo,
            outcome: 'partial'
        });

        // Schedule outcome check-in if there's a feared outcome
        if (exposure.fearedOutcome && exposure.fearedProbability !== undefined) {
            const scheduledAt = new Date();
            scheduledAt.setHours(scheduledAt.getHours() + 48); // 48 hours from now

            await createOutcomeCheckIn({
                sessionId,
                exposureId: exposure.id!,
                fearedOutcome: exposure.fearedOutcome,
                predictedProbability: exposure.fearedProbability,
                scheduledAt,
                outcomeOccurred: null
            });

            // Schedule the notification
            await scheduleOutcomeCheckIn(sessionId, exposure.fearedOutcome, scheduledAt);
        }

        await updateExposure(exposure.id!, {
            completedCount: exposure.completedCount + 1
        });

        await incrementStreak();
        onComplete();
    };

    return (
        <div className="min-h-screen bg-(--anchor-bg) pb-32">
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700">
                {/* Header */}
                <header className="flex items-center gap-6 py-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onCancel}
                        className="rounded-full !p-3 bg-(--anchor-surface) shadow-(--shadow-sm) hover:shadow-(--shadow-md)"
                    >
                        <ArrowLeft size={24} />
                    </Button>
                    <div className="flex-1">
                        <h1 className="heading text-3xl text-(--anchor-text) tracking-tight">Courage Session</h1>
                        <p className="text-(--anchor-text-muted) text-lg font-medium italic">"{exposure.triggerDescription}"</p>
                    </div>
                </header>

                {/* Triggered State - Immersive entry */}
                {state.matches('triggered') && (
                    <div className="animate-in zoom-in-95 fade-in duration-700">
                        <Card className="bg-linear-to-br from-(--anchor-surface) to-(--anchor-primary-muted)/10 border border-(--anchor-primary-muted)/20 p-10 text-center">
                            <div className="w-20 h-20 bg-(--anchor-primary-muted)/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                                <Activity size={40} className="text-(--anchor-primary)" />
                            </div>
                            <h2 className="heading text-3xl mb-4 text-(--anchor-text)">Take your position.</h2>
                            <p className="text-lg text-(--anchor-text-muted) leading-relaxed mb-10 max-w-md mx-auto">
                                You are about to step into a {state.context.timerDuration / 60}-minute presence practice.
                                We will breathe together, stay grounded, and watch the waves pass.
                            </p>
                            <div className="flex flex-col md:flex-row gap-4 px-4">
                                <Button variant="ghost" onClick={onCancel} className="md:flex-1 py-4 text-lg">
                                    I need a moment
                                </Button>
                                <Button variant="primary" onClick={handleBeginDelay} className="md:flex-1 py-4 text-lg shadow-(--shadow-md)">
                                    Anchor Myself
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Delay State - Active Presence */}
                {state.matches('delay') && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        {/* Timer - Central focus */}
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-(--anchor-primary-muted)/10 blur-3xl opacity-50 rounded-full group-hover:opacity-80 transition-opacity duration-(--duration-slow)" />
                            <DelayTimer
                                durationSeconds={state.context.timerDuration}
                                elapsedSeconds={state.context.elapsedTime}
                                isRunning={isTimerRunning}
                                onToggle={handleToggleTimer}
                                onExtend={handleExtendTimer}
                            />
                        </div>

                        {/* Grounding Mode Selector - Tactile feels */}
                        <section>
                            <h3 className="heading text-xl mb-6 px-2 text-(--anchor-text)">Anchoring Tools</h3>
                            <div className="flex p-1.5 bg-(--anchor-surface-secondary) rounded-(--radius-lg) shadow-inner gap-1">
                                <button
                                    onClick={() => setGroundingMode('validation')}
                                    className={`flex-1 py-3 px-4 rounded-(--radius-md) transition-all duration-(--duration-normal) flex items-center justify-center gap-2 font-display font-semibold ${groundingMode === 'validation'
                                        ? 'bg-white shadow-(--shadow-md) text-(--anchor-primary)'
                                        : 'text-(--anchor-text-muted) hover:text-(--anchor-text)'
                                        }`}
                                >
                                    <MessageSquare size={18} />
                                    <span>Whisper</span>
                                </button>
                                <button
                                    onClick={() => setGroundingMode('breathing')}
                                    className={`flex-1 py-3 px-4 rounded-(--radius-md) transition-all duration-(--duration-normal) flex items-center justify-center gap-2 font-display font-semibold ${groundingMode === 'breathing'
                                        ? 'bg-white shadow-(--shadow-md) text-(--anchor-secondary)'
                                        : 'text-(--anchor-text-muted) hover:text-(--anchor-text)'
                                        }`}
                                >
                                    <Wind size={18} />
                                    <span>Breath</span>
                                </button>
                                <button
                                    onClick={() => setGroundingMode('sensory')}
                                    className={`flex-1 py-3 px-4 rounded-(--radius-md) transition-all duration-(--duration-normal) flex items-center justify-center gap-2 font-display font-semibold ${groundingMode === 'sensory'
                                        ? 'bg-white shadow-(--shadow-md) text-(--anchor-accent)'
                                        : 'text-(--anchor-text-muted) hover:text-(--anchor-text)'
                                        }`}
                                >
                                    <Eye size={18} />
                                    <span>Senses</span>
                                </button>
                            </div>

                            {/* Grounding Content - Smooth transitions */}
                            <div className="mt-8 min-h-[180px] flex items-center justify-center">
                                <div className="w-full animate-in fade-in zoom-in-95 duration-700">
                                    {groundingMode === 'validation' && <GroundingPrompt message={groundingMessage} />}
                                    {groundingMode === 'breathing' && <BreathingGuide patternType="box" />}
                                    {groundingMode === 'sensory' && <SensoryGrounding />}
                                </div>
                            </div>
                        </section>

                        {/* SUDS Mini Chart - Organic data */}
                        {state.context.sudsLog.length > 0 && (
                            <section className="animate-in fade-in duration-1000">
                                <h3 className="heading text-xl mb-4 px-2">The Wave Pattern</h3>
                                <Card className="bg-white/40 backdrop-blur-sm shadow-inner">
                                    <SUDSMiniChart sudsLog={state.context.sudsLog} />
                                </Card>
                            </section>
                        )}

                        {/* Tracker & Control */}
                        <div className="grid gap-6">
                            <Card className="border border-(--anchor-primary-muted)/10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-(--anchor-bg) rounded-full shadow-inner">
                                        <Activity size={24} className="text-(--anchor-primary)" />
                                    </div>
                                    <h3 className="heading text-xl">Heart Check</h3>
                                </div>
                                <Slider
                                    label="Distress Intensity"
                                    value={currentSuds}
                                    onChange={(e) => setCurrentSuds(Number((e.target as HTMLInputElement).value))}
                                    min={1}
                                    max={10}
                                    step={0.5}
                                    unit="/10"
                                />
                                <Button
                                    variant="secondary"
                                    onClick={handleLogSuds}
                                    className="mt-8 w-full py-4 font-bold tracking-tight bg-(--anchor-bg) hover:bg-white"
                                >
                                    Record the Moment
                                </Button>
                            </Card>

                            <Button
                                variant="primary"
                                onClick={handleCompleteEarly}
                                className="w-full py-6 text-xl shadow-(--shadow-lg) animate-pulse hover:animate-none"
                            >
                                I have conquered the wave
                            </Button>
                        </div>
                    </div>
                )}

                {/* Reflection State - Gentle closure */}
                {state.matches('reflection') && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-1000">
                        <Card className="bg-linear-to-br from-(--anchor-secondary)/20 to-transparent border border-(--anchor-secondary)/30 p-10 text-center">
                            <div className="w-24 h-24 bg-white shadow-(--shadow-lg) rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-subtle">
                                <span className="text-5xl">🏆</span>
                            </div>
                            <h2 className="heading text-4xl mb-4 text-(--anchor-text)">Courage embodied.</h2>
                            <p className="text-xl text-(--anchor-text-muted) leading-relaxed">
                                You sat with the storm and didn't break.
                                How does it feel to be on the other side?
                            </p>
                        </Card>

                        <div className="space-y-3">
                            <h3 className="heading text-xl px-2">Wisdom for your future self</h3>
                            <textarea
                                value={reflection}
                                onChange={(e) => setReflection(e.target.value)}
                                placeholder="What did you learn about the storm? What anchored you today?"
                                className="w-full px-6 py-5 bg-white border border-(--anchor-bg) rounded-(--radius-lg) shadow-inner-sm focus:border-(--anchor-primary-muted) focus:ring-4 focus:ring-(--anchor-primary-muted)/5 focus:outline-none transition-all resize-none text-lg min-h-[160px]"
                            />
                        </div>

                        <VoiceMemo onSave={setAudioMemo} />

                        <div className="flex flex-col md:flex-row gap-4 pt-6">
                            <Button variant="ghost" onClick={handleSkipReflection} className="md:flex-1 py-4 text-lg">
                                Just rest
                            </Button>
                            <Button variant="primary" onClick={handleSubmitReflection} className="md:flex-1 py-4 text-lg shadow-(--shadow-lg)">
                                Seal this Victory
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
