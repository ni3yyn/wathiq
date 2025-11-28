import { React, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../firebase'; // <-- Import db
import { doc, setDoc, Timestamp } from 'firebase/firestore'; // <-- Import firestore functions
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut
} from 'firebase/auth';
import '../AuthModal.css';

export const AuthModal = ({ show, onClose }) => {
    const [view, setView] = useState('login'); // 'login', 'signup', or 'reset'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    
    // NOTE: We remove the extra fields from the modal for simplicity.
    // The beautiful Welcome.js component will handle collecting the user's name and other details.

    const handleAuthAction = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            if (view === 'signup') {
                if (password.length < 6) {
                    setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل.');
                    return;
                }
                
                // 1. Create the user in Firebase Auth
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const newUser = userCredential.user;

                // 2. IMMEDIATELY create their profile document in Firestore
                const profileRef = doc(db, 'profiles', newUser.uid);
                const newProfileData = {
                    email: newUser.email,
                    createdAt: Timestamp.now(),
                    settings: { name: '', gender: '', hairType: '', skinType: '', conditions: [], allergies: [], blacklistedIngredients: [], skinGoals: [] },
                    routines: {}, // Initialize empty routines
                    onboardingComplete: false // The crucial flag for the welcome flow
                };
                await setDoc(profileRef, newProfileData);

                // 3. Close the modal. The router in App.js will now detect the new user
                // and automatically handle the redirect to the Welcome page.
                onClose();

            } else if (view === 'login') {
                await signInWithEmailAndPassword(auth, email, password);
                onClose(); // Close modal on successful login
            } else if (view === 'reset') {
                await sendPasswordResetEmail(auth, email);
                setMessage('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.');
            }
        } catch (err) {
            // ... (error handling remains the same)
            switch (err.code) {
                case 'auth/user-not-found': setError('هذا البريد الإلكتروني غير مسجل.'); break;
                case 'auth/wrong-password': setError('كلمة المرور غير صحيحة.'); break;
                case 'auth/email-already-in-use': setError('هذا البريد الإلكتروني مستخدم بالفعل.'); break;
                case 'auth/invalid-email': setError('البريد الإلكتروني غير صالح.'); break;
                default: setError('حدث خطأ ما. يرجى المحاولة مرة أخرى.'); console.error(err);
            }
        }
    };

    const switchView = (newView) => {
        setView(newView);
        setError('');
        setMessage('');
        setEmail('');
        setPassword('');
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div className="auth-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
                    <motion.div className="auth-modal-content" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={onClose}>×</button>

                        {view === 'login' && (
                            <form onSubmit={handleAuthAction}>
                                <h3>تسجيل الدخول</h3>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" required />
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" required />
                                {error && <p className="auth-error">{error}</p>}
                                <button type="submit" className="auth-btn">دخول</button>
                                <p className="auth-switch">ليس لديك حساب؟ <span onClick={() => switchView('signup')}>أنشئ حساباً</span></p>
                                <p className="auth-switch"><span onClick={() => switchView('reset')}>نسيت كلمة المرور؟</span></p>
                            </form>
                        )}

                        {view === 'signup' && (
                            <form onSubmit={handleAuthAction}>
                                <h3>إنشاء حساب جديد</h3>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" required />
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور (6 أحرف على الأقل)" required />
                                {error && <p className="auth-error">{error}</p>}
                                {message && <p className="auth-message">{message}</p>}
                                <button type="submit" className="auth-btn">إنشاء حساب</button>
                                <p className="auth-switch">لديك حساب بالفعل؟ <span onClick={() => switchView('login')}>سجل الدخول</span></p>
                            </form>
                        )}

                        {view === 'reset' && (
                           <form onSubmit={handleAuthAction}>
                                <h3>إعادة تعيين كلمة المرور</h3>
                                <p className='auth-info'>سوف نرسل لك رابطًا لإعادة تعيين كلمة المرور على بريدك الإلكتروني.</p>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" required />
                                {error && <p className="auth-error">{error}</p>}
                                {message && <p className="auth-message">{message}</p>}
                                <button type="submit" className="auth-btn">إرسال الرابط</button>
                                <p className="auth-switch"><span onClick={() => switchView('login')}>العودة لتسجيل الدخول</span></p>
                            </form>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export const handleLogout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out: ", error);
    }
};