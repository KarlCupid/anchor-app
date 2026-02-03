import { useState, useEffect } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
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

    useEffect(() => {
        loadExposures();
    }, []);

    const loadExposures = async () => {
        const data = await getExposures();
        setExposures(data);
        setLoading(false);
    };

    const handleAddTrigger = async (trigger: { description: string; suds: number }) => {
        await createExposure({
            triggerDescription: trigger.description,
            sudsInitial: trigger.suds,
            sudsCurrent: trigger.suds,
            orderIndex: exposures.length,
            completedCount: 0
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

    return (
        <div className="bg-(--anchor-bg) min-h-screen">
            <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in duration-700">
                {/* Header */}
                <header className="flex items-center gap-6 py-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                        className="rounded-full !p-3 bg-(--anchor-surface) shadow-(--shadow-sm) hover:shadow-(--shadow-md)"
                        aria-label="Go back"
                    >
                        <ArrowLeft size={24} />
                    </Button>
                    <div className="flex-1">
                        <h1 className="heading text-4xl text-(--anchor-text) tracking-tight">Courage Ladder</h1>
                        <p className="text-(--anchor-text-muted) text-lg font-medium">Map your path to liberation</p>
                    </div>
                    <Button variant="primary" onClick={() => setShowAddModal(true)} className="shadow-(--shadow-md)">
                        <Plus size={20} className="mr-2" />
                        New Trigger
                    </Button>
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
