import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';
import { FaUser, FaSignOutAlt, FaExchangeAlt, FaFlask, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAppContext } from './AppContext';
import '../WathiqNav.css'; // We will create this new CSS file next

const WathiqNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAppContext();

  const navVariants = {
    open: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', damping: 20, stiffness: 300 }
    },
    closed: {
      opacity: 0,
      y: 50,
      transition: { type: 'spring', damping: 20, stiffness: 300 }
    }
  };

  const itemVariants = {
    open: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05, type: 'spring', stiffness: 200 }
    }),
    closed: { opacity: 0, x: 20 }
  };

  const menuItems = [
    { icon: <FaFlask />, text: 'محقق المكونات', path: '/oil-guard' },
    { icon: <FaExchangeAlt />, text: 'وضع المقارنة', path: '/compare' },
    { icon: <FaUser />, text: 'ملفي الشخصي', path: '/profile' },
  ];

 // In src/components/WathiqNav.js

return (
  <div className="wathiq-nav-container">
    {/* The Main Toggle Button */}
    <motion.button 
      className="wathiq-nav-toggle"
      onClick={() => setIsOpen(!isOpen)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={isOpen ? "open" : "closed"}
      variants={{
        closed: { backgroundColor: "rgba(255, 255, 255, 0.1)", rotate: 0 },
        open: { backgroundColor: "rgba(255, 255, 255, 0.1)", rotate: 45 }
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <FaPlus />
    </motion.button>

    {/* The Menu Items */}
    <AnimatePresence>
      {isOpen && (
        <> 
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
                  y: `calc(-100% * ${i + 1} - ${i * 15}px)`, // Vertical animation only
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 350,
                    damping: 25,
                    delay: i * 0.04
                  }
                }),
                closed: (i) => ({
                  opacity: 0,
                  y: 0,
                  scale: 0.8,
                  transition: {
                    duration: 0.15,
                    delay: (menuItems.length - 1 - i) * 0.03
                  }
                })
              }}
            >
              <Link to={item.path} className="wathiq-nav-bubble" onClick={() => setIsOpen(false)}>
                {item.icon}
              </Link>
              <div className="wathiq-nav-tooltip">{item.text}</div>
            </motion.div>
          ))}
          {/* Logout Button */}
          <motion.div 
            className="wathiq-nav-item-wrapper"
            custom={menuItems.length}
            initial="closed"
            animate="open"
            exit="closed"
            variants={{
              open: (i) => ({
                  opacity: 1,
                  y: `calc(-100% * ${i + 1} - ${i * 15}px)`, // Vertical animation only
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 350,
                    damping: 25,
                    delay: i * 0.04
                  }
              }),
              closed: {
                  opacity: 0,
                  y: 0,
                  scale: 0.8,
                  transition: { duration: 0.15 }
              }
            }}
          >
            <button className="wathiq-nav-bubble logout" onClick={logout}>
              <FaSignOutAlt />
            </button>
            <div className="wathiq-nav-tooltip">تسجيل الخروج</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  </div>
);

};

export default WathiqNav;