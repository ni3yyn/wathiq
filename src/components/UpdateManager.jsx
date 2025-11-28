import React, { useEffect, useState } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaRocket, FaExclamationTriangle, FaTools, 
    FaGooglePlay, FaCheckCircle, FaTimes 
} from 'react-icons/fa';
import { trackEvent } from '../analytics';
import '../App.css';

// --- Helper: Compare SemVer ---
const compareVersions = (v1, v2) => {
    if (!v1 || !v2) return 0;
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const val1 = parts1[i] || 0;
        const val2 = parts2[i] || 0;
        if (val1 > val2) return 1; 
        if (val1 < val2) return -1; 
    }
    return 0; 
};

const UpdateManager = () => {
    const [status, setStatus] = useState('idle'); 
    const [combinedData, setCombinedData] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        const unsub = onSnapshot(doc(db, 'app_config', 'version_control'), async (docSnap) => {
            if (docSnap.exists()) {
                const rootData = docSnap.data();
                
                // 1. Get Native Info
                const appInfo = await App.getInfo();
                const currentVersion = appInfo.version; 
                const platform = Capacitor.getPlatform();
                const platformConfig = rootData[platform] || {};

                // 2. Merge Data
                const mergedData = { ...rootData, ...platformConfig };
                setCombinedData(mergedData);

                // 3. Check Maintenance
                if (rootData.maintenance_mode) {
                    setStatus('maintenance');
                    setShowModal(true);
                    trackEvent('App_Status', 'Maintenance_Mode_Active', null);
                    return;
                }

                // 4. Check Versions
                const minDiff = compareVersions(currentVersion, platformConfig.min_supported_version);
                const latestDiff = compareVersions(currentVersion, platformConfig.latest_version);

                if (minDiff < 0) {
                    setStatus('critical');
                    setShowModal(true);
                    trackEvent('Update_Prompt', 'Show_Critical', platformConfig.latest_version);
                } else if (latestDiff < 0) {
                    setStatus('optional');
                    setShowModal(true);
                    trackEvent('Update_Prompt', 'Show_Optional', platformConfig.latest_version);
                } else {
                    setStatus('idle');
                    setShowModal(false);
                }
            }
        });

        return () => unsub();
    }, []);

    const handleUpdate = () => {
        trackEvent('Update_Prompt', 'Click_Update_Now', combinedData?.latest_version);
        if (combinedData?.store_url) {
            window.open(combinedData.store_url, '_system');
        }
    };

    const handleDismiss = () => {
        trackEvent('Update_Prompt', 'Click_Dismiss', combinedData?.latest_version);
        setShowModal(false);
    };

    // --- Helpers ---
    const getTitle = () => {
        if (status === 'maintenance') return combinedData?.maintenance_title || 'نحن في وضع الصيانة';
        if (status === 'critical') return combinedData?.critical_title || 'تحديث أمني مطلوب';
        return combinedData?.optional_title || 'تحديث جديد متاح!';
    };

    const getMessage = () => {
        if (status === 'maintenance') return combinedData?.maintenance_message || "نعود قريباً لتحسين تجربتك!";
        if (status === 'critical') return combinedData?.critical_message || "لضمان أمان بياناتك واستقرار التطبيق، يرجى التحديث للمتابعة.";
        return combinedData?.optional_message || "قمنا بإضافة ميزات جديدة لتحسين تجربتك مع وثيق.";
    };

    // --- Animation Variants ---
    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0, transition: { duration: 0.3 } } // Smooth fade out
    };

    const modalVariants = {
        hidden: { scale: 0.8, opacity: 0, y: 50 },
        visible: { 
            scale: 1, opacity: 1, y: 0,
            transition: { type: "spring", damping: 25, stiffness: 300 } 
        },
        exit: { 
            scale: 0.8, opacity: 0, y: 50, 
            transition: { duration: 0.2, ease: "easeIn" } // Snappy exit
        }
    };
    
    useEffect(() => {
        if (showModal) {
            // Add class to body to trigger the CSS fix above
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        
        // Cleanup on unmount
        return () => document.body.classList.remove('modal-open');
    }, [showModal]);
    // FIX: AnimatePresence is now the top-level element, checks showModal internally
    return (
        <AnimatePresence>
            {showModal && (
                <motion.div 
                    className="glass-modal-backdrop" 
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    key="backdrop" // Key helps React identify the element for removal
                    style={{ zIndex: 99999, backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.75)' }}
                >
                    <motion.div 
                        className="glass-card" 
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        key="modal-card"
                        style={{ 
                            maxWidth: '380px', width: '90%', textAlign: 'center', padding: '2rem', 
                            border: status === 'critical' ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(16, 185, 129, 0.3)',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                        }}
                    >
                        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
                            {status === 'maintenance' && <FaTools style={{ color: '#f59e0b', filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.4))' }} />}
                            {status === 'critical' && <FaExclamationTriangle style={{ color: '#ef4444', filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.4))' }} />}
                            {status === 'optional' && <FaRocket style={{ color: '#10b981', filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.4))' }} />}
                        </div>

                        <h2 style={{ color: '#fff', marginTop: 0, fontSize: '1.5rem' }}>{getTitle()}</h2>
                        
                        {status !== 'maintenance' && (
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '-10px' }}>
                                الإصدار {combinedData?.latest_version}
                            </p>
                        )}

                        <p style={{ color: '#cbd5e1', lineHeight: '1.6', marginBottom: '1.5rem', whiteSpace: 'pre-line' }}>
                            {getMessage()}
                        </p>

                        {/* --- Changelog --- */}
                        {combinedData?.changelog && combinedData.changelog.length > 0 && status !== 'maintenance' && (
                            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', textAlign: 'right', direction: 'rtl' }}>
                                <h4 style={{ color: '#10b981', margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>ما الجديد؟</h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem', color: '#e2e8f0', direction: 'rtl' }}>
                                    {combinedData.changelog.map((item, index) => (
                                        <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', direction: 'rtl' }}>
                                            <FaCheckCircle style={{ color: '#10b981', fontSize: '0.8rem' }} /> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* --- Actions --- */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {status !== 'maintenance' && (
                                <motion.button 
                                    className="elegant-btn primary" 
                                    onClick={handleUpdate}
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    style={{ justifyContent: 'center', width: '100%', fontSize: '1.1rem', padding: '14px' }}
                                >
                                    <FaGooglePlay /> تحديث الآن
                                </motion.button>
                            )}

                            {status === 'optional' && (
                                <button 
                                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem', padding: '10px' }}
                                    onClick={handleDismiss}
                                >
                                    <FaTimes style={{ marginLeft: '5px', verticalAlign: 'middle' }}/> ليس الآن
                                </button>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default UpdateManager;