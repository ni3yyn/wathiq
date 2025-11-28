// --- START OF FILE src/App.js ---

import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate, Outlet, Link } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { FaHome, FaSpinner } from 'react-icons/fa';

// --- Authentication and Data Hooks ---
import { AppProvider, useAppContext } from './components/AppContext'; 
import { db } from './firebase';
import { doc, updateDoc, Timestamp, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'; 

// --- Analytics ---
import { initAnalytics, trackPageView, trackEvent } from './analytics';

// --- CORE STATIC IMPORTS (Instant Load) ---
import AuthenticationPage from './components/AuthenticationPage';
import Welcome from './components/Welcome';
import Profile from './components/Profile';
import OilGuard from './components/OilGuard';
import ComparisonPage from './components/ComparisonPage';
import WathiqAdmin from './components/WathiqAdmin';
import AdminPortal from './components/AdminPortal'; 

// --- UI & UX Components ---
import LoadingOverlay from './components/LoadingOverlay'; 
import GoodbyeOverlay from './components/GoodbyeOverlay';
import WathiqNav from './components/WathiqNav';
import OfflineIndicator from './components/OfflineIndicator'; 
import UpdateManager from './components/UpdateManager';
import AnimatedSplash from './components/AnimatedSplash';
import ErrorBoundary from './components/ErrorBoundary';

// --- Capacitor Imports ---
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { App as CapacitorApp } from '@capacitor/app';
import { Toast } from '@capacitor/toast';
import { SplashScreen } from '@capacitor/splash-screen';
import { LocalNotifications } from '@capacitor/local-notifications';

// --- CSS Imports ---
import './App.css';
import 'react-circular-progressbar/dist/styles.css';
import { AnimatePresence } from 'framer-motion';

// --- LAZY IMPORTS (Web Only) ---
const LandingPage = lazy(() => import('./components/LandingPage'));

// =============================================================================
// HELPER COMPONENTS (Protected Routes)
// =============================================================================

// 1. Generic Protected Route (Waits for Auth)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAppContext();
  
  if (loading) return <LoadingOverlay text="جاري التحميل..." />;
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

// 2. Admin Route (Strict Email Check)
const AdminRoute = ({ children }) => {
  const { user, loading } = useAppContext();
  const ALLOWED_ADMIN = "ni3yyn@gmail.com";

  if (loading) return <LoadingOverlay text="جاري التحقق من الصلاحيات..." />;
  if (!user) return <Navigate to="/login" replace />;

  if (user.email?.toLowerCase() !== ALLOWED_ADMIN.toLowerCase()) {
      return <Navigate to="/oil-guard" replace />;
  }

  return children;
};

// =============================================================================
// MAIN ROUTING LOGIC COMPONENT
// =============================================================================
const WathiqRoutes = () => {
  const { user, userProfile, loading, isLoggingOut } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const isNative = Capacitor.isNativePlatform();
  
  // State
  const [apkLink, setApkLink] = useState(null);
  const [showSplash, setShowSplash] = useState(isNative);

  // --- 1. Fetch APK Link (Web Only) ---
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

  // --- 2. Splash Screen Logic ---
  useEffect(() => {
    const handleSplash = async () => {
        // Remove HTML curtain immediately once React mounts
        const curtain = document.getElementById('html-splash-curtain');
        if (curtain) curtain.remove();

        if (isNative) {
            // Buffer time for React to settle
            await new Promise(resolve => setTimeout(resolve, 1500));
            // Hide Native Splash
            await SplashScreen.hide({ fadeOutDuration: 500 });
            // Wait for Custom Splash Animation
            if (!loading) {
                setTimeout(() => setShowSplash(false), 2000);
            }
        } else {
            setShowSplash(false);
        }
    };
    handleSplash();
  }, [isNative, loading]);

  // --- 3. Analytics & Notifications ---
  useEffect(() => {
    if (loading) return;

    if (userProfile) {
        // Check Onboarding
        if (userProfile.onboardingComplete === false && location.pathname !== '/welcome') {
            navigate('/welcome', { replace: true });
        }

        // Native Analytics Setup
        if (isNative && user) {
             const setupAnalytics = async () => {
                try {
                    await FirebaseAnalytics.setUserId({ userId: user.uid });
                    await FirebaseAnalytics.setUserProperty({ name: "gender", value: userProfile.settings?.gender || "unknown" });
                    await FirebaseAnalytics.logEvent({ name: 'session_start', params: { user_type: 'registered' } });
                } catch (err) { console.warn("Analytics Error", err); }
            };
            setupAnalytics();
        }
    }
  }, [userProfile, user, loading, navigate, location.pathname, isNative]);

  // --- 4. Push Notifications ---
  useEffect(() => {
    if (isNative) {
        PushNotifications.createChannel({ id: 'default', name: 'General', importance: 5, visibility: 1, vibration: true }).catch(console.error);
        
        const registerPush = async () => {
            let perm = await PushNotifications.checkPermissions();
            if (perm.receive === 'prompt') perm = await PushNotifications.requestPermissions();
            if (perm.receive === 'granted') await PushNotifications.register();
        };
        registerPush();

        const tokenListener = PushNotifications.addListener('registration', token => {
            if (user) updateDoc(doc(db, 'profiles', user.uid), { fcmToken: token.value, platform: 'android' }).catch(console.error);
        });

        const actionListener = PushNotifications.addListener('pushNotificationActionPerformed', notification => {
            if (notification.notification.data.route) navigate(notification.notification.data.route);
        });

        return () => { tokenListener.then(f=>f.remove()); actionListener.then(f=>f.remove()); };
    }
  }, [user, navigate, isNative]);

  // --- 5. Back Button Handler ---
  useEffect(() => {
      if (isNative) {
          CapacitorApp.addListener('backButton', ({ canGoBack }) => {
              if (['/', '/login', '/oil-guard', '/welcome'].includes(location.pathname)) {
                   CapacitorApp.exitApp();
              } else {
                  navigate(-1);
              }
          });
      }
  }, [navigate, location.pathname, isNative]);


  // --- 6. Routing Constants ---
  const isProfileComplete = userProfile?.onboardingComplete === true;
  const appHomeRoute = isProfileComplete ? "/oil-guard" : "/welcome";
  
  // Navigation Visibility
  const showNav = user && 
                  location.pathname !== '/' && 
                  location.pathname !== '/login' && 
                  location.pathname !== '/welcome' &&
                  !location.pathname.includes('admin');

  // --- 7. Render ---
  
  // Force Splash if Native and (Splash True OR Loading)
  if (isNative && (showSplash || loading)) {
    return <AnimatedSplash />;
  }

  return (
    <>
      <OfflineIndicator />
      <UpdateManager />
      
      {/* Global Overlays */}
      <AnimatePresence>
        {isLoggingOut && <GoodbyeOverlay />}
      </AnimatePresence>
      
      {showNav && <WathiqNav />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          
          {/* Root Route */}
          <Route 
            path="/" 
            element={
              isNative ? (
                // Mobile: Redirect based on auth
                user ? <Navigate to={appHomeRoute} replace /> : <Navigate to="/login" replace />
              ) : (
                // Web: Show Landing Page (Lazy Loaded)
                <Suspense fallback={<LoadingOverlay text="جاري التحميل..." />}>
                  <LandingPage downloadLink={apkLink} />
                </Suspense>
              )
            } 
          />

          {/* Auth Route */}
          <Route 
            path="/login" 
            element={
                // If loading auth state, show overlay
                loading ? <LoadingOverlay text="جاري التحقق..." /> : 
                // If logged in, go home. Else show login.
                user ? <Navigate to={appHomeRoute} replace /> : <AuthenticationPage />
            } 
          />
          
          {/* Protected App Routes */}
          <Route 
            path="/welcome" 
            element={
              <ProtectedRoute>
                 {/* Redirect if profile complete to avoid loop */}
                 {isProfileComplete ? <Navigate to="/oil-guard" replace /> : <Welcome />}
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/oil-guard" 
            element={<ProtectedRoute><OilGuard /></ProtectedRoute>} 
          />
          
          <Route 
            path="/profile" 
            element={<ProtectedRoute><Profile /></ProtectedRoute>} 
          />
          
          <Route 
            path="/compare" 
            element={<ProtectedRoute><ComparisonPage /></ProtectedRoute>} 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={<AdminRoute><AdminPortal user={user} /></AdminRoute>} 
          />

          <Route 
            path="/wathiq-admin" 
            element={<AdminRoute><WathiqAdmin /></AdminRoute>} 
          />

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AnimatePresence>
    </>
  );
};

// =============================================================================
// APP WRAPPER
// =============================================================================
function App() {
  // Global Analytics Init
  useEffect(() => {
    initAnalytics();
  }, []);

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