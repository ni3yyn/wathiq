import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaCamera, FaCheckCircle, FaExclamationTriangle, 
    FaFlask, FaSync, FaTimes, FaShieldAlt, FaStar, FaHourglassHalf, 
    FaTint, FaSoap, FaChevronRight, 
    FaChevronLeft, FaPlus, FaSun, FaImages
} from 'react-icons/fa';
import { useAppContext } from './AppContext';
import '../ComparisonPage.css';
import {
    createGenerativePartFromFile,
    processWithGemini,
    extractIngredientsFromText,
    evaluateMarketingClaims,
    analyzeIngredientInteractions,
    calculateReliabilityScore_V13,
    getScoreColor,
    getClaimsByProductType,
} from './analysisHelpers';
import SEO from './SEO';
// Removed useModalBack from here to prevent history conflicts
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

// --- FIXED CONSTANTS ---
const MASTER_CLAIM_DEFINITIONS = [
    { claim: "مرطب للبشرة", category: "الترطيب والتغذية", icon: <FaTint /> },
    { claim: "للبشرة الجافة", category: "الترطيب والتغذية", icon: <FaTint /> },
    { claim: "مرطب للشعر", category: "الترطيب والتغذية", icon: <FaTint /> },
    { claim: "دعم حاجز البشرة", category: "الترطيب والتغذية", icon: <FaShieldAlt /> },
    { claim: "مخصص للشعر الجاف", category: "صحة الشعر", icon: <FaTint /> },
    { claim: "تغذية الشعر", category: "صحة الشعر", icon: <FaStar /> },
    { claim: "مضاد لتساقط الشعر", category: "صحة الشعر", icon: <FaHourglassHalf /> },
    { claim: "تعزيز النمو", category: "صحة الشعر", icon: <FaHourglassHalf /> },
    { claim: "تكثيف الشعر", category: "صحة الشعر", icon: <FaHourglassHalf /> },
    { claim: "إصلاح التلف", category: "صحة الشعر", icon: <FaHourglassHalf /> },
    { claim: "مخصص للشعر الدهني", category: "العناية بفروة الرأس", icon: <FaSoap /> },
    { claim: "تنقية فروة الرأس", category: "العناية بفروة الرأس", icon: <FaSoap /> },
    { claim: "مضاد للقشرة", category: "العناية بفروة الرأس", icon: <FaSoap /> },
    { claim: "مخصص للشعر الجاف", category: "العناية بفروة الرأس", icon: <FaTint /> },
    { claim: "للبشرة الحساسة", category: "الحماية والتهدئة", icon: <FaShieldAlt /> },
    { claim: "مهدئ", category: "الحماية والتهدئة", icon: <FaShieldAlt /> },
    { claim: "مهدئ للبشرة", category: "الحماية والتهدئة", icon: <FaShieldAlt /> },
    { claim: "مضاد للالتهابات", category: "الحماية والتهدئة", icon: <FaShieldAlt /> },
    { claim: "مضاد للأكسدة", category: "الحماية والتهدئة", icon: <FaShieldAlt /> },
    { claim: "حماية من الشمس", category: "الحماية المتقدمة", icon: <FaSun /> },
    { claim: "حماية اللون", category: "الحماية المتقدمة", icon: <FaShieldAlt /> },
    { claim: "حماية واسعة الطيف", category: "الحماية المتقدمة", icon: <FaShieldAlt /> },
    { claim: "مقاوم للماء", category: "الحماية المتقدمة", icon: <FaShieldAlt /> },
    { claim: "حماية من الحرارة", category: "الحماية المتقدمة", icon: <FaShieldAlt /> },
    { claim: "تفتيح البشرة", category: "نقاء البشرة", icon: <FaStar /> },
    { claim: "توحيد لون البشرة", category: "نقاء البشرة", icon: <FaStar /> },
    { claim: "تفتيح البقع الداكنة", category: "نقاء البشرة", icon: <FaStar /> },
    { claim: "تفتيح تحت العين", category: "نقاء البشرة", icon: <FaStar /> },
    { claim: "نضارة فورية (Glass Skin)", category: "نقاء البشرة", icon: <FaStar /> },
    { claim: "تلميع ولمعان", category: "مظهر الشعر", icon: <FaStar /> },
    { claim: "مكافحة التجعد", category: "مظهر الشعر", icon: <FaStar /> },
    { claim: "تنقية المسام", category: "التنظيف والتقشير", icon: <FaSoap /> },
    { claim: "مضاد لحب الشباب", category: "العناية بالبشرة الدهنية", icon: <FaSoap /> },
    { claim: "للبشرة الدهنية", category: "العناية بالبشرة الدهنية", icon: <FaSoap /> },
    { claim: "توازن الزيوت", category: "العناية بالبشرة الدهنية", icon: <FaSoap /> },
    { claim: "شد المسام", category: "العناية بالبشرة الدهنية", icon: <FaSoap /> },
    { claim: "مكافحة التجاعيد", category: "مكافحة الشيخوخة", icon: <FaHourglassHalf /> },
    { claim: "شد البشرة", category: "مكافحة الشيخوخة", icon: <FaHourglassHalf /> },
    { claim: "تحفيز الكولاجين", category: "مكافحة الشيخوخة", icon: <FaHourglassHalf /> },
    { claim: "شد الجسم", category: "العناية بالجسم", icon: <FaHourglassHalf /> },
    { claim: "إزالة السيلوليت", category: "العناية بالجسم", icon: <FaHourglassHalf /> },
    { claim: "تفتيح الشفاه", category: "العناية بالجسم", icon: <FaStar /> },
    { claim: "مكافحة رائحة الجسم", category: "العناية بالجسم", icon: <FaSoap /> },
    { claim: "تفتيح المناطق الحساسة", category: "العناية بالجسم", icon: <FaStar /> },
];

const ProductInputSlot = ({ product, onUpdate, placeholderText, isDisabled }) => {
    const fileInputRef = useRef(null);
    const [localText, setLocalText] = useState('');

    useEffect(() => {
        if (!product.sourceData) setLocalText('');
    }, [product.sourceData]);

    const handleSelect = async (e, mode) => {
        if (isDisabled) return;
        
        e.preventDefault();
        e.stopPropagation(); 

        if (Capacitor.isNativePlatform()) {
            try {
                const image = await Camera.getPhoto({
                    quality: 90,
                    allowEditing: false, // <--- CHANGED TO FALSE (Skips Editor)
                    resultType: CameraResultType.Uri,
                    source: mode === 'camera' ? CameraSource.Camera : CameraSource.Photos
                });

                if (image && image.webPath) {
                    if (product.previewUrl) URL.revokeObjectURL(product.previewUrl);
                    const response = await fetch(image.webPath);
                    const blob = await response.blob();
                    const file = new File([blob], "product_image.jpg", { type: "image/jpeg" });

                    onUpdate({ 
                        sourceData: file, 
                        sourceType: 'ocr',
                        previewUrl: image.webPath, 
                        error: null, 
                    });
                }
            } catch (error) {
                console.log("User cancelled or error:", error);
            }
        } else {
            if (fileInputRef.current) fileInputRef.current.click();
        }
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (product.previewUrl) URL.revokeObjectURL(product.previewUrl);
            const previewUrl = URL.createObjectURL(file);
            onUpdate({ 
                sourceData: file, 
                sourceType: 'ocr',
                previewUrl: previewUrl, 
                error: null, 
            });
            e.target.value = '';
        }
    };

    const handleTextBlur = () => {
        if (localText.trim()) {
            onUpdate({ 
                sourceData: { type: 'manual', content: localText }, 
                sourceType: 'manual', 
                previewUrl: null, 
                error: null 
            });
        }
    };

    const handleReset = (e) => {
        if (isDisabled) return;
        e.stopPropagation();
        if (product.previewUrl) URL.revokeObjectURL(product.previewUrl);
        onUpdate({ sourceData: null, sourceType: null, previewUrl: null, error: null });
    };
    
    if (product.error) {
        return (
            <div className="comp-v3-slot error" onClick={(e) => e.stopPropagation()}>
                <div className="comp-v3-error-msg" onClick={handleReset}>
                    <FaExclamationTriangle />{product.error}
                    <small>اضغط للمحاولة مجدداً</small>
                </div>
            </div>
        );
    }
    
    return (
        <div className={`comp-v3-slot ${isDisabled ? 'disabled' : ''}`} onClick={(e) => e.stopPropagation()}>
        {!product.sourceData ? (
            <div className="comp-v3-input-methods">
                 <span className="comp-v3-slot-placeholder">{placeholderText}</span>
                
                <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    onChange={handleFileInputChange} 
                    style={{ display: 'none' }} 
                    disabled={isDisabled} 
                />

<button onClick={(e) => handleSelect(e, 'photos')} disabled={isDisabled} onTouchEnd={(e) => e.stopPropagation()}>
                    <FaImages /><span>المعرض</span>
                </button>
                
                <button 
                    className="secondary-cam-btn" 
                    onClick={(e) => handleSelect(e, 'camera')} 
                    disabled={isDisabled} 
                    style={{marginTop: '8px', opacity: 0.8, fontSize: '0.8rem'}}
                    onTouchEnd={(e) => e.stopPropagation()}
                >
                    <FaCamera /><span>تصوير</span>
                </button>

                <textarea
                    placeholder="...أو الصق المكونات"
                    value={localText}
                    onChange={(e) => setLocalText(e.target.value)}
                    onBlur={handleTextBlur}
                    disabled={isDisabled}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        ) : (
            <div className="comp-v3-preview">
            {product.sourceType === 'ocr' && product.previewUrl ? (
                <img src={product.previewUrl} alt="معاينة" />
            ) : (
                <div className="comp-v3-text-preview">{product.sourceData.content}</div>
            )}
            <button className="comp-v3-preview-reset-btn" onClick={handleReset} disabled={isDisabled}>
                <FaTimes />
            </button>
        </div>
    )}
</div>
);
};

const IntroStep = ({ onStart }) => {
    const { userProfile } = useAppContext();
    const isMale = userProfile?.settings?.gender === 'ذكر';
    const t = (female, male) => isMale ? male : female;

    return (
        <motion.div
            className="comp-v6-intro-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
        >
            <div className="comp-v6-intro-header">
                <h1>ساحة المقارنة</h1>
                <p>{t('احترتِ', 'احترتَ')} بين منتجين {t('ولم تعرفي', 'ولم تعرف')} ماذا {t('تختارين', 'تختار')}؟ {t('قارني', 'قارن')} بينهما {t('وقرري', 'وقرر')} بذكاء.</p>
            </div>

            <motion.div 
                layout 
                layoutId="comparison-arena-transition"
                className="comp-v6-rift-activator" 
                onClick={onStart}
                transition={{ type: 'spring', stiffness: 250, damping: 25, mass: 0.7 }}
            >
                <div className="rift-glow"></div>
                <div className="rift-scanline"></div>
                <div className="rift-content">
                    <FaPlus className="rift-icon" />
                    <span>{t('ابدئي الآن من هنا', 'ابدأ الآن من هنا')}</span>
                </div>
            </motion.div>
        </motion.div>
    );
};

const InputStep = ({ productLeft, setProductLeft, productRight, setProductRight, onAnalysisTrigger }) => {
    const bothProductsAdded = productLeft.sourceData && productRight.sourceData;
    const { userProfile } = useAppContext();
    const isMale = userProfile?.settings?.gender === 'ذكر';
    const t = (female, male) => isMale ? male : female;

    return (
        <motion.div className="comp-v3-step-container">
            <motion.div className="comp-v3-input-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}>
                <h2>{t('اختاري المتحدّين', 'اختر المتحدّين')}</h2>
                <p>{t('أضيفي منتجًا في كل جهة لبدء التحليل الفوري.', 'أضف منتجًا في كل جهة لبدء التحليل الفوري.')}</p>
            </motion.div>
            
            <motion.div layout layoutId="comparison-arena-transition" className="comp-v3-dual-axis-container" transition={{ type: 'spring', stiffness: 250, damping: 25, mass: 0.7 }}>
                <motion.div className={`comp-v3-product-pane ${productLeft.sourceData ? 'active' : ''}`}>
                    <ProductInputSlot product={productLeft} onUpdate={setProductLeft} placeholderText="المنتج أ" />
                </motion.div>

                <motion.div className="comp-v3-separator">
                    <div className="comp-v3-vs-icon">VS</div>
                </motion.div>

                <motion.div className={`comp-v3-product-pane ${productRight.sourceData ? 'active' : ''}`}>
                    <ProductInputSlot product={productRight} onUpdate={setProductRight} placeholderText="المنتج ب" />
                </motion.div>
            </motion.div>

            <AnimatePresence>
                {bothProductsAdded && (
                    <motion.div
                        className="comp-v3-start-analysis-footer"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                    >
                        <motion.button
                            className="comp-v3-cta-btn" onClick={onAnalysisTrigger} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <FaFlask /> {t('ابدئي التحليل', 'ابدأ التحليل')}
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* --- CRITICAL SPACER --- */}
            {/* Ensure buttons aren't hidden behind Bottom Nav */}
            <div style={{ height: '120px', width: '100%' }}></div>
        </motion.div>
    );
};

const ClaimCard = ({ index, categoryName, data, isActive, onClick, selectedClaims, handleClaimClick }) => {
    return (
        <div className={`claim-category-card-container ${isActive ? 'active' : 'inactive'}`} onClick={() => onClick(index)}>
            <div className="claim-category-card">
                <div className="card-header">
                    <span className="card-icon">{data.icon}</span>
                    <h3>{categoryName}</h3>
                </div>
                <div className="card-content">
                    <p>{isActive ? "اختر الادعاءات التي تهمك:" : "..."}</p>
                    <div className="claims-tags-container">
                        {data.claims.map(claim => {
                            const isSelected = selectedClaims.includes(claim);
                            return (
                                <button
                                    key={claim}
                                    className={`claim-tag ${isSelected ? 'selected' : ''}`}
                                    onClick={(e) => { e.stopPropagation(); handleClaimClick(claim); }}
                                    disabled={!isActive}
                                >
                                    {isSelected && <FaCheckCircle />} {claim}
                                </button>
                            );
                        })}
                    </div>
                </div>
                {isActive && <div className="active-indicator-bar" />}
            </div>
        </div>
    );
};

const TypeConfirmationStep = ({ detectedType, onConfirm, onChangeType }) => {
    const productTypes = [ 
        { id: 'shampoo', name: 'شامبو / بلسم', icon: <FaSoap /> }, 
        { id: 'serum', name: 'سيروم / علاج', icon: <FaFlask /> }, 
        { id: 'lotion_cream', name: 'كريم / مرطب', icon: <FaTint /> },
        { id: 'sunscreen', name: 'واقي شمس', icon: <FaSun /> }, 
        { id: 'cleanser', name: 'غسول', icon: <FaSoap /> },
        { id: 'hair_mask', name: 'ماسك شعر', icon: <FaStar /> },
        { id: 'other', name: 'آخر', icon: <FaPlus /> }, 
    ];

    const [isManual, setIsManual] = useState(false);
    const [selectedType, setSelectedType] = useState(detectedType || 'other');

    const handleConfirm = () => { onConfirm(selectedType); };

    return (
        <motion.div className="comp-v3-step-container" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="comp-v3-glass-card comp-type-card">
                <h3>تأكيد نوع المنتج</h3>
                <p>لقد اكتشفنا أن المنتجات هي من نوع:</p>
                {!isManual ? (
                    <div className="comp-auto-type-box">
                        <div className="auto-type-icon">{productTypes.find(t => t.id === selectedType)?.icon || <FaFlask />}</div>
                        <h4>{productTypes.find(t => t.id === selectedType)?.name || 'غير معروف'}</h4>
                        <div className="comp-type-actions">
                            <button className="comp-v3-cta-btn" onClick={handleConfirm}><FaCheckCircle /> نعم، صحيح</button>
                            <button className="comp-text-btn" onClick={() => setIsManual(true)}>لا، تغيير النوع</button>
                        </div>
                    </div>
                ) : (
                    <div className="comp-manual-type-grid">
                        {productTypes.map(t => (
                            <button key={t.id} className={`type-grid-btn ${selectedType === t.id ? 'active' : ''}`} onClick={() => setSelectedType(t.id)}>
                                {t.icon}<span>{t.name}</span>
                            </button>
                        ))}
                        <button className="comp-v3-cta-btn" onClick={handleConfirm}>تأكيد</button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const ClaimsStep = ({ productType, selectedClaims, setSelectedClaims, onAnalyze }) => {
    const { userProfile } = useAppContext();
    const isMale = userProfile?.settings?.gender === 'ذكر';
    const t = (female, male) => isMale ? male : female;

    const availableCategories = useMemo(() => {
        const allowedClaims = getClaimsByProductType(productType); 
        const allowedClaimsSet = new Set(allowedClaims);
        const productSpecificCategories = {};
        MASTER_CLAIM_DEFINITIONS.forEach(def => {
            if (allowedClaimsSet.has(def.claim)) {
                if (!productSpecificCategories[def.category]) {
                    productSpecificCategories[def.category] = { icon: def.icon, claims: [] };
                }
                productSpecificCategories[def.category].claims.push(def.claim);
            }
        });
        return productSpecificCategories;
    }, [productType]);

    const categoryKeys = useMemo(() => Object.keys(availableCategories), [availableCategories]);
    const [activeIndex, setActiveIndex] = useState(0);
    const carouselRef = useRef(null);
    
    const handleScroll = () => {
        const container = carouselRef.current;
        if (!container) return;
        const scrollLeft = Math.abs(container.scrollLeft);
        const containerWidth = container.offsetWidth;
        const isMobile = window.innerWidth <= 768;
        const cardWidth = isMobile ? containerWidth * 0.85 : containerWidth / 3;
        const newIndex = Math.round(scrollLeft / cardWidth);
        if (newIndex !== activeIndex && newIndex >= 0 && newIndex < categoryKeys.length) setActiveIndex(newIndex);
    };

    const scrollToIndex = (index) => {
        if (index < 0 || index >= categoryKeys.length) return;
        const container = carouselRef.current;
        const card = container?.children[index];
        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            setActiveIndex(index);
        }
    };

    const handleClaimClick = (claim) => {
        if (window.navigator.vibrate) window.navigator.vibrate(10);
        const newClaims = selectedClaims.includes(claim) ? selectedClaims.filter(c => c !== claim) : [...selectedClaims, claim];
        setSelectedClaims(newClaims);
    };

    useEffect(() => { setTimeout(() => scrollToIndex(0), 100); }, []);

    return (
        <motion.div className="comp-v3-step-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
             <div className="comp-ux-claims-dimension">
                <h2>{t('ماذا يهمكِ', 'ماذا يهمك')} في {productType === 'shampoo' ? 'الشامبو' : 'المنتج'}؟</h2>
                <p>{t('اختاري المعايير (اسحبي للتنقل).', 'اختر المعايير (اسحب للتنقل).')}</p>
                <div className="claims-carousel-container">
                    <button className="carousel-nav-btn next" onClick={() => scrollToIndex(activeIndex + 1)} disabled={activeIndex === categoryKeys.length - 1}><FaChevronLeft /></button>
                    <div className="claims-carousel-wrapper" ref={carouselRef} onScroll={handleScroll}>
                        {categoryKeys.map((categoryName, index) => (
                            <ClaimCard
                                key={categoryName} index={index} categoryName={categoryName}
                                data={availableCategories[categoryName]} isActive={index === activeIndex}
                                onClick={scrollToIndex} selectedClaims={selectedClaims} handleClaimClick={handleClaimClick}
                            />
                        ))}
                        <div style={{ minWidth: '1px', flex: '0 0 1px' }} />
                    </div>
                    <button className="carousel-nav-btn prev" onClick={() => scrollToIndex(activeIndex - 1)} disabled={activeIndex === 0}><FaChevronRight /></button>
                </div>
                <div className="comp-ux-claims-footer">
                    <div className="selected-count">
                        {selectedClaims.length > 0 ? <span>تم اختيار <strong style={{color: '#10b981'}}>{selectedClaims.length}</strong> معيار</span> : <span>لم يتم اختيار أي معيار</span>}
                    </div>
                    <button className="comp-v3-cta-btn" onClick={onAnalyze} disabled={selectedClaims.length === 0}>
                        {selectedClaims.length > 0 ? 'مقارنة الآن' : t('اختاري معياراً واحداً على الأقل', 'اختر معياراً واحداً على الأقل')}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const AnalysisLoadingStep = ({ progressText }) => (
    <motion.div className="comp-v3-step-container comp-v3-loading-step" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.5 }}>
        <div className="comp-v3-glass-card comp-v3-loading-card">
            <div className="comp-v3-flask-loader">
                <div className="flask">
                    <div className="liquid"></div>
                    {[1,2,3,4,5].map(i => <span key={i} className={`bubble b${i}`}></span>)}
                </div>
            </div>
            <h2>{progressText}</h2>
            <p>يقوم الذكاء الاصطناعي بتحليل كل مكون بدقة الآن...</p>
        </div>
    </motion.div>
);

const TugOfWarMetric = ({ leftValue, rightValue, label, colorLeft, colorRight }) => {
    const total = leftValue + rightValue;
    const leftPercent = total > 0 ? (leftValue / total) * 100 : 50;
    return (
        <div className="comp-v3-tug-of-war">
            <div className="tow-labels">
                <span style={{ color: colorLeft }}>{leftValue}%</span>
                <span className="tow-label">{label}</span>
                <span style={{ color: colorRight }}>{rightValue}%</span>
            </div>
            <div className="tow-bar">
                <motion.div className="tow-fill-left" style={{ background: colorLeft }} initial={{ width: '50%' }} animate={{ width: `${leftPercent}%` }} transition={{ duration: 0.8, ease: 'easeInOut' }} />
                <motion.div className="tow-fill-right" style={{ background: colorRight }} initial={{ width: '50%' }} animate={{ width: `${100 - leftPercent}%` }} transition={{ duration: 0.8, ease: 'easeInOut' }} />
            </div>
        </div>
    );
};

const ResultsStep = ({ productLeft, productRight, onReset }) => {
    const winner = useMemo(() => {
        if (!productLeft?.analysisData || !productRight?.analysisData) return 'tie';
        const scoreL = productLeft.analysisData.oilGuardScore;
        const scoreR = productRight.analysisData.oilGuardScore;
        if (Math.abs(scoreL - scoreR) < 5) return 'tie';
        return scoreL > scoreR ? 'left' : 'right';
    }, [productLeft.analysisData, productRight.analysisData]);

    const ingredientComparison = useMemo(() => {
        const leftIngredients = productLeft?.analysisData?.detected_ingredients || [];
        const rightIngredients = productRight?.analysisData?.detected_ingredients || [];
        const leftIds = new Set(leftIngredients.map(ing => ing.id));
        const rightIds = new Set(rightIngredients.map(ing => ing.id));
        const common = leftIngredients.filter(ing => rightIds.has(ing.id));
        const uniqueLeft = leftIngredients.filter(ing => !rightIds.has(ing.id));
        const uniqueRight = rightIngredients.filter(ing => !leftIds.has(ing.id));
        return { uniqueLeft, common, uniqueRight };
    }, [productLeft.analysisData, productRight.analysisData]);

    if (!productLeft?.analysisData || !productRight?.analysisData) return <div className="comp-v3-step-container">خطأ: بيانات التحليل مفقودة.</div>;
    
    const renderWarnings = (analysisData) => {
        const alerts = analysisData.scoreBreakdown.filter(item => ['deduction', 'warning', 'override'].includes(item.type));
        if (alerts.length === 0) return <div className="comp-safe-badge"><FaCheckCircle /> تركيبة نظيفة</div>;
        return (
            <div className="comp-warnings-list">
                {alerts.slice(0, 3).map((alert, i) => (
                    <div key={i} className={`comp-warning-item ${alert.type}`}><FaExclamationTriangle /><span>{alert.text.replace(/\(.*\)/, '')}</span></div>
                ))}
                {alerts.length > 3 && <small className="more-warnings">+{alerts.length - 3} تنبيهات أخرى...</small>}
            </div>
        );
    };

    const renderIngredients = (ingredients) => {
        if (!ingredients || ingredients.length === 0) return <span className="no-ingredients">لا يوجد</span>;
        const controversialIds = new Set(['parfum', 'fragrance', 'alcohol-denat', 'sodium-lauryl-sulfate', 'mineral-oil', 'talc']);
        return ingredients.map(ing => (
            <span key={ing.id} className={`comp-v3-ingredient-tag ${controversialIds.has(ing.id) ? 'controversial' : ing.functionalCategory?.includes('مكون فعال') ? 'active' : ing.functionalCategory?.includes('مرطب') ? 'hydrator' : ''}`} title={ing.name}>{ing.name}</span>
        ));
    };

    return (
        <motion.div className="comp-v3-results-dashboard" initial="hidden" animate="visible" variants={{ visible: { opacity: 1, transition: { staggerChildren: 0.1 } }, hidden: { opacity: 0 } }}>
            <motion.div className="comp-v3-results-header" variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }}>
                <h2>النتيجة النهائية للمواجهة</h2>
                <button className="comp-v3-reset-btn" onClick={onReset}><FaSync /> مقارنة جديدة</button>
            </motion.div>
            <motion.div className="comp-v3-main-results-container" variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}>
                <div className={`main-result-product ${winner === 'left' ? 'winner' : winner === 'right' ? 'loser' : ''}`}>
                    {productLeft.previewUrl && <img src={productLeft.previewUrl} alt="المنتج أ" className="comp-v3-result-img" />}
                    <h3>المنتج أ</h3>
                    <div className="comp-v3-main-score" style={{ borderColor: getScoreColor(productLeft.analysisData.oilGuardScore) }}>{productLeft.analysisData.oilGuardScore}<span>%</span></div>
                    <div className="comp-v3-verdict-card"><h5>الخلاصة</h5><p>{productLeft.analysisData.finalVerdict}</p></div>
                    {renderWarnings(productLeft.analysisData)}
                </div>
                <div className="main-result-separator"></div>
                <div className={`main-result-product ${winner === 'right' ? 'winner' : winner === 'left' ? 'loser' : ''}`}>
                    {productRight.previewUrl && <img src={productRight.previewUrl} alt="المنتج ب" className="comp-v3-result-img" />}
                    <h3>المنتج ب</h3>
                    <div className="comp-v3-main-score" style={{ borderColor: getScoreColor(productRight.analysisData.oilGuardScore) }}>{productRight.analysisData.oilGuardScore}<span>%</span></div>
                     <div className="comp-v3-verdict-card"><h5>الخلاصة</h5><p>{productRight.analysisData.finalVerdict}</p></div>
                    {renderWarnings(productRight.analysisData)}
                </div>
            </motion.div>
            <motion.div className="comp-v3-central-metrics" variants={{ hidden: { opacity: 0, y: 0 }, visible: { opacity: 1, y: 0 } }}>
                <h4>مؤشرات الأداء</h4>
                <TugOfWarMetric leftValue={productLeft.analysisData.efficacy.score} rightValue={productRight.analysisData.efficacy.score} label="الفعالية" colorLeft={getScoreColor(productLeft.analysisData.efficacy.score)} colorRight={getScoreColor(productRight.analysisData.efficacy.score)} />
                <TugOfWarMetric leftValue={productLeft.analysisData.safety.score} rightValue={productRight.analysisData.safety.score} label="السلامة" colorLeft={getScoreColor(productLeft.analysisData.safety.score)} colorRight={getScoreColor(productRight.analysisData.safety.score)} />
                 <div className="comp-v3-winner-banner" data-winner={winner}>
                    <FaCheckCircle />
                    <span>{winner === 'left' && 'المنتج أ هو الخيار الأفضل'}{winner === 'right' && 'المنتج ب هو الخيار الأفضل'}{winner === 'tie' && 'التقييم متقارب جدًا'}</span>
                </div>
            </motion.div>
            <motion.div className="comp-ux-ingredient-venn" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <h4>مقارنة تركيبة المكونات</h4>
                <div className="venn-diagram-container">
                    <div className="venn-column"><h5>فريد للمنتج أ ({ingredientComparison.uniqueLeft.length})</h5><div className="ingredient-list">{renderIngredients(ingredientComparison.uniqueLeft)}</div></div>
                    <div className="venn-column common"><h5>مكونات مشتركة ({ingredientComparison.common.length})</h5><div className="ingredient-list">{renderIngredients(ingredientComparison.common)}</div></div>
                    <div className="venn-column"><h5>فريد للمنتج ب ({ingredientComparison.uniqueRight.length})</h5><div className="ingredient-list">{renderIngredients(ingredientComparison.uniqueRight)}</div></div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const ComparisonPage = () => {
    // 1. Load State
    const loadState = (key, def) => { 
        try { 
            const saved = localStorage.getItem(key); 
            return saved ? JSON.parse(saved) : def; 
        } catch { return def; } 
    };

    // Load persisted step, but default to 0 if it looks risky
    const [currentStep, setCurrentStep] = useState(() => loadState('comp_step', 0));
    const [productType, setProductType] = useState(() => loadState('comp_type', null));
    const [selectedClaims, setSelectedClaims] = useState(() => loadState('comp_claims', []));

    const [analysisProgress, setAnalysisProgress] = useState('جاري تحليل المنتجين...');
    const [analysisLock, setAnalysisLock] = useState(false);

    // Data is NOT persisted (to save memory/crash), so it starts empty
    const initialProductState = { sourceData: null, sourceType: null, previewUrl: null, analysisData: null, error: null };
    const [productLeft, setProductLeft] = useState(initialProductState);
    const [productRight, setProductRight] = useState(initialProductState);

    const { userProfile } = useAppContext();
    const isMale = userProfile?.settings?.gender === 'ذكر';
    const t = (female, male) => isMale ? male : female;

    // --- FIX 1: AUTO-RESET IF BROKEN STATE DETECTED ---
    useEffect(() => {
        // If we think we are on the Results step (5), but we don't have the data in memory...
        if (currentStep === 5 && (!productLeft.analysisData || !productRight.analysisData)) {
            console.warn("Detected broken state (Results with no data). Resetting...");
            handleReset(); // Force restart
        }
    }, []); // Run once on mount

    // 2. Persistence Effects
    useEffect(() => { localStorage.setItem('comp_step', JSON.stringify(currentStep)); }, [currentStep]);
    useEffect(() => { localStorage.setItem('comp_type', JSON.stringify(productType)); }, [productType]);
    useEffect(() => { localStorage.setItem('comp_claims', JSON.stringify(selectedClaims)); }, [selectedClaims]);

    // 3. Back Button Logic (Step navigation)
    // Removed history logic to prevent conflicts, handled locally
    // (You can keep useModalBack if you implemented the updated version, otherwise ignore)

    // 4. Cleanup Memory
    useEffect(() => {
        const cleanup = (product) => { if (product.previewUrl) URL.revokeObjectURL(product.previewUrl); };
        return () => { cleanup(productLeft); cleanup(productRight); };
    }, []);

    const runSingleAnalysis = async (productState) => {
        let geminiResult;
        try {
            if (productState.sourceType === 'ocr') {
                const imagePart = await createGenerativePartFromFile(productState.sourceData);
                geminiResult = await processWithGemini(imagePart);
                imagePart.inlineData.data = null; 
            } else {
                geminiResult = { productType: 'other', ingredientsText: productState.sourceData.content };
            }
            const { ingredients } = await extractIngredientsFromText(geminiResult.ingredientsText);
            if (ingredients.length === 0) throw new Error("لم يتم العثور على مكونات.");
            return { ingredients, productType: geminiResult.productType };
        } catch (error) {
            console.error("Analysis Failed:", error);
            throw error;
        }
    };

    const triggerAnalysis = () => {
        if (productLeft.sourceData && productRight.sourceData && !analysisLock) { 
            setAnalysisLock(true); 
            handleStartAnalysis(); 
        }
    };
    
    const handleStartAnalysis = async () => {
        setCurrentStep(2); 
        setProductLeft(p => ({ ...p, error: null }));
        setProductRight(p => ({ ...p, error: null }));
        try {
            setAnalysisProgress('جاري تحليل المنتج الأول (1/2)...');
            await new Promise(res => setTimeout(res, 100)); 
            const leftResult = await runSingleAnalysis(productLeft);
            setProductLeft(p => ({ ...p, analysisData: { detected_ingredients: leftResult.ingredients } }));
            setProductType(leftResult.productType); 

            setAnalysisProgress('جاري تحليل المنتج الثاني (2/2)...');
            await new Promise(res => setTimeout(res, 300)); 
            const rightResult = await runSingleAnalysis(productRight);
            setProductRight(p => ({ ...p, analysisData: { detected_ingredients: rightResult.ingredients } }));
            
            setAnalysisProgress('اكتمل التحليل!');
            await new Promise(res => setTimeout(res, 500)); 
            setCurrentStep(3); 
        } catch (error) {
            console.error("Analysis Sequence failed:", error);
            setAnalysisLock(false); 
            setCurrentStep(1);
            alert(`حدث خطأ أثناء التحليل: ${error.message}`);
        }
    };

    const handleTypeConfirmed = (confirmedType) => { setProductType(confirmedType); setCurrentStep(4); };
    
    const handleFinalizeComparison = () => {
        setTimeout(() => {
            const finalize = (product) => {
                const { detected_ingredients } = product.analysisData;
                const marketingResults = evaluateMarketingClaims(detected_ingredients, selectedClaims, productType);
                const { conflicts } = analyzeIngredientInteractions(detected_ingredients);
                const finalScores = calculateReliabilityScore_V13(detected_ingredients, conflicts, marketingResults);
                return {
                    ...product,
                    analysisData: { ...product.analysisData, ...finalScores, conflicts, marketing_results: marketingResults }
                };
            };
            setProductLeft(finalize(productLeft));
            setProductRight(finalize(productRight));
            setCurrentStep(5);
        }, 0);
    };

    const handleReset = () => {
        // Clear URLs
        if (productLeft.previewUrl) URL.revokeObjectURL(productLeft.previewUrl);
        if (productRight.previewUrl) URL.revokeObjectURL(productRight.previewUrl);
        
        // Reset State
        setProductLeft(initialProductState);
        setProductRight(initialProductState);
        setSelectedClaims([]);
        setProductType(null);
        setAnalysisLock(false); 
        setCurrentStep(0);
        
        // Clear Persistence
        localStorage.removeItem('comp_step');
        localStorage.removeItem('comp_type');
        localStorage.removeItem('comp_claims');
    };
    
    const renderCurrentStep = () => {
        switch (currentStep) {
            case 0: return <IntroStep onStart={() => setCurrentStep(1)} />;
            case 1: return <InputStep productLeft={productLeft} setProductLeft={setProductLeft} productRight={productRight} setProductRight={setProductRight} onAnalysisTrigger={triggerAnalysis} />;
            case 2: return <AnalysisLoadingStep progressText={analysisProgress} />;
            case 3: return <TypeConfirmationStep detectedType={productType} onConfirm={handleTypeConfirmed} />;
            case 4: return <ClaimsStep productType={productType} selectedClaims={selectedClaims} setSelectedClaims={setSelectedClaims} onAnalyze={handleFinalizeComparison} />;
            case 5: return <ResultsStep productLeft={productLeft} productRight={productRight} onReset={handleReset} />;
            default: return <IntroStep onStart={() => setCurrentStep(1)} />;
        }
    };
    
    return (
        <div 
            className="comp-v3-page-container"
        >
            <SEO title="المقارنة" description={t("محتارة بين منتجين؟ قارني بينهما علميا واكتشفي الأفضل لجسمك.", "محتار بين منتجين؟ قارن بينهما علميا واكتشف الأفضل لجسمك.")} />
            <AnimatePresence mode="wait">{renderCurrentStep()}</AnimatePresence>
        </div>
    );
};

export default ComparisonPage;