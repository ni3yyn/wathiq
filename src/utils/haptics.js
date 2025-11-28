// src/utils/haptics.js
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

export const triggerHaptic = async (type = 'light') => {
    if (!isNative) return;

    try {
        switch (type) {
            case 'light':
                // Subtle click (e.g., tab change, button press)
                await Haptics.impact({ style: ImpactStyle.Light });
                break;
            case 'medium':
                // Selection change or toggle
                await Haptics.impact({ style: ImpactStyle.Medium });
                break;
            case 'success':
                // Action completed (e.g., Save Settings)
                await Haptics.notification({ type: NotificationType.Success });
                break;
            case 'error':
                // Action failed
                await Haptics.notification({ type: NotificationType.Error });
                break;
            default:
                await Haptics.impact({ style: ImpactStyle.Light });
        }
    } catch (e) {
        console.warn('Haptics not available');
    }
};