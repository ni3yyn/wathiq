import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWifi } from 'react-icons/fa';

const OfflineIndicator = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <AnimatePresence>
            {isOffline && (
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        background: '#ef4444', // Red
                        color: 'white',
                        textAlign: 'center',
                        padding: '8px', // Space for status bar
                        paddingTop: 'max(8px, env(safe-area-inset-top))',
                        fontSize: '0.9rem',
                        zIndex: 10000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontFamily: 'Tajawal, sans-serif'
                    }}
                >
                    <FaWifi style={{ opacity: 0.8 }} />
                    <span>لا يوجد اتصال بالإنترنت</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OfflineIndicator;