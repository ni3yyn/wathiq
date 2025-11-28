// src/components/LoadingOverlay.js
import React from 'react';
import { motion } from 'framer-motion';
import { FaLeaf } from "react-icons/fa"; // Using Leaf as the Wathiq Logo
import '../LoadingOverlay.css';

const LoadingOverlay = ({ text }) => {
    return (
        <motion.div
            className="loading-backdrop"
            initial={{ opacity: 1 }} // Start fully visible
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
        >
            <motion.div
                className="loading-content"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.5,
                    ease: "easeOut"
                }}
            >
                {/* Animated Logo */}
                <FaLeaf className="loading-icon" />
                
                <h2>وثيق</h2>
                
                {/* Dynamic Gendered Text */}
                <p>{text || "صل على رسول الله"}</p>

                {/* Subtle Loading Bar */}
                <div className="loading-bar-container">
                    <div className="loading-bar-fill"></div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default LoadingOverlay;