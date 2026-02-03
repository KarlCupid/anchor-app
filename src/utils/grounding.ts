// Grounding exercises library for anxiety management

export interface GroundingExercise {
    id: string;
    name: string;
    duration: number; // in seconds
    instructions: string[];
    type: 'breathing' | 'sensory' | 'cognitive' | 'physical';
}

export const groundingExercises: GroundingExercise[] = [
    {
        id: '5-4-3-2-1',
        name: '5-4-3-2-1 Sensory Grounding',
        duration: 180,
        type: 'sensory',
        instructions: [
            'Name 5 things you can see around you',
            'Name 4 things you can touch',
            'Name 3 things you can hear',
            'Name 2 things you can smell',
            'Name 1 thing you can taste'
        ]
    },
    {
        id: 'box-breathing',
        name: 'Box Breathing',
        duration: 120,
        type: 'breathing',
        instructions: [
            'Breathe in slowly for 4 counts',
            'Hold your breath for 4 counts',
            'Breathe out slowly for 4 counts',
            'Hold empty for 4 counts',
            'Repeat 4 times'
        ]
    },
    {
        id: 'body-scan',
        name: 'Quick Body Scan',
        duration: 150,
        type: 'physical',
        instructions: [
            'Notice your feet on the ground',
            'Feel the weight of your body in the chair',
            'Notice your hands - are they tense or relaxed?',
            'Relax your shoulders',
            'Soften your jaw',
            'Take three deep breaths'
        ]
    },
    {
        id: 'cognitive-defusion',
        name: 'Thought Defusion',
        duration: 90,
        type: 'cognitive',
        instructions: [
            'Notice the thought: "I\'m having the thought that..."',
            'This is a thought, not a fact',
            'Thoughts are like clouds - they pass',
            'You don\'t have to believe every thought',
            'Return your attention to the present moment'
        ]
    },
    {
        id: '4-7-8-breathing',
        name: '4-7-8 Calming Breath',
        duration: 120,
        type: 'breathing',
        instructions: [
            'Breathe in through your nose for 4 counts',
            'Hold your breath for 7 counts',
            'Exhale completely through your mouth for 8 counts',
            'Repeat 4 times'
        ]
    },
    {
        id: 'progressive-relaxation',
        name: 'Progressive Muscle Relaxation',
        duration: 180,
        type: 'physical',
        instructions: [
            'Tense your fists for 5 seconds, then release',
            'Tense your shoulders for 5 seconds, then release',
            'Tense your face for 5 seconds, then release',
            'Notice the difference between tension and relaxation',
            'Take three slow breaths'
        ]
    }
];

export const getRandomExercise = (type?: GroundingExercise['type']): GroundingExercise => {
    const filtered = type
        ? groundingExercises.filter(ex => ex.type === type)
        : groundingExercises;

    return filtered[Math.floor(Math.random() * filtered.length)];
};

export const getExerciseById = (id: string): GroundingExercise | undefined => {
    return groundingExercises.find(ex => ex.id === id);
};

// Validation messages (non-reassuring, grounding)
export const validationMessages = [
    "This is hard. You're doing it anyway.",
    "Discomfort is temporary. Avoidance makes it permanent.",
    "You've survived 100% of your hardest days.",
    "The urge will pass. It always does.",
    "You're not broken. You're learning.",
    "This feeling is uncomfortable, not dangerous.",
    "Every second you delay is a victory.",
    "You're retraining your brain right now.",
    "The anxiety is loud, but it's lying.",
    "You don't have to feel good to do the right thing."
];

export const getRandomValidation = (): string => {
    return validationMessages[Math.floor(Math.random() * validationMessages.length)];
};

// Crisis resources
export const crisisResources = {
    suicideLifeline: {
        name: '988 Suicide & Crisis Lifeline',
        phone: '988',
        text: 'Text "HELLO" to 741741',
        url: 'https://988lifeline.org/'
    },
    iocdf: {
        name: 'IOCDF Therapist Finder',
        url: 'https://iocdf.org/ocd-finding-help/find-help/'
    },
    emergency: {
        name: 'Emergency Services',
        phone: '911',
        message: 'If you are in immediate danger, call 911'
    }
};
