import { React, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../firebase'; // <-- Import db
import { doc, setDoc, Timestamp } from 'firebase/firestore'; // <-- Import firestore functions
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from 'firebase/auth';
import {
    FaShieldAlt,
    FaUserPlus,
    FaSignInAlt,
    FaMicroscope,
    FaBullhorn,
    FaTasks,
    FaCheckCircle,
    FaSpinner,
    FaArrowLeft,
    FaArrowRight
} from 'react-icons/fa';
import '../Login.css';

const features = [
    { icon: <FaMicroscope />, title: 'افهم كل مكون', description: 'نظامنا يحلل كل مكون في منتجك بناء على أحدث الدراسات العلمية ليعطيك تقييما دقيقا.' },
    { icon: <FaBullhorn />, title: 'لا تدع الغلاف يخدعك', description: 'نكشف لك حقيقة الادعاءات التسويقية، ونوضح ما إذا كان المنتج يستحق ثمنه حقا أم لا.' },
    { icon: <FaTasks />, title: 'روتينك كاملا تحت السيطرة', description: 'احفظ كل منتجاتك، واكتشف أي تعارضات خطيرة بينها، واحصل على تقييم شامل لروتينك.' },
    { icon: <FaCheckCircle />, title: 'نتيجة علمية تثق بها', description: 'احصل على درجة موثوقية علمية لكل منتج، مما يمنحك الثقة الكاملة في كل عملية شراء.' }
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({ opacity: 1, transition: { staggerChildren: 0.1, delayChildren: i * 0.1 } }),
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

const Login = ({ onRegisterSuccess }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [particles, setParticles] = useState([]);
    const [[activeIndex, direction], setActiveIndex] = useState([0, 0]);
    const [isSwitching, setIsSwitching] = useState(false);

    useEffect(() => {
        const particleColors = [
            { bg: 'rgba(230, 240, 230, 0.7)', glow: 'rgba(230, 240, 230, 0.5)' }, 
            { bg: 'rgba(178, 216, 180, 0.6)', glow: 'rgba(178, 216, 180, 0.5)' }, 
            { bg: 'rgba(210, 180, 140, 0.5)', glow: 'rgba(210, 180, 140, 0.4)' }
        ];

        // OPTIMIZATION: Detect screen width
        const isMobile = window.innerWidth < 768;
        
        // Reduce particles on mobile (10 instead of 24)
        const numParticles = isMobile ? 12 : 24; 

        const newParticles = Array.from({ length: numParticles }, (_, i) => { 
            const color = particleColors[Math.floor(Math.random() * particleColors.length)]; 
            return { 
                id: i, 
                left: `${Math.random() * 100}vw`, 
                size: `${Math.random() * 3 + 1.5}px`, 
                duration: `${Math.random() * 25 + 20}s`, 
                delay: `${Math.random() * 2}s`, 
                xEnd: `${(Math.random() - 0.5) * 15}vw`, 
                color: color.bg, 
                glowColor: color.glow, 
                animationName: Math.random() > 0.7 ? 'login-pulse-glow' : 'login-float-particle' 
            }; 
        });
        setParticles(newParticles);
    }, []);

    const handleAuthAction = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            if (isLoginView) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                if (password.length < 6) {
    const error = new Error("Password is too weak.");
    error.code = 'auth/weak-password';
    throw error;
}
                
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const newUser = userCredential.user;

                const profileRef = doc(db, 'profiles', newUser.uid);
                const newProfileData = {
                    email: newUser.email,
                    createdAt: Timestamp.now(),
                    settings: { name: '', gender: '', hairType: '', skinType: '', conditions: [], allergies: [], blacklistedIngredients: [], skinGoals: [] },
                    routines: { am: [], pm: [] },
                    onboardingComplete: false
                };
                await setDoc(profileRef, newProfileData);

                if (onRegisterSuccess) {
                    onRegisterSuccess();
                }
            }
        } catch (err) {
            switch (err.code) {
                case 'auth/user-not-found': setError('هذا البريد الإلكتروني غير مسجل.'); break;
                case 'auth/wrong-password': setError('كلمة المرور غير صحيحة.'); break;
                case 'auth/email-already-in-use': setError('هذا البريد الإلكتروني مستخدم بالفعل.'); break;
                case 'auth/invalid-email': setError('البريد الإلكتروني المدخل غير صالح.'); break;
                case 'auth/weak-password': setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل.'); break;
                default: setError('فشل المصادقة. يرجى المحاولة مرة أخرى.'); console.error("Firebase Auth Error:", err);
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!email) {
            setError("الرجاء إدخال بريدك الإلكتروني في الحقل أعلاه أولا.");
            return;
        }
        setError('');
        setMessage('');
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            
            // --- THIS IS THE KEY CHANGE ---
            // Instead of a simple message, give the user clear instructions.
            setMessage('تم إرسال الرابط! يرجى التحقق من صندوق الوارد الخاص بك وكذلك مجلد الرسائل غير المرغوب فيها (Spam).'); 
            
        } catch (error) {
            setError("فشل إرسال البريد الإلكتروني. تأكد من صحة البريد والمحاولة مرة أخرى.");
        } finally {
            setLoading(false);
        }
    };

    const navigateFeature = (newDirection) => {
        let newIndex = activeIndex + newDirection;
        if (newIndex < 0) newIndex = features.length - 1;
        else if (newIndex >= features.length) newIndex = 0;
        setActiveIndex([newIndex, newDirection]);
    };

    const slideVariants = {
        enter: (direction) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (direction) => ({ x: direction < 0 ? '100%' : '-100%', opacity: 0 })
    };

    const handleViewChange = () => {
        setIsSwitching(true); // Trigger the blur-out animation

        // Wait for the animation to finish before changing the content
        setTimeout(() => {
            setIsLoginView(prev => !prev);
            setError('');
            setMessage('');
            setPassword('');
            setIsSwitching(false); // Trigger the blur-in animation for new content
        }, 300); // This duration must match the CSS transition duration
    };

    return (
        <div className="login-page-container">
            <motion.div
                className="login-panel-enhanced"
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="login-particles-container">
                    {particles.map(p => (
                        <div
                            key={p.id}
                            className="login-particle"
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

                <div className="login-promo-panel">
                    <motion.div
                        className="login-promo-header"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={itemVariants}><FaShieldAlt className="login-promo-main-icon" /></motion.div>
                        <motion.h1 variants={itemVariants}>وثيق..دليلك للعناية بجمالك في الجزائر</motion.h1>
                        <motion.p variants={itemVariants} className="login-promo-subtitle">انضم الآن لمنصة تحليل منتجات العناية الأولى في الجزائر والمغرب العربي، والمبنية على أحدث الدراسات الموثوقة.</motion.p>
                    </motion.div>

                    <div className="login-slider-container">
                        <AnimatePresence initial={false} custom={direction} mode="wait">
                            <motion.div
                                key={activeIndex}
                                className="login-feature-slide-content"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <div className="login-feature-item-icon">{features[activeIndex].icon}</div>
                                <h4>{features[activeIndex].title}</h4>
                                <p>{features[activeIndex].description}</p>
                            </motion.div>
                        </AnimatePresence>
                        <div className="login-slider-nav login-prev" onClick={() => navigateFeature(-1)}><FaArrowRight /></div>
                        <div className="login-slider-nav login-next" onClick={() => navigateFeature(1)}><FaArrowLeft /></div>
                    </div>

                    <div className="login-slider-dots">
                        {features.map((_, index) => (
                            <div key={index} className={`login-dot ${activeIndex === index ? 'active' : ''}`} onClick={() => setActiveIndex([index, index > activeIndex ? 1 : -1])} />
                        ))}
                    </div>
                </div>

                <div className="login-form-panel">
                    {/* --- Apply the conditional 'switching' class here --- */}
                    <motion.div
                        className={`login-form-container ${isSwitching ? 'switching' : ''}`}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        custom={2}
                    >
                        <motion.h3 variants={itemVariants}>{isLoginView ? 'مرحبا بعودتك!' : 'حسابك المجاني في انتظارك'}</motion.h3>
                        <motion.p variants={itemVariants} className="login-form-subtitle">
                            {isLoginView ? 'سجل دخولك للوصول إلى تحليلاتك وروتينك.' : 'أنشئ حسابك وابدأ فورا في اتخاذ قرارات أكثر ذكاء.'}
                        </motion.p>
                        <form onSubmit={handleAuthAction}>
                            <motion.div variants={itemVariants} className="login-input-group">
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="البريد الإلكتروني" />
                            </motion.div>
                            <motion.div variants={itemVariants} className="login-input-group">
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="كلمة المرور" />
                            </motion.div>

                            <AnimatePresence>
                                {error && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="login-auth-form-error">{error}</motion.p>}
                                {message && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="login-auth-form-message">{message}</motion.p>}
                            </AnimatePresence>

                            <motion.button variants={itemVariants} type="submit" className="login-auth-form-btn-enhanced" disabled={loading}>
                                {loading ? <FaSpinner className="login-spinning" /> : (isLoginView ? <><FaSignInAlt /> تسجيل الدخول</> : <><FaUserPlus /> إنشاء حساب</>)}
                            </motion.button>
                        </form>
                        <motion.div variants={itemVariants} className="login-form-footer">
                            <p>
                                {isLoginView ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
                                {/* --- Use the new handler for the click event --- */}
                                <span onClick={handleViewChange}>
                                    {isLoginView ? ' أنشئ حسابا الآن' : ' سجل الدخول'}
                                </span>
                            </p>
                            {isLoginView && (
                                <p className="login-forgot-password" onClick={handlePasswordReset}>
                                    نسيت كلمة المرور؟
                                </p>
                            )}
                        </motion.div>
                        <motion.p variants={itemVariants} className="login-social-proof"> استعمل وثيق و اعرف ماذا تضع على بشرتك و شعرك!</motion.p>
                    </motion.div>
                </div>
            </motion.div>
            </div>
    );
};

export default Login;