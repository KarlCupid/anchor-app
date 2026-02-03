import { useState } from 'react';
import { Eye, Hand, Ear, Wind, Smile, CheckCircle } from 'lucide-react';

const steps = [
    { count: 5, sense: 'see', icon: Eye, prompt: 'Name 5 things you can see around you' },
    { count: 4, sense: 'touch', icon: Hand, prompt: 'Name 4 things you can touch' },
    { count: 3, sense: 'hear', icon: Ear, prompt: 'Name 3 things you can hear' },
    { count: 2, sense: 'smell', icon: Wind, prompt: 'Name 2 things you can smell' },
    { count: 1, sense: 'taste', icon: Smile, prompt: 'Name 1 thing you can taste' },
];

interface SensoryGroundingProps {
    onComplete?: () => void;
}

export const SensoryGrounding = ({ onComplete }: SensoryGroundingProps) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setIsComplete(true);
            setTimeout(() => {
                onComplete?.();
            }, 2000);
        }
    };

    const handleReset = () => {
        setCurrentStep(0);
        setIsComplete(false);
    };

    if (isComplete) {
        return (
            <div className="card bg-gradient-to-br from-green-50 to-emerald-50 text-center py-12">
                <div className="mb-4 flex justify-center">
                    <CheckCircle size={64} className="text-green-600 animate-bounce" />
                </div>
                <h3 className="heading text-2xl mb-2">Well Done!</h3>
                <p className="text-gray-700 mb-6">You've completed the 5-4-3-2-1 grounding exercise</p>
                <button onClick={handleReset} className="btn btn-secondary">
                    Do It Again
                </button>
            </div>
        );
    }

    const step = steps[currentStep];
    const Icon = step.icon;

    return (
        <div className="card bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-500 rounded-full">
                        <Icon size={24} className="text-white" />
                    </div>
                    <div>
                        <h3 className="heading text-lg">5-4-3-2-1 Grounding</h3>
                        <p className="text-sm text-muted">
                            Step {currentStep + 1} of {steps.length}
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-purple-500 transition-all duration-300"
                        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Current Step */}
            <div className="text-center py-8">
                <div className="text-6xl font-bold text-purple-600 mb-4">{step.count}</div>
                <p className="text-xl text-gray-700 mb-8">{step.prompt}</p>
                <p className="text-sm text-muted mb-6">
                    Take your time. Notice each one carefully.
                </p>
            </div>

            {/* Action */}
            <button onClick={handleNext} className="btn btn-primary w-full py-3">
                {currentStep < steps.length - 1 ? 'Next' : 'Complete'}
            </button>
        </div>
    );
};
