import Dexie, { type Table } from 'dexie';

// Type definitions
export interface Exposure {
    id?: string;
    triggerDescription: string;
    sudsInitial: number;
    sudsCurrent: number;
    orderIndex: number;
    completedCount: number;
    createdAt: Date;
    updatedAt: Date;
    syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface SUDSEntry {
    timestamp: Date;
    value: number;
}

export interface Session {
    id?: string;
    exposureId: string;
    startedAt: Date;
    completedAt?: Date;
    durationSeconds?: number;
    sudsStart: number;
    sudsEnd?: number;
    sudsLog: SUDSEntry[];
    reflection?: string;
    audioBlob?: string; // Base64 encoded audio for voice memos
    outcome: 'completed' | 'partial' | 'abandoned';
    syncStatus: 'synced' | 'pending';
}

export interface Streak {
    id?: string;
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: Date;
    updatedAt: Date;
}

export interface Settings {
    id?: string;
    hasCompletedOnboarding: boolean;
    updatedAt: Date;
}

// Database class
class AnchorDatabase extends Dexie {
    exposures!: Table<Exposure>;
    sessions!: Table<Session>;
    streaks!: Table<Streak>;
    settings!: Table<Settings>;

    constructor() {
        super('AnchorDB');
        this.version(2).stores({
            exposures: '++id, orderIndex, syncStatus, createdAt',
            sessions: '++id, exposureId, startedAt, syncStatus',
            streaks: '++id, lastActivityDate',
            settings: '++id'
        });
    }
}

export const db = new AnchorDatabase();

// CRUD Helper Functions

// Exposures
export const createExposure = async (exposure: Omit<Exposure, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>): Promise<string> => {
    const newExposure: Exposure = {
        ...exposure,
        createdAt: new Date(),
        updatedAt: new Date(),
        syncStatus: 'pending'
    };
    return await db.exposures.add(newExposure);
};

export const getExposures = async (): Promise<Exposure[]> => {
    return await db.exposures.orderBy('orderIndex').toArray();
};

export const updateExposure = async (id: string, updates: Partial<Exposure>): Promise<void> => {
    await db.exposures.update(id, {
        ...updates,
        updatedAt: new Date(),
        syncStatus: 'pending'
    });
};

export const deleteExposure = async (id: string): Promise<void> => {
    await db.exposures.delete(id);
};

export const reorderExposures = async (exposures: Exposure[]): Promise<void> => {
    await db.transaction('rw', db.exposures, async () => {
        for (let i = 0; i < exposures.length; i++) {
            await db.exposures.update(exposures[i].id!, {
                orderIndex: i,
                updatedAt: new Date(),
                syncStatus: 'pending'
            });
        }
    });
};

// Sessions
export const createSession = async (session: Omit<Session, 'id' | 'syncStatus'>): Promise<string> => {
    const newSession: Session = {
        ...session,
        syncStatus: 'pending'
    };
    return await db.sessions.add(newSession);
};

export const getSessionsByExposure = async (exposureId: string): Promise<Session[]> => {
    return await db.sessions.where('exposureId').equals(exposureId).toArray();
};

export const getAllSessions = async (): Promise<Session[]> => {
    return await db.sessions.orderBy('startedAt').reverse().toArray();
};

export const updateSession = async (id: string, updates: Partial<Session>): Promise<void> => {
    await db.sessions.update(id, {
        ...updates,
        syncStatus: 'pending'
    });
};

// Streaks
export const getStreak = async (): Promise<Streak | undefined> => {
    const streaks = await db.streaks.toArray();
    return streaks[0];
};

export const updateStreak = async (currentStreak: number): Promise<void> => {
    const existing = await getStreak();
    const now = new Date();

    if (existing) {
        await db.streaks.update(existing.id!, {
            currentStreak,
            longestStreak: Math.max(existing.longestStreak, currentStreak),
            lastActivityDate: now,
            updatedAt: now
        });
    } else {
        await db.streaks.add({
            currentStreak,
            longestStreak: currentStreak,
            lastActivityDate: now,
            updatedAt: now
        });
    }
};

export const incrementStreak = async (): Promise<void> => {
    const streak = await getStreak();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!streak) {
        await updateStreak(1);
        return;
    }

    const lastActivity = new Date(streak.lastActivityDate);
    lastActivity.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
        // Same day, no change
        return;
    } else if (daysDiff === 1) {
        // Consecutive day, increment
        await updateStreak(streak.currentStreak + 1);
    } else {
        // Streak broken, reset
        await updateStreak(1);
    }
};

// Analytics helpers
export const getWeeklySessionCount = async (): Promise<number> => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const sessions = await db.sessions
        .where('startedAt')
        .above(oneWeekAgo)
        .toArray();

    return sessions.length;
};

export const getAverageSUDSReduction = async (): Promise<number> => {
    const completedSessions = await db.sessions
        .filter(s => s.outcome === 'completed' && s.sudsEnd !== undefined)
        .toArray();

    if (completedSessions.length === 0) return 0;

    const totalReduction = completedSessions.reduce((sum, session) => {
        return sum + (session.sudsStart - (session.sudsEnd || 0));
    }, 0);

    return totalReduction / completedSessions.length;
};

// Settings / Onboarding
export const getOnboardingStatus = async (): Promise<boolean> => {
    const settings = await db.settings.toArray();
    if (settings.length === 0) {
        return false; // First time user
    }
    return settings[0].hasCompletedOnboarding;
};

export const setOnboardingComplete = async (): Promise<void> => {
    const settings = await db.settings.toArray();
    const now = new Date();

    if (settings.length === 0) {
        await db.settings.add({
            hasCompletedOnboarding: true,
            updatedAt: now
        });
    } else {
        await db.settings.update(settings[0].id!, {
            hasCompletedOnboarding: true,
            updatedAt: now
        });
    }
};

