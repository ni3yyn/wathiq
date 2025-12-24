import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { 
    collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, 
    query, orderBy, getDocs, Timestamp, setDoc 
} from 'firebase/firestore';
import { 
    FaSearch, FaEdit, FaBell, FaPaperPlane, FaTimes, FaCheck, FaList,
    FaSpinner, FaUsers, FaMobileAlt, FaShoppingBag, FaTrash, 
    FaBullhorn, FaCogs, FaAndroid, FaTools, FaClock, FaSave, 
    FaMale, FaFemale, FaSignOutAlt, FaPlus, FaUserCog,
    FaArrowDown, FaDatabase, FaHeartbeat
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '../WathiqAdmin.css';

const WathiqAdmin = () => {
    // --- Auth State ---
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPass, setLoginPass] = useState('');

    // --- UI State ---
    const [activeView, setActiveView] = useState('users');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [pullToRefresh, setPullToRefresh] = useState(false);
    
    // --- Data State ---
    const [users, setUsers] = useState([]);
    const [configData, setConfigData] = useState(null);
    const [configLoading, setConfigLoading] = useState(false);

    // --- Bottom Sheets State ---
    const [editingUser, setEditingUser] = useState(null);
    const [notifyingUser, setNotifyingUser] = useState(null);
    const [showBroadcastSheet, setShowBroadcastSheet] = useState(false);
    const [viewingProducts, setViewingProducts] = useState(null);
    const [showConfigSave, setShowConfigSave] = useState(false);
    
    const [productsList, setProductsList] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    
    const [activeModalTab, setActiveModalTab] = useState('basic');
    const [notifData, setNotifData] = useState({ title: '', body: '' });
    const [sending, setSending] = useState(false);
    
    // --- Inputs for Arrays ---
    const [newChangelogItem, setNewChangelogItem] = useState('');
    const [newTagItem, setNewTagItem] = useState('');

    // --- Refs ---
    const touchStartY = useRef(0);
    const contentRef = useRef(null);

    // ------------------------------------------------------------------
    // 0. AUTH & INITIALIZATION
    // ------------------------------------------------------------------
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

    // Fetch Users
    useEffect(() => {
        if (!user) return;
        const unsub = onSnapshot(collection(db, "profiles"), (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(list);
            setLoading(false);
            setPullToRefresh(false);
        }, (error) => {
            console.error("Users Error:", error);
            alert("خطأ في جلب المستخدمين. تحقق من الكونسول.");
            setPullToRefresh(false);
        });
        return () => unsub();
    }, [user]);

    // Fetch Config
    useEffect(() => {
        if (!user) return;
        const unsub = onSnapshot(doc(db, "app_config", "version_control"), (docSnap) => {
            if (docSnap.exists()) {
                setConfigData(docSnap.data());
            } else {
                // Default Config Structure
                setConfigData({
                    maintenance_mode: false,
                    maintenance_message: 'التطبيق قيد الصيانة حالياً. نعود قريباً!',
                    android: { 
                        latest_version: '1.0.0', 
                        min_supported_version: '1.0.0', 
                        store_url: '',
                        changelog: [],
                        critical_message: '',
                        optional_message: ''
                    },
                    notif_am_title_female: '', 
                    notif_am_body_female: '',
                    notif_pm_title_female: '', 
                    notif_pm_body_female: '',
                    notif_am_title_male: '', 
                    notif_am_body_male: '',
                    notif_pm_title_male: '', 
                    notif_pm_body_male: ''
                });
            }
            setConfigLoading(false);
        });
        return () => unsub();
    }, [user]);

    // Scroll to show save button
    useEffect(() => {
        const contentElement = contentRef.current;
        
        const handleScroll = () => {
            if (activeView === 'config' && contentElement) {
                const scrollTop = contentElement.scrollTop;
                // Show button when scrolled down 100px
                setShowConfigSave(scrollTop > 100);
            }
        };
    
        if (contentElement) {
            contentElement.addEventListener('scroll', handleScroll);
            // Initialize on mount
            handleScroll();
        }
        
        return () => {
            if (contentElement) {
                contentElement.removeEventListener('scroll', handleScroll);
            }
        };
    }, [activeView]);

    // ------------------------------------------------------------------
    // 1. ACTIONS
    // ------------------------------------------------------------------
    
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

    // --- Config Actions ---
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

    // --- User Actions ---
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

    const handleSettingChange = (field, value) => {
        setEditingUser(prev => ({
            ...prev,
            settings: { ...prev.settings, [field]: value }
        }));
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

    // --- Product Actions ---
    const fetchUserProducts = async (userId) => {
        setProductsLoading(true);
        setProductsList([]);
        try {
            const q = query(collection(db, 'profiles', userId, 'savedProducts'), orderBy('addedAt', 'desc'));
            const snap = await getDocs(q);
            setProductsList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {
            console.error(e);
        } finally {
            setProductsLoading(false);
        }
    };

    const handleDeleteProduct = async (userId, productId) => {
        if(!window.confirm("حذف هذا المنتج من قائمة المستخدم؟")) return;
        try {
            await deleteDoc(doc(db, 'profiles', userId, 'savedProducts', productId));
            setProductsList(prev => prev.filter(p => p.id !== productId));
        } catch (e) {
            alert("فشل الحذف");
        }
    };

    // --- Notification Actions ---
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

    // --- Touch Handlers ---
    const handleTouchStart = (e) => {
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
        if (!contentRef.current) return;
        
        const touchY = e.touches[0].clientY;
        const diff = touchY - touchStartY.current;
        const scrollTop = contentRef.current.scrollTop;

        // Pull to refresh when at top
        if (scrollTop === 0 && diff > 50 && !pullToRefresh) {
            setPullToRefresh(true);
            // Simulate refresh by re-fetching
            setTimeout(() => setPullToRefresh(false), 1000);
        }
    };

    // ------------------------------------------------------------------
    // 2. RENDER HELPERS
    // ------------------------------------------------------------------
    
    const filteredUsers = users.filter(u => 
        (u.settings?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.includes(searchTerm)
    );

    // ------------------------------------------------------------------
    // 3. MAIN RENDER
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
                    <span className="w-admin-badge-beta">v2.1 Live</span>
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
                        
                        {/* Stats & Search */}
                        <div className="w-admin-stats-row">
                            <div className="stat-card primary" onClick={() => setShowBroadcastSheet(true)}>
                                <div className="stat-icon"><FaBullhorn /></div>
                                <div className="stat-info">
                                    <h3>إشعار جماعي</h3>
                                    <span>اضغط للإرسال للكل</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon"><FaUsers /></div>
                                <div className="stat-info"><h3>{users.length}</h3><span>مستخدم</span></div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon"><FaMobileAlt /></div>
                                <div className="stat-info"><h3>{users.filter(u => u.fcmToken).length}</h3><span>أجهزة نشطة</span></div>
                            </div>
                        </div>

                        <div className="w-admin-search-bar">
                            <FaSearch />
                            <input 
                                placeholder="بحث بالاسم، البريد، أو المعرف..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && <FaTimes style={{cursor:'pointer'}} onClick={()=>setSearchTerm('')}/>}
                        </div>

                        {/* Loading / Empty States */}
                        {loading && (
                            <div className="empty-state">
                                <FaSpinner className="spinning" size={40} color="#34d399"/>
                                <span>جاري تحميل المستخدمين...</span>
                            </div>
                        )}
                        
                        {!loading && filteredUsers.length === 0 && (
                            <div className="empty-state">
                                <FaUsers size={48} />
                                <span>لا توجد نتائج مطابقة للبحث</span>
                            </div>
                        )}

                        {/* User Grid */}
                        {!loading && filteredUsers.length > 0 && (
                            <div className="w-admin-user-grid">
                                {filteredUsers.map(user => (
                                    <motion.div 
                                        key={user.id} 
                                        className="w-admin-user-card"
                                        initial={{opacity:0, scale:0.95}}
                                        animate={{opacity:1, scale:1}}
                                        transition={{duration:0.2}}
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
                                            <span className="meta-tag">{user.settings?.gender || 'غير محدد'}</span>
                                            <span className="meta-tag">{user.settings?.skinType || 'بشرة؟'}</span>
                                            <span className="meta-tag">{user.settings?.hairType || 'شعر؟'}</span>
                                        </div>

                                        <div className="user-card-actions">
                                            <button onClick={() => setEditingUser(JSON.parse(JSON.stringify(user)))}>
                                                <FaEdit size={16} /> تعديل
                                            </button>
                                            <button onClick={() => { 
                                                setViewingProducts(user); 
                                                fetchUserProducts(user.id); 
                                            }}>
                                                <FaShoppingBag size={16} /> المنتجات
                                            </button>
                                            <button 
                                                disabled={!user.fcmToken} 
                                                onClick={() => setNotifyingUser(user)}
                                                style={{opacity: user.fcmToken ? 1 : 0.4}}
                                            >
                                                <FaBell size={16} /> تنبيه
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
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
                                            placeholder="https://play.google.com/store/apps/details?id=..."
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
        {/* Changelog List */}
        <div className="changelog-list">
            {(configData.android?.changelog || []).length > 0 ? (
                (configData.android?.changelog || []).map((item, idx) => (
                    <motion.div 
                        key={idx} 
                        className="changelog-item"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <div className="changelog-bullet">•</div>
                        <div className="changelog-text">{item}</div>
                        <button 
                            className="changelog-remove-btn"
                            onClick={() => handleRemoveChangelog(item)}
                            title="حذف"
                        >
                            <FaTimes size={14} />
                        </button>
                    </motion.div>
                ))
            ) : (
                <div className="empty-changelog">
                    <FaList size={32} />
                    <span>لا توجد تحديثات مضافة</span>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                        أضف ميزات أو تحسينات جديدة هنا
                    </span>
                </div>
            )}
        </div>

        {/* Add Changelog Input */}
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
                <span className="hide-mobile">إضافة</span>
            </button>
        </div>
        
        {/* Changelog Stats */}
        {(configData.android?.changelog || []).length > 0 && (
            <div style={{
                fontSize: '0.85rem',
                color: '#94a3b8',
                textAlign: 'center',
                padding: '8px',
                background: 'rgba(15, 23, 42, 0.3)',
                borderRadius: '8px',
                marginTop: '5px'
            }}>
                {configData.android.changelog.length} عنصر في قائمة التحديثات
            </div>
        )}
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
                                                    placeholder="صباح الخير!"
                                                    value={configData.notif_am_title_female || ''} 
                                                    onChange={e => handleConfigChange('root', 'notif_am_title_female', e.target.value)} 
                                                />
                                            </div>
                                            <div className="w-admin-form-group">
                                                <label>نص الصباح</label>
                                                <textarea 
                                                    className="w-admin-input" 
                                                    rows={3}
                                                    placeholder="حان وقت روتينك الصباحي..."
                                                    value={configData.notif_am_body_female || ''} 
                                                    onChange={e => handleConfigChange('root', 'notif_am_body_female', e.target.value)} 
                                                />
                                            </div>
                                            <div className="w-admin-form-group">
                                                <label>عنوان المساء</label>
                                                <input 
                                                    className="w-admin-input" 
                                                    placeholder="مساء الخير!"
                                                    value={configData.notif_pm_title_female || ''} 
                                                    onChange={e => handleConfigChange('root', 'notif_pm_title_female', e.target.value)} 
                                                />
                                            </div>
                                            <div className="w-admin-form-group">
                                                <label>نص المساء</label>
                                                <textarea 
                                                    className="w-admin-input" 
                                                    rows={3}
                                                    placeholder="حان وقت روتينك المسائي..."
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
                                                    placeholder="صباح الخير!"
                                                    value={configData.notif_am_title_male || ''} 
                                                    onChange={e => handleConfigChange('root', 'notif_am_title_male', e.target.value)} 
                                                />
                                            </div>
                                            <div className="w-admin-form-group">
                                                <label>نص الصباح</label>
                                                <textarea 
                                                    className="w-admin-input" 
                                                    rows={3}
                                                    placeholder="حان وقت روتينك الصباحي..."
                                                    value={configData.notif_am_body_male || ''} 
                                                    onChange={e => handleConfigChange('root', 'notif_am_body_male', e.target.value)} 
                                                />
                                            </div>
                                            <div className="w-admin-form-group">
                                                <label>عنوان المساء</label>
                                                <input 
                                                    className="w-admin-input" 
                                                    placeholder="مساء الخير!"
                                                    value={configData.notif_pm_title_male || ''} 
                                                    onChange={e => handleConfigChange('root', 'notif_pm_title_male', e.target.value)} 
                                                />
                                            </div>
                                            <div className="w-admin-form-group">
                                                <label>نص المساء</label>
                                                <textarea 
                                                    className="w-admin-input" 
                                                    rows={3}
                                                    placeholder="حان وقت روتينك المسائي..."
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
        transition={{type:'spring', damping:20}}
        style={{
            position: 'fixed',
            bottom: '100px',
            left: '20px',
            right: '20px',
            zIndex: 999,
            padding: '16px 24px',
            borderRadius: '16px',
            boxShadow: '0 12px 30px -8px rgba(5, 150, 105, 0.5)',
            maxWidth: '400px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            animation: 'float 3s ease-in-out infinite'
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
                            transition={{ 
                                type: 'spring', 
                                damping: 30,      // Increase from 25 to make it less bouncy
                                stiffness: 400,   // Increase from default for faster movement
                                mass: 0.8        // Lower mass for faster response
                            }}
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
                    <div className="bottom-sheet-backdrop" onClick={() => setViewingProducts(null)}>
                        <motion.div 
                            className="w-admin-bottom-sheet"
                            onClick={e => e.stopPropagation()} 
                            initial={{y:'100%'}}
                            animate={{y:0}}
                            exit={{y:'100%'}}
                            transition={{ 
                                type: 'spring', 
                                damping: 30,
                                stiffness: 400,
                                mass: 0.8
                            }}
                        >
                            <div className="bottom-sheet-header">
                                <h3>منتجات: {viewingProducts.settings?.name}</h3>
                                <button onClick={() => setViewingProducts(null)}><FaTimes/></button>
                            </div>
                            
                            <div className="bottom-sheet-content">
                                {productsLoading ? (
                                    <div className="empty-state">
                                        <FaSpinner className="spinning"/>
                                        <span>جاري تحميل المنتجات...</span>
                                    </div>
                                ) : (
                                    productsList.length > 0 ? (
                                        productsList.map(p => (
                                            <div key={p.id} className="w-admin-product-item">
                                                <div style={{flex:1}}>
                                                    <strong style={{display:'block', marginBottom:'4px'}}>{p.productName}</strong>
                                                    <span style={{fontSize:'0.8rem', color:'#64748b', display:'block'}}>{p.brand}</span>
                                                    {p.category && (
                                                        <span style={{fontSize:'0.75rem', color:'#94a3b8'}}>{p.category}</span>
                                                    )}
                                                </div>
                                                <button 
                                                    onClick={() => handleDeleteProduct(viewingProducts.id, p.id)} 
                                                    style={{
                                                        color:'#ef4444', 
                                                        background:'rgba(239, 68, 68, 0.1)', 
                                                        border:'none', 
                                                        padding:'12px',
                                                        borderRadius:'10px',
                                                        cursor:'pointer',
                                                        transition:'all 0.2s'
                                                    }}
                                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                                    onMouseOut={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                                >
                                                    <FaTrash/>
                                                </button>
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
                            transition={{ 
                                type: 'spring', 
                                damping: 30,
                                stiffness: 400,
                                mass: 0.8
                            }}
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
            </AnimatePresence>
        </div>
    );
};

export default WathiqAdmin;