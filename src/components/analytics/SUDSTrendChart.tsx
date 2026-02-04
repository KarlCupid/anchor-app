import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Session, Exposure } from '../../db';

interface SUDSTrendChartProps {
    sessions: Session[];
    exposures: Exposure[];
}

export const SUDSTrendChart = ({ sessions, exposures }: SUDSTrendChartProps) => {
    const chartData = useMemo(() => {
        // Group sessions by date
        const sessionsByDate = new Map<string, Map<string, number>>();

        sessions.forEach((session) => {
            if (session.sudsEnd === undefined) return;

            const date = new Date(session.startedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            });

            if (!sessionsByDate.has(date)) {
                sessionsByDate.set(date, new Map());
            }

            const exposure = exposures.find((e) => e.id === session.exposureId);
            if (exposure) {
                sessionsByDate.get(date)!.set(exposure.id!, session.sudsEnd);
            }
        });

        // Convert to array format for Recharts
        return Array.from(sessionsByDate.entries()).map(([date, exposureData]) => {
            const dataPoint: Record<string, string | number> = { date };
            exposureData.forEach((suds, exposureId) => {
                dataPoint[exposureId] = suds;
            });
            return dataPoint;
        });
    }, [sessions, exposures]);

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    if (chartData.length === 0) {
        return (
            <div className="text-center py-12 text-muted">
                <p>No session data available yet</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis
                    domain={[0, 10]}
                    ticks={[0, 2, 4, 6, 8, 10]}
                    tick={{ fontSize: 12 }}
                    stroke="#9ca3af"
                    label={{ value: 'SUDS', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'white',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                    }}
                />
                <Legend />
                {exposures.map((exposure, index) => (
                    <Line
                        key={exposure.id}
                        type="monotone"
                        dataKey={exposure.id!}
                        name={exposure.triggerDescription.substring(0, 30) + '...'}
                        stroke={colors[index % colors.length]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
};
