import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Calendar, Clock, Download, BarChart3 } from 'lucide-react';
import { SUDSTrendChart } from './SUDSTrendChart';
import { ActivityHeatmap } from './ActivityHeatmap';
import { Card } from '../ui/Card';
import type { Session, Exposure } from '../../db';
import { getAllSessions, getExposures } from '../../db';
import { exportToJSON, exportToCSV } from '../../utils/exportData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsDashboardProps {
    onBack: () => void;
}

type Tab = 'trends' | 'activity' | 'duration' | 'completion';

export const AnalyticsDashboard = ({ onBack }: AnalyticsDashboardProps) => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [exposures, setExposures] = useState<Exposure[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('trends');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [sessionsData, exposuresData] = await Promise.all([
            getAllSessions(),
            getExposures(),
        ]);
        setSessions(sessionsData);
        setExposures(exposuresData);
        setLoading(false);
    };

    // Duration distribution data
    const durationData = sessions
        .filter((s) => s.durationSeconds)
        .reduce((acc, session) => {
            const minutes = Math.floor(session.durationSeconds! / 60);
            const bucket = Math.floor(minutes / 5) * 5; // 5-minute buckets
            const key = `${bucket}-${bucket + 5} min`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

    const durationChartData = Object.entries(durationData).map(([range, count]) => ({
        range,
        count,
    }));

    // Completion rates by exposure
    const completionData = exposures.map((exposure) => {
        const exposureSessions = sessions.filter((s) => s.exposureId === exposure.id);
        const completed = exposureSessions.filter((s) => s.outcome === 'completed').length;
        const total = exposureSessions.length;
        return {
            name: exposure.triggerDescription.substring(0, 20) + '...',
            completed,
            partial: total - completed,
            rate: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
    });

    const tabs = [
        { id: 'trends' as Tab, label: 'SUDS Trends', icon: TrendingUp },
        { id: 'activity' as Tab, label: 'Activity', icon: Calendar },
        { id: 'duration' as Tab, label: 'Duration', icon: Clock },
        { id: 'completion' as Tab, label: 'Completion', icon: BarChart3 },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 pb-24">
            <div className="max-w-4xl mx-auto space-y-6">
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
                        <h1 className="heading text-3xl">Analytics</h1>
                        <p className="text-muted">Track your progress over time</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={exportToJSON}
                            className="btn btn-secondary px-4 py-2 flex items-center gap-2 text-sm"
                            title="Export as JSON"
                        >
                            <Download size={16} />
                            JSON
                        </button>
                        <button
                            onClick={exportToCSV}
                            className="btn btn-secondary px-4 py-2 flex items-center gap-2 text-sm"
                            title="Export as CSV"
                        >
                            <Download size={16} />
                            CSV
                        </button>
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                            >
                                <Icon size={18} />
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                {loading ? (
                    <Card className="py-12 text-center">
                        <div className="animate-pulse text-muted">Loading analytics...</div>
                    </Card>
                ) : (
                    <Card>
                        {activeTab === 'trends' && (
                            <div>
                                <h2 className="heading text-xl mb-4">SUDS Over Time</h2>
                                <p className="text-sm text-muted mb-6">
                                    Track how your distress levels change across sessions
                                </p>
                                <SUDSTrendChart sessions={sessions} exposures={exposures} />
                            </div>
                        )}

                        {activeTab === 'activity' && (
                            <div>
                                <h2 className="heading text-xl mb-4">Session Activity</h2>
                                <p className="text-sm text-muted mb-6">
                                    Your session frequency over the last 12 weeks
                                </p>
                                <ActivityHeatmap sessions={sessions} />
                            </div>
                        )}

                        {activeTab === 'duration' && (
                            <div>
                                <h2 className="heading text-xl mb-4">Session Duration Distribution</h2>
                                <p className="text-sm text-muted mb-6">
                                    How long your sessions typically last
                                </p>
                                {durationChartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={durationChartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="range" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '2px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                }}
                                            />
                                            <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center py-12 text-muted">
                                        No session data available yet
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'completion' && (
                            <div>
                                <h2 className="heading text-xl mb-4">Completion Rates by Exposure</h2>
                                <p className="text-sm text-muted mb-6">
                                    How often you complete sessions for each trigger
                                </p>
                                {completionData.length > 0 ? (
                                    <div className="space-y-4">
                                        {completionData.map((item, index) => (
                                            <div key={index} className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium">{item.name}</span>
                                                    <span className="text-sm text-muted">
                                                        {item.rate}% ({item.completed}/{item.completed + item.partial})
                                                    </span>
                                                </div>
                                                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500 transition-all"
                                                        style={{ width: `${item.rate}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-muted">
                                        No exposure data available yet
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                )}
            </div>
        </div>
    );
};
