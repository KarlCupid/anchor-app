import { collection, onSnapshot, doc, writeBatch, query, Timestamp } from 'firebase/firestore';
import { db as firestore, auth } from '../lib/firebase';
import { db as localDb } from '../db';

const COLLECTIONS = [
    'exposures',
    'sessions',
    'streaks',
    'outcomeCheckIns',
    'reassuranceUrges',
    'settings'
] as const;

export class FirebaseSyncService {
    private unsubscribeFunctions: (() => void)[] = [];
    private isSyncing = false;

    constructor() {
        // Listen for auth changes to start/stop sync
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.startSync(user.uid);
            } else {
                this.stopSync();
            }
        });
    }

    private async startSync(userId: string) {
        if (this.isSyncing) return;
        this.isSyncing = true;
        console.log('Starting sync for user:', userId);

        // 1. Push any pending local changes
        await this.pushPendingChanges(userId);

        // 2. Subscribe to remote changes
        COLLECTIONS.forEach(collectionName => {
            const q = query(collection(firestore, 'users', userId, collectionName));

            const unsubscribe = onSnapshot(q, async (snapshot) => {
                const remoteChanges = snapshot.docChanges();

                for (const change of remoteChanges) {
                    const data = change.doc.data();
                    // Convert Firestore Timestamps to JS Dates
                    const parsedData = this.convertDates(data);

                    if (change.type === 'added' || change.type === 'modified') {
                        // Update local DB
                        const table = localDb[collectionName];
                        if (table) {
                            await table.put({
                                ...parsedData,
                                syncStatus: 'synced' // Mark as synced so we don't push it back
                            });
                        }
                    } else if (change.type === 'removed') {
                        const table = localDb[collectionName];
                        if (table) {
                            await table.delete(change.doc.id);
                        }
                    }
                }
            });
            this.unsubscribeFunctions.push(unsubscribe);
        });
    }

    private stopSync() {
        this.unsubscribeFunctions.forEach(unsub => unsub());
        this.unsubscribeFunctions = [];
        this.isSyncing = false;
        console.log('Sync stopped');
    }

    public async pushPendingChanges(userId: string) {
        if (!userId) return;

        for (const collectionName of COLLECTIONS) {
            const table = localDb[collectionName];
            if (!table) continue;

            const pendingItems = await table.where('syncStatus').equals('pending').toArray();

            if (pendingItems.length > 0) {
                const batch = writeBatch(firestore);

                for (const item of pendingItems) {
                    if (!item.id) continue;
                    const docRef = doc(firestore, 'users', userId, collectionName, item.id);
                    // Remove local-only fields if needed, ensure dates are appropriate
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { syncStatus, ...dataToSync } = item;
                    batch.set(docRef, { ...dataToSync, updatedAt: new Date() }); // Update remote
                }

                await batch.commit();

                // Mark local as synced
                // We do this loop to update them one by one or bulk update if Dexie supports it
                await localDb.transaction('rw', table, async () => {
                    for (const item of pendingItems) {
                        if (!item.id) continue;
                        await table.update(item.id, { syncStatus: 'synced' });
                    }
                });
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private convertDates(data: any): any {
        const newData = { ...data };
        for (const key in newData) {
            if (newData[key] instanceof Timestamp) {
                newData[key] = newData[key].toDate();
            } else if (typeof newData[key] === 'object' && newData[key] !== null) {
                newData[key] = this.convertDates(newData[key]);
            }
        }
        return newData;
    }
}

export const syncService = new FirebaseSyncService();
