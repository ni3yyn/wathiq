import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { AnimatePresence } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';

// --- Firebase Imports ---
import { db, auth } from './firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

// --- Context & Utils ---
import { AppProvider, useAppContext } from './components/AppContext';

// --- Global UI Components ---
import OfflineIndicator from './components/OfflineIndicator';
import UpdateManager from './components/UpdateManager';
import WathiqNav from './components/WathiqNav';
import AnimatedSplash from './components/AnimatedSplash';
import ErrorBoundary from './components/ErrorBoundary';

// --- Pages ---
import LandingPage from './components/LandingPage';
import AuthenticationPage from './components/AuthenticationPage';
import Welcome from './components/Welcome';
import OilGuard from './components/OilGuard';
import Profile from './components/Profile';
import ComparisonPage from './components/ComparisonPage';
import WathiqAdmin from './components/WathiqAdmin';
import AdminPortal from './components/AdminPortal'; 

// --- Inner Component that handles Logic ---
const WathiqRoutes = () => {
  const { user, userProfile, loading } = useAppContext();
  const location = useLocation();
  const isNative = Capacitor.isNativePlatform();
  
  // State for the APK Link (Web only)
  const [apkLink, setApkLink] = useState(null);

  // --- CHANGE 1: Splash State ---
  // Only enable Splash initially if we are on Native (Mobile)
  const [showSplash, setShowSplash] = useState(isNative);

  // 1. Fetch APK Link (Web Only)
  useEffect(() => {
    if (!isNative) {
      const q = query(collection(db, "releases"), orderBy("createdAt", "desc"), limit(1));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const latestRelease = snapshot.docs[0].data();
          setApkLink(latestRelease.fileUrl);
        }
      });
      return () => unsubscribe();
    }
  }, [isNative]);

  // --- CHANGE 2: Splash Timeout ---
  // Only run the timeout logic if we are on Native
  useEffect(() => {
    if (isNative && !loading) {
      // Small delay to ensure smooth transition
      setTimeout(() => setShowSplash(false), 2000);
    }
  }, [loading, isNative]);

  // --- CRITICAL FIX START: CHANGE 3: Splash Guard ---
  // Only block rendering if on Native AND (Splash is active OR Data is loading)
  // The check for (user && !userProfile) has been removed, as that state
  // should be handled by a generic in-app loader or the destination component,
  // not by the full-screen native splash guard.
  if (isNative && (showSplash || loading)) {
    return <AnimatedSplash />;
  }
  // --- CRITICAL FIX END ---


  // --- 4. Routing Logic ---
  const isProfileComplete = userProfile?.onboardingComplete === true;
  const appHomeRoute = isProfileComplete ? "/oil-guard" : "/welcome";

  // --- 5. Navigation Visibility ---
  const showNav = user && 
                  location.pathname !== '/' && 
                  location.pathname !== '/login' && 
                  location.pathname !== '/welcome' &&
                  !location.pathname.includes('admin');

  return (
    <>
      <OfflineIndicator />
      <UpdateManager />
      
      {showNav && <WathiqNav />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          
          {/* Root: Landing Page (Web) or App Home (Mobile) */}
          <Route 
            path="/" 
            element={
              isNative ? (
                user ? <Navigate to={appHomeRoute} replace /> : <Navigate to="/login" replace />
              ) : (
                // PASS THE LINK HERE!
                <LandingPage downloadLink={apkLink} />
              )
            } 
          />

          <Route 
            path="/login" 
            element={user ? <Navigate to={appHomeRoute} replace /> : <AuthenticationPage />} 
          />
          
          <Route 
            path="/welcome" 
            element={user ? <Welcome /> : <Navigate to="/login" replace />} 
          />

          <Route 
            path="/oil-guard" 
            element={user ? <OilGuard /> : <Navigate to="/login" replace />} 
          />
          
          <Route 
            path="/profile" 
            element={user ? <Profile /> : <Navigate to="/login" replace />} 
          />
          
          <Route 
            path="/compare" 
            element={user ? <ComparisonPage /> : <Navigate to="/login" replace />} 
          />

          <Route 
            path="/admin" 
            element={<AdminPortal user={user} />} 
          />

          <Route 
            path="/wathiq-admin" 
            element={user ? <WathiqAdmin /> : <Navigate to="/login" replace />} 
          />

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AnimatePresence>
    </>
  );
};

// --- Main App Wrapper ---
function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Router>
          <AppProvider>
            <WathiqRoutes />
          </AppProvider>
        </Router>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;