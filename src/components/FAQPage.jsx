import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import SEO from './SEO';
import wathiqLogo from '../assets/wathiq-logo.png';
import '../LandingPage.css'; // Reusing some base styles
import WathiqHeader from './WathiqHeader';

import { useLang } from '../context/LangContext';

const UI_TEXT = {
  ar: {
    seoTitle: "الأسئلة الشائعة حول تطبيق وثيق والمكونات",
    seoDesc: "كل ما تحتاج معرفته حول تطبيق وثيق، كيفية استخدام محلل المكونات، وكيفية بناء روتين العناية بالبشرة.",
    titleFirst: "الأسئلة ",
    titleMint: "الشائعة",
    subtitle: "إليك إجابات لأكثر الأسئلة تداولاً حول تطبيق وثيق.",
    lastUpdated: "آخر تحديث: 5 جوان 2026"
  },
  fr: {
    seoTitle: "FAQ Wathiq - Analyseur d'ingrédients",
    seoDesc: "Tout ce que vous devez savoir sur l'application Wathiq et comment l'utiliser.",
    titleFirst: "Foire Aux ",
    titleMint: "Questions",
    subtitle: "Voici les réponses aux questions les plus fréquentes sur Wathiq.",
    lastUpdated: "Dernière mise à jour : 5 Juin 2026"
  },
  en: {
    seoTitle: "Wathiq FAQ - Ingredients Analyzer",
    seoDesc: "Everything you need to know about the Wathiq app and how to use it.",
    titleFirst: "Frequently Asked ",
    titleMint: "Questions",
    subtitle: "Here are answers to the most common questions about Wathiq.",
    lastUpdated: "Last updated: June 5, 2026"
  }
};

const FAQS_DATA = {
  ar: [
    { question: "ما هو تطبيق وثيق؟", answer: "وثيق هو التطبيق الأول في الجزائر والعالم العربي المتخصص في تحليل مكونات مستحضرات التجميل والعناية بالبشرة باستخدام الذكاء الاصطناعي لتحديد مدى سلامتها وتوافقها مع نوع بشرتك." },
    { question: "هل تطبيق وثيق مجاني؟", answer: "نعم، التطبيق الأساسي مجاني تماماً. يمكنك مسح المكونات وتحليلها وبناء روتين العناية الخاص بك بدون أي تكاليف." },
    { question: "كيف أقوم بتحليل منتج؟", answer: "بكل بساطة، قم بتوجيه كاميرا الهاتف داخل التطبيق نحو قائمة المكونات (Ingredients) المكتوبة على ظهر المنتج، وسيقوم محرك الذكاء الاصطناعي بقرائتها وتحليلها فوراً." },
    { question: "هل يعتمد وثيق على الباركود أم المكونات؟", answer: "نحن نعتمد على قراءة المكونات الفعلية (Ingredients) وليس الباركود، لأن الباركود قد يكون مضللاً أو غير مسجل في قواعد البيانات العالمية، بينما المكونات تخبرنا بالحقيقة العلمية الدقيقة لكل منتج." },
    { question: "هل يمكنني معرفة ما إذا كان المنتج يناسب نوع بشرتي؟", answer: "بالتأكيد! عند إنشاء حسابك، ستقوم بتحديد نوع بشرتك (دهنية، جافة، مختلطة، إلخ) وأي حساسيات تعاني منها. سيقوم التطبيق بمطابقة مكونات أي منتج مع ملفك الشخصي لتحديد مدى ملاءمته لك ولطبيعة بشرتك." },
    { question: "أين يتوفر تطبيق وثيق؟", answer: "يتوفر تطبيق وثيق حالياً للتحميل المباشر لأجهزة الأندرويد عبر متجر جوجل بلاي (Google Play Store)، ونعمل على توفيره قريباً لمستخدمي نظام iOS." },
    { question: "هل أحتاج إلى اتصال بالإنترنت لاستخدام وثيق؟", answer: "نعم، يحتاج التطبيق إلى اتصال نشط بالإنترنت للوصول إلى قاعدة بياناتنا الضخمة والمحدثة باستمرار، ولإجراء تحليلات الذكاء الاصطناعي المعقدة على خوادمنا السحابية لضمان أعلى مستويات الدقة والموثوقية." },
    { question: "كيف يضمن تطبيق وثيق دقة التحليل؟", answer: "يعتمد محرك OilGuard الخاص بنا على أبحاث علمية موثقة ودراسات سريرية من منظمات الصحة العالمية وأطباء الجلدية المعتمدين. يتم مراجعة وتحديث قاعدة بياناتنا يومياً لضمان التعرف الدقيق على أحدث المكونات الكيميائية والمستخلصات الطبيعية." },
    { question: "هل يمكنني حفظ المنتجات التي قمت بتحليلها؟", answer: "نعم، يمكنك حفظ أي منتج تقوم بتحليله في قائمة المفضلات الخاصة بك، أو إضافته مباشرة إلى روتين العناية اليومي. التطبيق سيتتبع هذه المنتجات وسينبهك فوراً في حال اكتشف أي تعارض أو تداخل كيميائي سلبي بين مكونات المنتجات المختلفة التي تستخدمينها." },
    { question: "ما هي موسوعة المكونات المدمجة لروتين العناية الخاص بي؟", answer: "موسوعة مكونات الروتين هي ميزة متقدمة في تطبيق وثيق تجمع تلقائياً كافة المواد الكيميائية والمركبات الفعالة الموجودة في كل المنتجات التي تستخدمينها في روتينكِ اليومي. تقوم هذه الموسوعة بتبسيط وشرح دور كل مادة بالتفصيل (مثل حماية البشرة، الترطيب، أو مكافحة الشيخوخة) وتوضيح مدى توافقها وسلامتها، لتعرفي وتفهمي ما الذي يقدمه روتينكِ لبشرتكِ تحديداً." },
    { question: "كيف يعمل مجتمع وثيق وما الفائدة من مشاركة الروتين؟", answer: "مجتمع وثيق هو منتدى تفاعلي يجمع آلاف المهتمات بالعناية بالبشرة والشعر في الجزائر والعالم العربي. يتيح لكِ المجتمع مشاركة روتينك اليومي مع الآخرين، طرح استفساراتكِ والحصول على نصائح مجتمعية وعلمية، وقراءة تجارب العضوات الأخريات. المميز هو تصفية المنشورات وعرض مراجعات وتجارب العضوات اللواتي يمتلكن نفس نوع ومشاكل بشرتكِ تماماً بنسبة التوافق الحيوي (Bio-Match) لمنع التحسس وتفادي رمي الأموال." },
    { question: "ما هو كتالوج المنتجات وكيف يساعدني على البحث من المنزل؟", answer: "كتالوج المنتجات في وثيق هو قاعدة بيانات ضخمة تحتوي على آلاف المنتجات التجميلية والعلاجية. يمكنكِ استخدام الكتالوج من منزلكِ للبحث عن أي منتج بالاسم ومراجعة تحليله الكامل، ومقارنة المنتجات، أو فحص مكوناته فوراً دون الحاجة لزيارة صيدليات أو محلات مستحضرات التجميل وقراءة علب المنتجات هناك. كما يمكنكِ المساهمة في الكتالوج بإضافة المنتجات الناقصة لكسب نقاط وجوائز." },
    { question: "كيف تعمل ميزة ذكاء الطقس (Geo-Dermatology)؟", answer: "تقوم هذه الميزة المبتكرة بربط بيانات الطقس الحية في منطقتك (مثل نسبة الرطوبة، مستويات التلوث، ومؤشر الأشعة فوق البنفسجية) مع نوع بشرتك لتقدم لك نصائح يومية مخصصة، كأن تنصحك بزيادة الترطيب في الأيام الجافة أو اختيار واقي شمس أقوى." },
    { question: "ما هي ميزة التوافق الحيوي (Bio-Match) في المراجعات؟", answer: "ميزة التوافق الحيوي هي نظام ذكي في مجتمع وثيق يقوم بحساب نسبة مطابقة (+25% لكل عامل مشترك) بين نوع بشرتك، حساسياتك، وأهدافك مع العضوة التي كتبت المراجعة. إذا كانت النسبة 80% أو أكثر، فهذا يعني أن تجربتها مع المنتج ستكون مشابهة جداً لتجربتك، مما يسهل عليكِ اختيار المنتجات بناءً على تجارب حقيقية متطابقة." },
    { question: "ما هو صراع المنتجات (Comparison Arena) وكيف أستفيد منه؟", answer: "صراع المنتجات يتيح لكِ مقارنة منتجين جنباً إلى جنب (مثلاً منتج محلي اقتصادي ضد منتج مستورد باهظ الثمن). سيقوم التطبيق بمقارنة المكونات الفعالة، نسب الأمان، وملاءمة كل منهما لملفك الشخصي، ليوضح لكِ علمياً وبدون تحيز أيهما يستحق الشراء فعلاً." },
    { question: "كيف يعمل نظام النقاط والمساهمات (Catalog Bounties)؟", answer: "وثيق هو تطبيق تفاعلي مبني بمساهمة المجتمع. عندما تجدين منتجاً ينقصه بعض التفاصيل (مثل السعر أو المكونات)، يمكنكِ المساهمة بإضافتها وكسب نقاط فورية. هذه النقاط ترفع رتبتكِ داخل التطبيق وتمنحكِ ألقاباً مميزة مثل 'مستكشفة الجمال' أو 'أسطورة الكتالوج' تقديراً لدوركِ العلمي." }
  ],
  fr: [
    { question: "Qu'est-ce que l'application Wathiq ?", answer: "Wathiq est la première application en Algérie et dans le monde arabe spécialisée dans l'analyse des ingrédients cosmétiques à l'aide de l'Intelligence Artificielle pour déterminer leur sécurité et compatibilité." },
    { question: "Wathiq est-elle gratuite ?", answer: "Oui, l'application de base est entièrement gratuite. Vous pouvez analyser les ingrédients et construire votre routine sans frais." },
    { question: "Comment analyser un produit ?", answer: "Pointez simplement l'appareil photo vers la liste des ingrédients. Notre IA la lira et l'analysera instantanément." },
    { question: "Pourquoi utiliser les ingrédients et non le code-barres ?", answer: "Les codes-barres peuvent être trompeurs. Seuls les ingrédients reflètent la vérité scientifique exacte d'un produit." },
    { question: "Puis-je savoir si un produit me convient ?", answer: "Absolument ! Lors de la création de votre profil, indiquez votre type de peau et vos sensibilités. L'application calculera la compatibilité de chaque produit." },
    { question: "Où puis-je télécharger Wathiq ?", answer: "Wathiq est actuellement disponible sur Android (Google Play Store). La version iOS arrivera prochainement." },
    { question: "Ai-je besoin d'internet ?", answer: "Oui, une connexion active est nécessaire pour accéder à notre vaste base de données et utiliser notre IA cloud." },
    { question: "Comment l'analyse est-elle garantie exacte ?", answer: "Notre moteur OilGuard s'appuie sur des études cliniques et des recherches scientifiques approuvées par l'OMS et les dermatologues." },
    { question: "Puis-je sauvegarder mes produits ?", answer: "Oui, ajoutez-les à vos favoris ou à votre routine. L'application détectera même les interactions chimiques négatives entre vos produits." },
    { question: "Qu'est-ce que l'encyclopédie des routines ?", answer: "C'est une fonctionnalité avancée qui compile tous les ingrédients de vos produits pour vous expliquer le rôle et la sécurité de chacun." },
    { question: "Qu'est-ce que la communauté Wathiq ?", answer: "Un forum interactif pour partager votre routine, poser des questions et filtrer les avis avec le Bio-Match pour trouver des expériences similaires." },
    { question: "Qu'est-ce que le catalogue de produits ?", answer: "Une base de données géante pour rechercher et comparer des produits depuis chez vous, sans avoir à visiter de pharmacies." },
    { question: "Comment fonctionne le Geo-Dermatology ?", answer: "Cette fonctionnalité relie la météo de votre région (humidité, UV) à votre type de peau pour vous donner des conseils personnalisés chaque jour." },
    { question: "Qu'est-ce que le Bio-Match ?", answer: "Un système intelligent qui calcule le pourcentage de correspondance entre votre peau et celle d'un autre utilisateur pour des avis ultra-fiables." },
    { question: "Qu'est-ce que l'arène de comparaison ?", answer: "Un outil pour comparer scientifiquement deux produits (ex. local vs importé) et voir lequel vaut vraiment votre argent." },
    { question: "Comment fonctionne le système de points (Bounties) ?", answer: "Contribuez au catalogue en ajoutant des informations manquantes pour gagner des points et des badges exclusifs." }
  ],
  en: [
    { question: "What is the Wathiq app?", answer: "Wathiq is the first app in Algeria and the Arab world specialized in analyzing cosmetic ingredients using AI to determine their safety and compatibility with your skin." },
    { question: "Is Wathiq free?", answer: "Yes, the core app is completely free. You can scan ingredients and build your routine at no cost." },
    { question: "How do I analyze a product?", answer: "Simply point your camera at the ingredients list. Our AI will read and analyze it instantly." },
    { question: "Why ingredients instead of barcodes?", answer: "Barcodes can be misleading or missing. Ingredients provide the exact scientific truth about every product." },
    { question: "Can I know if a product suits my skin?", answer: "Absolutely! Create a profile with your skin type and sensitivities, and the app will calculate the product's compatibility." },
    { question: "Where is Wathiq available?", answer: "Wathiq is currently available on Android (Google Play Store). An iOS version is coming soon." },
    { question: "Do I need internet to use Wathiq?", answer: "Yes, an active connection is required to access our database and run complex AI analyses on our cloud servers." },
    { question: "How does Wathiq ensure accuracy?", answer: "Our OilGuard engine is based on documented clinical studies and research approved by the WHO and certified dermatologists." },
    { question: "Can I save analyzed products?", answer: "Yes, save them to your favorites or add them to your routine. The app will even alert you of any negative chemical interactions." },
    { question: "What is the Routine Encyclopedia?", answer: "An advanced feature that compiles all ingredients in your routine, explaining the role and safety of each specific chemical." },
    { question: "How does the Wathiq Community work?", answer: "An interactive forum to share routines, ask questions, and filter reviews using Bio-Match to find users with your exact skin profile." },
    { question: "What is the Product Catalog?", answer: "A massive database allowing you to search and compare products from home, without needing to visit pharmacies." },
    { question: "How does Geo-Dermatology work?", answer: "It links local weather data (humidity, UV index) with your skin type to provide personalized daily skincare advice." },
    { question: "What is Bio-Match in reviews?", answer: "A smart system that calculates a match percentage between your skin and another user's, ensuring highly relevant reviews." },
    { question: "What is the Comparison Arena?", answer: "Compare two products side-by-side (e.g., local vs. expensive imported) to see scientifically which one is worth buying." },
    { question: "How do Catalog Bounties work?", answer: "Contribute missing product details to earn points and exclusive badges like 'Beauty Explorer'." }
  ]
};

const FAQPage = () => {
  const navigate = useNavigate();
  const { lang } = useLang();
  const [openIndex, setOpenIndex] = useState(null);
  const isRTL = lang === 'ar';

  const t = UI_TEXT[lang] || UI_TEXT.ar;
  const faqs = FAQS_DATA[lang] || FAQS_DATA.ar;

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Generate FAQ Schema dynamically
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className={`landing-wrapper ${isRTL ? '' : 'ltr'}`} style={{ minHeight: '100vh', paddingBottom: '50px', direction: isRTL ? 'rtl' : 'ltr' }}>
      <SEO 
        title={t.seoTitle} 
        description={t.seoDesc}
        schema={faqSchema}
        lastUpdated="2026-06-05T12:00:00Z"
      />

      {/* Grid Overlay to match Landing Page */}
      <div className="grid-overlay" />
      
      <WathiqHeader />

      <section className="container section-padding" style={{ paddingTop: '120px', maxWidth: '800px' }}>
        <div className="section-header">
          <h1 className="section-title" style={{ textAlign: 'center' }}>
            {t.titleFirst} <span className="text-mint">{t.titleMint}</span>
          </h1>
          <p className="section-subtitle" style={{ textAlign: 'center' }}>{t.subtitle}</p>
          <p style={{fontSize: '0.85rem', color: '#cbd5e1', marginTop: '10px', textAlign: 'center'}}>
            {t.lastUpdated}
          </p>
        </div>

        <div className="faq-container" style={{ marginTop: '40px' }}>
          {faqs.map((faq, index) => (
            <motion.div 
              key={index} 
              className="faq-item bento-card bg-gradient-subtle" 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{ 
                marginBottom: '15px', 
                padding: '0', // override bento-card default padding
                overflow: 'hidden',
                cursor: 'pointer',
                alignItems: 'stretch',
                width: '100%'
              }}
              onClick={() => toggleFaq(index)}
            >
              <div 
                className="faq-question" 
                style={{ 
                  padding: '20px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  color: '#fff',
                  gap: '15px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <span style={{ flex: 1, textAlign: isRTL ? 'right' : 'left', lineHeight: '1.4' }}>{faq.question}</span>
                <span style={{ 
                  flexShrink: 0, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px'
                }}>
                  {openIndex === index ? <ChevronUp size={24} className="text-mint" /> : <ChevronDown size={24} className="text-gray-400" />}
                </span>
              </div>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '0 20px 20px 20px', color: '#cbd5e1', lineHeight: '1.6', fontSize: '0.95rem', textAlign: isRTL ? 'right' : 'left' }}>
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default FAQPage;
