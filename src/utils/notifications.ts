// Notification utilities for PWA push notifications

export interface NotificationPermissionStatus {
    granted: boolean;
    denied: boolean;
    default: boolean;
}

/**
 * Request notification permission from the user
 */
export const requestNotificationPermission = async (): Promise<NotificationPermissionStatus> => {
    if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return { granted: false, denied: true, default: false };
    }

    const permission = await Notification.requestPermission();

    return {
        granted: permission === 'granted',
        denied: permission === 'denied',
        default: permission === 'default'
    };
};

/**
 * Check current notification permission status
 */
export const getNotificationPermission = (): NotificationPermissionStatus => {
    if (!('Notification' in window)) {
        return { granted: false, denied: true, default: false };
    }

    const permission = Notification.permission;

    return {
        granted: permission === 'granted',
        denied: permission === 'denied',
        default: permission === 'default'
    };
};

/**
 * Schedule a local notification for outcome check-in
 * Note: This uses the Notifications API for local notifications
 * For true push notifications, you'd need a service worker with push subscription
 */
export const scheduleOutcomeCheckIn = async (
    sessionId: string,
    fearedOutcome: string,
    scheduledAt: Date
): Promise<boolean> => {
    const permission = getNotificationPermission();

    if (!permission.granted) {
        console.warn('Notification permission not granted');
        return false;
    }

    // Calculate delay in milliseconds
    const now = new Date();
    const delay = scheduledAt.getTime() - now.getTime();

    if (delay <= 0) {
        // Already past the scheduled time, show immediately
        showOutcomeCheckInNotification(sessionId, fearedOutcome);
        return true;
    }

    // Schedule the notification
    setTimeout(() => {
        showOutcomeCheckInNotification(sessionId, fearedOutcome);
    }, delay);

    return true;
};

/**
 * Show the outcome check-in notification
 */
const showOutcomeCheckInNotification = (sessionId: string, fearedOutcome: string) => {
    if (!('Notification' in window)) return;

    const notification = new Notification('Anchor: 48-Hour Check-In', {
        body: `Did this happen? "${fearedOutcome.substring(0, 80)}${fearedOutcome.length > 80 ? '...' : ''}"`,
        icon: '/icon-192.png', // Make sure this exists in your public folder
        badge: '/icon-192.png',
        tag: `outcome-checkin-${sessionId}`,
        requireInteraction: true,
        data: {
            sessionId,
            type: 'outcome-checkin'
        }
    });

    // Handle notification click
    notification.onclick = () => {
        // Focus the app window
        window.focus();
        notification.close();

        // Trigger custom event to show the check-in modal
        window.dispatchEvent(new CustomEvent('show-outcome-checkin', {
            detail: { sessionId }
        }));
    };
};

/**
 * Cancel a scheduled notification (if possible)
 * Note: With setTimeout-based scheduling, we can't easily cancel
 * For production, consider using service worker with better control
 */
export const cancelOutcomeCheckIn = (sessionId: string): void => {
    // This is a limitation of the current approach
    // For better control, implement service worker-based scheduling
    console.log(`Cancel notification for session ${sessionId}`);
};

/**
 * Show a test notification to verify permissions
 */
export const showTestNotification = (): void => {
    if (!('Notification' in window)) {
        alert('This browser does not support notifications');
        return;
    }

    if (Notification.permission === 'granted') {
        new Notification('Anchor Test', {
            body: 'Notifications are working! 🎉',
            icon: '/icon-192.png'
        });
    } else {
        alert('Please grant notification permission first');
    }
};
