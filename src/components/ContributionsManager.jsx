import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { 
    collection, query, where, orderBy, onSnapshot, doc, 
    updateDoc, writeBatch, getDoc 
} from 'firebase/firestore';
import { 
    FaCheck, FaTimes, FaSpinner, FaBoxOpen, FaUser, FaTag, 
    FaClock, FaArrowRight, FaFilter, FaCheckDouble, FaHistory,
    FaFlask, FaMoneyBillWave, FaShieldAlt, FaExclamationTriangle,
    FaExchangeAlt, FaImage, FaStar, FaGlobe, FaRuler, FaUsers, FaEdit, FaSave
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// رابط الكتالوج المباشر لجلب البيانات الحالية
const CATALOG_URL = "https://cdn.jsdelivr.net/gh/ni3yyn/prdcts@main/finalcatalog506.json";

// دالة حساب مستوى المستخدم بناءً على النقاط (تطابق نظام التطبيق)
const getUserLevel = (points = 0) => {
    if (points >= 1000) return { name: 'سفير وثيق', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)', icon: '💎' };
    if (points >= 500)  return { name: 'خبير العناية', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: '🏆' };
    if (points >= 100)  return { name: 'مستكشف', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', icon: '🥈' };
    return { name: 'مبتدئ', color: '#b45309', bg: 'rgba(180, 83, 9, 0.15)', icon: '🥉' };
};

const ContributionsManager = () => {
    const navigate = useNavigate();
    
    // States
    const [contributions, setContributions] = useState([]);
    const [catalog, setCatalog] = useState({}); 
    const [usersData, setUsersData] = useState({}); // تخزين بيانات المستخدمين { userId: userData }
    const [loadingFirebase, setLoadingFirebase] = useState(true);
    const [loadingCatalog, setLoadingCatalog] = useState(true);
    const [processingIds, setProcessingIds] = useState(new Set()); 

    // Editing States
    const [editingItem, setEditingItem] = useState(null);
    const [editedValue, setEditedValue] = useState("");
    const [editError, setEditError] = useState("");
    
    // Filters
    const [filterField, setFilterField] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // 1. جلب الكتالوج المباشر
    useEffect(() => {
        const fetchCatalog = async () => {
            try {
                const response = await fetch(`${CATALOG_URL}?t=${Date.now()}`);
                const data = await response.json();
                const catalogMap = {};
                data.forEach(product => { catalogMap[product.id] = product; });
                setCatalog(catalogMap);
            } catch (error) {
                console.error("❌ فشل جلب الكتالوج:", error);
            } finally {
                setLoadingCatalog(false);
            }
        };
        fetchCatalog();
    }, []);

    // 2. جلب المساهمات من Firebase
    useEffect(() => {
        const q = query(
            collection(db, 'contributions'),
            where('status', '==', 'pending'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setContributions(data);
            setLoadingFirebase(false);
        });
        return () => unsubscribe();
    }, []);

    // 3. جلب بيانات المستخدمين أصحاب المساهمات بذكاء
    useEffect(() => {
        const fetchMissingUsers = async () => {
            if (contributions.length === 0) return;
            
            // استخراج IDs المستخدمين الفريدة (دون تكرار)
            const uniqueUserIds = [...new Set(contributions.map(c => c.userId))];
            
            // فلترة الـ IDs التي لم نقم بجلبها مسبقاً
            const missingIds = uniqueUserIds.filter(uid => !usersData[uid]);
            
            if (missingIds.length === 0) return; // جميع المستخدمين متوفرين في الـ State

            try {
                // جلب بياناتهم دفعة واحدة عبر Promise.all لتسريع العملية
                const fetchedDocs = await Promise.all(
                    missingIds.map(uid => getDoc(doc(db, 'profiles', uid)))
                );

                const newUsers = {};
                fetchedDocs.forEach(snap => {
                    if (snap.exists()) {
                        newUsers[snap.id] = snap.data();
                    } else {
                        newUsers[snap.id] = { settings: { name: 'مستخدم محذوف/مجهول' }, points: 0 };
                    }
                });

                setUsersData(prev => ({ ...prev, ...newUsers }));
            } catch (error) {
                console.error("خطأ في جلب بيانات المستخدمين:", error);
            }
        };

        fetchMissingUsers();
    }, [contributions]);

    // 4. الإحصائيات (Metrics)
    const stats = useMemo(() => {
        const newProducts = contributions.filter(c => c.field === 'new_product').length;
        const ingredients = contributions.filter(c => c.field === 'ingredients').length;
        const prices = contributions.filter(c => c.field === 'price').length;
        const claims = contributions.filter(c => c.field === 'marketingClaims').length;
        const targetTypes = contributions.filter(c => c.field === 'targetTypes').length;
        const quantity = contributions.filter(c => c.field === 'quantity').length;
        
        return {
            total: contributions.length,
            newProducts,
            ingredients,
            prices,
            claims,
            targetTypes,
            quantity,
            highRisk: contributions.filter(c => c.field === 'price' && Number(c.proposedValue) > 15000).length
        };
    }, [contributions]);

    // 5. دالة معالجة الطلبات (Approve / Decline)
    const handleAction = async (id, newStatus) => {
        setProcessingIds(prev => new Set(prev).add(id));
        try {
            await updateDoc(doc(db, 'contributions', id), { 
                status: newStatus,
                reviewedAt: new Date()
            });
        } catch (error) {
            alert("خطأ: " + error.message);
        }
        setProcessingIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
    };

    // 5b. فتح وإغلاق مودال التعديل
    const openEditModal = (item) => {
        setEditingItem(item);
        if (typeof item.proposedValue === 'object' && item.proposedValue !== null) {
            setEditedValue(JSON.parse(JSON.stringify(item.proposedValue))); // Deep copy
        } else {
            setEditedValue(item.proposedValue);
        }
        setEditError("");
    };

    const saveEdit = async () => {
        try {
            await updateDoc(doc(db, 'contributions', editingItem.id), {
                proposedValue: editedValue
            });
            setEditingItem(null);
        } catch (e) {
            setEditError("حدث خطأ أثناء الحفظ: " + e.message);
        }
    };

    const renderEditFields = () => {
        if (editedValue === null || editedValue === undefined) return null;

        // 1. Strings or Numbers
        if (typeof editedValue === 'string' || typeof editedValue === 'number') {
            return (
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 'bold' }}>{editingItem.field}</label>
                    <textarea 
                        value={editedValue}
                        onChange={e => setEditedValue(e.target.value)}
                        style={{
                            width: '100%', minHeight: '100px', background: '#0f172a', border: '1px solid #334155',
                            borderRadius: '12px', padding: '15px', color: '#f8fafc', fontSize: '0.9rem', outline: 'none',
                            resize: 'vertical', marginTop: '5px'
                        }}
                    />
                </div>
            );
        }

        // 2. Arrays
        if (Array.isArray(editedValue)) {
            return (
                <div style={{ marginBottom: '15px', maxHeight: '50vh', overflowY: 'auto', paddingRight: '5px' }}>
                    <label style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 'bold' }}>{editingItem.field} (قائمة)</label>
                    {editedValue.map((val, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                            <input 
                                value={val} 
                                onChange={e => {
                                    const newArr = [...editedValue];
                                    newArr[idx] = e.target.value;
                                    setEditedValue(newArr);
                                }} 
                                style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f8fafc', outline: 'none' }}
                            />
                            <button onClick={() => {
                                const newArr = editedValue.filter((_, i) => i !== idx);
                                setEditedValue(newArr);
                            }} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '0 15px', cursor: 'pointer' }}>حذف</button>
                        </div>
                    ))}
                    <button onClick={() => setEditedValue([...editedValue, ""])} style={{ marginTop: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        + إضافة عنصر
                    </button>
                </div>
            );
        }

        // 3. Objects
        if (typeof editedValue === 'object') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '50vh', overflowY: 'auto', paddingRight: '10px' }}>
                    {Object.keys(editedValue).map(key => {
                        const val = editedValue[key];
                        
                        // Handle simple types inside object
                        if (typeof val === 'string' || typeof val === 'number') {
                            if (key === 'ingredients' || (typeof val === 'string' && val.length > 50)) {
                                return (
                                    <div key={key}>
                                        <label style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 'bold' }}>{key}</label>
                                        <textarea 
                                            value={val}
                                            onChange={e => setEditedValue({...editedValue, [key]: e.target.value})}
                                            style={{ width: '100%', minHeight: '80px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f8fafc', outline: 'none', marginTop: '5px' }}
                                        />
                                    </div>
                                );
                            }
                            return (
                                <div key={key}>
                                    <label style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 'bold' }}>{key}</label>
                                    <input 
                                        value={val}
                                        type={typeof val === 'number' ? 'number' : 'text'}
                                        onChange={e => setEditedValue({...editedValue, [key]: typeof val === 'number' ? Number(e.target.value) : e.target.value})}
                                        style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f8fafc', outline: 'none', marginTop: '5px' }}
                                    />
                                </div>
                            );
                        }

                        // Handle array inside object
                        if (Array.isArray(val)) {
                            return (
                                <div key={key} style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                                    <label style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 'bold' }}>{key} (قائمة)</label>
                                    {val.map((subVal, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                                            <input 
                                                value={subVal} 
                                                onChange={e => {
                                                    const newArr = [...val];
                                                    newArr[idx] = e.target.value;
                                                    setEditedValue({...editedValue, [key]: newArr});
                                                }} 
                                                style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: '#f8fafc', outline: 'none', fontSize: '0.85rem' }}
                                            />
                                            <button onClick={() => {
                                                const newArr = val.filter((_, i) => i !== idx);
                                                setEditedValue({...editedValue, [key]: newArr});
                                            }} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '0 10px', cursor: 'pointer', fontSize: '0.8rem' }}>حذف</button>
                                        </div>
                                    ))}
                                    <button onClick={() => setEditedValue({...editedValue, [key]: [...val, ""]})} style={{ marginTop: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                        + إضافة عنصر
                                    </button>
                                </div>
                            );
                        }

                        // Handle nested object
                        if (typeof val === 'object' && val !== null) {
                            return (
                                <div key={key} style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid #3b82f6' }}>
                                    <label style={{ color: '#3b82f6', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>{key}</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {Object.keys(val).map(subKey => (
                                            <div key={subKey}>
                                                <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold' }}>{subKey}</label>
                                                <input 
                                                    value={val[subKey] || ''}
                                                    type={typeof val[subKey] === 'number' ? 'number' : 'text'}
                                                    onChange={e => setEditedValue({
                                                        ...editedValue, 
                                                        [key]: { ...val, [subKey]: typeof val[subKey] === 'number' ? Number(e.target.value) : e.target.value }
                                                    })}
                                                    style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px', color: '#f8fafc', outline: 'none', marginTop: '5px', fontSize: '0.85rem' }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        }

                        return null;
                    })}
                </div>
            );
        }
        return null;
    };

    // 6. القبول الجماعي (Bulk Approve)
    const handleBulkApprove = async () => {
        if (filteredContributions.length === 0) return;
        if (!window.confirm(`هل أنت متأكد من قبول ${filteredContributions.length} مساهمة فوراً؟`)) return;

        const batch = writeBatch(db);
        const idsToProcess = filteredContributions.map(c => c.id);
        
        setProcessingIds(new Set([...processingIds, ...idsToProcess]));

        filteredContributions.forEach(c => {
            batch.update(doc(db, 'contributions', c.id), { status: 'approved', reviewedAt: new Date() });
        });

        await batch.commit();
        setProcessingIds(new Set());
    };

    // 7. نظام الفلترة الذكي
    const filteredContributions = useMemo(() => {
        return contributions.filter(c => {
            const product = catalog[c.productId] || {};
            const user = usersData[c.userId] || {};
            const userName = user.settings?.name || '';

            const matchField = filterField === 'all' || c.field === filterField;
            const matchSearch = 
                c.productId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()));
            
            return matchField && matchSearch;
        });
    }, [contributions, catalog, usersData, filterField, searchTerm]);

    // --- Helpers UI ---
    const getFieldMeta = (field) => {
        switch(field) {
            case 'new_product': 
                return { 
                    icon: <FaBoxOpen />, 
                    color: '#ec4899', 
                    label: '✨ منتج جديد كلياً', 
                    bg: 'rgba(236, 72, 153, 0.1)',
                    description: 'إضافة منتج غير موجود في الكتالوج'
                };
            case 'ingredients': 
                return { 
                    icon: <FaFlask />, 
                    color: '#10b981', 
                    label: '🧪 المكونات (INCI)', 
                    bg: 'rgba(16, 185, 129, 0.1)',
                    description: 'تحديث قائمة المكونات'
                };
            case 'price': 
                return { 
                    icon: <FaMoneyBillWave />, 
                    color: '#f59e0b', 
                    label: '💰 السعر', 
                    bg: 'rgba(245, 158, 11, 0.1)',
                    description: 'تحديث سعر المنتج'
                };
            case 'marketingClaims': 
                return { 
                    icon: <FaShieldAlt />, 
                    color: '#8b5cf6', 
                    label: '🛡️ المميزات (Claims)', 
                    bg: 'rgba(139, 92, 246, 0.1)',
                    description: 'الفوائد والادعاءات'
                };
            case 'targetTypes': 
                return { 
                    icon: <FaUsers />, 
                    color: '#0ea5e9', 
                    label: '🎯 الفئة المستهدفة', 
                    bg: 'rgba(14, 165, 233, 0.1)',
                    description: 'نوع البشرة/الشعر المناسب'
                };
            case 'quantity': 
                return { 
                    icon: <FaRuler />, 
                    color: '#f97316', 
                    label: '📦 الحجم/الكمية', 
                    bg: 'rgba(249, 115, 22, 0.1)',
                    description: 'حجم العبوة'
                };
            default: 
                return { 
                    icon: <FaBoxOpen />, 
                    color: '#64748b', 
                    label: 'تحديث بيانات', 
                    bg: 'rgba(100, 116, 139, 0.1)',
                    description: 'تحديث عام'
                };
        }
    };

    const formatValue = (val) => {
        if (!val) return '❓ غير متوفر';
        if (Array.isArray(val)) {
            if (val.length === 0) return '❌ لا يوجد';
            return val.map(v => `✨ ${v}`).join('، ');
        }
        if (typeof val === 'object') {
            if (val.min !== undefined || val.max !== undefined) {
                return `${val.min || '?'} - ${val.max || '?'} ${val.currency || 'DZD'}`;
            }
            if (val.label) return val.label;
            return JSON.stringify(val, null, 2);
        }
        return String(val);
    };

    // عرض معلومات المنتج الجديد
    const NewProductViewer = ({ productData }) => {
        if (!productData) return null;
        
        return (
            <div style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)', border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: '16px', padding: '16px' }}>
                <div style={{ color: '#ec4899', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaBoxOpen /> منتج جديد مقترح
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>🏷️ البراند</div>
                        <div style={{ color: '#f8fafc', fontWeight: 'bold' }}>{productData.brand || '❌ غير محدد'}</div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>📝 الاسم</div>
                        <div style={{ color: '#f8fafc', fontWeight: 'bold' }}>{productData.name || '❌ غير محدد'}</div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>📂 الفئة</div>
                        <div style={{ color: '#f8fafc' }}>{productData.category?.label || '❌ غير محدد'}</div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>🌍 بلد المنشأ</div>
                        <div style={{ color: '#f8fafc' }}>{productData.country || '❌ غير محدد'}</div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>💰 السعر</div>
                        <div style={{ color: '#f59e0b', fontWeight: 'bold' }}>{productData.price?.min || '?'} DZD</div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>📦 الحجم</div>
                        <div style={{ color: '#f8fafc' }}>{productData.quantity || '❌ غير محدد'}</div>
                    </div>
                </div>
                
                {productData.ingredients && (
                    <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>🧪 المكونات (INCI)</div>
                        <div style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: '1.4', maxHeight: '80px', overflow: 'auto' }}>
                            {productData.ingredients.length > 150 ? `${productData.ingredients.substring(0, 150)}...` : productData.ingredients}
                        </div>
                    </div>
                )}
                
                {(productData.targetTypes?.length > 0 || productData.marketingClaims?.length > 0) && (
                    <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {productData.targetTypes?.map(t => (
                            <span key={t} style={{ background: 'rgba(14, 165, 233, 0.2)', color: '#0ea5e9', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem' }}>
                                🎯 {t}
                            </span>
                        ))}
                        {productData.marketingClaims?.map(c => (
                            <span key={c} style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem' }}>
                                🛡️ {c}
                            </span>
                        ))}
                    </div>
                )}
                
                {productData.image && (
                    <div style={{ marginTop: '12px', textAlign: 'center' }}>
                        <img src={productData.image} alt="product" style={{ maxWidth: '100%', maxHeight: '100px', borderRadius: '8px', objectFit: 'contain' }} />
                    </div>
                )}
            </div>
        );
    };

    // محرك المقارنة البصري (Diff Engine)
    const DiffViewer = ({ oldValue, newValue, field, productData }) => {
        
        // --- LOGIC FOR NEW PRODUCTS ---
        if (field === 'new_product') {
            return <NewProductViewer productData={productData} />;
        }

        // --- LOGIC FOR EXISTING PRODUCTS ---
        const oldStr = formatValue(oldValue);
        const newStr = formatValue(newValue);

        if (!oldValue || oldStr === '❓ غير متوفر' || oldStr === '') {
            return (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '12px', borderRadius: '12px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaCheck size={12} /> إضافة بيانات جديدة:
                    </div>
                    <div style={{ color: '#6ee7b7', fontSize: '0.85rem', wordBreak: 'break-word' }}>
                        {newStr}
                    </div>
                </div>
            );
        }

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '12px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaTimes size={12} /> القيمة الحالية (سيتم استبدالها):
                    </div>
                    <div style={{ color: '#fca5a5', fontSize: '0.85rem', textDecoration: 'line-through', wordBreak: 'break-word' }}>
                        {oldStr}
                    </div>
                </div>
                <div style={{ alignSelf: 'center', color: '#64748b' }}>
                    <FaExchangeAlt size={14} />
                </div>
                <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '12px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaCheck size={12} /> القيمة المقترحة (ستعتمد):
                    </div>
                    <div style={{ color: '#6ee7b7', fontSize: '0.85rem', wordBreak: 'break-word' }}>
                        {newStr}
                    </div>
                </div>
            </div>
        );
    };
    
    if (loadingFirebase || loadingCatalog) {
        return (
            <div className="empty-state" style={{ height: '100vh', background: '#0f172a', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <FaSpinner className="spinning" size={50} color="#34d399"/>
                <span style={{ marginTop: '15px', color: '#94a3b8', fontSize: '1.1rem' }}>تهيئة محرك المراجعة...</span>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', background: '#0f172a', minHeight: '100vh', fontFamily: 'Tajawal, sans-serif' }}>
            <style>{`
                button, input, textarea, select {
                    font-family: inherit;
                }
            `}</style>
            {/* Header */}
            <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button 
                        onClick={() => navigate('/wathiq-admin')} 
                        style={{ background: '#1e293b', border: '1px solid #334155', color: '#f8fafc', padding: '10px 15px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <FaArrowRight /> رجوع
                    </button>
                    <div>
                        <h1 style={{ margin: 0, color: '#f8fafc', fontSize: '1.6rem', fontWeight: 'bold' }}>معمل مراجعة البيانات</h1>
                        <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>راجع، قارن، ووافق على مساهمات المجتمع بضغطة زر.</p>
                    </div>
                </div>
            </header>

            {/* Premium Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '15px', marginBottom: '25px' }}>
                <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid #334155', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', width: 45, height: 45, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}><FaHistory /></div>
                    <div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#f8fafc' }}>{stats.total}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>إجمالي المعلق</div>
                    </div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid #334155', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', width: 45, height: 45, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}><FaBoxOpen /></div>
                    <div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#f8fafc' }}>{stats.newProducts}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>منتجات جديدة</div>
                    </div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid #334155', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: 45, height: 45, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}><FaFlask /></div>
                    <div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#f8fafc' }}>{stats.ingredients}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>مكونات</div>
                    </div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid #334155', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', width: 45, height: 45, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}><FaMoneyBillWave /></div>
                    <div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#f8fafc' }}>{stats.prices}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>تحديثات أسعار</div>
                    </div>
                </div>
            </div>

            {/* Smart Toolbar */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '15px 20px', borderRadius: '16px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', marginBottom: '25px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 2, background: '#0f172a', border: '1px solid #334155', padding: '10px 15px', borderRadius: '12px' }}>
                    <FaFilter color="#64748b" />
                    <input 
                        style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f8fafc', width: '100%', fontSize: '0.9rem' }}
                        placeholder="ابحث باسم المنتج، اسم المساهم، أو الـ ID..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '250px' }}>
                    <select 
                        style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', color: '#f8fafc', padding: '10px 15px', borderRadius: '12px', outline: 'none', cursor: 'pointer' }}
                        value={filterField}
                        onChange={e => setFilterField(e.target.value)}
                    >
                        <option value="all">🌐 عرض كل الحقول</option>
                        <option value="new_product">✨ منتجات جديدة</option>
                        <option value="ingredients">🧪 المكونات</option>
                        <option value="price">💰 الأسعار</option>
                        <option value="marketingClaims">🛡️ المميزات</option>
                        <option value="targetTypes">🎯 الفئة المستهدفة</option>
                        <option value="quantity">📦 الحجم</option>
                    </select>

                    <button 
                        onClick={handleBulkApprove}
                        style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', padding: '0 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', opacity: filteredContributions.length === 0 ? 0.5 : 1 }}
                        disabled={filteredContributions.length === 0}
                    >
                        <FaCheckDouble /> قبول الكل ({filteredContributions.length})
                    </button>
                </div>
            </div>

            {/* Masonry Grid */}
            {filteredContributions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed #334155', borderRadius: '20px' }}>
                    <FaBoxOpen size={60} color="#334155" style={{ marginBottom: '15px' }} />
                    <h3 style={{ color: '#94a3b8', margin: 0 }}>صندوق الوارد فارغ</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '10px' }}>لا توجد مساهمات تطابق شروط الفلترة الحالية.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '20px' }}>
                    <AnimatePresence>
                        {filteredContributions.map(item => {
                            const meta = getFieldMeta(item.field);
                            const product = catalog[item.productId];
                            const isProcessing = processingIds.has(item.id);
                            
                            // تجهيز بيانات المستخدم
                            const user = usersData[item.userId] || {};
                            const userName = user.settings?.name || 'جاري التحميل...';
                            const userPoints = user.points || 0;
                            const levelData = getUserLevel(userPoints);

                            return (
                                <motion.div 
                                    key={item.id} 
                                    initial={{ opacity: 0, y: 20 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    style={{ 
                                        background: '#1e293b', 
                                        border: `1px solid ${meta.color}40`, 
                                        borderRadius: '20px', 
                                        overflow: 'hidden',
                                        position: 'relative',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                                        display: 'flex', 
                                        flexDirection: 'column'
                                    }}
                                >
                                    {/* Loading Overlay */}
                                    {isProcessing && (
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.9)', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
                                            <FaSpinner className="spinning" color="#10b981" size={30} />
                                            <span style={{ color: '#10b981', marginTop: '10px', fontSize: '0.9rem', fontWeight: 'bold' }}>جاري الدمج...</span>
                                        </div>
                                    )}

                                    {/* Card Header */}
                                    <div style={{ background: meta.bg, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${meta.color}30` }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: meta.color, fontWeight: 'bold', fontSize: '0.9rem' }}>
                                            {meta.icon} {meta.label}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <FaClock /> {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString('ar-DZ', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : 'الآن'}
                                        </div>
                                    </div>

                                    {/* Product Context Area */}
                                    <div style={{ padding: '18px', flex: 1 }}>
                                        {item.field !== 'new_product' && (
                                            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px dashed #334155' }}>
                                                <div style={{ width: 55, height: 55, background: '#0f172a', borderRadius: '12px', border: '1px solid #334155', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                                                    {product?.image ? (
                                                        <img src={product.image} alt="" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                                                    ) : (
                                                        <FaImage color="#64748b" size={22} />
                                                    )}
                                                </div>
                                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                                    <div style={{ color: '#3b82f6', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>
                                                        {product?.brand || 'علامة تجارية غير معروفة'}
                                                    </div>
                                                    <div style={{ color: '#f8fafc', fontSize: '0.9rem', fontWeight: 'bold', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                                        {product?.name || 'منتج غير معروف'}
                                                    </div>
                                                    <div style={{ color: '#64748b', fontSize: '0.65rem', marginTop: '4px', fontFamily: 'monospace' }}>
                                                        ID: {item.productId}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Diff Engine Area */}
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <FaExchangeAlt size={10} /> مقارنة البيانات:
                                            </div>
                                            <DiffViewer 
                                                oldValue={product ? product[item.field] : null} 
                                                newValue={item.proposedValue} 
                                                field={item.field}
                                                productData={item.field === 'new_product' ? item.proposedValue : null}
                                            />
                                        </div>
                                        
                                        {/* High Risk Warning */}
                                        {item.field === 'price' && Number(item.proposedValue?.min || item.proposedValue) > 15000 && (
                                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '10px', borderRadius: '8px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '15px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                                <FaExclamationTriangle /> تنبيه: هذا السعر مرتفع جداً. تأكد من صحته.
                                            </div>
                                        )}
                                    </div>

                                    {/* User Profile Footer */}
                                    <div style={{ background: '#0f172a', padding: '14px 18px', borderTop: '1px solid #334155' }}>
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: 38, height: 38, background: '#1e293b', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#cbd5e1', border: '1px solid #334155', fontSize: '1rem', fontWeight: 'bold' }}>
                                                    {userName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ color: '#f8fafc', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                                        {userName}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                                                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                                            <FaStar style={{ color: '#f59e0b', marginBottom: '-2px', marginRight: '2px' }} /> {userPoints} نقطة
                                                        </span>
                                                        <span style={{ fontSize: '0.6rem', background: levelData.bg, color: levelData.color, padding: '2px 6px', borderRadius: '6px', fontWeight: 'bold' }}>
                                                            {levelData.icon} {levelData.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                            <button 
                                                onClick={() => handleAction(item.id, 'declined')}
                                                style={{ flex: 1, minWidth: '80px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 'bold', transition: 'all 0.2s' }}
                                                onMouseEnter={(e) => { e.target.style.background = '#ef444410'; }}
                                                onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
                                            >
                                                <FaTimes /> رفض
                                            </button>
                                            <button 
                                                onClick={() => openEditModal(item)}
                                                style={{ flex: 1, minWidth: '80px', background: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6', padding: '10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 'bold', transition: 'all 0.2s' }}
                                                onMouseEnter={(e) => { e.target.style.background = '#3b82f610'; }}
                                                onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
                                            >
                                                <FaEdit /> تعديل
                                            </button>
                                            <button 
                                                onClick={() => handleAction(item.id, 'approved')}
                                                style={{ flex: 2, minWidth: '120px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', color: '#fff', padding: '10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)' }}
                                            >
                                                <FaCheck /> اعتماد البيانات
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Edit Modal */}
            <AnimatePresence>
                {editingItem && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(15, 23, 42, 0.8)',
                            backdropFilter: 'blur(5px)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 1000,
                            padding: '20px'
                        }}
                    >
                        <motion.div 
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            style={{
                                background: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '20px',
                                padding: '25px',
                                width: '100%',
                                maxWidth: '500px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                            }}
                        >
                            <h3 style={{ margin: '0 0 15px 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaEdit color="#3b82f6" /> تعديل المساهمة
                            </h3>
                            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '15px' }}>
                                قم بتعديل الحقول التالية بشكل مباشر:
                            </div>
                            
                            {renderEditFields()}
                            
                            {editError && (
                                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '15px' }}>
                                    {editError}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button 
                                    onClick={() => setEditingItem(null)}
                                    style={{ background: 'transparent', border: '1px solid #64748b', color: '#94a3b8', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    إلغاء
                                </button>
                                <button 
                                    onClick={saveEdit}
                                    style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}
                                >
                                    <FaSave /> حفظ التعديل
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ContributionsManager;