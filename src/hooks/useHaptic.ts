// Haptic feedback hook using Vibration API
// Provides graceful fallback for browsers that don't support vibration

export const useHaptic = () => {
    const vibrate = (pattern: number | number[]) => {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    };

    return {
        vibrate,
        pulse: () => vibrate(50), // Quick tap
        success: () => vibrate([50, 50, 100]), // Success pattern
        milestone: () => vibrate([100, 50, 100, 50, 100]), // Achievement pattern
    };
};
