import React from 'react';
import { motion } from 'framer-motion';
import { FaRegHandPeace } from "react-icons/fa";
import '../GoodbyeOverlay.css'; // We'll create this CSS file next

const GoodbyeOverlay = () => {
    return (
        <motion.div
            className="goodbye-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="goodbye-content"
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 20,
                    delay: 0.2
                }}
            >
                <FaRegHandPeace className="goodbye-icon" />
                <h2>نراك قريباً!</h2>
                <p>يتم الآن تسجيل خروجك بأمان...</p>
            </motion.div>
        </motion.div>
    );
};

export default GoodbyeOverlay;