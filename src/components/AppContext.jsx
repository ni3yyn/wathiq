// --- START OF FILE src/components/AppContext.jsx ---

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, query, onSnapshot, doc, updateDoc, deleteField } from 'firebase/firestore'; 
import { useNavigate } from 'react-router-dom';
import { Preferences } from '@capacitor/preferences';
import { Toast } from '@capacitor/toast';

const AppContext = createContext();

// Helper to show debug toasts safely
const showDebugToast = async (msg) => {
    try {
        await Toast.show({ text: msg, duration: 'short', position: 'bottom' });
    } catch (e) {
        console.error("Toast failed", e);
    }
};

const sanitizeData = (data) => {
    if (!data) return null;
    if (Array.isArray(data)) return data.map(item => sanitizeData(item));
    if (typeof data === 'object') {
        if (data.toDate && typeof data.toDate === 'function') return data.toDate().toISOString();
        if (data.seconds !== undefined && data.nanoseconds !== undefined) return new Date(data.seconds * 1000).toISOString();
        const clean = {};
        for (const key in data) clean[key] = sanitizeData(data[key]);
        return clean;
    }
    return data;
};

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [savedProducts, setSavedProducts] = useState([]);
    const [globalLoading, setGlobalLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        let unsubscribeAuth = null;
        let unsubscribeProfile = null;
        let unsubscribeProducts = null;

        const initApp = async () => {
            // Variable to track if we have manual data (prevents Firebase from wiping it offline)
            let manualDataLoadedCount = 0;

            // 1. LOAD CACHE (Do not stop loading here to prevent premature redirection)
            try {
                // A. Load Profile
                const { value: cachedProfile } = await Preferences.get({ key: 'wathiq_cache_profile' });
                if (cachedProfile) {
                    setUserProfile(JSON.parse(cachedProfile));
                }

                // B. Load Products
                const { value: cachedProds } = await Preferences.get({ key: 'wathiq_cache_products' });
                if (cachedProds) {
                    const p = JSON.parse(cachedProds);
                    if (p.length > 0) {
                        setSavedProducts(p);
                        manualDataLoadedCount = p.length; 
                        // FIX: Do NOT setGlobalLoading(false) here. 
                        // We must wait for Auth to confirm user status to avoid the "Welcome" redirect bug.
                    }
                }
            } catch (e) {
                showDebugToast("Cache Error: " + e.message);
            }

            // 2. FIREBASE
            unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
                if (!currentUser) {
                    // User is strictly logged out
                    setUser(null);
                    setUserProfile(null);
                    setSavedProducts([]);
                    setGlobalLoading(false); // Safe to stop loading
                    return;
                }

                // User is logged in
                setUser(currentUser);

                // Profile Sync
                const profileRef = doc(db, 'profiles', currentUser.uid);
                unsubscribeProfile = onSnapshot(profileRef, async (docSnap) => {
                    if (docSnap.exists()) {
                        const data = sanitizeData(docSnap.data());
                        setUserProfile(data);
                        await Preferences.set({ key: 'wathiq_cache_profile', value: JSON.stringify(data) });
                    }
                    // Only stop loading once we actually have the profile (or know it doesn't exist)
                    setGlobalLoading(false);
                }, (err) => {
                    console.error("Profile Sync Error", err);
                    // Even on error, we must stop loading so the app doesn't hang
                    setGlobalLoading(false);
                });

                // Products Sync
                const q = collection(db, 'profiles', currentUser.uid, 'savedProducts');
                
                unsubscribeProducts = onSnapshot(q, { includeMetadataChanges: true }, async (snapshot) => {
                    try {
                        // Offline protection
                        if (snapshot.empty && snapshot.metadata.fromCache && manualDataLoadedCount > 0) {
                            console.log("Offline protection: Keeping manual cache instead of empty Firestore cache.");
                            return; 
                        }

                        const productsList = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...sanitizeData(doc.data())
                        }));
                        
                        productsList.sort((a, b) => (a.order || 0) - (b.order || 0));

                        setSavedProducts(productsList);
                        manualDataLoadedCount = productsList.length;

                        if (productsList.length > 0) {
                            const jsonString = JSON.stringify(productsList);
                            await Preferences.set({ key: 'wathiq_cache_products', value: jsonString });
                        }

                    } catch (err) {
                        showDebugToast("❌ فشل تخزين منتوجاتك في الهاتف: " + err.message);
                    }
                });
            });
        };

        initApp();

        return () => {
            if (unsubscribeAuth) unsubscribeAuth();
            if (unsubscribeProfile) unsubscribeProfile();
            if (unsubscribeProducts) unsubscribeProducts();
        };
    }, []);

    const logout = async () => {
        setIsLoggingOut(true);
        
        // 1. Clear Device Storage
        await Preferences.clear();
        
        // 2. Remove FCM Token from DB if possible
        if (user) {
            try {
                const userRef = doc(db, 'profiles', user.uid);
                await updateDoc(userRef, { fcmToken: deleteField() });
            } catch (e) { console.log("Logout cleanup non-critical error", e); }
        }

        // 3. Visual Delay for UX, then Sign Out
        setTimeout(() => {
            signOut(auth).then(() => {
                // FIX: Navigate explicitly to /login instead of /
                navigate('/login', { replace: true });
                setUser(null);
                setUserProfile(null);
                setSavedProducts([]);
                setIsLoggingOut(false);
                setGlobalLoading(false);
            });
        }, 1500);
    };

    const value = { user, userProfile, loading: globalLoading, isLoggingOut, logout, savedProducts, setSavedProducts };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);