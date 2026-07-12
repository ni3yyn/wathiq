import React, { useState, useEffect, useRef, useMemo } from 'react';
import { db, auth } from '../firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { 
    collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, limit,
    query, orderBy, getDocs, Timestamp, setDoc, writeBatch, where, getDoc, collectionGroup, getCountFromServer
} from 'firebase/firestore';
import { 
    FaSearch, FaEdit, FaBell, FaPaperPlane, FaTimes, FaCheck, FaList,
    FaSpinner, FaUsers, FaMobileAlt, FaShoppingBag, FaTrash, FaDownload,
    FaBullhorn, FaCogs, FaAndroid, FaTools, FaClock, FaSave, FaCheckDouble,
    FaMale, FaFemale, FaSignOutAlt, FaPlus, FaUserCog, FaChevronDown, FaChevronUp,
    FaArrowDown, FaDatabase, FaHeartbeat, FaThLarge, FaListUl,  FaEraser, FaFilter,
    FaSortAmountDown, FaSortAmountUp, FaCalendarAlt, FaChartLine ,
    FaCalendarPlus, FaFlask, FaCheckCircle, FaTimesCircle, FaChartPie ,
     FaTag, FaHashtag, 
    FaKey, FaCode,FaCopy
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '../WathiqAdmin.css';

const WathiqAdmin = () => {
    // ------------------------------------------------------------------
    // 1. STATE MANAGEMENT
    // ------------------------------------------------------------------

    // --- Auth State ---
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPass, setLoginPass] = useState('');

const [duplicateTokens, setDuplicateTokens] = useState([]);
const [showDuplicatesSheet, setShowDuplicatesSheet] = useState(false);
const [duplicatesLoading, setDuplicatesLoading] = useState(false);
// Add to your state declarations
const [healthCheckResults, setHealthCheckResults] = useState(null);
const [healthCheckLoading, setHealthCheckLoading] = useState(false);
const [showHealthCheck, setShowHealthCheck] = useState(false);
const [expandedSections, setExpandedSections] = useState({});
const [documentDates, setDocumentDates] = useState({});

    // --- UI State ---
    const [activeView, setActiveView] = useState('users'); // 'users' | 'config'
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [pullToRefresh, setPullToRefresh] = useState(false);
    const [showGrowthSheet, setShowGrowthSheet] = useState(false);
    const [missingIngredients, setMissingIngredients] = useState([]);
    const [missingLoading, setMissingLoading] = useState(false);
    const [selectedMissing, setSelectedMissing] = useState([]); // لتحديد العناصر
    const [missingSearch, setMissingSearch] = useState(''); // للبحث داخل المفقودات
    const [missingTypeFilter, setMissingTypeFilter] = useState('all'); // 'all' | 'scanner' | 'database'
    const [visibleUsersCount, setVisibleUsersCount] = useState(20);
    const [userProductsCounts, setUserProductsCounts] = useState({});
    const [expandedProductId, setExpandedProductId] = useState(null);
// Sorting State
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [missingSortConfig, setMissingSortConfig] = useState({ key: 'count', direction: 'desc' });
    // --- Data State ---
    const [users, setUsers] = useState([]);
    const [configData, setConfigData] = useState(null);
    const [configLoading, setConfigLoading] = useState(false);

    // --- Bottom Sheets & Modals State ---
    const [editingUser, setEditingUser] = useState(null);
    const [notifyingUser, setNotifyingUser] = useState(null);
    const [showBroadcastSheet, setShowBroadcastSheet] = useState(false);
    const [viewingProducts, setViewingProducts] = useState(null);
    const [showConfigSave, setShowConfigSave] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [totalSavedProducts, setTotalSavedProducts] = useState(0);
    
    const [productsList, setProductsList] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    
    // --- Form Inputs ---
    const [activeModalTab, setActiveModalTab] = useState('basic');
    const [notifData, setNotifData] = useState({ title: '', body: '' });
    const [sending, setSending] = useState(false);
    
    const [newChangelogItem, setNewChangelogItem] = useState('');
    const [newTagItem, setNewTagItem] = useState('');

    // --- Refs ---
    const touchStartY = useRef(0);
    const contentRef = useRef(null);

    // ------------------------------------------------------------------
    // 2. INITIALIZATION & EFFECTS
    // ------------------------------------------------------------------

    // Auth Listener
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
            if (currentUser) {
                setLoading(true);
                setConfigLoading(true);
            }
        });
        return () => unsub();
    }, []);

    // Fetch Users Listener
    useEffect(() => {
        if (!user) return;
        // Adjust query if needed, currently fetching all profiles
        const q = query(collection(db, "profiles"));
        const unsub = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(list);
            setLoading(false);
            setPullToRefresh(false);
        }, (error) => {
            console.error("Users Error:", error);
            alert("خطأ في جلب البيانات");
            setPullToRefresh(false);
        });
        return () => unsub();
    }, [user]);

    // Fetch Config Listener
    useEffect(() => {
        if (!user) return;
        const unsub = onSnapshot(doc(db, "app_config", "version_control"), (docSnap) => {
            if (docSnap.exists()) {
                setConfigData(docSnap.data());
            } else {
                // Default Config Structure
                setConfigData({
                    maintenance_mode: false,
                    maintenance_message: 'التطبيق قيد الصيانة حالياً.',
                    android: { 
                        latest_version: '1.0.0', 
                        min_supported_version: '1.0.0', 
                        store_url: '',
                        changelog: [],
                        critical_message: '',
                        optional_message: ''
                    },
                    notif_am_title_female: '', notif_am_body_female: '',
                    notif_pm_title_female: '', notif_pm_body_female: '',
                    notif_am_title_male: '', notif_am_body_male: '',
                    notif_pm_title_male: '', notif_pm_body_male: ''
                });
            }
            setConfigLoading(false);
        });
        return () => unsub();
    }, [user]);

    // Reset visibleUsersCount when search, sort, or active view changes
    useEffect(() => {
        setVisibleUsersCount(20);
    }, [searchTerm, sortConfig, activeView]);

    // Scroll Handler for Save Button visibility & Infinite Scroll for Users
    useEffect(() => {
        const contentElement = contentRef.current;
        const handleScroll = () => {
            if (activeView === 'config' && contentElement) {
                setShowConfigSave(contentElement.scrollTop > 50);
            }
            if (activeView === 'users' && contentElement) {
                const isNearBottom = contentElement.scrollHeight - contentElement.scrollTop - contentElement.clientHeight < 100;
                if (isNearBottom) {
                    setVisibleUsersCount(prev => prev + 20);
                }
            }
        };
        if (contentElement) {
            contentElement.addEventListener('scroll', handleScroll);
            handleScroll();
        }
        return () => {
            if (contentElement) contentElement.removeEventListener('scroll', handleScroll);
        };
    }, [activeView]);

    // Fetch Missing Ingredients Listener
    useEffect(() => {
      if (!user || activeView !== 'missing') return;
      
      setMissingLoading(true);
      const q = query(collection(db, "missing_ingredients"));

      const unsub = onSnapshot(q, (snapshot) => {
          const list = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                  id: doc.id,
                  ...data,
                  count: data.count ?? data.totalCount ?? 0
              };
          });
          setMissingIngredients(list);
          setMissingLoading(false);
      });
      return () => unsub();
  }, [user, activeView]);

    // Fetch Saved Products Count for all users
    useEffect(() => {
        if (!user) return;
        
        const fetchProductCounts = async () => {
            try {
                const querySnapshot = await getDocs(collectionGroup(db, 'savedProducts'));
                const counts = {};
                querySnapshot.forEach(doc => {
                    const profileRef = doc.ref.parent?.parent;
                    if (profileRef) {
                        const userId = profileRef.id;
                        counts[userId] = (counts[userId] || 0) + 1;
                    }
                });
                setUserProductsCounts(counts);
            } catch (e) {
                console.error("Error fetching user product counts:", e);
            }
        };
        
        fetchProductCounts();
    }, [user]);

    // ------------------------------------------------------------------
    // 3. LOGIC & HANDLERS
    // ------------------------------------------------------------------

    // Auth Actions
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, loginEmail, loginPass);
        } catch (error) {
            alert("فشل تسجيل الدخول: " + error.message);
        }
    };

    const handleLogout = async () => {
        if(window.confirm("هل أنت متأكد من تسجيل الخروج؟")) {
            await signOut(auth);
        }
    };

    // Config Actions
    const handleConfigChange = (section, field, value) => {
        if (section === 'root') {
            setConfigData(prev => ({ ...prev, [field]: value }));
        } else {
            setConfigData(prev => ({
                ...prev,
                [section]: { ...prev[section], [field]: value }
            }));
        }
    };

    const handleAddChangelog = () => {
        if (!newChangelogItem.trim()) return;
        const currentLog = configData.android?.changelog || [];
        handleConfigChange('android', 'changelog', [...currentLog, newChangelogItem]);
        setNewChangelogItem('');
    };

    const handleRemoveChangelog = (item) => {
        const currentLog = configData.android?.changelog || [];
        handleConfigChange('android', 'changelog', currentLog.filter(i => i !== item));
    };

    const saveConfiguration = async () => {
        try {
            await setDoc(doc(db, "app_config", "version_control"), configData);
            alert("✅ تم حفظ الإعدادات بنجاح");
        } catch (e) {
            alert("❌ خطأ أثناء الحفظ: " + e.message);
        }
    };

    // User Edit Actions
    const handleSettingChange = (field, value) => {
        setEditingUser(prev => ({
            ...prev,
            settings: { ...prev.settings, [field]: value }
        }));
    };

    const handleSaveProfile = async () => {
        if (!editingUser) return;
        try {
            const userRef = doc(db, "profiles", editingUser.id);
            await updateDoc(userRef, { settings: editingUser.settings });
            setEditingUser(null);
            alert("تم تحديث بيانات المستخدم");
        } catch (e) {
            alert("فشل التحديث: " + e.message);
        }
    };

    const handleTagAdd = () => {
        if(!newTagItem.trim()) return;
        const current = editingUser.settings?.allergies || [];
        if(!current.includes(newTagItem)) {
            handleSettingChange('allergies', [...current, newTagItem]);
        }
        setNewTagItem('');
    };

    const handleTagRemove = (tag) => {
        const current = editingUser.settings?.allergies || [];
        handleSettingChange('allergies', current.filter(t => t !== tag));
    };

    // Product Actions
    const fetchUserProducts = async (userId) => {
      setProductsLoading(true);
      setProductsList([]);
      try {
          // تم تغيير الحقل من addedAt إلى createdAt ليتطابق مع ملف oilguard.js
          const q = query(
              collection(db, 'profiles', userId, 'savedProducts'), 
              orderBy('createdAt', 'desc') 
          );
          const snap = await getDocs(q);
          setProductsList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
          console.error("Error fetching products:", e);
          // محاولة جلب البيانات بدون ترتيب في حال وجود وثائق قديمة لا تحتوي على حقل الوقت
          try {
              const fallbackSnap = await getDocs(collection(db, 'profiles', userId, 'savedProducts'));
              setProductsList(fallbackSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          } catch (err) {
              console.error("Fallback fetch failed:", err);
          }
      } finally {
          setProductsLoading(false);
      }
  };

    const handleDeleteProduct = async (userId, productId) => {
        if(!window.confirm("حذف هذا المنتج من قائمة المستخدم؟")) return;
        try {
            await deleteDoc(doc(db, 'profiles', userId, 'savedProducts', productId));
            setProductsList(prev => prev.filter(p => p.id !== productId));
            setUserProductsCounts(prev => ({
                ...prev,
                [userId]: Math.max(0, (prev[userId] || 0) - 1)
            }));
        } catch (e) {
            alert("فشل الحذف");
        }
    };

    // Notification Actions
    const handleSendNotification = async (isBroadcast = false) => {
        if (!notifData.title || !notifData.body) {
            alert("يرجى ملء العنوان والرسالة");
            return;
        }
        setSending(true);
        try {
            const payload = {
                notification: { title: notifData.title, body: notifData.body },
                status: 'pending',
                createdAt: Timestamp.now(),
                type: isBroadcast ? 'BROADCAST' : 'SINGLE',
                to: isBroadcast ? 'ALL_USERS' : notifyingUser.fcmToken,
                toUid: isBroadcast ? null : notifyingUser.id
            };

            await addDoc(collection(db, "mail_queue"), payload);
            setNotifyingUser(null);
            setShowBroadcastSheet(false);
            setNotifData({ title: '', body: '' });
            alert(isBroadcast ? "تم إرسال الحملة للجميع!" : "تم إرسال الإشعار للمستخدم!");
        } catch (e) {
            alert("خطأ: " + e.message);
        } finally {
            setSending(false);
        }
    };

    // Touch Actions (Pull to Refresh)
    const handleTouchStart = (e) => {
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
        if (!contentRef.current) return;
        const touchY = e.touches[0].clientY;
        const diff = touchY - touchStartY.current;
        const scrollTop = contentRef.current.scrollTop;
        
        if (scrollTop === 0 && diff > 80 && !pullToRefresh) {
            setPullToRefresh(true);
            setTimeout(() => setPullToRefresh(false), 1500);
        }
    };

    const findDuplicateTokens = async () => {
  setDuplicatesLoading(true);
  setDuplicateTokens([]);
  
  try {
    // Get all users with FCM tokens
    const usersWithTokens = users.filter(u => u.fcmToken && u.fcmToken.length > 10);
    
    // Group by token
    const tokenMap = {};
    usersWithTokens.forEach(user => {
      if (!tokenMap[user.fcmToken]) {
        tokenMap[user.fcmToken] = [];
      }
      tokenMap[user.fcmToken].push(user);
    });
    
    // Find duplicates (tokens with more than 1 user)
    const duplicates = Object.entries(tokenMap)
      .filter(([token, userList]) => userList.length > 1)
      .map(([token, userList]) => ({
        token: token,
        users: userList,
        count: userList.length
      }));
    
    // Sort by number of duplicates (most first)
    duplicates.sort((a, b) => b.count - a.count);
    
    setDuplicateTokens(duplicates);
    setShowDuplicatesSheet(true);
    
  } catch (error) {
    console.error('Error finding duplicates:', error);
    alert('خطأ في البحث عن الرموز المكررة');
  } finally {
    setDuplicatesLoading(false);
  }
};

    // ------------------------------------------------------------------
    // 4. SORTING & FILTERING HELPER
    // ------------------------------------------------------------------
    
    const getProcessedUsers = () => {
        // 1. Filter
        let processed = users.filter(u => 
            (u.settings?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.id.includes(searchTerm)
        );

        // 2. Sort
        processed.sort((a, b) => {
            let valA, valB;

            switch(sortConfig.key) {
                case 'name':
                    valA = (a.settings?.name || '').toLowerCase();
                    valB = (b.settings?.name || '').toLowerCase();
                    break;
                    
                case 'email':
                    valA = (a.email || '').toLowerCase();
                    valB = (b.email || '').toLowerCase();
                    break;
                    
                case 'status':
                    // Active (Token exists) on top
                    valA = a.fcmToken ? 1 : 0;
                    valB = b.fcmToken ? 1 : 0;
                    break;

                case 'lastSeen':
                    // Helper to extract time safely from Firestore Timestamp or Date
                    const getLastSeenTime = (obj) => {
                        const d = obj.lastSeen;
                        if (!d) return 0; // If never seen, treat as 0
                        if (d.toDate) return d.toDate().getTime(); // Firestore Timestamp
                        if (d instanceof Date) return d.getTime(); // JS Date Object
                        return new Date(d).getTime(); // String/Number fallback
                    };
                    valA = getLastSeenTime(a);
                    valB = getLastSeenTime(b);
                    break;

                case 'date':
                    // Handle Firestore Timestamp, JS Date, or fallback
                    const getJoinTime = (obj) => {
                        const d = obj.createdAt || obj.joinedAt;
                        if (!d) return 0;
                        if (d.toDate) return d.toDate().getTime(); // Firestore Timestamp
                        if (d instanceof Date) return d.getTime(); // JS Date Object
                        return new Date(d).getTime(); // String/Number
                    };
                    valA = getJoinTime(a);
                    valB = getJoinTime(b);
                    break;

                case 'savedProducts':
                    valA = userProductsCounts[a.id] || 0;
                    valB = userProductsCounts[b.id] || 0;
                    break;
                    
                default:
                    valA = a.id;
                    valB = b.id;
            }

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return processed;
    };

    const processedUsers = getProcessedUsers();
    const displayedUsers = processedUsers.slice(0, visibleUsersCount);

    const getDailyGrowthStats = () => {
        const stats = {};
        users.forEach(u => {
            // specific logic to extract date safely from Firestore Timestamp or String
            let dateObj = null;
            const rawDate = u.createdAt || u.joinedAt; // Check your specific field name
            
            if (!rawDate) return;
    
            if (rawDate.toDate) dateObj = rawDate.toDate(); // Firestore Timestamp
            else if (rawDate instanceof Date) dateObj = rawDate; // JS Date
            else dateObj = new Date(rawDate); // String
    
            if (dateObj && !isNaN(dateObj.getTime())) {
                // Format: YYYY-MM-DD
                const dateStr = dateObj.toISOString().split('T')[0];
                stats[dateStr] = (stats[dateStr] || 0) + 1;
            }
        });
    
        // Convert to array and sort descending (newest first)
        return Object.entries(stats)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => b.date.localeCompare(a.date));
    };

    const formatLastSeen = (timestamp) => {
        if (!timestamp) return 'غير نشط';
        
        // Handle Firestore Timestamp
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const today = new Date();
        
        // Check if it's today
        if (date.toDateString() === today.toDateString()) {
            return 'اليوم';
        }
    
        // Check if it's yesterday
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return 'أمس';
        }
    
        // Otherwise return date
        return date.toLocaleDateString('ar-DZ'); // e.g., ٢٠/١٠/٢٠٢٤
    };

    const fixDuplicateTokens = async () => {
        try {
          let fixedCount = 0;
          
          for (const dup of duplicateTokens) {
            // Sort users by lastSeen (newest first)
            dup.users.sort((a, b) => {
              const timeA = a.lastSeen?.toDate ? a.lastSeen.toDate().getTime() : 0;
              const timeB = b.lastSeen?.toDate ? b.lastSeen.toDate().getTime() : 0;
              return timeB - timeA;
            });
            
            // Keep token for most recent user
            const [keepUser, ...removeUsers] = dup.users;
            
            // Remove token from others
            for (const removeUser of removeUsers) {
              await updateDoc(doc(db, "profiles", removeUser.id), {
                fcmToken: null,
                notificationsEnabled: false
              });
              fixedCount++;
            }
          }
          
          alert(`✅ تم إصلاح ${fixedCount} رمز مكرر`);
          
          // Refresh the duplicates list
          findDuplicateTokens();
          
        } catch (error) {
          console.error('Error fixing duplicates:', error);
          alert('❌ حدث خطأ أثناء الإصلاح');
        }
      };

      const checkCriticalIssues = (users) => {
        const issues = [];
        
        users.forEach(user => {
          // Missing required fields
          if (!user.id) issues.push({ type: 'CRITICAL', user: user.id, message: 'No user ID' });
          if (!user.email && user.onboardingComplete === true) issues.push({ type: 'CRITICAL', user: user.id, message: 'Completed onboarding but no email' });
          
          // Corrupted settings
          if (user.settings && typeof user.settings !== 'object') {
            issues.push({ type: 'CRITICAL', user: user.id, message: 'Settings is not an object' });
          }
          
          // Invalid onboarding status
          if (user.onboardingComplete && typeof user.onboardingComplete !== 'boolean') {
            issues.push({ type: 'CRITICAL', user: user.id, message: 'onboardingComplete is not boolean' });
          }
        });
        
        return issues;
      };

      const checkDataQuality = (users) => {
        const issues = [];
        
        users.forEach(user => {
          // 1. Incomplete settings
          if (user.settings) {
            const requiredSettings = ['name', 'gender', 'skinType', 'scalpType'];
            requiredSettings.forEach(setting => {
              if (user.settings[setting] === undefined || user.settings[setting] === null) {
                issues.push({ type: 'DATA_QUALITY', user: user.id, field: `settings.${setting}`, message: 'Missing or null',
                createdAt: user.createdAt,
                lastModified: user.lastSeen,
                timestamp: new Date().toISOString() });
              }
            });
            
            // Array fields that should be arrays
            const arrayFields = ['goals', 'conditions', 'allergies'];
            arrayFields.forEach(field => {
              if (user.settings[field] && !Array.isArray(user.settings[field])) {
                issues.push({ type: 'DATA_QUALITY', user: user.id, field: `settings.${field}`, message: 'Should be array but is not' });
              }
            });
          }
          
          // 2. Inconsistent notification setup
          if (user.notificationsEnabled === true && !user.fcmToken) {
            issues.push({ type: 'DATA_QUALITY', user: user.id, message: 'Notifications enabled but no FCM token' });
          }
          
          if (user.fcmToken && user.notificationsEnabled === false) {
            issues.push({ type: 'DATA_QUALITY', user: user.id, message: 'Has FCM token but notifications disabled' });
          }
          
          // 3. Timestamp issues
          if (user.createdAt && !isValidTimestamp(user.createdAt)) {
            issues.push({ type: 'DATA_QUALITY', user: user.id, field: 'createdAt', message: 'Invalid timestamp format' });
          }
          
          if (user.lastSeen && !isValidTimestamp(user.lastSeen)) {
            issues.push({ type: 'DATA_QUALITY', user: user.id, field: 'lastSeen', message: 'Invalid lastSeen timestamp' });
          }
          
          // 4. Suspicious data patterns
          if (user.settings?.name && user.settings.name.length > 50) {
            issues.push({ type: 'SUSPICIOUS', user: user.id, field: 'settings.name', message: 'Name too long (>50 chars)' });
          }
          
          if (user.email && !isValidEmail(user.email)) {
            issues.push({ type: 'SUSPICIOUS', user: user.id, field: 'email', message: 'Invalid email format' });
          }
        });
        
        return issues;
      };

      const checkProductIssues = async (users) => {
        const issues = [];
        
        for (const user of users) {
          try {
            // Check saved products collection exists and has valid data
            const productsRef = collection(db, 'profiles', user.id, 'savedProducts');
            const productsSnap = await getDocs(productsRef);
            
            productsSnap.forEach(doc => {
              const product = doc.data();
              
              // Check required product fields
              if (!product.productName || product.productName.trim() === '') {
                issues.push({ 
                  type: 'PRODUCT', 
                  user: user.id, 
                  productId: doc.id,
                  message: 'Product missing name' 
                });
              }
              
              // Check for duplicate products (same name for same user)
              // This could be done by comparing across all products
            });
            
            // Check product count sanity
            if (productsSnap.size > 100) {
              issues.push({
                type: 'SUSPICIOUS',
                user: user.id,
                message: `User has ${productsSnap.size} saved products (unusually high)`
              });
            }
            
          } catch (error) {
            issues.push({
              type: 'SYSTEM',
              user: user.id,
              message: `Error checking products: ${error.message}`
            });
          }
        }
        
        return issues;
      };

      const checkNotificationQueue = async () => {
        const issues = [];
        
        try {
          // Check mail_queue for stuck notifications
          const queueRef = collection(db, "mail_queue");
          const queueSnap = await getDocs(query(queueRef, where("status", "==", "pending")));
          
          // Old pending notifications (more than 24 hours)
          const twentyFourHoursAgo = new Date();
          twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
          
          queueSnap.forEach(doc => {
            const notification = doc.data();
            
            if (notification.createdAt) {
              const createdAt = notification.createdAt.toDate ? 
                notification.createdAt.toDate() : new Date(notification.createdAt);
              
              if (createdAt < twentyFourHoursAgo) {
                issues.push({
                  type: 'QUEUE',
                  notificationId: doc.id,
                  message: `Notification stuck in pending for ${Math.floor((new Date() - createdAt) / (1000 * 60 * 60))} hours`
                });
              }
            }
            
            // Check for invalid notification data
            if (notification.type === 'SINGLE' && !notification.to) {
              issues.push({
                type: 'QUEUE',
                notificationId: doc.id,
                message: 'SINGLE notification without recipient token'
              });
            }
            
            if (notification.type === 'BROADCAST' && notification.toUid) {
              issues.push({
                type: 'QUEUE',
                notificationId: doc.id,
                message: 'BROADCAST notification has toUid (should be null)'
              });
            }
          });
          
          // Check for many errors
          const errorSnap = await getDocs(query(queueRef, where("status", "==", "error")));
          if (errorSnap.size > 10) {
            issues.push({
              type: 'QUEUE',
              message: `${errorSnap.size} failed notifications in queue`
            });
          }
          
        } catch (error) {
          issues.push({
            type: 'SYSTEM',
            message: `Error checking notification queue: ${error.message}`
          });
        }
        
        return issues;
      };

      const isValidTimestamp = (timestamp) => {
        try {
          if (timestamp.toDate) return true; // Firestore timestamp
          if (timestamp instanceof Date) return true;
          if (typeof timestamp === 'string' || typeof timestamp === 'number') {
            const date = new Date(timestamp);
            return !isNaN(date.getTime());
          }
          return false;
        } catch {
          return false;
        }
      };
      
      const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };
      
      const isValidVersion = (version) => {
        const versionRegex = /^\d+\.\d+\.\d+$/;
        return versionRegex.test(version);
      };
      
      const formatDate = (date) => {
        if (!date) return 'N/A';
        if (date.toDate) date = date.toDate();
        return new Date(date).toLocaleDateString('ar-DZ');
      };

      const runComprehensiveHealthCheck = async () => {
        console.log('🚀 Starting comprehensive health check...');
        
        const allIssues = [];
        const stats = {
          totalUsers: users.length,
          usersWithFCM: users.filter(u => u.fcmToken && u.fcmToken.length > 10).length,
          usersWithoutEmail: users.filter(u => !u.email).length,
          usersWithoutSettings: users.filter(u => !u.settings).length,
          usersIncompleteOnboarding: users.filter(u => u.onboardingComplete === false).length,
          usersActiveToday: users.filter(u => {
            if (!u.lastSeen) return false;
            const lastSeen = u.lastSeen?.toDate ? u.lastSeen.toDate() : new Date(u.lastSeen);
            const today = new Date();
            return lastSeen.toDateString() === today.toDateString();
          }).length,
        };
      
        // ======================
        // 1. CRITICAL USER ISSUES
        // ======================
        users.forEach(user => {
          // Missing ID
          if (!user.id) {
            allIssues.push({ 
              type: 'CRITICAL', 
              user: 'UNKNOWN', 
              message: 'User has no ID (corrupted data)' 
            });
          }
      
          // Corrupted settings
          if (user.settings && typeof user.settings !== 'object') {
            allIssues.push({ 
              type: 'CRITICAL', 
              user: user.id, 
              message: 'Settings is not an object (corrupted)' 
            });
          }
      
          // Invalid onboarding status
          if (user.onboardingComplete !== undefined && 
              user.onboardingComplete !== null && 
              typeof user.onboardingComplete !== 'boolean') {
            allIssues.push({ 
              type: 'CRITICAL', 
              user: user.id, 
              message: 'onboardingComplete is not boolean' 
            });
          }
        });
      
        // ======================
        // 2. DATA QUALITY ISSUES
        // ======================
        users.forEach(user => {
          // Incomplete settings
          if (user.settings) {
            if (!user.settings.name || user.settings.name.trim() === '') {
              allIssues.push({ 
                type: 'DATA_QUALITY', 
                user: user.id, 
                field: 'settings.name',
                message: 'User has no name' 
              });
            }
      
            // Check array fields
            const arrayFields = ['goals', 'conditions', 'allergies'];
            arrayFields.forEach(field => {
              if (user.settings[field] && !Array.isArray(user.settings[field])) {
                allIssues.push({ 
                  type: 'DATA_QUALITY', 
                  user: user.id, 
                  field: `settings.${field}`,
                  message: `Should be array but got: ${typeof user.settings[field]}` 
                });
              }
            });
          } else {
            allIssues.push({ 
              type: 'DATA_QUALITY', 
              user: user.id, 
              message: 'User has no settings object' 
            });
          }
      
          // Notification inconsistencies
          if (user.notificationsEnabled === true && !user.fcmToken) {
            allIssues.push({ 
              type: 'DATA_QUALITY', 
              user: user.id, 
              message: 'Notifications enabled but no FCM token' 
            });
          }
      
          if (user.fcmToken && user.notificationsEnabled === false) {
            allIssues.push({ 
              type: 'DATA_QUALITY', 
              user: user.id, 
              message: 'Has FCM token but notifications disabled' 
            });
          }
        });
      
        // ======================
        // 3. FCM DUPLICATES (Your existing check)
        // ======================
        const usersWithTokens = users.filter(u => u.fcmToken && u.fcmToken.length > 10);
        const tokenMap = {};
        usersWithTokens.forEach(user => {
          if (!tokenMap[user.fcmToken]) tokenMap[user.fcmToken] = [];
          tokenMap[user.fcmToken].push(user);
        });
      
        Object.entries(tokenMap).forEach(([token, userList]) => {
          if (userList.length > 1) {
            allIssues.push({
              type: 'FCM_DUPLICATE',
              token: token,
              users: userList,
              message: `FCM token shared by ${userList.length} users`,
              count: userList.length
            });
          }
        });
      
        // ======================
        // 4. QUEUE ISSUES (Simplified - no async for now)
        // ======================
        try {
          const queueRef = collection(db, "mail_queue");
          const queueQuery = query(queueRef, where("status", "==", "pending"));
          const queueSnap = await getDocs(queueQuery);
          
          if (queueSnap.size > 5) {
            allIssues.push({
              type: 'QUEUE',
              message: `${queueSnap.size} notifications stuck in pending`
            });
          }
      
          // Check for old pending notifications
          const twentyFourHoursAgo = new Date();
          twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
          
          queueSnap.forEach(doc => {
            const notification = doc.data();
            if (notification.createdAt) {
              const createdAt = notification.createdAt.toDate ? 
                notification.createdAt.toDate() : new Date(notification.createdAt);
              
              if (createdAt < twentyFourHoursAgo) {
                allIssues.push({
                  type: 'QUEUE',
                  notificationId: doc.id,
                  message: `Notification stuck for ${Math.floor((new Date() - createdAt) / (1000 * 60 * 60))} hours`
                });
              }
            }
          });
        } catch (error) {
          allIssues.push({
            type: 'SYSTEM',
            message: `Error checking queue: ${error.message}`
          });
        }
      
        // ======================
        // 5. CONFIG ISSUES
        // ======================
        try {
          const configRef = doc(db, 'app_config', 'version_control');
          const configSnap = await getDoc(configRef);
          
          if (!configSnap.exists()) {
            allIssues.push({
              type: 'CONFIG',
              message: 'app_config document missing!'
            });
          } else {
            const config = configSnap.data();
            
            if (config.maintenance_mode === undefined) {
              allIssues.push({
                type: 'CONFIG',
                message: 'maintenance_mode not set'
              });
            }
            
            if (!config.android?.latest_version) {
              allIssues.push({
                type: 'CONFIG',
                message: 'Android latest_version not set'
              });
            }
          }
        } catch (error) {
          allIssues.push({
            type: 'SYSTEM',
            message: `Error checking config: ${error.message}`
          });
        }
      
        // ======================
        // 6. CATEGORIZE ISSUES
        // ======================
        const categorizedIssues = {
          CRITICAL: allIssues.filter(i => i.type === 'CRITICAL'),
          FCM_DUPLICATE: allIssues.filter(i => i.type === 'FCM_DUPLICATE'),
          DATA_QUALITY: allIssues.filter(i => i.type === 'DATA_QUALITY'),
          QUEUE: allIssues.filter(i => i.type === 'QUEUE'),
          CONFIG: allIssues.filter(i => i.type === 'CONFIG'),
          SYSTEM: allIssues.filter(i => i.type === 'SYSTEM'),
        };
      
        // ======================
        // 7. CREATE SUMMARY
        // ======================
        const summary = {
          totalIssues: allIssues.length,
          bySeverity: {
            critical: categorizedIssues.CRITICAL.length,
            high: categorizedIssues.FCM_DUPLICATE.length,
            medium: categorizedIssues.DATA_QUALITY.length + categorizedIssues.QUEUE.length,
            low: categorizedIssues.CONFIG.length + categorizedIssues.SYSTEM.length
          },
          stats: stats,
          timestamp: new Date().toLocaleString('ar-DZ')
        };
      
        console.log('✅ Health check completed:', summary);
        
        return {
          issues: categorizedIssues,
          summary: summary,
          stats: stats,
          timestamp: new Date()
        };
      };

      const toggleSection = (category) => {
        setExpandedSections(prev => ({
          ...prev,
          [category]: !prev[category]
        }));
      };

      const fetchDocumentDates = async (userId) => {
        try {
          // This would require Firebase Admin SDK or additional setup
          // For now, we'll use the existing data
          const user = users.find(u => u.id === userId);
          if (!user) return null;
          
          return {
            createdAt: user.createdAt,
            lastModified: user.lastSeen || user.createdAt,
            lastTokenUpdate: user.lastTokenUpdate
          };
        } catch (error) {
          console.error('Error fetching document dates:', error);
          return null;
        }
      };

      const handleDismissMissing = async (id) => {
        if(!window.confirm("حذف هذا المكون من القائمة؟")) return;
        try {
            await deleteDoc(doc(db, "missing_ingredients", id));
        } catch(e) {
            alert("Error: " + e.message);
        }
    };

    const handleDownloadEmails = () => {
      // 1. تصفية المستخدمين الذين لديهم بريد إلكتروني فقط
      const usersWithEmail = users.filter(u => u.email && u.email.trim() !== '');
  
      if (usersWithEmail.length === 0) {
          alert("لا يوجد مستخدمين لديهم بريد إلكتروني للتحميل");
          return;
      }
  
      // 2. تجهيز محتوى الـ CSV (العناوين ثم البيانات)
      const header = ["الاسم", "البريد الإلكتروني", "تاريخ الانضمام"].join(",");
      const rows = usersWithEmail.map(user => {
          const name = user.settings?.name || 'غير محدد';
          const email = user.email;
          const joined = user.createdAt?.toDate 
              ? user.createdAt.toDate().toLocaleDateString('ar-DZ') 
              : 'N/A';
          
          return `"${name}","${email}","${joined}"`;
      }).join("\n");
  
      const csvContent = "\uFEFF" + header + "\n" + rows; // \uFEFF لدعم اللغة العربية في Excel
  
      // 3. إنشاء ملف للتحميل
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Wathiq_Emails_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const toggleMissingSelection = (id) => {
    setSelectedMissing(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
};

// حذف العناصر المحددة دفعة واحدة
const handleBulkDeleteMissing = async () => {
    if (!window.confirm(`هل أنت متأكد من حذف ${selectedMissing.length} مكون؟`)) return;
    
    const batch = writeBatch(db);
    selectedMissing.forEach(id => {
        batch.delete(doc(db, "missing_ingredients", id));
    });

    try {
        await batch.commit();
        setSelectedMissing([]);
        alert("تم الحذف بنجاح");
    } catch (e) {
        alert("خطأ أثناء الحذف: " + e.message);
    }
};

// نسخ جميع الأسماء المفلترة
const handleCopyAllMissing = () => {
  // 1. فلترة المكونات بناءً على نص البحث الحالي والنوع لنسخ ما تراه فقط
  let filteredList = missingIngredients;
  if (missingTypeFilter === 'scanner') {
      filteredList = filteredList.filter(i => i.last_source === 'scanner' || (i.scanner_count && i.scanner_count > 0));
  } else if (missingTypeFilter === 'database') {
      filteredList = filteredList.filter(i => i.last_source === 'database' || (i.database_count && i.database_count > 0));
  }

  filteredList = filteredList.filter(i => 
      i.originalName.toLowerCase().includes(missingSearch.toLowerCase())
  );

  if (filteredList.length === 0) {
      alert("القائمة فارغة، لا يوجد شيء لنسخه");
      return;
  }

  // 2. تحويل الأسماء إلى قائمة مفصولة بفواصل
  const namesList = filteredList
      .map(i => i.originalName.trim())
      .join(', ');

  // 3. عملية النسخ للحافظة
  navigator.clipboard.writeText(namesList)
      .then(() => {
          alert(`✅ تم نسخ ${filteredList.length} مكون إلى الحافظة بنجاح`);
      })
      .catch(err => {
          console.error('فشل النسخ:', err);
          alert("حدث خطأ أثناء محاولة النسخ");
      });
};


const handleDownloadMissingJSON = () => {
  try {
    if (sortedMissing.length === 0) {
      alert("لا توجد مكونات للتحميل في هذا العرض");
      return;
    }

    // One ingredient name per line
    const content = sortedMissing.map(i => i.originalName.trim()).join('\n');

    let filename = `MissingIngredients_All_${new Date().toISOString().split('T')[0]}.txt`;
    if (missingTypeFilter === 'scanner') {
      filename = `MissingIngredients_Scanner_${new Date().toISOString().split('T')[0]}.txt`;
    } else if (missingTypeFilter === 'database') {
      filename = `MissingIngredients_Database_${new Date().toISOString().split('T')[0]}.txt`;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Error downloading missing ingredients:', e);
    alert('خطأ أثناء التحميل: ' + e.message);
  }
};


const getActiveCount = (item) => {
  if (missingTypeFilter === 'scanner') {
      return item.scanner_count ?? (item.last_source === 'scanner' ? (item.count ?? item.totalCount ?? 0) : 0);
  }
  if (missingTypeFilter === 'database') {
      return item.database_count ?? (item.last_source === 'database' ? (item.count ?? item.totalCount ?? 0) : 0);
  }
  return item.count ?? item.totalCount ?? 0;
};

const getProcessedMissing = () => {
  // 1. الفلترة بناءً على البحث
  let list = missingIngredients.filter(i => 
      i.originalName.toLowerCase().includes(missingSearch.toLowerCase())
  );

  // 1.5 الفلترة بناءً على النوع
  if (missingTypeFilter === 'scanner') {
      list = list.filter(i => i.last_source === 'scanner' || (i.scanner_count && i.scanner_count > 0));
  } else if (missingTypeFilter === 'database') {
      list = list.filter(i => i.last_source === 'database' || (i.database_count && i.database_count > 0));
  }

  // 2. الفرز
  list.sort((a, b) => {
      let valA, valB;

      if (missingSortConfig.key === 'lastReported') {
          // معالجة التاريخ (Firestore Timestamp)
          valA = a.lastReported?.toDate ? a.lastReported.toDate().getTime() : 0;
          valB = b.lastReported?.toDate ? b.lastReported.toDate().getTime() : 0;
      } else if (missingSortConfig.key === 'count') {
          valA = getActiveCount(a);
          valB = getActiveCount(b);
      } else {
          valA = a[missingSortConfig.key];
          valB = b[missingSortConfig.key];
      }

      if (valA < valB) return missingSortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return missingSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
  });

  return list;
};

const sortedMissing = getProcessedMissing();

const LABELS = {
  skin: { oily: 'دهنية', dry: 'جافة', combo: 'مختلطة', normal: 'عادية' },
  scalp: { oily: 'دهنية', dry: 'جافة', normal: 'عادية' },
  goals: {
      acne: 'حب الشباب', anti_aging: 'الشيخوخة', brightening: 'التفتيح',
      hydration: 'الترطيب', texture_pores: 'المسام', hair_growth: 'تكثيف الشعر'
  },
  conditions: {
      sensitive_skin: 'بشرة حساسة', rosacea_prone: 'الوردية', dandruff: 'قشرة',
      pregnancy_nursing: 'حمل/رضاعة', acne_prone: 'معرض للحبوب', sensitive_scalp: 'فروة حساسة'
  },
  allergies: { nuts: 'مكسرات', soy: 'صويا', fragrance: 'عطور', salicylates: 'ساليسيلات', gluten: 'غلوتين' }
};

const appStats = useMemo(() => {
  const stats = {
      hairTypes: {},
      skinTypes: {},
      genders: { 'أنثى': 0, 'ذكر': 0, 'غير محدد': 0 },
      onboarding: { complete: 0, incomplete: 0 },
      goals: {},
      conditions: {},
      allergies: {}
  };

  users.forEach(u => {
      const s = u.settings || {};
      
      // الأجناس والحالة
      const g = s.gender || 'غير محدد';
      stats.genders[g] = (stats.genders[g] || 0) + 1;
      if (u.onboardingComplete) stats.onboarding.complete++;
      else stats.onboarding.incomplete++;

      // أنواع البشرة والفروة (Mappings)
      if (s.skinType) {
          const label = LABELS.skin[s.skinType] || s.skinType;
          stats.skinTypes[label] = (stats.skinTypes[label] || 0) + 1;
      }
      if (s.scalpType) {
          const label = LABELS.scalp[s.scalpType] || s.scalpType;
          stats.hairTypes[label] = (stats.hairTypes[label] || 0) + 1;
      }

      // الأهداف والمشاكل والحساسيات (Arrays)
      (s.goals || []).forEach(id => {
          const label = LABELS.goals[id] || id;
          stats.goals[label] = (stats.goals[label] || 0) + 1;
      });
      (s.conditions || []).forEach(id => {
          const label = LABELS.conditions[id] || id;
          stats.conditions[label] = (stats.conditions[label] || 0) + 1;
      });
      (s.allergies || []).forEach(id => {
          const label = LABELS.allergies[id] || id;
          stats.allergies[label] = (stats.allergies[label] || 0) + 1;
      });
  });

  return stats;
}, [users]);

const networkInsights = useMemo(() => {
  const pairCounts = {};
  
  users.forEach(u => {
      const s = u.settings || {};
      const tags = [];

      // تجميع كل الملصقات (Labels) الخاصة بهذا المستخدم في مصفوفة واحدة
      if (s.skinType) tags.push(`بشرة ${LABELS.skin[s.skinType] || s.skinType}`);
      if (s.scalpType) tags.push(`فروة ${LABELS.scalp[s.scalpType] || s.scalpType}`);
      (s.goals || []).forEach(id => tags.push(LABELS.goals[id] || id));
      (s.conditions || []).forEach(id => tags.push(LABELS.conditions[id] || id));
      (s.allergies || []).forEach(id => tags.push(LABELS.allergies[id] || id));

      // إنشاء أزواج من كل هذه الملصقات (Matrix Generation)
      for (let i = 0; i < tags.length; i++) {
          for (let j = i + 1; j < tags.length; j++) {
              // ترتيب الأبجدية لضمان عدم تكرار (A+B) و (B+A)
              const pair = [tags[i], tags[j]].sort();
              const pairKey = `${pair[0]} ↔ ${pair[1]}`;
              pairCounts[pairKey] = (pairCounts[pairKey] || 0) + 1;
          }
      }
  });

  // تحويل الكائن إلى مصفوفة مرتبة حسب الأكثر تكراراً
  return Object.entries(pairCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20) // نأخذ أفضل 20 ارتباطاً فقط لضمان نظافة الواجهة
      .map(([relation, count]) => ({
          labels: relation.split(' ↔ '),
          count
      }));
}, [users]);

const businessIntelligence = useMemo(() => {
  const bi = {
      // 1. تحليل الفجوة السوقية: الهدف المفقود لكل فئة حساسة (ROI Directives)
      unmetNeeds: {}, 
      // 2. مؤشر صياغة المنتجات (R&D Constraints): المكونات التي يجب استبعادها فوراً
      formulationRisk: { totalAllergies: 0, topAvoidanceList: {} },
      // 3. تحليل القيمة النوعية (Consumer Lifetime Value - CLV Proxy)
      highValueSegments: { sensitivePremium: 0, goalSeekers: 0 },
      // 4. مؤشر "العلاجات التقاطعية": المشكلة الصحية والهدف التجميلي المرتبط بها
      therapeuticIntersects: {}
  };

  users.forEach(u => {
      const s = u.settings || {};
      const goals = s.goals || [];
      const allergies = s.allergies || [];
      const conditions = s.conditions || [];
      
      // حساب إجمالي الحساسيات لشركات الـ R&D
      bi.formulationRisk.totalAllergies += allergies.length;

      // تحليل: ما هي الأهداف الأكثر إلحاحاً لمن يعانون من مشاكل طبية (Rosacea, Eczema etc)
      conditions.forEach(cId => {
          const cLabel = LABELS.conditions[cId] || cId;
          if (!bi.therapeuticIntersects[cLabel]) bi.therapeuticIntersects[cLabel] = {};
          goals.forEach(gId => {
              const gLabel = LABELS.goals[gId] || gId;
              bi.therapeuticIntersects[cLabel][gLabel] = (bi.therapeuticIntersects[cLabel][gLabel] || 0) + 1;
          });
      });

      // تصنيف المستخدمين كـ "عملاء ذوي قيمة عالية" للشركات (High Intent Consumers)
      // المستخدم الذي لديه (بشرة حساسة + أهداف محددة + حساسية) هو العميل الأكثر إنفاقاً في الصيدليات
      if (conditions.includes('sensitive_skin') && goals.length > 0 && allergies.length > 0) {
          bi.highValueSegments.sensitivePremium++;
      }

      // رصد أكثر المكونات المسببة للحساسية لبناء منتجات (Clean Beauty)
      allergies.forEach(aId => {
          const aLabel = LABELS.allergies[aId] || aId;
          bi.formulationRisk.topAvoidanceList[aLabel] = (bi.formulationRisk.topAvoidanceList[aLabel] || 0) + 1;
      });
  });

  return bi;
}, [users]);

// Function to fetch total products count across the whole app
const fetchGlobalProductCount = async () => {
  try {
      // الطريقة الأسرع والأقل استهلاكاً للبيانات
      const coll = collectionGroup(db, 'savedProducts');
      const snapshot = await getCountFromServer(coll);
      setTotalSavedProducts(snapshot.data().count);
      console.log("✅ Total Products Counted:", snapshot.data().count);
  } catch (e) {
      console.error("❌ Error with getCountFromServer:", e);
      
      // خطة بديلة: إذا فشل العد السريع، نقوم بجلب المستندات وعدّها يدوياً
      try {
          const querySnapshot = await getDocs(collectionGroup(db, 'savedProducts'));
          setTotalSavedProducts(querySnapshot.size);
      } catch (err) {
          console.error("❌ Global Count Failed:", err);
          // إذا رأيت رابطاً في Console المتصفح هنا، اضغط عليه لإنشاء الـ Index
      }
  }
};

// Fetch count when modal opens
useEffect(() => {
  if (showStatsModal) fetchGlobalProductCount();
}, [showStatsModal]);
    
const handleExportProductsJSON = async () => {
  try {
      alert("⏳ جاري تجهيز ملف المنتجات (JSON)... قد يستغرق الأمر بعض الوقت.");
      
      // جلب كل المنتجات من جميع المستخدمين
      const querySnapshot = await getDocs(collectionGroup(db, 'savedProducts'));
      const products =[];

      querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          // تحويل مصفوفة المكونات إلى نص مفصول بفواصل
          const ingredientsArray = data.analysisData?.detected_ingredients ||[];
          const ingredientsString = ingredientsArray.map(ing => ing.name).join(', ');

          // بناء الكائن بالشكل المطلوب
          products.push({
              id: doc.id,
              brand: data.brand || "Unknown",
              name: data.productName || "Unknown Product",
              image: data.productImage || "",
              ingredients: ingredientsString || "",
              country: data.country || "Unknown",
              category: {
                  id: data.productType || "unknown",
                  label: data.productType || "غير محدد",
                  icon: "leaf"
              },
              quantity: "null",
              price: null,
              targetTypes: [],
              marketingClaims:[]
          });
      });

      // إنشاء ملف JSON وتنزيله
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `Wathiq_Products_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
  } catch (error) {
      console.error("Export failed:", error);
      alert("❌ حدث خطأ أثناء التصدير: " + error.message);
  }
};

    // ------------------------------------------------------------------
    // 5. MAIN RENDER
    // ------------------------------------------------------------------

    if (authLoading) return (
        <div className="fullscreen-loader">
            <FaSpinner className="spinning" size={40} color="#34d399"/>
            <span>جاري التحميل...</span>
        </div>
    );

    if (!user) {
        return (
            <div className="w-admin-container" style={{display:'flex', justifyContent:'center', alignItems:'center', padding:20}}>
                <motion.div 
                    className="config-card" 
                    style={{maxWidth:'400px', width:'100%', padding:'40px'}}
                    initial={{scale:0.9, opacity:0}}
                    animate={{scale:1, opacity:1}}
                >
                    <div className="w-admin-brand" style={{textAlign:'center', marginBottom:'30px'}}>
                        <h1>لوحة تحكم وثيق</h1>
                        <span className="w-admin-badge-beta">Admin Portal</span>
                    </div>
                    <form onSubmit={handleLogin} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                        <input 
                            type="email" 
                            placeholder="admin@wathiq.app" 
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                            className="w-admin-input"
                        />
                        <input 
                            type="password" 
                            placeholder="كلمة المرور" 
                            value={loginPass}
                            onChange={(e) => setLoginPass(e.target.value)}
                            required
                            className="w-admin-input"
                        />
                        <button type="submit" className="w-admin-btn-primary" style={{justifyContent:'center'}}>
                            تسجيل الدخول
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="w-admin-container">
            
            {/* --- TOP BAR --- */}
            <header className="w-admin-topbar">
                <div className="w-admin-brand">
                    <h1>لوحة تحكم وثيق</h1>
                    <span className="w-admin-badge-beta">v2.3</span>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <span style={{fontSize:'0.85rem', color:'#94a3b8'}}>{user.email?.split('@')[0]}</span>
                </div>
            </header>

            <div 
                className="w-admin-content" 
                ref={contentRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
            >
                {/* Pull to Refresh Indicator */}
                {pullToRefresh && (
                    <div className="pull-indicator">
                        <FaArrowDown className="spinning" />
                        <span>جاري التحديث...</span>
                    </div>
                )}

                {/* ================= VIEW: USERS ================= */}
                {activeView === 'users' && (
                    <motion.div 
                        initial={{opacity:0, y:10}} 
                        animate={{opacity:1, y:0}} 
                        transition={{duration:0.3}}
                    >
                        
                        {/* Stats Cards */}
                        <div className="w-admin-stats-row">
                            <div className="stat-card primary" onClick={() => setShowBroadcastSheet(true)}>
                                <div className="stat-icon"><FaBullhorn /></div>
                                <div className="stat-info">
                                    <h3>إشعار جماعي</h3>
                                    <span>اضغط للإرسال للكل</span>
                                </div>
                            </div>
                            <div 
    className="stat-card" 
    onClick={() => setShowGrowthSheet(true)} // <--- Add Click Event
    style={{cursor: 'pointer'}} // <--- Add Cursor style
>
    <div className="stat-icon"><FaUsers /></div>
    <div className="stat-info">
        <h3>{users.length}</h3>
        <span>مستخدم (اضغط للتفاصيل)</span> {/* <--- Update Text */}
    </div>
</div>

<div 
    className="stat-card" 
    onClick={handleExportProductsJSON}
    style={{ cursor: 'pointer', border: '1px solid rgba(52, 211, 153, 0.2)' }}
>
    <div className="stat-icon" style={{ color: '#34d399' }}><FaDownload /></div>
    <div className="stat-info">
        <h3 style={{ color: '#34d399' }}>JSON</h3>
        <span>تصدير المنتجات</span>
    </div>
</div>
<div 
    className="stat-card" 
    onClick={() => setShowStatsModal(true)}
    style={{ cursor: 'pointer', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))', border: '1px solid rgba(139, 92, 246, 0.2)' }}
>
    <div className="stat-icon" style={{ color: '#8b5cf6' }}><FaChartPie /></div>
    <div className="stat-info">
        <h3 style={{ color: '#8b5cf6' }}>الإحصائيات</h3>
        <span>تحليل البيانات الشامل</span>
    </div>
</div>

<div 
        className="stat-card" 
        onClick={handleDownloadEmails}
        style={{ cursor: 'pointer', border: '1px solid rgba(16, 185, 129, 0.2)' }}
    >
        <div className="stat-icon" style={{ color: '#10b981' }}><FaDownload /></div>
        <div className="stat-info">
            <h3 style={{ color: '#10b981' }}>CSV</h3>
            <span>تحميل الإيميلات</span>
        </div>
    </div>
 <div 
    className="stat-card warning" 
    onClick={findDuplicateTokens}
    style={{ cursor: 'pointer', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
  >
    <div className="stat-icon" style={{ color: '#f59e0b' }}>
      <FaTools />
    </div>
    <div className="stat-info">
      <h3 style={{ color: '#f59e0b' }}>
        {duplicateTokens.length > 0 ? duplicateTokens.length : '?'}
      </h3>
      <span>رموز مكررة (اضغط للتحقق)</span>
    </div>
  </div>

  <div 
  className="stat-card" 
  onClick={async () => {
    setHealthCheckLoading(true);
    const results = await runComprehensiveHealthCheck();
    setHealthCheckResults(results);
    setShowHealthCheck(true);
    setHealthCheckLoading(false);
  }}
  style={{ 
    cursor: 'pointer', 
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.2)'
  }}
>
  <div className="stat-icon" style={{ color: '#3b82f6' }}>
    <FaHeartbeat />
  </div>
  <div className="stat-info">
    <h3 style={{ color: '#3b82f6' }}>
      {healthCheckLoading ? '...' : '🔍'}
    </h3>
    <span>فحص صحة البيانات</span>
  </div>
</div>

                            <div className="stat-card">
                                <div className="stat-icon"><FaMobileAlt /></div>
                                <div className="stat-info"><h3>{users.filter(u => u.fcmToken).length}</h3><span>أونلاين</span></div>
                            </div>
                        </div>

                        {/* TOOLBAR: Search + Sort + View Mode */}
                        <div className="w-admin-toolbar">
                            <div className="w-admin-search-container">
                                <FaSearch color="#64748b" />
                                <input 
                                    placeholder="بحث بالاسم، البريد، أو المعرف..." 
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && <FaTimes style={{cursor:'pointer', color:'#94a3b8'}} onClick={()=>setSearchTerm('')}/>}
                            </div>

                            <div className="w-admin-controls">
                                <select 
                                    className="w-admin-select"
                                    value={sortConfig.key}
                                    onChange={(e) => setSortConfig({...sortConfig, key: e.target.value})}
                                >
                                    <option value="date">تاريخ الانضمام</option>
                                    <option value="lastSeen">آخر ظهور (نشط)</option> {/* <--- NEW OPTION */}
                                    <option value="name">الاسم</option>
                                    <option value="email">البريد</option>
                                    <option value="status">الحالة (نشط)</option>
                                    <option value="savedProducts">عدد المنتجات المحفوظة</option>
                                </select>

                                <button 
                                    className="view-btn" 
                                    onClick={() => setSortConfig(prev => ({...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc'}))}
                                    title={sortConfig.direction === 'asc' ? 'تصاعدي' : 'تنازلي'}
                                >
                                    {sortConfig.direction === 'asc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
                                </button>

                                <div style={{width: 1, height: 24, background: '#334155', margin: '0 4px'}}></div>

                                <button 
                                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                    onClick={() => setViewMode('grid')}
                                    title="عرض شبكة"
                                >
                                    <FaThLarge />
                                </button>
                                <button 
                                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                    onClick={() => setViewMode('list')}
                                    title="عرض قائمة"
                                >
                                    <FaListUl />
                                </button>
                            </div>
                        </div>

                        {/* Info Bar */}
                        <div style={{
                            marginBottom: 15, 
                            padding: '0 5px', 
                            fontSize: '0.85rem', 
                            color: '#64748b', 
                            display: 'flex', 
                            justifyContent: 'space-between'
                        }}>
                            <span>عرض {displayedUsers.length} من أصل {processedUsers.length}</span>
                            <span>الترتيب: {sortConfig.key === 'date' ? 'التاريخ' : sortConfig.key} ({sortConfig.direction === 'asc' ? 'تصاعدي' : 'تنازلي'})</span>
                        </div>

                        {/* Data Content */}
                        {loading ? (
                            <div className="empty-state">
                                <FaSpinner className="spinning" size={40} color="#34d399"/>
                                <span>جاري تحميل المستخدمين...</span>
                            </div>
                        ) : processedUsers.length === 0 ? (
                            <div className="empty-state">
                                <FaUsers size={48} />
                                <span>لا توجد نتائج مطابقة</span>
                            </div>
                        ) : (
                            <>
                                {viewMode === 'grid' ? (
                                    /* --- GRID VIEW --- */
                                    <div className="w-admin-user-grid">
                                        {displayedUsers.map(user => (
                                            <div 
                                                key={user.id} 
                                                className="w-admin-user-card"
                                            >
                                                <div className="user-card-header">
                                                    <div className="user-avatar">
                                                        {user.settings?.name?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                    <div className="user-details">
                                                        <h4>{user.settings?.name || 'مستخدم جديد'}</h4>
                                                        <span>{user.email || 'No Email'}</span>
                                                    </div>
                                                    <div 
                                                        className={`status-dot ${user.fcmToken ? 'online' : 'offline'}`} 
                                                        title={user.fcmToken ? 'نشط' : 'غير نشط'}
                                                    />
                                                </div>
                                                
                                                <div className="user-card-meta">
                                                    <span className="meta-tag">{user.settings?.gender || 'غير حدد'}</span>
                                                    <span className="meta-tag" style={{
                            backgroundColor: formatLastSeen(user.lastSeen) === 'اليوم' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                            color: formatLastSeen(user.lastSeen) === 'اليوم' ? '#34d399' : '#94a3b8'
                        }}>
                            {formatLastSeen(user.lastSeen)}
                        </span>
                                                    <span className="meta-tag">{user.settings?.skinType || '-'}</span>
                                                </div>

                                                <div className="user-card-actions">
                                                    <button onClick={() => setEditingUser(JSON.parse(JSON.stringify(user)))}>
                                                        <FaEdit size={16} /> تعديل
                                                    </button>
                                                    <button onClick={() => { setViewingProducts(user); fetchUserProducts(user.id); }}>
                                                        <FaShoppingBag size={16} /> المنتجات ({userProductsCounts[user.id] || 0})
                                                    </button>
                                                    <button 
                                                        disabled={!user.fcmToken} 
                                                        onClick={() => setNotifyingUser(user)}
                                                        style={{opacity: user.fcmToken ? 1 : 0.4}}
                                                    >
                                                        <FaBell size={16} /> تنبيه
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    /* --- LIST VIEW --- */
                                    <div className="w-admin-user-list">
                                        {displayedUsers.map(user => (
                                            <div 
                                                key={user.id}
                                                className="user-list-item"
                                            >
                                                <div className="list-avatar">
                                                    {user.settings?.name?.[0]?.toUpperCase() || '?'}
                                                </div>
                                                <div className="list-info">
                                                    <h4>{user.settings?.name || 'بدون اسم'} ({userProductsCounts[user.id] || 0} منتج)</h4>
                                                    <span className="list-email">{user.email}</span>
                                                </div>
                                                <div className="list-email hide-mobile">
                                                    {user.settings?.gender || '-'} • {user.settings?.skinType || '-'}
                                                </div>
                                                <div className="list-status-col">
        <div className="list-status">
            {/* Use the lastSeen logic for the green dot */}
            <div className={`status-dot ${formatLastSeen(user.lastSeen) === 'اليوم' ? 'online' : 'offline'}`} />
            <span style={{fontSize:'0.85rem'}}>
                 {formatLastSeen(user.lastSeen)}
            </span>
        </div>
    </div>
                                                <div className="list-actions">
                                                    <button 
                                                        className="list-btn edit" 
                                                        onClick={() => setEditingUser(JSON.parse(JSON.stringify(user)))}
                                                        title="تعديل البيانات"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button 
                                                        className="list-btn prod" 
                                                        onClick={() => { setViewingProducts(user); fetchUserProducts(user.id); }}
                                                        title={`عرض المنتجات (${userProductsCounts[user.id] || 0})`}
                                                    >
                                                        <FaShoppingBag />
                                                    </button>
                                                    <button 
                                                        className="list-btn notif" 
                                                        disabled={!user.fcmToken} 
                                                        style={{opacity: user.fcmToken ? 1 : 0.3}}
                                                        onClick={() => setNotifyingUser(user)}
                                                        title="إرسال إشعار"
                                                    >
                                                        <FaBell />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Load More Button */}
                                {displayedUsers.length < processedUsers.length && (
                                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '25px', marginBottom: '10px' }}>
                                        <button 
                                            className="w-admin-btn-primary" 
                                            onClick={() => setVisibleUsersCount(prev => prev + 20)}
                                            style={{
                                                padding: '12px 24px',
                                                fontSize: '0.9rem',
                                                maxWidth: '280px',
                                                background: 'rgba(52, 211, 153, 0.1)',
                                                color: '#34d399',
                                                border: '1px solid rgba(52, 211, 153, 0.3)',
                                                boxShadow: 'none'
                                            }}
                                        >
                                            عرض المزيد ({processedUsers.length - displayedUsers.length} متبقي)
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </motion.div>
                )}

                 {/* ================= VIEW: MISSING INGREDIENTS ================= */}
                 {activeView === 'missing' && (
    <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-admin-config-view"
    >
        {/* Header & Stats */}
        <div style={{ marginBottom: 25, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
                <h2 style={{ margin: 0, color: 'white', fontSize: '1.4rem' }}>مكونات مفقودة في المختبر</h2>
                <p style={{ color: '#94a3b8', marginTop: '8px', fontSize: '0.9rem' }}>
                    إجمالي المكونات الفريدة المكتشفة: <span style={{color:'#34d399', fontWeight:'bold'}}>{missingIngredients.length}</span>
                </p>
            </div>

            {/* Type Filter Tabs */}
            <div style={{
                display: 'flex',
                gap: '4px',
                background: '#1e293b',
                padding: '4px',
                borderRadius: '12px',
                border: '1px solid #334155'
            }}>
                <button
                    onClick={() => setMissingTypeFilter('all')}
                    style={{
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        background: missingTypeFilter === 'all' ? 'rgba(52, 211, 153, 0.1)' : 'transparent',
                        color: missingTypeFilter === 'all' ? '#34d399' : '#94a3b8',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                    }}
                >
                    <FaFlask size={12} />
                    <span>الكل ({missingIngredients.length})</span>
                </button>
                <button
                    onClick={() => setMissingTypeFilter('scanner')}
                    style={{
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        background: missingTypeFilter === 'scanner' ? 'rgba(52, 211, 153, 0.1)' : 'transparent',
                        color: missingTypeFilter === 'scanner' ? '#34d399' : '#94a3b8',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                    }}
                >
                    <FaSearch size={12} />
                    <span>الماسح ({missingIngredients.filter(i => i.last_source === 'scanner' || (i.scanner_count && i.scanner_count > 0)).length})</span>
                </button>
                <button
                    onClick={() => setMissingTypeFilter('database')}
                    style={{
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        background: missingTypeFilter === 'database' ? 'rgba(52, 211, 153, 0.1)' : 'transparent',
                        color: missingTypeFilter === 'database' ? '#34d399' : '#94a3b8',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                    }}
                >
                    <FaDatabase size={12} />
                    <span>قاعدة البيانات ({missingIngredients.filter(i => i.last_source === 'database' || (i.database_count && i.database_count > 0)).length})</span>
                </button>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="view-btn" onClick={handleCopyAllMissing} title={`نسخ أسماء المكونات (${missingTypeFilter === 'all' ? 'الكل' : missingTypeFilter === 'scanner' ? 'الماسح' : 'قاعدة البيانات'}) كـ CSV`}>
                <FaCopy /> نسخ الأسماء
              </button>
              <button className="view-btn" onClick={handleDownloadMissingJSON} title={`تحميل المكونات (${missingTypeFilter === 'all' ? 'الكل' : missingTypeFilter === 'scanner' ? 'الماسح' : 'قاعدة البيانات'}) كـ JSON`}>
                <FaDownload /> تحميل JSON
              </button>
              {selectedMissing.length > 0 && (
                <button className="view-btn" style={{backgroundColor:'#ef444420', color:'#ef4444'}} onClick={handleBulkDeleteMissing}>
                  <FaTrash /> حذف المحدد ({selectedMissing.length})
                </button>
              )}
            </div>
        </div>

        {/* Toolbar Tools */}
        <div className="w-admin-toolbar" style={{marginBottom: 20}}>
    <div className="w-admin-search-container" style={{flex: 1}}>
        <FaFilter color="#64748b" />
        <input 
            placeholder="فلترة المكونات المفقودة..." 
            value={missingSearch}
            onChange={e => setMissingSearch(e.target.value)}
        />
    </div>

    {/* أزرار الفرز الجديدة */}
    <div className="w-admin-controls">
        <select 
            className="w-admin-select"
            value={missingSortConfig.key}
            onChange={(e) => setMissingSortConfig({...missingSortConfig, key: e.target.value})}
        >
            <option value="count">الأكثر تكراراً</option>
            <option value="lastReported">أحدث رصد</option>
            <option value="originalName">الاسم (A-Z)</option>
        </select>

        <button 
            className="view-btn" 
            onClick={() => setMissingSortConfig(prev => ({
                ...prev, 
                direction: prev.direction === 'asc' ? 'desc' : 'asc'
            }))}
        >
            {missingSortConfig.direction === 'asc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
        </button>
    </div>
</div>

        {missingLoading ? (
            <div className="empty-state"><FaSpinner className="spinning" size={30}/></div>
        ) : (
            <div className="w-admin-table-container" style={{borderRadius: '16px', border: '1px solid #334155'}}>
                <table className="w-admin-table">
                    <thead>
                        <tr>
                            <th style={{width: '40px'}}>
                                <input 
                                    type="checkbox" 
                                    onChange={(e) => {
                                        if(e.target.checked) setSelectedMissing(sortedMissing.map(i => i.id));
                                        else setSelectedMissing([]);
                                    }}
                                    checked={sortedMissing.length > 0 && sortedMissing.every(i => selectedMissing.includes(i.id))}
                                    title="تحديد الكل (النوع الحالي فقط)"
                                />
                            </th>
                            <th>المكون</th>
                            <th style={{textAlign: 'center'}}>التكرار</th>
                            <th>آخر رصد</th>
                            <th style={{textAlign: 'left'}}>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
    {/* نستخدم هنا sortedMissing بدلاً من missingIngredients */}
    {sortedMissing.map(item => {
        const activeCount = getActiveCount(item);
        return (
            <tr key={item.id} className={selectedMissing.includes(item.id) ? 'row-selected' : ''} style={{
                backgroundColor: selectedMissing.includes(item.id) ? 'rgba(52, 211, 153, 0.05)' : 'transparent'
            }}>
                <td>
                    <input 
                        type="checkbox" 
                        checked={selectedMissing.includes(item.id)}
                        onChange={() => toggleMissingSelection(item.id)}
                    />
                </td>
                <td style={{direction:'ltr', textAlign:'right'}}>
                    <code style={{color: '#e2e8f0', fontSize: '0.95rem', background: '#1e293b', padding: '4px 8px', borderRadius: '4px'}}>
                        {item.originalName}
                    </code>
                </td>
                <td style={{textAlign: 'center'}}>
                    <span className={`growth-badge ${activeCount > 10 ? 'danger' : activeCount > 5 ? 'warning' : ''}`} 
                          style={{
                              background: activeCount > 10 ? '#ef444420' : activeCount > 5 ? '#f59e0b20' : '#3b82f620',
                              color: activeCount > 10 ? '#ef4444' : activeCount > 5 ? '#f59e0b' : '#3b82f6',
                              padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold'
                          }}>
                        {activeCount} طلب
                    </span>
                </td>
            <td style={{fontSize:'0.85rem', color:'#94a3b8'}}>
                {item.lastReported?.toDate ? item.lastReported.toDate().toLocaleDateString('ar-DZ') : '-'}
            </td>
            <td>
                <div style={{display:'flex', gap:'8px', justifyContent: 'flex-end'}}>
                    <button 
                        className="list-btn edit"
                        onClick={() => {
                            navigator.clipboard.writeText(item.originalName);
                            alert("تم النسخ: " + item.originalName);
                        }}
                        title="نسخ الاسم"
                    >
                        <FaCopy size={12}/>
                    </button>
                    <button 
                        className="list-btn edit"
                        style={{color: '#10b981', borderColor: '#10b981'}}
                        onClick={() => {
                            window.open(`https://www.google.com/search?q=${item.originalName}+cosmetic+ingredient`, '_blank');
                        }}
                        title="بحث في جوجل"
                    >
                        <FaSearch size={12}/>
                    </button>
                    <button 
                        className="list-btn notif"
                        style={{color: '#ef4444'}}
                        onClick={() => handleDismissMissing(item.id)}
                    >
                        <FaTrash size={12}/>
                    </button>
                </div>
            </td>
        </tr>
        );
    })}
</tbody>
                </table>
                {missingIngredients.length === 0 && (
                    <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>
                        <FaCheckDouble size={40} style={{marginBottom: '10px', opacity: 0.5}}/>
                        <p>قائمة المكونات المفقودة فارغة تماماً</p>
                    </div>
                )}
            </div>
        )}
    </motion.div>
)}

                {/* ================= VIEW: CONFIGURATION ================= */}
                {activeView === 'config' && (
                    configLoading ? (
                        <div className="empty-state">
                            <FaSpinner className="spinning" size={40} color="#34d399"/>
                            <span>جاري تحميل الإعدادات...</span>
                        </div>
                    ) : (
                    configData && (
                        <motion.div 
                            initial={{opacity:0, y:10}} 
                            animate={{opacity:1, y:0}} 
                            className="w-admin-config-view"
                        >
                            
                            <div style={{marginBottom: 30}}>
                                <h2 style={{margin:0, color:'white', fontSize:'1.4rem'}}>إعدادات التطبيق</h2>
                                <p style={{color:'#94a3b8', marginTop:'8px', fontSize:'0.9rem'}}>إدارة إصدارات التطبيق والإشعارات اليومية</p>
                            </div>

                            <div className="config-grid">
                                
                                {/* 1. MAINTENANCE */}
                                <div className="config-card danger-zone">
                                    <div className="card-title"><FaTools /> وضع الصيانة</div>
                                    <div className="toggle-row">
                                        <label className="switch">
                                            <input 
                                                type="checkbox" 
                                                checked={configData.maintenance_mode} 
                                                onChange={e => handleConfigChange('root', 'maintenance_mode', e.target.checked)} 
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                        <span style={{color: configData.maintenance_mode ? '#ef4444' : '#10b981', fontSize:'0.95rem'}}>
                                            {configData.maintenance_mode ? 'التطبيق مغلق' : 'التطبيق يعمل'}
                                        </span>
                                    </div>
                                    <div className="w-admin-form-group">
                                        <label>رسالة الصيانة</label>
                                        <input 
                                            className="w-admin-input"
                                            placeholder="عذراً، التطبيق قيد التطوير..."
                                            value={configData.maintenance_message || ''}
                                            onChange={e => handleConfigChange('root', 'maintenance_message', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* 2. ANDROID CONFIG */}
                                <div className="config-card">
                                    <div className="card-title"><FaAndroid /> إصدار Android</div>
                                    <div className="w-admin-form-group">
                                        <label>أحدث إصدار (Latest Version)</label>
                                        <input 
                                            className="w-admin-input" 
                                            placeholder="مثال: 2.1.0"
                                            value={configData.android?.latest_version || ''} 
                                            onChange={e => handleConfigChange('android', 'latest_version', e.target.value)} 
                                        />
                                    </div>
                                    <div className="w-admin-form-group">
                                        <label>أدنى إصدار مدعوم (Min Version)</label>
                                        <input 
                                            className="w-admin-input" 
                                            placeholder="مثال: 1.5.0"
                                            value={configData.android?.min_supported_version || ''} 
                                            onChange={e => handleConfigChange('android', 'min_supported_version', e.target.value)} 
                                        />
                                    </div>
                                    <div className="w-admin-form-group">
                                        <label>رابط المتجر/APK</label>
                                        <input 
                                            className="w-admin-input" 
                                            placeholder="https://play.google.com/..."
                                            value={configData.android?.store_url || ''} 
                                            onChange={e => handleConfigChange('android', 'store_url', e.target.value)} 
                                            dir="ltr"
                                        />
                                    </div>
                                </div>

                                {/* 3. MESSAGES */}
                                <div className="config-card">
                                    <div className="card-title"><FaBullhorn /> رسائل التحديث</div>
                                    <div className="w-admin-form-group">
                                        <label>رسالة التحديث الإجباري</label>
                                        <textarea 
                                            className="w-admin-input" 
                                            rows={3} 
                                            placeholder="هذا التحديث إجباري لاستمرار استخدام التطبيق..."
                                            value={configData.android?.critical_message || ''} 
                                            onChange={e => handleConfigChange('android', 'critical_message', e.target.value)} 
                                        />
                                    </div>
                                    <div className="w-admin-form-group">
                                        <label>رسالة التحديث الاختياري</label>
                                        <textarea 
                                            className="w-admin-input" 
                                            rows={3} 
                                            placeholder="يتضمن هذا التحديث ميزات جديدة وتحسينات..."
                                            value={configData.android?.optional_message || ''} 
                                            onChange={e => handleConfigChange('android', 'optional_message', e.target.value)} 
                                        />
                                    </div>
                                </div>

                                {/* 4. CHANGELOG */}
                                <div className="config-card">
                                    <div className="card-title"><FaList /> ما الجديد (Changelog)</div>
                                    <div className="changelog-container">
                                        <div className="changelog-list">
                                            {(configData.android?.changelog || []).length > 0 ? (
                                                (configData.android?.changelog || []).map((item, idx) => (
                                                    <motion.div 
                                                        key={idx} 
                                                        className="changelog-item"
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                    >
                                                        <div className="changelog-bullet">•</div>
                                                        <div className="changelog-text">{item}</div>
                                                        <button 
                                                            className="changelog-remove-btn"
                                                            onClick={() => handleRemoveChangelog(item)}
                                                        >
                                                            <FaTimes size={14} />
                                                        </button>
                                                    </motion.div>
                                                ))
                                            ) : (
                                                <div className="empty-changelog">
                                                    <FaList size={32} />
                                                    <span>لا توجد تحديثات مضافة</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="changelog-add-section">
                                            <input 
                                                className="changelog-input" 
                                                placeholder="أضف ميزة أو تحسين جديد..."
                                                value={newChangelogItem}
                                                onChange={e => setNewChangelogItem(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleAddChangelog()}
                                            />
                                            <button 
                                                className="changelog-add-btn" 
                                                onClick={handleAddChangelog}
                                                disabled={!newChangelogItem.trim()}
                                                style={{ opacity: newChangelogItem.trim() ? 1 : 0.6 }}
                                            >
                                                <FaPlus size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* 5. NOTIFICATION TEXTS */}
                                <div className="config-card full-width">
                                    <div className="card-title"><FaClock /> نصوص الروتين اليومي</div>
                                    <div className="gender-grid">
                                        <div className="gender-col">
                                            <h4 style={{color:'#f472b6'}}><FaFemale/> للإناث</h4>
                                            <div className="w-admin-form-group">
                                                <label>عنوان الصباح</label>
                                                <input 
                                                    className="w-admin-input" 
                                                    value={configData.notif_am_title_female || ''} 
                                                    onChange={e => handleConfigChange('root', 'notif_am_title_female', e.target.value)} 
                                                />
                                            </div>
                                            <div className="w-admin-form-group">
                                                <label>نص الصباح</label>
                                                <textarea 
                                                    className="w-admin-input" rows={2}
                                                    value={configData.notif_am_body_female || ''} 
                                                    onChange={e => handleConfigChange('root', 'notif_am_body_female', e.target.value)} 
                                                />
                                            </div>
                                            <div className="w-admin-form-group">
                                                <label>عنوان المساء</label>
                                                <input 
                                                    className="w-admin-input" 
                                                    value={configData.notif_pm_title_female || ''} 
                                                    onChange={e => handleConfigChange('root', 'notif_pm_title_female', e.target.value)} 
                                                />
                                            </div>
                                            <div className="w-admin-form-group">
                                                <label>نص المساء</label>
                                                <textarea 
                                                    className="w-admin-input" rows={2}
                                                    value={configData.notif_pm_body_female || ''} 
                                                    onChange={e => handleConfigChange('root', 'notif_pm_body_female', e.target.value)} 
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="gender-col">
                                            <h4 style={{color:'#60a5fa'}}><FaMale/> للذكور</h4>
                                            <div className="w-admin-form-group">
                                                <label>عنوان الصباح</label>
                                                <input 
                                                    className="w-admin-input" 
                                                    value={configData.notif_am_title_male || ''} 
                                                    onChange={e => handleConfigChange('root', 'notif_am_title_male', e.target.value)} 
                                                />
                                            </div>
                                            <div className="w-admin-form-group">
                                                <label>نص الصباح</label>
                                                <textarea 
                                                    className="w-admin-input" rows={2}
                                                    value={configData.notif_am_body_male || ''} 
                                                    onChange={e => handleConfigChange('root', 'notif_am_body_male', e.target.value)} 
                                                />
                                            </div>
                                            <div className="w-admin-form-group">
                                                <label>عنوان المساء</label>
                                                <input 
                                                    className="w-admin-input" 
                                                    value={configData.notif_pm_title_male || ''} 
                                                    onChange={e => handleConfigChange('root', 'notif_pm_title_male', e.target.value)} 
                                                />
                                            </div>
                                            <div className="w-admin-form-group">
                                                <label>نص المساء</label>
                                                <textarea 
                                                    className="w-admin-input" rows={2}
                                                    value={configData.notif_pm_body_male || ''} 
                                                    onChange={e => handleConfigChange('root', 'notif_pm_body_male', e.target.value)} 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* --- BOTTOM NAVIGATION BAR --- */}
            <nav className="w-admin-bottom-nav">
                <button 
                    className={`bottom-nav-item ${activeView === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveView('users')}
                >
                    <FaUsers className="nav-icon" />
                    <span className="nav-label">المستخدمين</span>
                </button>
                <button 
                    className={`bottom-nav-item ${activeView === 'config' ? 'active' : ''}`}
                    onClick={() => setActiveView('config')}
                >
                    <FaCogs className="nav-icon" />
                    <span className="nav-label">الإعدادات</span>
                </button>
                <button 
    className={`bottom-nav-item ${activeView === 'missing' ? 'active' : ''}`}
    onClick={() => setActiveView('missing')}
>
    <FaFlask className="nav-icon" />
    <span className="nav-label">المفقودة</span>
</button>
                <button 
                    className="bottom-nav-item logout"
                    onClick={handleLogout}
                >
                    <FaSignOutAlt className="nav-icon" />
                    <span className="nav-label">خروج</span>
                </button>
                
            </nav>


            {/* --- STICKY SAVE BUTTON (Config View Only) --- */}
            {activeView === 'config' && !configLoading && configData && (
                <motion.button 
                    className="w-admin-btn-primary"
                    onClick={saveConfiguration}
                    initial={{scale:0.8, opacity:0}}
                    animate={{scale:1, opacity:1}}
                    style={{
                        position: 'fixed',
                        bottom: '80px',
                        left: '20px',
                        right: '20px',
                        zIndex: 999,
                        maxWidth: '400px',
                        margin: '0 auto',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                        display: 'flex' // Changed: Always display, removed showConfigSave condition
                    }}
                >
                    <FaSave /> حفظ التغييرات
                </motion.button>
            )}

           
            {/* ================= BOTTOM SHEETS ================= */}
            <AnimatePresence>
                
                {/* 1. EDIT USER BOTTOM SHEET */}
                {editingUser && (
                    <div className="bottom-sheet-backdrop" onClick={() => setEditingUser(null)}>
                        <motion.div 
                            className="w-admin-bottom-sheet"
                            onClick={e => e.stopPropagation()}
                            initial={{y:'100%'}}
                            animate={{y:0}}
                            exit={{y:'100%'}}
                            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                        >
                            <div className="bottom-sheet-header">
                                <h3>تعديل: {editingUser.settings?.name}</h3>
                                <button onClick={() => setEditingUser(null)}><FaTimes /></button>
                            </div>
                            
                            <div className="bottom-sheet-content">
                                <div className="w-admin-tabs">
                                    {[
                                        {id:'basic', label:'الأساسية', icon: <FaUserCog />},
                                        {id:'bio', label:'الخصائص', icon: <FaUserCog />},
                                        {id:'health', label:'الصحة', icon: <FaHeartbeat />},
                                        {id:'raw', label:'البيانات', icon: <FaDatabase />}
                                    ].map(tab => (
                                        <button 
                                            key={tab.id} 
                                            className={`w-admin-tab ${activeModalTab === tab.id ? 'active' : ''}`} 
                                            onClick={() => setActiveModalTab(tab.id)}
                                        >
                                            {tab.icon} {tab.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="w-admin-tab-content">
                                    {activeModalTab === 'basic' && (
                                        <>
                                            <div className="w-admin-form-group">
                                                <label>الاسم</label>
                                                <input 
                                                    className="w-admin-input" 
                                                    value={editingUser.settings?.name || ''} 
                                                    onChange={e => handleSettingChange('name', e.target.value)} 
                                                />
                                            </div>
                                            <div className="w-admin-form-group">
                                                <label>الجنس</label>
                                                <select 
                                                    className="w-admin-input" 
                                                    value={editingUser.settings?.gender || ''} 
                                                    onChange={e => handleSettingChange('gender', e.target.value)}
                                                >
                                                    <option value="">اختر الجنس</option>
                                                    <option value="أنثى">أنثى</option>
                                                    <option value="ذكر">ذكر</option>
                                                </select>
                                            </div>
                                        </>
                                    )}
                                    {activeModalTab === 'bio' && (
                                        <>
                                            <div className="w-admin-form-group">
                                                <label>نوع البشرة</label>
                                                <input 
                                                    className="w-admin-input" 
                                                    value={editingUser.settings?.skinType || ''} 
                                                    onChange={e => handleSettingChange('skinType', e.target.value)} 
                                                />
                                            </div>
                                            <div className="w-admin-form-group">
                                                <label>نوع الشعر</label>
                                                <input 
                                                    className="w-admin-input" 
                                                    value={editingUser.settings?.hairType || ''} 
                                                    onChange={e => handleSettingChange('hairType', e.target.value)} 
                                                />
                                            </div>
                                        </>
                                    )}
                                    {activeModalTab === 'health' && (
                                        <div className="w-admin-form-group">
                                            <label>الحساسيات والأمراض</label>
                                            <div className="w-admin-tag-container">
                                                {(editingUser.settings?.allergies || []).map(alg => (
                                                    <span key={alg} className="w-admin-tag">
                                                        {alg} 
                                                        <button onClick={() => handleTagRemove(alg)}>
                                                            <FaTimes />
                                                        </button>
                                                    </span>
                                                ))}
                                                <input 
                                                    placeholder="+ إضافة حساسية" 
                                                    style={{border:'none', outline:'none', background:'transparent', color:'white', minWidth:'60px'}} 
                                                    value={newTagItem}
                                                    onChange={(e) => setNewTagItem(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleTagAdd()} 
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {activeModalTab === 'raw' && (
                                        <div className="w-admin-form-group">
                                            <label>البيانات الخام (JSON)</label>
                                            <textarea 
                                                className="w-admin-input" 
                                                rows={8} 
                                                readOnly 
                                                style={{fontSize:'0.75rem', fontFamily:'monospace', direction:'ltr'}} 
                                                value={JSON.stringify(editingUser, null, 2)} 
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bottom-sheet-actions">
                                <button 
                                    className="w-admin-btn-primary" 
                                    onClick={handleSaveProfile}
                                    style={{margin:0}}
                                >
                                    <FaCheck /> حفظ التعديلات
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* 2. PRODUCTS BOTTOM SHEET */}

                {viewingProducts && (
    <div className="bottom-sheet-backdrop" onClick={() => { setViewingProducts(null); setExpandedProductId(null); }}>
        <motion.div 
            className="w-admin-bottom-sheet"
            onClick={e => e.stopPropagation()} 
            initial={{y:'100%'}}
            animate={{y:0}}
            exit={{y:'100%'}}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        >
            <div className="bottom-sheet-header">
                <h3>منتجات: {viewingProducts.settings?.name}</h3>
                <button onClick={() => { setViewingProducts(null); setExpandedProductId(null); }}><FaTimes/></button>
            </div>
            
            <div className="bottom-sheet-content">
                {productsLoading ? (
                    <div className="empty-state"><FaSpinner className="spinning"/></div>
                ) : (
                    productsList.length > 0 ? (
                        productsList.map(p => (
                            <div key={p.id} style={{ marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div className="w-admin-product-item" style={{display:'flex', alignItems:'center', gap:'12px', padding:'10px', borderBottom:'none'}}>
                                    {p.productImage ? (
                                        <img src={p.productImage} style={{width: 45, height: 45, borderRadius: 8, objectFit: 'cover'}} alt="" />
                                    ) : (
                                        <div style={{width: 45, height: 45, borderRadius: 8, background: '#334155', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                            <FaShoppingBag size={18} color="#94a3b8" />
                                        </div>
                                    )}

                                    <div onClick={() => setExpandedProductId(expandedProductId === p.id ? null : p.id)} style={{ flex: 1, cursor: 'pointer' }}>                                        <strong style={{display:'block', marginBottom:'2px', color: '#f8fafc'}}>{p.productName}</strong>
                                        <span style={{fontSize:'0.8rem', color:'#34d399', display:'flex', alignItems:'center', gap: '5px'}}>
                                            {p.productType || 'منتج'} • {expandedProductId === p.id ? <FaChevronUp size={10}/> : <FaChevronDown size={10}/>} عرض المكونات
                                        </span>
                                    </div>

                                    <div style={{textAlign: 'left'}}>
                                        <div style={{fontSize:'0.9rem', fontWeight:'bold', color: '#34d399'}}>{p.analysisData?.oilGuardScore || '??'}%</div>
                                        <button 
                                            onClick={() => handleDeleteProduct(viewingProducts.id, p.id)} 
                                            style={{ color:'#ef4444', background:'none', border:'none', padding:'5px', cursor:'pointer' }}
                                        >
                                            <FaTrash size={12}/>
                                        </button>
                                    </div>
                                </div>

                                {/* قائمة المكونات المنسدلة */}
                                <AnimatePresence>
                                    {expandedProductId === p.id && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            style={{ overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', margin: '0 10px 10px 10px' }}
                                        >
                                            <div style={{ padding: '12px', fontSize: '0.8rem', color: '#94a3b8' }}>
                                                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#cbd5e1' }}>قائمة المكونات المكتشفة:</div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                    {p.analysisData?.detected_ingredients?.length > 0 ? (
                                                        p.analysisData.detected_ingredients.map((ing, idx) => (
                                                            <span key={idx} style={{ 
                                                                background: 'rgba(52, 211, 153, 0.1)', 
                                                                color: '#34d399', 
                                                                padding: '3px 8px', 
                                                                borderRadius: '4px',
                                                                fontSize: '0.75rem',
                                                                direction: 'ltr' 
                                                            }}>
                                                                {ing.name}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span>لا توجد بيانات مكونات مفصلة.</span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <FaShoppingBag size={40} />
                            <span>لا توجد منتجات محفوظة</span>
                        </div>
                    )
                )}
            </div>
        </motion.div>
    </div>
)}

                {/* 3. NOTIFICATION BOTTOM SHEET */}
                {(notifyingUser || showBroadcastSheet) && (
                    <div className="bottom-sheet-backdrop" onClick={() => {setNotifyingUser(null); setShowBroadcastSheet(false)}}>
                        <motion.div 
                            className="w-admin-bottom-sheet"
                            onClick={e => e.stopPropagation()}
                            initial={{y:'100%'}}
                            animate={{y:0}}
                            exit={{y:'100%'}}
                            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                        >
                            <div className="bottom-sheet-header">
                                <h3>
                                    {showBroadcastSheet ? (
                                        <><FaBullhorn /> إشعار للجميع</>
                                    ) : (
                                        <><FaBell /> إشعار فردي</>
                                    )}
                                </h3>
                                <button onClick={() => {setNotifyingUser(null); setShowBroadcastSheet(false)}}>
                                    <FaTimes/>
                                </button>
                            </div>
                            
                            <div className="bottom-sheet-content">
                                {!showBroadcastSheet && notifyingUser && (
                                    <div style={{
                                        marginBottom:20, 
                                        padding:'15px',
                                        background:'rgba(52, 211, 153, 0.1)',
                                        borderRadius:'12px',
                                        border:'1px solid rgba(52, 211, 153, 0.2)'
                                    }}>
                                        <div style={{fontSize:'0.9rem', color:'#34d399', fontWeight:'600'}}>
                                            إلى: {notifyingUser.settings?.name}
                                        </div>
                                        <div style={{fontSize:'0.8rem', color:'#94a3b8', marginTop:'4px'}}>
                                            {notifyingUser.email}
                                        </div>
                                    </div>
                                )}

                                <div className="w-admin-form-group">
                                    <label>عنوان الإشعار</label>
                                    <input 
                                        className="w-admin-input" 
                                        placeholder="مثال: تذكير هام" 
                                        value={notifData.title} 
                                        onChange={e=>setNotifData({...notifData, title:e.target.value})} 
                                    />
                                </div>
                                <div className="w-admin-form-group">
                                    <label>نص الرسالة</label>
                                    <textarea 
                                        className="w-admin-input" 
                                        rows={4} 
                                        placeholder="اكتب رسالتك هنا..." 
                                        value={notifData.body} 
                                        onChange={e=>setNotifData({...notifData, body:e.target.value})} 
                                    />
                                </div>
                            </div>

                            <div className="bottom-sheet-actions">
                                <button 
                                    className="w-admin-btn-primary" 
                                    style={{opacity: sending ? 0.7 : 1}} 
                                    onClick={() => handleSendNotification(showBroadcastSheet)} 
                                    disabled={sending}
                                >
                                    {sending ? (
                                        <>
                                            <FaSpinner className="spinning"/> جاري الإرسال...
                                        </>
                                    ) : (
                                        <>
                                            <FaPaperPlane /> إرسال الآن
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* 4. GROWTH STATS BOTTOM SHEET */}
{showGrowthSheet && (
    <div className="bottom-sheet-backdrop" onClick={() => setShowGrowthSheet(false)}>
        <motion.div 
            className="w-admin-bottom-sheet"
            onClick={e => e.stopPropagation()}
            initial={{y:'100%'}}
            animate={{y:0}}
            exit={{y:'100%'}}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        >
            <div className="bottom-sheet-header">
                <h3><FaChartLine /> نمو المستخدمين اليومي</h3>
                <button onClick={() => setShowGrowthSheet(false)}><FaTimes/></button>
            </div>
            
            <div className="bottom-sheet-content">
                <div className="w-admin-table-container">
                    <table className="w-admin-table">
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>عدد المسجلين</th>
                                <th>المؤشر</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getDailyGrowthStats().length > 0 ? (
                                getDailyGrowthStats().map((day, idx) => (
                                    <tr key={idx}>
                                        <td style={{direction: 'ltr', textAlign:'right', fontFamily:'monospace'}}>
                                            {day.date}
                                        </td>
                                        <td>
                                            <span className="growth-badge">+{day.count}</span>
                                        </td>
                                        <td style={{width: '40%'}}>
                                            <div className="growth-bar-bg">
                                                <div 
                                                    className="growth-bar-fill" 
                                                    style={{
                                                        width: `${Math.min((day.count / 10) * 100, 100)}%`
                                                    }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" style={{textAlign:'center', padding:20}}>
                                        لا توجد بيانات تواريخ متاحة
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    </div>
)}

{/* 5. GLOBAL APP STATS MODAL */}
{showStatsModal && (
    <div className="bottom-sheet-backdrop" onClick={() => setShowStatsModal(false)}>
        <motion.div 
            className="w-admin-bottom-sheet"
            onClick={e => e.stopPropagation()} 
            initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}}
            style={{maxHeight: '85vh'}}
        >
            <div className="bottom-sheet-header">
                <h3><FaChartPie /> إحصائيات التطبيق الشاملة</h3>
                <button onClick={() => setShowStatsModal(false)}><FaTimes/></button>
            </div>
            
            <div className="bottom-sheet-content" style={{ padding: '20px' }}>
    
    {/* الخلاصة الكبرى */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <div style={{ background: '#1e293b', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>المنتجات المفحوصة</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#34d399' }}>{totalSavedProducts}</div>
        </div>
        <div style={{ background: '#1e293b', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>المستخدمين</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#60a5fa' }}>{users.length}</div>
        </div>
    </div>

    <div className="config-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        
        {/* قسم الأهداف - الأكثر طلباً */}
        <div className="config-card" style={{ margin: 0 }}>
            <div className="card-title" style={{ fontSize: '0.85rem', color: '#34d399' }}>🎯 أهداف العناية</div>
            {Object.entries(appStats.goals).sort((a,b) => b[1] - a[1]).map(([label, count]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{label}</span>
                    <span style={{ color: '#f1f5f9', fontWeight: 'bold' }}>{count}</span>
                </div>
            ))}
        </div>

        {/* قسم المشاكل الصحية */}
        <div className="config-card" style={{ margin: 0 }}>
            <div className="card-title" style={{ fontSize: '0.85rem', color: '#fbbf24' }}>⚠️ مشاكل وحالات</div>
            {Object.entries(appStats.conditions).sort((a,b) => b[1] - a[1]).map(([label, count]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{label}</span>
                    <span style={{ color: '#f1f5f9', fontWeight: 'bold' }}>{count}</span>
                </div>
            ))}
        </div>

        {/* أنواع البشرة */}
        <div className="config-card" style={{ margin: 0 }}>
            <div className="card-title" style={{ fontSize: '0.85rem', color: '#60a5fa' }}>🧴 أنواع البشرة</div>
            {Object.entries(appStats.skinTypes).map(([type, count]) => (
                <div key={type} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{type}</span>
                    <span style={{ color: '#f1f5f9', fontWeight: 'bold' }}>{count}</span>
                </div>
            ))}
        </div>

        {/* أنواع الفروة */}
        <div className="config-card" style={{ margin: 0 }}>
            <div className="card-title" style={{ fontSize: '0.85rem', color: '#a78bfa' }}>💇‍♂️ أنواع الفروة</div>
            {Object.entries(appStats.hairTypes).map(([type, count]) => (
                <div key={type} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{type}</span>
                    <span style={{ color: '#f1f5f9', fontWeight: 'bold' }}>{count}</span>
                </div>
            ))}
        </div>

        {/* الحساسيات */}
        <div className="config-card" style={{ margin: 0 }}>
            <div className="card-title" style={{ fontSize: '0.85rem', color: '#f87171' }}>🚫 الحساسيات</div>
            {Object.entries(appStats.allergies).sort((a,b) => b[1] - a[1]).map(([label, count]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{label}</span>
                    <span style={{ color: '#f1f5f9', fontWeight: 'bold' }}>{count}</span>
                </div>
            ))}
        </div>

        {/* إحصائيات الجنس */}
        <div className="config-card" style={{ margin: 0 }}>
            <div className="card-title" style={{ fontSize: '0.85rem', color: '#f472b6' }}>👥 النوع</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>إناث</span>
                <span style={{ color: '#f472b6', fontWeight: 'bold' }}>{appStats.genders['أنثى']}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>ذكور</span>
                <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{appStats.genders['ذكر']}</span>
            </div>
        </div>

        {/* قسم ذكاء الأعمال - Business Intelligence */}
        <div style={{ marginTop: '30px', borderTop: '2px solid #34d399', paddingTop: '20px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
            <h4 style={{ color: '#34d399', margin: 0, fontSize: '1.1rem' }}>📊 Strategic Market Intelligence</h4>
            <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px' }}>بيانات استراتيجية لشركات الإنتاج والمختبرات</p>
        </div>
        <div style={{ background: '#34d39920', color: '#34d399', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold' }}>
            Internal API v2.0
        </div>
    </div>

    {/* 1. The Gold Segment (High Intent Consumers) */}
    <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '20px', borderRadius: '15px', border: '1px solid #334155', marginBottom: '20px' }}>
        <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>High-Value Target Segment (HVT)</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '10px' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 'bold', color: '#f1f5f9' }}>{businessIntelligence.highValueSegments.sensitivePremium}</span>
            <span style={{ color: '#34d399', fontSize: '0.9rem', fontWeight: 'bold' }}>مستهدف عالي الربحية</span>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '10px', lineHeight: '1.4' }}>
            هذه الفئة تمثل العملاء الذين لديهم "مشكلة + هدف + حساسية". هم الأكثر بحثاً عن منتجات طبية غالية الثمن والأكثر ولاءً للعلامات التجارية التي تحل مشاكلهم.
        </p>
    </div>

    {/* 2. R&D Directives: Top Avoidance Table */}
    <div className="config-card" style={{ background: 'transparent', border: '1px solid rgba(248, 113, 113, 0.2)', marginBottom: '20px' }}>
        <div className="card-title" style={{ fontSize: '0.85rem', color: '#f87171' }}>🚫 مؤشر الحظر (Formulation Constraints)</div>
        <p style={{ color: '#64748b', fontSize: '0.7rem', marginBottom: '12px' }}>أكثر المكونات التي تمنع المستخدمين من شراء المنتجات حالياً:</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {Object.entries(businessIntelligence.formulationRisk.topAvoidanceList).sort((a,b) => b[1] - a[1]).slice(0, 4).map(([label, count]) => (
                <div key={label} style={{ background: 'rgba(248, 113, 113, 0.05)', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#fca5a5', fontSize: '0.75rem' }}>{label}</span>
                    <span style={{ color: '#f1f5f9', fontWeight: 'bold', fontSize: '0.8rem' }}>{count} شخص</span>
                </div>
            ))}
        </div>
    </div>

    {/* 3. Market Gap: Therapeutic Intersects */}
    <div className="config-card" style={{ background: 'transparent', border: '1px solid #3b82f630' }}>
        <div className="card-title" style={{ fontSize: '0.85rem', color: '#60a5fa' }}>🧪 فجوات السوق (الحالة المرضية ← الهدف التجميلي)</div>
        <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
            {Object.entries(businessIntelligence.therapeuticIntersects).map(([condition, goals]) => {
                const topGoal = Object.entries(goals).sort((a,b) => b[1] - a[1])[0];
                if (!topGoal) return null;
                return (
                    <div key={condition} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ color: '#f1f5f9', fontSize: '0.85rem', fontWeight: 'bold' }}>{condition}</span>
                            <span style={{ color: '#60a5fa', fontSize: '0.8rem' }}>{topGoal[1]} طلب نشط</span>
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                            أكبر فجوة إنتاجية لهذه الفئة هي منتجات: <span style={{ color: '#93c5fd' }}>{topGoal[0]}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>

    {/* 4. Strategic Recommendation (The Pitch) */}
    <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(52, 211, 153, 0.05)', borderRadius: '12px', borderLeft: '4px solid #34d399' }}>
        <div style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '5px' }}>💡 التوصية الاستراتيجية (Executive Summary):</div>
        <div style={{ color: '#f1f5f9', fontSize: '0.8rem', lineHeight: '1.6' }}>
            بناءً على تداخل البيانات، يوجد عجز بنسبة عالية في المنتجات التي تعالج 
            <span style={{ color: '#34d399', fontWeight: 'bold' }}> "{Object.keys(businessIntelligence.therapeuticIntersects)[0]}" </span> 
            وتحقق في نفس الوقت هدف 
            <span style={{ color: '#34d399', fontWeight: 'bold' }}> "{Object.entries(Object.values(businessIntelligence.therapeuticIntersects)[0] || {}).sort((a,b) => b[1]-a[1])[0]?.[0]}" </span>.
            نوصي المختبرات الشريكة بتوجيه خطوط الإنتاج القادمة لهذه الفئة لضمان أعلى معدل تحويل مبيعات.
        </div>
    </div>
</div>

        {/* قسم تحليل الشبكة - علاقات البيانات */}
<div style={{ marginTop: '25px', borderTop: '1px solid #334155', paddingTop: '20px' }}>
    <div className="card-title" style={{ color: '#34d399', fontSize: '1rem', marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
        <span><FaChartLine /> أقوى الارتباطات في الشبكة</span>
        <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'normal' }}>أعلى 20 علاقة</span>
    </div>
    
    {/* حاوية التمرير (Scroll Container) */}
    <div style={{ 
        maxHeight: '400px', 
        overflowY: 'auto', 
        paddingRight: '8px',
        display: 'flex', 
        flexDirection: 'column', 
        gap: '10px',
        /* تخصيص شكل السكرول بار للمتصفحات */
        scrollbarWidth: 'thin',
        scrollbarColor: '#334155 transparent'
    }}>
        {networkInsights.map((insight, idx) => (
            <div 
                key={idx} 
                style={{ 
                    background: 'rgba(30, 41, 59, 0.7)', 
                    padding: '12px 15px', 
                    borderRadius: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid rgba(255,255,255,0.03)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, flexWrap: 'wrap' }}>
                    <span style={{ 
                        color: '#f1f5f9', 
                        fontSize: '0.8rem', 
                        fontWeight: '500',
                        background: 'rgba(52, 211, 153, 0.1)',
                        padding: '2px 8px',
                        borderRadius: '5px',
                        whiteSpace: 'nowrap'
                    }}>
                        {insight.labels[0]}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '0.65rem' }}>↔</span>
                    <span style={{ 
                        color: '#f1f5f9', 
                        fontSize: '0.8rem', 
                        fontWeight: '500',
                        background: 'rgba(96, 165, 250, 0.1)',
                        padding: '2px 8px',
                        borderRadius: '5px',
                        whiteSpace: 'nowrap'
                    }}>
                        {insight.labels[1]}
                    </span>
                </div>
                
                <div style={{ textAlign: 'left', minWidth: '60px', marginLeft: '10px' }}>
                    <span style={{ color: '#34d399', fontWeight: 'bold', fontSize: '0.95rem' }}>
                        {insight.count}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '0.65rem', marginRight: '4px' }}>مستخدم</span>
                </div>
            </div>
        ))}
    </div>
    
    {/* نص توضيحي ثابت أسفل السكرول */}
    <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(251, 191, 36, 0.05)', borderRadius: '8px', border: '1px dashed rgba(251, 191, 36, 0.2)' }}>
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#fbbf24', textAlign: 'center' }}>
            💡 تظهر هذه القائمة الأنماط السلوكية الأكثر تكراراً بين جميع المستخدمين.
        </p>
    </div>
</div>

    </div>
</div>
        </motion.div>
    </div>
)}

{showDuplicatesSheet && (
  <div className="bottom-sheet-backdrop" onClick={() => setShowDuplicatesSheet(false)}>
    <motion.div 
      className="w-admin-bottom-sheet"
      onClick={e => e.stopPropagation()}
      initial={{y:'100%'}}
      animate={{y:0}}
      exit={{y:'100%'}}
      transition={{ type: 'spring', damping: 30, stiffness: 400 }}
      style={{ maxHeight: '80vh' }}
    >
      <div className="bottom-sheet-header">
        <h3><FaTools /> الرموز المكررة</h3>
        <button onClick={() => setShowDuplicatesSheet(false)}><FaTimes/></button>
      </div>
      
      <div className="bottom-sheet-content">
        {duplicatesLoading ? (
          <div className="empty-state">
            <FaSpinner className="spinning"/>
            <span>جاري البحث عن الرموز المكررة...</span>
          </div>
        ) : duplicateTokens.length === 0 ? (
          <div className="empty-state success">
            <FaCheck size={40} color="#10b981" />
            <span>✅ لا توجد رموز مكررة</span>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '10px' }}>
              جميع الرموز فريدة لدى المستخدمين
            </p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#ef4444' }}>⚠️ مشكلة</h4>
                  <p style={{ margin: '5px 0 0 0', color: '#fca5a5', fontSize: '0.9rem' }}>
                    {duplicateTokens.length} رمز مكرر
                  </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', color: '#ef4444', fontWeight: 'bold' }}>
                    {duplicateTokens.reduce((sum, dup) => sum + dup.count, 0) - duplicateTokens.length}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#fca5a5' }}>إشعارات خاطئة</div>
                </div>
              </div>
            </div>
            
            {/* List of duplicates */}
            <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
              {duplicateTokens.map((dup, index) => (
                <div key={index} className="duplicate-token-card">
                  <div className="duplicate-token-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        width: '24px',
                        height: '24px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem'
                      }}>
                        {dup.count}
                      </div>
                      <div>
                        <div style={{ 
                          fontFamily: 'monospace', 
                          fontSize: '0.8rem', 
                          color: '#cbd5e1',
                          direction: 'ltr',
                          textAlign: 'right'
                        }}>
                          {dup.token.substring(0, 30)}...
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {dup.count} مستخدم
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="duplicate-users-list">
                    {dup.users.map(user => (
                      <div key={user.id} className="duplicate-user-item">
                        <div className="user-avatar-small">
                          {user.settings?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="user-info-small">
                          <div style={{ fontWeight: 'bold', color: '#f1f5f9' }}>
                            {user.settings?.name || 'بدون اسم'}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            {user.email}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {formatLastSeen(user.lastSeen)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Fix Button */}
            <button
              onClick={async () => {
                if (window.confirm(`هل تريد إصلاح ${duplicateTokens.length} رمز مكرر؟\nسيتم حذف الرموز من المستخدمين الأقل نشاطاً.`)) {
                  await fixDuplicateTokens();
                  setShowDuplicatesSheet(false);
                }
              }}
              className="w-admin-btn-primary"
              style={{ 
                backgroundColor: '#ef4444',
                borderColor: '#ef4444',
                marginTop: '20px',
                width: '100%'
              }}
            >
              <FaTools /> إصلاح الرموز المكررة تلقائياً
            </button>
          </>
        )}
      </div>
    </motion.div>
  </div>
)}

{/* HEALTH CHECK RESULTS SHEET */}
{showHealthCheck && healthCheckResults && (
  <div className="bottom-sheet-backdrop" onClick={() => setShowHealthCheck(false)}>
    <motion.div 
      className="w-admin-bottom-sheet"
      onClick={e => e.stopPropagation()}
      initial={{y:'100%'}}
      animate={{y:0}}
      exit={{y:'100%'}}
      transition={{ type: 'spring', damping: 30, stiffness: 400 }}
      style={{ maxHeight: '85vh', maxWidth: '700px', margin: '0 auto' }}
    >
      <div className="bottom-sheet-header">
        <h3><FaHeartbeat /> تقرير صحة البيانات</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          {healthCheckResults.timestamp.toLocaleString('ar-DZ')}
          </span>
          <button onClick={() => setShowHealthCheck(false)}><FaTimes/></button>
        </div>
      </div>
      
      <div className="bottom-sheet-content" style={{ padding: '20px' }}>
        
        {/* SUMMARY CARD */}
        <div style={{
          background: healthCheckResults.summary.totalIssues === 0 
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))'
            : healthCheckResults.summary.bySeverity.critical > 0
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))'
            : 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))',
          border: healthCheckResults.summary.totalIssues === 0 
            ? '1px solid rgba(16, 185, 129, 0.3)'
            : healthCheckResults.summary.bySeverity.critical > 0
            ? '1px solid rgba(239, 68, 68, 0.3)'
            : '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '25px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ 
                margin: 0, 
                color: healthCheckResults.summary.totalIssues === 0 ? '#10b981' : 
                       healthCheckResults.summary.bySeverity.critical > 0 ? '#ef4444' : '#f59e0b'
              }}>
                {healthCheckResults.summary.totalIssues === 0 ? '✅ صحة ممتازة' :
                 healthCheckResults.summary.bySeverity.critical > 0 ? '🚨 مشاكل حرجة' : '⚠️ يحتاج تحسين'}
              </h4>
              <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                آخر فحص:   {healthCheckResults.timestamp.toLocaleString('ar-DZ')}  // ← Convert to string!

              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '2.5rem', 
                fontWeight: 'bold',
                color: healthCheckResults.summary.totalIssues === 0 ? '#10b981' : 
                       healthCheckResults.summary.bySeverity.critical > 0 ? '#ef4444' : '#f59e0b'
              }}>
                {healthCheckResults.summary.totalIssues}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>مشكلة</div>
            </div>
          </div>
          
          {/* Severity Breakdown */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px dashed rgba(255,255,255,0.1)'
          }}>
            {Object.entries(healthCheckResults.summary.bySeverity).map(([severity, count]) => {
              if (count === 0) return null;
              const colors = {
                critical: '#ef4444',
                high: '#f97316',
                medium: '#f59e0b',
                low: '#3b82f6'
              };
              const labels = {
                critical: 'حرجة',
                high: 'عالية',
                medium: 'متوسطة',
                low: 'منخفضة'
              };
              
              return (
                <div key={severity} style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold',
                    color: colors[severity]
                  }}>
                    {count}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    {labels[severity]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* ISSUES BY CATEGORY */}
       {/* ISSUES BY CATEGORY - EXPANDABLE VERSION */}
{/* ISSUES BY CATEGORY - FULL EXPANDABLE VERSION */}
{Object.entries(healthCheckResults.issues).map(([category, issues]) => {
  if (!issues || issues.length === 0) return null;
  
  const categoryColors = {
    CRITICAL: '#ef4444',
    FCM_DUPLICATE: '#f97316',
    DATA_QUALITY: '#f59e0b',
    QUEUE: '#3b82f6',
    CONFIG: '#8b5cf6',
    SYSTEM: '#64748b',
    TEST: '#10b981'
  };
  
  const categoryNames = {
    CRITICAL: 'مشاكل حرجة',
    FCM_DUPLICATE: 'رموز FCM مكررة',
    DATA_QUALITY: 'جودة البيانات',
    QUEUE: 'طابور الإشعارات',
    CONFIG: 'إعدادات التطبيق',
    SYSTEM: 'أخطاء النظام',
    TEST: 'اختبار'
  };
  
  const isExpanded = expandedSections[category];
  
  return (
    <div key={category} id={`category-${category}`} style={{
      marginBottom: '20px',
      border: `1px solid ${categoryColors[category]}20`,
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      <div 
        style={{
          backgroundColor: `${categoryColors[category]}20`,
          padding: '12px 15px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer'
        }}
        onClick={() => toggleSection(category)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h5 style={{ margin: 0, color: categoryColors[category] }}>
            {categoryNames[category]} ({issues.length})
          </h5>
          {!isExpanded && issues.length > 3 && (
            <span style={{
              fontSize: '0.7rem',
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: '2px 8px',
              borderRadius: '10px',
              color: '#94a3b8'
            }}>
              +{issues.length - 3} مخفي
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            backgroundColor: categoryColors[category],
            color: 'white',
            width: '24px',
            height: '24px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem'
          }}>
            {issues.length}
          </div>
          <FaChevronDown style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s',
            color: categoryColors[category]
          }} />
        </div>
      </div>
      
      <div style={{ 
        padding: isExpanded ? '20px' : '15px', 
        backgroundColor: 'rgba(0,0,0,0.1)',
        maxHeight: isExpanded ? '500px' : 'none',
        overflowY: isExpanded ? 'auto' : 'visible'
      }}>
        {/* SHOW ALL ISSUES - NO CROPPING */}
        {issues.map((issue, idx) => {
          // Find user details
          const foundUser = users.find(u => u.id === issue.user);
          
          return (
            <div key={idx} style={{
              padding: '15px',
              marginBottom: '15px',
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '10px',
              borderLeft: `4px solid ${categoryColors[category]}`,
              border: isExpanded ? `1px solid ${categoryColors[category]}30` : 'none'
            }}>
              {/* Issue Header */}
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    color: '#f1f5f9', 
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    marginBottom: '4px'
                  }}>
                    {String(issue.message || 'No message')}
                  </div>
                  <div style={{ 
                    color: '#94a3b8', 
                    fontSize: '0.8rem',
                    display: 'flex',
                    gap: '15px',
                    flexWrap: 'wrap'
                  }}>
                    {issue.timestamp && (
                      <span>
                        <FaClock size={12} style={{ marginRight: '4px' }} />
                        {new Date(issue.timestamp).toLocaleString('ar-DZ')}
                      </span>
                    )}
                    {issue.createdAt && (
                      <span>
                        <FaCalendarPlus size={12} style={{ marginRight: '4px' }} />
                        إنشاء: {new Date(issue.createdAt).toLocaleDateString('ar-DZ')}
                      </span>
                    )}
                    {issue.lastModified && (
                      <span>
                        <FaEdit size={12} style={{ marginRight: '4px' }} />
                        تعديل: {new Date(issue.lastModified).toLocaleDateString('ar-DZ')}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {foundUser && (
                    <button
                      onClick={() => {
                        setEditingUser(JSON.parse(JSON.stringify(foundUser)));
                        setShowHealthCheck(false);
                      }}
                      style={{
                        background: 'none',
                        border: '1px solid #3b82f6',
                        color: '#3b82f6',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <FaEdit size={12} /> تعديل
                    </button>
                  )}
                  
                  {issue.type === 'FCM_DUPLICATE' && (
                    <button
                      onClick={() => {
                        // Show duplicate tokens sheet
                        setShowHealthCheck(false);
                        setTimeout(() => {
                          setDuplicateTokens([{
                            token: issue.token,
                            users: issue.users,
                            count: issue.count
                          }]);
                          setShowDuplicatesSheet(true);
                        }, 300);
                      }}
                      style={{
                        background: 'none',
                        border: '1px solid #f97316',
                        color: '#f97316',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <FaTools size={12} /> إصلاح
                    </button>
                  )}
                </div>
              </div>
              
              {/* User Details Section */}
              {issue.user && (
                <div style={{
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '12px'
                }}>
                  <div style={{ 
                    color: '#cbd5e1', 
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FaUserCog /> بيانات المستخدم
                  </div>
                  
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '12px'
                  }}>
                    {/* Basic Info */}
                    <div style={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.5)',
                      padding: '10px',
                      borderRadius: '6px'
                    }}>
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>المعلومات الأساسية</div>
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>المعرف:</span>
                          <span style={{ 
                            color: '#f1f5f9', 
                            fontFamily: 'monospace',
                            fontSize: '0.8rem'
                          }}>
                            {String(issue.user)}
                          </span>
                        </div>
                        
                        {foundUser?.settings?.name && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>الاسم:</span>
                            <span style={{ color: '#f1f5f9', fontSize: '0.85rem' }}>
                              {foundUser.settings.name}
                            </span>
                          </div>
                        )}
                        
                        {foundUser?.email && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>البريد:</span>
                            <span style={{ color: '#f1f5f9', fontSize: '0.85rem' }}>
                              {foundUser.email}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Dates Info */}
                    <div style={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.5)',
                      padding: '10px',
                      borderRadius: '6px'
                    }}>
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>التواريخ</div>
                      <div style={{ marginTop: '8px' }}>
                        {foundUser?.createdAt && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>تاريخ الإنشاء:</span>
                            <span style={{ color: '#f1f5f9', fontSize: '0.8rem' }}>
                              {foundUser.createdAt.toDate ? 
                                foundUser.createdAt.toDate().toLocaleString('ar-DZ') : 
                                new Date(foundUser.createdAt).toLocaleString('ar-DZ')}
                            </span>
                          </div>
                        )}
                        
                        {foundUser?.lastSeen && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>آخر ظهور:</span>
                            <span style={{ color: '#f1f5f9', fontSize: '0.8rem' }}>
                              {foundUser.lastSeen.toDate ? 
                                foundUser.lastSeen.toDate().toLocaleString('ar-DZ') : 
                                new Date(foundUser.lastSeen).toLocaleString('ar-DZ')}
                            </span>
                          </div>
                        )}
                        
                        {foundUser?.lastTokenUpdate && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>آخر تحديث رمز:</span>
                            <span style={{ color: '#f1f5f9', fontSize: '0.8rem' }}>
                              {foundUser.lastTokenUpdate.toDate ? 
                                foundUser.lastTokenUpdate.toDate().toLocaleString('ar-DZ') : 
                                new Date(foundUser.lastTokenUpdate).toLocaleString('ar-DZ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Status Info */}
                    <div style={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.5)',
                      padding: '10px',
                      borderRadius: '6px'
                    }}>
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>الحالة</div>
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>التسجيل:</span>
                          <span style={{ 
                            color: foundUser?.onboardingComplete ? '#10b981' : '#ef4444',
                            fontSize: '0.85rem'
                          }}>
                            {foundUser?.onboardingComplete ? '✅ مكتمل' : '❌ غير مكتمل'}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>الإشعارات:</span>
                          <span style={{ 
                            color: foundUser?.notificationsEnabled ? '#10b981' : '#ef4444',
                            fontSize: '0.85rem'
                          }}>
                            {foundUser?.notificationsEnabled ? '✅ مفعلة' : '❌ معطلة'}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>رمز FCM:</span>
                          <span style={{ 
                            color: foundUser?.fcmToken ? '#10b981' : '#ef4444',
                            fontSize: '0.85rem'
                          }}>
                            {foundUser?.fcmToken ? '✅ موجود' : '❌ مفقود'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Raw Data View */}
                  <div style={{ marginTop: '15px' }}>
                    <button
                      onClick={() => {
                        setActiveModalTab('raw');
                        setEditingUser(JSON.parse(JSON.stringify(foundUser)));
                        setShowHealthCheck(false);
                      }}
                      style={{
                        background: 'none',
                        border: '1px solid #8b5cf6',
                        color: '#8b5cf6',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <FaDatabase size={12} /> عرض البيانات الخام
                    </button>
                  </div>
                </div>
              )}
              
              {/* Issue Metadata */}
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap',
                gap: '10px',
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px dashed rgba(255,255,255,0.1)'
              }}>
                {issue.field && (
                  <span style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    color: '#93c5fd',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <FaTag size={10} /> الحقل: {issue.field}
                  </span>
                )}
                
                {issue.count && (
                  <span style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    color: '#fca5a5',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <FaHashtag size={10} /> العدد: {issue.count}
                  </span>
                )}
                
                {issue.token && (
                  <span style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    color: '#fcd34d',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'monospace'
                  }}>
                    <FaKey size={10} /> الرمز: {String(issue.token).substring(0, 30)}...
                  </span>
                )}
                
                {issue.notificationId && (
                  <span style={{
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    color: '#c4b5fd',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'monospace'
                  }}>
                    <FaBell size={10} /> الإشعار: {String(issue.notificationId).substring(0, 20)}...
                  </span>
                )}
              </div>
              
              {/* Full Issue Data (Debug View) */}
              {isExpanded && (
                <div style={{
                  marginTop: '15px',
                  padding: '12px',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  borderRadius: '8px',
                  border: '1px dashed rgba(255,255,255,0.1)'
                }}>
                  <div style={{ 
                    color: '#94a3b8', 
                    fontSize: '0.8rem',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <FaCode /> البيانات الكاملة للمشكلة:
                  </div>
                  <pre style={{
                    color: '#cbd5e1',
                    fontSize: '0.7rem',
                    margin: 0,
                    padding: '10px',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    borderRadius: '6px',
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    maxHeight: '200px'
                  }}>
                    {JSON.stringify(issue, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
        
        {/* Show More/Less Button */}
        {issues.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '15px'
          }}>
            <button
              onClick={() => toggleSection(category)}
              style={{
                background: 'none',
                border: `1px solid ${categoryColors[category]}`,
                color: categoryColors[category],
                padding: '8px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem'
              }}
            >
              {isExpanded ? (
                <>
                  <FaChevronUp /> إخفاء التفاصيل
                </>
              ) : (
                <>
                  <FaChevronDown /> إظهار جميع التفاصيل ({issues.length})
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
})}
        
        {/* STATISTICS */}
        <div style={{
          backgroundColor: 'rgba(30, 41, 59, 0.5)',
          borderRadius: '12px',
          padding: '20px',
          marginTop: '20px'
        }}>
          <h5 style={{ margin: '0 0 15px 0', color: '#cbd5e1' }}>📊 إحصائيات المستخدمين</h5>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '15px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', color: '#3b82f6', fontWeight: 'bold' }}>
                {healthCheckResults.stats.totalUsers}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>إجمالي المستخدمين</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', color: '#10b981', fontWeight: 'bold' }}>
                {healthCheckResults.stats.usersWithFCM}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>لديهم رمز FCM</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', color: '#f59e0b', fontWeight: 'bold' }}>
                {healthCheckResults.stats.usersActiveToday}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>نشطون اليوم</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', color: '#8b5cf6', fontWeight: 'bold' }}>
                {healthCheckResults.stats.usersIncompleteOnboarding}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>قيد التسجيل</div>
            </div>
          </div>
        </div>
        
        {/* ACTIONS */}
        <div style={{ marginTop: '25px', display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              setShowHealthCheck(false);
              findDuplicateTokens(); // Go to duplicates if any exist
            }}
            className="w-admin-btn-primary"
            style={{ flex: 1, backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
            disabled={!healthCheckResults.issues.FCM_DUPLICATE?.length}
          >
            <FaTools /> إصلاح الرموز المكررة
          </button>
          <button
            onClick={() => setShowHealthCheck(false)}
            className="w-admin-btn-primary"
            style={{ flex: 1, backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}
          >
            <FaCheck /> حسناً
          </button>
        </div>
      </div>
    </motion.div>
  </div>
)}
            </AnimatePresence>
        </div>
    );
};

export default WathiqAdmin;