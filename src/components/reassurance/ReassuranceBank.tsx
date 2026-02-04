import { useState, useEffect } from 'react';
import { ArrowLeft, PiggyBank, TrendingUp, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Slider } from '../ui/Slider';
import { ReassuranceTimer } from './ReassuranceTimer';
import {
    createReassuranceUrge,
    updateReassuranceUrge,
    getRecentReassuranceUrges,
    getReassuranceSuccessRate,
    calculateAdaptiveWaitTime
} from '../../db';
import type { ReassuranceUrge } from '../../db';

interface ReassuranceBankProps {
    onBack: () => void;
}

type ViewState = 'deposit' | 'waiting' | 'history';

export const ReassuranceBank = ({ onBack }: ReassuranceBankProps) => {
    const [viewState, setViewState] = useState<ViewState>('deposit');
    const [urgeDescription, setUrgeDescription] = useState('');
    const [urgency, setUrgency] = useState(5);
    const [currentUrgeId, setCurrentUrgeId] = useState<string | null>(null);
    const [waitDuration, setWaitDuration] = useState(900); // 15 minutes default
    const [recentUrges, setRecentUrges] = useState<ReassuranceUrge[]>([]);
    const [successRate, setSuccessRate] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const urges = await getRecentReassuranceUrges(10);
        const rate = await getReassuranceSuccessRate();
        setRecentUrges(urges);
        setSuccessRate(rate);
    };

    const handleDeposit = async () => {
        if (!urgeDescription.trim()) return;

        // Calculate adaptive wait time
        const adaptiveWait = await calculateAdaptiveWaitTime();
        setWaitDuration(adaptiveWait);

        // Create the urge
        const urgeId = await createReassuranceUrge({
            urgeDescription: urgeDescription.trim(),
            urgency,
            waitDuration: adaptiveWait,
            completedWait: false,
            copingToolsUsed: []
        });

        setCurrentUrgeId(urgeId);
        setViewState('waiting');
    };

    const handleComplete = async (copingToolsUsed: string[]) => {
        if (!currentUrgeId) return;

        await updateReassuranceUrge(currentUrgeId, {
            completedWait: true,
            copingToolsUsed
        });

        // Reset and reload
        setUrgeDescription('');
        setUrgency(5);
        setCurrentUrgeId(null);
        setViewState('deposit');
        await loadData();
    };

    const handleGiveIn = async (copingToolsUsed: string[]) => {
        if (!currentUrgeId) return;

        await updateReassuranceUrge(currentUrgeId, {
            completedWait: false,
            gaveInAt: new Date(),
            copingToolsUsed
        });

        // Reset and reload
        setUrgeDescription('');
        setUrgency(5);
        setCurrentUrgeId(null);
        setViewState('deposit');
        await loadData();
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        return `${mins} min`;
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
                        <h1 className="heading text-4xl text-[var(--anchor-text)] tracking-tight">Reassurance Bank</h1>
                        <p className="text-[var(--anchor-text-muted)] text-lg font-medium">
                            Deposit your urges, build your strength
                        </p>
                    </div>
                    <Button
                        variant={viewState === 'history' ? 'primary' : 'ghost'}
                        onClick={() => setViewState(viewState === 'history' ? 'deposit' : 'history')}
                        className="shadow-[var(--shadow-md)]"
                    >
                        {viewState === 'history' ? 'New Deposit' : 'History'}
                    </Button>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-200 rounded-full">
                                <TrendingUp size={24} className="text-green-700" />
                            </div>
                            <div>
                                <p className="text-sm text-green-700 font-medium">Success Rate</p>
                                <p className="text-2xl font-bold text-green-900">{Math.round(successRate)}%</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-200 rounded-full">
                                <PiggyBank size={24} className="text-blue-700" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Total Deposits</p>
                                <p className="text-2xl font-bold text-blue-900">{recentUrges.length}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-200 rounded-full">
                                <Clock size={24} className="text-purple-700" />
                            </div>
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Next Wait Time</p>
                                <p className="text-2xl font-bold text-purple-900">{formatDuration(waitDuration)}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Deposit View */}
                {viewState === 'deposit' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <Card className="bg-gradient-to-br from-[var(--anchor-surface)] to-[var(--anchor-primary-muted)]/5">
                            <h2 className="heading text-2xl mb-6 text-[var(--anchor-text)]">Deposit an Urge</h2>

                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="urge-description" className="block text-sm font-medium mb-2">
                                        What do you want to ask or check?
                                    </label>
                                    <textarea
                                        id="urge-description"
                                        value={urgeDescription}
                                        onChange={(e) => setUrgeDescription(e.target.value)}
                                        placeholder="e.g., Is it okay that I touched that? Did I lock the door?"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                                        rows={3}
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <Slider
                                        label="How strong is the urge?"
                                        value={urgency}
                                        onChange={(e) => setUrgency(Number(e.target.value))}
                                        min={1}
                                        max={10}
                                    />
                                    <p className="text-sm text-muted mt-2">
                                        Rate the intensity of your need for reassurance (1 = mild, 10 = overwhelming)
                                    </p>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-blue-900">
                                        💡 <strong>How it works:</strong> Instead of seeking reassurance immediately,
                                        deposit the urge here and wait {formatDuration(waitDuration)}. During this time,
                                        use coping tools to ride out the discomfort. Most urges pass on their own!
                                    </p>
                                </div>

                                <Button
                                    variant="primary"
                                    onClick={handleDeposit}
                                    disabled={!urgeDescription.trim()}
                                    className="w-full py-4 text-lg shadow-[var(--shadow-lg)]"
                                >
                                    <PiggyBank size={20} className="mr-2" />
                                    Deposit & Start Timer
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Waiting View */}
                {viewState === 'waiting' && (
                    <div className="animate-in fade-in duration-500">
                        <ReassuranceTimer
                            durationSeconds={waitDuration}
                            onComplete={handleComplete}
                            onGiveIn={handleGiveIn}
                        />
                    </div>
                )}

                {/* History View */}
                {viewState === 'history' && (
                    <div className="space-y-4 animate-in fade-in duration-500">
                        <h2 className="heading text-2xl text-[var(--anchor-text)]">Recent Deposits</h2>

                        {recentUrges.length === 0 ? (
                            <Card className="text-center py-12">
                                <p className="text-[var(--anchor-text-muted)]">No deposits yet. Start building your resistance!</p>
                            </Card>
                        ) : (
                            recentUrges.map((urge) => (
                                <Card
                                    key={urge.id}
                                    className={`${urge.completedWait
                                        ? 'border-green-200 bg-green-50/50'
                                        : 'border-red-200 bg-red-50/50'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <p className="text-[var(--anchor-text)] mb-2">{urge.urgeDescription}</p>
                                            <div className="flex flex-wrap gap-3 text-sm text-[var(--anchor-text-muted)]">
                                                <span>Urgency: {urge.urgency}/10</span>
                                                <span>•</span>
                                                <span>Wait: {formatDuration(urge.waitDuration)}</span>
                                                {urge.copingToolsUsed.length > 0 && (
                                                    <>
                                                        <span>•</span>
                                                        <span>Tools: {urge.copingToolsUsed.join(', ')}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${urge.completedWait
                                            ? 'bg-green-200 text-green-800'
                                            : 'bg-red-200 text-red-800'
                                            }`}>
                                            {urge.completedWait ? '✓ Resisted' : '✗ Gave In'}
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
