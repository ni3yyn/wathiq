import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// ▼▼▼ GEMINI API IMPORT ▼▼▼
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  FaCamera, FaEdit, FaDownload, FaShare, FaCheckCircle, FaExclamationTriangle,
  FaTimesCircle, FaFlask, FaSync, FaEye, FaEyeSlash, FaBullhorn, FaLightbulb,
  FaInfoCircle, FaArrowRight, FaAllergies, FaAtom, FaVial, FaMicroscope,
  FaSpa, FaDizzy, FaHandSparkles, FaLeaf, FaShoppingBag, FaFileMedical,
  FaPlusCircle, FaSun, FaExclamationCircle, FaSpinner, FaSoap, FaTint,
  FaVideo,  FaStar, FaSearch, FaChevronDown, FaTimes, FaUser,  FaSignOutAlt,
  FaListUl, FaImages,
} from 'react-icons/fa';
import '../OilGuard.css';
import { combinedOilsDB } from '../components/alloilsdb.js';
import { marketingClaimsDB } from '../components/marketingclaimsdb.js';
import { 
  commonAllergies, 
  commonConditions, 
  basicSkinTypes,   // <--- Added
  basicScalpTypes   // <--- Added
} from '../components/allergiesAndConditions.js';import { shareReportWithLoading } from './shareReport';
import { downloadReportWithLoading } from './downloadReport';
import goodImageClear from '../assets/good-clear.jpeg'; 
import goodImageFlat from '../assets/good-flat.jpg';
import badImageBlurry from '../assets/bad-blurry.jpeg';
import badImageGlare from '../assets/bad-fullproduct.jpeg';
import badImageAngle from '../assets/bad-angle.jpeg';
import { db } from '../firebase'; 
import { doc, getDoc, Timestamp, collection, addDoc, query, getDocs } from 'firebase/firestore';
import { useAppContext } from './AppContext';
import { AuthModal } from './AuthModal';
import { Link } from 'react-router-dom';
import SEO from './SEO';
import { useModalBack } from './useModalBack';


// --- Helper functions (Unchanged) ---
// --- Update this function ---
const getAllIngredients = () => {
  return combinedOilsDB.ingredients.map(ing => {
    let mainCategory = 'chemical'; 
    const chemType = ing.chemicalType ? ing.chemicalType.toLowerCase() : '';
    const funcCategory = ing.functionalCategory ? ing.functionalCategory.toLowerCase() : '';

    if (chemType.includes('زيت')) mainCategory = 'oil';
    else if (chemType.includes('سيروم') || ing.id.includes('serum')) mainCategory = 'serum';
    else if (chemType.includes('حمض') || funcCategory.includes('مقشر')) mainCategory = 'acid';
    
    return { ...ing, mainCategory };
  });
};

const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeForMatching = (name) => {
  if (!name) return '';
  return name.toString().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Handle accents
    .replace(/[.,،؛()/]/g, ' ') // Replace separators with spaces, keeping hyphens
    .replace(/[^\p{L}\p{N}\s-]/gu, '') // Remove invalid symbols
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
};

const findIngredientMatches = (detectedIngredientNames, targetIngredients) => {
  if (!detectedIngredientNames?.length || !targetIngredients?.length) {
    return [];
  }

  // Step 1: Create a single, clean, searchable string, with each ingredient
  // strictly separated by commas.
  const combinedDetectedText = `,${detectedIngredientNames.map(normalizeForMatching).join(',')},`;
  
  const matches = [];
  
  // Step 2: Sort target ingredients from longest to shortest. This is CRUCIAL.
  // It ensures "butylene glycol" is checked before "glycol".
  const sortedTargets = [...targetIngredients].sort((a, b) => b.length - a.length);

  // Use a mutable variable to hold the text being processed.
  let processedText = combinedDetectedText;

  sortedTargets.forEach(targetIngredient => {
    const normalizedTarget = normalizeForMatching(targetIngredient);
    
    if (!normalizedTarget) return;

    // Step 3: Create a regex that looks for the exact normalized term
    // strictly surrounded by our comma separators.
    const escapedTarget = escapeRegExp(normalizedTarget);
    const regex = new RegExp(`,${escapedTarget},`, 'g'); // Use 'g' flag for replacement

    // Step 4: Test and Mask.
    // Check if the current state of the processed text contains our target.
    if (regex.test(processedText)) {
      matches.push(targetIngredient);
      
      // CRUCIAL FIX: Replace the found ingredient with a single comma.
      // This "masks" it, preventing any shorter ingredients (like "glycol")
      // from being found inside it during subsequent iterations.
      processedText = processedText.replace(regex, ',');
    }
  });
  
  return [...new Set(matches)]; // Return unique matches
};

const getIngredientBenefits = (ingredient) => {
    if (!ingredient || !ingredient.benefits) return [];
    return Object.keys(ingredient.benefits);
};

const sanitizeObjectForFirestore = (data) => {
  if (data === null || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(item => sanitizeObjectForFirestore(item));
  const sanitized = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      sanitized[key] = (value === undefined) ? null : sanitizeObjectForFirestore(value);
    }
  }
  return sanitized;
};

const getClaimsByProductType = (productType) => {
    const claimsByProduct = {
        shampoo: [ "تنقية فروة الرأس", "مضاد للقشرة", "مخصص للشعر الدهني", "مخصص للشعر الجاف", "مضاد لتساقط الشعر", "تعزيز النمو", "تكثيف الشعر", "مرطب للشعر", "تغذية الشعر", "إصلاح التلف", "تلميع ولمعان", "مكافحة التجعد", "حماية اللون", "حماية من الحرارة", "مهدئ", "مضاد للالتهابات" ],
        hair_mask: [ "تغذية عميقة", "إصلاح التلف", "ترطيب مكثف", "تنعيم الشعر", "مكافحة التجعد", "تقوية الشعر", "حماية اللون", "إضافة لمعان" ],
        serum: [ "مكافحة التجاعيد", "شد البشرة", "تحفيز الكولاجين", "إصلاح التلف", "مضاد للأكسدة", "تفتيح البشرة", "توحيد لون البشرة", "تفتيح البقع الداكنة", "تفتيح تحت العين", "مرطب للبشرة", "مهدئ", "مضاد للالتهابات", "للبشرة الجافة", "للبشرة الحساسة", "للبشرة الدهنية", "تنقية المسام", "توازن الزيوت", "مضاد لحب الشباب", "مضاد للرؤوس السوداء", "تقشير لطيف" ],
        oil_blend: [ "تعزيز النمو", "تغذية الشعر", "تلميع ولمعان", "إصلاح التلف", "مكافحة التجعد", "مخصص للشعر الدهني", "مخصص للشعر الجاف", "مرطب للشعر", "مرطب للبشرة", "مكافحة التجاعيد", "شد البشرة", "مضاد للأكسدة", "مهدئ", "مضاد للالتهابات", "تفتيح البقع الداكنة" ],
        lotion_cream: [ "مرطب للبشرة", "للبشرة الجافة", "للبشرة الحساسة", "للبشرة الدهنية", "مهدئ", "مضاد للأكسدة", "مكافحة التجاعيد", "شد البشرة", "تحفيز الكولاجين", "تفتيح البشرة", "توحيد لون البشرة", "تفتيح البقع الداكنة", "تفتيح تحت العين", "تنقية المسام", "إزالة السيلوليت", "شد الجسم" ],
        sunscreen: [ "حماية من الشمس", "حماية واسعة الطيف", "مقاوم للماء", "مرطب للبشرة", "مهدئ", "مضاد للأكسدة", "توحيد لون البشرة", "للبشرة الحساسة", "للبشرة الدهنية", "للبشرة الجافة" ],
        cleanser: [ "تنظيف عميق", "تنظيف لطيف", "إزالة المكياج", "للبشرة الدهنية", "للبشرة الجافة", "للبشرة الحساسة", "تنقية المسام", "مضاد لحب الشباب", "مرطب للشعر" ],
        toner: [ "مرطب للبشرة", "تهدئة البشرة", "توازن الحموضة", "تقشير لطيف", "تنقية المسام", "قابض للمسام" ],
        mask: [ "تنقية عميقة", "ترطيب مكثف", "تفتيح البشرة", "شد البشرة", "تهدئة البشرة", "تقشير" ],
        other: [ "مرطب للشعر", "مرطب للبشرة", "مهدئ", "مضاد للأكسدة", "مضاد للالتهابات", "تفتيح البشرة", "توحيد لون البشرة", "مكافحة التجاعيد", "تنقية المسام", "مضاد لحب الشباب" ]
      };
    return claimsByProduct[productType] || claimsByProduct.other;
};

// --- V2.1: Forensic Claim Evaluator (Multi-Ingredient Support) ---
const evaluateMarketingClaims = (detectedIngredients, selectedClaims = [], productType) => {
  const results = [];
  const ingredientNames = detectedIngredients.filter(ing => ing && ing.name).map(ing => ing.name);
  const claimsToAnalyze = selectedClaims.length > 0 ? selectedClaims : getClaimsByProductType(productType);
  
  claimsToAnalyze.forEach(claim => {
    const categories = marketingClaimsDB[claim];
    if (!categories) {
      console.warn(`Claim not found in database: ${claim}`);
      return;
    }
    
    const foundProven = findIngredientMatches(ingredientNames, categories.proven || []);
    const foundTraditionallyProven = findIngredientMatches(ingredientNames, categories.traditionally_proven || []);
    const foundDoubtful = findIngredientMatches(ingredientNames, categories.doubtful || []);
    const foundIneffective = findIngredientMatches(ingredientNames, categories.ineffective || []);
    
    let status = '', explanation = '', confidence = '';
    
    if (foundProven.length > 0) {
      status = '✅ مثبت علميا'; confidence = 'عالية'; explanation = `يحتوي المنتج على ${foundProven.join('، ')} المعروفين علميا بدعم ${claim}.`;
    } else if (foundTraditionallyProven.length > 0) {
      status = '🌿 مثبت تقليديا'; confidence = 'متوسطة'; explanation = `يحتوي على ${foundTraditionallyProven.join('، ')} المستخدم تقليديا لـ ${claim}، لكن الأدلة العلمية محدودة.`;
    } else if (foundDoubtful.length > 0 && foundIneffective.length === 0) {
      status = '⚖️ جزئيا صادق'; confidence = 'منخفضة'; explanation = `يحتوي على ${foundDoubtful.join('، ')}، وهناك بعض الأدلة على فاعليته في ${claim} لكنها غير كافية.`;
    } else if (foundDoubtful.length > 0 && foundIneffective.length > 0) {
      status = '⚖️ جزئيا صادق'; confidence = 'منخفضة جدا'; explanation = `يحتوي على ${foundDoubtful.join('، ')} (مشكوك في فاعليته) و${foundIneffective.join('، ')} (غير فعال)، الأدلة غير كافية.`;
    } else if (foundIneffective.length > 0) {
      status = '❌ إدعاء تسويقي بحت'; confidence = 'معدومة'; explanation = `يحتوي على ${foundIneffective.join('، ')} والذي لا يوجد دليل علمي على فاعليته في ${claim}.`;
    } else {
      status = '🚫 لا توجد مكونات مرتبطة'; confidence = 'معدومة'; explanation = `لا توجد في تركيبة المنتج أي مكونات معروفة علميا أو تقليديا بدعم ${claim}.`;
    }
    
    results.push({ claim, status, confidence, explanation, proven: foundProven, traditionallyProven: foundTraditionallyProven, doubtful: foundDoubtful, ineffective: foundIneffective });
  });
  
  return results;
};

async function createGenerativePartFromFile(file) {
    const MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024; // 3MB limit for safety
    const MAX_DIMENSION = 1024; // Max width or height for resizing

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onerror = () => reject(new Error("حدث خطأ أثناء قراءة الملف."));

        reader.onload = (event) => {
            if (!event.target.result) {
                return reject(new Error("فشل قراءة بيانات الصورة. قد يكون الملف تالفًا أو غير مدعوم."));
            }

            const img = new Image();
            img.onerror = () => reject(new Error("فشل تحميل الصورة للمعالجة."));
            
            img.onload = () => {
                // If the image is small enough (in dimensions and file size), use it directly.
                if (file.size <= MAX_FILE_SIZE_BYTES && img.width <= MAX_DIMENSION && img.height <= MAX_DIMENSION) {
                    const base64Data = event.target.result.split(',')[1];
                    return resolve({
                        inlineData: { data: base64Data, mimeType: file.type },
                    });
                }
                
                // Otherwise, resize the image on a canvas.
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                let { width, height } = img;

                if (width > height) {
                    if (width > MAX_DIMENSION) {
                        height = Math.round(height * (MAX_DIMENSION / width));
                        width = MAX_DIMENSION;
                    }
                } else {
                    if (height > MAX_DIMENSION) {
                        width = Math.round(width * (MAX_DIMENSION / height));
                        height = MAX_DIMENSION;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // Get the resized image as a Base64 string directly from the canvas.
                const compressedBase64Url = canvas.toDataURL('image/jpeg', 0.9);
                img.src = ""; 
                const compressedBase64Data = compressedBase64Url.split(',')[1];
                
                resolve({
                    inlineData: { data: compressedBase64Data, mimeType: 'image/jpeg' },
                });
            };

            img.src = event.target.result; // Set the image source from the FileReader result
        };

        reader.readAsDataURL(file); // Start the file reading process
    });
}

/**
 * Processes the image with Gemini. Now accepts a pre-made `imagePart` object.
 */
const processWithGemini = async (imagePart, setOcrDebug, setProgress) => {
  const apiKey = "AIzaSyCgc_5GsGp4untYezK_GOP8RLikmIp6xOE";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" }); // Use 1.5 Flash for JSON speed

  // Defined valid types to guide the AI
  const validTypes = "shampoo, hair_mask, serum, lotion_cream, cleanser, toner, mask, sunscreen, oil_blend, other";

  const prompt = `
  You are an expert cosmetic chemist AI. Analyze the provided image.
  
  Task 1: Identify the Product Type.
  Based on the packaging, texture, or text, classify the product into EXACTLY one of these categories: [${validTypes}].
  If you cannot determine it, use "other".

  Task 2: Your primary task is to act as a specialized ingredient extractor. You MUST analyze the provided image and perform the following steps : 1-Locate the Ingredient List: Focus ONLY on the text within the section explicitly labeled 'Ingredients', 'INCI', 'المكونات', or a similar title. 2-Ignore Everything Else: You MUST completely ignore and NOT include in your output: brand names, marketing claims (e.g., 'anti-wrinkle', 'hydrating'), logos, barcodes, usage instructions, warnings, or any text outside the official ingredient list. 3-Extract and Translate: REALISTICALLY! i dont want cutt-off ingredients names. For every single ingredient you identify, you MUST provide its standard English name AND its accurate Arabic translation and alternative names found in other products for the same ingredient. 4-Strict Formatting: Present the entire output as a multi-lines, numbered list. Each line MUST follow this exact format, including all spaces: [Number]- [English Name] || [Arabic Name] ,Example 1: 1- Aqua / ماء , Example 2: 2- Niacinamide / نياسيناميد , Example 3: 3- Simmondsia Chinensis Seed Oil / زيت بذور الجوجوبا . Language Policy: The output MUST be in English and Arabic ONLY. French and all other languages are STRICTLY FORBIDDEN. If an ingredient name is complex, provide the best possible translation for both required languages. Do not add any extra notes or explanations. REWRITE FRENCH INGREDIENTS IN ENGLISH.".

  
  OUTPUT FORMAT:
  Return a RAW JSON object (no markdown formatting, no backticks).
  {
      "detected_type": "string (one of the valid categories)",
      "ingredients_text": "string (the full list as a numbered string with line breaks)"
  }
  `;

  setProgress(30);
  setOcrDebug('جاري تحليل نوع المنتج وقراءة المكونات...');

  setProgress(50);
  const result = await model.generateContent([prompt, imagePart]);
  const response = await result.response;
  let text = response.text();

  // Clean up potential Markdown code blocks from AI response
  text = text.replace(/```json/g, '').replace(/```/g, '').trim();

  setProgress(80);
  setOcrDebug('🔄 معالجة البيانات المستخرجة...');

  try {
      const jsonResponse = JSON.parse(text);
      return jsonResponse;
  } catch (e) {
      console.error("JSON Parse Error, falling back to raw text", e);
      // Fallback: If JSON fails, treat the whole text as ingredients and default type to 'other'
      return { detected_type: 'other', ingredients_text: text };
  }
};

// --- ▲▲▲ END OF CHANGES ▲▲▲ ---


const AnalysisLoadingScreen = ({ progress }) => {
  // Compact, focused facts
  const funFacts = useMemo(() => [
    { icon: <FaLightbulb />, text: "النياسيناميد يساعد في تقليص المسام وتحسين حاجز البشرة" },
    { icon: <FaAtom />, text: "حمض الهيالورونيك يحمل 1000x وزنه ماء!" },
    { icon: <FaFlask />, text: "فيتامين C في الصباح يحمي من أضرار البيئة" },
    { icon: <FaMicroscope />, text: "الريتينويدات أكثر المكونات دراسة لمكافحة الشيخوخة" },
    { icon: <FaLeaf />, text: "الطين المغربي غني بالمعادن لتنقية البشرة" },
    { icon: <FaTint />, text: "البشرة الدهنية تحتاج ترطيب خفيف خالي من الزيوت" },
    { icon: <FaSun />, text: "واقي الشمس أهم منتج للحماية من الشيخوخة" },
    { icon: <FaSpa />, text: "الشاي الأخضر يهدئ البشرة لمكافحة الالتهابات" }
  ], []);

  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex(prevIndex => (prevIndex + 1) % funFacts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [funFacts.length]);

  return (
    <motion.div 
      className="alchemist-loader-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="alchemist-loader-panel">
        <motion.h2 
          className="alchemist-loader-title"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          مختبر وثيق
        </motion.h2>
        
        <div className="alchemist-loader-animation-area">
          <div className="alchemist-loader-beam"></div>
          
          <FaLeaf className="alchemist-loader-falling-icon i1" />
          <FaAtom className="alchemist-loader-falling-icon i2" />
          <FaVial className="alchemist-loader-falling-icon i3" />
          <FaMicroscope className="alchemist-loader-falling-icon i4" />

          <div className="alchemist-loader-cauldron">
            <div className="alchemist-loader-liquid"></div>
            <div className="alchemist-loader-bubble b1"></div>
            <div className="alchemist-loader-bubble b2"></div>
            <div className="alchemist-loader-bubble b3"></div>
            <div className="alchemist-loader-bubble b4"></div>
          </div>
        </div>
        
        <div className="alchemist-loader-fact-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={factIndex}
              className="alchemist-loader-fact"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <span className="alchemist-loader-fact-icon">
                {funFacts[factIndex].icon}
              </span>
              <p>{funFacts[factIndex].text}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div className="alchemist-loader-progress-container">
          <p className="alchemist-loader-progress-text">
            جاري التحليل... {progress}%
          </p>
          <div className="alchemist-loader-progress-bar-bg">
            <motion.div 
              className="alchemist-loader-progress-bar-fg"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ClaimTruthCard = ({ result, index }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Determine Color/Icon based on status
    let statusColor = '#94a3b8'; // Default Gray
    let statusIcon = <FaInfoCircle />;
    if (result.status.includes('✅')) { statusColor = '#10b981'; statusIcon = <FaCheckCircle />; }
    else if (result.status.includes('🌿')) { statusColor = '#f59e0b'; statusIcon = <FaLeaf />; }
    else if (result.status.includes('⚖️')) { statusColor = '#fcd34d'; statusIcon = <FaExclamationTriangle />; } // For Low Concentration/Wash-off
    else if (result.status.includes('❌')) { statusColor = '#ef4444'; statusIcon = <FaTimesCircle />; }
    else if (result.status.includes('🚫')) { statusColor = '#94a3b8'; statusIcon = <FaInfoCircle />; }
    return (
        <motion.div 
            className={`truth-card ${isOpen ? 'open' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{ borderLeftColor: statusColor }}
        >
            <button className="truth-trigger" onClick={() => setIsOpen(!isOpen)}>
                <div className="truth-header">
                    <span className="truth-icon" style={{ color: statusColor }}>{statusIcon}</span>
                    <span className="truth-title">{result.claim}</span>
                </div>
                <div className="truth-status-badge" style={{ backgroundColor: `${statusColor}20`, color: statusColor }}>
                    {result.status.replace(/✅|🌿|⚖️|❌|🚫/g, '').trim()}
                    <FaChevronDown className={`chevron ${isOpen ? 'rotated' : ''}`} />
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div className="truth-details">
                            <p className="truth-explanation">{result.explanation}</p>
                            
                            <div className="truth-evidence">
                                <span className="confidence-label">درجة الثقة: <strong>{result.confidence}</strong></span>
                                
                                {/* Show Proof Ingredients if any */}
                                {(result.proven.length > 0 || result.traditionallyProven.length > 0) && (
    <div className="evidence-pills">
        {result.proven.map(i => <span key={i} className="evidence-pill proven">{i}</span>)}
        {result.traditionallyProven.map(i => <span key={i} className="evidence-pill traditional">{i}</span>)}
    </div>
)}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const SaveProductModal = ({ show, onClose, onSave, productName, setProductName, isSaving }) => {
  if (!show) return null;

  return (
      <motion.div 
          className="modal-backdrop"
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose}
      >
          <motion.div 
              className="elegant-card"
              initial={{ y: 50, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: 50, opacity: 0 }} 
              onClick={(e) => e.stopPropagation()}
          >
              <div className="save-routine-prompt">
                  <h4>حفظ المنتج في ملفكِ الشخصي</h4>
                  <p>أعطِ هذا المنتج اسما يسهل تذكره.</p>
                  
                  <input
                      type="text"
                      className="elegant-input"
                      placeholder="اسم المنتج..."
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      autoFocus={true}
                      // CRITICAL FIX: Override global animation so it doesn't "fade in" on every keystroke
                      style={{ animation: 'none', opacity: 1, transform: 'none' }} 
                  />
                  
                  <div className="prompt-actions">
                      <button className="elegant-btn secondary" onClick={onClose}>إلغاء</button>
                      <button className="elegant-btn primary" onClick={onSave} disabled={isSaving}>
                          {isSaving ? <FaSpinner className="spinning" /> : "حفظ"}
                      </button>
                  </div>
              </div>
          </motion.div>
      </motion.div>
  );
};

// --- OilGuard Component ---
const OilGuard = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [analysisData, setAnalysisData] = useState(null);
    const [progress, setProgress] = useState(0);
    const [manualIngredients, setManualIngredients] = useState('');
    const [ocrText, setOcrText] = useState('');
    const [ocrDebug, setOcrDebug] = useState('');
    const [showTextAnalysis, setShowTextAnalysis] = useState(false);
    const [extractionDetails, setExtractionDetails] = useState([]);
    const [selectedClaims, setSelectedClaims] = useState([]);
    const [productType, setProductType] = useState(null);
    const [selectedAllergies, setSelectedAllergies] = useState([]);
    const [selectedConditions, setSelectedConditions] = useState([]);
    const [preProcessedIngredients, setPreProcessedIngredients] = useState(null);
    const [isExamplesModalVisible, setIsExamplesModalVisible] = useState(false);
    const { user, userProfile, loading: authLoading } = useAppContext();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [productName, setProductName] = useState('');
    const [showNamePrompt, setShowNamePrompt] = useState(false);
    const fileInputRef = useRef(null);
    const allIngredients = useMemo(() => getAllIngredients(), []);
    const totalSteps = 5;
    const handleBackPress = useCallback(() => { setIsExamplesModalVisible(false); }, []);
    const [userSkinType, setUserSkinType] = useState('');
    const [userScalpType, setUserScalpType] = useState('');
    const [userName, setUserName] = useState('');
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef(null);
    const [videoDevices, setVideoDevices] = useState([]);
    const cameraInputRef = useRef(null);
    // Add this state to your OilGuard component
    const [isBreakdownVisible, setIsBreakdownVisible] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
const [showSuggestions, setShowSuggestions] = useState(false);
const manualInputRef = useRef(null); // Ref for the textarea
const [ghostText, setGhostText] = useState('');
const [showManualTypeGrid, setShowManualTypeGrid] = useState(false);
const [claimSearchTerm, setClaimSearchTerm] = useState('');

const isMale = userProfile?.settings?.gender === 'ذكر';
    // Helper: t(femaleText, maleText)
    const t = (female, male) => isMale ? male : female;

    useEffect(() => {
        if (isExamplesModalVisible) {
          window.history.pushState(null, '', window.location.href);
          window.addEventListener('popstate', handleBackPress);
        }
        return () => { window.removeEventListener('popstate', handleBackPress); };
    }, [isExamplesModalVisible, handleBackPress]);
    
    const allSearchableTerms = useMemo(() => {
      const allTerms = new Map();
  
      allIngredients.forEach(ing => {
          const allNames = [
              ing.id, 
              ing.name, 
              ing.scientific_name, 
              ...(ing.searchKeywords || [])
          ]
          .filter(Boolean)
          .map(name => normalizeForMatching(String(name)));
          
          allNames.forEach(normalized => {
              if (normalized.length > 2 && !allTerms.has(normalized)) {
                  allTerms.set(normalized, ing);
              }
          });
      });
  
      return Array.from(allTerms.entries())
        .map(([term, ingredient]) => ({ term, ingredient }))
        .sort((a, b) => b.term.length - a.term.length);
  
  }, [allIngredients]);

    useEffect(() => {
      const fetchProfileSettings = async () => {
          if (user) {
              try {
                  const profileRef = doc(db, 'profiles', user.uid);
                  const docSnap = await getDoc(profileRef);

                  if (docSnap.exists()) {
                      const settings = docSnap.data().settings;
                      
                      setUserName(settings.name || '');
                      setUserSkinType(settings.skinType || '');
                      setUserScalpType(settings.scalpType || '');

                      // Directly use the arrays of IDs from Firestore
                      setSelectedAllergies(settings.allergies || []);
                      setSelectedConditions(settings.conditions || []);
                  }
              } catch (error) {
                  console.error("Failed to fetch user profile settings:", error);
              }
          }
      };
      fetchProfileSettings();
    }, [user]);

    useEffect(() => {
      let timeoutId;
      if (isCameraOpen) {
          // Set a 60-second timeout to automatically close the camera
          timeoutId = setTimeout(() => {
              const stream = videoRef.current?.srcObject;
              if (stream) {
                  stream.getTracks().forEach(track => track.stop());
              }
              setIsCameraOpen(false);
              alert("تم إغلاق الكاميرا تلقائيًا للحفاظ على البطارية.");
          }, 40000); // 60 seconds
      }
  
      return () => {
          if (timeoutId) {
              clearTimeout(timeoutId);
          }
      };
  }, [isCameraOpen]);

  const handleCloseNamePrompt = useCallback(() => {
    setShowNamePrompt(false);
}, []);

  useModalBack(isExamplesModalVisible, () => setIsExamplesModalVisible(false), '#tips');

    // 2. Save Name Prompt
    useModalBack(showNamePrompt, handleCloseNamePrompt, '#save-product'); 

    // 3. Camera View (Critical for UX)
    // If camera is open, Back button should close camera, not leave page
    useModalBack(isCameraOpen, () => {
        // Logic to close camera stream (copied from your existing handleClose)
        const stream = videoRef.current?.srcObject;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        setIsCameraOpen(false);
    }, '#camera');
    
    const productTypes = [ 
        { id: 'shampoo', name: 'شامبو / بلسم', icon: <FaSpa />, description: 'للشعر' }, 
        { id: 'hair_mask', name: 'حمام زيت / قناع شعر', icon: <FaHandSparkles />, description: 'علاجات الشعر' },
        { id: 'serum', name: 'سيروم', icon: <FaFlask />, description: 'للوجه أو الشعر' }, 
        { id: 'lotion_cream', name: 'كريم / مرطب ', icon: <FaHandSparkles />, description: 'منتجات ترطيب البشرة' },
        { id: 'cleanser', name: 'غسول / صابون', icon: <FaSoap />, description: 'لتنظيف الوجه أو الجسم' },
        { id: 'toner', name: 'تونر / ماء ورد', icon: <FaTint />, description: 'لإعادة توازن البشرة' },
        { id: 'mask', name: 'قناع / مقشر', icon: <FaAllergies />, description: 'للوجه أو الجسم' },
        { id: 'sunscreen', name: 'واقي شمس', icon: <FaSun />, description: 'للحماية من الشمس' }, 
        { id: 'oil_blend', name: 'مزيج زيوت', icon: <FaLeaf />, description: 'نباتية أو عطرية' }, 
        { id: 'other', name: 'أخرى', icon: <FaShoppingBag />, description: 'أي منتج تجميلي آخر' }, 
    ];

    const goToNextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
    const goToPreviousStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));
  
    const resetAnalysis = () => {
      setCurrentStep(0); setAnalysisData(null); setManualIngredients(''); setOcrText('');
      setOcrDebug(''); setProgress(0); setShowTextAnalysis(false); setExtractionDetails([]);
      setSelectedClaims([]); setProductType(null);
      setPreProcessedIngredients(null);
      setProductName('');
      setShowNamePrompt(false); setShowManualTypeGrid(false);
      if (fileInputRef.current) fileInputRef.current.value = null;
    };
  
    const handleClaimSelection = (claim) => setSelectedClaims(prev => prev.includes(claim) ? prev.filter(c => c !== claim) : [...prev, claim]);
    const selectAllClaims = () => { const allProductClaims = getClaimsByProductType(productType); setSelectedClaims(allProductClaims); };
    const clearAllClaims = () => setSelectedClaims([]);
    
    // The prepareImageForOcr function is no longer needed and has been removed.
    
   const preprocessOCRText = (text) => {
  if (!text) return '';
  return text; // Return the raw text with no changes
};
    
const extractIngredientsFromText = async (text) => {
  return new Promise(resolve => {
      const foundIngredients = new Map();
      const extractionDetails = [];
      if (!text) {
          resolve({ ingredients: [], details: [] });
          return;
      }

      // Step 1: Split the AI output into individual lines to respect its structure.
      const lines = text.split('\n').filter(line => line.trim() !== '');

      // Step 2: Process each line independently to find one best match per line.
      lines.forEach(line => {
          // Step 3: Precisely extract the English ingredient name from the formatted line.
          // This regex captures the text between the number/dash and the first slash.
          const match = line.match(/^\s*\d+\s*-\s*([^|]+)/);
          if (!match || !match[1]) {
              return; // Skip any lines that don't fit the "Number - English / Arabic" format.
          }

          const detectedName = match[1].trim();
          const normalizedDetectedName = normalizeForMatching(detectedName);

          // Step 4: Find the single best (longest) match from the database for this specific ingredient name.
          // The `allSearchableTerms` list is pre-sorted from longest to shortest.
          for (const { term, ingredient } of allSearchableTerms) {
              // We use a regex with word boundaries (\b) to ensure we match the full, distinct term
              // and not just a part of a word.
              const escapedTerm = escapeRegExp(term);
              const regex = new RegExp(`\\b${escapedTerm}\\b`, 'i'); // Case-insensitive whole-word matching

              if (regex.test(normalizedDetectedName)) {
                  // A match is found. Add it to our results if it's new.
                  if (!foundIngredients.has(ingredient.id)) {
                      foundIngredients.set(ingredient.id, ingredient);
                      extractionDetails.push({
                          ingredientId: ingredient.id,
                          matchedText: `"${detectedName}"`, // The exact text identified on this line
                          ingredientName: ingredient.name, // The official name from our database
                          pattern: `مطابقة من السطر` // A clear note on how it was found
                      });
                  }
                  // CRUCIAL: Once the best match for a line is found, we immediately stop
                  // and move to the next line, preventing any shorter, partial matches.
                  return;
              }
          }
      });

      resolve({ ingredients: Array.from(foundIngredients.values()), details: extractionDetails });
  });
};
    
    // --- ▼▼▼ START OF CHANGES ▼▼▼ ---
    /**
     * Updated file selection handler using the new streamlined process.
     */

    const handleOpenCamera = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          alert("متصفحك لا يدعم الوصول إلى الكاميرا.");
          return;
      }

      try {
          // --- Step 1: Get a list of all available video cameras ---
          await navigator.mediaDevices.getUserMedia({ video: true }); // Request permission first to get camera labels
          const devices = await navigator.mediaDevices.enumerateDevices();
          const backCameras = devices.filter(device => 
              device.kind === 'videoinput' && 
              (device.label.toLowerCase().includes('back') || device.facing === 'environment')
          );

          if (backCameras.length === 0) {
              alert("لم يتم العثور على كاميرا خلفية.");
              return;
          }

          // --- Step 2: Test each back camera to find the one with the best resolution ---
          let bestDevice = null;
          let maxResolution = 0;

          // We'll test each camera sequentially
          for (const camera of backCameras) {
              let stream;
              try {
                  // Request a high-resolution stream from this specific camera
                  const highResConstraints = {
                      video: {
                          deviceId: { exact: camera.deviceId },
                          width: { ideal: 4096 }, // Request a very high resolution
                          height: { ideal: 2160 }
                      }
                  };
                  stream = await navigator.mediaDevices.getUserMedia(highResConstraints);
                  
                  const track = stream.getVideoTracks()[0];
                  const settings = track.getSettings();
                  const resolution = settings.width * settings.height;

                  console.log(`Testing camera: ${camera.label} | Resolution: ${settings.width}x${settings.height} (${resolution})`);

                  // If this camera provides a better resolution, it's our new best candidate
                  if (resolution > maxResolution) {
                      maxResolution = resolution;
                      bestDevice = camera;
                  }

                  // IMPORTANT: Stop the track immediately after checking to free up the camera
                  track.stop();

              } catch (err) {
                  console.warn(`Could not get high-res stream from ${camera.label}:`, err);
                  if (stream) {
                      stream.getTracks().forEach(track => track.stop());
                  }
                  continue; // Move to the next camera
              }
          }

          if (!bestDevice) {
              console.warn("Could not determine the best camera, falling back to the first one.");
              bestDevice = backCameras[0];
          }

          console.log(`--- Best camera found: ${bestDevice.label} with resolution ${maxResolution} ---`);

          // --- Step 3: Open a stream with the winning camera ---
          const finalConstraints = {
            video: {
                deviceId: { exact: bestDevice.deviceId },
                // Use 'advanced' constraints to push for the highest resolution.
                // We request a very high value, and the browser will provide the best it can.
                width: { ideal: 4096 },
                height: { ideal: 2160 }
            }
        };

          const finalStream = await navigator.mediaDevices.getUserMedia(finalConstraints);
          setIsCameraOpen(true);
          
          setTimeout(() => {
              if (videoRef.current) {
                  videoRef.current.srcObject = finalStream;
              }
          }, 100);

      } catch (err) {
          console.error("A critical error occurred while accessing the camera:", err);
          alert("حدث خطأ فادح أثناء الوصول إلى الكاميرا. يرجى إعادة تحميل الصفحة والمحاولة مرة أخرى.");
      }
  };

  const handleCapture = () => {
      if (videoRef.current) {
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          
          // Stop the camera stream
          const stream = videoRef.current.srcObject;
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
          videoRef.current.srcObject = null;
          setIsCameraOpen(false);

          // Convert canvas to a File object and process it
          canvas.toBlob(blob => {
              const capturedFile = new File([blob], "capture.jpg", { type: "image/jpeg" });
              // Create a synthetic event object to pass to handleFileSelect
              const syntheticEvent = { target: { files: [capturedFile] } };
              handleFileSelect(syntheticEvent);
          }, 'image/jpeg', 0.95);
      }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    setCurrentStep(3); // Show loading screen
    setProgress(0);
    setOcrDebug('');

    try {
        setOcrDebug('🔄 جاري تجهيز الصورة وضمان توافقها...');
        setProgress(10);
        
        const imagePart = await createGenerativePartFromFile(file);
        
        // 1. Get JSON result
        const aiResult = await processWithGemini(imagePart, setOcrDebug, setProgress);
        
        setOcrDebug('🔬 يتم التعرف الذكي على المكونات...');
        
        // 2. Extract ingredients from the text part of the JSON
        const { ingredients, details } = await extractIngredientsFromText(aiResult.ingredients_text);

        if (ingredients.length === 0) {
            throw new Error("لم نتمكن من التعرف على أي مكونات معروفة.");
        }

        // 3. Set Data
        setOcrText(aiResult.ingredients_text); 
        setPreProcessedIngredients(ingredients); 
        setExtractionDetails(details);
        
        // 4. Auto-Set Product Type
        setProductType(aiResult.detected_type || 'other');
        
        setCurrentStep(1); 
    } catch (error) {
        console.error('❌ فشل التحليل المبدئي:', error);
        setOcrDebug(`❌ فشل في قراءة الصورة: ${error.message}`);
        setTimeout(() => { 
            resetAnalysis(); 
            
            alert(`خطأ: ${error.message}`); 
        }, 1500);
    }
};
    // --- ▲▲▲ END OF CHANGES ▲▲▲ ---
  
    const extractIngredientsFromManualText = (text, allSearchableTerms) => { // Added allSearchableTerms here
      const foundIngredients = new Map();
      const extractionDetails = [];
      if (!text || !allSearchableTerms) { // Added a check for allSearchableTerms
          return { ingredients: [], details: [] };
      }
    
      // Step 1: Normalize the entire user input block. This cleans up the text for reliable matching.
      let processedText = normalizeForMatching(text);
    
      // Step 2: Iterate through the master list of all searchable terms, which is pre-sorted from longest to shortest.
      // This is crucial to match "sodium hyaluronate" before it can match "sodium".
      allSearchableTerms.forEach(({ term, ingredient }) => {
          const escapedTerm = escapeRegExp(term);
          
          // Use a regex with word boundaries (\b) to ensure we match the full term and not just part of a larger word.
          const regex = new RegExp(`\\b${escapedTerm}\\b`, 'g');
    
          // Step 3: Test for a match and then "mask" the found ingredient.
          if (regex.test(processedText)) {
              // Replace the found term with a placeholder to prevent it from being matched again
              // by a shorter, less specific term later in the loop.
              processedText = processedText.replace(regex, (match) => {
                  // Add the ingredient to our results only if it's the first time we've found it.
                  if (!foundIngredients.has(ingredient.id)) {
                      foundIngredients.set(ingredient.id, ingredient);
                      extractionDetails.push({
                          ingredientId: ingredient.id,
                          matchedText: `"${match}"`, // The text that was actually matched
                          ingredientName: ingredient.name, // The official name from our database
                          pattern: `مطابقة يدوية`
                      });
                  }
                  // Return a placeholder of the same length to avoid shifting text positions.
                  return '#'.repeat(match.length);
              });
          }
      });
    
      return { ingredients: Array.from(foundIngredients.values()), details: extractionDetails };
    };

    const levenshteinDistance = (s1, s2) => {
      s1 = s1.toLowerCase();
      s2 = s2.toLowerCase();
    
      const costs = [];
      for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
          if (i === 0) {
            costs[j] = j;
          } else {
            if (j > 0) {
              let newValue = costs[j - 1];
              if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
              }
              costs[j - 1] = lastValue;
              lastValue = newValue;
            }
          }
        }
        if (i > 0) {
          costs[s2.length] = lastValue;
        }
      }
      return costs[s2.length];
    };

    const handleManualInputStart = () => {
    if (!manualIngredients.trim()) return;

    // --- CONFIGURATION ---
    // How similar words must be to be considered a match (e.g., 0.8 = 80% similar).
    // This prevents "acid" from matching "lactic acid" accidentally.
    const SIMILARITY_THRESHOLD = 0.8; 

    // Prepare user input and the database of all possible ingredient names
    const userInputAsArray = manualIngredients.split(/[,\n]+/).map(name => name.trim()).filter(Boolean);
    const allDbIngredientNames = allIngredients.flatMap(ing =>
        [ing.id, ing.name, ing.scientific_name, ...(ing.searchKeywords || [])].filter(Boolean)
    );

    const foundIngredientsMap = new Map();

    userInputAsArray.forEach(userInput => {
        const normalizedUserInput = normalizeForMatching(userInput);
        if (!normalizedUserInput) return;

        // --- PASS 1: Exact Match (Fast) ---
        // First, try to find a perfect match. This is efficient and handles most cases.
        const perfectMatch = allDbIngredientNames.find(dbName => normalizeForMatching(dbName) === normalizedUserInput);

        if (perfectMatch) {
            // If a perfect match is found, we're done with this user input term.
            const ingredientObject = allIngredients.find(ing => [ing.id, ing.name, ing.scientific_name, ...(ing.searchKeywords || [])].includes(perfectMatch));
            if (ingredientObject && !foundIngredientsMap.has(ingredientObject.id)) {
                foundIngredientsMap.set(ingredientObject.id, { ingredient: ingredientObject, matchedText: `"${userInput}" (مطابقة تامة)` });
            }
            return; // Move to the next term in userInputAsArray
        }

        // --- PASS 2: Fuzzy Match for Typos (Slower, but effective) ---
        // If no perfect match was found, we now look for the closest possible typo.
        let bestMatch = { name: null, distance: Infinity };

        allDbIngredientNames.forEach(dbName => {
            const normalizedDbName = normalizeForMatching(dbName);
            const distance = levenshteinDistance(normalizedUserInput, normalizedDbName);

            if (distance < bestMatch.distance) {
                bestMatch = { name: dbName, distance: distance };
            }
        });

        // --- Threshold Check ---
        // After checking all DB names, see if our best match is "good enough".
        if (bestMatch.name) {
            const longerLength = Math.max(normalizedUserInput.length, normalizeForMatching(bestMatch.name).length);
            const similarity = (longerLength - bestMatch.distance) / longerLength;

            if (similarity >= SIMILARITY_THRESHOLD) {
                const ingredientObject = allIngredients.find(ing => [ing.id, ing.name, ing.scientific_name, ...(ing.searchKeywords || [])].includes(bestMatch.name));
                if (ingredientObject && !foundIngredientsMap.has(ingredientObject.id)) {
                    // Store the ingredient and note that it was a corrected typo.
                    foundIngredientsMap.set(ingredientObject.id, { ingredient: ingredientObject, matchedText: `"${userInput}" (تم التصحيح إلى: ${ingredientObject.name})` });
                }
            }
        }
    });

    const ingredients = Array.from(foundIngredientsMap.values()).map(item => item.ingredient);
    
    // Create a more descriptive details list for the user.
    const details = Array.from(foundIngredientsMap.values()).map(item => ({
        ingredientId: item.ingredient.id,
        matchedText: item.matchedText,
        ingredientName: item.ingredient.name,
        pattern: 'مطابقة يدوية'
    }));
    
    if (ingredients.length === 0) {
        alert("لم نتمكن من التعرف على أي مكونات معروفة. يرجى التحقق من الإملاء.");
        return;
    }

    setOcrText(manualIngredients);
    setPreProcessedIngredients(ingredients);
    setExtractionDetails(details);
    setShowManualTypeGrid(true);
    goToNextStep();
};

// --- NEW HANDLERS FOR AUTOCOMPLETE ---

// --- Replace your existing handleManualInputChange with this one ---

// --- REPLACE your existing handleManualInputChange ---
const handleManualInputChange = (e) => {
  const value = e.target.value;
  setManualIngredients(value);
  
  // Clear suggestions immediately if empty to make UI snappy
  if (!value.trim()) {
      setShowSuggestions(false);
      setGhostText('');
  }
};

// 2. Heavy Calculation Effect (Waits 300ms after typing stops)
useEffect(() => {
  // Don't run if input is empty or too short
  const currentWord = manualIngredients.split(/[,\n]+/).pop().trim();
  if (!manualIngredients || currentWord.length < 2) {
      return;
  }

  const timerId = setTimeout(() => {
      const normalizedCurrentWord = normalizeForMatching(currentWord);
      
      // Pass 1: Fast Path (Direct StartsWith)
      const directSuggestions = allSearchableTerms
          .filter(({ term }) => term.startsWith(normalizedCurrentWord))
          .slice(0, 7);

      if (directSuggestions.length > 0) {
          setSuggestions(directSuggestions);
          setShowSuggestions(true);
          setActiveSuggestionIndex(0);
          updateGhostText(0, directSuggestions, manualIngredients);
          return;
      }

      // Pass 2: Heavy Fuzzy Search (Levenshtein)
      // Only runs if user stops typing and no direct match found
      const SIMILARITY_THRESHOLD = 0.7;
      const fuzzyMatches = [];
      
      // Optimization: Use a for-loop instead of forEach for better performance on large arrays
      for (let i = 0; i < allSearchableTerms.length; i++) {
          const item = allSearchableTerms[i];
          
          // Quick check: Length difference optimization
          // If lengths differ by more than 30%, don't even bother calculating Levenshtein
          if (Math.abs(item.term.length - normalizedCurrentWord.length) > 3) continue;

          const distance = levenshteinDistance(normalizedCurrentWord, item.term);
          const longerLength = Math.max(normalizedCurrentWord.length, item.term.length);
          const similarity = (longerLength - distance) / longerLength;
          
          if (similarity >= SIMILARITY_THRESHOLD) {
              fuzzyMatches.push({ ...item, similarity });
          }
          
          // Limit results early to save CPU
          if (fuzzyMatches.length >= 10) break;
      }

      const sortedFuzzySuggestions = fuzzyMatches
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 5);

      setSuggestions(sortedFuzzySuggestions);
      setShowSuggestions(sortedFuzzySuggestions.length > 0);
      if(sortedFuzzySuggestions.length > 0) {
          setActiveSuggestionIndex(0);
          updateGhostText(0, sortedFuzzySuggestions, manualIngredients);
      }

  }, 300); // Wait 300ms

  // Cleanup: Cancel the heavy math if user types again
  return () => clearTimeout(timerId);
}, [manualIngredients, allSearchableTerms]);

// --- NEW HELPER FOR GHOST TEXT ---
const updateGhostText = (currentIndex, currentSuggestions, currentManualInput) => {
  if (!currentSuggestions || currentSuggestions.length === 0 || currentIndex < 0) {
      setGhostText('');
      return;
  }

  const currentWord = currentManualInput.split(/[,\n]/).pop().trim();
  const activeSuggestion = currentSuggestions[currentIndex];
  
  // Ensure activeSuggestion and its properties exist
  if (!activeSuggestion || !activeSuggestion.ingredient || !activeSuggestion.ingredient.name) {
      setGhostText('');
      return;
  }
  
  const suggestionName = activeSuggestion.ingredient.name;

  const normalizedCurrentWord = normalizeForMatching(currentWord);
  const normalizedSuggestionName = normalizeForMatching(suggestionName);

  let remainder = '';
  // Check if the suggestion starts with the user's word (case-insensitive)
  if (normalizedSuggestionName.startsWith(normalizedCurrentWord) && normalizedCurrentWord.length > 0) {
      // Use the original casing from the suggestion for the preview
      remainder = suggestionName.substring(currentWord.length);
  }
  
  setGhostText(remainder);
};

// --- REPLACE your existing handleSuggestionClick ---
const handleSuggestionClick = (suggestion) => {
  const currentWords = manualIngredients.split(/([,\n])/);
  currentWords[currentWords.length - 1] = ' ' + suggestion.ingredient.name + ', ';
  const newValue = currentWords.join('');
  
  setManualIngredients(newValue);
  setShowSuggestions(false);
  setGhostText(''); // Clear ghost text on selection
  manualInputRef.current?.focus();
};

// --- REPLACE your existing handleKeyDown ---
const handleKeyDown = (e) => {
  if (!showSuggestions && !ghostText) return;

  // --- Logic to accept the ghost text suggestion ---
  if ((e.key === 'Tab' || e.key === 'ArrowRight') && ghostText) {
      // Only autocomplete if the cursor is at the very end of the input
      if (e.currentTarget.selectionStart === manualIngredients.length) {
          e.preventDefault();
          // The active suggestion is the one that generated the ghost text
          const suggestionToAccept = suggestions[activeSuggestionIndex];
          if (suggestionToAccept) {
              handleSuggestionClick(suggestionToAccept);
          }
      }
      return; // Stop further execution for this key press
  }

  if (!showSuggestions) return;

  // --- Logic for navigating the suggestions list ---
  let newIndex;
  switch (e.key) {
      case 'ArrowDown':
          e.preventDefault();
          newIndex = (activeSuggestionIndex + 1) % suggestions.length;
          setActiveSuggestionIndex(newIndex);
          updateGhostText(newIndex, suggestions, manualIngredients); // Update ghost text
          break;
      case 'ArrowUp':
          e.preventDefault();
          newIndex = (activeSuggestionIndex - 1 + suggestions.length) % suggestions.length;
          setActiveSuggestionIndex(newIndex);
          updateGhostText(newIndex, suggestions, manualIngredients); // Update ghost text
          break;
      case 'Enter':
          e.preventDefault();
          if (suggestions.length > 0) {
              handleSuggestionClick(suggestions[activeSuggestionIndex]);
          }
          break;
      case 'Escape':
          setShowSuggestions(false);
          setGhostText(''); // Clear ghost text on escape
          break;
      default:
          break;
  }
};

const analyzeIngredientInteractions = (ingredients) => {
  const conflicts = [];
  const user_specific_alerts = [];
  const foundConflicts = new Set();
  
  const detectedIngredientIds = new Set(ingredients.map(ing => ing.id));

  // --- 1. Synergy Conflict Detection ---
  ingredients.forEach(ingredientInProduct => {
      const dbEntry = allIngredients.find(db_ing => db_ing.id === ingredientInProduct.id);
      if (dbEntry && dbEntry.negativeSynergy) {
          for (const conflictingId in dbEntry.negativeSynergy) {
              if (detectedIngredientIds.has(conflictingId)) {
                  const conflictPairKey = [ingredientInProduct.id, conflictingId].sort().join('+');
                  if (!foundConflicts.has(conflictPairKey)) {
                      const conflictingIngredient = ingredients.find(ing => ing.id === conflictingId);
                      if (conflictingIngredient) {
                          conflicts.push({
                              pair: [ingredientInProduct.name, conflictingIngredient.name],
                              reason: dbEntry.negativeSynergy[conflictingId].reason
                          });
                          foundConflicts.add(conflictPairKey);
                      }
                  }
              }
          }
      }
  });
  
  // --- 2. User-Specific Alert Logic (Merged Bio + Conditions) ---
  
  // A. Build Lookups
  const userAllergenIngredients = new Set(
      selectedAllergies.flatMap(id => commonAllergies.find(a => a.id === id)?.ingredients || []).map(normalizeForMatching)
  );

  // Build a map of [Ingredient Name] -> [Reason]
  const userConditionAvoidMap = new Map();
  const userBeneficialMap = new Map();

  // Helper to add to maps
  const addToMap = (list, reason, isAvoid) => {
      if (!list) return;
      list.forEach(ing => {
          const norm = normalizeForMatching(ing);
          if (isAvoid) userConditionAvoidMap.set(norm, reason);
          else userBeneficialMap.set(norm, reason);
      });
  };

  // B. Process Conditions
  selectedConditions.forEach(id => {
      const c = commonConditions.find(x => x.id === id);
      if (c) {
          addToMap(c.avoidIngredients, c.name, true);
          addToMap(c.beneficialIngredients, c.name, false);
      }
  });

  // C. Process Skin Type (Bio)
  if (userSkinType) {
      const skinData = basicSkinTypes.find(t => t.id === userSkinType);
      if (skinData) {
          addToMap(skinData.avoidIngredients, `بشرة ${skinData.label}`, true);
          addToMap(skinData.beneficialIngredients, `بشرة ${skinData.label}`, false);
      }
  }

  // D. Process Scalp Type (Bio)
  if (userScalpType) {
      const scalpData = basicScalpTypes.find(t => t.id === userScalpType);
      if (scalpData) {
          addToMap(scalpData.avoidIngredients, `فروة رأس ${scalpData.label}`, true);
          addToMap(scalpData.beneficialIngredients, `فروة رأس ${scalpData.label}`, false);
      }
  }
  
  // E. Check Ingredients against Rules
  ingredients.forEach(ingredientInProduct => {
      const allNames = [
          ingredientInProduct.name, 
          ingredientInProduct.scientific_name, 
          ...(ingredientInProduct.searchKeywords || [])
      ].filter(Boolean).map(normalizeForMatching);

      // 1. Check Allergies (High Priority)
      for (const name of allNames) {
          if (userAllergenIngredients.has(name)) {
              const allergy = commonAllergies.find(a => selectedAllergies.includes(a.id) && a.ingredients.map(normalizeForMatching).includes(name));
              user_specific_alerts.push({ 
                  type: 'danger', 
                  text: `🚨 خطر الحساسية: يحتوي على ${ingredientInProduct.name}، المرتبط بـ "${allergy?.name || 'حساسية محددة'}" لديك.` 
              });
              break; 
          }
      }

      // 2. Check Avoidance Rules (Warning)
      for (const name of allNames) {
          if (userConditionAvoidMap.has(name)) {
              const reason = userConditionAvoidMap.get(name);
              user_specific_alerts.push({ 
                  type: 'warning', 
                  text: `⚠️ تنبيه لـ (${reason}): ينصح بتجنب ${ingredientInProduct.name}.`
              });
              break; 
          }
      }

      // 3. Check Beneficial Rules (Good)
      for (const name of allNames) {
          if (userBeneficialMap.has(name)) {
              const reason = userBeneficialMap.get(name);
              user_specific_alerts.push({ 
                  type: 'good', 
                  text: `✅ مفيد لـ (${reason}): يحتوي على ${ingredientInProduct.name}.`
              });
              break; 
          }
      }
  });
  
  // Deduplicate alerts based on text
  const uniqueAlerts = Array.from(new Map(user_specific_alerts.map(item => [item.text, item])).values());
  
  return { conflicts, user_specific_alerts: uniqueAlerts };
};
      
    const analyzeSunscreen = (ingredients) => {
        const uva_strong = ['zinc-oxide', 'tinosorb-s', 'tinosorb-m', 'mexoryl-sx', 'mexoryl-xl', 'uvinul-a-plus', 'mexoryl-400'];
        const uva_moderate = ['avobenzone'];
        const uvb_strong = ['zinc-oxide', 'titanium-dioxide', 'tinosorb-s', 'tinosorb-m', 'mexoryl-xl', 'uvinul-t-150'];
        const uvb_moderate = ['octocrylene', 'octinoxate', 'octisalate', 'homosalate'];
        const stabilizers = ['octocrylene', 'tinosorb-s', 'tinosorb-m', 'mexoryl-xl'];
        const controversial = ['oxybenzone', 'octinoxate'];
        const antioxidants = ['tocopherol', 'ferulic-acid', 'resveratrol-serum', 'vitamin-c'];
        let found_uva_strong = [], found_uva_moderate = [], found_uvb_strong = [], found_uvb_moderate = [], found_stabilizers = [], found_controversial = [], found_boosters = [], issues = [];
        ingredients.forEach(ing => {
          if (uva_strong.includes(ing.id)) found_uva_strong.push(ing.name);
          if (uva_moderate.includes(ing.id)) found_uva_moderate.push(ing.name);
          if (uvb_strong.includes(ing.id)) found_uvb_strong.push(ing.name);
          if (uvb_moderate.includes(ing.id)) found_uvb_moderate.push(ing.name);
          if (stabilizers.includes(ing.id)) found_stabilizers.push(ing.name);
          if (controversial.includes(ing.id)) found_controversial.push(ing.name);
          if (antioxidants.includes(ing.id)) found_boosters.push(ing.name);
          if (ing.id === 'zinc-oxide' || ing.id === 'titanium-dioxide') issues.push('قد يترك أثرا أبيض على البشرة (white cast).');
          if (['avobenzone', 'oxybenzone', 'octocrylene'].includes(ing.id)) issues.push('يحتوي على فلاتر كيميائية قد تسبب حساسية أو تهيج للعينين.');
        });
        if (found_controversial.length > 0) issues.push(`يحتوي على فلاتر (${found_controversial.join(', ')}) قد تكون ضارة بالشعاب المرجانية.`);
        let efficacyScore = 0;
        const hasUVA = found_uva_strong.length > 0 || found_uva_moderate.length > 0;
        const hasUVB = found_uvb_strong.length > 0 || found_uvb_moderate.length > 0;
        if (hasUVA && hasUVB) {
          efficacyScore += 50 + (found_uva_strong.length * 20) + (found_uva_moderate.length * 10) + (found_uvb_strong.length * 10);
          if (found_uva_strong.length + found_uvb_strong.length > 2) efficacyScore += 10;
          if (found_uva_moderate.includes('أفوبينزون') && found_stabilizers.length === 0) { efficacyScore -= 40; issues.push("فلتر الأفوبينزون غير مستقر وقد يفقد فعاليته بسرعة تحت الشمس لعدم وجود مثبتات."); }
        }
        efficacyScore = Math.max(0, Math.min(100, Math.round(efficacyScore)));
        let protectionLevel = efficacyScore >= 90 ? 'حماية فائقة' : efficacyScore >= 70 ? 'حماية جيدة' : efficacyScore >= 50 ? 'حماية أساسية' : 'حماية غير كافية';
        return { efficacyScore, protectionLevel, issues: [...new Set(issues)], boosters: found_boosters.length > 0 ? [`معزز بمضادات أكسدة مثل: ${[...new Set(found_boosters)].join('، ')}.`] : [] };
    };

    // --- V8 ENGINE: Positional Weighted Analysis ---
    // --- V10 ENGINE: Full Context-Aware Cosmetic Chemist Logic ---
    // --- V11 ENGINE: Priority-Based & Dynamic Verdict Logic ---
    // --- V13 ENGINE: Weighted Pillars (Safety 60% | Efficacy 40%) + Leave-On Logic ---
    // --- V13 ENGINE: Weighted Pillars (Safety 60% | Efficacy 40%) + Full Detailed Breakdown ---
    // --- V13 ENGINE (FINAL COMPLETE): Weighted Pillars + Silicones + Natural Bonus ---
    const calculateReliabilityScore_V13 = (ingredients, conflicts, userAlerts, marketingResults, productType) => {
      const scoreBreakdown = [
           { type: 'calculation', text: 'الرصيد الافتتاحي للسلامة', value: '100' },
           { type: 'calculation', text: 'الرصيد الافتتاحي للفعالية', value: '50' }
      ];
      
      // 0. Safety Check for Empty Data
      if (!ingredients || ingredients.length === 0) {
          return { oilGuardScore: 0, finalVerdict: 'غير قابل للتحليل', scoreBreakdown: [] };
      }

      // --- 1. CONTEXT DEFINITIONS ---
      const isWashOff = ['cleanser', 'shampoo', 'mask', 'scrub'].includes(productType);
      const isLeaveOn = !isWashOff; 
      const isHairCare = ['shampoo', 'hair_mask', 'conditioner', 'oil_blend'].includes(productType);
      const isSunCare = ['sunscreen'].includes(productType);
      const isTreatment = ['serum', 'treatment', 'toner'].includes(productType);

      // --- 2. BUFFERING CHECK (The "Sandwich" Logic) ---
      const topIngredients = ingredients.slice(0, 7);
      const hydrators = new Set([
          'glycerin', 'aqua', 'water', 'panthenol', 'betaine', 'allantoin', 
          'butylene-glycol', 'dipropylene-glycol', 'sodium-hyaluronate', 
          'ceramide', 'aloe-barbadensis', 'squalane', 'shea-butter', 
          'caprylic-capric-triglyceride', 'dimethicone', 'urea', 'bisabolol'
      ]);

      let bufferCount = 0;
      topIngredients.forEach(ing => {
          const dbEntry = allIngredients.find(db => db.id === ing.id);
          if (hydrators.has(ing.id) || dbEntry?.functionalCategory?.includes('مرطب')) {
              bufferCount++;
          }
      });
      
      const bufferThreshold = isTreatment ? 3 : 2;
      const isBuffered = bufferCount >= bufferThreshold;

      if (isBuffered) {
          scoreBreakdown.push({ type: 'info', text: '🛡️ نظام حماية: تركيبة مدعمة بمرطبات قوية', value: 'ميزة' });
      }

      // ==========================================
      // PILLAR 1: SAFETY (Starts at 100)
      // ==========================================
      let currentSafety = 100;
      let safetyDeductions = 0;

      // A. Ingredient Safety Logic
      ingredients.forEach((ing, index) => {
          const dbEntry = allIngredients.find(db => db.id === ing.id);
          // Higher weight for ingredients at the top of the list
          let weight = index < 3 ? 2.0 : (index < 10 ? 1.0 : 0.5);
          
          // 1. Alcohol Denat / Ethanol
          if (['alcohol-denat', 'ethanol', 'isopropyl-alcohol'].includes(ing.id)) {
              if (isSunCare && isBuffered) { 
                  // No penalty
              } else if (isTreatment && isLeaveOn) {
                  const penalty = isBuffered ? 5 : 25; 
                  const weightedPenalty = penalty * weight;
                  safetyDeductions += weightedPenalty;
                  
                  if(weightedPenalty > 2) {
                      scoreBreakdown.push({ 
                          type: isBuffered ? 'warning' : 'deduction', 
                          text: isBuffered ? `كحول (مخفف التأثير): ${ing.name}` : `كحول مسبب للجفاف: ${ing.name}`, 
                          value: `-${Math.round(weightedPenalty)} (أمان)` 
                      });
                  }
              } else if (isLeaveOn) {
                   const p = 15 * weight;
                   safetyDeductions += p;
                   scoreBreakdown.push({ type: 'deduction', text: `كحول مجفف في مرطب: ${ing.name}`, value: `-${Math.round(p)} (أمان)` });
              }
          }

          // 2. Sulfates (Harsh Surfactants)
          if (['sodium-lauryl-sulfate', 'ammonium-lauryl-sulfate', 'sls', 'als'].includes(ing.id)) {
              if (isLeaveOn) {
                  const p = 40 * weight;
                  safetyDeductions += p;
                  scoreBreakdown.push({ type: 'deduction', text: `⛔ سلفات في منتج لا يغسل!: ${ing.name}`, value: `-${Math.round(p)} (أمان)` });
              } else {
                  const p = 10 * weight;
                  safetyDeductions += p;
                  scoreBreakdown.push({ type: 'deduction', text: `سلفات قوية: ${ing.name}`, value: `-${Math.round(p)} (أمان)` });
              }
          }

          // 3. Fragrance / Essential Oils
          if (['fragrance', 'parfum', 'limonene', 'linalool', 'citronellol', 'geraniol'].includes(ing.id)) {
              if (isLeaveOn) {
                  const p = index < 7 ? 15 : 5; 
                  safetyDeductions += p;
                  if (index < 10) scoreBreakdown.push({ type: 'deduction', text: `عطر بتركيز عالي: ${ing.name}`, value: `-${p} (أمان)` });
              }
          }
          
           // 4. Universal Risks
          const universalRisks = {
              'formaldehyde': { id: ['dmdm-hydantoin', 'imidazolidinyl-urea', 'diazolidinyl-urea'], p: 40, msg: 'مطلق للفورمالديهايد' },
              'parabens': { id: ['propylparaben', 'butylparaben', 'isobutylparaben'], p: 20, msg: 'بارابين (جدلي)' },
              'bad-preservatives': { id: ['methylisothiazolinone', 'methylchloroisothiazolinone'], p: 25, msg: 'مادة حافظة مهيجة جداً' }
          };
          
          for(const key in universalRisks) {
              if(universalRisks[key].id.includes(ing.id)) {
                  safetyDeductions += universalRisks[key].p;
                  scoreBreakdown.push({ type: 'deduction', text: `${universalRisks[key].msg}: ${ing.name}`, value: `-${universalRisks[key].p} (أمان)` });
              }
          }

          // 5. Silicones (RESTORED FEATURE)
          // Uses dbEntry and isHairCare variables properly
          if (['dimethicone', 'cyclopentasiloxane', 'amodimethicone'].includes(ing.id) || dbEntry?.chemicalType?.includes('سيليكون')) {
              // In Shampoo, silicones can cause buildup
              if (productType === 'shampoo') {
                  safetyDeductions += 2;
                  scoreBreakdown.push({ type: 'deduction', text: `سيليكون (احتمال تراكم): ${ing.name}`, value: '-2 (أمان)' });
              }
              // In Face Wash, they are just fillers
              else if (isWashOff && !isHairCare) {
                  safetyDeductions += 2;
              }
              // In Conditioners/Serums, they are functional (Good), so no penalty.
          }
      });

      // B. Personal Conflicts (Safety)
      // Smart Filtering: Ignore "Dry Skin" warning if Alcohol is Buffered
      const activeUserAlerts = userAlerts.filter(alert => {
          if (isBuffered) {
              const isAlcoholWarning = alert.text.includes('كحول') || alert.text.includes('alcohol') || alert.text.includes('ethanol');
              if (isAlcoholWarning) return false;
          }
          return true;
      });
      
      if (isBuffered && activeUserAlerts.length < userAlerts.length) {
           scoreBreakdown.push({ type: 'info', text: '✨ تم تجاهل تحذير الجفاف لأن التركيبة محمية', value: 'استثناء' });
      }

      const hasAllergyDanger = activeUserAlerts.some(a => a.type === 'danger');
      const hasMismatch = activeUserAlerts.some(a => a.type === 'warning');

      if (hasAllergyDanger) {
          safetyDeductions += 100; // Immediate Fail
          scoreBreakdown.push({ type: 'override', text: '⛔ خطر: تعارض مع حساسيتك', value: '-100 (أمان)' });
      } else if (hasMismatch) {
          safetyDeductions += 30;
          scoreBreakdown.push({ type: 'deduction', text: '⚠️ لا يناسب نوع بشرتك/شعرك', value: '-30 (أمان)' });
      }

      if (conflicts.length > 0) {
          const conflictPoints = conflicts.length * 10;
          safetyDeductions += conflictPoints;
          scoreBreakdown.push({ type: 'deduction', text: `تعارض كيميائي (${conflicts.length})`, value: `-${conflictPoints} (أمان)` });
      }

      // Cap Safety at 0
      currentSafety = Math.max(0, 100 - safetyDeductions);


      // ==========================================
      // PILLAR 2: EFFICACY (Starts at 50)
      // ==========================================
      let currentEfficacy = 50; 
      let efficacyBonus = 0;

      // A. Ingredient Potency
      ingredients.forEach((ing, index) => {
          const dbEntry = allIngredients.find(db => db.id === ing.id);
          let weight = index < 3 ? 2.0 : (index < 10 ? 1.5 : 0.8);
          
          const heroIngredients = [
              'niacinamide', 'vitamin-c', 'ascorbic-acid', 'retinol', 'retinal', 'tretinoin', 'adapalene', 
              'ceramide', 'peptide', 'copper-peptide', 'hyaluronic-acid', 'sodium-hyaluronate',
              'azelaic-acid', 'salicylic-acid', 'glycolic-acid', 'lactic-acid',
              'centella-asiatica', 'panthenol', 'glycerin', 'zinc-pca', 'snail-mucin', 'allantoin'
          ];
          
          if (heroIngredients.includes(ing.id) || dbEntry?.functionalCategory?.includes('مكون فعال')) {
              let power = 5; 
              
              // Context Check
              if (isWashOff && !['salicylic-acid', 'benzoyl-peroxide', 'glycolic-acid', 'lactic-acid'].includes(ing.id)) {
                  power = 1; // Reduced value for wash-off
              }
              
              // Basics cap
              if (['glycerin', 'water', 'aqua'].includes(ing.id)) power = 2;

              let points = power * weight;
              efficacyBonus += points;
              
              // Log significant boosters
              if (points >= 3 && index < 15) {
                   const contextMsg = isWashOff && power === 1 ? '(تأثير محدود في الغسول)' : '';
                   scoreBreakdown.push({ type: 'info', text: `🚀 مكون فعال: ${ing.name} ${contextMsg}`, value: `+${Math.round(points)} (فعالية)` });
              }
          }
      });

      // B. Marketing Integrity (Updated with Natural Bonus)
      let integrityScore = 0;
      if (marketingResults && marketingResults.length > 0) {
          marketingResults.forEach(res => {
              // Case 1: Scientifically Proven (Gold Standard)
              if (res.status.includes('✅')) {
                  const idx = ingredients.findIndex(i => res.proven.includes(i.name));
                  if (idx > -1 && idx < 10) {
                      integrityScore += 15; 
                      scoreBreakdown.push({ type: 'info', text: `مصداقية (علمي): ${res.claim}`, value: '+15 (فعالية)' });
                  }
              } 
              // Case 2: Traditionally Proven (Natural/Herbal) <-- RESTORED
              else if (res.status.includes('🌿')) {
                  integrityScore += 15; 
                  scoreBreakdown.push({ type: 'info', text: `مصداقية (طبيعي): ${res.claim}`, value: '+15 (فعالية)' });
              }
              // Case 3: Scams / Angel Dusting
              else if (res.status.includes('تركيز منخفض') || res.status.includes('Angel Dusting') || res.status.includes('❌')) {
                  integrityScore -= 20; 
                  scoreBreakdown.push({ type: 'warning', text: `غش تسويقي: ${res.claim}`, value: '-20 (فعالية)' });
              }
          });
      }
      efficacyBonus += integrityScore;

      // Add bonus to baseline, cap at 100
      currentEfficacy = Math.min(100, Math.max(0, currentEfficacy + efficacyBonus));

      // ==========================================
      // FINAL CALCULATION & VERDICT
      // ==========================================
      
      let weightedScore = (currentSafety * 0.6) + (currentEfficacy * 0.4);
      
      scoreBreakdown.push({ 
          type: 'calculation', 
          text: `الحساب النهائي: (أمان ${Math.round(currentSafety)} × 0.6) + (فعالية ${Math.round(currentEfficacy)} × 0.4)`, 
          value: `${Math.round(weightedScore)}` 
      });

      // --- Logic Gates for Final Verdict ---
      let finalVerdict = '';
      
      if (hasAllergyDanger) {
          weightedScore = Math.min(weightedScore, 20); 
          finalVerdict = "⛔ خطير: يسبب لك الحساسية";
          scoreBreakdown.push({ type: 'override', text: 'تم إغلاق النتيجة لوجود خطر صحي', value: 'سقف 20%' });
      } else if (currentSafety < 40) {
          weightedScore = Math.min(weightedScore, 45);
          finalVerdict = "⚠️ غير آمن: يحتوي على مكونات قاسية/ضارة";
          scoreBreakdown.push({ type: 'override', text: 'تم تخفيض النتيجة لضعف الأمان', value: 'سقف 45%' });
      } else if (currentSafety > 80 && currentEfficacy < 55) {
          weightedScore = Math.min(weightedScore, 65);
          finalVerdict = "💧 آمن لكن غير فعال (Basic)";
          scoreBreakdown.push({ type: 'override', text: 'تم تخفيض النتيجة لعدم وجود فعالية حقيقية', value: 'سقف 65%' });
      } else if (weightedScore >= 90) {
          finalVerdict = "💎 تركيبة مثالية (Elite)";
      } else if (weightedScore >= 80) {
          finalVerdict = "🌟 اختيار ممتاز";
      } else if (weightedScore >= 65) {
          finalVerdict = "✅ جيد ومتوازن";
      } else {
          finalVerdict = "⚖️ متوسط (يمكن إيجاد أفضل)";
      }

      return { 
          oilGuardScore: Math.round(weightedScore), 
          finalVerdict, 
          efficacy: { score: Math.round(currentEfficacy) }, 
          safety: { score: Math.round(currentSafety) }, 
          scoreBreakdown,
          personalMatch: { 
              status: hasAllergyDanger ? 'danger' : (hasMismatch ? 'warning' : 'good'), 
              reasons: activeUserAlerts.map(a => a.text) 
          }
      };
  };

    const initiateAnalysis = () => {
        setCurrentStep(3);
        
        setProgress(0); setOcrDebug('🧪 يتم إجراء التحليل النهائي...');
        setTimeout(() => {
          const detectedIngredients = preProcessedIngredients || [];
          const marketingResults = evaluateMarketingClaims(detectedIngredients, selectedClaims, productType);
          const { conflicts, user_specific_alerts } = analyzeIngredientInteractions(detectedIngredients);
          setProgress(50);
          
          const resultData = calculateReliabilityScore_V13(detectedIngredients, conflicts, user_specific_alerts, marketingResults, productType);
          
          setProgress(100);
    
          const finalAnalysisData = {
              ...resultData,
              detected_ingredients: detectedIngredients,
              conflicts,
              marketing_results: marketingResults,
              selected_claims: selectedClaims,
              product_type: productType,
              user_allergies: selectedAllergies,
              user_conditions: selectedConditions,
              user_specific_alerts,
              timestamp: new Date().toISOString(),
              original_text: ocrText,
              extraction_details: extractionDetails,
              sunscreen_analysis: productType === 'sunscreen' ? analyzeSunscreen(detectedIngredients) : null
          };
    
          setAnalysisData(finalAnalysisData);
          setCurrentStep(4);
        }, 500);
    };
      
    const getReliabilityColor = (score) => {
        if (score >= 80) return '#10b981'; if (score >= 60) return '#f59e0b';
        if (score >= 40) return '#ef4444'; return '#dc2626';
    };

    const getReliabilityIcon = (score) => {
        if (score >= 80) return <FaCheckCircle className="reliability-icon high" />; if (score >= 60) return <FaCheckCircle className="reliability-icon medium" />;
        if (score >= 40) return <FaExclamationTriangle className="reliability-icon low" />; return <FaTimesCircle className="reliability-icon critical" />;
    };
    
    const handleDownloadReport = (event) => { downloadReportWithLoading(analysisData, event); };
    const handleShareReport = (event) => { shareReportWithLoading(analysisData, event); };
    
    const highlightIngredientsInText = (text, extractionDetails) => {
        if (!text || !extractionDetails || extractionDetails.length === 0) return String(text || '');
        let highlightedText = text;
        const highlightPatterns = [];
        extractionDetails.forEach(detail => {
          if (detail && detail.matchedText && detail.ingredientName) {
            let cleanMatchedText = detail.matchedText.replace(/"/g, '').replace(/\(كلمة خاطئة\)/g, '').trim();
            if (cleanMatchedText && cleanMatchedText.length > 2) {
              highlightPatterns.push({ pattern: cleanMatchedText, ingredientName: detail.ingredientName });
            }
          }
        });
        highlightPatterns.sort((a, b) => b.pattern.length - a.pattern.length);
        highlightPatterns.forEach(({ pattern, ingredientName }) => {
          try {
            const escapedPattern = escapeRegExp(pattern);
            const regex = new RegExp(`\\b${escapedPattern}\\b`, 'gi');
            highlightedText = highlightedText.replace(regex, match => `<mark class="ingredient-highlight" title="تم اكتشاف: ${ingredientName}">${match}</mark>`);
          } catch (error) { console.warn(`Failed to create regex for pattern: ${pattern}`, error); }
        });
        return highlightedText;
    };
    
    const stepVariants = { hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -50 } };
    
    const handleSaveToRoutine = async () => {
        if (!productName.trim()) { alert("الرجاء إدخال اسم للمنتج."); return; }
        if (!user || !analysisData) { alert("لا يمكن الحفظ. خطأ في البيانات أو تسجيل الدخول."); return; }
        setIsSaving(true);
        const savedProductsCollectionRef = collection(db, 'profiles', user.uid, 'savedProducts');
        try {
            const q = query(savedProductsCollectionRef);
            const querySnapshot = await getDocs(q);
            const newOrderIndex = querySnapshot.size;
            const sanitizedAnalysisData = sanitizeObjectForFirestore(analysisData);
            const newProduct = { productName: productName.trim(), analysisData: sanitizedAnalysisData, addedAt: Timestamp.now(), order: newOrderIndex };
            await addDoc(savedProductsCollectionRef, newProduct);
            setShowNamePrompt(false);
            setProductName('');
            alert('تم حفظ المنتج في رفّك بنجاح!');
        } catch (error) {
            console.error("Firestore Error: Failed to save product!", error);
            alert('فشل حفظ المنتج. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsSaving(false);
        }
    };
    
    if (authLoading) {
        return (
            <div className="fullscreen-loader">
                <FaSpinner className="spinning" />
            </div>
        );
    }

    return (
        <div className="oilguard-container elegant-theme">
          <SEO 
                title="محلل المكونات" 
                description="افحصي سلامة منتجاتك. كشف المكونات الضارة، تحليل الفعالية، وتنبيهات الحساسية بالذكاء الاصطناعي."
            />
          <AuthModal show={showAuthModal} onClose={() => setShowAuthModal(false)} />

          <div className="oilguard-header">
    <div className="header-wrapper"> {/* New wrapper for positioning context */}

        {/* The Title Container is now a sibling */}
        <div className="headertitle-container">
            <div className="header-titles">
                <motion.h1 className="oilguardtitle" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                   وثيق
                </motion.h1>
                <motion.p className="oilguardsubtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>
                    نظام جزائري متكامل لتحليل مكونات منتجات العناية بالبشرة والشعر
                </motion.p>
            </div>
        </div>
    </div>
</div>

          <div className="progress-indicator">
            {[...Array(totalSteps).keys()].map(stepIdx => (<div key={stepIdx} className={`progress-dot ${currentStep >= stepIdx ? 'active' : ''}`}></div>))}
          </div>

          <div className="oilguard-content">
            <AnimatePresence mode="wait">
            
            {currentStep === 0 && (
  <motion.div key="step0" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="step-content">
    <div className="input-options-grid">
      <motion.div className="input-card elegant-card" whileHover={{ y: -5, transition: { duration: 0.2 } }}>
        <FaImages className="card-icon" />
        <h3>{t('تحليل من صورة', 'تحليل من صورة')}</h3>
        {/* Dynamic: 'Upload' */}
        <p className="card-description">
            {t('ارفعي صورة قائمة المكونات لتحليلها.', 'ارفع صورة قائمة المكونات لتحليلها.')}
        </p>
        
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden-file-input" />
        <input type="file" accept="image/*" capture ref={cameraInputRef} onChange={handleFileSelect} className="hidden-file-input" />

        <div className="button-group">
            <motion.button className="elegant-btn primary" onClick={() => setIsExamplesModalVisible(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                {/* Dynamic: 'Choose' */}
                <FaImages /> {t('اختاري صورة', 'اختر صورة')}
            </motion.button>
            <motion.button className="elegant-btn secondary" onClick={() => cameraInputRef.current?.click()} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                {/* Dynamic: 'Take' */}
                <FaCamera /> {t('التقطي صورة', 'التقط صورة')}
            </motion.button>
        </div>
      </motion.div>
      
      <motion.div className="input-card elegant-card" whileHover={{ y: -5, transition: { duration: 0.2 } }}>
        <FaEdit className="card-icon" />
        <h3>إدخال يدوي</h3>
        {/* Dynamic: 'Enter' (manual input) */}
        <p className="card-description">
            {t('أدخلي قائمة المكونات يدويا، مفصولة بفواصل أو أسطر جديدة.', 'أدخل قائمة المكونات يدويا، مفصولة بفواصل أو أسطر جديدة.')}
        </p>
  {/* Add a wrapper for positioning the suggestions */}
  <div className="autocomplete-wrapper">
    {/* Background Ghost Text Display - perfectly mirrors the textarea */}
    <div className="textarea-ghost" aria-hidden="true">
        {manualIngredients}
        <span className="ghost-text">{ghostText}</span>
    </div>

    {/* Real, interactive Textarea on top */}
    <motion.textarea
        ref={manualInputRef}
        className="ingredients-textarea elegant-input"
        placeholder={!manualIngredients ? "مثال: زيت جوز الهند، فيتامين سي..." : ""}
        value={manualIngredients}
        onChange={handleManualInputChange}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => {
            setShowSuggestions(false);
            setGhostText('');
        }, 200)}
        rows={6}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
    />

    {/* --- NEW: Suggestions List --- */}
    <AnimatePresence>
      {showSuggestions && suggestions.length > 0 && (
        <motion.ul
          className="suggestions-list"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.term + index}
              className={index === activeSuggestionIndex ? 'active' : ''}
              // Use onMouseDown to prevent the blur event from firing before the click
              onMouseDown={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.ingredient.name}
            </li>
          ))}
        </motion.ul>
      )}
    </AnimatePresence>
  </div>

  <motion.button
    className="elegant-btn primary"
    onClick={handleManualInputStart}
    disabled={!manualIngredients.trim()}
    whileHover={{ scale: manualIngredients.trim() ? 1.05 : 1 }}
    whileTap={{ scale: manualIngredients.trim() ? 0.95 : 1 }}
  >
    <FaArrowRight /> التالي
  </motion.button>
</motion.div>
                </div>
              </motion.div>
            )}

{currentStep === 1 && (
                <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.4 }} className="step-content">
                  <div className="elegant-cardd">
                    
                    {/* HEADER */}
                    <h3 className="sectiontitle"><FaShoppingBag className="section-icon" /> تأكيد نوع المنتج</h3>
                    
                    {/* AI PREDICTION CARD (Shows by default) */}
                    {!showManualTypeGrid ? (
                        <motion.div 
                            className="ai-prediction-card"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                        >
                            <div className="prediction-glow"></div>
                            <div className="prediction-icon">
                                {productTypes.find(t => t.id === productType)?.icon || <FaShoppingBag />}
                            </div>
                            <div className="prediction-text">
                                <span>وثيق يعتقد أن هذا المنتج هو:</span>
                                <h4>{productTypes.find(t => t.id === productType)?.name || 'غير معروف'}</h4>
                            </div>
                            
                            <div className="prediction-actions">
                                <motion.button 
                                    className="elegant-btn primary" 
                                    onClick={goToNextStep}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FaCheckCircle /> نعم، صحيح
                                </motion.button>
                                <button 
                                    className="change-type-link" 
                                    onClick={() => setShowManualTypeGrid(true)}
                                >
                                    لا، إنه شيء آخر
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        /* MANUAL GRID (Shown if user clicks "Change") */
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <p className="card-description">اختر النوع الصحيح من القائمة أدناه:</p>
                            <div className="product-type-grid">
                              {productTypes.map((type) => (
                                  <motion.div 
                                    key={type.id} 
                                    className={`product-type-card ${productType === type.id ? 'selected' : ''}`} 
                                    onClick={() => setProductType(type.id)} 
                                    whileHover={{ scale: 1.03 }} 
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    {type.icon}
                                    <h4>{type.name}</h4>
                                  </motion.div>
                              ))}
                            </div>
                            <div className="navigation-buttons">
                                <motion.button className="elegant-btn secondary" onClick={() => setShowManualTypeGrid(false)}>إلغاء</motion.button>
                                <motion.button className="elegant-btn primary" onClick={goToNextStep} disabled={!productType}><FaArrowRight />التالي</motion.button>
                            </div>
                        </motion.div>
                    )}
                  </div>
                </motion.div>
            )}

{currentStep === 2 && (
              <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.4 }} className="step-content">
                <div className="elegant-cardd">
                  <h3 className="sectiontitle"><FaBullhorn className="section-icon" /> تحديد الادعاءات</h3>
                  <p className="card-description">
        {productType 
          ? `ما هي الوعود التي يقدمها هذا الـ "${productTypes.find(p => p.id === productType)?.name}"؟`
          // Dynamic: 'Identify/Select'
          : t('حددي الادعاءات المكتوبة على العبوة لنتحقق منها.', 'حدد الادعاءات المكتوبة على العبوة لنتحقق منها.')
        }
      </p>
                  
                  {/* 1. Search & Actions Toolbar */}
                  <div className="claims-toolbar">
                    <div className="claim-search-wrapper">
                        <FaSearch className="search-icon" />
                        <input 
                            type="text" 
                            className="claim-search-input" 
                            placeholder="ابحث عن ادعاء (مثال: تقشير...)"
                            value={claimSearchTerm}
                            onChange={(e) => setClaimSearchTerm(e.target.value)}
                        />
                        {claimSearchTerm && <button onClick={() => setClaimSearchTerm('')}><FaTimes /></button>}
                    </div>

                    <div className="claim-actions-group">
                        <button className="mini-action-btn" onClick={selectAllClaims}>الكل</button>
                        <button className="mini-action-btn outline" onClick={clearAllClaims}>مسح</button>
                    </div>
                  </div>
                  
                  {/* 2. The Chip Grid */}
                  <div className="claims-chip-container custom-scrollbar">
                    <motion.div className="claims-chip-grid">
                        <AnimatePresence>
                            {getClaimsByProductType(productType)
                                .filter(c => c.includes(claimSearchTerm))
                                .map((claim) => (
                                <motion.button 
                                    key={claim} 
                                    
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    className={`claim-chip ${selectedClaims.includes(claim) ? 'active' : ''}`} 
                                    onClick={() => {
                                        if(window.navigator.vibrate) window.navigator.vibrate(10);
                                        handleClaimSelection(claim);
                                    }}
                                >
                                    {selectedClaims.includes(claim) && (
                                        <motion.span 
                                            initial={{ scale: 0 }} 
                                            animate={{ scale: 1 }} 
                                            className="check-icon"
                                        >
                                            <FaCheckCircle />
                                        </motion.span>
                                    )}
                                    {claim}
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                    
                    {getClaimsByProductType(productType).filter(c => c.includes(claimSearchTerm)).length === 0 && (
                        <div className="empty-search-state">
                            <p>لا توجد ادعاءات تطابق بحثك.</p>
                        </div>
                    )}
                  </div>
                  
                  {/* 3. Summary Footer */}
                  <div className="claims-footer-info">
                    <p>تم تحديد <strong>{selectedClaims.length}</strong> ادعاء للتحليل.</p>
                  </div>
                  
                  <div className="navigation-buttons">
                    <motion.button className="elegant-btn secondary" onClick={goToPreviousStep} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      رجوع
                    </motion.button>
                    <motion.button className="elegant-btn primary" onClick={initiateAnalysis} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <FaFlask /> بدء التحليل النهائي
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
                <AnalysisLoadingScreen progress={progress} />
            )}

            {currentStep === 4 && analysisData && (
                <motion.div key="results" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="results-step">
                  <motion.div className="results-header" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <h2>نتائج التحليل الشاملة</h2>
                    <div className="results-actions">
                      <motion.button className="elegant-btn small" onClick={handleDownloadReport} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><FaDownload />تحميل التقرير</motion.button>
                      <motion.button className="elegant-btn small" onClick={handleShareReport} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}> <FaShare />مشاركة التقرير</motion.button>
                      <motion.button className="elegant-btn small secondary" onClick={resetAnalysis} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><FaSync />تحليل جديد</motion.button>
                    </div>
                  </motion.div>

                  {analysisData.personalMatch && analysisData.personalMatch.reasons.length > 0 && (
                      <motion.div 
                        className={`personal-match-report elegant-card ${analysisData.personalMatch.status}`}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="personal-match-header">
                            {analysisData.personalMatch.status === 'danger' && <FaTimesCircle className="icon" />}
                            {analysisData.personalMatch.status === 'warning' && <FaExclamationTriangle className="icon" />}
                            {analysisData.personalMatch.status === 'good' && <FaCheckCircle className="icon" />}
                            <h3>
            {/* Dynamic: 'Not recommended for YOU' */}
            {analysisData.personalMatch.status === 'danger' && t('غير موصى به لكِ', 'غير موصى به لكَ')}
            
            {/* Dynamic: 'Use with caution' (Imperative) */}
            {analysisData.personalMatch.status === 'warning' && t('استخدميه بحذر', 'استخدمه بحذر')}
            
            {/* Dynamic: 'Match for YOUR profile' */}
            {analysisData.personalMatch.status === 'good' && t('مطابقة ممتازة لملفكِ', 'مطابقة ممتازة لملفكَ')}
        </h3>
                        </div>
                        <ul className="personal-match-reasons">
                            {analysisData.personalMatch.reasons.map((reason, index) => (
                                <li key={index}>{reason}</li>
                            ))}
                        </ul>
                      </motion.div>
                  )}
            
                {/* --- START: Replace the entire score card component with this new version --- */}
<motion.div
  className="v-score-card elegant-card"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1, duration: 0.5 }}
>
  <div className="v-score-card__header">
    {getReliabilityIcon(analysisData.oilGuardScore)}
    <div className="v-score-card__title-group">
      <h3>تقييم وثيق النهائي</h3>
      <p>النتيجة الإجمالية بناء على الفعالية، السلامة، ومطابقة ملفك الشخصي</p>
    </div>
  </div>

  <div className="v-score-card__main">
    {/* Main Score Gauge */}
    <div className="v-score-card__gauge">
  <svg viewBox="0 0 160 160">
    <circle cx="80" cy="80" r="70" className="v-score-card__gauge-bg" />
    <motion.circle
      cx="80" cy="80" r="70"
      className="v-score-card__gauge-fg"
      stroke={getReliabilityColor(analysisData.oilGuardScore)}
      strokeDasharray={2 * Math.PI * 70}
      initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
      animate={{ strokeDashoffset: (2 * Math.PI * 70) * (1 - analysisData.oilGuardScore / 100) }}
      transition={{ duration: 1.2, delay: 0.6, ease: "circOut" }}
    />
  </svg>
  {/* This text element is now structured identically to the pillars' text */}
  <motion.div
    className="v-score-card__value-text-wrapper"
    initial={{ scale: 0.5, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: 'spring', stiffness: 150, delay: 0.1 }}
  >
    <span className="v-score-card__value">{analysisData.oilGuardScore}</span>
    <span className="v-score-card__percent">%</span>
  </motion.div>
</div>
    
    <div className="v-score-card__verdict-container">
        <motion.div
            className="v-score-card__verdict"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            <span className="v-score-card__verdict-label">الخلاصة:</span>
            <strong className="v-score-card__verdict-text">{analysisData.finalVerdict}</strong>
        </motion.div>
        
    </div>
    <motion.button className="elegant-btn primary" onClick={() => setShowNamePrompt(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>حفظ في ملفي</motion.button>
                 
  </div>

  {/* Efficacy and Safety Pillars */}
  <motion.div 
    className="v-score-card__pillars"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 1.6 }}
  >
    {/* Efficacy Pillar */}
    <div className="v-score-pillar">
      <div className="v-score-pillar__gauge">
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" className="v-score-pillar__gauge-bg" />
          <motion.circle
            cx="50" cy="50" r="45"
            className="v-score-pillar__gauge-fg"
            stroke={getReliabilityColor(analysisData.efficacy.score)}
            strokeDasharray={2 * Math.PI * 45}
            initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
            animate={{ strokeDashoffset: (2 * Math.PI * 45) * (1 - analysisData.efficacy.score / 100) }}
            transition={{ duration: 1, delay: 0.8, ease: "circOut" }}
          />
        </svg>
        <span className="v-score-pillar__value">{analysisData.efficacy.score}%</span>
      </div>
      <div className="v-score-pillar__info">
        <h4><FaFlask /> الفعالية والمصداقية</h4>
        <p>مدى قدرة المنتج على تحقيق ادعاءاته المعلنة.</p>
      </div>
    </div>
    
    {/* Safety Pillar */}
    <div className="v-score-pillar">
      <div className="v-score-pillar__gauge">
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" className="v-score-pillar__gauge-bg" />
          <motion.circle
            cx="50" cy="50" r="45"
            className="v-score-pillar__gauge-fg"
            stroke={getReliabilityColor(analysisData.safety.score)}
            strokeDasharray={2 * Math.PI * 45}
            initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
            animate={{ strokeDashoffset: (2 * Math.PI * 45) * (1 - analysisData.safety.score / 100) }}
            transition={{ duration: 1, delay: 0.9, ease: "circOut" }}
          />
        </svg>
        <span className="v-score-pillar__value">{analysisData.safety.score}%</span>
      </div>
      <div className="v-score-pillar__info">
        <h4><FaCheckCircle /> مؤشر السلامة العام</h4>
        <p>مدى خلو المنتج من المكونات المثيرة للجدل عالميا.</p>
      </div>
    </div>
  </motion.div>

  {/* Breakdown Section */}
  <div className="v-score-card__breakdown-wrapper">
    <button
      className="v-score-card__breakdown-toggle elegant-btn small secondary"
      onClick={() => setIsBreakdownVisible(!isBreakdownVisible)}
    >
      {isBreakdownVisible ? 'إخفاء تفاصيل الحساب' : 'عرض تفاصيل الحساب'}
      <motion.span animate={{ rotate: isBreakdownVisible ? 180 : 0 }}>▼</motion.span>
    </button>
    <AnimatePresence>
      {isBreakdownVisible && (
        <motion.div
          className="v-score-card__breakdown-panel"
          initial={{ height: 0, opacity: 0, marginTop: 0 }}
          animate={{ height: 'auto', opacity: 1, marginTop: '1rem' }}
          exit={{ height: 0, opacity: 0, marginTop: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <ul className="breakdown-list">
            {analysisData.scoreBreakdown && analysisData.scoreBreakdown.map((item, index) => (
              <motion.li
                key={index}
                className={`breakdown-item ${item.type}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="breakdown-text">{item.text}</span>
                <span className="breakdown-value">{item.value}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
</motion.div>
{/* --- END: Replacement block --- */}
                  {analysisData.sunscreen_analysis && ( <motion.div className="section-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}> <h3 className="sectiontitle"><FaSun className="section-icon" /> تحليل واقي الشمس</h3> <div className="sunscreen-analysis-card elegant-card"> <h4>مستوى الفعالية: <span style={{ color: getReliabilityColor(analysisData.sunscreen_analysis.efficacyScore) }}>{analysisData.sunscreen_analysis.protectionLevel} ({analysisData.sunscreen_analysis.efficacyScore}%)</span></h4> {analysisData.sunscreen_analysis.boosters.length > 0 && ( <div className="sunscreen-boosters">{analysisData.sunscreen_analysis.boosters.map((booster, i) => (<div key={i} className="sunscreen-item booster"><FaPlusCircle /> {booster}</div>))}</div> )} {analysisData.sunscreen_analysis.issues.length > 0 && ( <div className="sunscreen-issues">{analysisData.sunscreen_analysis.issues.map((issue, i) => (<div key={i} className="sunscreen-item issue"><FaExclamationTriangle /> {issue}</div>))}</div>)} </div> </motion.div> )}
                  {(analysisData.conflicts && analysisData.conflicts.length > 0) && ( <motion.div className="section-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}> <h3 className="sectiontitle"><FaExclamationCircle className="section-icon" /> تفاعلات سلبية بين المكونات</h3> <div className="alerts-container"> {analysisData.conflicts.map((conflict, index) => ( <motion.div key={index} className="alert-item warning elegant-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + index * 0.05 }}> <FaExclamationTriangle className="alert-icon" /> <p><strong>{conflict.pair.join(' + ')}:</strong> {conflict.reason}</p> </motion.div> ))} </div> </motion.div> )}
                   <motion.div className="section-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                    <h3 className="sectiontitle">المكونات المكتشفة ({analysisData.detected_ingredients.length})</h3>
                    <div className="ingredients-grid">
                      {analysisData.detected_ingredients.map((ingredient, index) => {
                        const benefits = getIngredientBenefits(ingredient);
                        return (
                          <motion.div key={ingredient.id || index} className="ingredient-card elegant-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + index * 0.08 }} whileHover={{ y: -3, boxShadow: "0 6px 12px rgba(0,0,0,0.1)", transition: { duration: 0.2 } }} >
                            <div className="ingredient-header">
                              <span className="ingredient-name">{ingredient.name}</span>
                              <div className="ingredient-category-tags">
                                {ingredient.functionalCategory && <span className="ingredient-type-tag functional">{ingredient.functionalCategory}</span>}
                                {ingredient.chemicalType && <span className="ingredient-type-tag chemical">{ingredient.chemicalType}</span>}
                              </div>
                            </div>
                            {benefits.length > 0 && ( <div className="ingredient-benefits"> {benefits.slice(0, 3).map((benefit, i) => ( <motion.span key={i} className="benefit-tag" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 + index * 0.08 + i * 0.05 }} > {benefit} </motion.span> ))} </div> )}
                            {ingredient.warnings && ingredient.warnings.length > 0 && (
                              <div className="ingredient-warnings-container">
                                {ingredient.warnings.map((warning, warnIndex) => (
                                  <motion.div key={warnIndex} className={`warning-item ${warning.level}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 + (index * 0.08) + (warnIndex * 0.05) }} >
                                    <FaExclamationTriangle className="warning-icon" />
                                    <span className="warning-text">{warning.text}</span>
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>

                  <motion.div className="section-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
  
                    <motion.div 
                    className="section-container" 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: 1.4 }}
                  >
                    <h3 className="sectiontitle"><FaBullhorn className="section-icon" /> كشف الحقائق</h3>
                    
                    <div className="truth-stack">
                      {analysisData.marketing_results.map((result, index) => (
                        <ClaimTruthCard key={index} result={result} index={index} />
                      ))}
                    </div>
                  </motion.div>
                  </motion.div>

                  {ocrText && (
                    <motion.div className="section-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>
                      <div className="section-header-compact">
                        <h3 className="sectiontitle">النص المستخرج من الصورة</h3>
                        <motion.button className="elegant-btn small toggle-text-btn" onClick={() => setShowTextAnalysis(!showTextAnalysis)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>{showTextAnalysis ? <FaEyeSlash /> : <FaEye />}{showTextAnalysis ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}</motion.button>
                      </div>
                      <AnimatePresence>
                        {showTextAnalysis && (
                          <motion.div className="text-analysis-content elegant-card" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                            <div className="ocr-text-display">
                              <h4>النص الأصلي المقروء:</h4>
                              <div className="ocr-text-content elegant-input" dangerouslySetInnerHTML={{ __html: highlightIngredientsInText(ocrText, analysisData.extraction_details) }} />
                            </div>
                            {analysisData.extraction_details.length > 0 && (
                              <div className="extraction-details-display">
                                <h4>تحديد المكونات:</h4>
                                <div className="extraction-list">
                                  {analysisData.extraction_details.map((detail, index) => (<motion.div key={index} className="extraction-item elegant-card-sm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + index * 0.03 }}><span className="matched-text">"{detail.matchedText}"</span><span className="extraction-arrow">←</span><span className="ingredient-name">{detail.ingredientName}</span><span className="extraction-pattern">({detail.pattern})</span></motion.div>))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </motion.div>
            )}

            </AnimatePresence>
          </div>

          <AnimatePresence>
          {showNamePrompt && (
              <motion.div 
                key="save-backdrop" // <--- CRITICAL FIX: Stable Key
                className="modal-backdrop" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                
                onClose={handleCloseNamePrompt}
              >
                <motion.div 
                    key="save-content" // <--- CRITICAL FIX: Stable Key
                    className="elegant-card" 
                    initial={{ y: 50, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    exit={{ y: 50, opacity: 0 }} 
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="save-routine-prompt">
                        <h4>{t('حفظ المنتج في ملفكِ الشخصي', 'حفظ المنتج في ملفكَ الشخصي')}</h4>
                        
                        <p>{t('أعطِ هذا المنتج اسما يسهل تذكره', 'أعط هذا المنتج اسما يسهل تذكره')} .</p>
                        
                        <input
                            type="text"
                            className="elegant-input"
                            placeholder="اسم المنتج..."
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            autoFocus={true}
                            autoComplete="off"
                        />
                        
                        <div className="prompt-actions">
                            <button className="elegant-btn secondary" onClick={() => setShowNamePrompt(false)}>إلغاء</button>
                            <button className="elegant-btn primary" onClick={handleSaveToRoutine} disabled={isSaving}>
                                {isSaving ? <FaSpinner className="spinning" /> : "حفظ"}
                            </button>
                        </div>
                    </div>
                </motion.div>
              </motion.div>
            )}
            
            {isExamplesModalVisible && (
              <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsExamplesModalVisible(false)} >
                <motion.div className="modal-content elegant-card" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} onClick={(e) => e.stopPropagation()} >
                  <h3 className="section-title">للحصول على أفضل النتائج</h3>
                  <p className="card-description">
        {t('.صوري قائمة المكونات فقط، تجنبي الصور المضببة والبعيدة', '.صور قائمة المكونات فقط، تجنب الصور المضببة والبعيدة')}
      </p><div className="examples-grid">
                      <div className="example-card good"><div className="example-image"><img src={goodImageClear} alt="مثال جيد: صورة واضحة ومستقيمة" /></div><h4><FaCheckCircle /> صورة جيدة</h4></div>
                      <div className="example-card good"><div className="example-image"><img src={goodImageFlat} alt="مثال جيد: إضاءة جيدة وكتابة واضحة" /></div><h4><FaCheckCircle /> إضاءة جيدة</h4></div>
                      <div className="example-card bad"><div className="example-image"><img src={badImageBlurry} alt="مثال سيء: صورة ضبابية وغير واضحة" /></div><h4><FaTimesCircle /> ضبابية</h4></div>
                      <div className="example-card bad"><div className="example-image"><img src={badImageGlare} alt="مثال سيء: صورة فيها المنتج كاملا" /></div><h4><FaTimesCircle />تصوير المنتج كاملا</h4></div>
                      <div className="example-card bad"><div className="example-image"><img src={badImageAngle} alt="مثال سيء: صورة ملتقطة من زاوية مائلة" /></div><h4><FaTimesCircle /> زاوية مائلة</h4></div>
                  </div>
                  <motion.button className="elegant-btn primary modal-action-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setIsExamplesModalVisible(false); fileInputRef.current?.click(); }} >
                    <FaCamera /> متابعة واختيار صورة
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

{isCameraOpen && (
                <motion.div 
                    className="camera-modal-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="camera-ui-container">
                        <video ref={videoRef} autoPlay playsInline className="camera-video-feed"></video>
                        <div className="camera-warning-overlay">
        ⚠️لتفادي سخونة الهاتف، يرجى التقاط صورة بسرعة.
    </div>
                        <div className="camera-controls">
                            <button className="camera-capture-btn" onClick={handleCapture}>
                                <FaCamera />
                            </button>
                            <button className="camera-close-btn" onClick={() => {
                                const stream = videoRef.current?.srcObject;
                                if (stream) {
                                    stream.getTracks().forEach(track => track.stop());
                                }
                                setIsCameraOpen(false);
                            }}>
                                <FaTimesCircle />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
    );
};

export default OilGuard;