import { useMemo } from 'react';
import type { Session } from '../../db';

interface ActivityHeatmapProps {
    sessions: Session[];
}

export const ActivityHeatmap = ({ sessions }: ActivityHeatmapProps) => {
    const heatmapData = useMemo(() => {
        const today = new Date();
        const weeks = 12;
        const days = weeks * 7;

        // Create array of last 84 days
        const dateArray: Date[] = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            dateArray.push(date);
        }

        // Count sessions per day
        const sessionCounts = new Map<string, number>();
        sessions.forEach((session) => {
            const date = new Date(session.startedAt);
            date.setHours(0, 0, 0, 0);
            const key = date.toISOString();
            sessionCounts.set(key, (sessionCounts.get(key) || 0) + 1);
        });

        return dateArray.map((date) => ({
            date,
            count: sessionCounts.get(date.toISOString()) || 0,
        }));
    }, [sessions]);

    const maxCount = Math.max(...heatmapData.map((d) => d.count), 1);

    const getColor = (count: number) => {
        if (count === 0) return 'oklch(95% 0.01 250)'; // Light gray
        const intensity = count / maxCount;
        if (intensity <= 0.25) return 'oklch(85% 0.08 140)'; // Light green
        if (intensity <= 0.5) return 'oklch(75% 0.12 140)'; // Medium green
        if (intensity <= 0.75) return 'oklch(65% 0.15 140)'; // Dark green
        return 'oklch(55% 0.18 140)'; // Darkest green
    };

    // Group by weeks
    const weeks: typeof heatmapData[] = [];
    for (let i = 0; i < heatmapData.length; i += 7) {
        weeks.push(heatmapData.slice(i, i + 7));
    }

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="overflow-x-auto">
            <div className="inline-flex gap-1">
                {/* Day labels */}
                <div className="flex flex-col gap-1 mr-2">
                    {dayLabels.map((day, index) => (
                        <div
                            key={day}
                            className="h-3 text-xs text-muted flex items-center"
                            style={{ fontSize: '10px' }}
                        >
                            {index % 2 === 1 ? day : ''}
                        </div>
                    ))}
                </div>

                {/* Heatmap grid */}
                {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                        {week.map((day, dayIndex) => (
                            <div
                                key={dayIndex}
                                className="w-3 h-3 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                                style={{ backgroundColor: getColor(day.count) }}
                                title={`${day.date.toLocaleDateString()}: ${day.count} session${day.count !== 1 ? 's' : ''}`}
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 text-xs text-muted">
                <span>Less</span>
                <div className="flex gap-1">
                    {[0, 0.25, 0.5, 0.75, 1].map((intensity) => (
                        <div
                            key={intensity}
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: getColor(intensity * maxCount) }}
                        />
                    ))}
                </div>
                <span>More</span>
            </div>
        </div>
    );
};
