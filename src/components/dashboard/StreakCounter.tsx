import { useEffect, useState } from 'react';
import { Flame, Trophy } from 'lucide-react';
import { getStreak } from '../../db';
import { Card } from '../ui/Card';

export const StreakCounter = () => {
    const [currentStreak, setCurrentStreak] = useState(0);
    const [longestStreak, setLongestStreak] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStreak = async () => {
            const streak = await getStreak();
            if (streak) {
                setCurrentStreak(streak.currentStreak);
                setLongestStreak(streak.longestStreak);
            }
            setLoading(false);
        };

        loadStreak();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-2 gap-6 opacity-50">
                <div className="h-32 bg-[var(--anchor-surface-secondary)] rounded-[var(--radius-md)] animate-pulse" />
                <div className="h-32 bg-[var(--anchor-surface-secondary)] rounded-[var(--radius-md)] animate-pulse" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-6">
            {/* Current Streak */}
            <Card variant="flat" className="relative overflow-hidden border border-[var(--anchor-primary)]/10">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Flame size={80} className="text-[var(--anchor-primary)] rotate-12" />
                </div>

                <div className="relative z-10 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[var(--anchor-primary)]">
                        <Flame size={20} className="fill-current" />
                        <span className="text-sm font-medium uppercase tracking-wider">Current</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-display font-bold text-[var(--anchor-text)]">
                            {currentStreak}
                        </span>
                        <span className="text-sm text-[var(--anchor-text-muted)] font-medium">days</span>
                    </div>
                </div>
            </Card>

            {/* Longest Streak */}
            <Card variant="flat" className="relative overflow-hidden border border-[var(--anchor-secondary)]/10">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Trophy size={80} className="text-[var(--anchor-secondary)] -rotate-12" />
                </div>

                <div className="relative z-10 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[var(--anchor-secondary)]">
                        <Trophy size={20} className="fill-current" />
                        <span className="text-sm font-medium uppercase tracking-wider">Best</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-display font-bold text-[var(--anchor-text)]">
                            {longestStreak}
                        </span>
                        <span className="text-sm text-[var(--anchor-text-muted)] font-medium">days</span>
                    </div>
                </div>
            </Card>
        </div>
    );
};
