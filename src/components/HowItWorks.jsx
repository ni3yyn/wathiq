import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Camera, Cpu, ShieldCheck, BarChart3, BookOpen, Users,
  ArrowRight, CheckCircle2, Zap, AlertTriangle, XCircle,
  FlaskConical, ScanLine, DatabaseZap, Brain, Target, Layers
} from 'lucide-react';
import SEO from './SEO';
import wathiqLogo from '../assets/wathiq-logo.png';
import '../LandingPage.css';
import './HowItWorks.css';

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

const STEPS = [
  {
    id: '01',
    icon: Camera,
    color: 'mint',
    title: 'امسحي قائمة المكونات',
    subtitle: 'بدون باركود — فقط الحقيقة',
    body: 'وجّهي كاميرا الهاتف مباشرةً نحو قائمة Ingredients المطبوعة على ظهر أي منتج. لا باركود، لا بحث يدوي. تقنية قراءة النصوص (OCR) المدمجة تستخلص فوراً كل مكوّن مكتوب، سواء كان اسمه كيميائياً طويلاً أو مستخلصاً نباتياً نادراً.',
    details: [
      'يعمل مع أي لغة: إنجليزي، فرنسي، عربي',
      'يستخرج المكونات حتى من الخطوط الصغيرة',
      'يدعم الإدخال اليدوي للنصوص المنسوخة',
    ]
  },
  {
    id: '02',
    icon: Brain,
    color: 'purple',
    title: 'محرك OilGuard يُحلّل كل مكوّن',
    subtitle: '2,500 مكوّن في قاعدة البيانات',
    body: 'يبدأ محرك OilGuard الخاص بنا عملية مطابقة علمية دقيقة: يُقارن كل مكوّن بقاعدة بياناتنا المبنية على دراسات منشورة في المجلات العلمية المحكّمة. يُحدَّد دور كل مادة (مرطّبة؟ حافظة؟ مُقشّرة؟)، درجة أمانها، ونسبة فعاليتها الفعلية.',
    details: [
      'تصنيف وظيفي لكل مكوّن (moisturizer, exfoliant...)',
      'كشف المواد المقلقة: الباربان، الفورمالدهيد، الكحول الجاف',
      'قياس التركيز والأهمية وفق ترتيب القائمة',
    ]
  },
  {
    id: '03',
    icon: ShieldCheck,
    color: 'gold',
    title: 'فحص الادعاءات التسويقية',
    subtitle: 'هل يتطابق الوعد مع الواقع؟',
    body: 'هذه هي الميزة التي لا مثيل لها. يفحص وثيق العبارات الترويجية المكتوبة على المنتج — "مضاد للشيخوخة"، "يُشرق البشرة"، "علاج حب الشباب" — ثم يقارنها بالمكونات الفعلية. إن لم يحتوِ المنتج على المركبات العلمية الضرورية لتحقيق هذا الوعد، يكشف وثيق الحقيقة بلا مجاملة.',
    details: [
      'قاعدة بيانات ادعاءات تحتوي على 200+ عبارة تسويقية',
      'درجة تحقق الادعاء: موثوق / جزئي / مضلّل',
      'شرح علمي مبسّط لماذا يفشل أو ينجح المنتج',
    ]
  },
  {
    id: '04',
    icon: Target,
    color: 'danger',
    title: 'مطابقة ملفك الشخصي',
    subtitle: 'ليس كل منتج جيد يناسبك',
    body: 'نوع بشرتك، حساسياتك، أهدافك (ترطيب، تفتيح، علاج حب الشباب)، وحالاتك الصحية — كل هذا يُدخله وثيق في حسابه. حتى لو كان المنتج آمناً بشكل عام، قد لا يكون هو الأنسب لك تحديداً. وثيق يُخبرك بالفرق.',
    details: [
      'يراعي البشرة الدهنية، الجافة، المختلطة، الحساسة',
      'يُحذّر من المكونات التي تتعارض مع حساسياتك',
      'يقيّم مدى ملاءمة المنتج لهدفك الرئيسي',
    ]
  },
  {
    id: '05',
    icon: BarChart3,
    color: 'mint',
    title: 'تحصلين على درجة وثيق',
    subtitle: 'رقم واحد يخبرك كل شيء',
    body: 'بعد التحليل متعدد الأبعاد، يُصدر وثيق درجة شاملة من 100 تُعبّر عن: أمان المكونات + فعالية التركيبة + صدق الادعاءات التسويقية + توافقها مع بشرتك تحديداً. رقم واحد موضوعي، بلا تحيّز، بلا إعلانات مدفوعة.',
    details: [
      '90-100: ممتاز، مكونات ذهبية وادعاءات موثوقة',
      '60-89: جيد، بعض ملاحظات بسيطة',
      'أقل من 60: مراجعة مطلوبة، قد يكون مضللاً',
    ]
  },
  {
    id: '06',
    icon: Layers,
    color: 'purple',
    title: 'بناء روتين عناية آمن',
    subtitle: 'كل منتجاتك تعمل معاً بانسجام',
    body: 'حين تحفظين أكثر من منتج، يبدأ "مهندس الروتين الذكي" عمله: يُحدد التعارضات الكيميائية الخطيرة (مثل خلط Retinol مع Vitamin C الحمضي)، يقترح ترتيب التطبيق الصحيح صباحاً ومساءً، ويكتشف الفجوات في روتينك ويقترح ما ينقصك.',
    details: [
      'كشف التعارضات: Retinol + AHA، Niacinamide + Vitamin C',
      'خريطة توقيت: ما يُستعمل صباحاً وما يُستعمل ليلاً',
      'قائمة المكونات الغائبة التي تحتاجها بشرتك',
    ]
  },
];

const SCIENCE_PILLARS = [
  {
    icon: DatabaseZap,
    title: 'قاعدة بيانات علمية حيّة',
    desc: 'قاعدة بيانات موثّقة بمصادر من PubMed، INCI، ودراسات طب الأمراض الجلدية لـ 2,500 مكوّن نشط وشائع في السوق.',
  },
  {
    icon: FlaskConical,
    title: 'نماذج كيميائية دقيقة',
    desc: 'يستخدم محرك OilGuard نماذج تركيز Bayesian، نظرية Loewe للتآزر الكيميائي، وخرائط الساعة البيولوجية لتقييم فعالية المكونات.',
  },
  {
    icon: ScanLine,
    title: 'OCR متخصص للمكونات',
    desc: 'على عكس OCR العام، محركنا مُدرَّب على الأسماء الكيميائية INCI الطويلة والمركّبة، مما يمنحه دقة استخراج تفوق 97% حتى على العبوات الصغيرة.',
  },
  {
    icon: Zap,
    title: 'تحليل فوري',
    desc: 'في غضون 4-5 ثوانٍ فقط من رفع الصورة، يُكمل وثيق دورة التحليل الكاملة: استخراج، مطابقة، تقييم، وإصدار التقرير النهائي.',
  },
];

const COMPARISON = [
  { aspect: 'يقرأ قائمة Ingredients مباشرة', wathiq: true, others: 'مدفوع أو محدود' },
  { aspect: 'يفحص صدق الادعاءات التسويقية', wathiq: true, others: false },
  { aspect: 'يُحدد الفعالية الفعلية لا مجرد الأمان', wathiq: true, others: false },
  { aspect: 'يراعي نوع بشرتك وأهدافك', wathiq: true, others: 'جزئي' },
  { aspect: 'يكشف التعارضات بين منتجات الروتين', wathiq: true, others: false },
  { aspect: 'يعمل بدون باركود', wathiq: true, others: 'نادراً' },
  { aspect: 'محتوى عربي كامل', wathiq: true, others: false },
];

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

// ─── Glowing SVG Arrow (Desktop, between steps) ───────────────────────
// direction: 'down-right' | 'down-left' — which way the curve bows
const HiwArrowDesktop = ({ id, direction }) => {
  // Starts from center-right (or center-left) and sweeps down to the next step
  const isRight = direction === 'down-right';
  // Path: starts left side, curves right/down, ends right side (or vice versa)
  const d = isRight
    ? 'M 20 10 C 20 80, 130 70, 130 140'   // bow right
    : 'M 130 10 C 130 80, 20 70, 20 140';  // bow left

  return (
    <svg
      className="hiw-arrow-desktop"
      viewBox="0 0 150 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`hiw-grad-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
        </linearGradient>
        <marker id={`hiw-head-${id}`} markerWidth="16" markerHeight="16" refX="8" refY="8" orient="auto" markerUnits="userSpaceOnUse" overflow="visible">
          <path d="M 0 0 L 16 8 L 0 16 z" fill="#10b981" />
        </marker>
        <filter id={`hiw-glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <motion.path
        d={d}
        stroke={`url(#hiw-grad-${id})`}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        markerEnd={`url(#hiw-head-${id})`}
        filter={`url(#hiw-glow-${id})`}
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
      />
    </svg>
  );
};

// ─── Glowing SVG Arrow (Mobile, alternating curve) ────────────────────
const HiwArrowMobile = ({ id, direction }) => {
  const isRight = direction === 'down-right';
  // Gentle bow: starts center-top, curves to one side and back to center-bottom
  const d = isRight
    ? 'M 40 5 C 55 30, 55 50, 40 75'   // bows right
    : 'M 20 5 C 5 30, 5 50, 20 75';    // bows left

  return (
    <svg
      className="hiw-arrow-mobile"
      viewBox="0 0 60 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`hiw-mob-grad-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
        </linearGradient>
        <marker id={`hiw-mob-head-${id}`} markerWidth="16" markerHeight="16" refX="8" refY="8" orient="auto" markerUnits="userSpaceOnUse" overflow="visible">
          <path d="M 0 0 L 16 8 L 0 16 z" fill="#10b981" />
        </marker>
        <filter id={`hiw-mob-glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <motion.path
        d={d}
        stroke={`url(#hiw-mob-grad-${id})`}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        markerEnd={`url(#hiw-mob-head-${id})`}
        filter={`url(#hiw-mob-glow-${id})`}
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{ duration: 1.1, ease: 'easeInOut' }}
      />
    </svg>
  );
};

// ─── Step Item (no entrance animation, just static card) ──────────────
const StepItem = ({ step, index }) => {
  const isEven = index % 2 === 0; // even = card on right side (default RTL start)

  return (
    <div className={`hiw-step-item ${isEven ? 'hiw-step-right' : 'hiw-step-left'}`}>
      {/* Step number badge — sidebar */}
      <div className="hiw-step-badge">
        <span className="hiw-step-badge-num">{step.id}</span>
      </div>

      {/* Card */}
      <div className={`hiw-step-item-card bento-card hiw-card-${step.color}`}>
        <div className="hiw-step-item-header">
          <span className="hiw-step-badge-num hiw-step-badge-num-mobile">{step.id}</span>
          <span className="hiw-step-subtitle">{step.subtitle}</span>
        </div>
        <h2 className="hiw-step-title">{step.title}</h2>
        <p className="hiw-step-desc">{step.body}</p>
        <ul className="hiw-step-list" aria-label="تفاصيل الخطوة">
          {step.details.map((d, i) => (
            <li key={i} className="hiw-step-list-item">
              <CheckCircle2 size={15} className="hiw-check-icon" />
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};


const SciencePillar = ({ pillar, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.5, delay: index * 0.12 }}
    className="hiw-pillar-card bento-card"
  >
    <h3>{pillar.title}</h3>
    <p className="bento-desc" style={{ marginTop: '0.75rem' }}>{pillar.desc}</p>
  </motion.div>
);

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

const HowItWorks = () => {

  // ── Schema.org: HowTo ──────────────────────
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "كيف يعمل تطبيق وثيق لتحليل مكونات مستحضرات التجميل",
    "description": "دليل كامل خطوة بخطوة يشرح كيف يحلل تطبيق وثيق مكونات منتجات العناية بالبشرة باستخدام الذكاء الاصطناعي ويكشف الادعاءات التسويقية.",
    "image": "https://wathiq.web.app/og-image.png",
    "totalTime": "PT3M",
    "tool": [{ "@type": "HowToTool", "name": "تطبيق وثيق لأجهزة أندرويد" }],
    "step": STEPS.map((s, i) => ({
      "@type": "HowToStep",
      "position": i + 1,
      "name": s.title,
      "text": s.body,
      "url": `https://wathiq.web.app/how-it-works#step-${s.id}`
    }))
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "وثيق",
    "alternateName": "Wathiq",
    "operatingSystem": "Android",
    "applicationCategory": "HealthApplication",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "DZD" },
    "description": "تطبيق أندرويد لتحليل مكونات مستحضرات التجميل وكشف الادعاءات التسويقية المضللة باستخدام الذكاء الاصطناعي.",
    "url": "https://wathiq.web.app",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "324"
    }
  };

  return (
    <div className="landing-wrapper hiw-wrapper" style={{ minHeight: '100vh' }}>
      <SEO
        title="كيف يعمل وثيق — محلل المكونات والادعاءات التسويقية"
        description="تعرّفي على آلية عمل تطبيق وثيق خطوة بخطوة: من مسح قائمة المكونات، تحليل أكثر من 2,500 مركّب كيميائي، فحص الادعاءات التسويقية، حتى بناء روتين عناية آمن ومخصص لبشرتك."
        keywords="كيف يعمل وثيق, تحليل مكونات مستحضرات التجميل, فحص ادعاءات تسويقية, OilGuard, تطبيق عناية بشرة, ذكاء اصطناعي تجميل, الجزائر"
        schema={[howToSchema, softwareSchema]}
        lastUpdated="2026-06-12T00:00:00Z"
      />
      <div className="grid-overlay" />

      {/* ── Hero ── */}
      <header className="hiw-hero container" role="banner">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="hiw-hero-inner"
        >

          <h1 className="hiw-hero-title">
            كيف يكشف <span className="text-mint">وثيق</span><br />حقيقة منتجاتك؟
          </h1>
          <p className="hiw-hero-sub">
            لا خوارزميات مخفية، لا ادعاءات مبهمة. هنا نشرح بدقة كيف يُحلّل وثيق قائمة مكونات أي منتج، 
            ويفضح الفجوة بين الوعد التسويقي والحقيقة العلمية — في غضون 4-5 ثوانٍ فقط.
          </p>
          <div className="hiw-hero-stats">
            <div className="hiw-stat">
              <span className="hiw-stat-num text-mint">2,500</span>
              <span className="hiw-stat-label">مكوّن في قاعدة البيانات</span>
            </div>
            <div className="hiw-stat-divider" />
            <div className="hiw-stat">
              <span className="hiw-stat-num text-mint">45</span>
              <span className="hiw-stat-label">ادعاء تسويقي مُفحوص</span>
            </div>
            <div className="hiw-stat-divider" />
            <div className="hiw-stat">
              <span className="hiw-stat-num text-mint">4-5 ثوانٍ</span>
              <span className="hiw-stat-label">وقت التحليل الكامل</span>
            </div>
          </div>
        </motion.div>
      </header>

      {/* ── Steps ── */}
      <main>
        <section className="container hiw-steps-section" aria-labelledby="steps-heading">
          <h2 id="steps-heading" className="section-title" style={{ marginBottom: '0.5rem' }}>
            من الكاميرا إلى <span className="text-mint">التقرير النهائي</span>
          </h2>
          <p className="section-subtitle" style={{ marginBottom: '4rem' }}>
            ست خطوات، كل واحدة مبنية على الأخرى، لتمنحك أعمق فهم لما تضعينه على بشرتك
          </p>

          <div className="hiw-steps-list" role="list" aria-label="خطوات عمل وثيق">
            {STEPS.map((step, i) => {
              // Arrows alternate: 0→1 bows right, 1→2 bows left, etc.
              const arrowDir = i % 2 === 0 ? 'down-right' : 'down-left';
              return (
                <div key={step.id} id={`step-${step.id}`} role="listitem">
                  <StepItem step={step} index={i} />
                  {i < STEPS.length - 1 && (
                    <div className="hiw-arrow-connector" aria-hidden="true">
                      <HiwArrowDesktop id={`${i}-${i+1}`} direction={arrowDir} />
                      <HiwArrowMobile id={`mob-${i}-${i+1}`} direction={arrowDir} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Science Pillars ── */}
        <section className="hiw-pillars-section section-padding" aria-labelledby="science-heading">
          <div className="container">
            <h2 id="science-heading" className="section-title">
              العلم وراء <span className="text-mint">وثيق</span>
            </h2>
            <p className="section-subtitle" style={{ marginBottom: '3rem' }}>
              أربع ركائز تقنية تجعل تحليل وثيق فريداً
            </p>
            <div className="bento-grid hiw-pillars-grid">
              {SCIENCE_PILLARS.map((p, i) => (
                <div key={i} className="col-span-6" style={{ gridColumn: 'span 6' }}>
                  <SciencePillar pillar={p} index={i} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Comparison Table ── */}
        <section className="container hiw-compare-section section-padding" aria-labelledby="compare-heading">
          <h2 id="compare-heading" className="section-title">
            وثيق مقارنةً <span className="text-mint">بالبدائل</span>
          </h2>
          <p className="section-subtitle" style={{ marginBottom: '3rem' }}>
            ما الذي يجعل وثيق مختلفاً عن تطبيقات تحليل المكونات الأخرى؟
          </p>
          <div className="hiw-compare-table-wrap">
            <table className="hiw-compare-table" aria-label="مقارنة بين وثيق والتطبيقات الأخرى">
              <thead>
                <tr>
                  <th scope="col" style={{ textAlign: 'right' }}>الميزة</th>
                  <th scope="col" className="hiw-col-wathiq">
                    <img src={wathiqLogo} alt="وثيق" style={{ height: '24px', verticalAlign: 'middle', marginLeft: '6px' }} />
                    وثيق
                  </th>
                  <th scope="col" className="hiw-col-others">تطبيقات أخرى</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={i}>
                    <td style={{ textAlign: 'right' }}>{row.aspect}</td>
                    <td className="hiw-col-wathiq">
                      <CheckCircle2 size={20} color="#10b981" aria-label="نعم" />
                    </td>
                    <td className="hiw-col-others">
                      {row.others === false
                        ? <AlertTriangle size={18} color="#f43f5e" aria-label="لا" />
                        : <span style={{ color: '#fbbf24', fontSize: '0.85rem' }}>{row.others}</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Trust Section ── */}
        <section className="container hiw-trust-section section-padding" aria-labelledby="trust-heading">
          <h2 id="trust-heading" className="section-title">
            ما لا يفعله <span className="text-mint">وثيق</span> أبداً
          </h2>
          <p className="section-subtitle" style={{ marginBottom: '1.5rem' }}>
            شفافية كاملة — لا مصالح تجارية، لا إعلانات مدفوعة
          </p>
          <div className="hiw-trust-grid">
            {[
              { type: 'no',  text: 'لا يُروّج لمنتجات برعاية مدفوعة أو إعلانات مدفوعة' },
              { type: 'no',  text: 'لا يُعطي درجات مرتفعة للعلامات التجارية الشهيرة بسبب سمعتها' },
              { type: 'no',  text: 'لا يُخفي المكونات المقلقة أو يُهوّن من شأنها' },
              { type: 'no',  text: 'لا يبيع بياناتك لشركات التجميل أو الإعلانات' },
              { type: 'yes', text: 'يعمل فقط بالأدلة العلمية الموثقة في المجلات المحكّمة' },
              { type: 'yes', text: 'يُحدّث قاعدة البيانات باستمرار بناءً على أحدث الأبحاث' },
            ].map((item, i) => (
              <div key={i} className="hiw-trust-item">
                <span className="hiw-trust-icon">
                  {item.type === 'no'
                    ? <XCircle size={18} color="#f43f5e" />
                    : <CheckCircle2 size={18} color="#10b981" />
                  }
                </span>
                <span className="hiw-trust-text">{item.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="footer-cta" aria-labelledby="cta-heading">
          <div className="top-fade" />
          <div className="brand-logo-large">
            <img src={wathiqLogo} alt="تطبيق وثيق" />
          </div>
          <h2 id="cta-heading" className="cta-headline">
            جرّبي وثيق الآن — مجاناً
          </h2>
          <p className="cta-sub">
            جهّزي أي منتج من خزانتك وامسحي قائمة مكوناته.<br />
            الحقيقة العلمية في 4-5 ثوانٍ.
          </p>
          <div className="cta-group-modern" style={{ justifyContent: 'center' }}>
            <Link to="/" className="btn-primary large cta-btn-glow" style={{ textDecoration: 'none', display: 'inline-flex' }}>
              <span className="shine-effect" />
              ابدأي التحليل مجاناً
              <span className="icon-bounce">↓</span>
            </Link>
          </div>
          <div className="trust-badges">
            <span className="badge">
              <CheckCircle2 size={14} color="#10b981" />
              مجاني تماماً
            </span>
            <span className="badge">
              <CheckCircle2 size={14} color="#10b981" />
              بلا إعلانات
            </span>
            <span className="badge">
              <CheckCircle2 size={14} color="#10b981" />
              أندرويد
            </span>
          </div>
          <nav className="hiw-footer-nav" aria-label="روابط ثانوية">
            <Link to="/faq">الأسئلة الشائعة</Link>
            <Link to="/research">الأبحاث المعتمد عليها</Link>
            <Link to="/privacy">سياسة الخصوصية</Link>
            <Link to="/terms">شروط الاستخدام</Link>
          </nav>
          <p className="copyright">© {new Date().getFullYear()} تطبيق وثيق. جميع الحقوق محفوظة.</p>
        </section>
      </main>
    </div>
  );
};

export default HowItWorks;
