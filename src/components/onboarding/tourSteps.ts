export interface TourStep {
    id: string;
    target: string; // data-tour attribute value
    title: string;
    description: string;
    placement: 'top' | 'bottom' | 'left' | 'right';
}

export const tourSteps: TourStep[] = [
    {
        id: 'panic-button',
        target: 'panic-button',
        title: 'Emergency Anchor',
        description: 'When anxiety strikes, press this for immediate grounding exercises and validation. Your lifeline in moments of distress.',
        placement: 'bottom'
    },
    {
        id: 'streak-counter',
        target: 'streak-counter',
        title: 'Your Courage Streak',
        description: 'Track your daily practice momentum. Each session builds your resilience and strengthens your anchor.',
        placement: 'bottom'
    },
    {
        id: 'exposure-ladder',
        target: 'exposure-ladder',
        title: 'Map Your Fears',
        description: 'Build your personalized fear hierarchy. Start with smaller triggers and gradually work toward bigger challenges.',
        placement: 'top'
    },
    {
        id: 'begin-session',
        target: 'begin-session',
        title: 'Practice Courage',
        description: 'Start an ERP session to face your triggers with guided support, breathing exercises, and real-time SUDS tracking.',
        placement: 'top'
    },
    {
        id: 'victory-log',
        target: 'victory-log',
        title: 'Celebrate Progress',
        description: 'Review your completed sessions, reflections, and see how far you\'ve come on your healing journey.',
        placement: 'top'
    },
    {
        id: 'analytics',
        target: 'analytics',
        title: 'Track Your Growth',
        description: 'Visualize your progress with charts showing SUDS reduction, session frequency, and patterns over time.',
        placement: 'top'
    }
];
