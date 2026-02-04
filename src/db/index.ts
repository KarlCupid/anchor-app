import Dexie, { type Table } from 'dexie';

// Type definitions
export interface Exposure {
    id?: string;
    triggerDescription: string;
    sudsInitial: number;
    sudsCurrent: number;
    orderIndex: number;
    completedCount: number;
    fearedOutcome?: string;        // Expectancy violation: what they fear will happen
    fearedProbability?: number;    // 0-100: how likely they think it is
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
    syncStatus: 'synced' | 'pending';
}

export interface Settings {
    id?: string;
    hasCompletedOnboarding: boolean;
    updatedAt: Date;
    syncStatus: 'synced' | 'pending';
}

export interface OutcomeCheckIn {
    id?: string;
    sessionId: string;
    exposureId: string;
    fearedOutcome: string;
    predictedProbability: number;
    scheduledAt: Date;              // 48 hours post-session
    completedAt?: Date;
    outcomeOccurred: 'yes' | 'no' | 'partially' | 'unsure' | null;
    notes?: string;
    syncStatus: 'synced' | 'pending';
}

export interface ReassuranceUrge {
    id?: string;
    createdAt: Date;
    urgeDescription: string;        // "Is it safe that I..."
    urgency: number;                // 1-10
    waitDuration: number;           // seconds
    completedWait: boolean;         // made it through timer
    gaveInAt?: Date;                // if they sought reassurance early
    copingToolsUsed: string[];      // ['breathing', 'grounding', ...]
    syncStatus: 'synced' | 'pending';
}

// Database class
class AnchorDatabase extends Dexie {
    exposures!: Table<Exposure>;
    sessions!: Table<Session>;
    streaks!: Table<Streak>;
    settings!: Table<Settings>;
    outcomeCheckIns!: Table<OutcomeCheckIn>;
    reassuranceUrges!: Table<ReassuranceUrge>;

    constructor() {
        super('AnchorDB');
        // Version 4: Switch to UUIDs for sync
        this.version(4).stores({
            exposures: 'id, orderIndex, syncStatus, createdAt',
            sessions: 'id, exposureId, startedAt, syncStatus',
            streaks: 'id, lastActivityDate',
            settings: 'id',
            outcomeCheckIns: 'id, sessionId, exposureId, scheduledAt, syncStatus',
            reassuranceUrges: 'id, createdAt, completedWait, syncStatus'
        });
    }
}

export const db = new AnchorDatabase();

// CRUD Helper Functions

// Exposures
export const createExposure = async (exposure: Omit<Exposure, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>): Promise<string> => {
    const newExposure: Exposure = {
        ...exposure,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        syncStatus: 'pending'
    };
    return await db.exposures.add(newExposure);
};

export const getExposures = async (): Promise<Exposure[]> => {
    return await db.exposures.orderBy('orderIndex').toArray();
};

export const getExposure = async (id: string): Promise<Exposure | undefined> => {
    return await db.exposures.get(id);
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
        id: crypto.randomUUID(),
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
            updatedAt: now,
            syncStatus: 'pending'
        });
    } else {
        await db.streaks.add({
            id: crypto.randomUUID(),
            currentStreak,
            longestStreak: currentStreak,
            lastActivityDate: now,
            updatedAt: now,
            syncStatus: 'pending'
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
            id: crypto.randomUUID(),
            hasCompletedOnboarding: true,
            updatedAt: now,
            syncStatus: 'pending'
        });
    } else {
        await db.settings.update(settings[0].id!, {
            hasCompletedOnboarding: true,
            updatedAt: now,
            syncStatus: 'pending'
        });
    }
};

// Outcome Check-Ins
export const createOutcomeCheckIn = async (checkIn: Omit<OutcomeCheckIn, 'id' | 'syncStatus'>): Promise<string> => {
    const newCheckIn: OutcomeCheckIn = {
        ...checkIn,
        id: crypto.randomUUID(),
        syncStatus: 'pending'
    };
    return await db.outcomeCheckIns.add(newCheckIn);
};

export const getPendingCheckIns = async (): Promise<OutcomeCheckIn[]> => {
    const now = new Date();
    return await db.outcomeCheckIns
        .where('scheduledAt')
        .belowOrEqual(now)
        .and(checkIn => checkIn.outcomeOccurred === null)
        .toArray();
};

export const getCheckInsByExposure = async (exposureId: string): Promise<OutcomeCheckIn[]> => {
    return await db.outcomeCheckIns.where('exposureId').equals(exposureId).toArray();
};

export const updateCheckIn = async (id: string, updates: Partial<OutcomeCheckIn>): Promise<void> => {
    await db.outcomeCheckIns.update(id, {
        ...updates,
        syncStatus: 'pending'
    });
};

export const completeCheckIn = async (
    id: string,
    outcomeOccurred: 'yes' | 'no' | 'partially' | 'unsure',
    notes?: string
): Promise<void> => {
    await db.outcomeCheckIns.update(id, {
        outcomeOccurred,
        notes,
        completedAt: new Date(),
        syncStatus: 'pending'
    });
};

// Reassurance Urges
export const createReassuranceUrge = async (
    urge: Omit<ReassuranceUrge, 'id' | 'createdAt' | 'syncStatus'>
): Promise<string> => {
    const newUrge: ReassuranceUrge = {
        ...urge,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        syncStatus: 'pending'
    };
    return await db.reassuranceUrges.add(newUrge);
};

export const getRecentReassuranceUrges = async (limit: number = 10): Promise<ReassuranceUrge[]> => {
    return await db.reassuranceUrges
        .orderBy('createdAt')
        .reverse()
        .limit(limit)
        .toArray();
};

export const getReassuranceSuccessRate = async (): Promise<number> => {
    const allUrges = await db.reassuranceUrges.toArray();
    if (allUrges.length === 0) return 0;

    const successCount = allUrges.filter(urge => urge.completedWait).length;
    return (successCount / allUrges.length) * 100;
};

export const updateReassuranceUrge = async (id: string, updates: Partial<ReassuranceUrge>): Promise<void> => {
    await db.reassuranceUrges.update(id, {
        ...updates,
        syncStatus: 'pending'
    });
};

export const calculateAdaptiveWaitTime = async (): Promise<number> => {
    const recentUrges = await getRecentReassuranceUrges(3);

    // Base: 15 minutes (900 seconds)
    let waitTime = 900;

    if (recentUrges.length === 0) {
        return waitTime;
    }

    // If last 3 urges were all completed without giving in: +5 min
    if (recentUrges.length >= 3 && recentUrges.every(urge => urge.completedWait)) {
        waitTime += 300; // +5 minutes
    }

    // If the most recent urge was given in early: -5 min (minimum 5 min)
    if (recentUrges[0] && !recentUrges[0].completedWait) {
        waitTime = Math.max(300, waitTime - 300); // -5 minutes, min 5 min
    }

    // Max: 45 minutes (2700 seconds)
    return Math.min(2700, waitTime);
};
