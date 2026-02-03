import { useState } from 'react';
import { WelcomeScreen } from './WelcomeScreen';
import { TourOverlay } from './TourOverlay';
import { setOnboardingComplete } from '../../db';

interface OnboardingProps {
    onComplete: () => void;
}

type OnboardingState = 'welcome' | 'tour' | 'complete';

export const Onboarding = ({ onComplete }: OnboardingProps) => {
    const [state, setState] = useState<OnboardingState>('welcome');

    const handleBeginTour = () => {
        setState('tour');
    };

    const handleSkip = async () => {
        await setOnboardingComplete();
        onComplete();
    };

    const handleTourComplete = async () => {
        await setOnboardingComplete();
        onComplete();
    };

    if (state === 'welcome') {
        return <WelcomeScreen onBeginTour={handleBeginTour} onSkip={handleSkip} />;
    }

    if (state === 'tour') {
        return <TourOverlay onComplete={handleTourComplete} onSkip={handleSkip} />;
    }

    return null;
};
