// --- START OF FILE src/hooks/useModalBack.js ---
import { useEffect, useRef } from 'react';

/**
 * A hook to handle the Native Android Back Button for modals.
 * 
 * @param {boolean} isOpen - Boolean indicating if the modal is visible.
 * @param {function} closeModal - Function to set isOpen to false.
 * @param {string} hash - Optional URL hash to append (e.g., '#details').
 */
export const useModalBack = (isOpen, closeModal, hash = '#modal') => {
    const pushedRef = useRef(false);

    useEffect(() => {
        if (isOpen) {
            // 1. Push a dummy state to history so "Back" has something to pop
            // This prevents the browser from going to the previous page
            window.history.pushState({ modalOpen: true }, '', window.location.pathname + hash);
            pushedRef.current = true;

            // 2. Define what happens when Back is pressed
            const handlePopState = (e) => {
                // User pressed hardware back button
                pushedRef.current = false; // History is already popped by the browser
                closeModal(); 
            };

            window.addEventListener('popstate', handlePopState);

            // 3. Cleanup
            return () => {
                window.removeEventListener('popstate', handlePopState);
                
                // If the modal is closing via code (e.g., "X" button or clicking backdrop),
                // we must manually remove the history entry we added.
                if (pushedRef.current) {
                    window.history.back();
                    pushedRef.current = false;
                }
            };
        }
    }, [isOpen, closeModal, hash]);
};