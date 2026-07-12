import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import SEO from './SEO';
import wathiqLogo from '../assets/wathiq-logo.png';
import '../LandingPage.css'; // Reusing some base styles
import WathiqHeader from './WathiqHeader';

const faqs = [
  {
    question: "ما هو تطبيق وثيق؟",
    answer: "وثيق هو التطبيق الأول في الجزائر والعالم العربي المتخصص في تحليل مكونات مستحضرات التجميل والعناية بالبشرة باستخدام الذكاء الاصطناعي لتحديد مدى سلامتها وتوافقها مع نوع بشرتك."
  },
  {
    question: "هل تطبيق وثيق مجاني؟",
    answer: "نعم، التطبيق الأساسي مجاني تماماً. يمكنك مسح المكونات وتحليلها وبناء روتين العناية الخاص بك بدون أي تكاليف."
  },
  {
    question: "كيف أقوم بتحليل منتج؟",
    answer: "بكل بساطة، قم بتوجيه كاميرا الهاتف داخل التطبيق نحو قائمة المكونات (Ingredients) المكتوبة على ظهر المنتج، وسيقوم محرك الذكاء الاصطناعي بقرائتها وتحليلها فوراً."
  },
  {
    question: "هل يعتمد وثيق على الباركود أم المكونات؟",
    answer: "نحن نعتمد على قراءة المكونات الفعلية (Ingredients) وليس الباركود، لأن الباركود قد يكون مضللاً أو غير مسجل في قواعد البيانات العالمية، بينما المكونات تخبرنا بالحقيقة العلمية الدقيقة لكل منتج."
  },
  {
    question: "هل يمكنني معرفة ما إذا كان المنتج يناسب نوع بشرتي؟",
    answer: "بالتأكيد! عند إنشاء حسابك، ستقوم بتحديد نوع بشرتك (دهنية، جافة، مختلطة، إلخ) وأي حساسيات تعاني منها. سيقوم التطبيق بمطابقة مكونات أي منتج مع ملفك الشخصي لتحديد مدى ملاءمته لك ولطبيعة بشرتك."
  },
  {
    question: "أين يتوفر تطبيق وثيق؟",
    answer: "يتوفر تطبيق وثيق حالياً للتحميل المباشر لأجهزة الأندرويد عبر متجر جوجل بلاي (Google Play Store)، ونعمل على توفيره قريباً لمستخدمي نظام iOS."
  },
  {
    question: "هل أحتاج إلى اتصال بالإنترنت لاستخدام وثيق؟",
    answer: "نعم، يحتاج التطبيق إلى اتصال نشط بالإنترنت للوصول إلى قاعدة بياناتنا الضخمة والمحدثة باستمرار، ولإجراء تحليلات الذكاء الاصطناعي المعقدة على خوادمنا السحابية لضمان أعلى مستويات الدقة والموثوقية."
  },
  {
    question: "كيف يضمن تطبيق وثيق دقة التحليل؟",
    answer: "يعتمد محرك OilGuard الخاص بنا على أبحاث علمية موثقة ودراسات سريرية من منظمات الصحة العالمية وأطباء الجلدية المعتمدين. يتم مراجعة وتحديث قاعدة بياناتنا يومياً لضمان التعرف الدقيق على أحدث المكونات الكيميائية والمستخلصات الطبيعية."
  },
  {
    question: "هل يمكنني حفظ المنتجات التي قمت بتحليلها؟",
    answer: "نعم، يمكنك حفظ أي منتج تقوم بتحليله في قائمة المفضلات الخاصة بك، أو إضافته مباشرة إلى روتين العناية اليومي. التطبيق سيتتبع هذه المنتجات وسينبهك فوراً في حال اكتشف أي تعارض أو تداخل كيميائي سلبي بين مكونات المنتجات المختلفة التي تستخدمينها."
  },
  {
    question: "ما هي موسوعة المكونات المدمجة لروتين العناية الخاص بي؟",
    answer: "موسوعة مكونات الروتين هي ميزة متقدمة في تطبيق وثيق تجمع تلقائياً كافة المواد الكيميائية والمركبات الفعالة الموجودة في كل المنتجات التي تستخدمينها في روتينكِ اليومي. تقوم هذه الموسوعة بتبسيط وشرح دور كل مادة بالتفصيل (مثل حماية البشرة، الترطيب، أو مكافحة الشيخوخة) وتوضيح مدى توافقها وسلامتها، لتعرفي وتفهمي ما الذي يقدمه روتينكِ لبشرتكِ تحديداً."
  },
  {
    question: "كيف يعمل مجتمع وثيق وما الفائدة من مشاركة الروتين؟",
    answer: "مجتمع وثيق هو منتدى تفاعلي يجمع آلاف المهتمات بالعناية بالبشرة والشعر في الجزائر والعالم العربي. يتيح لكِ المجتمع مشاركة روتينك اليومي مع الآخرين، طرح استفساراتكِ والحصول على نصائح مجتمعية وعلمية، وقراءة تجارب العضوات الأخريات. المميز هو تصفية المنشورات وعرض مراجعات وتجارب العضوات اللواتي يمتلكن نفس نوع ومشاكل بشرتكِ تماماً بنسبة التوافق الحيوي (Bio-Match) لمنع التحسس وتفادي رمي الأموال."
  },
  {
    question: "ما هو كتالوج المنتجات وكيف يساعدني على البحث من المنزل؟",
    answer: "كتالوج المنتجات في وثيق هو قاعدة بيانات ضخمة تحتوي على آلاف المنتجات التجميلية والعلاجية. يمكنكِ استخدام الكتالوج من منزلكِ للبحث عن أي منتج بالاسم ومراجعة تحليله الكامل، ومقارنة المنتجات، أو فحص مكوناته فوراً دون الحاجة لزيارة صيدليات أو محلات مستحضرات التجميل وقراءة علب المنتجات هناك. كما يمكنكِ المساهمة في الكتالوج بإضافة المنتجات الناقصة لكسب نقاط وجوائز."
  },
  {
    question: "كيف تعمل ميزة ذكاء الطقس (Geo-Dermatology)؟",
    answer: "تقوم هذه الميزة المبتكرة بربط بيانات الطقس الحية في منطقتك (مثل نسبة الرطوبة، مستويات التلوث، ومؤشر الأشعة فوق البنفسجية) مع نوع بشرتك لتقدم لك نصائح يومية مخصصة، كأن تنصحك بزيادة الترطيب في الأيام الجافة أو اختيار واقي شمس أقوى."
  },
  {
    question: "ما هي ميزة التوافق الحيوي (Bio-Match) في المراجعات؟",
    answer: "ميزة التوافق الحيوي هي نظام ذكي في مجتمع وثيق يقوم بحساب نسبة مطابقة (+25% لكل عامل مشترك) بين نوع بشرتك، حساسياتك، وأهدافك مع العضوة التي كتبت المراجعة. إذا كانت النسبة 80% أو أكثر، فهذا يعني أن تجربتها مع المنتج ستكون مشابهة جداً لتجربتك، مما يسهل عليكِ اختيار المنتجات بناءً على تجارب حقيقية متطابقة."
  },
  {
    question: "ما هو صراع المنتجات (Comparison Arena) وكيف أستفيد منه؟",
    answer: "صراع المنتجات يتيح لكِ مقارنة منتجين جنباً إلى جنب (مثلاً منتج محلي اقتصادي ضد منتج مستورد باهظ الثمن). سيقوم التطبيق بمقارنة المكونات الفعالة، نسب الأمان، وملاءمة كل منهما لملفك الشخصي، ليوضح لكِ علمياً وبدون تحيز أيهما يستحق الشراء فعلاً."
  },
  {
    question: "كيف يعمل نظام النقاط والمساهمات (Catalog Bounties)؟",
    answer: "وثيق هو تطبيق تفاعلي مبني بمساهمة المجتمع. عندما تجدين منتجاً ينقصه بعض التفاصيل (مثل السعر أو المكونات)، يمكنكِ المساهمة بإضافتها وكسب نقاط فورية. هذه النقاط ترفع رتبتكِ داخل التطبيق وتمنحكِ ألقاباً مميزة مثل 'مستكشفة الجمال' أو 'أسطورة الكتالوج' تقديراً لدوركِ العلمي."
  }
];

const FAQPage = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

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
    <div className="landing-wrapper" style={{ minHeight: '100vh', paddingBottom: '50px' }}>
      <SEO 
        title="الأسئلة الشائعة حول تطبيق وثيق والمكونات" 
        description="كل ما تحتاج معرفته حول تطبيق وثيق، كيفية استخدام محلل المكونات، وكيفية بناء روتين العناية بالبشرة."
        schema={faqSchema}
        lastUpdated="2026-06-05T12:00:00Z"
      />

      {/* Grid Overlay to match Landing Page */}
      <div className="grid-overlay" />
      
      <WathiqHeader />

      <section className="container section-padding" style={{ paddingTop: '120px', maxWidth: '800px' }}>
        <div className="section-header">
          <h1 className="section-title">الأسئلة <span className="text-mint">الشائعة</span></h1>
          <p className="section-subtitle">إليك إجابات لأكثر الأسئلة تداولاً حول تطبيق وثيق.</p>
          <p style={{fontSize: '0.85rem', color: '#cbd5e1', marginTop: '10px'}}>
            آخر تحديث: <time dateTime="2026-06-05T12:00:00Z">5 جوان 2026</time>
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
                <span style={{ flex: 1, textAlign: 'right', lineHeight: '1.4' }}>{faq.question}</span>
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
                    <div style={{ padding: '0 20px 20px 20px', color: '#cbd5e1', lineHeight: '1.6', fontSize: '0.95rem' }}>
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
