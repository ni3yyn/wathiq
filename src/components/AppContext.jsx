// --- START OF FILE AppContext.js ---

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

            // 1. LOAD CACHE
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
                        manualDataLoadedCount = p.length; // <--- Mark that we have data
                        
                        setGlobalLoading(false); // Stop loading immediately
                    }
                }
            } catch (e) {
                showDebugToast("Cache Error: " + e.message);
            }

            // 2. FIREBASE
            unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
                if (!currentUser) {
                    setUser(null);
                    setUserProfile(null);
                    setSavedProducts([]);
                    setGlobalLoading(false);
                    return;
                }

                setUser(currentUser);

                // Profile Sync
                const profileRef = doc(db, 'profiles', currentUser.uid);
                unsubscribeProfile = onSnapshot(profileRef, async (docSnap) => {
                    if (docSnap.exists()) {
                        const data = sanitizeData(docSnap.data());
                        setUserProfile(data);
                        await Preferences.set({ key: 'wathiq_cache_profile', value: JSON.stringify(data) });
                    }
                    setGlobalLoading(false);
                });

                // Products Sync
                const q = collection(db, 'profiles', currentUser.uid, 'savedProducts');
                
                // Added includeMetadataChanges to detect if data is from cache or server
                unsubscribeProducts = onSnapshot(q, { includeMetadataChanges: true }, async (snapshot) => {
                    try {
                        // 🛑 THE FIX: PREVENT OVERWRITE
                        // If Firestore returns empty list, AND it's from cache (not server verified),
                        // AND we have manual data loaded... IGNORE this update.
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

                        // Update our tracker so future updates work normally
                        manualDataLoadedCount = productsList.length;

                        // Save to Cache (Syncing)
                        if (productsList.length > 0) {
                            const jsonString = JSON.stringify(productsList);
                            await Preferences.set({ key: 'wathiq_cache_products', value: jsonString });
                        }

                    } catch (err) {
                        showDebugToast("❌ فشل تخزين منتوجاتك في الهاتف: " + err.message);
                    }
                }, (err) => {
                    // If Firestore fails (permissions/offline), ensure we stop loading
                    console.error("Firestore Error", err);
                    setGlobalLoading(false);
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
        await Preferences.clear();
        if (user) {
            try {
                const userRef = doc(db, 'profiles', user.uid);
                await updateDoc(userRef, { fcmToken: deleteField() });
            } catch (e) {}
        }
        setTimeout(() => {
            signOut(auth).then(() => {
                navigate('/');
                setIsLoggingOut(false);
                setGlobalLoading(false);
            });
        }, 1000);
    };

    const value = { user, userProfile, loading: globalLoading, isLoggingOut, logout, savedProducts, setSavedProducts };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);