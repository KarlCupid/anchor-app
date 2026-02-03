import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface PanicButtonProps {
    onPress: () => void;
}

export const PanicButton = ({ onPress }: PanicButtonProps) => {
    const [isPressed, setIsPressed] = useState(false);

    const handleClick = () => {
        setIsPressed(true);
        onPress();

        // Reset animation after 300ms
        setTimeout(() => setIsPressed(false), 300);
    };

    return (
        <button
            onClick={handleClick}
            className={`
        relative w-full max-w-sm mx-auto
        bg-gradient-to-br from-red-500 to-red-600
        text-white font-bold text-xl
        py-8 px-6 rounded-2xl
        shadow-2xl
        transition-all duration-300
        hover:shadow-3xl hover:scale-105
        active:scale-95
        ${isPressed ? 'scale-95' : ''}
      `}
            style={{
                minHeight: '120px',
                boxShadow: isPressed
                    ? '0 4px 12px rgba(239, 68, 68, 0.4)'
                    : '0 8px 24px rgba(239, 68, 68, 0.3)'
            }}
            aria-label="Emergency grounding support"
        >
            <div className="flex flex-col items-center gap-3">
                <AlertCircle size={48} className="animate-pulse" />
                <span className="heading">I Need Support</span>
                <span className="text-sm font-normal opacity-90">
                    Tap for grounding
                </span>
            </div>

            {/* Ripple effect */}
            {isPressed && (
                <div className="absolute inset-0 rounded-2xl bg-white opacity-30 animate-ping" />
            )}
        </button>
    );
};
