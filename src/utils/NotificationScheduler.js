import { LocalNotifications } from '@capacitor/local-notifications';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const NotificationScheduler = {
    
    requestPermissions: async () => {
        const result = await LocalNotifications.requestPermissions();
        return result.display === 'granted';
    },

    // 1. Initialize Action Types (Buttons)
    initActions: async () => {
        await LocalNotifications.registerActionTypes({
            types: [
                {
                    id: 'ROUTINE_REMINDER',
                    actions: [
                        {
                            id: 'open_routine',
                            title: 'عرض الروتين',
                            foreground: true // Opens the app
                        },
                        {
                            id: 'mark_done',
                            title: 'تم ✅',
                            foreground: false, // Stays in background
                            destructive: false
                        }
                    ]
                }
            ]
        });
    },

    getMessages: async (gender) => {
        try {
            const docRef = doc(db, 'app_config', 'version_control');
            const snap = await getDoc(docRef);
            
            // Default with {product} placeholder
            let msgs = {
                amTitle: "صباح الخير! ☀️",
                amBody: "حان وقت استخدام {product} لتبدأ يومك.",
                pmTitle: "مساء الخير 🌙",
                pmBody: "لا تنسي استخدام {product} قبل النوم."
            };

            if (snap.exists()) {
                const data = snap.data();
                const isMale = gender === 'ذكر';

                msgs.amTitle = isMale ? (data.notif_am_title_male || msgs.amTitle) : (data.notif_am_title_female || msgs.amTitle);
                msgs.amBody = isMale ? (data.notif_am_body_male || msgs.amBody) : (data.notif_am_body_female || msgs.amBody);
                msgs.pmTitle = isMale ? (data.notif_pm_title_male || msgs.pmTitle) : (data.notif_pm_title_female || msgs.pmTitle);
                msgs.pmBody = isMale ? (data.notif_pm_body_male || msgs.pmBody) : (data.notif_pm_body_female || msgs.pmBody);
            }
            return msgs;

        } catch (e) {
            console.warn("Message fetch failed", e);
            return { amTitle: "تنبيه", amBody: "وقت الروتين", pmTitle: "تنبيه", pmBody: "وقت الروتين" };
        }
    },

    // Helper: Extract a random or first product name from the routine steps
    getProductFromRoutine: (routineSteps, savedProducts) => {
        if (!routineSteps || routineSteps.length === 0) return null;
        
        // Find a step that has products
        const activeSteps = routineSteps.filter(step => step.productIds && step.productIds.length > 0);
        if (activeSteps.length === 0) return null;

        // Pick the first product from the first active step
        const targetId = activeSteps[0].productIds[0];
        
        // Find name in savedProducts
        const product = savedProducts.find(p => p.id === targetId);
        return product ? product.productName : null;
    },

    // 2. Schedule with Dynamic Data
    scheduleDaily: async (amTime, pmTime, gender, routines, savedProducts) => {
        await LocalNotifications.cancel({ notifications: [{ id: 1 }, { id: 2 }] });
        await NotificationScheduler.initActions(); // Register buttons

        const messages = await NotificationScheduler.getMessages(gender);
        const notifs = [];

        // --- AM Logic ---
        if (amTime) {
            const [hour, minute] = amTime.split(':').map(Number);
            let bodyText = messages.amBody;
            
            // Inject Product Name
            const amProduct = NotificationScheduler.getProductFromRoutine(routines.am, savedProducts);
            const productText = amProduct ? amProduct : (gender === 'ذكر' ? 'واقي الشمس' : 'واقي الشمس');
            
            bodyText = bodyText.replace('{product}', productText);

            notifs.push({
                id: 1,
                title: messages.amTitle,
                body: bodyText,
                schedule: { on: { hour, minute }, allowWhileIdle: true },
                sound: 'res://platform_default',
                smallIcon: 'ic_stat_icon_config_sample',
                actionTypeId: 'ROUTINE_REMINDER', // Attach Buttons
                extra: { path: '/profile', tab: 'routine' } // Deep Link Data
            });
        }

        // --- PM Logic ---
        if (pmTime) {
            const [hour, minute] = pmTime.split(':').map(Number);
            let bodyText = messages.pmBody;

            const pmProduct = NotificationScheduler.getProductFromRoutine(routines.pm, savedProducts);
            const productText = pmProduct ? pmProduct : (gender === 'ذكر' ? 'الغسول' : 'الغسول');

            bodyText = bodyText.replace('{product}', productText);

            notifs.push({
                id: 2,
                title: messages.pmTitle,
                body: bodyText,
                schedule: { on: { hour, minute }, allowWhileIdle: true },
                sound: 'res://platform_default',
                smallIcon: 'ic_stat_icon_config_sample',
                actionTypeId: 'ROUTINE_REMINDER',
                extra: { path: '/profile', tab: 'routine' }
            });
        }

        if (notifs.length > 0) {
            await LocalNotifications.schedule({ notifications: notifs });
            return true;
        }
        return false;
    },

    cancelAll: async () => {
        await LocalNotifications.cancel({ notifications: [{ id: 1 }, { id: 2 }] });
    }
};