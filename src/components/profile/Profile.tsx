import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ArrowLeft, User, LogOut, CheckCircle, Cloud, RefreshCw } from 'lucide-react';
import { syncService } from '../../services/FirebaseSyncService';

interface ProfileProps {
    onBack: () => void;
}

export function Profile({ onBack }: ProfileProps) {
    const { user, signOut } = useAuth();
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSyncNow = async () => {
        if (!user) return;
        setIsSyncing(true);
        try {
            await syncService.pushPendingChanges(user.uid);
            // In a real app we might want a way to know when full pull is done too
            // but pushing is the manual action usually.
        } catch (e) {
            console.error(e);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        onBack();
    };

    if (!user) {
        return (
            <div className="p-6 text-center">
                <p>Please sign in to view your profile.</p>
                <Button variant="secondary" onClick={onBack} className="mt-4">Go Back</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-enter">
            <header className="flex items-center gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-[var(--anchor-text-muted)]" />
                </button>
                <h1 className="text-2xl font-bold text-[var(--anchor-text)]">Profile</h1>
            </header>

            <Card className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[var(--anchor-primary)]/10 flex items-center justify-center text-[var(--anchor-primary)]">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <User className="w-8 h-8" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{user.displayName || 'User'}</h2>
                        <p className="text-[var(--anchor-text-muted)]">{user.email}</p>
                    </div>
                </div>

                <div className="pt-4 border-t border-[var(--anchor-border)]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-[var(--anchor-text-muted)]">
                            <Cloud className="w-5 h-5" />
                            <span>Sync Status</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-500">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Online</span>
                        </div>
                    </div>

                    <Button
                        variant="secondary"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={handleSyncNow}
                        disabled={isSyncing}
                    >
                        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? 'Syncing...' : 'Sync Now'}
                    </Button>
                </div>

                <div className="pt-4 border-t border-[var(--anchor-border)]">
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </Button>
                </div>
            </Card>
        </div>
    );
}
