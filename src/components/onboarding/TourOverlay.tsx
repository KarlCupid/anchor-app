import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { tourSteps } from './tourSteps';

interface TourOverlayProps {
    onComplete: () => void;
    onSkip: () => void;
}

export const TourOverlay = ({ onComplete, onSkip }: TourOverlayProps) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const [spotlightPosition, setSpotlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

    const currentStep = tourSteps[currentStepIndex];
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === tourSteps.length - 1;

    // Find and highlight target element with scroll tracking
    useEffect(() => {
        const element = document.querySelector(`[data-tour="${currentStep.target}"]`) as HTMLElement;
        setTargetElement(element);

        const updatePosition = () => {
            if (!element) return;

            // Update spotlight position
            const rect = element.getBoundingClientRect();
            setSpotlightPosition({
                top: rect.top - 8,
                left: rect.left - 8,
                width: rect.width + 16,
                height: rect.height + 16
            });

            // Calculate tooltip position
            const tooltipWidth = 400;
            const tooltipHeight = 200;
            const spacing = 20;

            let top = 0;
            let left = 0;

            switch (currentStep.placement) {
                case 'top':
                    top = rect.top - tooltipHeight - spacing;
                    left = rect.left + rect.width / 2 - tooltipWidth / 2;
                    break;
                case 'bottom':
                    top = rect.bottom + spacing;
                    left = rect.left + rect.width / 2 - tooltipWidth / 2;
                    break;
                case 'left':
                    top = rect.top + rect.height / 2 - tooltipHeight / 2;
                    left = rect.left - tooltipWidth - spacing;
                    break;
                case 'right':
                    top = rect.top + rect.height / 2 - tooltipHeight / 2;
                    left = rect.right + spacing;
                    break;
            }

            // Keep tooltip within viewport
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            if (left < 10) left = 10;
            if (left + tooltipWidth > viewportWidth - 10) left = viewportWidth - tooltipWidth - 10;
            if (top < 10) top = 10;
            if (top + tooltipHeight > viewportHeight - 10) top = viewportHeight - tooltipHeight - 10;

            setTooltipPosition({ top, left });
        };

        if (element) {
            // Scroll element into view initially
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Initial position calculation
            updatePosition();

            // Update position on scroll and resize
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);

            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [currentStep]);

    const handleNext = () => {
        if (isLastStep) {
            onComplete();
        } else {
            setCurrentStepIndex(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (!isFirstStep) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-40 pointer-events-none">
            {/* Backdrop with spotlight cutout */}
            <div className="absolute inset-0 bg-black/60 pointer-events-auto animate-in fade-in duration-500">
                {targetElement && (
                    <div
                        className="absolute transition-all duration-300 ease-out"
                        style={{
                            top: spotlightPosition.top,
                            left: spotlightPosition.left,
                            width: spotlightPosition.width,
                            height: spotlightPosition.height,
                            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 40px 8px rgba(var(--anchor-primary-rgb), 0.5)',
                            borderRadius: 'var(--radius-lg)',
                            border: '3px solid var(--anchor-primary)',
                            pointerEvents: 'none'
                        }}
                    />
                )}
            </div>

            {/* Tooltip */}
            <div
                className="absolute pointer-events-auto transition-all duration-300 ease-out"
                style={{
                    top: tooltipPosition.top,
                    left: tooltipPosition.left,
                    width: '400px',
                    maxWidth: 'calc(100vw - 20px)'
                }}
            >
                <div className="bg-white rounded-(--radius-lg) shadow-(--shadow-xl) border-2 border-(--anchor-primary-muted)/30 p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-1 bg-(--anchor-primary-muted)/20 text-(--anchor-primary) rounded-full text-xs font-bold">
                                    {currentStepIndex + 1} / {tourSteps.length}
                                </span>
                            </div>
                            <h3 className="heading text-2xl text-(--anchor-text) mb-2">
                                {currentStep.title}
                            </h3>
                        </div>
                        <button
                            onClick={onSkip}
                            className="p-2 hover:bg-(--anchor-bg) rounded-full transition-colors"
                            aria-label="Skip tour"
                        >
                            <X size={20} className="text-(--anchor-text-muted)" />
                        </button>
                    </div>

                    {/* Description */}
                    <p className="text-base text-(--anchor-text-muted) leading-relaxed mb-6">
                        {currentStep.description}
                    </p>

                    {/* Navigation */}
                    <div className="flex items-center justify-between gap-3">
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            disabled={isFirstStep}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft size={18} />
                            Back
                        </Button>

                        <div className="flex gap-1.5">
                            {tourSteps.map((_, index) => (
                                <div
                                    key={index}
                                    className={`h-2 rounded-full transition-all duration-300 ${index === currentStepIndex
                                            ? 'w-8 bg-(--anchor-primary)'
                                            : 'w-2 bg-(--anchor-primary-muted)/30'
                                        }`}
                                />
                            ))}
                        </div>

                        <Button
                            variant="primary"
                            onClick={handleNext}
                            className="flex items-center gap-2"
                        >
                            {isLastStep ? 'Finish' : 'Next'}
                            {!isLastStep && <ArrowRight size={18} />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
