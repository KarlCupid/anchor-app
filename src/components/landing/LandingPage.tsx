import React from 'react';
import { Anchor, ArrowRight, Wind, Shield, BarChart3 } from 'lucide-react';
import { Button } from '../ui/Button';

interface LandingPageProps {
    onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
    return (
        <div className="min-h-[100dvh] relative overflow-hidden flex flex-col items-center justify-center text-center p-6 sm:p-12">

            {/* Background Ambience (Similar to App.tsx but more dramatic for landing) */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-[var(--anchor-primary-muted)]/20 rounded-full blur-[120px] mix-blend-multiply animate-pulse duration-[15000ms]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[var(--anchor-secondary)]/15 rounded-full blur-[150px] mix-blend-multiply" />
                <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-[var(--anchor-accent)]/10 rounded-full blur-[100px] animate-pulse duration-[8000ms]" />
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto space-y-12 flex flex-col items-center animate-enter">

                {/* Logo / Brand */}
                <div className="flex items-center gap-3 mb-4 bg-white/5 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full shadow-lg">
                    <Anchor className="w-6 h-6 text-[var(--anchor-primary)]" />
                    <span className="text-sm font-semibold tracking-widest uppercase text-[var(--anchor-text-muted)]">Anchor</span>
                </div>

                {/* Hero Text */}
                <div className="space-y-6">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[var(--anchor-text)] leading-[1.1]">
                        Find your <span className="text-[var(--anchor-primary)] italic font-serif">Sanctuary</span> <br />
                        in the chaos.
                    </h1>
                    <p className="text-xl md:text-2xl text-[var(--anchor-text-muted)] max-w-2xl mx-auto leading-relaxed">
                        Master your urges, track your victories, and reclaim your peace with Anchor's science-backed tools.
                    </p>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-8">
                    <Button
                        onClick={onGetStarted}
                        className="group text-lg px-8 py-6 rounded-2xl shadow-xl shadow-[var(--anchor-primary)]/20 hover:shadow-[var(--anchor-primary)]/30 transition-all duration-300 transform hover:-translate-y-1"
                    >
                        Begin Your Journey
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>

                {/* Feature Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 w-full max-w-3xl opacity-80">
                    <FeaturePill
                        icon={<Wind className="w-5 h-5" />}
                        label="Urge Surfing"
                        desc="Ride the waves of discomfort."
                    />
                    <FeaturePill
                        icon={<Shield className="w-5 h-5" />}
                        label="Reassurance"
                        desc="Break the cycle of seeking."
                    />
                    <FeaturePill
                        icon={<BarChart3 className="w-5 h-5" />}
                        label="Progress"
                        desc="Visualize your recovery."
                    />
                </div>
            </div>

            <footer className="absolute bottom-6 text-[var(--anchor-text-muted)] opacity-60 text-sm">
                © {new Date().getFullYear()} Anchor. All rights reserved.
            </footer>
        </div>
    );
}

function FeaturePill({ icon, label, desc }: { icon: React.ReactNode, label: string, desc: string }) {
    return (
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm text-center">
            <div className="p-3 rounded-xl bg-[var(--anchor-surface-active)] text-[var(--anchor-primary)]">
                {icon}
            </div>
            <div className="space-y-1">
                <h3 className="font-semibold text-[var(--anchor-text)]">{label}</h3>
                <p className="text-sm text-[var(--anchor-text-muted)]">{desc}</p>
            </div>
        </div>
    );
}
