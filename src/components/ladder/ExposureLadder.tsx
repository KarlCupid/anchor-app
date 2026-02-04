import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Plus, Shuffle } from 'lucide-react';
import { LadderItem } from './LadderItem';
import { AddTriggerModal } from './AddTriggerModal';
import { Button } from '../ui/Button';
import type { Exposure } from '../../db';
import { getExposures, createExposure, reorderExposures } from '../../db';

interface ExposureLadderProps {
    onBack: () => void;
    onSelectExposure: (exposure: Exposure) => void;
}

export const ExposureLadder = ({ onBack, onSelectExposure }: ExposureLadderProps) => {
    const [exposures, setExposures] = useState<Exposure[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [shuffleMode, setShuffleMode] = useState(false);
    const [shuffledExposure, setShuffledExposure] = useState<Exposure | null>(null);

    const loadExposures = useCallback(async () => {
        const data = await getExposures();
        setExposures(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line
        loadExposures();
    }, [loadExposures]);

    const handleAddTrigger = async (trigger: {
        description: string;
        suds: number;
        fearedOutcome?: string;
        fearedProbability?: number;
    }) => {
        await createExposure({
            triggerDescription: trigger.description,
            sudsInitial: trigger.suds,
            sudsCurrent: trigger.suds,
            orderIndex: exposures.length,
            completedCount: 0,
            fearedOutcome: trigger.fearedOutcome,
            fearedProbability: trigger.fearedProbability
        });
        await loadExposures();
    };

    // Simple drag and drop (basic implementation)
    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', index.toString());
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        const dragIndex = parseInt(e.dataTransfer.getData('text/html'));

        if (dragIndex === dropIndex) return;

        const newExposures = [...exposures];
        const [removed] = newExposures.splice(dragIndex, 1);
        newExposures.splice(dropIndex, 0, removed);

        setExposures(newExposures);
        await reorderExposures(newExposures);
    };

    // Shuffle mode logic
    const getShuffleEligibleExposures = () => {
        return exposures.filter(exp => exp.sudsCurrent >= 4 && exp.sudsCurrent <= 7);
    };

    const handleShuffleClick = () => {
        const eligible = getShuffleEligibleExposures();

        if (eligible.length === 0) {
            return; // Will show message in UI
        }

        // Pick random from eligible
        const randomIndex = Math.floor(Math.random() * eligible.length);
        setShuffledExposure(eligible[randomIndex]);
    };

    const handleAcceptShuffled = () => {
        if (shuffledExposure) {
            onSelectExposure(shuffledExposure);
        }
    };

    return (
        <div className="bg-[var(--anchor-bg)] min-h-screen">
            <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in duration-700">
                {/* Header */}
                <header className="flex items-center gap-6 py-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                        className="rounded-full !p-3 bg-[var(--anchor-surface)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]"
                        aria-label="Go back"
                    >
                        <ArrowLeft size={24} />
                    </Button>
                    <div className="flex-1">
                        <h1 className="heading text-4xl text-[var(--anchor-text)] tracking-tight">Courage Ladder</h1>
                        <p className="text-[var(--anchor-text-muted)] text-lg font-medium">Map your path to liberation</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant={shuffleMode ? "primary" : "ghost"}
                            onClick={() => {
                                setShuffleMode(!shuffleMode);
                                setShuffledExposure(null);
                            }}
                            className="shadow-[var(--shadow-md)]"
                        >
                            <Shuffle size={20} className="mr-2" />
                            Shuffle
                        </Button>
                        <Button variant="primary" onClick={() => setShowAddModal(true)} className="shadow-[var(--shadow-md)]">
                            <Plus size={20} className="mr-2" />
                            New Trigger
                        </Button>
                    </div>
                </header>

                {/* Empty State */}
                {!loading && exposures.length === 0 && (
                    <div className="text-center py-24 px-6 animate-in zoom-in-95 duration-700">
                        <div className="mb-8 text-7xl flex justify-center opacity-40">
                            <div className="p-8 bg-(--anchor-primary-muted)/10 rounded-full">📋</div>
                        </div>
                        <h2 className="heading text-3xl mb-4 text-(--anchor-text)">The map is still blank.</h2>
                        <p className="text-xl text-(--anchor-text-muted) mb-10 max-w-md mx-auto leading-relaxed">
                            Begin your journey by defining the mountains you choose to climb.
                            Start small, and build your courage step by step.
                        </p>
                        <Button variant="primary" size="lg" onClick={() => setShowAddModal(true)} className="px-10 shadow-(--shadow-lg)">
                            <Plus size={24} className="mr-2" />
                            Define Your First Trigger
                        </Button>
                    </div>
                )}

                {/* Shuffle Mode UI */}
                {!loading && exposures.length > 0 && shuffleMode && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="bg-gradient-to-br from-[var(--anchor-accent)]/10 to-[var(--anchor-primary-muted)]/10 border-2 border-[var(--anchor-accent)]/30 rounded-lg p-6 space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-[var(--anchor-accent)]/20 rounded-full">
                                    <Shuffle size={24} className="text-[var(--anchor-accent)]" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="heading text-2xl mb-2 text-[var(--anchor-text)]">Desirable Difficulties</h3>
                                    <p className="text-[var(--anchor-text-muted)] leading-relaxed">
                                        Research shows that <strong>variable exposure</strong> (mixing up your triggers) creates more durable learning than strict hierarchical progression.
                                        This mode randomly selects from triggers with SUDS scores of 4-7 — your "challenge zone."
                                    </p>
                                </div>
                            </div>

                            {getShuffleEligibleExposures().length === 0 ? (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-sm text-yellow-900">
                                        ⚠️ No triggers in the 4-7 SUDS range. Add some moderate challenges to use shuffle mode!
                                    </p>
                                </div>
                            ) : shuffledExposure ? (
                                <div className="space-y-4">
                                    <div className="bg-white border-2 border-[var(--anchor-accent)] rounded-lg p-6">
                                        <p className="text-sm text-[var(--anchor-text-muted)] mb-2">Your random challenge:</p>
                                        <h4 className="text-xl font-semibold text-[var(--anchor-text)] mb-3">
                                            {shuffledExposure.triggerDescription}
                                        </h4>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="px-3 py-1 bg-[var(--anchor-primary-muted)]/20 rounded-full">
                                                SUDS: {shuffledExposure.sudsCurrent}/10
                                            </span>
                                            <span className="text-[var(--anchor-text-muted)]">
                                                Completed {shuffledExposure.completedCount}x
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="ghost"
                                            onClick={() => setShuffledExposure(null)}
                                            className="flex-1"
                                        >
                                            Pick Again
                                        </Button>
                                        <Button
                                            variant="primary"
                                            onClick={handleAcceptShuffled}
                                            className="flex-1"
                                        >
                                            Let's Do This
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    variant="primary"
                                    onClick={handleShuffleClick}
                                    className="w-full py-4 text-lg"
                                >
                                    <Shuffle size={20} className="mr-2" />
                                    Surprise Me ({getShuffleEligibleExposures().length} eligible)
                                </Button>
                            )}
                        </div>
                    </div>
                )
                }

                {/* Ladder Items */}
                {!loading && exposures.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-sm text-muted">
                            Drag to reorder • Tap to start exposure
                        </p>
                        {exposures.map((exposure, index) => (
                            <div
                                key={exposure.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, index)}
                            >
                                <LadderItem
                                    exposure={exposure}
                                    onSelect={onSelectExposure}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="card animate-pulse">
                                <div className="h-20 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Trigger Modal */}
            <AddTriggerModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={handleAddTrigger}
            />
        </div>
    );
};
