import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { sessionMachine } from '../sessionMachine';
import type { Exposure } from '../../db';

describe('Session Machine', () => {
    const mockExposure: Exposure = {
        id: '1',
        triggerDescription: 'Test Trigger',
        sudsInitial: 8,
        sudsCurrent: 8,
        orderIndex: 0,
        completedCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        syncStatus: 'synced',
    };

    it('should start in idle state', () => {
        const actor = createActor(sessionMachine);
        actor.start();
        expect(actor.getSnapshot().value).toBe('idle');
    });

    it('should transition to triggered when START_SESSION is sent', () => {
        const actor = createActor(sessionMachine);
        actor.start();

        actor.send({ type: 'START_SESSION', exposure: mockExposure });

        const snapshot = actor.getSnapshot();
        expect(snapshot.value).toBe('triggered');
        expect(snapshot.context.exposure).toEqual(mockExposure);
        expect(snapshot.context.startTime).toBeDefined();
    });

    it('should transition to delay when BEGIN_DELAY is sent', () => {
        const actor = createActor(sessionMachine);
        actor.start();
        actor.send({ type: 'START_SESSION', exposure: mockExposure });
        actor.send({ type: 'BEGIN_DELAY' });

        const snapshot = actor.getSnapshot();
        expect(snapshot.value).toBe('delay');
        expect(snapshot.context.sudsLog.length).toBe(1); // Initial log
    });

    it('should handle timer ticks', () => {
        const actor = createActor(sessionMachine);
        actor.start();
        actor.send({ type: 'START_SESSION', exposure: mockExposure });
        actor.send({ type: 'BEGIN_DELAY' });

        actor.send({ type: 'TIMER_TICK' });
        expect(actor.getSnapshot().context.elapsedTime).toBe(1);

        actor.send({ type: 'TIMER_TICK' });
        expect(actor.getSnapshot().context.elapsedTime).toBe(2);
    });

    it('should transition to reflection when TIMER_COMPLETE is sent', () => {
        const actor = createActor(sessionMachine);
        actor.start();
        actor.send({ type: 'START_SESSION', exposure: mockExposure });
        actor.send({ type: 'BEGIN_DELAY' });
        actor.send({ type: 'TIMER_COMPLETE' });

        expect(actor.getSnapshot().value).toBe('reflection');
    });

    it('should complete session after reflection submitted', () => {
        const actor = createActor(sessionMachine);
        actor.start();
        actor.send({ type: 'START_SESSION', exposure: mockExposure });
        actor.send({ type: 'BEGIN_DELAY' });
        actor.send({ type: 'TIMER_COMPLETE' });

        actor.send({ type: 'SUBMIT_REFLECTION', reflection: 'Good job' });

        const snapshot = actor.getSnapshot();
        expect(snapshot.value).toBe('complete');
        expect(snapshot.context.reflection).toBe('Good job');
    });
});
