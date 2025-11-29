import { GoogleGenerativeAI } from '@google/generative-ai';
import { combinedOilsDB } from './alloilsdb.js';
import { marketingClaimsDB } from './marketingclaimsdb.js';
import { 
    commonAllergies, 
    commonConditions, 
    basicSkinTypes, 
    basicScalpTypes 
} from './allergiesAndConditions.js';

// =============================================================================
// 1. SHARED CONSTANTS & DATA INITIALIZATION
// =============================================================================

// Flatten the DB for easy access
const allIngredients = combinedOilsDB.ingredients.map(ing => {
    let mainCategory = 'chemical'; 
    const chemType = ing.chemicalType ? ing.chemicalType.toLowerCase() : '';
    const funcCategory = ing.functionalCategory ? ing.functionalCategory.toLowerCase() : '';

    if (chemType.includes('زيت')) mainCategory = 'oil';
    else if (chemType.includes('سيروم') || ing.id.includes('serum')) mainCategory = 'serum';
    else if (chemType.includes('حمض') || funcCategory.includes('مقشر')) mainCategory = 'acid';
    
    return { ...ing, mainCategory };
});

// Hyper-Normalize: Cleans text for 100% matching accuracy
const hyperNormalize = (text) => {
    if (!text) return '';
    return text.toString().toLowerCase()
        .replace(/[\d.,؛()\[\]{}-]/g, ' ') // Remove numbers/symbols
        .replace(/\s+/g, ' ').trim();     // Collapse spaces
};

// Pre-compute searchable terms (Sorted longest to shortest)
const allSearchableTerms = (() => {
    const allTerms = new Map();
    allIngredients.forEach(ing => {
        const allNames = [ing.name, ing.id, ing.scientific_name, ...(ing.searchKeywords || [])]
            .filter(Boolean)
            .map(name => hyperNormalize(String(name)));
        
        allNames.forEach(normalized => {
            if (normalized.length > 2 && !allTerms.has(normalized)) {
                allTerms.set(normalized, ing);
            }
        });
    });
    return Array.from(allTerms.entries())
        .map(([term, ingredient]) => ({ term, ingredient }))
        .sort((a, b) => b.term.length - a.term.length);
})();

// Helper to get benefits keys (Exported now to fix unused var warning)
export const getIngredientBenefits = (ingredient) => {
    if (!ingredient || !ingredient.benefits) return [];
    return Object.keys(ingredient.benefits);
};

// =============================================================================
// 2. CORE IMAGE & AI PROCESSING (Mobile Safe)
// =============================================================================

export const createGenerativePartFromFile = (file) => {
    const MAX_DIMENSION = 1600; 
    const quality = 0.7;

    return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) {
            return reject(new Error("الملف غير مدعوم. يرجى اختيار صورة."));
        }

        const reader = new FileReader();

        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const { width: originalWidth, height: originalHeight } = img;

                // Direct path for small images
                if (file.size <= 1024 * 1024 && originalWidth <= MAX_DIMENSION && originalHeight <= MAX_DIMENSION) {
                    try {
                        const base64Data = event.target.result.split(',')[1];
                        resolve({ inlineData: { data: base64Data, mimeType: file.type } });
                    } catch (error) {
                         reject(new Error("خطأ في معالجة بيانات الصورة الأصلية."));
                    }
                    return;
                }
                
                // Resize Logic
                let width = originalWidth;
                let height = originalHeight;

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

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Compression
                const compressedBase64Url = canvas.toDataURL('image/jpeg', quality);
                
                // Memory Cleanup
                img.src = ""; 

                const compressedBase64Data = compressedBase64Url.split(',')[1];
                resolve({ inlineData: { data: compressedBase64Data, mimeType: 'image/jpeg' } });
            };

            img.onerror = () => reject(new Error("تعذر تحميل الصورة للمعالجة."));
            img.src = event.target.result;
        };
        
        reader.onerror = () => reject(new Error("تعذر قراءة ملف الصورة."));
        reader.readAsDataURL(file);
    });
};

export const processWithGemini = async (imagePart) => {
    const apiKey = "AIzaSyCgc_5GsGp4untYezK_GOP8RLikmIp6xOE";
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `
        Analyze the cosmetic product image.
        Return a single, minified JSON object with two keys:
        1. "productType": Classify into ONE of: [shampoo, hair_mask, serum, oil_blend, lotion_cream, sunscreen, cleanser, toner, mask, other].
        2. "ingredients": A single string of all extracted ingredients in English (and Arabic if present), separated by commas. Translate French ingredients to English.
        Example: {"productType":"shampoo","ingredients":"Aqua, Sodium Laureth Sulfate, Glycerin"}
    `;

    try {
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        let text = response.text();

        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        let responseObject;
        try {
            responseObject = JSON.parse(text);
        } catch (e) {
            return { productType: 'other', ingredientsText: text };
        }

        return {
            productType: responseObject.productType || 'other',
            ingredientsText: responseObject.ingredients || ''
        };

    } catch (error) {
        console.error('Gemini API Error:', error);
        throw new Error(`فشل تحليل الصورة: ${error.message || "حدث خطأ غير متوقع"}`);
    }
};


// =============================================================================
// 3. INGREDIENT MATCHING & ANALYSIS
// =============================================================================

export const extractIngredientsFromText = async (text) => {
    return new Promise(resolve => {
        if (!text) return resolve({ ingredients: [] });

        const foundIngredients = new Map();
        const tokens = text.split(/\s*,\s*|\s*\.\s*|\s*;\s*|\n/)
            .map(token => hyperNormalize(token))
            .filter(token => token.length > 2);

        for (const token of tokens) {
            let remainingToken = token;
            let safetyBreak = 30; 
            
            while (remainingToken.length > 2 && safetyBreak > 0) {
                let matchFound = false;

                for (const dbTerm of allSearchableTerms) {
                    if (remainingToken.includes(dbTerm.term)) {
                        const ingredient = dbTerm.ingredient;
                        if (!foundIngredients.has(ingredient.id)) {
                            foundIngredients.set(ingredient.id, ingredient);
                        }
                        remainingToken = remainingToken.replace(dbTerm.term, '');
                        matchFound = true;
                        break; 
                    }
                }
                if (!matchFound) break;
                safetyBreak--;
            }
        }

        resolve({ ingredients: Array.from(foundIngredients.values()) });
    });
};

export const getClaimsByProductType = (productType) => {
    const claimsByProduct = {
        shampoo: [ "تنقية فروة الرأس", "مضاد للقشرة", "مخصص للشعر الدهني", "مخصص للشعر الجاف", "مضاد لتساقط الشعر", "تعزيز النمو", "تكثيف الشعر", "مرطب للشعر", "تغذية الشعر", "إصلاح التلف", "تلميع ولمعان", "مكافحة التجعد", "حماية اللون", "حماية من الحرارة", "مهدئ", "مضاد للالتهابات" ],
        hair_mask: [ "تغذية الشعر", "إصلاح التلف", "مرطب للشعر", "مكافحة التجعد", "حماية اللون", "تلميع ولمعان" ],
        serum: [ "مكافحة التجاعيد", "شد البشرة", "تحفيز الكولاجين", "إصلاح التلف", "مضاد للأكسدة", "تفتيح البشرة", "توحيد لون البشرة", "تفتيح البقع الداكنة", "تفتيح تحت العين", "مرطب للبشرة", "مهدئ", "مضاد للالتهابات", "للبشرة الجافة", "للبشرة الحساسة", "للبشرة الدهنية", "تنقية المسام", "توازن الزيوت", "مضاد لحب الشباب" ],
        oil_blend: [ "تعزيز النمو", "تغذية الشعر", "تلميع ولمعان", "إصلاح التلف", "مكافحة التجعد", "مخصص للشعر الدهني", "مخصص للشعر الجاف", "مرطب للشعر", "مرطب للبشرة", "مكافحة التجاعيد", "شد البشرة", "مضاد للأكسدة", "مهدئ", "مضاد للالتهابات", "تفتيح البقع الداكنة" ],
        lotion_cream: [ "مرطب للبشرة", "للبشرة الجافة", "للبشرة الحساسة", "للبشرة الدهنية", "مهدئ", "مضاد للأكسدة", "مكافحة التجاعيد", "شد البشرة", "تحفيز الكولاجين", "تفتيح البشرة", "توحيد لون البشرة", "تفتيح البقع الداكنة", "تفتيح تحت العين", "تنقية المسام", "إزالة السيلوليت", "شد الجسم" ],
        sunscreen: [ "حماية من الشمس", "حماية واسعة الطيف", "مقاوم للماء", "مرطب للبشرة", "مهدئ", "مضاد للأكسدة", "توحيد لون البشرة", "للبشرة الحساسة", "للبشرة الدهنية", "للبشرة الجافة" ],
        cleanser: [ "تنظيف عميق", "تنظيف لطيف", "إزالة المكياج", "للبشرة الدهنية", "للبشرة الجافة", "للبشرة الحساسة", "تنقية المسام", "مضاد لحب الشباب", "مرطب للبشرة" ],
        toner: [ "مرطب للبشرة", "تهدئة البشرة", "توازن الحموضة", "تقشير لطيف", "تنقية المسام", "قابض للمسام" ],
        mask: [ "تنقية عميقة", "ترطيب مكثف", "تفتيح البشرة", "شد البشرة", "تهدئة البشرة", "تقشير" ],
        other: [ "مرطب للشعر", "مرطب للبشرة", "مهدئ", "مضاد للأكسدة", "مضاد للالتهابات", "تفتيح البشرة", "توحيد لون البشرة", "مكافحة التجاعيد", "تنقية المسام", "مضاد لحب الشباب" ]
    };
    return claimsByProduct[productType] || claimsByProduct.other;
};

// V2.1 Forensic Claim Evaluator
export const evaluateMarketingClaims = (detectedIngredients, selectedClaims = [], productType) => {
    const results = [];
    const ingredientNames = detectedIngredients.map(ing => hyperNormalize(ing.name));
    
    const isWashOff = ['cleanser', 'shampoo', 'mask', 'scrub'].includes(productType);
    const claimsToAnalyze = selectedClaims.length > 0 ? selectedClaims : getClaimsByProductType(productType);
    
    claimsToAnalyze.forEach(claim => {
        const categories = marketingClaimsDB[claim];
        if (!categories) return;
        
        const findMatchesWithIndex = (targets) => {
            const matches = [];
            if (!targets) return matches;
            targets.forEach(target => {
                const normalizedTarget = hyperNormalize(target);
                const index = ingredientNames.findIndex(name => name.includes(normalizedTarget));
                if (index !== -1) matches.push({ name: target, index });
            });
            return matches.sort((a, b) => a.index - b.index); 
        };

        const provenMatches = findMatchesWithIndex(categories.proven);
        const tradMatches = findMatchesWithIndex(categories.traditionally_proven);
        const doubtMatches = findMatchesWithIndex(categories.doubtful);
        const ineffMatches = findMatchesWithIndex(categories.ineffective);
        
        let status = '', explanation = '', confidence = '';

        // LOGIC ENGINE
        if (provenMatches.length > 0) {
            const topMatch = provenMatches[0];
            const count = provenMatches.length;
            const namesList = provenMatches.map(m => m.name).join('، ');

            if (topMatch.index > 20) {
                status = '⚖️ تركيز منخفض (Angel Dusting)';
                confidence = 'ضعيفة';
                explanation = `وجدنا ${namesList}، لكن المكون الرئيسي (${topMatch.name}) يأتي في آخر القائمة، مما يضعف الفعالية.`;
            } else if (isWashOff && !['Salicylic', 'Benzoyl', 'Clay', 'Charcoal', 'Sulfur', 'Zinc'].some(i => topMatch.name.includes(i))) {
                status = '⚖️ فعالية محدودة (غسول)';
                confidence = 'متوسطة';
                explanation = `يحتوي على ${namesList}، ولكن في الغسول لا تبقى هذه المكونات لفترة كافية.`;
            } else {
                status = '✅ مثبت علمياً';
                confidence = 'عالية';
                explanation = count > 1 
                    ? `ادعاء قوي يدعمه ${count} مكونات فعالة: ${namesList}.` 
                    : `يعتمد بشكل أساسي على "${topMatch.name}" بتركيز فعال.`;
            }
        } else if (tradMatches.length > 0) {
            const namesList = tradMatches.map(m => m.name).join('، ');
            status = '🌿 دعم طبيعي';
            confidence = 'متوسطة';
            explanation = `يعتمد على مكونات طبيعية (${namesList}). قد تكون النتائج أبطأ ولكنها فعالة.`;
        } else if (claim.includes('مهدئ') || claim.includes('حساسة')) {
            const hasIrritants = ingredientNames.slice(0, 7).some(n => n.includes('alcohol') || n.includes('fragrance') || n.includes('parfum'));
            if (hasIrritants) {
                status = '❌ تعارض في التركيبة';
                confidence = 'معدومة';
                explanation = `يدعي أنه مهدئ، لكنه يحتوي على مهيجات قوية (كحول/عطور) في بداية القائمة.`;
            } else {
                status = '🚫 لا توجد مكونات واضحة';
                confidence = 'معدومة';
                explanation = 'لم نجد مكونات مهدئة معروفة، لكن التركيبة قد تكون محايدة.';
            }
        } else if (ineffMatches.length > 0) {
            status = '❌ ادعاء تسويقي بحت';
            confidence = 'معدومة';
            explanation = `يعتمد على "${ineffMatches[0].name}"، والدراسات تشير أنه غير فعال لهذا الغرض موضعياً.`;
        } else {
            status = '🚫 غير مدعوم';
            confidence = 'معدومة';
            explanation = `لم نتمكن من تحديد المكون المسؤول عن هذا الادعاء في التركيبة.`;
        }
        
        results.push({ 
            claim, status, confidence, explanation, 
            proven: provenMatches.map(m => m.name), 
            traditionallyProven: tradMatches.map(m => m.name), 
            doubtful: doubtMatches.map(m => m.name), 
            ineffective: ineffMatches.map(m => m.name) 
        });
    });
  
    return results;
};

// UPGRADED: Now handles Personal Logic here to avoid duplication
export const analyzeIngredientInteractions = (ingredients, userSettings = {}) => {
    const { allergies = [], conditions = [], skinType = '', scalpType = '' } = userSettings;
    const conflicts = [];
    const foundConflicts = new Set();
    const detectedIngredientIds = new Set(ingredients.map(ing => ing.id));
    const userAlerts = [];

    // 1. Synergy Conflicts
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

    // 2. Personal Alerts Logic (Centralized)
    const userAllergenIngredients = new Set(
        allergies.flatMap(id => commonAllergies.find(a => a.id === id)?.ingredients || []).map(hyperNormalize)
    );

    const userConditionAvoidMap = new Map();
    const userBeneficialMap = new Map();

    const addToMap = (list, reason, isAvoid) => {
        if (!list) return;
        list.forEach(ing => {
            const norm = hyperNormalize(ing);
            if (isAvoid) userConditionAvoidMap.set(norm, reason);
            else userBeneficialMap.set(norm, reason);
        });
    };

    // Process Conditions & Types
    conditions.forEach(id => {
        const c = commonConditions.find(x => x.id === id);
        if (c) {
            addToMap(c.avoidIngredients, c.name, true);
            addToMap(c.beneficialIngredients, c.name, false);
        }
    });

    if (skinType) {
        const skinData = basicSkinTypes.find(t => t.id === skinType);
        if (skinData) {
            addToMap(skinData.avoidIngredients, `بشرة ${skinData.label}`, true);
            addToMap(skinData.beneficialIngredients, `بشرة ${skinData.label}`, false);
        }
    }

    if (scalpType) {
        const scalpData = basicScalpTypes.find(t => t.id === scalpType);
        if (scalpData) {
            addToMap(scalpData.avoidIngredients, `فروة رأس ${scalpData.label}`, true);
            addToMap(scalpData.beneficialIngredients, `فروة رأس ${scalpData.label}`, false);
        }
    }

    // Generate Alerts
    ingredients.forEach(ing => {
        const normName = hyperNormalize(ing.name);
        
        // Allergy (Critical)
        if (userAllergenIngredients.has(normName)) {
             userAlerts.push({ type: 'danger', text: `🚨 خطر حساسية: ${ing.name}` });
        }
        // Condition Avoid (Warning)
        else if (userConditionAvoidMap.has(normName)) {
             userAlerts.push({ type: 'warning', text: `⚠️ تنبيه (${userConditionAvoidMap.get(normName)}): ${ing.name}` });
        }
        // Beneficial (Good)
        else if (userBeneficialMap.has(normName)) {
             userAlerts.push({ type: 'good', text: `✅ مفيد (${userBeneficialMap.get(normName)}): ${ing.name}` });
        }
    });

    // Deduplicate alerts
    const uniqueAlerts = Array.from(new Map(userAlerts.map(item => [item.text, item])).values());

    return { conflicts, userAlerts: uniqueAlerts };
};


// =============================================================================
// 4. V13 RELIABILITY SCORE ENGINE (The Brain)
// =============================================================================

export const calculateReliabilityScore_V13 = (ingredients, conflicts, userAlerts, marketingResults, productType) => {
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
        const dbEntry = combinedOilsDB.ingredients.find(db => db.id === ing.id);
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
        const dbEntry = combinedOilsDB.ingredients.find(db => db.id === ing.id);
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

        // 5. Silicones Logic
        if (['dimethicone', 'cyclopentasiloxane', 'amodimethicone'].includes(ing.id) || dbEntry?.chemicalType?.includes('سيليكون')) {
            if (productType === 'shampoo') {
                safetyDeductions += 2;
                scoreBreakdown.push({ type: 'deduction', text: `سيليكون (احتمال تراكم): ${ing.name}`, value: '-2 (أمان)' });
            }
            else if (isWashOff && !isHairCare) {
                safetyDeductions += 2;
            }
        }
    });

    // B. Personal Conflicts (Safety)
    // Smart Filtering: Ignore "Dry Skin" warning if Alcohol is Buffered
    const activeUserAlerts = (userAlerts || []).filter(alert => {
        if (isBuffered) {
            // FIX: Added Optional Chaining (?.) to prevent crash if text is missing
            const text = alert?.text?.toLowerCase() || "";
            const isAlcoholWarning = text.includes('كحول') || text.includes('alcohol') || text.includes('ethanol');
            if (isAlcoholWarning) return false;
        }
        return true;
    });
    
    if (isBuffered && userAlerts && activeUserAlerts.length < userAlerts.length) {
         scoreBreakdown.push({ type: 'info', text: '✨ تم تجاهل تحذير الجفاف لأن التركيبة محمية', value: 'استثناء' });
    }

    const hasAllergyDanger = activeUserAlerts.some(a => a.type === 'danger');
    const hasMismatch = activeUserAlerts.some(a => a.type === 'warning');

    if (hasAllergyDanger) {
        safetyDeductions += 100; 
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
        const dbEntry = combinedOilsDB.ingredients.find(db => db.id === ing.id);
        let weight = index < 3 ? 2.0 : (index < 10 ? 1.5 : 0.8);
        
        const heroIngredients = [
            'niacinamide', 'vitamin-c', 'ascorbic-acid', 'retinol', 'retinal', 'tretinoin', 'adapalene', 
            'ceramide', 'peptide', 'copper-peptide', 'hyaluronic-acid', 'sodium-hyaluronate',
            'azelaic-acid', 'salicylic-acid', 'glycolic-acid', 'lactic-acid',
            'centella-asiatica', 'panthenol', 'glycerin', 'zinc-pca', 'snail-mucin', 'allantoin'
        ];
        
        if (heroIngredients.includes(ing.id) || dbEntry?.functionalCategory?.includes('مكون فعال')) {
            let power = 5; 
            
            if (isWashOff && !['salicylic-acid', 'benzoyl-peroxide', 'glycolic-acid', 'lactic-acid'].includes(ing.id)) {
                power = 1; 
            }
            
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

    // B. Marketing Integrity
    let integrityScore = 0;
    if (marketingResults && marketingResults.length > 0) {
        marketingResults.forEach(res => {
            // Case 1: Scientifically Proven (Gold Standard)
            if (res.status.includes('✅')) {
                // Proven & High in list?
                const idx = ingredients.findIndex(i => res.proven.includes(i.name));
                if (idx > -1 && idx < 10) {
                    integrityScore += 15; 
                    scoreBreakdown.push({ type: 'info', text: `مصداقية (علمي): ${res.claim}`, value: '+15 (فعالية)' });
                }
            } 
            // Case 2: Traditionally Proven (Natural/Herbal)
            else if (res.status.includes('🌿')) {
                integrityScore += 8; 
                scoreBreakdown.push({ type: 'info', text: `مصداقية (طبيعي): ${res.claim}`, value: '+8 (فعالية)' });
            }
            // Case 3: Scams
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
    // FINAL CALCULATION
    // ==========================================
    
    let weightedScore = (currentSafety * 0.6) + (currentEfficacy * 0.4);
    
    scoreBreakdown.push({ 
        type: 'calculation', 
        text: `الحساب النهائي: (أمان ${Math.round(currentSafety)} × 0.6) + (فعالية ${Math.round(currentEfficacy)} × 0.4)`, 
        value: `${Math.round(weightedScore)}` 
    });

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


export const getScoreColor = (score) => {
  if (score >= 80) return '#10b981';
  if (score >= 65) return '#f59e0b';
  if (score >= 50) return '#f43f5e';
  return '#dc2626';
};