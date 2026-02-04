import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '../ui/Card';
import type { Session } from '../../db';

interface WeeklyProgressChartProps {
    sessions: Session[];
    loading?: boolean;
}

export const WeeklyProgressChart = ({ sessions, loading }: WeeklyProgressChartProps) => {
    const data = useMemo(() => {
        const today = new Date();
        const days = 7;
        const result = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const dateStr = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

            // Count sessions for this day
            const count = sessions.filter(s => {
                const sDate = new Date(s.startedAt);
                sDate.setHours(0, 0, 0, 0);
                return sDate.getTime() === date.getTime();
            }).length;

            result.push({
                day: dayName,
                fullDate: dateStr,
                count,
                isToday: i === 0
            });
        }
        return result;
    }, [sessions]);

    const maxCount = Math.max(...data.map(d => d.count), 3); // Minimum scale of 3

    if (loading) {
        return (
            <Card className="h-48 flex items-center justify-center">
                <div className="animate-pulse text-[var(--anchor-text-muted)]">Loading activity...</div>
            </Card>
        );
    }

    return (
        <Card className="p-6 relative overflow-hidden group h-full">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                <div className="text-[var(--anchor-primary)] font-display text-8xl font-bold leading-none -mt-4 -mr-4">
                    7
                </div>
            </div>

            <div className="mb-4 relative z-10">
                <h3 className="font-display font-semibold text-lg text-[var(--anchor-text)]">Last 7 Days</h3>
                <p className="text-sm text-[var(--anchor-text-muted)]">Your exposure consistency</p>
            </div>

            <div className="h-32 w-full relative z-10 -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: 'var(--anchor-text-muted)' }}
                            dy={10}
                        />
                        <YAxis hide domain={[0, maxCount]} />
                        <Bar dataKey="count" radius={[4, 4, 4, 4]} barSize={32}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.count > 0
                                        ? 'var(--anchor-primary)'
                                        : 'var(--anchor-surface-secondary)'}
                                    fillOpacity={entry.count > 0 ? 0.8 : 0.5}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
