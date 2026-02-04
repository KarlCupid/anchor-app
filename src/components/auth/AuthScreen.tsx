import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ArrowLeft, Mail, Lock, User, AlertCircle } from 'lucide-react';

interface AuthScreenProps {
    onBack: () => void;
    onComplete: () => void;
}

export function AuthScreen({ onBack, onComplete }: AuthScreenProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { signIn, signUp } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            if (isLogin) {
                await signIn(email, password);
            } else {
                await signUp(email, password, displayName);
            }
            onComplete();
            onComplete();
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to authenticate');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 animate-enter">
            <header className="flex items-center gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-[var(--anchor-text-muted)]" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-[var(--anchor-text)]">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-[var(--anchor-text-muted)]">
                        {isLogin ? 'Sign in to access your data' : 'Join Anchor to sync your progress'}
                    </p>
                </div>
            </header>

            <Card className="p-6 max-w-md mx-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-500/10 text-red-500 p-3 rounded-lg flex items-center gap-2 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {!isLogin && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--anchor-text-muted)]">Display Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--anchor-text-muted)]" />
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--anchor-bg)] border border-[var(--anchor-border)] text-[var(--anchor-text)] focus:outline-none focus:ring-2 focus:ring-[var(--anchor-primary)]"
                                    placeholder="Enter your name"
                                    required={!isLogin}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--anchor-text-muted)]">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--anchor-text-muted)]" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--anchor-bg)] border border-[var(--anchor-border)] text-[var(--anchor-text)] focus:outline-none focus:ring-2 focus:ring-[var(--anchor-primary)]"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--anchor-text-muted)]">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--anchor-text-muted)]" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--anchor-bg)] border border-[var(--anchor-border)] text-[var(--anchor-text)] focus:outline-none focus:ring-2 focus:ring-[var(--anchor-primary)]"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full py-3"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                        </Button>
                    </div>

                    <div className="text-center pt-2">
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-[var(--anchor-primary)] hover:underline"
                        >
                            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
