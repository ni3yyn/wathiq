import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { db } from '../firebase';
import {
    doc, updateDoc, Timestamp, collection,
    query, onSnapshot, orderBy, deleteDoc, writeBatch
} from 'firebase/firestore';
import { Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, useDragControls, animate, useSpring } from 'framer-motion';
import {
    FaUserEdit, FaSave, FaTrash, FaSpinner, FaExclamationTriangle,
    FaFlask, FaBook, FaCog, FaSearch, FaTimes, FaListUl,
    FaUndo, FaSun, FaMoon, FaDownload, FaBan, FaBrain,FaSoap,
    FaSignInAlt, FaCheckCircle, FaUser, FaNotesMedical,
    FaArrowLeft, FaArrowRight, FaGripVertical, FaStar, FaChevronDown,
    FaMagic, FaStarOfLife, FaVial, FaRegSmile, FaAllergies,
    FaSpa, FaAtom, FaLeaf, FaHandHoldingWater, FaHandSparkles, FaShoppingBag,
    FaShieldAlt, FaLightbulb, FaCloudSun, FaTint, FaInfoCircle, FaPlusCircle, FaSeedling,
    FaSignOutAlt, FaCalendarAlt, FaBullseye, FaUniversity,
    FaFilter, FaLayerGroup, FaBacon, FaDotCircle, 
} from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { combinedOilsDB } from '../components/alloilsdb.js';
import 'react-circular-progressbar/dist/styles.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import '../Profile.css';
import { 
    commonAllergies, 
    commonConditions, 
    basicSkinTypes,   // <--- NEW
    basicScalpTypes   // <--- NEW
} from '../components/allergiesAndConditions';
import { useAppContext } from './AppContext'; 
import SEO from './SEO'; 
import { useModalBack } from './useModalBack';
import { triggerHaptic } from '../utils/haptics';
import { NotificationScheduler } from '../utils/NotificationScheduler';
import { FaBell, FaClock } from 'react-icons/fa'; // Add icons

// --- Constants & Helper Functions ---
const productTypeDetails = {
    shampoo: { label: 'شامبو', icon: <FaSpa /> },
    serum: { label: 'سيروم', icon: <FaAtom /> },
    oil_blend: { label: 'زيت', icon: <FaLeaf /> },
    lotion_cream: { label: 'مرطب', icon: <FaHandHoldingWater /> },
    sunscreen: { label: 'واقي شمسي', icon: <FaSun /> },
    cleanser: { label: 'غسول', icon: <FaHandSparkles /> },
    treatment: { label: 'علاج', icon: <FaFlask /> },
    other: { label: 'آخر', icon: <FaShoppingBag /> },
};
const translateProductType = (type) => productTypeDetails[type] || productTypeDetails.other;

const normalizeForMatching = (name) => {
    if (!name) return '';
    return name.toString().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
      .replace(/[.,،؛()/]/g, ' ') 
      .replace(/[^\p{L}\p{N}\s-]/gu, '') 
      .replace(/\s+/g, ' ') 
      .trim();
  };

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
    // We remove 'hidden' and 'visible' because AnimatePresence will now control this.
    // Instead, we define 'initial', 'animate', and 'exit' states directly.
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
    exit: { y: -20, opacity: 0 }
};

const pageVariants = {
    initial: { 
        opacity: 0, 
        y: 15, 
        scale: 0.98,
        // Start with no blur
        backdropFilter: "blur(0px)",
        WebkitBackdropFilter: "blur(0px)" 
    },
    animate: { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        // Animate to full blur
        backdropFilter: "blur(7px)",
        WebkitBackdropFilter: "blur(7px)",
        transition: { 
            duration: 0.4, 
            ease: [0.25, 1, 0.5, 1] 
        } 
    },
    exit: { 
        opacity: 0, 
        y: 15, 
        // Fade blur out
        backdropFilter: "blur(0px)",
        WebkitBackdropFilter: "blur(0px)",
        transition: { duration: 0.2, ease: "easeIn" } 
    } 
};
  
  // For individual items within a list (staggered)
  const listContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
  };
  
  // For list items themselves
  const listItemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2 } } // Symmetrical exit
  };
  

// --- START: MODAL & TOAST SUB-COMPONENTS ---
const UndoToast = ({ message, onUndo }) => (
    <motion.div className="undo-toast" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}>
        <span>{message}</span><button onClick={onUndo}><FaUndo /> تراجع</button>
    </motion.div>
);

// --- ANIMATED COUNTER ---
const AnimatedScore = ({ value }) => {
    const nodeRef = useRef();

    useEffect(() => {
        const node = nodeRef.current;
        if (!node) return;

        const controls = animate(0, value, {
            duration: 1.5,
            ease: "easeOut",
            onUpdate: (latest) => {
                node.textContent = `${Math.round(latest)}%`;
            }
        });

        return () => controls.stop();
    }, [value]);

    return <span ref={nodeRef} className="score-text">0%</span>;
};

// --- FIXED MODAL COMPONENT ---
const AnalysisReportModal = ({ product, onClose }) => {
    // 1. HOOKS MUST BE AT THE TOP (Before any return)
    const [isBreakdownVisible, setIsBreakdownVisible] = useState(false);
    const dragControls = useDragControls(); // Fix: Defined at top
    const y = useMotionValue(0);
    
    // Pull-to-close Logic State
    const [touchStart, setTouchStart] = useState(null);
    const [shouldClose, setShouldClose] = useState(false);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    // 2. NOW we can do the Early Return
    if (!product?.analysisData) return null;

    // --- Handlers ---
    const handleDragEnd = (event, info) => {
        if (info.offset.y > 100) {
            onClose();
        }
    };

    const handleBodyTouchStart = (e) => {
        if (e.currentTarget.scrollTop === 0) {
            setTouchStart(e.touches[0].clientY);
        } else {
            setTouchStart(null);
        }
    };

    const handleBodyTouchMove = (e) => {
        if (touchStart === null) return;
        const currentY = e.touches[0].clientY;
        const diff = currentY - touchStart;
        if (diff > 100) setShouldClose(true);
    };

    const handleBodyTouchEnd = () => {
        if (shouldClose) {
            onClose();
            setShouldClose(false);
        }
        setTouchStart(null);
    };

    // --- Data Prep ---
    const analysis = product.analysisData;
    const oilGuardScore = analysis.oilGuardScore || analysis.reliability_score || 0;
    const finalVerdict = analysis.finalVerdict || analysis.status || 'N/A';
    
    const getReliabilityColor = (s) => {
        if (s >= 80) return '#10b981'; if (s >= 65) return '#f59e0b'; if (s >= 50) return '#f43f5e'; return '#dc2626';
    };
    const color = getReliabilityColor(oilGuardScore);

    const allAlerts = [
        ...(analysis.conflicts?.map(c => ({ type: 'conflict', text: `${c.pair.join(' + ')}: ${c.reason}` })) || []),
        ...(analysis.user_specific_alerts || [])
    ];

    return (
        <motion.div 
            className="glass-modal-backdrop" 
            onClick={onClose} 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
        >
            <motion.div 
                className="glass-modal-content sheet-modal" 
                onClick={e => e.stopPropagation()} 
                
                initial={{ y: "100%" }} 
                animate={{ y: 0 }} 
                exit={{ y: "100%" }} 
                transition={{ type: "spring", damping: 25, stiffness: 300 }}

                // Drag Configuration
                drag="y"
                dragControls={dragControls} // Attach the controls here
                dragListener={false} // Disable default drag so we can control it via the Handle
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.5 }}
                onDragEnd={handleDragEnd}
            >
                {/* 
                    The Handle Bar
                    We attach the listener here using onPointerDown 
                */}
                <div 
                    className="sheet-handle-bar" 
                    onPointerDown={(e) => dragControls.start(e)}
                    style={{ touchAction: 'none' }}
                >
                    <div className="sheet-handle-container">
                        <div className="sheet-handle"></div>
                        <div className="sheet-swipe-hint">
                            <FaChevronDown />
                        </div>
                    </div>
                </div>

                <div className="glass-modal-header">
                    <h3>{product.productName}</h3>
                    <button className="glass-modal-close" onClick={onClose}><FaTimes /></button>
                </div>
                
                <div 
                    className="glass-modal-body custom-scrollbar"
                    onTouchStart={handleBodyTouchStart}
                    onTouchMove={handleBodyTouchMove}
                    onTouchEnd={handleBodyTouchEnd}
                >
                    {/* --- Content --- */}
                    <div className="modal-reliability-dial">
                        <div style={{ width: 100, height: 100, position: 'relative' }}>
                            <CircularProgressbar 
                                value={oilGuardScore} 
                                strokeWidth={8} 
                                styles={buildStyles({ pathColor: color, trailColor: 'rgba(255, 255, 255, 0.1)', pathTransitionDuration: 1.5 })} 
                            />
                            <div className="dial-center-text">
                                <AnimatedScore value={oilGuardScore} />
                            </div>
                        </div>
                        <div className="modal-reliability-status-text">
                            <h4>تقييم وثيق</h4>
                            <p style={{ color: color }}>{finalVerdict}</p>
                        </div>
                    </div>
                    
                    {analysis.scoreBreakdown && (
                        <div className="modal-section">
                             <div className="modal-details-toggle">
                                <button onClick={() => setIsBreakdownVisible(!isBreakdownVisible)}>
                                    {isBreakdownVisible ? 'إخفاء التفاصيل' : 'كيف تم حساب النتيجة؟'}
                                </button>
                            </div>
                            <AnimatePresence>
                                {isBreakdownVisible && (
                                <motion.ul 
                                    className="modal-breakdown-list" 
                                    initial={{ height: 0, opacity: 0 }} 
                                    animate={{ height: 'auto', opacity: 1 }} 
                                    exit={{ height: 0, opacity: 0 }} 
                                    style={{ overflow: 'hidden' }}
                                >
                                    {analysis.scoreBreakdown.map((item, index) => (
                                    <li key={index} className={`modal-breakdown-item ${item.type}`}>
                                        <span className="modal-breakdown-text">{item.text}</span>
                                        <span className="modal-breakdown-value">{item.value}</span>
                                    </li>
                                    ))}
                                </motion.ul>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {allAlerts.length > 0 && (
                        <div className="modal-section">
                            <h5><FaExclamationTriangle /> تنبيهات وملاحظات شخصية</h5>
                            <ul className="modal-alerts-list">
                                {allAlerts.map((alert, i) => (
                                    <li key={i} className={`modal-alert-item ${alert.type}`}>
                                        {alert.type === 'good' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                                        <span>{alert.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    <div className="modal-section">
                        <h5><FaFlask /> المكونات المكتشفة ({analysis.detected_ingredients?.length})</h5>
                        <div className="ingredient-pills-container">
                            {analysis.detected_ingredients?.map(ing => <span key={ing.id} className="ingredient-pill">{ing.name}</span>)}
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const IngredientDetailModal = ({ db, onClose, allIngredientsDB }) => {
    // --- 1. Hooks for Sheet Logic ---
    const dragControls = useDragControls();
    const y = useMotionValue(0);
    const [touchStart, setTouchStart] = useState(null);
    const [shouldClose, setShouldClose] = useState(false);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    if (!db) return null;

    // --- 2. Handlers ---
    const handleDragEnd = (event, info) => {
        if (info.offset.y > 100) onClose();
    };

    const handleBodyTouchStart = (e) => {
        if (e.currentTarget.scrollTop === 0) {
            setTouchStart(e.touches[0].clientY);
        } else {
            setTouchStart(null);
        }
    };

    const handleBodyTouchMove = (e) => {
        if (touchStart === null) return;
        const currentY = e.touches[0].clientY;
        const diff = currentY - touchStart;
        if (diff > 100) setShouldClose(true);
    };

    const handleBodyTouchEnd = () => {
        if (shouldClose) {
            onClose();
            setShouldClose(false);
        }
        setTouchStart(null);
    };

    // --- 3. Data Prep ---
    const benefits = db.benefits ? Object.entries(db.benefits).sort(([, a], [, b]) => b - a) : [];
    const synergies = db.synergy ? Object.keys(db.synergy).map(id => allIngredientsDB.get(id)?.name || id) : [];
    const conflicts = db.negativeSynergy ? Object.keys(db.negativeSynergy).map(id => allIngredientsDB.get(id)?.name || id) : [];
    const warnings = db.warnings || [];

    return (
        <motion.div 
            className="glass-modal-backdrop" 
            onClick={onClose} 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
        >
            <motion.div 
                className="glass-modal-content sheet-modal" 
                onClick={e => e.stopPropagation()} 
                
                initial={{ y: "100%" }} 
                animate={{ y: 0 }} 
                exit={{ y: "100%" }} 
                transition={{ type: "spring", damping: 25, stiffness: 300 }}

                drag="y"
                dragControls={dragControls}
                dragListener={false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.5 }}
                onDragEnd={handleDragEnd}
            >
                {/* Handle Bar with Guide */}
                <div 
                    className="sheet-handle-bar" 
                    onPointerDown={(e) => dragControls.start(e)}
                    style={{ touchAction: 'none' }}
                >
                    <div className="sheet-handle-container">
                        <div className="sheet-handle"></div>
                        <div className="sheet-swipe-hint"><FaChevronDown /></div>
                    </div>
                </div>

                <div className="glass-modal-header">
                    <div className="ingredient-modal-title">
                        <h3>{db.name}</h3>
                        <span>{db.scientific_name}</span>
                    </div>
                    <button className="glass-modal-close" onClick={onClose}><FaTimes /></button>
                </div>

                <div 
                    className="glass-modal-body custom-scrollbar"
                    onTouchStart={handleBodyTouchStart}
                    onTouchMove={handleBodyTouchMove}
                    onTouchEnd={handleBodyTouchEnd}
                >
                    <div className="ingredient-modal-meta">
                        <span><strong>النوع:</strong> {db.chemicalType}</span>
                        <span><strong>الفئة:</strong> {db.functionalCategory}</span>
                    </div>

                    {benefits.length > 0 && (
                        <div className="modal-section">
                            <h5><FaStarOfLife /> الفوائد الرئيسية</h5>
                            <ul className="benefits-list">
                                {benefits.map(([name, score]) => (
                                    <li key={name} className="benefit-item">
                                        <span className="benefit-name">{name}</span>
                                        <div className="benefit-score-bar-bg">
                                            <div className="benefit-score-bar-fill" style={{ width: `${score * 100}%` }}></div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {synergies.length > 0 && (
                        <div className="modal-section">
                            <h5><FaCheckCircle style={{ color: '#60a5fa' }} /> يعمل جيدا مع</h5>
                            <div className="ingredient-pills-container">
                                {synergies.map(syn => <span key={syn} className="ingredient-pill synergy">{syn}</span>)}
                            </div>
                        </div>
                    )}

                    {(conflicts.length > 0 || warnings.length > 0) && (
                        <div className="modal-section">
                            <h5><FaExclamationTriangle style={{ color: '#f87171' }} /> تحذيرات وتعارضات</h5>
                            <ul className="alerts-list">
                                {warnings.map((warn, i) => (
                                    <li key={`w-${i}`} className="alert-item user">
                                        <FaExclamationTriangle />
                                        <span>{typeof warn === 'object' ? warn.text : warn}</span>
                                    </li>
                                ))}
                                {conflicts.map(con => (
                                    <li key={con} className="alert-item conflict">
                                        <FaExclamationTriangle />
                                        <span>قد يتعارض مع: <strong>{con}</strong></span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

const MaskDetailModal = ({ mask, onClose, allIngredientsDB }) => {
    // --- Hooks ---
    const dragControls = useDragControls();
    const y = useMotionValue(0);
    const [touchStart, setTouchStart] = useState(null);
    const [shouldClose, setShouldClose] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    if (!mask) return null;

    // --- Handlers ---
    const handleDragEnd = (event, info) => {
        if (info.offset.y > 100) onClose();
    };

    const handleBodyTouchStart = (e) => {
        if (e.currentTarget.scrollTop === 0) setTouchStart(e.touches[0].clientY);
        else setTouchStart(null);
    };

    const handleBodyTouchMove = (e) => {
        if (touchStart === null) return;
        const diff = e.touches[0].clientY - touchStart;
        if (diff > 100) setShouldClose(true);
    };

    const handleBodyTouchEnd = () => {
        if (shouldClose) { onClose(); setShouldClose(false); }
        setTouchStart(null);
    };

    // --- Data ---
    const components = mask.components?.map(id => allIngredientsDB.get(id)).filter(Boolean) || [];
    const benefits = mask.benefits ? Object.entries(mask.benefits).sort(([, a], [, b]) => b - a) : [];
    const warnings = mask.warnings || [];

    return (
        <motion.div className="glass-modal-backdrop" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div 
                className="glass-modal-content sheet-modal" 
                onClick={e => e.stopPropagation()}
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                drag="y" dragControls={dragControls} dragListener={false}
                dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.5 }}
                onDragEnd={handleDragEnd}
            >
                {/* Handle */}
                <div className="sheet-handle-bar" onPointerDown={(e) => dragControls.start(e)} style={{ touchAction: 'none' }}>
                    <div className="sheet-handle-container">
                        <div className="sheet-handle"></div>
                        <div className="sheet-swipe-hint"><FaChevronDown /></div>
                    </div>
                </div>

                <div className="glass-modal-header">
                    <div className="ingredient-modal-title">
                        <h3>{mask.name}</h3><span>{mask.chemicalType}</span>
                    </div>
                    <button className="glass-modal-close" onClick={onClose}><FaTimes /></button>
                </div>

                <div 
                    className="glass-modal-body custom-scrollbar"
                    onTouchStart={handleBodyTouchStart} onTouchMove={handleBodyTouchMove} onTouchEnd={handleBodyTouchEnd}
                >
                    {components.length > 0 && 
                        <div className="modal-section">
                            <h5><FaFlask /> المكونات الرئيسية</h5>
                            <div className="ingredient-pills-container">
                                {components.map(comp => <span key={comp.id} className="ingredient-pill">{comp.name}</span>)}
                            </div>
                        </div>
                    }
                    {benefits.length > 0 && 
                        <div className="modal-section">
                            <h5><FaStarOfLife /> الفوائد الرئيسية</h5>
                            <ul className="benefits-list">
                                {benefits.map(([name, score]) => (
                                <li key={name} className="benefit-item">
                                    <span className="benefit-name">{name}</span>
                                    <div className="benefit-score-bar-bg"><div className="benefit-score-bar-fill" style={{ width: `${score * 100}%` }}></div></div>
                                </li>
                                ))}
                            </ul>
                        </div>
                    }
                    {warnings.length > 0 && 
                        <div className="modal-section">
                            <h5><FaExclamationTriangle style={{ color: '#f87171' }} /> تحذيرات ونصائح</h5>
                            <ul className="alerts-list">
                                {warnings.map((warn, i) => (
                                    <li key={`w-${i}`} className="modal-alert-item warning">
                                        <FaExclamationTriangle /><span>{warn.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    }
                </div>
            </motion.div>
        </motion.div>
    );
};

const InsightDetailModal = ({ insight, onClose }) => {
    // --- Hooks ---
    const dragControls = useDragControls();
    const y = useMotionValue(0);
    const [touchStart, setTouchStart] = useState(null);
    const [shouldClose, setShouldClose] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    if (!insight) return null;

    // --- Handlers ---
    const handleDragEnd = (event, info) => {
        if (info.offset.y > 100) onClose();
    };

    const handleBodyTouchStart = (e) => {
        if (e.currentTarget.scrollTop === 0) setTouchStart(e.touches[0].clientY);
        else setTouchStart(null);
    };

    const handleBodyTouchMove = (e) => {
        if (touchStart === null) return;
        const diff = e.touches[0].clientY - touchStart;
        if (diff > 100) setShouldClose(true);
    };

    const handleBodyTouchEnd = () => {
        if (shouldClose) { onClose(); setShouldClose(false); }
        setTouchStart(null);
    };

    const severityClasses = { good: 'good', warning: 'warning', critical: 'critical' };
    const severityClass = severityClasses[insight.severity] || 'warning';

    return (
        <motion.div className="glass-modal-backdrop" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div 
                className="glass-modal-content sheet-modal" 
                onClick={e => e.stopPropagation()}
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                drag="y" dragControls={dragControls} dragListener={false}
                dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.5 }}
                onDragEnd={handleDragEnd}
            >
                {/* Handle */}
                <div className="sheet-handle-bar" onPointerDown={(e) => dragControls.start(e)} style={{ touchAction: 'none' }}>
                    <div className="sheet-handle-container">
                        <div className="sheet-handle"></div>
                        <div className="sheet-swipe-hint"><FaChevronDown /></div>
                    </div>
                </div>

                <div className={`glass-modal-header insight-header ${severityClass}`}>
                    <h3>{insight.title}</h3>
                    <button className="glass-modal-close" onClick={onClose}><FaTimes /></button>
                </div>

                <div 
                    className="glass-modal-body custom-scrollbar"
                    onTouchStart={handleBodyTouchStart} onTouchMove={handleBodyTouchMove} onTouchEnd={handleBodyTouchEnd}
                >
                    <div className="modal-section">
                        <h5><FaLightbulb /> التفاصيل والتوصية</h5>
                        <p className="insight-details-text">{insight.details}</p>
                    </div>
                    {insight.related_products && insight.related_products.length > 0 && (
                        <div className="modal-section">
                            <h5><FaShoppingBag /> المنتجات ذات الصلة</h5>
                            <div className="ingredient-pills-container">
                                {insight.related_products.map(p => <span key={p} className="ingredient-pill">{p}</span>)}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};
// --- END: MODAL & TOAST SUB-COMPONENTS ---


// --- START: UI & LAYOUT SUB-COMPONENTS ---
const ProductCard = ({ product, provided, onViewReport, onDelete }) => {
    const typeInfo = translateProductType(product.analysisData?.product_type);
    
    // 1. Track the Drag Position (X axis)
    const x = useMotionValue(0);

    // 2. Transform X into Opacity for the background
    // When x goes from 0 to -50 (swiping left), opacity goes from 0 to 1
    const backgroundOpacity = useTransform(x, [0, -50], [0, 1]);

    // Swipe Logic
    const handleDragEnd = (event, info) => {
        if (info.offset.x < -100) {
            if (window.navigator.vibrate) window.navigator.vibrate(50);
            onDelete(product.id);
        }
    };

    return (
        <div 
            ref={provided.innerRef} 
            {...provided.draggableProps} 
            // dragHandleProps removed so the whole card is draggable via Framer Motion
            className="product-card-wrapper"
        >
            {/* 3. Background Layer: Controlled by dynamic opacity */}
            <motion.div 
                className="swipe-action-background"
                style={{ opacity: backgroundOpacity }} // <--- The Magic Fix
            >
                <FaTrash />
                <span>حذف</span>
            </motion.div>

            {/* 4. Foreground Layer: Your original card */}
            <motion.div 
                className="product-card-elegant"
                style={{ x, touchAction: "pan-y" }} // Bind x to this element
                
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDragEnd={handleDragEnd}
                whileDrag={{ scale: 1.02 }}
            >
                <div className="product-card-info">
                    <span className="product-card-name">{product.productName}</span>
                    <div className="product-card-tags">
                        {typeInfo && <span className="product-card-tag type-tag">{typeInfo.icon} {typeInfo.label}</span>}
                    </div>
                </div>
                <div className="product-card-footer">
                    <div className="product-actions-flat-group">
                        <button className="product-flat-action action-view" onClick={() => onViewReport(product)} title="عرض التقرير"><FaBook /></button>
                        <button className="product-flat-action action-delete" onClick={() => onDelete(product.id)} title="حذف المنتج"><FaTrash /></button>
                    </div>
                    {/* Drag Handle Removed */}
                </div>
            </motion.div>
        </div>
    );
};

const SkeletonProductCard = () => (
    <div className="product-card-elegant skeleton-card">
        <div className="product-card-info">
            {/* Animated Title Bar */}
            <div className="skeleton-box title-bar"></div>
            
            {/* Animated Tags */}
            <div className="skeleton-tags-row">
                <div className="skeleton-box pill"></div>
                <div className="skeleton-box pill short"></div>
            </div>
        </div>
        
        <div className="product-card-footer">
            {/* Animated Action Buttons */}
            <div className="skeleton-actions">
                <div className="skeleton-box circle"></div>
                <div className="skeleton-box circle"></div>
            </div>
            <div className="skeleton-box drag-handle"></div>
        </div>
    </div>
);

const EmptyState = ({ icon, title, message }) => (
    <motion.div className="empty-shelf-message" style={{ background: 'rgba(30, 41, 59, 0.05)', borderRadius: '24px', padding: '3rem 2rem', textAlign: 'center', border: '1px dashed rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(7px)'}} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
        <div style={{ fontSize: '3rem', color: '#059669', marginBottom: '1rem' }}>{icon}</div>
        <h4 style={{ color: '#e2e8f0', fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>{title}</h4>
        <p style={{ color: '#94a3b8', maxWidth: '400px', margin: '0 auto' }}>{message}</p>
    </motion.div>
);
// --- END: UI & LAYOUT SUB-COMPONENTS ---


// --- START: TAB CONTENT COMPONENTS ---
const ShelfTab = ({ loading, savedProducts, handleDragEnd, setSelectedProduct, handleDeleteProduct, searchTerm, setSearchTerm, weatherData }) => {
    const [productFilter, setProductFilter] = useState('all');
    const { userProfile } = useAppContext();
    const isMale = userProfile?.settings?.gender === 'ذكر';
    const t = (female, male) => isMale ? male : female;
    const filteredBySearch = useMemo(() => {
        if (!searchTerm) return savedProducts;
        return savedProducts.filter(p => p.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, savedProducts]);

    const displayProducts = useMemo(() => {
        if (productFilter === 'all') return filteredBySearch;
        return filteredBySearch.filter(p => p.analysisData?.product_type === productFilter);
    }, [filteredBySearch, productFilter]);

    return (
        <div className="tab-content-container">
            <h2><FaListUl /> منتجاتي المحفوظة</h2>
            <div className="shelf-controls">
                <div className="search-bar">
                    <FaSearch />
                    <input type="text" className="elegant-input" placeholder="ابحث في منتجاتك..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    {searchTerm && <button onClick={() => setSearchTerm('')} className="clear-search-btn"><FaTimes /></button>}
                </div>
                <Link to="/oil-guard" className="elegant-btn primary">
                    <FaPlusCircle /> إضافة تحليل جديد
                </Link>
                <div className="product-type-filters">
                    <button className={productFilter === 'all' ? 'active' : ''} onClick={() => setProductFilter('all')}>الكل</button>
                    {Object.keys(productTypeDetails).map(type => (
                        <button key={type} className={productFilter === type ? 'active' : ''} onClick={() => setProductFilter(type)}>
                            {productTypeDetails[type].label}
                        </button>
                    ))}
                </div>
            </div>
             {loading ? (
                <motion.div variants={containerVariants} initial="hidden" animate="visible">{[...Array(3)].map((_, i) => <motion.div key={i} variants={itemVariants}><SkeletonProductCard /></motion.div>)}</motion.div>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="products">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                {displayProducts.length > 0 ? (
                                    displayProducts.map((p, index) => (
                                        <Draggable key={p.id} draggableId={p.id} index={index}>
                                            {(providedDraggable) => <ProductCard product={p} provided={providedDraggable} onViewReport={setSelectedProduct} onDelete={handleDeleteProduct} />}
                                        </Draggable>
                                    ))
                                ) : (
                                    <EmptyState 
                        icon={<FaShoppingBag />} 
                        title={t('رفكِ فارغ', 'رفك فارغ')} 
                        message={t('استخدمي الماسح الضوئي لإضافة منتجاتكِ الأولى والبدء في تحليل روتينكِ.', 'استخدم الماسح الضوئي لإضافة منتجاتك الأولى والبدء في تحليل روتينك.')} 
                   /> )}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            )}
        </div>
    );
};

const RoutineBuilderTab = ({ 
    routines, 
    setRoutines, 
    onSave, 
    isSaving, 
    isDirty, 
    setIsDirty, 
    savedProducts, 
    allIngredientsDB, 
    onSelectMask,
    // NEW PROPS: Pass requests up to parent
    onOpenAddModal 
}) => {
    const [activeView, setActiveView] = useState('am');

    const handleRemoveItem = (routineKey, stepIndex, itemIndex) => {
        const newRoutines = JSON.parse(JSON.stringify(routines));
        newRoutines[routineKey][stepIndex].productIds.splice(itemIndex, 1);
        setRoutines(newRoutines);
        setIsDirty(true);
    };

    const handleRoutinesChange = (newRoutines) => {
        setRoutines(newRoutines);
        setIsDirty(true);
    };

    const onDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination || source.droppableId !== destination.droppableId) return;
        
        const [routineKey, stepIndexStr] = destination.droppableId.split('-');
        const stepIndex = parseInt(stepIndexStr);
        const newRoutines = JSON.parse(JSON.stringify(routines));
        
        const [reorderedItem] = newRoutines[routineKey][stepIndex].productIds.splice(source.index, 1);
        newRoutines[routineKey][stepIndex].productIds.splice(destination.index, 0, reorderedItem);
        
        if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(15);
        handleRoutinesChange(newRoutines);
    };
    
    const getItemDisplayData = (itemId) => {
        if (itemId.startsWith('raw::')) {
            const ingredientId = itemId.replace('raw::', '');
            const dbEntry = allIngredientsDB.get(ingredientId);
            if (dbEntry?.functionalCategory?.includes('ماسك')) {
                return { name: dbEntry.name, type: 'mask', data: dbEntry };
            }
            return { name: dbEntry?.name || 'مكون غير معروف', type: 'raw', data: dbEntry };
        }
        const product = savedProducts.find(p => p.id === itemId);
        return { name: product?.productName || 'منتج غير معروف', type: 'product', data: product };
    };

    const handleItemClick = (item) => {
        if (item.type === 'mask') onSelectMask(item.data);
    };

    return (
        <div className="tab-content-container">
            <div className="routine-builder-header">
                <h2><FaCalendarAlt /> مخطط الروتين الذكي</h2>
                <div className={`auto-save-indicator ${isSaving ? 'saving' : 'saved'}`}>
                    {isSaving ? <><FaSpinner className="spinner" /><span>جاري الحفظ...</span></> : <><FaCheckCircle /><span>تم الحفظ</span></>}
                </div>
            </div>
            
            <div className="routine-glass-toggle">
                {[{ id: 'am', label: 'الصباح', icon: <FaSun /> }, { id: 'pm', label: 'المساء', icon: <FaMoon /> }, { id: 'weekly', label: 'أسبوعي', icon: <FaSpa /> }].map((tab) => (
                    <button key={tab.id} onClick={() => setActiveView(tab.id)} className={`toggle-option ${activeView === tab.id ? 'active' : ''}`}>
                        {activeView === tab.id && <motion.div className="active-highlight" layoutId="active-routine-tab" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                        <span className="toggle-content">{tab.icon}<span className="toggle-label">{tab.label}</span></span>
                    </button>
                ))}
            </div>
            
            <DragDropContext onDragEnd={onDragEnd}>
                <AnimatePresence mode="wait">
                    {(activeView === 'am' || activeView === 'pm') ? (
                        <motion.div key={activeView} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="routine-builder-column-simplified">
                            {(routines[activeView] || []).map((step, stepIndex) => {
                                const isStepFilled = step.productIds.length > 0;
                                const isLastStep = stepIndex === (routines[activeView].length - 1);
                                return (
                                    <div key={stepIndex} className={`routine-timeline-item ${isStepFilled ? 'filled' : ''}`}>
                                        <div className="timeline-track">
                                            <div className="timeline-node">{isStepFilled ? <FaCheckCircle /> : <span>{stepIndex + 1}</span>}</div>
                                            {!isLastStep && <div className="timeline-line" />}
                                        </div>
                                        <div className="routine-step-wrapper">
                                            <div className="routine-step-header">
                                                <span>{step.name}</span>
                                                <button className="add-product-btn" onClick={() => onOpenAddModal('product', activeView, stepIndex)} title="إضافة منتج"><FaPlusCircle /></button>
                                            </div>
                                            <Droppable droppableId={`${activeView}-${stepIndex}`}>
                                                {(provided, snapshot) => (
                                                    <div ref={provided.innerRef} {...provided.droppableProps} className={`routine-step ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}>
                                                        {step.productIds.length > 0 ? step.productIds.map((id, index) => (
                                                            <Draggable key={id} draggableId={id} index={index}>
                                                                {(p) => (
                                                                    <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps} className="routine-product-item">
                                                                        <span>{getItemDisplayData(id).name}</span>
                                                                        <button className="remove-product-btn" onClick={() => handleRemoveItem(activeView, stepIndex, index)}><FaTimes /></button>
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        )) : <span className="empty-step-placeholder">-- فارغة --</span>}
                                                        {provided.placeholder}
                                                    </div>
                                                )}
                                            </Droppable>
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <motion.div key="weekly" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="routine-builder-column-simplified">
                            {(routines.weekly || []).map((ritual, ritualIndex) => (
                                <div key={ritualIndex} className="routine-step-wrapper">
                                    <div className="routine-step-header">
                                        <span>{ritual.name}</span>
                                        <div className="add-buttons-group">
                                            <button className="add-product-btn" onClick={() => onOpenAddModal('raw', 'weekly', ritualIndex)} title="إضافة مكون خام"><FaLeaf /></button>
                                            <button className="add-product-btn" onClick={() => onOpenAddModal('product', 'weekly', ritualIndex)} title="إضافة منتج"><FaPlusCircle /></button>
                                        </div>
                                    </div>
                                    <Droppable droppableId={`weekly-${ritualIndex}`}>
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.droppableProps} className="routine-step">
                                                 {ritual.productIds.length > 0 ? ritual.productIds.map((id, index) => {
                                                    const item = getItemDisplayData(id);
                                                    const isClickable = item.type === 'mask';
                                                    return (
                                                         <Draggable key={id} draggableId={id} index={index}>
                                                            {(p) => (
                                                                <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps} className={`routine-product-item ${item.type === 'raw' ? 'raw-ingredient' : ''} ${isClickable ? 'clickable' : ''}`} onClick={() => isClickable && handleItemClick(item)}>
                                                                    {(item.type === 'raw' || item.type === 'mask') && <FaSeedling className="raw-icon" />}
                                                                    <span>{item.name}</span>
                                                                    <button className="remove-product-btn" onClick={() => handleRemoveItem('weekly', ritualIndex, index)}><FaTimes /></button>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    );
                                                }) : <span className="empty-step-placeholder">فارغة</span>}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </DragDropContext>
        </div>
    );
};

const AnalysisTab = ({ loading, savedProducts, analysisResults, setSelectedInsight, weatherRoutineInsight, dismissedInsightIds, handleDismissPraise }) => {
    const { userProfile } = useAppContext();
    const isMale = userProfile?.settings?.gender === 'ذكر';
    const t = (female, male) => isMale ? male : female;
    if (loading) {
        return (
            <div className="glass-analysis-grid">
                <div className="glass-card span-col-2-lg span-row-2-lg" style={{ minHeight: '400px', background: 'rgba(255,255,255,0.02)' }}></div>
                <div className="glass-card span-col-2-lg" style={{ minHeight: '200px', background: 'rgba(255,255,255,0.02)' }}></div>
                <div className="glass-card span-col-2-lg" style={{ minHeight: '200px', background: 'rgba(255,255,255,0.02)' }}></div>
            </div>
        );
    }
    if (savedProducts.length === 0) {
        return <div className="span-col-4-lg"><EmptyState 
        icon={<FaBrain />} 
        title={t('ابدئي التحليل', 'ابدأ التحليل')} 
        message={t('أضيفي منتجات إلى رفّكِ أولا ليقوم المدرب الذكي بتحليل روتينكِ وتقديم توصيات مخصصة لكِ.', 'أضف منتجات إلى رفّك أولا ليقوم المدرب الذكي بتحليل روتينك وتقديم توصيات مخصصة لك.')} 
   /></div>;
    }

    const visibleInsights = analysisResults.aiCoachInsights.filter(insight => !dismissedInsightIds.includes(insight.id));

    return (
        <div className="glass-analysis-grid">
            <motion.div className="glass-card span-col-2-lg span-row-2-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="glass-card-header" title="نصائح مخصصة بناء على منتجاتك وتعارضاتها المحتملة."><FaMagic /> <span>مدرب الروتين الذكي</span></div>
                <div className="glass-card-content ai-coach-content">
                    <AnimatePresence>
                        {visibleInsights.length > 0 ? visibleInsights.map(insight => {
                            const isDismissible = insight.severity === 'good';
                            return (
                                <motion.div
                                    key={insight.id}
                                   
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: 200, transition: { duration: 0.3 } }}
                                    drag={isDismissible ? "x" : false}
                                    dragConstraints={{ left: 0, right: 0 }}
                                    onDragEnd={(event, info) => {
                                        if (isDismissible && info.offset.x > 120) {
                                            handleDismissPraise(insight.id);
                                        }
                                    }}
                                    whileDrag={isDismissible ? { scale: 1.03, zIndex: 10 } : {}}
                                    className={`insight-pill severity-${insight.severity} ${isDismissible ? 'dismissible' : ''}`}
                                    onClick={() => setSelectedInsight(insight)}
                                >
                                    <div className="insight-pill-header">
                                        {insight.severity === 'good' && <FaCheckCircle />}{insight.severity === 'warning' && <FaExclamationTriangle />}{insight.severity === 'critical' && <FaShieldAlt />}<h6>{insight.title}</h6>
                                    </div>
                                    <p>{insight.short_summary}</p><span className="insight-pill-action">عرض التفاصيل والتوصية</span>
                                </motion.div>
                            );
                        }) : (
                            <div className="weather-placeholder" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                                <FaCheckCircle style={{ color: '#10b981', fontSize: '2.5rem' }} /><span style={{ textAlign: 'center' }}>روتينك يبدو رائعا! لم يتم العثور على مشاكل كبيرة أو تعارضات.</span>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
            <motion.div className="glass-card span-col-2-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="glass-card-header" title="نظرة سريعة على منتجات الصباح والمساء والتفاعلات بينها."><FaSun style={{ color: '#f59e0b' }} /> / <FaMoon style={{ color: '#8b5cf6' }} /> <span>نظرة عامة على الروتين</span></div>
                <div className="glass-card-content routine-overview-grid">
                    <div className="routine-column">
                        <div className="routine-column-header"><h6>روتين الصباح</h6><div className="interaction-summary"><span title="تعارضات"><FaExclamationTriangle />{analysisResults.amRoutine.conflicts}</span><span title="توافقات"><FaCheckCircle />{analysisResults.amRoutine.synergies}</span></div></div>
                        <ul className="routine-product-list">{analysisResults.amRoutine.products.map(p => <li key={p.id}>{p.productName}</li>)}{analysisResults.amRoutine.products.length === 0 && <li className="empty">لا توجد منتجات</li>}</ul>
                    </div>
                    <div className="routine-column">
                        <div className="routine-column-header"><h6>روتين المساء</h6><div className="interaction-summary"><span title="تعارضات"><FaExclamationTriangle />{analysisResults.pmRoutine.conflicts}</span><span title="توافقات"><FaCheckCircle />{analysisResults.pmRoutine.synergies}</span></div></div>
                        <ul className="routine-product-list">{analysisResults.pmRoutine.products.map(p => <li key={p.id}>{p.productName}</li>)}{analysisResults.pmRoutine.products.length === 0 && <li className="empty">لا توجد منتجات</li>}</ul>
                    </div>
                </div>
            </motion.div>
            <WeatherRoutineInsightCard insight={weatherRoutineInsight} />
        </div>
    );
};

const MigrationTab = ({ loading, suggestions, onSelectIngredient }) => {
    const { userProfile } = useAppContext();
    const isMale = userProfile?.settings?.gender === 'ذكر';
    const t = (female, male) => isMale ? male : female;
    // Helper to get match color
    const getMatchColor = (score) => {
        if (score >= 0.9) return '#10b981'; // Green
        if (score >= 0.7) return '#f59e0b'; // Gold
        return '#64748b'; // Gray
    };

    return (
        <div className="tab-content-container">
            <div className="settings-header-area">
                        <h2><FaSeedling /> التحول الطبيعي</h2>
                        <p>{t('استبدلي المكونات الصناعية في روتينكِ بكنوز الطبيعة.', 'استبدل المكونات الصناعية في روتينك بكنوز الطبيعة.')}</p>
                   </div>

            {loading ? (
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    {[...Array(3)].map((_, i) => (
                        <motion.div key={i} variants={itemVariants} className="skeleton-card" style={{ height: '200px', borderRadius: '24px', marginBottom: '1.5rem' }}></motion.div>
                    ))}
                </motion.div>
            ) : suggestions.length > 0 ? (
                <motion.div className="migration-feed" variants={containerVariants} initial="hidden" animate="visible">
                    {suggestions.map((suggestion, index) => (
                        <motion.div 
                            key={index} 
                            className="eco-swap-card" 
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                        >
                            {/* 1. The Synthetic Side (The Problem) */}
                            <div className="swap-side synthetic">
                                <div className="swap-header">
                                    <span className="swap-label">المكون الحالي</span>
                                    <FaFlask />
                                </div>
                                <h3>{suggestion.syntheticIngredient.name}</h3>
                                <p className="swap-function">
                                    يعمل كـ: <strong>{suggestion.primaryBenefit}</strong>
                                </p>
                                <div className="swap-products">
                                    <span className="mini-label">موجود في:</span>
                                    <ul>
                                        {suggestion.productsContaining.map((p, i) => <li key={i}>{p}</li>)}
                                    </ul>
                                </div>
                            </div>

                            {/* The Connector */}
                            <div className="swap-connector">
                                <div className="arrow-circle"><FaArrowLeft /></div>
                            </div>

                            {/* 2. The Natural Side (The Solution) */}
                            <div className="swap-side natural">
                                <div className="swap-header">
                                    <span className="swap-label">البديل الطبيعي</span>
                                    <FaLeaf />
                                </div>
                                <div className="alternatives-list">
                                    {suggestion.naturalAlternatives.length > 0 ? (
                                        suggestion.naturalAlternatives.map(alt => {
                                            const matchPercent = Math.round(alt.matchScore * 100);
                                            return (
                                                <button 
                                                    key={alt.id} 
                                                    className="alt-card" 
                                                    onClick={() => onSelectIngredient(alt)}
                                                >
                                                    <div className="alt-info">
                                                        <h4>
                                                            {alt.name}
                                                            {alt.isHeritage && <FaUniversity className="heritage-icon" title="تراث جزائري" />}
                                                        </h4>
                                                        <span className="match-badge" style={{ color: getMatchColor(alt.matchScore), borderColor: getMatchColor(alt.matchScore) }}>
                                                            {matchPercent}% تطابق
                                                        </span>
                                                    </div>
                                                    <FaArrowLeft className="go-icon" />
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <span className='no-alt-found'>جاري البحث عن بدائل...</span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <EmptyState 
                    icon={<FaCheckCircle />} 
                    title="روتينك نظيف!" 
                    message="لم نعثر على مكونات صناعية قاسية تحتاج لاستبدال في منتجاتك الحالية. أحسنت!" 
                />
            )}
        </div>
    );
};
// --- END: TAB CONTENT COMPONENTS ---
const WeatherInsightCard = ({ weatherData, loading, error }) => {
    const getInsight = () => {
        if (loading) {
            return {
                icon: <FaSpinner className="spinner" />,
                title: "جاري تحليل الطقس...",
                details: "لحظات وستحصل على توصية مخصصة ليومك.",
                severity: "loading"
            };
        }
        if (error) {
            return {
                icon: <FaExclamationTriangle />,
                title: "خطأ في بيانات الطقس",
                details: error,
                severity: "error"
            };
        }
        if (!weatherData) return null;

        const { uv_index, humidity } = weatherData;

        if (uv_index > 7) {
            return {
                icon: <FaSun style={{ color: '#f43f5e' }}/>,
                title: "حماية قصوى اليوم!",
                details: `مؤشر الأشعة فوق البنفسجية مرتفع جدا (${Math.round(uv_index)}). استخدام واقي الشمس بمعامل حماية عالٍ ضروري للغاية.`,
                severity: "critical"
            };
        }
        if (humidity > 70) {
            return {
                icon: <FaTint style={{ color: '#60a5fa' }}/>,
                title: "الرطوبة عالية",
                details: `الجو رطب (${humidity}%). قد ترغبين في استخدام مرطبات خفيفة الوزن (جل أو لوشن) لتجنب الشعور بالثقل على البشرة.`,
                severity: "info"
            };
        }
        if (humidity < 30) {
            return {
                icon: <FaHandHoldingWater style={{ color: '#93c5fd' }} />,
                title: "الجو جاف",
                details: `الرطوبة منخفضة (${humidity}%). بشرتك تحتاج إلى ترطيب إضافي اليوم. استخدم مرطبات غنية وكريمية.`,
                severity: "warning"
            };
        }
         if (uv_index > 4) {
            return {
                icon: <FaCloudSun style={{ color: '#f59e0b' }} />,
                title: "لا تنسَ واقي الشمس",
                details: `مؤشر الأشعة فوق البنفسجية معتدل (${Math.round(uv_index)}). الحماية من الشمس لا تزال مهمة عند الخروج.`,
                severity: "warning"
            };
        }

        return {
            icon: <FaCheckCircle style={{ color: '#10b981' }}/>,
            title: "الطقس مثالي اليوم",
            details: "الظروف الجوية معتدلة. يمكنك الالتزام بروتينك المعتاد للعناية بالبشرة.",
            severity: "good"
        };
    };

    const insight = getInsight();
    if (!insight) return null;

    return (
        <motion.div className={`glass-card span-col-2-lg weather-insight-card severity-${insight.severity}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="glass-card-header"><span className="weather-insight-icon">{insight.icon}</span> <span>نصيحة الطقس اليوم</span></div>
            <div className="glass-card-content">
                <div className="weather-insight-body">
                    <h4>{insight.title}</h4>
                    <p>{insight.details}</p>
                </div>
            </div>
        </motion.div>
    );
};



const WeatherRoutineInsightCard = ({ insight }) => {
    if (!insight) return null;

    return (
        <motion.div className={`glass-card span-col-2-lg weather-insight-card severity-${insight.severity}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="glass-card-header">
                <span className="weather-insight-icon">{insight.icon}</span> 
                <span>نصيحة الطقس لروتينك</span>
            </div>
            <div className="glass-card-content">
                <div className="weather-insight-body">
                    <h4>{insight.title}</h4>
                    <p>{insight.details}</p>
                </div>
            </div>
        </motion.div>
    );
};

/**
 * Calculates the dew point in Celsius as a fallback.
 * @param {number} temperature - The current temperature in Celsius.
 * @param {number} humidity - The current relative humidity in percent.
 * @returns {number} The calculated dew point in Celsius.
 */
const calculateDewPoint = (temperature, humidity) => {
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temperature) / (b + temperature)) + Math.log(humidity / 100.0);
    const dewPoint = (b * alpha) / (a - alpha);
    return dewPoint;
};

const SettingsAccordionItem = ({ id, title, icon, isOpen, onToggle, children }) => {
    return (
        <motion.div 
            id={`accordion-${id}`} 
            className={`settings-accordion-item ${isOpen ? 'open' : ''}`}
            initial={false}
            animate={{ 
                borderColor: isOpen ? 'rgba(5, 150, 105, 0.5)' : 'rgba(255, 255, 255, 0.08)',
                backgroundColor: isOpen ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.03)'
            }}
            transition={{ duration: 0.2 }}
        >
            <button className="accordion-trigger" onClick={() => onToggle(id)}>
                <div className="trigger-title">
                    {icon} <span>{title}</span>
                </div>
                <span className={`chevron ${isOpen ? 'rotated' : ''}`}>
                    <FaChevronDown />
                </span>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div 
                        className="accordion-content"
                        key="content"
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                            open: { opacity: 1, height: "auto" },
                            collapsed: { opacity: 0, height: 0 }
                        }}
                        // This Bezier curve ensures a silky smooth slide without the "pop"
                        transition={{ duration: 0.35, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                        <div className="accordion-inner-padding">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const SettingsOptionGrid = ({ field, options, type, formData, onToggle, onSingle }) => {
    return (
        <div className={type === 'multi' ? "tags-grid" : "cards-grid"}>
            {options.map(opt => {
                const isSelected = type === 'multi' 
                    ? (formData[field] || []).includes(opt.id)
                    : formData[field] === opt.id;

                if (type === 'multi') {
                    return (
                        <motion.button
                            key={opt.id}
                            className={`toggle-tag ${isSelected ? 'selected' : ''}`}
                            onClick={() => onToggle(field, opt.id)}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            // Helps animate position if list changes
                        >
                            {isSelected ? <FaCheckCircle className="tag-check" /> : <div className="tag-circle" />}
                            <span>{opt.label || opt.name}</span>
                        </motion.button>
                    );
                }

                return (
                    <motion.button
                        key={opt.id}
                        className={`option-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => onSingle(field, opt.id)}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                    >
                        {opt.icon && <span className="card-icon">{opt.icon}</span>}
                        <span className="card-label">{opt.label || opt.name}</span>
                        {isSelected && <motion.div layoutId={`glow-${field}`} className="card-glow" />}
                    </motion.button>
                );
            })}
        </div>
    );
};

const RoutineAddModal = ({ isOpen, onClose, mode, savedProducts, allIngredientsDB, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    // --- 1. Hooks for Sheet Logic ---
    const dragControls = useDragControls();
    const y = useMotionValue(0);
    const [touchStart, setTouchStart] = useState(null);
    const [shouldClose, setShouldClose] = useState(false);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    if (!isOpen) return null;

    // --- 2. Handlers ---
    const handleDragEnd = (event, info) => {
        if (info.offset.y > 100) onClose();
    };

    const handleBodyTouchStart = (e) => {
        if (e.currentTarget.scrollTop === 0) {
            setTouchStart(e.touches[0].clientY);
        } else {
            setTouchStart(null);
        }
    };

    const handleBodyTouchMove = (e) => {
        if (touchStart === null) return;
        const currentY = e.touches[0].clientY;
        const diff = currentY - touchStart;
        if (diff > 100) setShouldClose(true);
    };

    const handleBodyTouchEnd = () => {
        if (shouldClose) {
            onClose();
            setShouldClose(false);
        }
        setTouchStart(null);
    };

    // --- 3. Filter Logic ---
    let displayItems = [];
    if (mode === 'product') {
        displayItems = savedProducts.filter(p => 
            p.productName.toLowerCase().includes(searchTerm.toLowerCase())
        ).map(p => ({ id: p.id, name: p.productName, type: 'product' }));
    } else {
        displayItems = combinedOilsDB.ingredients.filter(ing =>
            ing.functionalCategory?.includes('ماسك') || !ing.components
        ).filter(ing =>
            ing.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (ing.searchKeywords && ing.searchKeywords.some(kw => kw.toLowerCase().includes(searchTerm.toLowerCase())))
        ).slice(0, 50).map(ing => ({ id: ing.id, name: ing.name, type: 'raw' }));
    }

    return (
        <motion.div 
            className="glass-modal-backdrop" 
            onClick={onClose}
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{ zIndex: 2000 }}
        >
            <motion.div 
                className="glass-modal-content sheet-modal" 
                onClick={e => e.stopPropagation()}
                
                initial={{ y: "100%" }} 
                animate={{ y: 0 }} 
                exit={{ y: "100%" }} 
                transition={{ type: "spring", damping: 25, stiffness: 300 }}

                drag="y"
                dragControls={dragControls}
                dragListener={false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.5 }}
                onDragEnd={handleDragEnd}
            >
                {/* Handle Bar */}
                <div 
                    className="sheet-handle-bar" 
                    onPointerDown={(e) => dragControls.start(e)}
                    style={{ touchAction: 'none' }}
                >
                    <div className="sheet-handle-container">
                        <div className="sheet-handle"></div>
                        <div className="sheet-swipe-hint"><FaChevronDown /></div>
                    </div>
                </div>

                {/* Header */}
                <div className="glass-modal-header">
                    <h3>{mode === 'product' ? 'اختر منتجا محفوظا' : 'اختر مكونا أو ماسكا'}</h3>
                    <button className="glass-modal-close" onClick={onClose}><FaTimes /></button>
                </div>

                {/* Body (Scrollable) */}
                <div 
                    className="glass-modal-body custom-scrollbar"
                    onTouchStart={handleBodyTouchStart}
                    onTouchMove={handleBodyTouchMove}
                    onTouchEnd={handleBodyTouchEnd}
                    style={{ paddingBottom: 20 }}
                >
                    {/* Search Bar */}
                    <div className="search-bar" style={{ marginBottom: '1.5rem' }}>
                        <FaSearch />
                        <input 
                            type="text" 
                            className="elegant-input" 
                            placeholder={mode === 'product' ? "ابحث في منتجاتك..." : "ابحث عن مكون (سدر، طين...)"}
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            autoFocus
                        />
                    </div>

                    {/* List Items */}
                    <div className="product-select-list">
                        {displayItems.length > 0 ? (
                            displayItems.map(item => (
                                <button key={item.id} onClick={() => onSelect(item.id)}>
                                    {item.type === 'raw' && <FaSeedling style={{ marginLeft: 8, color: '#10b981' }} />}
                                    {item.name}
                                </button>
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '2rem' }}>
                                {searchTerm ? 'لا توجد نتائج.' : 'ابدأ الكتابة للبحث...'}
                            </p>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const Profile = () => {
    // --- 1. ACCESS GLOBAL CONTEXT (Cache + Firebase) ---
    const { 
        user, 
        userProfile, 
        savedProducts,       // <--- Data comes from here now!
        setSavedProducts,    
        loading,             // <--- Global Loading state (True -> False when cache loads)
        logout 
    } = useAppContext();
    // --- 2. LOCAL UI STATE ---
    // Note: We removed 'savedProducts' and 'loading' from here because they come from Context now.
    const [profile, setProfile] = useState(null); 
    const [recentlyDeleted, setRecentlyDeleted] = useState(null);
    
    // Settings Form State
    const [isEditingSettings, setIsEditingSettings] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [settingsSaved, setSettingsSaved] = useState(false);
    const [formData, setFormData] = useState({ 
        hairType: '', skinType: '', scalpType: '', 
        conditions: [], allergies: [], blacklistedIngredients: [], skinGoals: [],
        // --- NEW: Set Default Times Here ---
        reminderAM: '08:00',
        reminderPM: '21:00'
    });

    // UI Tabs & Search
    const [activeTab, setActiveTab] = useState('shelf');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchTermIngredients, setSearchTermIngredients] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    
    // Modals State
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedIngredientDb, setSelectedIngredientDb] = useState(null);
    const [selectedInsight, setSelectedInsight] = useState(null);
    const [selectedMask, setSelectedMask] = useState(null);
    const [newBlacklistIngredient, setNewBlacklistIngredient] = useState('');
    
    // Routine & Weather
    const [isRoutineDirty, setIsRoutineDirty] = useState(false);
    const [dismissedInsightIds, setDismissedInsightIds] = useState([]);
    const [weatherData, setWeatherData] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(true);
    const [weatherError, setWeatherError] = useState(null);
    const [routines, setRoutines] = useState({ am: [], pm: [], weekly: [] });

    const [routineModalConfig, setRoutineModalConfig] = useState({ 
        isOpen: false, mode: 'product', targetRoutine: null, targetStepIndex: null 
    });

    // UI Animation State
    const [hasScrolledTabs, setHasScrolledTabs] = useState(false);
    const [hasScrolledIngredients, setHasScrolledIngredients] = useState(false);
    const [particles, setParticles] = useState([]);
    
    // Refs
    const tabsContainerRef = useRef(null);
    const tabsRefs = useRef({});
    const handleDismissPraise = (insightId) => {
        if (!dismissedInsightIds.includes(insightId)) {
            setDismissedInsightIds(prev => [...prev, insightId]);
        }
    };
    const currentSettings = profile?.settings || userProfile?.settings;
    const gender = currentSettings?.gender || 'أنثى'; 
    const isMale = gender === 'ذكر';
    const t = (female, male) => isMale ? male : female;
    
    // --- 3. SYNC LOCAL STATE WITH GLOBAL PROFILE ---
    // When the cache or firebase updates the profile, update our local form data
    useEffect(() => {
        if (userProfile) {
            setProfile(userProfile);
            
            // --- UPDATED: Merge defaults if values are undefined ---
            setFormData(prev => ({
                ...prev,
                ...(userProfile.settings || {}),
                // Use '??' to allow empty string "" (disabled) to persist, 
                // but default to time if undefined (new user)
                reminderAM: userProfile.settings?.reminderAM ?? '08:00',
                reminderPM: userProfile.settings?.reminderPM ?? '21:00'
            }));

            setRoutines(userProfile.routines || { 
                am: [ { name: 'الخطوة 1: غسول', productIds: [] }, { name: 'الخطوة 2: علاج/تونر', productIds: [] }, { name: 'الخطوة 3: سيروم', productIds: [] }, { name: 'الخطوة 4: مرطب', productIds: [] }, { name: 'الخطوة 5: واقي شمسي', productIds: [] }],
                pm: [ { name: 'الخطوة 1: غسول زيتي', productIds: [] }, { name: 'الخطوة 2: غسول مائي', productIds: [] }, { name: 'الخطوة 3: مقشر/علاج', productIds: [] }, { name: 'الخطوة 4: سيروم', productIds: [] }, { name: 'الخطوة 5: مرطب/زيت', productIds: [] }],
                weekly: [ { name: 'أقنعة الشعر', productIds: [] }, { name: 'أقنعة الوجه', productIds: [] } ]
            });
        }
    }, [userProfile]);
    
    // --- Memoized Data ---
    useModalBack(!!selectedProduct, () => setSelectedProduct(null), '#product-report');

    // 2. Ingredient Details Modal
    useModalBack(!!selectedIngredientDb, () => setSelectedIngredientDb(null), '#ingredient-details');

    // 3. Insight/Tip Modal
    useModalBack(!!selectedInsight, () => setSelectedInsight(null), '#insight-details');

    // 4. Mask Details Modal
    useModalBack(!!selectedMask, () => setSelectedMask(null), '#mask-details');

    // 5. Routine Add Modal
    useModalBack(
        routineModalConfig.isOpen, 
        () => setRoutineModalConfig(prev => ({ ...prev, isOpen: false })), 
        '#add-product'
    );

    useEffect(() => {
        if (userProfile) {
            setProfile(userProfile);
            setFormData(userProfile.settings || {});
            setRoutines(userProfile.routines || { am: [], pm: [], weekly: [] });
        }
    }, [userProfile]);
    // FIX: 'allIngredientsDB' is now declared FIRST
    // Ensure this is inside the component
const allIngredientsDB = useMemo(() => {
    // This is a heavy operation (looping 1000s of items)
    // It should ONLY run once.
    const dbMap = new Map();
    combinedOilsDB.ingredients.forEach(ing => { 
        if (ing && ing.id) dbMap.set(ing.id, ing); 
    });
    return dbMap;
}, []); // Empty dependency array = Runs once on mount only

    // 'weatherRoutineInsight' is now declared AFTER, so it can safely access allIngredientsDB
    const weatherRoutineInsight = useMemo(() => {
        if (weatherLoading) {
            return { icon: <FaSpinner className="spinner" />, title: "جاري تحليل الطقس...", details: "لحظات وستحصل على توصية مخصصة لروتينك.", severity: "loading" };
        }
        if (weatherError) {
            return { icon: <FaExclamationTriangle />, title: "خطأ في بيانات الطقس", details: weatherError, severity: "error" };
        }
        if (!weatherData || savedProducts.length === 0) {
            return { icon: <FaCheckCircle style={{ color: '#10b981' }} />, title: "الطقس معتدل", details: "الظروف الجوية جيدة. يمكنك الالتزام بروتينك المعتاد.", severity: "good" };
        }
    
        const { uv_index, feels_like, dewpoint, humidity, wind_kph, air_quality_us_epa } = weatherData;
        const { skinType } = formData;
    
        const insights = [];
    
        // --- Find relevant products from the user's shelf for recommendations ---
        const sunscreens = savedProducts.filter(p => p.analysisData.product_type === 'sunscreen');
        const antioxidants = savedProducts.filter(p => p.analysisData.detected_ingredients.some(i => allIngredientsDB.get(i.id)?.functionalCategory?.includes('مضاد أكسدة')));
        const heavyMoisturizers = savedProducts.filter(p => p.analysisData.product_type === 'lotion_cream' && p.analysisData.detected_ingredients.some(i => ['shea-butter', 'petrolatum', 'ceramide', 'squalane'].includes(i.id)));
        const lightMoisturizers = savedProducts.filter(p => p.analysisData.product_type === 'serum' || (p.analysisData.product_type === 'lotion_cream' && !heavyMoisturizers.find(hm => hm.id === p.id)));
        const humectants = savedProducts.filter(p => p.analysisData.detected_ingredients.some(i => i.id === 'hyaluronic-acid' || i.id === 'glycerin'));

        // --- Analyze Weather Conditions and Generate Insights ---

        // 1. UV Index Analysis (Highest Priority)
        if (uv_index >= 8) {
            let details = `مؤشر الأشعة فوق البنفسجية خطير (${uv_index}). الحماية القصوى ضرورية. أعيدي تطبيق واقي الشمس كل ساعتين.`;
            if (sunscreens.length > 0) details += ` منتجك "${sunscreens[0].productName}" خيار جيد.`;
            insights.push({ score: 10, severity: 'critical', icon: <FaSun />, title: 'حماية قصوى من الشمس!', details });
        } else if (uv_index >= 4) {
            let details = `مؤشر الأشعة فوق البنفسجية مرتفع (${uv_index}). لا تنسي واقي الشمس اليوم.`;
            if (sunscreens.length > 0) details += ` استخدمي "${sunscreens[0].productName}" قبل الخروج.`;
            else details += ` أنتِ بحاجة لإضافة واقي شمسي لروتينك.`;
            insights.push({ score: 8, severity: 'warning', icon: <FaCloudSun />, title: 'الحماية من الشمس مهمة', details });
        }

        // 2. Air Dryness Analysis (Dew Point)
        if (dewpoint !== null && dewpoint < 5) {
            let details = `الهواء جاف جدا اليوم (نقطة الندى: ${dewpoint.toFixed(0)}°C). بشرتك ستفقد الرطوبة بسرعة.`;
            if (skinType === 'جافة') details += ` هذا الوضع حرج لبشرتك الجافة.`;
            details += ` ركزي على الترطيب المكثف والطبقات.`;
            if (humectants.length > 0) details += ` ابدأي بـ "${humectants[0].productName}" على بشرة رطبة.`;
            if (heavyMoisturizers.length > 0) details += ` ثم احبسي الرطوبة باستخدام "${heavyMoisturizers[0].productName}".`;
            else details += ` أنتِ بحاجة لمرطب غني وواقي لحاجز البشرة.`;
            insights.push({ score: 9, severity: 'critical', icon: <FaHandHoldingWater />, title: 'خطر الجفاف الشديد!', details });
        }

        // 3. Hot & Humid Analysis
        if (feels_like > 30 && humidity > 70) {
            let details = `الجو حار ورطب (${feels_like.toFixed(0)}°C, ${humidity}% رطوبة). قد تزيد إفرازات الدهون.`;
            if (skinType === 'دهنية' || skinType === 'مختلطة') details += ` هذا قد يسبب انسداد المسام لبشرتك.`;
            details += ` استخدمي أخف منتجاتك.`;
            if (lightMoisturizers.length > 0) details += ` مرطب خفيف مثل "${lightMoisturizers[0].productName}" سيكون مثاليا.`;
            if (heavyMoisturizers.length > 0) details += ` تجنبي المرطبات الثقيلة مثل "${heavyMoisturizers[0].productName}" اليوم.`;
            insights.push({ score: 7, severity: 'warning', icon: <FaTint />, title: 'رطوبة وحرارة عالية', details });
        }

        // 4. Air Quality Analysis
        if (air_quality_us_epa >= 3) {
            let details = `جودة الهواء سيئة اليوم، مما يزيد من الإجهاد التأكسدي على بشرتك.`;
            details += ` احرصي على التنظيف المزدوج مساءً.`;
            if (antioxidants.length > 0) details += ` استخدام سيروم مضاد للأكسدة مثل "${antioxidants[0].productName}" في الصباح ضروري لحماية بشرتك.`;
            else details += ` أنتِ بحاجة ماسة لسيروم مضاد للأكسدة (مثل فيتامين C) في روتينك الصباحي.`;
            insights.push({ score: 6, severity: 'warning', icon: <FaShieldAlt />, title: 'تلوث الهواء مرتفع!', details });
        }

        // --- Final Decision ---
        if (insights.length > 0) {
            // Sort by score to get the most important insight for the day
            insights.sort((a, b) => b.score - a.score);
            return insights[0]; // Return the top priority insight
        }
    
        // Default message if no critical conditions are met
        return { icon: <FaCheckCircle style={{ color: '#10b981' }} />, title: "الطقس معتدل اليوم", details: "الظروف الجوية جيدة. يمكنك الالتزام بروتينك المعتاد للعناية بالبشرة.", severity: "good" };
    
    }, [weatherData, weatherLoading, weatherError, savedProducts, formData.skinType, allIngredientsDB]);

    const heritageIngredients = useMemo(() => new Set(['argan', 'black-seed', 'lentisk-oil', 'prickly-pear-seed', 'rosehip']), []);
    
    const naturalIngredients = useMemo(() => {
        const naturalTypes = ['زيت ناقل', 'زبدة', 'زيت عطري', 'زيت ناقل (مُنقوع)'];
        return combinedOilsDB.ingredients.filter(ing => ing.chemicalType && naturalTypes.some(type => ing.chemicalType.includes(type)));
    }, []);

    // 1. State
    

    useEffect(() => {
        // 1. If routine hasn't changed, don't do anything
        if (!isRoutineDirty || !user) return;

        // 2. Set a timer to save after 2 seconds of inactivity
        const autoSaveTimer = setTimeout(async () => {
            setIsSaving(true);
            try {
                const profileRef = doc(db, 'profiles', user.uid);
                // Only update the routines field to be efficient
                await updateDoc(profileRef, { 
                    routines: routines,
                    lastUpdatedAt: Timestamp.now() 
                });
                
                setIsRoutineDirty(false); // Reset dirty flag
                triggerHaptic('success');
                console.log("Auto-save complete");
            } catch (error) {
                console.error("Auto-save failed:", error);
            } finally {
                setIsSaving(false);
            }
        }, 2000); // 2000ms = 2 seconds delay

        // 3. Cleanup: If user changes something else before 2s, cancel previous timer
        return () => clearTimeout(autoSaveTimer);
    }, [routines, isRoutineDirty, user]);

    // 2. Effect: Generate particles EXACTLY like Login.js
    useEffect(() => {
        // Using your Profile Theme Colors (Green/Gold) but with Login's opacity/structure
        const particleColors = [
            { bg: 'rgba(16, 185, 129, 0.6)', glow: 'rgba(16, 185, 129, 0.4)' }, // Emerald
            { bg: 'rgba(52, 211, 153, 0.5)', glow: 'rgba(52, 211, 153, 0.3)' }, // Mint
            { bg: 'rgba(251, 191, 36, 0.5)', glow: 'rgba(251, 191, 36, 0.3)' }   // Gold
        ];

        const numParticles = 10; // Good number for visibility

        const newParticles = Array.from({ length: numParticles }, (_, i) => { 
            const color = particleColors[Math.floor(Math.random() * particleColors.length)]; 
            return { 
                id: i, 
                left: `${Math.random() * 100}vw`, 
                // Size logic from Login: Random between 2px and 5px
                size: `${Math.random() * 3 + 2}px`, 
                // Duration logic from Login: Between 20s and 45s
                duration: `${Math.random() * 25 + 20}s`, 
                delay: `${Math.random() * 5}s`, 
                xEnd: `${(Math.random() - 0.5) * 15}vw`, 
                color: color.bg, 
                glowColor: color.glow, 
                // Animation selection from Login
                animationName: Math.random() > 0.7 ? 'profile-pulse-glow' : 'profile-float-particle' 
            }; 
        });
        setParticles(newParticles);
    }, []);

    // 2. Effect to center the active tab whenever it changes
    useEffect(() => {
        if (tabsContainerRef.current && tabsRefs.current[activeTab]) {
            const container = tabsContainerRef.current;
            const activeTabElement = tabsRefs.current[activeTab];

            // Calculate the position to scroll to
            // Logic: (Tab's offset from left) - (Half the container width) + (Half the tab width)
            const scrollLeft = 
                activeTabElement.offsetLeft - 
                (container.offsetWidth / 2) + 
                (activeTabElement.offsetWidth / 2);

            // Perform the smooth scroll
            container.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });
        }
    }, [activeTab]);

    // --- Effects for Data Fetching ---
    useEffect(() => {
        let isMounted = true;
        const apiKey = "99208a700b6e4ee8b26212752251002";
    
        if (!apiKey) {
            if (isMounted) {
                setWeatherError("مفتاح API الخاص بالطقس غير موجود.");
                setWeatherLoading(false);
            }
            return;
        }
    
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${latitude},${longitude}&lang=ar&aqi=yes`);
    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error.message || `فشل في جلب بيانات الطقس (الحالة: ${response.status})`);
                    }
    
                    const data = await response.json();
                    if (isMounted) {
                        const current = data.current;
                        
                        let finalDewPoint;
                        if (typeof current.dewpoint_c === 'number') {
                            finalDewPoint = current.dewpoint_c;
                        } 
                        else if (typeof current.temp_c === 'number' && typeof current.humidity === 'number') {
                            finalDewPoint = calculateDewPoint(current.temp_c, current.humidity);
                        } else {
                            finalDewPoint = null; 
                        }
    
                        const feelsLikeTemp = typeof current.feelslike_c === 'number' ? current.feelslike_c : current.temp_c;
    
                        setWeatherData({
                            uv_index: current.uv,
                            description: current.condition.text,
                            dewpoint: finalDewPoint,
                            feels_like: feelsLikeTemp,
                            humidity: current.humidity,
                            wind_kph: current.wind_kph,
                            // EPA Index: 1=Good, 2=Moderate, 3=Unhealthy for Sensitive, 4=Unhealthy, 5=Very Unhealthy, 6=Hazardous
                            air_quality_us_epa: current.air_quality ? current.air_quality['us-epa-index'] : null,
                        });
                    }
                } catch (error) {
                    if (isMounted) setWeatherError(`خطأ في بيانات الطقس: ${error.message}`);
                } finally {
                    if (isMounted) setWeatherLoading(false);
                }
            },
            (error) => {
                let errorMessage = "لا يمكن الوصول إلى موقعك.";
                if (error.code === 1) errorMessage = "يرجى السماح بالوصول إلى الموقع للحصول على نصائح الطقس.";
                if (isMounted) {
                    setWeatherError(errorMessage);
                    setWeatherLoading(false);
                }
            }, { timeout: 10000 }
        );
    
        return () => {
            isMounted = false;
        };
    }, []);

   

    const handleAddRoutineItem = (itemId) => {
        const { mode, targetRoutine, targetStepIndex } = routineModalConfig;
        if (!targetRoutine) return;

        const newRoutines = JSON.parse(JSON.stringify(routines));
        const finalId = mode === 'raw' ? `raw::${itemId}` : itemId;
        
        // Add to the correct array
        newRoutines[targetRoutine][targetStepIndex].productIds.push(finalId);
        
        setRoutines(newRoutines);
        setIsRoutineDirty(true);
        
        // Haptic & Close
        if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(15);
        setRoutineModalConfig({ ...routineModalConfig, isOpen: false });
    };

    // --- Core Analysis & Suggestion Logic ---
    const analysisResults = useMemo(() => {
        const NIACINAMIDE_ID = 'niacinamide';
        const PURE_VITAMIN_C_ID = 'vitamin-c';
        const STRONG_ACTIVES = new Set(['Retinoid', 'AHA', 'BHA']);
        const BARRIER_SUPPORT_INGREDIENTS = new Set(['ceramide', 'panthenol', 'cholesterol', 'squalane', NIACINAMIDE_ID]);
        
        const validProducts = savedProducts.filter(p => p?.analysisData?.detected_ingredients);
        if (validProducts.length === 0) {
            return {
                aiCoachInsights: [],
                amRoutine: { products: [], conflicts: 0, synergies: 0 },
                pmRoutine: { products: [], conflicts: 0, synergies: 0 },
                sunProtectionGrade: { score: 0, notes: [] },
                ingredientLibrary: [],
                formulationBreakdown: { actives: 0, hydrators: 0, antioxidants: 0 }
            };
        }

        const insightsMap = new Map();
        const addInsight = (insight) => { if (!insightsMap.has(insight.id)) insightsMap.set(insight.id, insight); };

        const allIngredients = validProducts.flatMap(p => p.analysisData.detected_ingredients.map(ing => ({ ...ing, product: p })));
        const uniqueIngredients = [...new Map(allIngredients.map(item => [item.id, item])).values()];
        const amProducts = savedProducts.filter(p => routines.am.flatMap(step => step.productIds).includes(p.id));
        const pmProducts = savedProducts.filter(p => routines.pm.flatMap(step => step.productIds).includes(p.id));
        
        // --- ▼▼▼ NEW: ALLERGY & CONDITION ANALYSIS (HIGHEST PRIORITY) ▼▼▼ ---
        const userAllergies = formData.allergies || [];
        const userConditions = formData.conditions || [];
        const currentSkinTypeId = formData.skinType; // e.g., 'oily', 'dry'
        const currentScalpTypeId = formData.scalpType;

        if (userAllergies.length > 0 || userConditions.length > 0 || currentSkinTypeId || currentScalpTypeId) {
            
            // 2. Build Allergens Set
            const userAllergenIngredients = new Set(
                userAllergies.flatMap(id => commonAllergies.find(a => a.id === id)?.ingredients || []).map(normalizeForMatching)
            );

            // 3. Build "Avoid" Map (Merging Conditions + Bio Types)
            const userConditionAvoidMap = new Map();

            // A. Add rules from selected Conditions (Acne, Pregnancy, etc.)
            userConditions.forEach(id => {
                const condition = commonConditions.find(c => c.id === id);
                if (condition && condition.avoidIngredients) {
                    condition.avoidIngredients.forEach(ing => {
                        userConditionAvoidMap.set(normalizeForMatching(ing), condition.name);
                    });
                }
            });

            // B. Add rules from Bio: Skin Type (This restores the missing logic!)
            if (currentSkinTypeId) {
                const skinData = basicSkinTypes.find(t => t.id === currentSkinTypeId);
                if (skinData && skinData.avoidIngredients) {
                    skinData.avoidIngredients.forEach(ing => {
                        userConditionAvoidMap.set(normalizeForMatching(ing), `بشرة ${skinData.label}`);
                    });
                }
            }

            // C. Add rules from Bio: Scalp Type
            if (currentScalpTypeId) {
                const scalpData = basicScalpTypes.find(t => t.id === currentScalpTypeId);
                if (scalpData && scalpData.avoidIngredients) {
                    scalpData.avoidIngredients.forEach(ing => {
                        userConditionAvoidMap.set(normalizeForMatching(ing), `فروة رأس ${scalpData.label}`);
                    });
                }
            }


            validProducts.forEach(product => {
                product.analysisData.detected_ingredients.forEach(ing => {
                    const normalizedIngName = normalizeForMatching(ing.name);
                    
                    // Check Allergies
                    if (userAllergenIngredients.has(normalizedIngName)) {
                        const allergy = commonAllergies.find(a => userAllergies.includes(a.id) && a.ingredients.map(normalizeForMatching).includes(normalizedIngName));
                        addInsight({
                            id: `allergy-${product.id}-${ing.id}`,
                            title: 'تحذير حاسم: مكون مسبب للحساسية',
                            short_summary: `منتج "${product.productName}" يحتوي على "${ing.name}"، المرتبط بحساسية "${allergy?.name}" لديك.`,
                            details: `ينصح بشدة بالتوقف عن استخدام "${product.productName}" لتجنب رد فعل تحسسي. المكون المحدد هو ${ing.name}.`,
                            severity: 'critical',
                            related_products: [product.productName]
                        });
                    }

                    // Check Conditions
                    if (userConditionAvoidMap.has(normalizedIngName)) {
                        const conditionName = userConditionAvoidMap.get(normalizedIngName);
                        addInsight({
                            id: `condition-${product.id}-${ing.id}`,
                            title: `تنبيه: مكون لا يناسب حالتك`,
                            short_summary: `منتج "${product.productName}" يحتوي على "${ing.name}" الذي يجب تجنبه مع حالة "${conditionName}".`,
                            details: `بناءً على ملفك الشخصي، من الأفضل تجنب استخدام "${product.productName}" لأنه يحتوي على ${ing.name} الذي قد يؤثر سلباً على ${conditionName}.`,
                            severity: 'warning',
                            related_products: [product.productName]
                        });
                    }
                });
            });
        }
        // --- ▲▲▲ END OF NEW ANALYSIS ▲▲▲ ---

        // --- HAPTIC ENGINE ---

        const getIngredientFunction = (dbIng) => {
            if (!dbIng) return new Set();
            const funcs = new Set();
            const chemType = dbIng.chemicalType?.toLowerCase() || '';
            const funcCategory = dbIng.functionalCategory?.toLowerCase() || '';
            if (chemType.includes('ريتينويد')) funcs.add('Retinoid');
            if (chemType.includes('aha') || dbIng.id === 'glycolic-acid') funcs.add('AHA');
            if (chemType.includes('bha') || dbIng.id === 'salicylic-acid') funcs.add('BHA');
            if (chemType.includes('pha')) funcs.add('PHA');
            if (dbIng.id === 'vitamin-c') funcs.add('Pure Vitamin C');
            if (dbIng.id === 'copper-peptides') funcs.add('Copper Peptides');
            if (funcCategory.includes('مضاد أكسدة')) funcs.add('Antioxidant');
            if (funcCategory.includes('مقشر')) funcs.add('Exfoliant');
            if (dbIng.id === 'benzoyl-peroxide') funcs.add('Benzoyl Peroxide');
            return funcs;
        };

        const getProductsWithFunction = (products, func) => products.filter(p => p.analysisData.detected_ingredients.some(i => getIngredientFunction(allIngredientsDB.get(i.id)).has(func)));

        // --- Blacklist Check ---
        const blacklistedProductsMap = new Map();
        if (formData.blacklistedIngredients && formData.blacklistedIngredients.length > 0) {
            validProducts.forEach(product => {
                product.analysisData.detected_ingredients.forEach(ing => {
                    if (formData.blacklistedIngredients.includes(ing.name)) {
                        if (!blacklistedProductsMap.has(ing.name)) blacklistedProductsMap.set(ing.name, []);
                        blacklistedProductsMap.get(ing.name).push(product.productName);
                    }
                });
            });
        }
        blacklistedProductsMap.forEach((products, ingredient) => {
            addInsight({
                id: `blacklist-${ingredient}`, title: 'تحذير حاسم: مكون في قائمتك السوداء',
                short_summary: `منتجاتك تحتوي على "${ingredient}" الذي حظرته بنفسك.`,
                details: `لقد أضفت "${ingredient}" إلى قائمتك السوداء الشخصية. يوصى بشدة بالتوقف عن استخدام المنتجات التالية لتجنب ردود الفعل السلبية المحتملة.`,
                severity: 'critical', related_products: [...new Set(products)]
            });
        });

        // --- Pregnancy Check (using ID now) ---
        if (userConditions.includes('pregnancy_nursing')) {
            const retinoidProducts = getProductsWithFunction(validProducts, 'Retinoid');
            if (retinoidProducts.length > 0) {
                addInsight({ id: 'critical-pregnancy-retinoid', title: 'تحذير طبي: الريتينويدات والحمل', short_summary: 'يجب التوقف فوراً عن استخدام المنتجات التي تحتوي على الريتينويدات.', details: 'بناءً على ملفك الشخصي، يُنصح بشدة بتجنب جميع أشكال الريتينويدات خلال فترة الحمل والرضاعة بسبب المخاطر المحتملة. يرجى استشارة طبيبك.', severity: 'critical', related_products: retinoidProducts.map(p => p.productName) });
            }
        }

        // --- GOAL-ORIENTED ANALYSIS ---
        const goalChecks = {
            brightening: { benefit: 'تفتيح وتوحيد اللون', details: "لتحقيق هدف التفتيح، فكر في إضافة منتجات تحتوي على فيتامين C، ألفا أربوتين، أو حمض الأزيليك." },
            acne: { benefit: 'مكافحة حب الشباب', details: "لمكافحة حب الشباب، ابحث عن منتجات تحتوي على حمض الساليسيليك، أو الريتينويدات." },
            'anti-aging': { benefit: 'مكافحة الشيخوخة', details: "لمكافحة الشيخوخة، ابحث عن منتجات تحتوي على الريتينويدات، الببتيدات، أو فيتامين C." },
            hydration: { benefit: 'دعم حاجز البشرة', details: "لتحسين الترطيب، ابحث عن منتجات تحتوي على السيراميدات، حمض الهيالورونيك، أو النياسيناميد." }
        };
        (formData.skinGoals || []).forEach(goalId => {
            const check = goalChecks[goalId];
            if (check) {
                const satisfyingProducts = validProducts.filter(p => p.analysisData.detected_ingredients.some(ing => allIngredientsDB.get(ing.id)?.benefits?.[check.benefit]));
                if (satisfyingProducts.length === 0) {
                    addInsight({ id: `goal-gap-${goalId}`, title: `فجوة في هدفك: ${goalId}`, short_summary: `روتينك يفتقر لمكونات فعالة لتحقيق هدف ${goalId}.`, details: check.details, severity: 'warning' });
                } else {
                    addInsight({ id: `goal-align-${goalId}`, title: `توافق مع هدفك: ${goalId}`, short_summary: `روتينك يحتوي على مكونات تدعم هدفك.`, details: `أنت على الطريق الصحيح! منتجاتك تحتوي على مكونات فعالة لتحقيق هدفك وهو ${goalId}.`, severity: 'good', related_products: satisfyingProducts.map(p => p.productName) });
                }
            }
        });
        
        // --- ROUTINE INTEGRITY & PERSONALIZATION ---
        const isOilyOrAcneProne = formData.skinType === 'دهنية' || userConditions.includes('acne_prone');
        const isDryOrSensitive = formData.skinType === 'جافة' || formData.skinType === 'حساسة' || userConditions.includes('sensitive_skin');

        if (pmProducts.length > 0 && !pmProducts.some(p => p.analysisData.product_type === 'cleanser')) {
            addInsight({ id: 'missing-pm-cleanser', title: 'أساسيات ناقصة', short_summary: 'روتينك المسائي لا يحتوي على غسول.', details: 'تنظيف البشرة في المساء هو أهم خطوة لإزالة واقي الشمس والملوثات. الرجاء إضافة غسول لروتينك المسائي.', severity: 'critical' });
        }
        
        const hasActives = validProducts.some(p => p.analysisData.detected_ingredients.some(i => STRONG_ACTIVES.has(Array.from(getIngredientFunction(allIngredientsDB.get(i.id)))[0])));
        if ((hasActives || formData.skinGoals?.includes('hydration')) && !validProducts.some(p => p.analysisData.product_type === 'lotion_cream')) {
             addInsight({ id: 'missing-moisturizer-goal', title: 'أساسيات ناقصة لهدفك', short_summary: 'روتينك يفتقر لمرطب أساسي لدعم أهدافك.', details: 'الترطيب ضروري للحفاظ على صحة حاجز البشرة، وهو أمر حاسم عند استخدام المكونات النشطة أو السعي لترطيب أفضل. يُنصح بإضافة كريم أو لوشن مرطب.', severity: 'warning' });
        }
        
        const usesSunscreen = amProducts.some(p => p.analysisData.product_type === 'sunscreen');
        if (usesSunscreen && !pmProducts.some(p => p.analysisData.product_type === 'oil_blend' || p.productName.toLowerCase().includes('زيتي'))) {
            addInsight({ id: 'double-cleanse-suggestion', title: 'اقتراح: تنظيف مزدوج', short_summary: 'فكر في إضافة غسول زيتي لإزالة واقي الشمس بفعالية.', details: 'لضمان إزالة كاملة لواقي الشمس ومنع انسداد المسام، يُنصح باستخدام غسول زيتي كخطوة أولى في روتينك المسائي قبل الغسول العادي.', severity: 'good' });
        }

        const hydrationThreshold = isDryOrSensitive ? 6 : 4;
        const hydratingProducts = validProducts.filter(p => p.analysisData.detected_ingredients.some(i => BARRIER_SUPPORT_INGREDIENTS.has(i.id) || allIngredientsDB.get(i.id)?.functionalCategory?.includes('مرطب')));
        if (hydratingProducts.length > hydrationThreshold) {
             addInsight({ id: 'over-hydration-warning', title: 'تنبيه: فرط الترطيب المحتمل', short_summary: `روتينك يحتوي على ${hydratingProducts.length} منتجات مرطبة مختلفة.`, details: isOilyOrAcneProne ? 'استخدام عدد كبير من المرطبات قد يثقل بشرتك الدهنية ويؤدي لانسداد المسام. فكر في تبسيط روتينك.' : 'تأكد من أن بشرتك تمتص كل المنتجات جيداً. قد ترغب في تبسيط روتينك قليلاً.', severity: 'warning', related_products: hydratingProducts.map(p=>p.productName) });
        }

        // --- ROUTINE-SPECIFIC ANALYSIS (AM/PM) ---
        const analyzeRoutine = (products, routineName) => {
            if (products.length === 0) return { conflicts: 0, synergies: 0 };
            
            // Layering Check
            const productBases = products.map(p => ({ name: p.productName, base: p.analysisData.product_type === 'oil_blend' ? 'oil' : 'water'}));
            let firstOil = productBases.findIndex(p => p.base === 'oil');
            let lastWater = productBases.map(p=>p.base).lastIndexOf('water');
            if (firstOil !== -1 && lastWater !== -1 && firstOil < lastWater) {
                addInsight({ id: `layering-issue-${routineName}`, title: 'مشكلة في ترتيب المنتجات', short_summary: `المنتجات الزيتية قد تمنع امتصاص المائية في روتين ${routineName}.`, details: `يجب دائمًا تطبيق المنتجات ذات الأساس المائي (السيرومات) أولاً، ثم المنتجات الزيتية أو الكريمات الثقيلة بعدها.`, severity: 'warning', related_products: [productBases[firstOil].name, productBases[lastWater].name]});
            }

            const ingredientsInRoutine = new Map(products.flatMap(p => p.analysisData.detected_ingredients.map(i => [i.id, { ...i, product: p }])));
            const productFunctions = new Map(products.map(p => [p.id, new Set(Array.from(p.analysisData.detected_ingredients).flatMap(i => Array.from(getIngredientFunction(allIngredientsDB.get(i.id)))))]));
        
            let conflicts = 0, synergies = 0;

            // Personalized Barrier Health Check
            const activeProducts = products.filter(p => Array.from(productFunctions.get(p.id) || new Set()).some(f => STRONG_ACTIVES.has(f)));
            const hasBarrierSupport = products.some(p => p.analysisData.detected_ingredients.some(i => BARRIER_SUPPORT_INGREDIENTS.has(i.id)));
            if (activeProducts.length > 0 && !hasBarrierSupport) {
                const severity = isDryOrSensitive ? 'critical' : 'warning';
                conflicts++;
                addInsight({ id: `barrier-neglect-${routineName}`, title: 'خطر على حاجز البشرة', short_summary: `روتينك يفتقر لمكونات داعمة للحاجز بجانب المكونات النشطة.`, details: `استخدام مكونات نشطة قوية بدون دعم كافٍ لحاجز البشرة (مثل السيراميد) يمكن أن يؤدي إلى تهيج.`, severity, related_products: activeProducts.map(p => p.productName) });
            }
            
            // Redundancy and Over-exfoliation
            const exfoliantProducts = products.filter(p => Array.from(productFunctions.get(p.id) || new Set()).some(f => ['AHA', 'BHA', 'PHA', 'Retinoid'].includes(f)));
            if (exfoliantProducts.length > 1) {
                conflicts++;
                addInsight({ id: `over-exfoliation-${routineName}`, title: 'خطر الإفراط في التقشير', short_summary: `روتينك يحتوي على عدة مقشرات قوية.`, details: `استخدام أكثر من مقشر كيميائي قوي في نفس الليلة قد يتلف حاجز بشرتك. التوصية: قم بتبديل استخدامها في ليالٍ مختلفة.`, severity: 'critical', related_products: exfoliantProducts.map(p => p.productName) });
            }
            const vitCProducts = getProductsWithFunction(products, 'Pure Vitamin C');
            if (vitCProducts.length > 1) {
                 addInsight({ id: `redundant-vit-c-${routineName}`, title: 'مكونات متكررة', short_summary: `أنت تستخدم أكثر من منتج فيتامين C في نفس الروتين.`, details: 'استخدام منتج واحد يحتوي على فيتامين C كافٍ تمامًا. استخدام أكثر من منتج لن يزيد من الفوائد وقد يسبب تهيجًا. يمكنك تبسيط روتينك.', severity: 'good', related_products: vitCProducts.map(p => p.productName) });
            }
            
            // Timing
            if (routineName === 'الصباح' && exfoliantProducts.length > 0) {
                 conflicts++;
                 addInsight({ id: 'timing-error-exfoliants', title: 'توقيت غير مناسب', short_summary: `يفضل استخدام المقشرات القوية مساءً.`, details: `المقشرات الكيميائية والريتينويدات تزيد من حساسية بشرتك للشمس. استخدامها مساءً أكثر أمانًا وفعالية.`, severity: 'warning', related_products: exfoliantProducts.map(p => p.productName) });
            }

            // Conflicts and Synergies
            const hasNiacinamide = ingredientsInRoutine.has(NIACINAMIDE_ID);
            const hasPureVitC = ingredientsInRoutine.has(PURE_VITAMIN_C_ID);
            const hasRetinoid = products.some(p => Array.from(productFunctions.get(p.id) || new Set()).includes('Retinoid'));
            if (hasNiacinamide && hasPureVitC) {
                conflicts++;
                addInsight({ id: `ph-conflict-vitc-nia-${routineName}`, title: 'تعارض محتمل في درجة الحموضة', short_summary: `تجنب استخدام فيتامين C النقي مع النياسيناميد معًا.`, details: `استخدامهما معًا قد يقلل من فعالية فيتامين C. التوصية: استخدم فيتامين C صباحًا والنياسيناميد مساءً.`, severity: 'critical', related_products: [ingredientsInRoutine.get(PURE_VITAMIN_C_ID).product.productName, ingredientsInRoutine.get(NIACINAMIDE_ID).product.productName] });
            }
            if (routineName === 'المساء' && hasRetinoid && hasNiacinamide) {
                synergies++;
                 addInsight({ id: `power-couple-retinoid-nia`, title: 'توافق ممتاز: ثنائي القوة!', short_summary: `استخدام النياسيناميد مع الريتينويد هو مزيج ذكي.`, details: `النياسيناميد يساعد على تهدئة البشرة، مما يقلل من التهيج المحتمل للريتينويدات ويعزز النتائج.`, severity: 'good', related_products: [products.find(p => Array.from(productFunctions.get(p.id) || new Set()).includes('Retinoid')).productName, ingredientsInRoutine.get(NIACINAMIDE_ID).product.productName] });
            }

            return { conflicts, synergies };
        };

        const amInteractions = analyzeRoutine(amProducts, 'الصباح');
        const pmInteractions = analyzeRoutine(pmProducts, 'المساء');

        // Final Sun Protection Grade
        let sunProtectionGrade = { score: 0, notes: [] };
        if (amProducts.length > 0) {
            if (usesSunscreen) {
                sunProtectionGrade.score += 70;
                sunProtectionGrade.notes.push("✓ وجود واقي شمسي في روتين الصباح.");
            } else {
                sunProtectionGrade.notes.push("✗ لا يوجد واقي شمسي في روتين الصباح!");
                const severity = formData.skinGoals?.includes('anti-aging') || formData.skinGoals?.includes('brightening') ? 'critical' : 'warning';
                const details = severity === 'critical' ? 'واقي الشمس هو أهم خطوة لتحقيق أهدافك في مكافحة الشيخوخة والتصبغات. بدونه، قد تكون باقي منتجاتك بلا فائدة.' : 'واقي الشمس هو أهم منتج لحماية البشرة. من الضروري إضافته كآخر خطوة في روتينك كل صباح.';
                addInsight({ id: 'missing-sunscreen', title: 'حماية ناقصة!', short_summary: 'روتينك الصباحي لا يحتوي على واقي شمسي.', details, severity });
            }
        }
        
        // Final Aggregation
        const severityOrder = { 'critical': 1, 'warning': 2, 'good': 3 };
        const sortedInsights = Array.from(insightsMap.values()).sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

        return {
            aiCoachInsights: sortedInsights,
            amRoutine: { products: amProducts, ...amInteractions },
            pmRoutine: { products: pmProducts, ...pmInteractions },
            sunProtectionGrade,
            ingredientLibrary: Object.values(allIngredients.reduce((acc, ing) => { if (!acc[ing.id]) acc[ing.id] = { ...ing, products: new Set() }; acc[ing.id].products.add(ing.product.productName); return acc; }, {})).map(ing => ({ ...ing, products: Array.from(ing.products) })),
            formulationBreakdown: uniqueIngredients.reduce((acc, ing) => {
                const dbIng = allIngredientsDB.get(ing.id);
                if (dbIng) {
                    const funcCategory = dbIng.functionalCategory?.toLowerCase() || '';
                    if (['مكون فعال', 'مقشر', 'ريتينويد'].some(t => funcCategory.includes(t) || dbIng.chemicalType?.toLowerCase().includes(t))) acc.actives++;
                    if (funcCategory.includes('مرطب / مطري')) acc.hydrators++;
                    if (funcCategory.includes('مضاد أكسدة')) acc.antioxidants++;
                } return acc;
            }, { actives: 0, hydrators: 0, antioxidants: 0 }),
        };
    }, [savedProducts, allIngredientsDB, formData, routines]);

    const processedIngredientLibrary = useMemo(() => {
        if (!analysisResults.ingredientLibrary) return [];
        let library = [...analysisResults.ingredientLibrary];
        const lowerCaseSearch = searchTermIngredients.toLowerCase();
        const filterMap = {
            'all': () => true,
            'exfoliants': (chemType, funcCategory) => ['aha', 'bha', 'pha'].some(t => chemType.includes(t)) || funcCategory.includes('مقشر'),
            'hydrators': (chemType, funcCategory) => funcCategory.includes('مرطب') || chemType.includes('مرطب'),
            'antioxidants': (chemType, funcCategory) => funcCategory.includes('مضاد أكسدة'),
            'retinoids': (chemType) => chemType.includes('ريتينويد'),
            'peptides': (chemType) => chemType.includes('ببتيد'),
            'oils': (chemType) => chemType.includes('زيت'),
            'surfactants': (chemType, funcCategory) => funcCategory.includes('منظف'),
            'uv-filters': (chemType, funcCategory) => funcCategory.includes('حماية من الشمس'),
        };
        const filterFunction = filterMap[filterCategory] || filterMap['all'];
        library = library.filter(ing => {
            const dbIng = allIngredientsDB.get(ing.id);
            if (!dbIng) return false;
            const nameMatch = ing.name.toLowerCase().includes(lowerCaseSearch);
            const categoryMatch = filterFunction(dbIng.chemicalType?.toLowerCase() || '', dbIng.functionalCategory?.toLowerCase() || '');
            return nameMatch && categoryMatch;
        });
        library.sort((a, b) => a.name.localeCompare(b.name));
        return library;
    }, [analysisResults.ingredientLibrary, searchTermIngredients, filterCategory, allIngredientsDB]);

    const migrationSuggestions = useMemo(() => {
        const validProducts = savedProducts.filter(p => p?.analysisData?.detected_ingredients);
        if (validProducts.length === 0) return [];
        const syntheticIngredientTypes = new Set([
            'سيليكون', 'سيليكون متطاير', 'بوليمر صناعي', 'مادة حافظة', 'مطلق للفورمالديهايد',
            'فلتر كيميائي', 'منظف قاسي', 'منظف قوي', 'مركب أمونيوم رباعي', 'مطهر', 
            'عامل خالب', 'مذيب', 'معدل الحموضة', 'ملون معدني', 'ملون صناعي'
        ]);
        const syntheticIngredientsInUse = new Map();
        validProducts.forEach(product => {
            product.analysisData.detected_ingredients.forEach(ing => {
                const dbEntry = allIngredientsDB.get(ing.id);
                if (dbEntry && syntheticIngredientTypes.has(dbEntry.chemicalType)) {
                    if (!syntheticIngredientsInUse.has(ing.id)) {
                        syntheticIngredientsInUse.set(ing.id, { syntheticIngredient: dbEntry, productsContaining: new Set() });
                    }
                    syntheticIngredientsInUse.get(ing.id).productsContaining.add(product.productName);
                }
            });
        });
        const suggestions = [];
        for (const data of syntheticIngredientsInUse.values()) {
            const syntheticDb = data.syntheticIngredient;
            if (!syntheticDb?.benefits) continue;
            const topBenefit = Object.entries(syntheticDb.benefits).sort(([, a], [, b]) => b - a)[0];
            if (!topBenefit) continue;
            const [benefitName, benefitScore] = topBenefit;
            if (benefitScore < 0.85) continue;
            const alternatives = naturalIngredients
                .map(natIng => {
                    const matchScore = natIng.benefits?.[benefitName];
                    return matchScore ? { ...natIng, matchScore } : null;
                })
                .filter(Boolean)
                .sort((a, b) => b.matchScore - a.matchScore)
                .slice(0, 3);
            if (alternatives.length > 0) {
                 suggestions.push({
                    syntheticIngredient: syntheticDb,
                    primaryBenefit: benefitName,
                    naturalAlternatives: alternatives,
                    productsContaining: Array.from(data.productsContaining)
                });
            }
        }
        return suggestions;
    }, [savedProducts, allIngredientsDB, naturalIngredients]);

// --- HELPER COMPONENTS (Defined OUTSIDE Profile to prevent re-renders) ---


    // --- Event Handlers ---
    const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleMultiSelectChange = (e) => {
        const { name, value, checked } = e.target;
        setFormData(prev => {
            const currentValues = prev[name] || [];
            const newValues = checked ? [...currentValues, value] : currentValues.filter(item => item !== value);
            return { ...prev, [name]: newValues };
        });
    };

    const handleToggleSelection = (field, value) => {
        triggerHaptic('light');
        setFormData(prev => {
            const currentList = prev[field] || [];
            if (currentList.includes(value)) {
                
                return { ...prev, [field]: currentList.filter(item => item !== value) };
            } else {
                // Add
                return { ...prev, [field]: [...currentList, value] };
            }
        });
    };

    // New Handler for Single Selection (Cards)
    const handleSingleSelection = (field, value) => {
        triggerHaptic('light');
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    
    const [openSection, setOpenSection] = useState('null');

    // 2. Smooth Scroll & Toggle Logic
    const toggleSection = (section) => {
        if (openSection === section) {
            setOpenSection(null); // Close if already open
        } else {
            setOpenSection(section); // Open new section
            
            // Wait 300ms for the accordion to expand, then scroll
            setTimeout(() => {
                const element = document.getElementById(`accordion-${section}`);
                if (element) {
                    element.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'nearest', // 'nearest' is less jarring than 'center'
                        inline: 'start' 
                    });
                }
            }, 300);
        }
    };

    // 3. Smart Condition Toggling (Prevents Conflicts)
    // Example: If you select "Dry Scalp", "Oily Scalp" should be unselected.
    const handleConditionToggle = (field, value) => {
        // Define Conflicts
        const conflicts = {
            'dry_scalp': ['oily_scalp'],
            'oily_scalp': ['dry_scalp'],
            'dry_skin': ['oily_skin'], // if these exist in conditions
            'oily_skin': ['dry_skin']
        };

        setFormData(prev => {
            const currentList = prev[field] || [];
            let newList;

            if (currentList.includes(value)) {
                // Removing
                newList = currentList.filter(item => item !== value);
            } else {
                // Adding - First remove any conflicting items
                const conflictingItems = conflicts[value] || [];
                newList = currentList.filter(item => !conflictingItems.includes(item));
                newList.push(value);
            }
            return { ...prev, [field]: newList };
        });
    };
    
    const handleSaveSettings = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            // 1. Save to Firestore
            await updateDoc(doc(db, 'profiles', user.uid), { 
                settings: formData,
                routines: routines,
                lastUpdatedAt: Timestamp.now() 
            });

            // 2. Schedule Notifications (NEW)
            const hasPermission = await NotificationScheduler.requestPermissions();
            if (hasPermission) {
                await NotificationScheduler.scheduleDaily(
                    formData.reminderAM, 
                    formData.reminderPM,
                    formData.gender,
                    routines,       // <--- Pass Routines
                    savedProducts   // <--- Pass Products List
                );
            }

            setProfile(prev => ({ ...prev, settings: formData, routines }));
            setIsEditingSettings(false);
            setIsRoutineDirty(false);
            triggerHaptic('success');
            
            setSettingsSaved(true);
            setTimeout(() => setSettingsSaved(false), 2000);
            
        } catch (error) {
            console.error("Error saving settings:", error);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDeleteProduct = useCallback((productId) => {
        if (!user) return;
        const productToDelete = savedProducts.find(p => p.id === productId);
        if (!productToDelete) return;
        setSavedProducts(current => current.filter(p => p.id !== productId));
        const timeoutId = setTimeout(async () => {
            await deleteDoc(doc(db, 'profiles', user.uid, 'savedProducts', productId));
            setRecentlyDeleted(null);
        }, 5000);
        setRecentlyDeleted({ product: productToDelete, timeoutId });
    }, [savedProducts, user]);
    const handleUndoDelete = useCallback(() => {
        if (!recentlyDeleted) return;
        clearTimeout(recentlyDeleted.timeoutId);
        setSavedProducts(current => [...current, recentlyDeleted.product].sort((a, b) => (a.order || 0) - (b.order || 0)));
        setRecentlyDeleted(null);
    }, [recentlyDeleted]);
    const handleDragEnd = useCallback(async (result) => {
        if (!user || !result.destination || result.source.droppableId !== result.destination.droppableId) return;
        const items = Array.from(savedProducts);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setSavedProducts(items);
        const batch = writeBatch(db);
        items.forEach((item, index) => {
            batch.update(doc(db, 'profiles', user.uid, 'savedProducts', item.id), { order: index });
        });
        await batch.commit();
    }, [savedProducts, user]);
    const handleUpdateBlacklist = useCallback(() => {
        const trimmedIngredient = newBlacklistIngredient.trim();
        if (!trimmedIngredient || (formData.blacklistedIngredients || []).includes(trimmedIngredient)) return;
        setFormData(prev => ({ ...prev, blacklistedIngredients: [...(prev.blacklistedIngredients || []), trimmedIngredient] }));
        setNewBlacklistIngredient('');
    }, [newBlacklistIngredient, formData.blacklistedIngredients]);
    const handleRemoveFromBlacklist = useCallback((ingredient) => {
        setFormData(prev => ({ ...prev, blacklistedIngredients: (prev.blacklistedIngredients || []).filter(i => i !== ingredient) }));
    }, []);
    const handleExport = () => {
        const exportData = { profile, products: savedProducts, routines };
        const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 2))}`;
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `skin_profile_${user.uid.substring(0, 6)}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    if (!user && !userProfile) {
        return <Navigate to="/login" replace />;
    }

    const handleTabsScroll = () => {
        if (!hasScrolledTabs) setHasScrolledTabs(true);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'shelf': return <ShelfTab 
                                    loading={loading} // This 'loading' must be false from Context
                                    savedProducts={savedProducts} // This must be the array from Context
                                    handleDragEnd={handleDragEnd} 
                                    setSelectedProduct={setSelectedProduct} 
                                    handleDeleteProduct={handleDeleteProduct} 
                                    searchTerm={searchTerm} 
                                    setSearchTerm={setSearchTerm} 
                                    weatherData={weatherData} 
                                />;
            case 'routine': return <RoutineBuilderTab 
                                        savedProducts={savedProducts} 
                                        routines={routines} 
                                        setRoutines={setRoutines} 
                                        onSave={handleSaveSettings}
                                        isSaving={isSaving}
                                        isDirty={isRoutineDirty}
                                        setIsDirty={setIsRoutineDirty}
                                        allIngredientsDB={allIngredientsDB}
                                        onSelectMask={setSelectedMask}
                                        // Pass the opener function
                                        onOpenAddModal={(mode, routine, stepIndex) => {
                                            setRoutineModalConfig({ isOpen: true, mode, targetRoutine: routine, targetStepIndex: stepIndex });
                                        }}
                                    />;
            case 'analysis': return (
                <div className="tab-content-container">
                    <div className="focus-area-selector">
                        <label htmlFor="skinGoal"><FaBullseye /> التركيز على الهدف:</label>
                        <select 
                            id="skinGoal" 
                            className="elegant-input"
                            value={formData.skinGoals?.[0] || 'general'}
                            onChange={(e) => setFormData(prev => ({...prev, skinGoals: [e.target.value]}))}
                        >
                            <option value="general">تحليل عام</option>
                            <option value="brightening">التفتيح وتوحيد اللون</option>
                            <option value="acne">مكافحة حب الشباب</option>
                            <option value="anti-aging">مكافحة الشيخوخة</option>
                            <option value="hydration">الترطيب ودعم الحاجز</option>
                        </select>
                    </div>
                    <AnalysisTab 
                        loading={loading} 
                        savedProducts={savedProducts} 
                        analysisResults={analysisResults} 
                        setSelectedInsight={setSelectedInsight}
                        weatherRoutineInsight={weatherRoutineInsight}
                        dismissedInsightIds={dismissedInsightIds}
                        handleDismissPraise={handleDismissPraise}
                    />
                    {savedProducts.length > 0 && 
                        <motion.div className="glass-card span-col-2-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                            <div className="glass-card-header"><FaShieldAlt /> <span>درجة الحماية من الشمس</span></div>
                            <div className="glass-card-content">
                                <div className="sun-protection-grade">
                                    <div style={{width: '120px', margin: '0 auto'}}>
                                        <CircularProgressbar value={analysisResults.sunProtectionGrade.score} text={`${analysisResults.sunProtectionGrade.score}%`} styles={buildStyles({ pathColor: `rgba(252, 211, 77, ${analysisResults.sunProtectionGrade.score / 100 + 0.1})`, textColor: '#fde047', trailColor: 'rgba(255,255,255,0.1)' })} />
                                    </div>
                                    <ul className="sun-protection-notes">
                                        {analysisResults.sunProtectionGrade.notes.map((note, i) => <li key={i}>{note}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    }
                </div>
            );
            case 'migration': return <MigrationTab loading={loading} suggestions={migrationSuggestions.map(s => ({...s, naturalAlternatives: s.naturalAlternatives.map(alt => ({...alt, isHeritage: heritageIngredients.has(alt.id)}))}))} onSelectIngredient={setSelectedIngredientDb} />;
            case "ingredients":
                // Define Filter Options with Icons
                const filterOptions = [
                    { id: "all", label: "الكل", icon: <FaLayerGroup /> },
                    { id: "exfoliants", label: "مقشرات", icon: <FaMagic /> },
                    { id: "hydrators", label: "مرطبات", icon: <FaHandHoldingWater /> },
                    { id: "antioxidants", label: "مضادات أكسدة", icon: <FaShieldAlt /> },
                    { id: "retinoids", label: "ريتينويدات", icon: <FaAtom /> },
                    { id: "peptides", label: "ببتيدات", icon: <FaVial /> },
                    { id: "oils", label: "زيوت", icon: <FaTint /> },
                    { id: "surfactants", label: "منظفات", icon: <FaSoap /> },
                    { id: "uv-filters", label: "فلاتر شمس", icon: <FaSun /> },
                ];

                return (
                  <div className="tab-content-container">
                    <h2><FaVial /> موسوعة مكوناتي</h2>
                    
                    {loading ? (
                      <motion.div variants={listContainerVariants} initial="hidden" animate="visible">
                        <div style={{ height: "80px", background: "rgba(255,255,255,0.02)", borderRadius: "16px", marginBottom: "2rem", }}></div>
                        <div className="ingredient-card-grid">
                          {[...Array(4)].map((_, i) => (
                            <motion.div key={i} variants={listItemVariants} style={{ height: "150px", background: "rgba(255,255,255,0.02)", borderRadius: "16px", }}></motion.div>
                          ))}
                        </div>
                      </motion.div>
                    ) : (analysisResults.ingredientLibrary && analysisResults.ingredientLibrary.length > 0) ? (
                      <>
                        {/* 1. Ingredient Stats (Compact) */}
                        <div className="ingredient-stats-row">
                            <div className="stat-pill"><strong>{analysisResults.ingredientLibrary.length}</strong> فريد</div>
                            <div className="stat-pill"><strong>{analysisResults.formulationBreakdown.actives}</strong> نشط</div>
                            <div className="stat-pill"><strong>{analysisResults.formulationBreakdown.hydrators}</strong> مرطب</div>
                        </div>

                        {/* 2. Search Bar */}
                        <div className="ingredient-controls">
                          <div className="search-bar">
                            <FaSearch />
                            <input type="text" className="elegant-input" placeholder="ابحث عن مكون..." value={searchTermIngredients} onChange={(e) => setSearchTermIngredients(e.target.value)} />
                            {searchTermIngredients && (<button onClick={() => setSearchTermIngredients("")} className="clear-search-btn"><FaTimes /></button>)}
                          </div>
                        </div>

                        {/* 3. THE NEW STICKY FILTER RAIL */}
                        <div className="sticky-filter-container">
                            <div className="glass-filter-rail">
                                {filterOptions.map((cat) => (
                                    <button 
                                        key={cat.id} 
                                        className={`rail-filter-btn ${filterCategory === cat.id ? "active" : ""}`} 
                                        onClick={() => {
                                            if(window.navigator.vibrate) window.navigator.vibrate(10); // Haptic
                                            setFilterCategory(cat.id);
                                        }}
                                    >
                                        {cat.icon}
                                        <span>{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 4. The Grid */}
                        {processedIngredientLibrary.length > 0 ? (
                            <div className="ingredients-reel-wrapper">
                                {/* Mobile Hint Overlay */}
                                <AnimatePresence>
                                    {!hasScrolledIngredients && (
                                        <motion.div 
                                            className="horizontal-swipe-hint"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <FaArrowLeft />
                                            <span>اسحب للعرض</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div 
                                    className="ingredient-card-grid"
                                    // Hide hint once user scrolls
                                    onScroll={() => setHasScrolledIngredients(true)}
                                    // Also hide on touch to be responsive immediately
                                    onTouchStart={() => setHasScrolledIngredients(true)}
                                >
                                    {processedIngredientLibrary.map(ing => { 
                                        const dbIng = allIngredientsDB.get(ing.id);
                                        const topBenefit = dbIng?.benefits ? Object.keys(dbIng.benefits)[0] : null;
                                        const isBlacklisted = formData.blacklistedIngredients?.includes(ing.name);
                                        
                                        let personalBadge = null;
                                        if (dbIng) {
                                            if (formData.skinType === 'دهنية' && dbIng.benefits?.['تنظيم الإفرازات الدهنية']) {
                                                personalBadge = { icon: <FaCheckCircle style={{color: '#10b981'}}/>, title: 'ممتاز لبشرتك الدهنية' };
                                            } else if (formData.skinType === 'جافة' && dbIng.benefits?.['ترطيب']) {
                                                personalBadge = { icon: <FaCheckCircle style={{color: '#10b981'}}/>, title: 'ممتاز لبشرتك الجافة' };
                                            }
                                        }

                                        return (
                                            <motion.div 
                                                key={ing.id} 
                                                className="ingredient-card-new" 
                                                onClick={() => setSelectedIngredientDb(dbIng)} 
                                                layout="position" // Use "position" for smoother perf than layout
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className="ingredient-card-header">
                                                    <h4>{ing.name}</h4>
                                                    <div className="personalization-badges">
                                                        {isBlacklisted && <FaBan className="blacklist-flag-icon" title="موجود في قائمتك السوداء" />}
                                                        {personalBadge && <span title={personalBadge.title}>{personalBadge.icon}</span>}
                                                    </div>
                                                </div>
                                                <p className="ingredient-card-products">{ing.products.join(', ')}</p>
                                                {topBenefit && <span className="benefit-pill">{topBenefit}</span>}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="empty-shelf-message">
                                <p>لم يتم العثور على مكونات في هذا التصنيف.</p>
                            </div>
                        )}
                      </>
                    ) : (
                        <EmptyState 
                        icon={<FaFlask />} 
                        title={t('موسوعتكِ فارغة', 'موسوعتك فارغة')} 
                        message={t('أضيفي منتجات من الماسح الضوئي لبدء بناء مكتبة المكونات الخاصة بكِ وتحليلها.', 'أضف منتجات من الماسح الضوئي لبدء بناء مكتبة المكونات الخاصة بك وتحليلها.')} 
                   />
                    )}
                  </div>
                );
                case 'settings': {
                    const skinGoalsOptions = [
                        { id: 'brightening', label: 'تفتيح وتوحيد', icon: <FaSun /> },
                        { id: 'acne', label: 'علاج حب الشباب', icon: <FaShieldAlt /> },
                        { id: 'anti-aging', label: 'مكافحة الشيخوخة', icon: <FaLeaf /> },
                        { id: 'hydration', label: 'ترطيب عميق', icon: <FaHandHoldingWater /> }
                    ];
    
                    // Use Imported Data for Bio Options
                    const hairTypeOptions = [
                        {id: 'ناعم', label: 'ناعم'}, 
                        {id: 'مموج', label: 'مموج'}, 
                        {id: 'مجعد', label: 'مجعد'}, 
                        {id: 'أفرو', label: 'أفرو'}
                    ];
    
                    return (
                        <div className="tab-content-container settings-layout">
                            <div className="settings-header-area">
                                <h2><FaUserEdit /> الملف الشخصي</h2>
                            </div>
    
                            <div className="accordion-container">
                                
                                {/* 1. BIO: Uses basicSkinTypes / basicScalpTypes */}
                                <SettingsAccordionItem 
                                    id="bio" 
                                    title="السمات الأساسية" 
                                    icon={<FaRegSmile />} 
                                    isOpen={openSection === 'bio'} 
                                    onToggle={toggleSection}
                                >
                                    <div className="sub-label">نوع البشرة</div>
                                    <SettingsOptionGrid 
                                        field="skinType" 
                                        options={basicSkinTypes}  // <--- Dynamic
                                        type="single" 
                                        formData={formData} 
                                        onSingle={handleSingleSelection} 
                                    />
                                    
                                    <div className="sub-label" style={{marginTop: '1.5rem'}}>نوع الشعر</div>
                                    <SettingsOptionGrid 
                                        field="hairType" 
                                        options={hairTypeOptions} 
                                        type="single" 
                                        formData={formData} 
                                        onSingle={handleSingleSelection} 
                                    />
    
                                    <div className="sub-label" style={{marginTop: '1.5rem'}}>نوع فروة الرأس</div>
                                    <SettingsOptionGrid 
                                        field="scalpType" 
                                        options={basicScalpTypes} // <--- Dynamic
                                        type="single" 
                                        formData={formData} 
                                        onSingle={handleSingleSelection} 
                                    />
                                </SettingsAccordionItem>
    
                                {/* 2. GOALS */}
                                <SettingsAccordionItem 
                                    id="goals" 
                                    title="أهدافي الحالية" 
                                    icon={<FaBullseye />} 
                                    isOpen={openSection === 'goals'} 
                                    onToggle={toggleSection}
                                >
                                    <p className="section-desc">اختر ما تركز عليه حالياً.</p>
                                    <SettingsOptionGrid 
                                        field="skinGoals" 
                                        options={skinGoalsOptions} 
                                        type="multi" 
                                        formData={formData} 
                                        onToggle={handleToggleSelection} 
                                    />
                                </SettingsAccordionItem>
    
                                {/* 3. HEALTH (Uses handleConditionToggle for conflicts) */}
                                <SettingsAccordionItem 
                                id="health" 
                                title="حالات صحية وحساسيات" 
                                icon={<FaNotesMedical />} 
                                isOpen={openSection === 'health'} 
                                onToggle={toggleSection}
                            >
                                <div className="sub-label">مخاوف محددة</div>
                                <SettingsOptionGrid 
                                    field="conditions" 
                                    options={commonConditions} // <--- Only contains specific concerns now
                                    type="multi" 
                                    formData={formData} 
                                    onToggle={handleToggleSelection} 
                                />

                                <div className="sub-label" style={{marginTop: '1.5rem'}}>حساسيات معروفة</div>
                                <SettingsOptionGrid 
                                    field="allergies" 
                                    options={commonAllergies} 
                                    type="multi" 
                                    formData={formData} 
                                    onToggle={handleToggleSelection} 
                                />
                            </SettingsAccordionItem>
    
                                {/* 4. BLACKLIST */}
                                <SettingsAccordionItem 
                                    id="blacklist" 
                                    title="القائمة السوداء" 
                                    icon={<FaBan />} 
                                    isOpen={openSection === 'blacklist'} 
                                    onToggle={toggleSection}
                                >
                                    <div className="blacklist-input-wrapper">
                                        <input 
                                            type="text" 
                                            className="elegant-input" 
                                            placeholder="أكتب اسم المكون..." 
                                            value={newBlacklistIngredient} 
                                            onChange={(e) => setNewBlacklistIngredient(e.target.value)} 
                                            onKeyPress={e => e.key === 'Enter' && handleUpdateBlacklist()} 
                                        />
                                        <button className="add-blacklist-btn" onClick={handleUpdateBlacklist}><FaPlusCircle /></button>
                                    </div>
                                    <div className="blacklist-cloud">
                                        <AnimatePresence>
                                            {(formData.blacklistedIngredients || []).map(ing => (
                                                <motion.div 
                                                    key={ing} 
                                                    className="blacklist-pill"
                                                    
                                                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                                >
                                                    <span>{ing}</span>
                                                    <button onClick={() => handleRemoveFromBlacklist(ing)}><FaTimes /></button>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                        {(formData.blacklistedIngredients || []).length === 0 && <span className="empty-hint">لا توجد مكونات محظورة</span>}
                                    </div>
                                </SettingsAccordionItem>
                                {/* 5. NOTIFICATIONS (ENHANCED) */}
                                <SettingsAccordionItem 
                                    id="notifs" 
                                    title="التنبيهات اليومية" 
                                    icon={<FaBell />} 
                                    isOpen={openSection === 'notifs'} 
                                    onToggle={toggleSection}
                                >
                                    <p className="section-desc">فعّل التنبيهات لتذكيرك بروتينك اليومي.</p>
                                    
                                    <div className="notif-settings-wrapper">
                                        
                                        {/* AM Control */}
                                        <div className="notif-row">
                                            <div className="notif-info">
                                                <div className="notif-label">
                                                    <FaSun style={{color: '#f59e0b'}}/> 
                                                    <span>تنبيه الصباح</span>
                                                </div>
                                                {formData.reminderAM && <span className="notif-status on">مفعل</span>}
                                            </div>
                                            
                                            <div className="notif-actions">
                                                {formData.reminderAM ? (
                                                    <>
                                                        <input 
                                                            type="time" 
                                                            className="profile-time-input"
                                                            value={formData.reminderAM}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, reminderAM: e.target.value }))}
                                                        />
                                                        <button 
                                                            className="notif-toggle-btn off"
                                                            onClick={() => setFormData(prev => ({ ...prev, reminderAM: '' }))}
                                                        >
                                                            إيقاف
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button 
                                                        className="notif-toggle-btn on"
                                                        onClick={() => {
                                                            // Default to Current Time
                                                            const now = new Date();
                                                            const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
                                                            setFormData(prev => ({ ...prev, reminderAM: timeString }));
                                                        }}
                                                    >
                                                        تفعيل
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* PM Control */}
                                        <div className="notif-row">
                                            <div className="notif-info">
                                                <div className="notif-label">
                                                    <FaMoon style={{color: '#8b5cf6'}}/> 
                                                    <span>تنبيه المساء</span>
                                                </div>
                                                {formData.reminderPM && <span className="notif-status on">مفعل</span>}
                                            </div>

                                            <div className="notif-actions">
                                                {formData.reminderPM ? (
                                                    <>
                                                        <input 
                                                            type="time" 
                                                            className="profile-time-input"
                                                            value={formData.reminderPM}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, reminderPM: e.target.value }))}
                                                        />
                                                        <button 
                                                            className="notif-toggle-btn off"
                                                            onClick={() => setFormData(prev => ({ ...prev, reminderPM: '' }))}
                                                        >
                                                            إيقاف
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button 
                                                        className="notif-toggle-btn on"
                                                        onClick={() => {
                                                            // Default to Current Time
                                                            const now = new Date();
                                                            const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
                                                            setFormData(prev => ({ ...prev, reminderPM: timeString }));
                                                        }}
                                                    >
                                                        تفعيل
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                </SettingsAccordionItem>

                            </div>
    
                            {/* 5. ACTIONS */}
                            <div className="settings-actions-bar">
                            <motion.button 
                                className={`elegant-btn primary save-btn ${settingsSaved ? 'saved' : ''}`} // Optional: Add class for green styling
                                onClick={handleSaveSettings} 
                                disabled={isSaving || settingsSaved} // Disable while showing success message
                                whileTap={{ scale: 0.95 }}
                            >
                                {isSaving ? (
                                    <FaSpinner className="spinner" />
                                ) : settingsSaved ? (
                                    <><FaCheckCircle /> تم الحفظ بنجاح</>
                                ) : (
                                    <><FaSave /> حفظ التغييرات</>
                                )}
                            </motion.button>
    
                                <div className="secondary-actions">
                                    <button className="icon-action-btn" onClick={handleExport} title="تصدير"><FaDownload /></button>
                                    <button className="icon-action-btn logout" onClick={logout} title="خروج"><FaSignOutAlt /></button>
                                </div>
                            </div>
    
                        </div>
                    );
                }
            default: return null;
        }
    };

    return (
        <div className="profile-scope">
            <SEO 
                title="ملفي الشخصي" 
                description="إدارة روتين العناية، المنتجات المحفوظة، وتحليل احتياجات بشرتك وشعرك." 
            />
            <div className="profile-container">
            <motion.div 
                    className="profile-header-sparkle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="header-content-sparkle">
                    <div className="profile-particles-container">
                {particles.map(p => (
                    <div
                        key={p.id}
                        className="profile-particle"
                        style={{
                            '--size': p.size,
                            '--left-start': p.left,
                            '--anim-duration': p.duration,
                            '--anim-delay': p.delay,
                            '--x-end': p.xEnd,
                            '--bg-color': p.color,
                            '--glow-color': p.glowColor,
                            'animationName': p.animationName
                        }}
                    />
                ))}
            </div>
                        <span className="greeting-pill">
                            {new Date().getHours() < 12 ? '☀️ صباح الأنوار' : '🌙 مساء الأنوار'}
                        </span>
                        
                        <div className="username-wrapper">
                            <h1 className="username-text">
                                {profile?.settings?.name 
                                    ? profile.settings.name 
                                    : t('ضيفتنا العزيزة', 'ضيفنا العزيز')} 
                            </h1>
                        </div>

                        <p className="header-subtitle-sparkle">
                            {t('نهنئكِ على اتخاذ خطوة نحو صحة أحسن لجسمكِ.', 'نهنئك على اتخاذ خطوة نحو صحة أحسن لجسمك.')}
                        </p>
                    </div>
                </motion.div>

                  <div className="profile-tabs-container">
    {/* 1. The Bounce Arrow (Only shows if not scrolled) */}
    <AnimatePresence>
        {!hasScrolledTabs && (
            <motion.div 
                className="swipe-arrow-hint"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
            >
                <FaArrowLeft /> {/* Left arrow implies "scroll this way" in RTL */}
            </motion.div>
        )}
    </AnimatePresence>

    {/* 2. The Scrollable Dock */}
    <div 
        className="profile-tabs" 
        ref={tabsContainerRef}
        onScroll={handleTabsScroll} // Attach listener
    >
        <button 
            ref={el => tabsRefs.current['shelf'] = el} 
            className={`tab-btn ${activeTab === 'shelf' ? 'active' : ''}`} 
            onClick={() =>{setActiveTab('shelf'); triggerHaptic('light');}}
        >
            <FaListUl /> <span>رفي</span>
        </button>
        <button 
            ref={el => tabsRefs.current['routine'] = el}
            className={`tab-btn ${activeTab === 'routine' ? 'active' : ''}`} 
            onClick={() =>{ setActiveTab('routine'); triggerHaptic('light');}}
        >
            <FaCalendarAlt /> <span>روتيني</span>
        </button>
        <button 
            ref={el => tabsRefs.current['analysis'] = el}
            className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`} 
            onClick={() =>{ setActiveTab('analysis'); triggerHaptic('light');}}
        >
            <FaBrain /> <span>تحليل</span>
        </button>
        <button 
            ref={el => tabsRefs.current['migration'] = el}
            className={`tab-btn ${activeTab === 'migration' ? 'active' : ''}`} 
            onClick={() =>{ setActiveTab('migration'); triggerHaptic('light');}}
        >
            <FaSeedling /> <span>البديل</span>
        </button>
        <button 
            ref={el => tabsRefs.current['ingredients'] = el}
            className={`tab-btn ${activeTab === 'ingredients' ? 'active' : ''}`} 
            onClick={() =>{ setActiveTab('ingredients'); triggerHaptic('light');}}
        >
            <FaFlask /> <span>مكونات</span>
        </button>
        <button 
            ref={el => tabsRefs.current['settings'] = el}
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} 
            onClick={() =>{ setActiveTab('settings'); triggerHaptic('light');}}
        >
            <FaCog /> <span>إعدادات</span>
        </button>
    </div>


                    {/* 2. The Conditional Arrow Indicator */}
                    <AnimatePresence>
                        {!hasScrolledTabs && (
                            <motion.div 
                                className="swipe-arrow-hint"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                            >
                                <FaArrowLeft /> {/* Use Left arrow for RTL scrolling */}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <AnimatePresence mode="wait">
                <motion.div 
                        key={activeTab} 
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="tab-animator"
                    >
                        {renderTabContent()}
                    </motion.div>
                </AnimatePresence>
                <AnimatePresence>
                    {recentlyDeleted && <UndoToast message="تم حذف المنتج." onUndo={handleUndoDelete} />}
                    {selectedProduct && <AnalysisReportModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
                    {selectedIngredientDb && <IngredientDetailModal db={selectedIngredientDb} onClose={() => setSelectedIngredientDb(null)} allIngredientsDB={allIngredientsDB} />}
                    {selectedInsight && <InsightDetailModal insight={selectedInsight} onClose={() => setSelectedInsight(null)} />}
                    {selectedMask && <MaskDetailModal mask={selectedMask} onClose={() => setSelectedMask(null)} allIngredientsDB={allIngredientsDB} />}
                </AnimatePresence>

                <AnimatePresence>
                    {routineModalConfig.isOpen && (
                        <RoutineAddModal 
                            isOpen={routineModalConfig.isOpen}
                            mode={routineModalConfig.mode}
                            onClose={() => setRoutineModalConfig({ ...routineModalConfig, isOpen: false })}
                            savedProducts={savedProducts} // Pass all products, modal filters internally
                            allIngredientsDB={allIngredientsDB}
                            onSelect={handleAddRoutineItem}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Profile;