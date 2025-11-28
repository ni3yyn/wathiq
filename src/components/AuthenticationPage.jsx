import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Login from './Login';
import Welcome from './Welcome';
import '../AuthenticationPage.css'; // New CSS file for the container

const AuthenticationPage = () => {
    // This state controls whether we show the Login form or the Welcome sequence.
    const [view, setView] = useState('login');

    // This function is passed to the Login component.
    // When registration is successful, Login calls this to trigger the animation.
    const handleRegistrationSuccess = () => {
        setView('welcome');
    };

    const componentVariants = {
        initial: { x: '100%', opacity: 0 },
        in: { x: 0, opacity: 1 },
        out: { x: '-100%', opacity: 0 },
    };

    const transition = {
        duration: 0.7,
        ease: [0.43, 0.13, 0.23, 0.96]
    };

    return (
        <div className="authentication-container">
            {/* AnimatePresence will manage the exit/enter animations */}
            <AnimatePresence mode="wait" initial={false}>
                {view === 'login' ? (
                    <motion.div
                        key="login"
                        initial="in" // Login doesn't animate in on first load
                        exit="out"
                        variants={componentVariants}
                        transition={transition}
                        className="auth-component-wrapper"
                    >
                        <Login onRegisterSuccess={handleRegistrationSuccess} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="welcome"
                        initial="initial"
                        animate="in"
                        variants={componentVariants}
                        transition={transition}
                        className="auth-component-wrapper"
                    >
                        <Welcome />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AuthenticationPage;