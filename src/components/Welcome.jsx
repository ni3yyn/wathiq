import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    commonAllergies, 
    commonConditions, 
    basicSkinTypes, 
    basicScalpTypes 
} from './allergiesAndConditions';
import { FaArrowLeft, FaCheckCircle, FaSpinner, FaUser, FaHeartbeat, FaLeaf, FaTint, FaWind } from 'react-icons/fa';
import { useAppContext } from './AppContext';
import '../Welcome.css';

// --- Helper: Map Icons to the new Data IDs ---
const getIconForType = (id) => {
    const icons = {
        'oily': <FaTint />,
        'dry': <FaLeaf />,
        'combo': <FaWind />,
        'normal': <FaUser />,
        'sensitive': <FaHeartbeat />
    };
    return icons[id] || <FaUser />;
};

// --- Helper: Filter Conditions by Category ---
const categorizedConditions = {
    skin: { 
        title: "مخاوف البشرة", 
        icon: <FaUser />, 
        items: commonConditions.filter(c => c.category === 'skin_concern') 
    },
    hair: { 
        title: "مخاوف الشعر وفروة الرأس", 
        icon: <FaLeaf />, 
        items: commonConditions.filter(c => c.category === 'scalp_concern') 
    },
    health: { 
        title: "حالات صحية عامة", 
        icon: <FaHeartbeat />, 
        items: commonConditions.filter(c => c.category === 'health') 
    }
};

const Welcome = () => {
    const { user } = useAppContext();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    
    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        gender: '', // Will hold 'ذكر' or 'أنثى'
        skinType: '',
        scalpType: '',
        conditions: [],
        allergies: [],
    });

    // --- GENDER LOCALIZATION HELPER ---
    const isMale = formData.gender === 'ذكر';
    
    // Usage: t('Text for Female', 'Text for Male')
    const t = (femaleText, maleText) => isMale ? maleText : femaleText;

    const totalSteps = 7;

    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
    const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    const handleSelection = (type, value, isMultiSelect = false) => {
        setFormData(prev => {
            if (isMultiSelect) {
                const currentValues = prev[type] || [];
                const newValues = currentValues.includes(value) ? currentValues.filter(item => item !== value) : [...currentValues, value];
                return { ...prev, [type]: newValues };
            }
            return { ...prev, [type]: value };
        });
    };

    const handleOnboardingComplete = async () => {
        if (!user) return;
        setLoading(true);
        const profileRef = doc(db, 'profiles', user.uid);
        try {
            await updateDoc(profileRef, {
                'settings.name': formData.name,
                'settings.gender': formData.gender,
                'settings.skinType': formData.skinType,
                'settings.scalpType': formData.scalpType,
                'settings.conditions': formData.conditions, 
                'settings.allergies': formData.allergies,   
                onboardingComplete: true,
            });
            navigate('/profile');
        } catch (error) {
            console.error("Failed to complete onboarding:", error);
        } finally {
            setLoading(false);
        }
    };
    
    const stepVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
        exit: { opacity: 0, y: -30 }
    };
    
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } } };

    const [particles, setParticles] = useState([]);
     useEffect(() => {
        const particleColors = [ { bg: 'rgba(230, 240, 230, 0.7)', glow: 'rgba(230, 240, 230, 0.5)' }, { bg: 'rgba(178, 216, 180, 0.6)', glow: 'rgba(178, 216, 180, 0.5)' }];
        const newParticles = Array.from({ length: 10 }, (_, i) => ({ 
            id: i, 
            left: `${Math.random() * 100}vw`, 
            size: `${Math.random() * 2 + 1}px`, 
            duration: `${Math.random() * 20 + 25}s`, 
            delay: `${Math.random() * 2}s`, 
            xEnd: `${(Math.random() - 0.5) * 10}vw`, 
            color: particleColors[Math.floor(Math.random() * particleColors.length)].bg, 
            glowColor: particleColors[Math.floor(Math.random() * particleColors.length)].glow, 
            animationName: 'welcome-float-particle' 
        }));
        setParticles(newParticles);
    }, []);

    return (
        <div className="welcome-page-container">
            <motion.div className="welcome-panel" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: "easeOut" }}>
                
                <div className="welcome-particles-container">
                    {particles.map(p => ( <div key={p.id} className="welcome-particle" style={{ '--size': p.size, '--left-start': p.left, '--anim-duration': p.duration, '--anim-delay': p.delay, '--x-end': p.xEnd, '--bg-color': p.color, '--glow-color': p.glowColor, 'animationName': p.animationName }} /> ))}
                </div>

                <div className="welcome-header">
                    <AnimatePresence mode="wait">
                        <motion.h2 key={currentStep} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.3 }}>
                            {currentStep === 0 && t('أهلا بكِ!', 'أهلا بكَ!')}
                            {currentStep === 1 && t('لنتعرف عليكِ أكثر', 'لنتعرف عليكَ أكثر')}
                            {currentStep === 2 && t('ما هو نوع بشرتكِ؟', 'ما هو نوع بشرتكَ؟')}
                            {currentStep === 3 && t('وماذا عن نوع فروة رأسكِ؟', 'وماذا عن نوع فروة رأسكَ؟')}
                            {currentStep === 4 && t('ما هي اهتماماتكِ الرئيسية؟', 'ما هي اهتماماتكَ الرئيسية؟')}
                            {currentStep === 5 && t('هل لديكِ أي حساسية؟', 'هل لديكَ أي حساسية؟')}
                            {currentStep === 6 && t('أنتِ جاهزة للانطلاق!', 'أنت جاهز للانطلاق!')}
                        </motion.h2>
                    </AnimatePresence>
                    <div className="welcome-progress-bar-container">
                        <motion.div className="welcome-progress-bar-filler" animate={{ width: `${((currentStep) / (totalSteps - 1)) * 100}%` }}/>
                    </div>
                </div>

                <div className="welcome-content">
                    <AnimatePresence mode="wait">
                        {/* Step 0: Gender */}
                        {currentStep === 0 && (
                            
                        <motion.div key="step0" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                                <motion.p variants={itemVariants} className="welcome-step-subtitle">نحن نستخدم هذا لتخصيص الخطاب والتوصيات</motion.p>
                                <motion.div variants={itemVariants} className="welcome-selection-grid welcome-gender-grid">
                                    {['أنثى', 'ذكر'].map(gender => (
                                        <button key={gender} className={`welcome-selection-item ${formData.gender === gender ? 'selected' : ''}`} onClick={() => handleSelection('gender', gender)}>
                                            {gender}
                                            <AnimatePresence>{formData.gender === gender && <motion.div className="welcome-check-icon" initial={{ scale: 0 }} animate={{ scale: 1 }}><FaCheckCircle /></motion.div>}</AnimatePresence>
                                        </button>
                                    ))}
                                </motion.div>
                            </motion.div>
                        )}

                        {/* Step 1: Name */}
                        {currentStep === 1 && (
                            <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                                <motion.p variants={itemVariants} className="welcome-step-subtitle">
                                    {t('ما هو الاسم الذي تحبين أن نناديكِ به؟', 'ما هو الاسم الذي تحب أن نناديكَ به؟')}
                                </motion.p>
                                <motion.input variants={itemVariants} type="text" className="welcome-name-input" placeholder="اسمك هنا..." value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                            </motion.div>
                        )} 
                        
                        {/* Step 2: Skin Type (Using basicSkinTypes) */}
                        {currentStep === 2 && (
                             <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                                <motion.p variants={itemVariants} className="welcome-step-subtitle">
                                    {t('يساعدنا هذا في إعطاء توصيات دقيقة لمنتجات الوجه.', 'يساعدنا هذا في إعطاء توصيات دقيقة لمنتجات الوجه.')}
                                </motion.p>
                                <motion.div variants={itemVariants} className="welcome-selection-grid welcome-icon-grid">
                                    {basicSkinTypes.map(type => (
                                        <button key={type.id} className={`welcome-selection-item welcome-icon-item ${formData.skinType === type.id ? 'selected' : ''}`} onClick={() => handleSelection('skinType', type.id)}>
                                            <span className="welcome-item-icon">{getIconForType(type.id)}</span>
                                            {type.label}
                                            <AnimatePresence>{formData.skinType === type.id && <motion.div className="welcome-check-icon" initial={{ scale: 0 }} animate={{ scale: 1 }}><FaCheckCircle /></motion.div>}</AnimatePresence>
                                        </button>
                                    ))}
                                </motion.div>
                            </motion.div>
                        )}

                        {/* Step 3: Scalp Type (Using basicScalpTypes) */}
                        {currentStep === 3 && (
                             <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                                <motion.p variants={itemVariants} className="welcome-step-subtitle">وهذا مهم لتحليل منتجات الشعر مثل الشامبو والزيوت.</motion.p>
                                <motion.div variants={itemVariants} className="welcome-selection-grid welcome-icon-grid">
                                    {basicScalpTypes.map(type => (
                                        <button key={type.id} className={`welcome-selection-item welcome-icon-item ${formData.scalpType === type.id ? 'selected' : ''}`} onClick={() => handleSelection('scalpType', type.id)}>
                                            <span className="welcome-item-icon">{getIconForType(type.id)}</span>
                                            {type.label}
                                            <AnimatePresence>{formData.scalpType === type.id && <motion.div className="welcome-check-icon" initial={{ scale: 0 }} animate={{ scale: 1 }}><FaCheckCircle /></motion.div>}</AnimatePresence>
                                        </button>
                                    ))}
                                </motion.div>
                            </motion.div>
                        )}
                        
                        {/* Step 4: Conditions (Dynamic Category Filter) */}
                        {currentStep === 4 && (
                             <motion.div key="step4" className="welcome-conditions-step" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                                {Object.values(categorizedConditions).map(category => (
                                    <motion.div key={category.title} className="welcome-condition-category" variants={itemVariants}>
                                        <h4>{category.icon} {category.title}</h4>
                                        <div className="welcome-selection-grid">
                                            {category.items.map(c => (
                                                <button key={c.id} className={`welcome-selection-item ${formData.conditions.includes(c.id) ? 'selected' : ''}`} onClick={() => handleSelection('conditions', c.id, true)}>
                                                    {c.name}
                                                    <AnimatePresence>{formData.conditions.includes(c.id) && <motion.div className="welcome-check-icon" initial={{ scale: 0 }} animate={{ scale: 1 }}><FaCheckCircle /></motion.div>}</AnimatePresence>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {/* Step 5: Allergies */}
                        {currentStep === 5 && (
                             <motion.div key="step5" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                                <motion.p variants={itemVariants} className="welcome-step-subtitle">
                                    {t('هذا يساعدنا على تحذيركِ من المكونات التي قد تسبب لكِ تهيجا.', 'هذا يساعدنا على تحذيركَ من المكونات التي قد تسبب لكَ تهيجا.')}
                                </motion.p>
                                <motion.div variants={itemVariants} className="welcome-selection-grid">
                                    {commonAllergies.map(a => (
                                        <button key={a.id} className={`welcome-selection-item ${formData.allergies.includes(a.id) ? 'selected' : ''}`} onClick={() => handleSelection('allergies', a.id, true)}>
                                            {a.name}
                                            <AnimatePresence>{formData.allergies.includes(a.id) && <motion.div className="welcome-check-icon" initial={{ scale: 0 }} animate={{ scale: 1 }}><FaCheckCircle /></motion.div>}</AnimatePresence>
                                        </button>
                                    ))}
                                </motion.div>
                             </motion.div>
                        )}

                         {currentStep === 6 && (
                             <motion.div key="step6" className="welcome-final-step-content" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                                <motion.div variants={itemVariants} className="welcome-final-icon-wrapper">
                                    <FaCheckCircle className="welcome-final-icon"/>
                                </motion.div>
                                <motion.h3 variants={itemVariants}>
                                    شكرا {t('لكِ', 'لكَ')}، {formData.name || t('عزيزتي', 'عزيزي')}!
                                </motion.h3>
                                <motion.p variants={itemVariants}>
                                    تم إعداد {t('ملفكِ', 'ملفكَ')} الشخصي. {t('أنتِ الآن جاهزة', 'أنت الآن جاهز')} لاستكشاف عالم المكونات بثقة.
                                </motion.p>
                             </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                <div className="welcome-navigation">
                    {currentStep > 0 && (
                        <button className="welcome-nav-btn welcome-secondary" onClick={handleBack}><FaArrowLeft /> رجوع</button>
                    )}
                    {currentStep < totalSteps - 1 ? (
                        <button className="welcome-nav-btn" onClick={handleNext} disabled={
                            // Step 0 is now Gender -> Check if gender is selected
                            (currentStep === 0 && !formData.gender) ||
                            
                            // Step 1 is now Name -> Check if name is typed
                            (currentStep === 1 && !formData.name.trim()) ||
                            
                            // Step 2 is Skin Type -> Check skinType
                            (currentStep === 2 && !formData.skinType) ||
                            
                            // Step 3 is Scalp Type -> Check scalpType
                            (currentStep === 3 && !formData.scalpType)
                        }>
                            التالي
                        </button>
                    ) : (
                        <button className="welcome-nav-btn" onClick={handleOnboardingComplete} disabled={loading}>
                            {loading ? <FaSpinner className="welcome-spinning" /> : <>إنهاء وحفظ</>}
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Welcome;