import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, TrendingDown } from 'lucide-react';
import { Card } from '../ui/Card';
import type { Session } from '../../db';
import { getAllSessions, getAverageSUDSReduction, getWeeklySessionCount } from '../../db';

interface VictoryLogProps {
    onBack: () => void;
}

export const VictoryLog = ({ onBack }: VictoryLogProps) => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [weeklyCount, setWeeklyCount] = useState(0);
    const [avgReduction, setAvgReduction] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [sessionsData, weekly, avg] = await Promise.all([
            getAllSessions(),
            getWeeklySessionCount(),
            getAverageSUDSReduction()
        ]);

        setSessions(sessionsData);
        setWeeklyCount(weekly);
        setAvgReduction(avg);
        setLoading(false);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        return `${mins} min`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 pb-24">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <header className="flex items-center gap-4 py-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Go back"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex-1">
                        <h1 className="heading text-3xl">Victory Log</h1>
                        <p className="text-muted">Your progress and achievements</p>
                    </div>
                </header>

                {/* Stats */}
                {!loading && (
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-500 rounded-full">
                                    <Calendar size={24} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">This Week</p>
                                    <p className="text-3xl font-bold text-blue-600">{weeklyCount}</p>
                                    <p className="text-xs text-gray-500">sessions</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-gradient-to-br from-green-50 to-green-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-500 rounded-full">
                                    <TrendingDown size={24} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Avg Reduction</p>
                                    <p className="text-3xl font-bold text-green-600">{avgReduction.toFixed(1)}</p>
                                    <p className="text-xs text-gray-500">SUDS points</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Session History */}
                <div className="space-y-3">
                    <h2 className="heading text-xl">Recent Sessions</h2>

                    {!loading && sessions.length === 0 && (
                        <div className="text-center py-12">
                            <div className="mb-4 text-6xl">📊</div>
                            <h3 className="heading text-2xl mb-2">No sessions yet</h3>
                            <p className="text-muted">
                                Complete your first ERP session to see your progress here
                            </p>
                        </div>
                    )}

                    {!loading && sessions.map((session) => (
                        <Card key={session.id} className="space-y-2">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <p className="text-sm text-muted">{formatDate(session.startedAt)}</p>
                                    <p className="font-medium">
                                        {session.outcome === 'completed' ? '✅' : '⏸️'}
                                        {' '}{formatDuration(session.durationSeconds || 0)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted">SUDS</p>
                                    <p className="font-bold">
                                        {session.sudsStart} → {session.sudsEnd || '?'}
                                    </p>
                                </div>
                            </div>

                            {session.reflection && (
                                <div className="pt-2 border-t border-gray-200">
                                    <p className="text-sm text-gray-700 italic">"{session.reflection}"</p>
                                </div>
                            )}
                        </Card>
                    ))}

                    {loading && (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="card animate-pulse">
                                    <div className="h-16 bg-gray-200 rounded"></div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
