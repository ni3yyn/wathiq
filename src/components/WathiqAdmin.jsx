import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, query, orderBy, getDocs, Timestamp, setDoc } from 'firebase/firestore';
import { 
    FaSearch, FaEdit, FaBell, FaPaperPlane, FaTimes, FaCheck, FaList,
    FaSpinner, FaUsers, FaMobileAlt, FaShoppingBag, FaTrash, 
    FaBullhorn, FaCogs, FaAndroid, FaTools, FaClock, FaSave, FaMale, FaFemale
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '../WathiqAdmin.css'; 

const WathiqAdmin = () => {
    const [activeView, setActiveView] = useState('users'); // 'users' or 'config'
    
    // --- Users Data ---
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // --- Config Data ---
    const [configData, setConfigData] = useState(null);
    const [configLoading, setConfigLoading] = useState(true);

    // --- Modals State ---
    const [editingUser, setEditingUser] = useState(null);
    const [notifyingUser, setNotifyingUser] = useState(null);
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [viewingProducts, setViewingProducts] = useState(null);
    
    // --- Products Data ---
    const [productsList, setProductsList] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    
    // --- UI State ---
    const [activeModalTab, setActiveModalTab] = useState('basic'); 
    const [notifData, setNotifData] = useState({ title: '', body: '' });
    const [sending, setSending] = useState(false);
    const [newChangelogItem, setNewChangelogItem] = useState('');
    
    // --- Temporary State for Array Inputs (Allergies) ---
    const [newArrayItem, setNewArrayItem] = useState('');

    // 1. Real-time Users Fetching
    useEffect(() => {
        const unsub = onSnapshot(collection(db, "profiles"), (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(list);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    // 2. Real-time Config Fetching
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "app_config", "version_control"), (docSnap) => {
            if (docSnap.exists()) {
                setConfigData(docSnap.data());
            } else {
                // Initialize if missing
                setConfigData({
                    maintenance_mode: false,
                    android: { latest_version: '1.0.0', min_supported_version: '1.0.0', store_url: '' }
                });
            }
            setConfigLoading(false);
        });
        return () => unsub();
    }, []);

    // --- CONFIG ACTIONS ---
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

    const saveConfiguration = async () => {
        try {
            await setDoc(doc(db, "app_config", "version_control"), configData);
            alert("✅ تم تحديث إعدادات التطبيق بنجاح!");
        } catch (e) {
            alert("Error: " + e.message);
        }
    };

    // --- USER ACTIONS ---
    const handleSaveProfile = async () => {
        if (!editingUser) return;
        try {
            const userRef = doc(db, "profiles", editingUser.id);
            await updateDoc(userRef, { settings: editingUser.settings });
            setEditingUser(null);
            alert("تم حفظ التغييرات بنجاح");
        } catch (e) {
            alert("فشل الحفظ: " + e.message);
        }
    };

    const handleSettingChange = (field, value) => {
        setEditingUser(prev => ({
            ...prev,
            settings: { ...prev.settings, [field]: value }
        }));
    };

    const handleArrayRemove = (field, value) => {
        const current = editingUser.settings[field] || [];
        handleSettingChange(field, current.filter(item => item !== value));
    };

    const handleArrayAdd = (field, value) => {
        if (!value) return;
        const current = editingUser.settings[field] || [];
        if (!current.includes(value)) {
            handleSettingChange(field, [...current, value]);
        }
    };

    // --- PRODUCT ACTIONS ---
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
        if(!window.confirm("حذف هذا المنتج؟")) return;
        try {
            await deleteDoc(doc(db, 'profiles', userId, 'savedProducts', productId));
            setProductsList(prev => prev.filter(p => p.id !== productId));
        } catch (e) {
            alert("Failed to delete");
        }
    };

    // --- NOTIFICATION ACTIONS ---
    const handleSendNotification = async (isBroadcast = false) => {
        if (!notifData.title || !notifData.body) return;
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
            setShowBroadcastModal(false);
            setNotifData({ title: '', body: '' });
            alert(isBroadcast ? "تم بدء الحملة!" : "تم الإرسال!");
        } catch (e) {
            alert("Error: " + e.message);
        } finally {
            setSending(false);
        }
    };


    const handleChangelogAdd = () => {
        if (!newChangelogItem.trim()) return;
        const current = configData.android?.changelog || [];
        // Reuse your existing handleConfigChange logic
        handleConfigChange('android', 'changelog', [...current, newChangelogItem]);
        setNewChangelogItem('');
    };

    const handleChangelogRemove = (itemToRemove) => {
        const current = configData.android?.changelog || [];
        handleConfigChange('android', 'changelog', current.filter(item => item !== itemToRemove));
    };

    // --- RENDER HELPERS ---
    const filteredUsers = users.filter(u => 
        (u.settings?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.includes(searchTerm)
    );

    if (loading) return <div className="fullscreen-loader"><FaSpinner className="spinning" /></div>;

    return (
        <div className="w-admin-container">
            {/* --- TOP BAR --- */}
            <header className="w-admin-topbar">
                <div className="w-admin-brand">
                    <h1>لوحة تحكم وثيق</h1>
                    <span className="w-admin-badge-beta">Admin v2.1</span>
                </div>
                <nav className="w-admin-nav">
                    <button 
                        className={`nav-item ${activeView === 'users' ? 'active' : ''}`} 
                        onClick={() => setActiveView('users')}
                    >
                        <FaUsers /> المستخدمين
                    </button>
                    <button 
                        className={`nav-item ${activeView === 'config' ? 'active' : ''}`} 
                        onClick={() => setActiveView('config')}
                    >
                        <FaCogs /> الإعدادات
                    </button>
                </nav>
            </header>

            <div className="w-admin-content">
                
                {/* ================= VIEW: USERS ================= */}
                {activeView === 'users' && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="w-admin-users-view">
                        
                        {/* Stats Row */}
                        <div className="w-admin-stats-row">
                            <div className="stat-card primary" onClick={() => setShowBroadcastModal(true)}>
                                <div className="stat-icon"><FaBullhorn /></div>
                                <div className="stat-info">
                                    <h3>إشعار عام</h3>
                                    <span>إرسال للجميع</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon"><FaUsers /></div>
                                <div className="stat-info"><h3>{users.length}</h3><span>مستخدم مسجل</span></div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon"><FaMobileAlt /></div>
                                <div className="stat-info"><h3>{users.filter(u => u.fcmToken).length}</h3><span>أجهزة نشطة</span></div>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="w-admin-search-bar">
                            <FaSearch />
                            <input 
                                placeholder="بحث (الاسم، البريد، ID)..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Responsive User Grid */}
                        <div className="w-admin-user-grid">
                            {filteredUsers.map(user => (
                                <div key={user.id} className="w-admin-user-card">
                                    <div className="user-card-header">
                                        <div className="user-avatar">{user.settings?.name?.[0] || '?'}</div>
                                        <div className="user-details">
                                            <h4>{user.settings?.name || 'مستخدم جديد'}</h4>
                                            <span>{user.email}</span>
                                        </div>
                                        <div className={`status-dot ${user.fcmToken ? 'online' : 'offline'}`} title={user.fcmToken ? 'Token Active' : 'No Token'} />
                                    </div>
                                    <div className="user-card-meta">
                                        <span className="meta-tag">{user.settings?.skinType || 'غير محدد'}</span>
                                        <span className="meta-tag">{user.settings?.hairType || 'غير محدد'}</span>
                                    </div>
                                    <div className="user-card-actions">
                                        <button onClick={() => setEditingUser(JSON.parse(JSON.stringify(user)))}><FaEdit /> تعديل</button>
                                        <button onClick={() => { setViewingProducts(user); fetchUserProducts(user.id); }}><FaShoppingBag /> المنتجات</button>
                                        <button disabled={!user.fcmToken} onClick={() => setNotifyingUser(user)}><FaBell /> إشعار</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ================= VIEW: CONFIGURATION ================= */}
                {activeView === 'config' && (
                    configLoading ? (
                        <div className="fullscreen-loader" style={{height:'200px'}}><FaSpinner className="spinning"/></div>
                    ) : (
                    configData && (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="w-admin-config-view">
                            
                            <div className="config-header">
                                <h2>إعدادات التطبيق الحية</h2>
                                <button className="w-admin-btn-primary save-fab" onClick={saveConfiguration}>
                                    <FaSave /> حفظ التغييرات
                                </button>
                            </div>

                            <div className="config-grid">
                                
                                {/* 1. MAINTENANCE MODE */}
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
                                        <span>{configData.maintenance_mode ? 'التطبيق مغلق (صيانة)' : 'التطبيق يعمل بشكل طبيعي'}</span>
                                    </div>
                                    <label>رسالة الصيانة:</label>
                                    <input 
                                        className="config-input"
                                        value={configData.maintenance_message || ''}
                                        onChange={e => handleConfigChange('root', 'maintenance_message', e.target.value)}
                                    />
                                </div>

                                {/* 2. ANDROID VERSION */}
                                <div className="config-card">
                                    <div className="card-title"><FaAndroid /> إصدار Android</div>
                                    <div className="input-group">
                                        <label>أحدث إصدار (Latest):</label>
                                        <input className="config-input" value={configData.android?.latest_version || ''} onChange={e => handleConfigChange('android', 'latest_version', e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>أدنى إصدار مدعوم (Min):</label>
                                        <input className="config-input" value={configData.android?.min_supported_version || ''} onChange={e => handleConfigChange('android', 'min_supported_version', e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>رابط التحديث (APK/Store):</label>
                                        <input className="config-input" value={configData.android?.store_url || ''} onChange={e => handleConfigChange('android', 'store_url', e.target.value)} />
                                    </div>
                                </div>

                                {/* 3. UPDATE MESSAGES */}
                                <div className="config-card">
                                    <div className="card-title"><FaBullhorn /> رسائل التحديث</div>
                                    <label>رسالة التحديث الإجباري:</label>
                                    <textarea className="config-input" rows={2} value={configData.android?.critical_message || ''} onChange={e => handleConfigChange('android', 'critical_message', e.target.value)} />
                                    <label style={{marginTop:'10px'}}>رسالة التحديث الاختياري:</label>
                                    <textarea className="config-input" rows={2} value={configData.android?.optional_message || ''} onChange={e => handleConfigChange('android', 'optional_message', e.target.value)} />
                                </div>

                                {/* 3.5. CHANGELOG CARD (NEW) */}
                            <div className="config-card">
                                <div className="card-title"><FaList /> سجل التغييرات (What's New)</div>
                                
                                {/* List of existing items */}
                                <div className="w-admin-tag-container" style={{flexDirection: 'column', alignItems: 'stretch'}}>
                                    {(configData.android?.changelog || []).map((item, idx) => (
                                        <div key={idx} className="w-admin-tag" style={{justifyContent: 'space-between', width: '100%', boxSizing: 'border-box'}}>
                                            <span>{item}</span>
                                            <button onClick={() => handleChangelogRemove(item)} style={{color:'#f87171'}}>&times;</button>
                                        </div>
                                    ))}
                                    {(configData.android?.changelog || []).length === 0 && <span style={{color:'#64748b', fontSize:'0.9rem'}}>لا توجد عناصر حالياً</span>}
                                </div>

                                {/* Input for new item */}
                                <div style={{display: 'flex', gap: '10px', marginTop: 'auto'}}>
                                    <input 
                                        className="config-input" 
                                        placeholder="ميزة جديدة (مثال: إصلاحات عامة)..." 
                                        value={newChangelogItem}
                                        onChange={e => setNewChangelogItem(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleChangelogAdd()}
                                    />
                                    <button className="w-admin-btn-primary" onClick={handleChangelogAdd} style={{padding: '0 15px', fontSize: '1.2rem'}}>
                                        +
                                    </button>
                                </div>
                            </div>

                                {/* 4. NOTIFICATION TEXTS (Gendered) */}
                                <div className="config-card full-width">
                                    <div className="card-title"><FaClock /> نصوص التنبيهات اليومية</div>
                                    <div className="gender-grid">
                                        <div className="gender-col">
                                            <h4><FaFemale style={{color:'#ec4899'}}/> للإناث</h4>
                                            <label>عنوان الصباح:</label>
                                            <input className="config-input" value={configData.notif_am_title_female || ''} onChange={e => handleConfigChange('root', 'notif_am_title_female', e.target.value)} />
                                            <label>نص الصباح:</label>
                                            <input className="config-input" value={configData.notif_am_body_female || ''} onChange={e => handleConfigChange('root', 'notif_am_body_female', e.target.value)} />
                                            <label>عنوان المساء:</label>
                                            <input className="config-input" value={configData.notif_pm_title_female || ''} onChange={e => handleConfigChange('root', 'notif_pm_title_female', e.target.value)} />
                                            <label>نص المساء:</label>
                                            <input className="config-input" value={configData.notif_pm_body_female || ''} onChange={e => handleConfigChange('root', 'notif_pm_body_female', e.target.value)} />
                                        </div>
                                        <div className="gender-col">
                                            <h4><FaMale style={{color:'#3b82f6'}}/> للذكور</h4>
                                            <label>عنوان الصباح:</label>
                                            <input className="config-input" value={configData.notif_am_title_male || ''} onChange={e => handleConfigChange('root', 'notif_am_title_male', e.target.value)} />
                                            <label>نص الصباح:</label>
                                            <input className="config-input" value={configData.notif_am_body_male || ''} onChange={e => handleConfigChange('root', 'notif_am_body_male', e.target.value)} />
                                            <label>عنوان المساء:</label>
                                            <input className="config-input" value={configData.notif_pm_title_male || ''} onChange={e => handleConfigChange('root', 'notif_pm_title_male', e.target.value)} />
                                            <label>نص المساء:</label>
                                            <input className="config-input" value={configData.notif_pm_body_male || ''} onChange={e => handleConfigChange('root', 'notif_pm_body_male', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* === EDIT USER MODAL === */}
            <AnimatePresence>
                {editingUser && (
                    <div className="w-admin-modal-backdrop" onClick={() => setEditingUser(null)}>
                        <motion.div 
                            className="w-admin-modal" onClick={e => e.stopPropagation()}
                            initial={{scale:0.9}} animate={{scale:1}}
                        >
                            <div className="w-admin-modal-header">
                                <h3>تعديل: {editingUser.settings?.name}</h3>
                                <button onClick={() => setEditingUser(null)}><FaTimes /></button>
                            </div>
                            <div className="w-admin-tabs">
                                {['basic', 'bio', 'health', 'raw'].map(tab => (
                                    <button key={tab} className={`w-admin-tab ${activeModalTab === tab ? 'active' : ''}`} onClick={() => setActiveModalTab(tab)}>{tab}</button>
                                ))}
                            </div>
                            <div className="w-admin-tab-content">
                                {activeModalTab === 'basic' && (
                                    <>
                                        <div className="w-admin-form-group"><label>الاسم</label><input className="w-admin-input" value={editingUser.settings?.name || ''} onChange={e => handleSettingChange('name', e.target.value)} /></div>
                                        <div className="w-admin-form-group"><label>الجنس</label><select className="w-admin-input" value={editingUser.settings?.gender || ''} onChange={e => handleSettingChange('gender', e.target.value)}><option value="أنثى">أنثى</option><option value="ذكر">ذكر</option></select></div>
                                    </>
                                )}
                                {activeModalTab === 'bio' && (
                                    <>
                                        <div className="w-admin-form-group"><label>نوع البشرة</label><input className="w-admin-input" value={editingUser.settings?.skinType || ''} onChange={e => handleSettingChange('skinType', e.target.value)} /></div>
                                        <div className="w-admin-form-group"><label>نوع الشعر</label><input className="w-admin-input" value={editingUser.settings?.hairType || ''} onChange={e => handleSettingChange('hairType', e.target.value)} /></div>
                                    </>
                                )}
                                {activeModalTab === 'health' && (
                                    <div className="w-admin-form-group">
                                        <label>الحساسيات (Tags)</label>
                                        <div className="w-admin-tag-container">
                                            {(editingUser.settings?.allergies || []).map(alg => (
                                                <span key={alg} className="w-admin-tag">
                                                    {alg} 
                                                    <button onClick={() => handleArrayRemove('allergies', alg)}>&times;</button>
                                                </span>
                                            ))}
                                            <input 
                                                placeholder="+ إضافة" 
                                                style={{border:'none', outline:'none', background:'transparent', width:'80px'}} 
                                                value={newArrayItem}
                                                onChange={(e) => setNewArrayItem(e.target.value)}
                                                onKeyDown={(e) => { 
                                                    if(e.key === 'Enter') { 
                                                        handleArrayAdd('allergies', newArrayItem); 
                                                        setNewArrayItem(''); 
                                                    }
                                                }} 
                                            />
                                        </div>
                                    </div>
                                )}
                                {activeModalTab === 'raw' && (
                                    <div className="w-admin-form-group">
                                        <textarea className="w-admin-input" rows={10} readOnly style={{fontSize:'0.8rem', fontFamily:'monospace', direction:'ltr'}} value={JSON.stringify(editingUser, null, 2)} />
                                    </div>
                                )}
                            </div>
                            <div className="w-admin-footer-actions">
                                <button className="elegant-btn secondary" onClick={() => setEditingUser(null)}>إلغاء</button>
                                <button className="w-admin-btn-primary" onClick={handleSaveProfile}>
                                    <FaCheck /> حفظ
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {viewingProducts && (
                    <div className="w-admin-modal-backdrop" onClick={() => setViewingProducts(null)}>
                        <motion.div className="w-admin-modal" onClick={e => e.stopPropagation()} initial={{y:50}} animate={{y:0}}>
                             <div className="w-admin-modal-header"><h3>منتجات: {viewingProducts.settings?.name}</h3><button onClick={() => setViewingProducts(null)}><FaTimes/></button></div>
                             <div style={{maxHeight:'400px', overflowY:'auto'}}>
                                {productsLoading ? <div style={{textAlign:'center'}}><FaSpinner className="spinning"/></div> : productsList.map(p => (
                                    <div key={p.id} className="w-admin-product-item">
                                        <strong>{p.productName}</strong>
                                        <button onClick={() => handleDeleteProduct(viewingProducts.id, p.id)} style={{color:'red', background:'none', border:'none'}}><FaTrash/></button>
                                    </div>
                                ))}
                                {productsList.length === 0 && !productsLoading && <p style={{textAlign:'center', color:'#999'}}>لا توجد منتجات.</p>}
                             </div>
                        </motion.div>
                    </div>
                )}

                {(notifyingUser || showBroadcastModal) && (
                    <div className="w-admin-modal-backdrop" onClick={() => {setNotifyingUser(null); setShowBroadcastModal(false)}}>
                        <motion.div className="w-admin-modal" onClick={e => e.stopPropagation()} initial={{scale:0.9}} animate={{scale:1}}>
                             <div className="w-admin-modal-header"><h3>{showBroadcastModal ? 'إشعار للجميع' : 'إشعار فردي'}</h3><button onClick={() => {setNotifyingUser(null); setShowBroadcastModal(false)}}><FaTimes/></button></div>
                             
                             <div className="w-admin-form-group">
                                <label>العنوان</label>
                                <input className="w-admin-input" value={notifData.title} onChange={e=>setNotifData({...notifData, title:e.target.value})} />
                             </div>
                             <div className="w-admin-form-group">
                                <label>الرسالة</label>
                                <textarea className="w-admin-input" rows={4} value={notifData.body} onChange={e=>setNotifData({...notifData, body:e.target.value})} />
                             </div>

                             <button className="w-admin-btn-primary" style={{marginTop:15, width:'100%', justifyContent:'center'}} onClick={() => handleSendNotification(showBroadcastModal)} disabled={sending}>
                                {sending ? <FaSpinner className="spinning"/> : <><FaPaperPlane /> إرسال</>}
                             </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default WathiqAdmin;