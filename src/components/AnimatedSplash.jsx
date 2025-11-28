import React from 'react';
import { motion } from 'framer-motion';
import logowathiq from '../assets/wathiq-logo.png'; 
import '../AnimatedSplash.css';

const AnimatedSplash = () => {
    return (
        <motion.div 
            className="animated-splash-container"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
        >
            <div className="splash-center">
                {/* 
                   NEW ANIMATION: Blur-Fade + Scale 
                   Starts: Transparent, Small (0.8), Blurred (15px)
                   Ends: Visible, Normal Size (1), Sharp (0px)
                */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, filter: 'blur(15px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    transition={{ 
                        duration: 1.2, 
                        ease: [0.25, 0.4, 0.25, 1] // Elegant ease-out curve
                    }}
                >
                    <img src={logowathiq} alt="Wathiq Logo" className="splash-logo-img" />
                </motion.div>

                {/* Text Animation: Slides up gently with a fade */}
                <motion.div
                    className="splash-text-wrapper"
                    initial={{ y: 15, opacity: 0, filter: 'blur(4px)' }}
                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                    transition={{ delay: 0.3, duration: 1 }}
                >
                    <h1 className="splash-brand-name">وثيق</h1>
                    <p className="splash-brand-slogan">دليلك للعناية الذكية</p>
                </motion.div>
            </div>

            {/* Loading Bar */}
            <motion.div 
                className="splash-progress-bar"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "200px", opacity: 1 }}
                transition={{ delay: 0.5, duration: 2.5, ease: "easeInOut" }}
            />
        </motion.div>
    );
};

export default AnimatedSplash;