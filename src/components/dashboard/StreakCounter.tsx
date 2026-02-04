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
            try {
                const streak = await getStreak();
                if (streak) {
                    setCurrentStreak(streak.currentStreak);
                    setLongestStreak(streak.longestStreak);
                }
            } catch (error) {
                console.error('Failed to load streak:', error);
            } finally {
                setLoading(false);
            }
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
        <div className="grid grid-cols-2 gap-4 h-full">
            {/* Current Streak */}
            <Card hoverable className="relative overflow-hidden border-none bg-gradient-to-br from-orange-50 to-amber-50 shadow-sm group h-full flex flex-col justify-center">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                    <Flame size={100} className="text-orange-500 rotate-12" />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center py-2">
                    <div className="flex items-center gap-1.5 text-orange-600 mb-2">
                        <Flame size={16} className="fill-orange-600" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Current</span>
                    </div>
                    <div className="flex items-baseline justify-center gap-1.5">
                        <span className="text-4xl md:text-5xl font-display font-bold text-orange-900 group-hover:scale-110 transition-transform duration-300">
                            {currentStreak}
                        </span>
                    </div>
                    <span className="text-[10px] font-medium text-orange-700/60 uppercase tracking-widest mt-1">Days Fire</span>
                </div>
            </Card>

            {/* Longest Streak */}
            <Card hoverable className="relative overflow-hidden border-none bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm group h-full flex flex-col justify-center">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                    <Trophy size={100} className="text-blue-500 -rotate-12" />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center py-2">
                    <div className="flex items-center gap-1.5 text-blue-600 mb-2">
                        <Trophy size={16} className="fill-blue-600" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Best</span>
                    </div>
                    <div className="flex items-baseline justify-center gap-1.5">
                        <span className="text-4xl md:text-5xl font-display font-bold text-blue-900 group-hover:scale-110 transition-transform duration-300">
                            {longestStreak}
                        </span>
                    </div>
                    <span className="text-[10px] font-medium text-blue-700/60 uppercase tracking-widest mt-1">Record</span>
                </div>
            </Card>
        </div>
    );
};

