import { setup, assign } from 'xstate';
import type { Exposure, SUDSEntry } from '../db';

export interface SessionContext {
    exposure: Exposure | null;
    sudsLog: SUDSEntry[];
    startTime: number | null;
    timerDuration: number; // in seconds
    elapsedTime: number;
    reflection: string;
}

export type SessionEvent =
    | { type: 'START_SESSION'; exposure: Exposure }
    | { type: 'BEGIN_DELAY' }
    | { type: 'LOG_SUDS'; suds: number }
    | { type: 'EXTEND_TIMER'; additionalSeconds: number }
    | { type: 'COMPLETE_EARLY' }
    | { type: 'SUBMIT_REFLECTION'; reflection: string }
    | { type: 'SKIP_REFLECTION' }
    | { type: 'CANCEL' }
    | { type: 'TIMER_TICK' }
    | { type: 'TIMER_COMPLETE' };

export const sessionMachine = setup({
    types: {
        context: {} as SessionContext,
        events: {} as SessionEvent
    }
}).createMachine({
    id: 'erpSession',
    initial: 'idle',
    context: {
        exposure: null,
        sudsLog: [],
        startTime: null,
        timerDuration: 600, // 10 minutes default
        elapsedTime: 0,
        reflection: ''
    },
    states: {
        idle: {
            on: {
                START_SESSION: {
                    target: 'triggered',
                    actions: assign(({ event }) => ({
                        exposure: event.exposure,
                        startTime: Date.now(),
                        sudsLog: [],
                        elapsedTime: 0,
                        reflection: ''
                    }))
                }
            }
        },
        triggered: {
            on: {
                BEGIN_DELAY: {
                    target: 'delay',
                    actions: assign(({ context }) => ({
                        sudsLog: [
                            {
                                timestamp: new Date(),
                                value: context.exposure?.sudsCurrent || 5
                            }
                        ]
                    }))
                },
                CANCEL: {
                    target: 'idle',
                    actions: assign(() => ({
                        exposure: null,
                        sudsLog: [],
                        startTime: null,
                        elapsedTime: 0
                    }))
                }
            }
        },
        delay: {
            on: {
                TIMER_TICK: {
                    actions: assign(({ context }) => ({
                        elapsedTime: context.elapsedTime + 1
                    }))
                },
                TIMER_COMPLETE: 'reflection',
                LOG_SUDS: {
                    actions: assign(({ context, event }) => ({
                        sudsLog: [
                            ...context.sudsLog,
                            {
                                timestamp: new Date(),
                                value: event.suds
                            }
                        ]
                    }))
                },
                EXTEND_TIMER: {
                    actions: assign(({ context, event }) => ({
                        timerDuration: context.timerDuration + event.additionalSeconds
                    }))
                },
                COMPLETE_EARLY: 'reflection',
                CANCEL: {
                    target: 'idle',
                    actions: assign(() => ({
                        exposure: null,
                        sudsLog: [],
                        startTime: null,
                        elapsedTime: 0
                    }))
                }
            }
        },
        reflection: {
            on: {
                SUBMIT_REFLECTION: {
                    target: 'complete',
                    actions: assign(({ event }) => ({
                        reflection: event.reflection
                    }))
                },
                SKIP_REFLECTION: 'complete'
            }
        },
        complete: {
            type: 'final'
        }
    }
});
