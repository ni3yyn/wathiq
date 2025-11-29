import { useEffect } from 'react';

export const useExternalLinkHandler = () => {
    useEffect(() => {
        const handleLinkClick = (e) => {
            // Find the closest anchor tag
            const anchor = e.target.closest('a');
            
            if (anchor && anchor.href) {
                const url = new URL(anchor.href);
                const isExternal = url.origin !== window.location.origin;

                // If external, force system browser
                if (isExternal) {
                    e.preventDefault();
                    // 'noopener,noreferrer' is standard security
                    // In Android WebView, window.open usually triggers the Intent to open Chrome/System Browser
                    window.open(anchor.href, '_blank', 'noopener,noreferrer');
                }
            }
        };

        document.addEventListener('click', handleLinkClick, { capture: true });

        return () => {
            document.removeEventListener('click', handleLinkClick, { capture: true });
        };
    }, []);
};