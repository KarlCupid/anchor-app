import { Anchor } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface WelcomeScreenProps {
    onBeginTour: () => void;
    onSkip: () => void;
}

export const WelcomeScreen = ({ onBeginTour, onSkip }: WelcomeScreenProps) => {
    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-(--anchor-bg) via-(--anchor-primary-muted)/5 to-(--anchor-secondary)/5 backdrop-blur-sm animate-in fade-in duration-700 overflow-y-auto">
            {/* Organic background elements - asymmetric, layered depth */}
            <div className="absolute top-[15%] left-[8%] w-[300px] h-[300px] bg-(--anchor-primary-muted)/8 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-[20%] right-[12%] w-[250px] h-[250px] bg-(--anchor-secondary)/6 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />

            <div className="min-h-full flex items-center justify-center p-4 py-8">
                <div className="max-w-2xl w-full animate-in zoom-in-95 fade-in duration-1000 delay-200 fill-mode-both">
                    <Card className="relative overflow-hidden border-2 border-(--anchor-primary-muted)/20 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3)] backdrop-blur-sm bg-white/95">
                        {/* Subtle gradient overlay for depth */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-(--anchor-primary-muted)/5 pointer-events-none" />

                        <div className="relative p-8 md:p-12 text-center">
                            {/* Hero Icon - Anchor with organic motion */}
                            <div className="relative inline-block mb-8">
                                {/* Layered background circles for depth */}
                                <div className="absolute inset-0 -m-6 bg-gradient-to-br from-(--anchor-primary)/20 to-(--anchor-secondary)/20 rounded-full blur-xl opacity-60 animate-pulse" style={{ animationDuration: '3s' }} />
                                <div className="absolute inset-0 -m-4 bg-gradient-to-br from-(--anchor-primary)/30 to-(--anchor-secondary)/30 rounded-full blur-md opacity-40" />

                                {/* Main icon container */}
                                <div className="relative w-24 h-24 bg-gradient-to-br from-(--anchor-primary) to-(--anchor-secondary) rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 hover:rotate-3 transition-all duration-500 ease-out">
                                    <Anchor size={48} className="text-white" strokeWidth={2.5} />
                                </div>

                                {/* Floating accent dot - intentional asymmetry */}
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-(--anchor-accent) rounded-full shadow-md animate-bounce" style={{ animationDuration: '2s' }} />
                            </div>

                            {/* Typography Hierarchy - Visual Storytelling */}
                            <div className="space-y-3 mb-8">
                                <h1 className="heading text-4xl md:text-5xl text-(--anchor-text) tracking-tight leading-tight">
                                    Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-(--anchor-primary) to-(--anchor-secondary)">Anchor</span>
                                </h1>

                                <p className="text-lg md:text-xl text-(--anchor-primary) font-medium italic">
                                    Your sanctuary in the storm
                                </p>
                            </div>

                            {/* Description - Refined whitespace */}
                            <div className="max-w-xl mx-auto space-y-4 mb-10 text-base md:text-lg text-(--anchor-text-muted) leading-relaxed">
                                <p>
                                    Anchor is your companion for <strong className="text-(--anchor-text) font-semibold">Exposure Response Prevention (ERP)</strong> therapy—a proven approach for managing health anxiety and OCD.
                                </p>
                                <p>
                                    Through guided exposure sessions, grounding exercises, and progress tracking, you'll learn to face your fears with courage and build lasting resilience.
                                </p>
                            </div>

                            {/* Feature Cards - Organic layout with micro-interactions */}
                            <div className="grid md:grid-cols-3 gap-4 mb-10">
                                {[
                                    { emoji: '🎯', title: 'Build Your Ladder', desc: 'Create a personalized fear hierarchy', color: 'primary' },
                                    { emoji: '🧘', title: 'Practice Presence', desc: 'Guided sessions with grounding tools', color: 'secondary' },
                                    { emoji: '📈', title: 'Track Progress', desc: 'Visualize your healing journey', color: 'accent' }
                                ].map((feature, i) => (
                                    <div
                                        key={i}
                                        className="group relative p-5 bg-gradient-to-br from-white to-(--anchor-bg) rounded-xl border border-(--anchor-primary-muted)/10 hover:border-(--anchor-primary-muted)/30 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                                        style={{ animationDelay: `${i * 100}ms` }}
                                    >
                                        {/* Subtle hover glow */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-(--anchor-primary)/0 to-(--anchor-secondary)/0 group-hover:from-(--anchor-primary)/5 group-hover:to-(--anchor-secondary)/5 rounded-xl transition-all duration-300" />

                                        <div className="relative text-left">
                                            <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform duration-300 inline-block">
                                                {feature.emoji}
                                            </div>
                                            <h3 className="font-display font-semibold text-base mb-2 text-(--anchor-text) group-hover:text-(--anchor-primary) transition-colors">
                                                {feature.title}
                                            </h3>
                                            <p className="text-sm text-(--anchor-text-muted) leading-snug">
                                                {feature.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* CTA Buttons - Premium feel with intentional spacing */}
                            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                                <Button
                                    variant="ghost"
                                    onClick={onSkip}
                                    className="flex-1 py-4 text-base font-medium border-2 border-(--anchor-primary-muted)/20 hover:border-(--anchor-primary-muted)/40 hover:bg-(--anchor-bg) transition-all duration-300"
                                >
                                    Skip Tour
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={onBeginTour}
                                    className="flex-1 py-4 text-base font-semibold shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.18)] transform hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    Begin Guided Tour
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
