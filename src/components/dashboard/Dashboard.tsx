import { useState, useEffect } from 'react';
import { List, BookOpen, TrendingUp, BarChart3, PiggyBank, User } from 'lucide-react';
import { PanicButton } from './PanicButton';
import { StreakCounter } from './StreakCounter';
import { WeeklyProgressChart } from './WeeklyProgressChart';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { getRandomExercise } from '../../utils/grounding';
import { GroundingSession } from '../grounding/GroundingSession';
import { getAllSessions } from '../../db';
import type { Session } from '../../db';

interface DashboardProps {
    onNavigate: (view: 'ladder' | 'log' | 'analytics' | 'reassurance' | 'profile') => void;
    onStartSession: () => void;
}

export const Dashboard = ({ onNavigate, onStartSession }: DashboardProps) => {
    const [showGrounding, setShowGrounding] = useState(false);
    const [groundingExercise, setGroundingExercise] = useState(getRandomExercise());
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const allSessions = await getAllSessions();
                setSessions(allSessions);
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handlePanicPress = () => {
        // Get new random exercise and validation
        setGroundingExercise(getRandomExercise());
        setShowGrounding(true);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    return (
        <div className="min-h-screen pb-32 relative">
            {/* Background Decorations - GPU Promoted for smooth scrolling */}
            <div className="fixed inset-0 min-h-screen bg-[var(--anchor-bg)] -z-20" />
            <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--anchor-primary)]/5 blur-[100px] -z-10 will-change-transform" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--anchor-secondary)]/5 blur-[100px] -z-10 will-change-transform" />
            <style>{`
                .will-change-transform { will-change: transform; }
            `}</style>

            <div className="max-w-xl mx-auto px-6 space-y-10 pt-6">
                {/* Header Redesign: Premium Branding */}
                <header className="flex justify-between items-center animate-in fade-in slide-in-from-top-6 duration-1000 ease-out-expo">
                    <div className="flex items-center gap-5 group/branding">
                        <div className="relative">
                            <div className="absolute inset-0 bg-[var(--anchor-primary)]/20 blur-2xl rounded-full scale-150 opacity-0 group-hover/branding:opacity-100 transition-opacity duration-1000" />
                            <div className="h-20 w-20 opacity-90 mix-blend-multiply relative z-10 transform group-hover/branding:scale-110 group-hover/branding:rotate-3 transition-transform duration-700 ease-squish">
                                <img src="/anchor_logo.png" alt="Anchor Logo" className="h-full w-full object-contain" />
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[var(--anchor-text-muted)] font-medium text-xs tracking-[0.2em] uppercase opacity-70 mb-0">
                                {getGreeting()}
                            </p>
                            <h1 className="font-display font-bold text-5xl tracking-tight bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent drop-shadow-sm">
                                Anchor
                            </h1>
                            <p className="text-[11px] text-[var(--anchor-text-muted)] italic tracking-widest font-medium opacity-60">
                                STABILITY THROUGH EXPOSURE
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => onNavigate('profile')}
                        className="relative group/profile p-1"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-indigo-500 rounded-full opacity-0 group-hover/profile:opacity-100 transition-opacity duration-300 blur-sm" />
                        <div className="relative p-3 rounded-full bg-white/40 group-hover:bg-white/80 text-[var(--anchor-text-muted)] group-hover:text-indigo-600 transition-all shadow-sm border border-white/40 backdrop-blur-md">
                            <User size={24} strokeWidth={2} />
                        </div>
                    </button>
                </header>

                <div className="space-y-6">
                    {/* Hero Section: Panic Button & Quick Stats */}
                    <div className="grid grid-cols-1 gap-4 items-stretch">
                        <section className="animate-in fade-in zoom-in-95 duration-700 delay-100 fill-mode-both" data-tour="panic-button">
                            <PanicButton onPress={handlePanicPress} />
                        </section>

                        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full align-stretch">
                                <div data-tour="streak-counter" className="h-full">
                                    <StreakCounter />
                                </div>
                                <div className="h-full">
                                    <WeeklyProgressChart sessions={sessions} loading={loading} />
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Main Actions */}
                <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
                    <h2 className="heading text-xl px-1">Your Journey</h2>

                    <div className="grid gap-4">
                        <Card
                            hoverable
                            variant="glass"
                            onClick={() => onNavigate('ladder')}
                            className="group flex items-center gap-6 cursor-pointer border-none bg-gradient-to-br from-[#f5f3ff] to-[#ede9fe] hover:from-[#ede9fe] hover:to-[#ddd6fe] transition-all p-1 pr-6 relative overflow-hidden shadow-sm hover:shadow-md"
                            data-tour="exposure-ladder"
                        >
                            {/* Illustration background with aggressive multi-directional masking and GPU promotion */}
                            <div
                                className="absolute right-0 top-0 h-full w-64 opacity-80 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none hidden md:block mix-blend-multiply will-change-transform"
                                style={{
                                    maskImage: 'linear-gradient(to left, black 30%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                                    WebkitMaskImage: 'linear-gradient(to left, black 30%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                                    maskComposite: 'intersect',
                                    WebkitMaskComposite: 'source-in'
                                }}
                            >
                                <img
                                    src="/exposure_ladder_art.png"
                                    alt=""
                                    className="h-full w-full object-contain object-right transform translate-x-12 scale-125 group-hover:scale-135 transition-transform duration-700"
                                />
                            </div>

                            <div className="relative z-10 p-5 m-1 bg-white/40 backdrop-blur-sm rounded-xl group-hover:scale-105 transition-transform duration-500 border border-white/20 shadow-sm">
                                <List size={28} strokeWidth={2} className="text-violet-600" />
                            </div>
                            <div className="flex-1 py-3 relative z-10">
                                <h3 className="font-display font-semibold text-xl text-violet-900 mb-0.5">Exposure Ladder</h3>
                                <p className="text-sm text-violet-700/70 max-w-[180px]">Design your path to freedom</p>
                            </div>
                            <div className="text-violet-400 group-hover:translate-x-1 transition-transform relative z-10">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                            </div>
                        </Card>

                        <Card
                            hoverable
                            variant="default"
                            onClick={onStartSession}
                            className="group flex items-center gap-6 cursor-pointer bg-gradient-to-r from-[var(--anchor-primary)] to-[var(--anchor-primary-dark)] text-white border-none shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all p-1 pr-6 relative overflow-hidden"
                            data-tour="begin-session"
                        >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Illustration background with aggressive multi-directional masking and GPU promotion */}
                            <div
                                className="absolute right-0 top-0 h-full w-64 opacity-60 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none hidden md:block mix-blend-multiply will-change-transform"
                                style={{
                                    maskImage: 'linear-gradient(to left, black 30%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                                    WebkitMaskImage: 'linear-gradient(to left, black 30%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                                    maskComposite: 'intersect',
                                    WebkitMaskComposite: 'source-in'
                                }}
                            >
                                <img
                                    src="/start_session_art.png"
                                    alt=""
                                    className="h-full w-full object-contain object-right transform translate-x-8 scale-115 group-hover:scale-125 transition-transform duration-700"
                                />
                            </div>

                            <div className="relative z-10 p-5 m-1 bg-white/20 rounded-xl backdrop-blur-sm group-hover:rotate-3 transition-transform duration-500">
                                <BookOpen size={28} strokeWidth={2} className="text-white" />
                            </div>
                            <div className="flex-1 py-3 relative z-10">
                                <h3 className="font-display font-semibold text-xl text-white mb-0.5">Start Session</h3>
                                <p className="text-sm text-white/80 max-w-[180px]">Face your fears today</p>
                            </div>
                            <div className="text-white/80 group-hover:translate-x-1 transition-transform relative z-10">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                            </div>
                        </Card>
                    </div>
                </section>

                {/* Secondary Actions Grid */}
                <section className="grid grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400 fill-mode-both">
                    <Card
                        hoverable
                        onClick={() => onNavigate('log')}
                        className="group flex flex-col items-center text-center gap-3 cursor-pointer p-4 hover:-translate-y-1 transition-transform duration-300"
                        data-tour="victory-log"
                    >
                        <div className="p-3 bg-emerald-50 rounded-full group-hover:bg-emerald-100 transition-colors">
                            <TrendingUp size={24} strokeWidth={2} className="text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm mb-0.5">Victory Log</h3>
                            <p className="text-xs text-[var(--anchor-text-muted)]">Your history</p>
                        </div>
                    </Card>

                    <Card
                        hoverable
                        onClick={() => onNavigate('analytics')}
                        className="group flex flex-col items-center text-center gap-3 cursor-pointer p-4 hover:-translate-y-1 transition-transform duration-300"
                        data-tour="analytics"
                    >
                        <div className="p-3 bg-violet-50 rounded-full group-hover:bg-violet-100 transition-colors">
                            <BarChart3 size={24} strokeWidth={2} className="text-violet-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm mb-0.5">Insights</h3>
                            <p className="text-xs text-[var(--anchor-text-muted)]">See trends</p>
                        </div>
                    </Card>

                    <Card
                        hoverable
                        onClick={() => onNavigate('reassurance')}
                        className="group flex flex-col items-center text-center gap-3 cursor-pointer p-4 hover:-translate-y-1 transition-transform duration-300 col-span-2 lg:col-span-1"
                    >
                        <div className="p-3 bg-amber-50 rounded-full group-hover:bg-amber-100 transition-colors">
                            <PiggyBank size={24} strokeWidth={2} className="text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm mb-0.5">Reassurance Bank</h3>
                            <p className="text-xs text-[var(--anchor-text-muted)]">Resist urges</p>
                        </div>
                    </Card>
                </section>
            </div>

            {/* Grounding Modal Extension */}
            <Modal
                isOpen={showGrounding}
                onClose={() => setShowGrounding(false)}
                title={undefined} // Hidden in session for custom header
                size="lg"
            >
                <GroundingSession
                    key={groundingExercise.id}
                    exercise={groundingExercise}
                    onClose={() => setShowGrounding(false)}
                    onSwitchExercise={() => {
                        setGroundingExercise(getRandomExercise());
                    }}
                />
            </Modal>
        </div>
    );
};
