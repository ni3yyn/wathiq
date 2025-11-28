import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaSignOutAlt, FaExchangeAlt, FaFlask, FaPlus } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from './AppContext';
import '../WathiqNav.css';

const WathiqNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAppContext();
  const location = useLocation();

  const menuItems = [
    { icon: <FaUser />, text: 'ملفي الشخصي', path: '/profile' },
    { icon: <FaExchangeAlt />, text: 'مقارنة المنتجات', path: '/compare' },
    { icon: <FaFlask />, text: 'محقق المكونات', path: '/oil-guard' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="wathiq-nav-container">
      
      {/* 1. Main Toggle Button (On Top via Z-Index) */}
      <motion.button 
        className="wathiq-nav-toggle"
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.9 }}
        animate={isOpen ? "open" : "closed"}
        initial={false}
      >
        <motion.div
            style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '100%', 
                height: '100%' 
            }}
            variants={{
                open: { rotate: 135 },
                closed: { rotate: 0 }
            }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
            <FaPlus />
        </motion.div>
      </motion.button>

      {/* 2. Menu Items (Absolute positioned behind toggle) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Standard Menu Items */}
            {menuItems.map((item, i) => (
              <motion.div 
                key={item.path} 
                className="wathiq-nav-item-wrapper"
                custom={i}
                initial="closed"
                animate="open"
                exit="closed"
                variants={{
                  open: (i) => ({
                    opacity: 1,
                    // Spring Up Calculation: 
                    // i=0 is closest, i=2 is furthest.
                    // 60px is approx toggle height + gap.
                    y: `calc(-60px - ${i * 60}px)`, 
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                      delay: i * 0.05
                    }
                  }),
                  closed: {
                    opacity: 0,
                    y: 0, // Collapses into the button
                    scale: 0.5,
                    transition: { duration: 0.2 }
                  }
                }}
              >
                <Link 
                  to={item.path} 
                  className={`wathiq-nav-bubble ${isActive(item.path) ? 'active' : ''}`} 
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                </Link>
                <div className="wathiq-nav-tooltip">{item.text}</div>
              </motion.div>
            ))}

            {/* Logout Button (Appears at the very top of the stack) */}
            <motion.div 
              className="wathiq-nav-item-wrapper"
              custom={menuItems.length}
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: (i) => ({
                    opacity: 1,
                    y: `calc(-60px - ${i * 60}px)`,
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                      delay: i * 0.05
                    }
                }),
                closed: {
                    opacity: 0,
                    y: 0,
                    scale: 0.5,
                    transition: { duration: 0.2 }
                }
              }}
            >
              <button 
                  className="wathiq-nav-bubble logout" 
                  onClick={() => {
                      setIsOpen(false);
                      logout();
                  }}
              >
                <FaSignOutAlt />
              </button>
              <div className="wathiq-nav-tooltip">تسجيل الخروج</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 3. Invisible Backdrop to close on outside click */}
      {isOpen && (
        <div 
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                zIndex: -1, 
                pointerEvents: 'auto'
            }}
            onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default WathiqNav;