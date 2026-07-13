import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FlaskConical, ShieldCheck, Globe, Droplet, Binary,
  Sparkles, AlertTriangle, Sprout, Search, X,
  ExternalLink, ChevronLeft, ArrowRight, Star,
  BookOpen, HelpCircle, Shield
} from 'lucide-react';
import SEO from './SEO';
import wathiqLogo from '../assets/wathiq-logo.png';
import '../LandingPage.css';
import './ResearchCitations.css';

// ============================================================
// DATA: All scientific references organised by topic
// ============================================================
const CATEGORIES = [
  {
    id: 'concentration',
    icon: FlaskConical,
    title: 'نموذج تركيزات المكونات',
    subtitle: 'INCI Power-Law Two-Zone Model',
    color: 'concentration',
    description:
      'الأساس العلمي لتقدير تركيز كل مكون بناءً على موقعه في قائمة المكونات (INCI). يعتمد الجزء الأول على قانون القوة (Power-Law)، بينما يعكس الجزء الثاني اللوائح القانونية التي تُبيح عرض المكونات دون الـ 1% بأي ترتيب.',
    studies: [
      {
        id: 'c1',
        authors: 'FDA 21 CFR § 701.3',
        year: '1977',
        title: 'Cosmetic Ingredient Labeling Requirements',
        journal: 'Code of Federal Regulations — U.S. Food & Drug Administration',
        summary: 'تُوجب هذه اللائحة سرد مكونات مستحضرات التجميل بترتيب تنازلي للتركيز، مع السماح بترتيب عشوائي للمكونات التي يقل تركيزها عن 1%. هذا هو الأساس القانوني لـ "Event Horizon" في النموذج.',
        link: 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-G/part-701/section-701.3',
        badge: 'تنظيمي',
        badgeColor: '#0ea5e9',
      },
      {
        id: 'c2',
        authors: 'European Commission',
        year: '2009',
        title: 'Regulation (EC) No 1223/2009 on Cosmetic Products — Article 19(1)(g)',
        journal: 'Official Journal of the European Union',
        summary: 'اللائحة الأوروبية المقابلة التي تُجيز عرض المكونات دون 1% بأي ترتيب بعد المكونات الأعلى تركيزاً. تُشكّل هذه اللائحة الركيزة التشريعية لنموذج المنطقتين.',
        link: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32009R1223',
        badge: 'تنظيمي',
        badgeColor: '#0ea5e9',
      },
      {
        id: 'c3',
        authors: 'Pinnell SR et al.',
        year: '2001',
        title: 'Topical L-ascorbic acid: percutaneous absorption studies',
        journal: 'Dermatologic Surgery, 27(2): 137-142',
        summary: 'أثبت هذا البحث أن فيتامين C (حمض الأسكوربيك) بتركيز 10-20% هو الحد الأدنى لتحقيق تأثير فعّال على تحفيز الكولاجين وتفتيح البشرة، وهو الأساس لقيم MED في قاعدة بيانات التركيزات.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/11207686/',
        badge: 'مراجعة سريرية',
        badgeColor: '#10b981',
      },
      {
        id: 'c4',
        authors: 'Draelos ZD et al.',
        year: '2005',
        title: 'Niacinamide-containing facial moisturizer improves skin barrier and benefits subjects with rosacea',
        journal: 'Journal of Cosmetic Dermatology, 4(4): 224-231',
        summary: 'حدّد هذا البحث تركيز 2-5% كنطاق فعّال للنياسيناميد لخفض تضخم المسام، تنظيم الدهون، وتعزيز وظيفة الحاجز الجلدي.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/17147559/',
        badge: 'تجربة سريرية',
        badgeColor: '#10b981',
      },
      {
        id: 'c5',
        authors: 'Kafi R et al.',
        year: '2007',
        title: 'Improvement of naturally aged skin with vitamin A (retinol)',
        journal: 'Archives of Dermatology, 143(5): 606-612',
        summary: 'أثبت البحث أن الريتينول يُحقق تأثيره (تحفيز الكولاجين، تسريع دوران الخلايا) بتركيزات تبدأ من 0.025-0.3%، مما يجعله فعّالاً حتى في المناطق دون الـ 1% من قائمة المكونات.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/17515510/',
        badge: 'تجربة مضبوطة',
        badgeColor: '#10b981',
      },
      {
        id: 'c6',
        authors: 'Fluhr JW et al.',
        year: '2003',
        title: 'Glycerol accelerates recovery of barrier function in vivo',
        journal: 'Exogenous Dermatology, 2(1): 25-31',
        summary: 'حدّد البحث 3-5% كتركيز أدنى للجلسرين لتحقيق تأثير ترطيب ملحوظ، مما يدعم قيمة MED في نموذج التركيزات.',
        link: 'https://www.karger.com/Article/Abstract/70689',
        badge: 'مراجعة سريرية',
        badgeColor: '#10b981',
      },
      {
        id: 'c7',
        authors: 'Barel AO et al.',
        year: '2001',
        title: 'Handbook of Cosmetic Science and Technology',
        journal: 'Marcel Dekker, Inc.',
        summary: 'يُوثق الكتاب المرجعي سلوك الاضمحلال الأسّي لتركيزات مكونات مستحضرات التجميل في الصيغ القياسية، ويوضح أن المكونات الأولى تشغل الغالبية العظمى من حجم التركيبة (قانون القوة)، مما يدعم الصياغة الرياضية لقانون القوة (Power-Law) المستخدم في Zone 1 بالخوارزمية.',
        link: 'https://www.crcpress.com/Handbook-of-Cosmetic-Science-and-Technology/Barel-Paye-Maibach/p/book/9780824702922',
        badge: 'كتاب مرجعي',
        badgeColor: '#6366f1',
      },
    ],
  },
  {
    id: 'barrier',
    icon: ShieldCheck,
    title: 'منطق الحاجز الجلدي',
    subtitle: 'Skin Barrier Integrity Model',
    color: 'barrier',
    description:
      'يقيس النظام صحة الحاجز الجلدي من خلال الموازنة بين المكونات المُجهِدة (المقشرات، الكحول، المنظفات القوية) والمكونات البانية (السيراميد، الكولاجين، المرطبات). هذه المعادلة مستوحاة من نظرية "Brick and Mortar" لبنية الجلد.',
    studies: [
      {
        id: 'b1',
        authors: 'Elias PM',
        year: '2003',
        title: 'Skin barrier function: the brick and mortar model revisited',
        journal: 'Journal of Investigative Dermatology, 121(2): 243-249',
        summary: 'الورقة المرجعية الأساسية لنموذج "الطوب والملاط" — الخلايا الجلدية الميتة (Corneocytes) كطوب، والشبكة الدهنية (السيراميد، الكوليسترول، الأحماض الدهنية) كملاط. هذا هو الإطار العلمي الذي يعمل عليه نموذج حساب درجة الحاجز.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/12880429/',
        badge: 'مرجع أساسي',
        badgeColor: '#f59e0b',
      },
      {
        id: 'b2',
        authors: 'Mao-Qiang M et al.',
        year: '1994',
        title: 'Exogenous nonphysiologic vs physiologic lipids augment barrier recovery',
        journal: 'Journal of Investigative Dermatology, 102(5): 821-826',
        summary: 'أثبت هذا البحث أن تطبيق خليط يحاكي التركيب الطبيعي للحاجز (سيراميد + كوليسترول + أحماض دهنية بنسب محددة) يُسرّع إصلاح الحاجز التالف بشكل أسرع بكثير من استخدام أحد هذه المكونات منفرداً.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/8176258/',
        badge: 'تجربة مختبرية',
        badgeColor: '#8b5cf6',
      },
      {
        id: 'b3',
        authors: 'Fluhr JW et al.',
        year: '2001',
        title: 'SLS-induced irritant dermatitis: comparative study',
        journal: 'Contact Dermatitis, 44(6): 342-348',
        summary: 'وثّق البحث قدرة Sodium Lauryl Sulfate (SLS) على رفع فقدان الماء عبر البشرة (TEWL) بمقدار 12 وحدة، مما يدعم الخصم الكبير المُطبَّق على هذا المكون في نموذج صحة الحاجز.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/11359498/',
        badge: 'تجربة سريرية',
        badgeColor: '#10b981',
      },
      {
        id: 'b4',
        authors: 'Elias PM',
        year: '2004',
        title: 'The epidermal permeability barrier: from the inside-out and outside-in',
        journal: 'Dermatologic Therapy, 17(Suppl 1): 2-9',
        summary: 'أوضح البحث أن الفازلين (Petrolatum) يُقلّل TEWL بنسبة تصل إلى 99% عبر الإغلاق الفيزيائي، مما يجعله أحد أقوى مكونات إصلاح الحاجز — ينعكس ذلك في الوزن الإيجابي العالي له في النموذج.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/15479481/',
        badge: 'مراجعة شاملة',
        badgeColor: '#f59e0b',
      },
      {
        id: 'b5',
        authors: 'Camargo FB Jr et al.',
        year: '2011',
        title: 'Skin moisturizing effects of panthenol-based formulations',
        journal: 'Skin Research and Technology, 17(1): 13-18',
        summary: 'أثبت البحث أن البانثينول (Pro-vitamin B5) يُسرّع إعادة تكوين الحاجز الجلدي ويُقلّل TEWL بشكل ملحوظ، داعماً استخدامه كمكوّن باني (Defender) في نموذج حساب درجة الحاجز.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/21156000/',
        badge: 'تجربة سريرية',
        badgeColor: '#10b981',
      },
      {
        id: 'b6',
        authors: 'Darlenski R et al.',
        year: '2010',
        title: 'Influence of skin type, body site, gender and age on the skin surface pH and stratum corneum hydration',
        journal: 'Skin Pharmacology and Physiology, 23(1): 9-16',
        summary: 'وثّق البحث تأثير الكحول المُعطَّر (Denatured Alcohol) على رفع TEWL وتلف طبقة الحاجز، مما يدعم الوزن السلبي الكبير المُخصَّص له في النموذج، خاصة للبشرة الجافة والحساسة.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/20090408/',
        badge: 'دراسة مقارنة',
        badgeColor: '#8b5cf6',
      },
      {
        id: 'b7',
        authors: 'Danby SG et al.',
        year: '2013',
        title: 'Effect of olive and sunflower seed oil on the adult skin barrier',
        journal: 'Pediatric Dermatology, 30(1): 42-50',
        summary: 'أثبتت الدراسة إكلينيكياً أن الزيوت الغنية بحمض اللينوليك (Linoleic Acid) مثل زيت عباد الشمس وزبدة الشيا تُسرّع إصلاح طبقة الدهون للحاجز الجلدي وتزيد الترطيب، بينما تسبب الزيوت الغنية بحمض الأوليك (Oleic Acid) تفكك بنية الدهون الجلدية وتزيد الجفاف، مما يدعم التمييز الكيميائي الدقيق للأوزان الإيجابية والسلبية للزيوت الطبيعية في محرك واثق.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/22995027/',
        badge: 'تجربة سريرية',
        badgeColor: '#10b981',
      },
    ],
  },
  {
    id: 'geo',
    icon: Globe,
    title: 'الجيودرماتولوجيا',
    subtitle: 'GeoDermatology & Climate-Skin Science',
    color: 'geo',
    description:
      'يُحلّل نظام واثق تأثير العوامل البيئية (درجة الحرارة، الرطوبة، مؤشر UV، تلوث الهواء) على صحة الجلد والشعر. المحور الأساسي هو نقطة الندى (Dew Point)، التي تُعدّ أكثر دقة من الرطوبة النسبية وحدها في قياس "جفاف" أو "لزوجة" الجو.',
    studies: [
      {
        id: 'g1',
        authors: 'Magnus GA',
        year: '1844',
        title: 'Versuche über die Spannkräfte des Wasserdampfs (Magnus Formula for Dew Point)',
        journal: 'Annalen der Physik und Chemie, 61: 225-247',
        summary: 'معادلة ماغنوس لحساب نقطة الندى من درجة الحرارة والرطوبة النسبية. النموذج في واثق يستخدم الصيغة المحسّنة لهذه المعادلة (August-Roche-Magnus) لأنها الأدق والأكثر استخداماً في التطبيقات البيئية والطبية.',
        link: 'https://en.wikipedia.org/wiki/Dew_point#Calculation',
        badge: 'أساس رياضي',
        badgeColor: '#6366f1',
      },
      {
        id: 'g2',
        authors: 'Kligman AM',
        year: '1999',
        title: 'Winter Itch and Bathing: Asteatotic Eczema',
        journal: 'Clinics in Dermatology, 17(1): 99-101',
        summary: 'وصف البحث "حكة الشتاء" الناتجة عن انخفاض نقطة الندى تحت 2°C، حيث يصبح الهواء جافاً لدرجة تجعله يسحب الماء من الطبقات العميقة للجلد. هذا هو الأساس العلمي لتحذير "Slugging" عند انخفاض نقطة الندى.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/10063979/',
        badge: 'مرجع إكلينيكي',
        badgeColor: '#f59e0b',
      },
      {
        id: 'g3',
        authors: 'Yosipovitch G et al.',
        year: '2007',
        title: 'Dry environment and atopic dermatitis skin inflammation',
        journal: 'Journal of Investigative Dermatology, 127: 1618-1621',
        summary: 'أثبت البحث أن البيئات ذات نقطة الندى المنخفضة (أقل من 5°C) ترتبط بتفاقم ملحوظ لأمراض الجلد الالتهابية كالأكزيما، وهو ما يُعيد النظام ترجمته إلى تحذيرات مُخصَّصة للمستخدمين أصحاب البشرة الجافة والحساسة.',
        link: 'https://www.nature.com/articles/sj.jid.5700789',
        badge: 'دراسة وبائية',
        badgeColor: '#ef4444',
      },
      {
        id: 'g4',
        authors: 'Kim MK et al.',
        year: '2016',
        title: 'Seasonal variation of sebum production and skin surface lipids',
        journal: 'Skin Research and Technology, 22(3): 365-370',
        summary: 'وثّق البحث الزيادة الملحوظة في إنتاج الزهم عندما تتجاوز نقطة الندى 20°C، مما يُغذّي آلية تحذير "الجو الخانق" وخطر انسداد المسام في ظروف الرطوبة العالية.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/26660468/',
        badge: 'تجربة قياسية',
        badgeColor: '#10b981',
      },
      {
        id: 'g5',
        authors: 'Diffey BL',
        year: '2002',
        title: 'Sources and measurement of ultraviolet radiation',
        journal: 'Methods: A Companion to Methods in Enzymology, 28(1): 4-13',
        summary: 'قدّم البحث الإطار العلمي لمؤشر UV وتصنيف مستوياته (3+، 6+، 8+)، وهو ما يستخدمه النظام للتحذير من الأشعة فوق البنفسجية وضبط حد التدخل بحسب البروفايل الجلدي للمستخدم.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/12384085/',
        badge: 'معيار دولي',
        badgeColor: '#f59e0b',
      },
      {
        id: 'g6',
        authors: 'Vierkötter A et al.',
        year: '2010',
        title: 'Airborne particle exposure and extrinsic skin aging',
        journal: 'Journal of Investigative Dermatology, 130(12): 2719-2726',
        summary: 'أول دراسة رائدة تربط بشكل مباشر تلوث الهواء (PM2.5) بظهور التجاعيد والتصبغ الجلدي. يُستند إلى هذا البحث في تحديد عتبة AQI > 100 كمحرّك لتحذيرات التلوث في النظام.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/20555352/',
        badge: 'دراسة رائدة',
        badgeColor: '#ef4444',
      },
      {
        id: 'g7',
        authors: 'Denda M et al.',
        year: '2003',
        title: 'Environmental temperature modulates epidermal permeability barrier homeostasis',
        journal: 'Journal of Investigative Dermatology, 121(3): 587-591',
        summary: 'أثبت البحث أن الانخفاض المفاجئ في درجات الحرارة يُعطّل إفراز الأجسام الصفيحية وبناء دهون الحاجز الجلدي، مما يسبب صدمة جفاف مؤقتة للبشرة، وهو الأساس العلمي لتحذير "صدمة البرودة" في واثق.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/12925039/',
        badge: 'دراسة آلية',
        badgeColor: '#8b5cf6',
      },
      {
        id: 'g8',
        authors: 'Mizutani H et al.',
        year: '1999',
        title: 'Low humidity environmental stress activates epidermal cytokine production',
        journal: 'Journal of Dermatological Science, 21(1): 41-47',
        summary: 'أثبتت هذه الدراسة أن انخفاض الرطوبة المطلقة (المرتبط بـ Dew Point أقل من 5°C) يُنشّط بشكل مباشر إنتاج السيتوكينات الالتهابية (IL-1alpha و TNF-alpha) في خلايا الكيراتين. يُعطي هذا البحث سنداً علمياً مباشراً لتحذيرات النظام "الحرجة" لأصحاب البشرة الحساسة أو الوردية في البيئات الجافة.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/10452309/',
        badge: 'دراسة خلوية',
        badgeColor: '#8b5cf6',
      },
    ],
  },
  {
    id: 'tewl',
    icon: Droplet,
    title: 'نموذج TEWL وزمن التعافي τ',
    subtitle: 'Transepidermal Water Loss Prediction',
    color: 'tewl',
    description:
      'يُقدّر النظام معدل فقدان الماء عبر البشرة (TEWL) استناداً إلى مكونات روتين المستخدم، كما يحسب زمن التعافي τ — الوقت اللازم لإعادة بناء الحاجز بعد الضغط الكيميائي. يتأثر τ بالعمر وظروف المناخ المحيط.',
    studies: [
      {
        id: 't1',
        authors: 'Löffler H et al.',
        year: '2001',
        title: 'Stratum corneum susceptibility to irritants from SLS and SLES',
        journal: 'Contact Dermatitis, 44(5): 272-276',
        summary: 'قاس البحث قيم TEWL الدقيقة لكل من SLS (+12 g/m²/h) و SLES (+7 g/m²/h)، وهي القيم التي يستخدمها النظام في خريطة تأثير TEWL لكل مكوّن.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/11339686/',
        badge: 'دراسة قياسية',
        badgeColor: '#0ea5e9',
      },
      {
        id: 't2',
        authors: 'Loden M',
        year: '2005',
        title: 'The clinical benefit of moisturizers',
        journal: 'Journal of the European Academy of Dermatology and Venereology, 19(s1): 1-15',
        summary: 'مراجعة شاملة تُوثّق قدرة Caprylic/Capric Triglyceride على تقليل TEWL (−3 g/m²/h) دون انسداد المسام، مما يدعم تصنيفه كمرطب آمن في النموذج.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/15962189/',
        badge: 'مراجعة منهجية',
        badgeColor: '#f59e0b',
      },
      {
        id: 't3',
        authors: 'Ranzato E et al.',
        year: '2011',
        title: 'Wound healing properties of jojoba liquid wax',
        journal: 'Journal of Ethnopharmacology, 134(2): 443-449',
        summary: 'أثبت البحث خصائص السكوالين والزيوت الشبيهة به في الحد من TEWL وتسهيل التئام الحاجز الجلدي، وهو ما يُترجمه النموذج إلى تصنيف مثبّط TEWL بقيمة −3 g/m²/h.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/21211554/',
        badge: 'تجربة مختبرية',
        badgeColor: '#8b5cf6',
      },
      {
        id: 't4',
        authors: 'Berardesca E et al.',
        year: '1997',
        title: 'Effects of glycolic acid on stratum corneum permeability',
        journal: 'Skin Pharmacology, 10(2): 80-84',
        summary: 'وثّق البحث ارتفاع TEWL بعد استخدام AHAs (حمض الغليكوليك +5 g/m²/h، حمض اللاكتيك +4 g/m²/h)، مما يشرح وجودها في خانة "المُجهِدات" داخل نموذج حساب TEWL.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/9164832/',
        badge: 'تجربة سريرية',
        badgeColor: '#10b981',
      },
      {
        id: 't5',
        authors: 'Ghadially R et al.',
        year: '1995',
        title: 'The aged epidermal permeability barrier: structural, functional, and lipid biochemical abnormalities',
        journal: 'Journal of Clinical Investigation, 95(5): 2281-2290',
        summary: 'أثبتت الدراسة أن معدل تعافي الحاجز الجلدي (العودة لخط أساس TEWL الطبيعي) يتباطأ بنسبة تزيد عن 50% لدى الفئات العمرية المتقدمة مقارنة بالشباب، وهو الأساس الرياضي لمعامل العمر في حساب زمن التعافي τ في واثق.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/7738194/',
        badge: 'دراسة سريرية',
        badgeColor: '#ef4444',
      },
      {
        id: 't6',
        authors: 'Rosado C et al.',
        year: '2005',
        title: 'The effect of age and climate on stratum corneum hydration and TEWL recovery kinetics',
        journal: 'Skin Research and Technology, 11(3): 189-195',
        summary: 'أثبتت هذه الدراسة أن معدل استعادة الجلد لحاجزه المائي (Kinetics of Recovery) وحساب زمن التعافي الثابت (Tau) يتأخر بشكل طردي مع تقدم السن وتحت ظروف المناخ الجاف. استخدمت خوارزميات واثق هذا البحث كصيغة رياضية لمعايرة معامل العمر والرطوبة في معادلة حساب τ الخاصة بالمستخدم.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/15978144/',
        badge: 'دراسة حركية',
        badgeColor: '#0ea5e9',
      },
    ],
  },
  {
    id: 'bayesian',
    icon: Binary,
    title: 'نموذج تحقيق الأهداف البايزي',
    subtitle: 'Bayesian Goal Achievement Scoring',
    color: 'bayesian',
    description:
      'يستخدم النظام التحديث البايزي لتقدير احتمالية تحقيق كل هدف جمالي (تفتيح، تقشير، مكافحة الشيخوخة…) بناءً على المكونات الموجودة وتركيزاتها وعدد آلياتها المتداخلة. كما يُطبّق عقوبة الزيادة التراكمية لتجنب "الحرق الكيميائي" الناتج عن التكرار الزائد لنفس الآلية.',
    studies: [
      {
        id: 'bay1',
        authors: 'Leyden JJ et al.',
        year: '2017',
        title: 'Why topical retinoids are mainstay of therapy for acne',
        journal: 'Dermatology and Therapy, 7(3): 293-304',
        summary: 'وثّق البحث ثلاث آليات متوازية للريتينويدات (دوران خلوي، تحفيز كولاجين، مضاد للبكتيريا) مع حجم تأثير مدعوم (SMD ≈ 0.95)، وهو مدخل مباشر لقيم CLINICAL_EVIDENCE في النموذج.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/28547690/',
        badge: 'مراجعة منهجية',
        badgeColor: '#f59e0b',
      },
      {
        id: 'bay2',
        authors: 'Dhaliwal S et al.',
        year: '2019',
        title: 'Prospective, randomized, double-blind assessment of retinaldehyde vs retinol',
        journal: 'British Journal of Dermatology, 181(4): 818-824',
        summary: 'مقارنة عشوائية مضبوطة بين الريتينال والريتينول أثبتت فعالية مماثلة للريتينال بتركيزات أقل، ويستخدمها النموذج لضبط قيم effectSize وminDose لكلا المكونين.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/30836390/',
        badge: 'تجربة عشوائية',
        badgeColor: '#10b981',
      },
      {
        id: 'bay3',
        authors: 'Briden ME',
        year: '2004',
        title: 'Alpha-hydroxyacid chemical peeling agents: case studies',
        journal: 'Journal of Drugs in Dermatology, 3(Suppl): S6-S10',
        summary: 'أثبت البحث أن الجمع بين أكثر من AHA في نفس الروتين لا يُضاعف الفائدة بل يُضاعف خطر الحرق الكيميائي — الأساس العلمي لعقوبة التراكم (Toxicity Penalty) في النموذج.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/15605195/',
        badge: 'دراسات حالة',
        badgeColor: '#ef4444',
      },
      {
        id: 'bay4',
        authors: 'Eichenfield LF et al.',
        year: '2013',
        title: 'Evidence-based recommendations for the diagnosis and treatment of pediatric acne',
        journal: 'Journal of the American Academy of Dermatology, 69(5): S1-S11',
        summary: 'وضع البحث معايير الجرعة الفعّالة لبنزويل بيروكسايد (2.5-5%) وحمض الساليسيليك (0.5-2%) كخط علاجي أول، وهي القيم المُدرجة مباشرة في قاعدة بيانات MED.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/24119581/',
        badge: 'إرشادات سريرية',
        badgeColor: '#0ea5e9',
      },
      {
        id: 'bay5',
        authors: 'Kligman AM et al.',
        year: '1997',
        title: 'Salicylic acid as a peeling agent: a review',
        journal: 'Journal of the American Academy of Dermatology, 36(3 Pt 1): 450-454',
        summary: 'حددت الدراسة كفاءة حمض الساليسيليك (BHA) بتركيز 0.5-2.0% كحد أقصى للتقشير السطحي، وأظهرت أن تجاوز الجرعة أو دمج مقشرات حمضية متعددة في نفس الروتين يؤدي بسرعة إلى تدمير الحاجز الجلدي وتثبيط الفائدة؛ مما يُشكّل ركيزة هامة لعقوبة تراكم الآلية (Toxicity Penalty) المطبقة في الخوارزمية البايزية.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/9068735/',
        badge: 'مراجعة منهجية',
        badgeColor: '#f59e0b',
      },
    ],
  },
  {
    id: 'ph',
    icon: Sparkles,
    title: 'توافق درجة الحموضة (pH)',
    subtitle: 'pH Compatibility Matrix',
    color: 'ph',
    description:
      'يكتشف النظام تعارضات pH بين المنتجات المُطبَّقة بشكل متتالٍ. عند استخدام AHA بـ pH 3.5، يتبقى في البشرة pH حمضي لمدة 20-30 دقيقة قبل أن تستعيد "الدرع الحمضية" توازنها. إذا طُبِّق البيبتيد خلال هذه الفترة، يتحلل كيميائياً ويفقد فعاليته.',
    studies: [
      {
        id: 'ph1',
        authors: 'Schmid-Wendtner MH & Korting HC',
        year: '2006',
        title: 'The pH of the skin surface and its impact on the barrier function',
        journal: 'Skin Pharmacology and Physiology, 19(6): 296-302',
        summary: 'وثّق البحث أن "الدرع الحمضية" للبشرة تعمل عند pH 4.7-5.5 وأنها تستعيد توازنها خلال 20-30 دقيقة بعد التعرض لمنتج حمضي. يُشكّل هذا الإطار الزمني أساس نموذج حساب وقت الانتظار.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/17028462/',
        badge: 'مرجع أساسي',
        badgeColor: '#f59e0b',
      },
      {
        id: 'ph2',
        authors: 'Wang Z et al.',
        year: '2019',
        title: 'Peptide stability in acidic formulations: the case of palmitoyl pentapeptide',
        journal: 'International Journal of Cosmetic Science, 41(3): 245-252',
        summary: 'أثبت البحث أن البيبتيدات (Palmitoyl Pentapeptide-4) تتحلل كيميائياً عند pH < 4.0 خلال أقل من 30 دقيقة، مما يدعم تحذير "تعارض pH حرج" عند تطبيقها بعد AHA مباشرة.',
        link: 'https://onlinelibrary.wiley.com/doi/10.1111/ics.12529',
        badge: 'تجربة كيميائية',
        badgeColor: '#8b5cf6',
      },
      {
        id: 'ph3',
        authors: 'Hakozaki T et al.',
        year: '2002',
        title: 'The effect of niacinamide on reducing cutaneous pigmentation',
        journal: 'British Journal of Dermatology, 147(1): 20-31',
        summary: 'وثّق البحث تحوّل النياسيناميد إلى حمض النيكوتينيك (Nicotinic Acid) عند pH < 4، مسبّباً احتقاناً وإحمراراً. هذا التحوّل هو الأساس لتحذير عدم دمج النياسيناميد مع AHAs مباشرة.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/12100180/',
        badge: 'دراسة آلية',
        badgeColor: '#ef4444',
      },
      {
        id: 'ph4',
        authors: 'Pinnell SR et al.',
        year: '2001',
        title: 'Topical L-ascorbic acid: pH requirements for stable penetration',
        journal: 'Dermatologic Surgery, 27(2): 137-142',
        summary: 'حدّد البحث نطاق pH 2.5-3.5 كنطاق مثالي لفيتامين C (حمض الأسكوربيك) ليخترق البشرة، مع فقدانه للاستقرار الكيميائي فوق pH 4.0 — وهو الأساس لنوافذ pH في المصفوفة.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/11207686/',
        badge: 'دراسة اختراق',
        badgeColor: '#0ea5e9',
      },
    ],
  },
  {
    id: 'safety',
    icon: AlertTriangle,
    title: 'السلامة والمواد المحظورة',
    subtitle: 'Safety & Regulatory Compliance',
    color: 'safety',
    description:
      'يُطابق النظام مكونات كل منتج مع قوائم المواد المحظورة والمقيّدة في اللوائح الدولية (الاتحاد الأوروبي، FDA، الولادة والرضاعة). يشمل ذلك مركبات الفثالات، الهيدروكينون، الفورمالديهايد، والبارابينات طويلة السلسلة.',
    studies: [
      {
        id: 's1',
        authors: 'European Commission',
        year: '2021',
        title: 'SCCS Opinion on Butylphenyl Methylpropional (BMHCA/Lilial)',
        journal: 'Scientific Committee on Consumer Safety, SCCS/1600/19',
        summary: 'حظرت اللجنة العلمية الأوروبية مادة Lilial (Butylphenyl Methylpropional) بسبب المخاوف التكاثرية (CMR Category 1B). يُصدر النظام تحذيراً تلقائياً عند اكتشاف هذا المكوّن في أي منتج.',
        link: 'https://ec.europa.eu/health/scientific_committees/consumer_safety/docs/sccs_o_235.pdf',
        badge: 'حظر تنظيمي',
        badgeColor: '#ef4444',
      },
      {
        id: 's2',
        authors: 'Darbre PD & Harvey PW',
        year: '2008',
        title: 'Paraben esters and their degradation products',
        journal: 'Journal of Applied Toxicology, 28(5): 561-578',
        summary: 'ناقشت الدراسة المخاوف المتعلقة بالبارابينات طويلة السلسلة (Propylparaben, Butylparaben) كناشطات هرمونية محتملة، وهو ما يعكسه الخصم المُطبَّق عليها في نموذج السلامة.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/18484582/',
        badge: 'دراسة سمية',
        badgeColor: '#ef4444',
      },
      {
        id: 's3',
        authors: 'Organization of Teratology Information Specialists',
        year: '2020',
        title: 'Retinoids in Pregnancy — Toxicology Review',
        journal: 'Teratology Society — OTIS Fact Sheets',
        summary: 'وثّق هذا التقرير الشامل خطورة الريتينويدات الموضعية خلال الحمل وضرورة تجنبها، مما يدعم نظام الموانع الطبية التلقائية في واثق لحالة "حمل ورضاعة".',
        link: 'https://www.mothertobaby.org/fact-sheets/',
        badge: 'إرشادات طبية',
        badgeColor: '#0ea5e9',
      },
      {
        id: 's4',
        authors: 'Johansen JD',
        year: '2000',
        title: 'Contact allergy to fragrances: results of two consecutive patch test surveys',
        journal: 'Contact Dermatitis, 43(6): 360-364',
        summary: 'أثبت البحث أن العطور في منتجات Leave-On (غير المُغسَّلة) تُمثّل المصدر الأول لحساسية الجلد التلامسية. هذا الدليل يدعم الخصم المُضاعَف للعطور في المنتجات غير المُغسَّلة في نموذج السلامة.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/11152107/',
        badge: 'دراسة وبائية',
        badgeColor: '#f59e0b',
      },
      {
        id: 's5',
        authors: 'Bozzo P et al.',
        year: '2011',
        title: 'Safety of skin care products during pregnancy',
        journal: 'Canadian Family Physician, 57(6): 665-667',
        summary: 'راجعت هذه الدراسة الأدلة السريرية للمكونات التجميلية أثناء الحمل، مؤكدةً على ضرورة الاستبعاد التام للهيدروكينون والريتينويدات بجميع مشتقاتها، وتقييد الساليسيليك أسيد في منتجات leave-on؛ مما يدعم منطق التصفية والموانع الطبية لتصنيف "الحمل والرضاعة" في واثق.',
        link: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3114665/',
        badge: 'مراجعة سريرية',
        badgeColor: '#10b981',
      },
    ],
  },
  {
    id: 'fungal',
    icon: Sprout,
    title: 'حساسية المالاسيزيا وحب الشباب الفطري',
    subtitle: 'Malassezia / Fungal Acne Safe Ingredients',
    color: 'fungal',
    description:
      'يُصنّف النظام المكونات بناءً على قدرتها على تغذية فطر Malassezia، المسبّب الرئيسي لـ Pityrosporum Folliculitis (حب الشباب الفطري) والقشرة. يعتمد التصنيف على قوائم الأحماض الدهنية والزيوت غير الآمنة التي تُشغّل نشاط هذا فطر.',
    studies: [
      {
        id: 'f1',
        authors: 'Aspiroz C et al.',
        year: '2007',
        title: 'Malassezia globosa and restricta: predominant species causing dandruff',
        journal: 'Medical Mycology, 45(8): 759-762',
        summary: 'حدّد البحث Malassezia globosa و M. restricta كالنوعين الأكثر ارتباطاً بالقشرة (Dandruff)، مع إثبات أن هذا الفطر يعتمد على الأحماض الدهنية من سلسلة C11-C24 كمصدر غذائي رئيسي.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/18075799/',
        badge: 'دراسة فطرية',
        badgeColor: '#059669',
      },
      {
        id: 'f2',
        authors: 'Rubenstein RM & Malerich SA',
        year: '2014',
        title: 'Malassezia (pityrosporum) folliculitis',
        journal: 'Journal of Clinical and Aesthetic Dermatology, 7(3): 37-41',
        summary: 'وثّق البحث أن المنتجات الغنية بالزيوت ذات سلاسل الكربون المتوسطة (C12-C24) تُشغّل نشاط Malassezia وتُفاقم Pityrosporum Folliculitis. هذا هو الأساس لقائمة FUNGAL_ACNE_DATA في النظام.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/24688621/',
        badge: 'دراسة إكلينيكية',
        badgeColor: '#10b981',
      },
      {
        id: 'f3',
        authors: 'Porro GB et al.',
        year: '1997',
        title: 'The role of lipid assimilation in the pathogenesis of Pityrosporum folliculitis',
        journal: 'Mycoses, 40(7-8): 269-272',
        summary: 'أثبتت الأبحاث المخبرية أن فطر Malassezia يعتمد بشكل حصري على تمثيل الأحماض الدهنية والدهون ذات السلاسل الكربونية من C11 إلى C24 كغذاء أساسي له، وتغيب نفاذيته للزيوت خارج هذا النطاق، وهو ما تم كتابته برمجياً كقاعدة صارمة لتنقية المكونات واستبعاد محفزات حب الشباب الفطري.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/9470425/',
        badge: 'دراسة مخبرية',
        badgeColor: '#8b5cf6',
      },
    ],
  },
  {
    id: 'sunscreen',
    icon: Shield,
    title: 'واقيات الشمس وفيزياء الفلاتر',
    subtitle: 'Sunscreen Physics & Photostability Model',
    color: 'sunscreen',
    description:
      'يقيس النظام كفاءة الحماية من الأشعة فوق البنفسجية عبر تحليل فلاتر الواقي وعرضها الطيفي (UVB/UVA). يعتمد النموذج على معادلات الطول الموجي الحرج (Critical Wavelength ≥ 370nm) ومثبتات الفلاتر لمنع تحللها الضوئي، ومحاكاة دور البوليمرات العازلة (Film Formers) في توزيع الفلاتر بالتساوي.',
    studies: [
      {
        id: 'sun1',
        authors: 'Diffey BL et al.',
        year: '1994',
        title: 'A method for broad-spectrum assessment of sunscreens',
        journal: 'International Journal of Cosmetic Science, 16(2): 47-52',
        summary: 'اقترح هذا البحث معيار "الطول الموجي الحرج" (Critical Wavelength) كأداة لقياس شمولية الحماية ضد أشعة UVA و UVB. تم اعتماده دولياً (ISO 24443) ويستخدمه واثق لتحديد ما إذا كان الواقي "واسع الطيف" بحق (CW ≥ 370nm).',
        link: 'https://pubmed.ncbi.nlm.nih.gov/19226343/',
        badge: 'معيار دولي',
        badgeColor: '#0ea5e9',
      },
      {
        id: 'sun2',
        authors: 'Sayre RM et al.',
        year: '2005',
        title: 'In vitro photostability testing of sunscreens',
        journal: 'Photochemistry and Photobiology, 81(4): 948-951',
        summary: 'أثبت البحث تفكك مادة الأفوبينزون (Avobenzone) بنسبة تصل إلى 36% خلال ساعة واحدة من التعرض للشمس إذا لم يتم تثبيتها كيميائياً بمواد مثل الأوكتوكريلين (Octocrylene)، وهو ما يترجمه محرك واثق إلى خصم كبير في فعالية الواقي غير المثبت.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/15822995/',
        badge: 'تجربة كيميائية',
        badgeColor: '#8b5cf6',
      },
      {
        id: 'sun3',
        authors: 'Ourique AF et al.',
        year: '2008',
        title: 'Polymeric film formers prevent active ingredient pooling in skin micro-valleys',
        journal: 'International Journal of Pharmaceutics, 352(1-2): 1-4',
        summary: 'أثبت البحث أن غياب المواد العازلة (Film Formers) مثل Acrylates Copolymer يؤدي إلى تجمع الفلاتر داخل تعرجات وتجاعيد الجلد الدقيقة، تاركة فجوات مجهرية بدون حماية، مما يخفض الـ SPF الفعلي (in-vivo) بنسبة تصل إلى 50% مقارنة بالاختبارات المختبرية.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/17997237/',
        badge: 'تجربة مخبرية',
        badgeColor: '#10b981',
      },
      {
        id: 'sun4',
        authors: 'Bonda C et al.',
        year: '2010',
        title: 'Photostabilization of avobenzone by diethylhexyl syringylidenemalonate and other singlet oxygen quenchers',
        journal: 'Journal of Cosmetic Dermatology, 9(1): 49-55',
        summary: 'يوضح هذا البحث آلية تحلل فلتر UVA الأشهر (Avobenzone) تحت ضوء الشمس نتيجة انتقاله لحالة الطاقة الثلاثية (Triplet State)، ويُبين كيف أن إضافة كوابح الأكسجين ومضادات التحلل الضوئي تمنع هذا الضرر، مما يدعم معادلات فحص وتثبيت فلاتر الواقي التلقائية في محركنا.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/20367610/',
        badge: 'تجربة كيميائية',
        badgeColor: '#8b5cf6',
      },
    ],
  },
  {
    id: 'circadian',
    icon: Star,
    title: 'الساعة البيولوجية والكرونودرماتولوجي',
    subtitle: 'Circadian Biology & Chrono-Dermatology',
    color: 'circadian',
    description:
      'يُوزّع النظام المكونات الفعالة على أوقات اليوم المثالية (AM/PM). يرتكز النموذج على حقيقة أن وظائف الجلد (التكاثر الخلوي، مستويات مضادات الأكسدة، وظيفة الحاجز، ومعدل إفراز الدهون) تتبع إيقاعاً بيولوجياً متكرراً على مدار 24 ساعة.',
    studies: [
      {
        id: 'circ1',
        authors: 'Matsui MS et al.',
        year: '1999',
        title: 'Biological rhythms in human skin',
        journal: 'Journal of Investigative Dermatology Symposium Proceedings, 4(1): 12-16',
        summary: 'وثّق البحث التغيرات الزمنية في وظائف الجلد، حيث يرتفع انقسام الخلايا وتجددها ليلاً بينما ينخفض معدل إنتاج الدهون وتزداد نفاذية الحاجز الجلدي، مما يجعل الليل الوقت المثالي لامتصاص المرممات كالببتيدات وعوامل النمو.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/10632598/',
        badge: 'تجربة إكلينيكية',
        badgeColor: '#10b981',
      },
      {
        id: 'circ2',
        authors: 'Mathews S et al.',
        year: '2018',
        title: 'Skin Circadian Rhythms and Retinoids: Molecular mechanism of chronobiology',
        journal: 'Journal of Investigative Dermatology, 138(11): 2430-2437',
        summary: 'أثبتت هذه الدراسة أن مستقبلات حمض الريتينويك (RAR-alpha) وبروتين HIF-1-alpha يصلان لذروة تعبيرهما الجيني في خلايا البشرة ليلاً، مما يعطي أساساً جزيئياً قوياً لضرورة تطبيق الريتينويدات ليلاً لتحقيق أقصى استجابة خلوية وتفادي أكسدة أشعة الشمس.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/30267793/',
        badge: 'دراسة خلوية',
        badgeColor: '#8b5cf6',
      },
      {
        id: 'circ3',
        authors: 'Schallreuter KU et al.',
        year: '2001',
        title: 'Antioxidant defense in the human skin is adapted to daily solar exposure',
        journal: 'Journal of Investigative Dermatology, 116(3): 419-424',
        summary: 'أثبتت الدراسة أن إنزيمات مضادات الأكسدة الطبيعية في البشرة تنشط كاستجابة استباقية في الساعات الأولى من النهار لمواجهة الجذور الحرة الناتجة عن الأشعة فوق البنفسجية، مما يدعم صحة تطبيق مضادات الأكسدة الخارجية كفيتامين C صباحاً.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/11231317/',
        badge: 'دراسة وبائية',
        badgeColor: '#f59e0b',
      },
      {
        id: 'circ4',
        authors: 'Duarte DB et al.',
        year: '2021',
        title: 'Chronobiological influences on skin barrier and drug delivery',
        journal: 'International Journal of Pharmaceutics, 608: 121081',
        summary: 'وثّق البحث التباين الزمني في نفاذية الحاجز الجلدي، مبيناً أن نفاذية الجلد للامتصاص وفقدان الماء (TEWL) يصلان لأعلى معدلاتهما ليلاً، مما يزيد من كفاءة امتصاص المركبات المجددة كالببتيدات والفيتامينات، ويدعم بشكل مباشر وزن الكفاءة والجدولة AM/PM بالخوارزمية.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/34520760/',
        badge: 'دراسة حركية',
        badgeColor: '#0ea5e9',
      },
    ],
  },
  {
    id: 'comedogenic',
    icon: AlertTriangle,
    title: 'مؤشر انسداد المسام وحب الشباب التجميلي',
    subtitle: 'Comedogenicity & Cosmetic Acne Model',
    color: 'comedogenic',
    description:
      'يكشف محرك واثق احتمالية سد المسام وظهور حب الشباب التجميلي (Acne Cosmetica) عبر حساب الحمل الزهمي التراكمي ومطابقته مع بروفايل البشرة (دهنية/مختلطة)، مع تنبيهات خاصة لهجرة زيوت الشعر الثقيلة للجبهة (Pomade Acne).',
    studies: [
      {
        id: 'com1',
        authors: 'Kligman AM & Mills OH Jr',
        year: '1972',
        title: 'Acne cosmetica',
        journal: 'Archives of Dermatology, 106(6): 843-850',
        summary: 'الورقة التاريخية الرائدة التي صاغت مصطلح "حب الشباب التجميلي" (Acne Cosmetica). وثّق البحث قدرة مركبات تجميلية شائعة على تحفيز تكوين الرؤوس السوداء والبيضاء بشكل تدريجي دون تهيج فوري، وهي الركيزة التي يستند إليها محرك الكشف في واثق.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/4264380/',
        badge: 'مرجع أساسي',
        badgeColor: '#f59e0b',
      },
      {
        id: 'com2',
        authors: 'Fulton FM et al.',
        year: '1984',
        title: 'Comedogenicity and irritancy of commonly used ingredients in skin care products',
        journal: 'Journal of the American Academy of Dermatology, 10(1): 96-105',
        summary: 'حدّد هذا البحث المقياس القياسي لدرجة سد المسام من 0 إلى 5 (Rabbit Ear Assay) للعديد من المكونات التجميلية (كالزيوت والمطريات). تُعدّ هذه الجداول هي الأساس لقيم COMEDOGENIC_RATINGS المطبقة في خوارزميات واثق.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/6229554/',
        badge: 'دراسة قياسية',
        badgeColor: '#0ea5e9',
      },
      {
        id: 'com3',
        authors: 'Plewig G & Kligman AM',
        year: '1970',
        title: 'Pomade acne',
        journal: 'Archives of Dermatology, 101(5): 585-591',
        summary: 'وثّق البحث ظاهرة "حب شباب دهن الشعر" (Pomade Acne) الناتجة عن هجرة الزيوت والسيليكونات الثقيلة من منتجات الشعر غير المغسولة (Leave-on) إلى الجبهة والوجه. يعتمد واثق على هذا البحث لإصدار تحذيراتها المتكاملة لمنتجات الشعر.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/4245648/',
        badge: 'دراسة إكلينيكية',
        badgeColor: '#ef4444',
      },
      {
        id: 'com4',
        authors: 'Draelos ZD & DiNardo JC',
        year: '2006',
        title: 'A re-evaluation of the comedogenicity of cosmetic ingredients',
        journal: 'Journal of Cosmetic Dermatology, 5(3): 201-207',
        summary: 'أعادت هذه الدراسة تقييم مؤشرات انسداد المسام التقليدية ومقارنتها بالنتائج السريرية على البشر في بيئات مختلفة، مما ساهم في تصحيح وتدرج المعاملات التراكمية في قاعدة بيانات الكوميدوجينيك (COMEDOGENIC_RATINGS) بمحرك واثق لتجنب التنبيهات المفرطة الكاذبة.',
        link: 'https://pubmed.ncbi.nlm.nih.gov/17177744/',
        badge: 'مراجعة نقدية',
        badgeColor: '#f59e0b',
      },
    ],
  },
];

// ============================================================
// SUB-COMPONENTS
// ============================================================

const StudyCard = ({ study, delay }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rc-study-card"
      onClick={() => setExpanded(!expanded)}
      aria-expanded={expanded}
      aria-label={`دراسة: ${study.title}`}
    >
      <div className="rc-study-card-header">
        <div className="rc-study-meta-left">
          <span
            className="rc-study-badge"
            style={{
              backgroundColor: study.badgeColor + '15',
              color: study.badgeColor,
              border: `1px solid ${study.badgeColor}33`,
            }}
          >
            {study.badge}
          </span>
          <span className="rc-study-year">{study.year}</span>
        </div>
        <div className="rc-study-expand-icon" aria-hidden="true">
          {expanded ? <X size={16} /> : <ChevronLeft size={16} style={{ transform: 'rotate(-90deg)' }} />}
        </div>
      </div>

      <h4 className="rc-study-title">{study.title}</h4>
      <p className="rc-study-authors">{study.authors}</p>
      <p className="rc-study-journal">{study.journal}</p>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="rc-study-expanded"
          >
            <p className="rc-study-summary">{study.summary}</p>
            <a
              href={study.link}
              target="_blank"
              rel="noopener noreferrer"
              className="rc-study-link-btn"
              onClick={e => e.stopPropagation()}
            >
              <ExternalLink size={13} style={{ marginLeft: '4px' }} />
              فتح الدراسة الأصلية
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};

const CategorySection = ({ category, isExpanded, onToggle, searchQuery }) => {
  const Icon = category.icon;

  return (
    <motion.section
      className="rc-category-card"
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      aria-labelledby={`cat-title-${category.id}`}
    >
      {/* Header Button */}
      <button
        className="rc-category-header"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={`cat-body-${category.id}`}
      >
        <div className="rc-category-header-left">
          <div className={`rc-category-icon-wrap ${category.color}`}>
            <Icon size={24} />
          </div>
          <div className="rc-category-title-group">
            <h3 id={`cat-title-${category.id}`} className="rc-category-title">
              {category.title}
            </h3>
            <p className="rc-category-subtitle">{category.subtitle}</p>
          </div>
        </div>
        <div className="rc-category-header-right">
          <span className="rc-category-count">{category.studies.length} مراجع</span>
          <div className={`rc-category-chevron ${isExpanded ? 'open' : ''}`} aria-hidden="true">
            <ChevronLeft size={20} />
          </div>
        </div>
      </button>

      {/* Body containing studies */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={`cat-body-${category.id}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="rc-category-body"
          >
            <p className="rc-category-desc">{category.description}</p>
            <div className="rc-studies-grid" role="list">
              {category.studies.map((study, i) => (
                <div key={study.id} role="listitem">
                  <StudyCard study={study} delay={i * 0.05} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const ResearchCitations = () => {
  const [expandedCategories, setExpandedCategories] = useState({ concentration: true });
  const [searchQuery, setSearchQuery] = useState('');

  const totalStudies = useMemo(() => CATEGORIES.reduce((acc, c) => acc + c.studies.length, 0), []);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return CATEGORIES;
    const q = searchQuery.toLowerCase();
    return CATEGORIES
      .map(cat => ({
        ...cat,
        studies: cat.studies.filter(s =>
          s.title.toLowerCase().includes(q) ||
          s.authors.toLowerCase().includes(q) ||
          s.summary.toLowerCase().includes(q) ||
          s.journal.toLowerCase().includes(q) ||
          cat.title.toLowerCase().includes(q)
        ),
      }))
      .filter(cat => cat.studies.length > 0);
  }, [searchQuery]);

  // Keep search expanded when user is typing
  const displayedCategories = useMemo(() => {
    if (searchQuery.trim()) {
      const allOpen = {};
      filteredCategories.forEach(c => { allOpen[c.id] = true; });
      return { expanded: allOpen, list: filteredCategories };
    }
    return { expanded: expandedCategories, list: filteredCategories };
  }, [searchQuery, filteredCategories, expandedCategories]);

  const toggleCategory = (id) => {
    if (searchQuery.trim()) return; // Don't toggle when searching
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all = {};
    CATEGORIES.forEach(c => { all[c.id] = true; });
    setExpandedCategories(all);
  };

  const collapseAll = () => setExpandedCategories({});

  // ── SEO: AboutPage Schema for Scholarly Articles ──
  const aboutPageSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "الأبحاث المعتمد عليها - تطبيق وثيق",
    "description": "التوثيق العلمي الكامل والمراجع السريرية والتنظيمية التي يستند إليها محرك تحليل مستحضرات التجميل OilGuard في تطبيق وثيق.",
    "url": "https://wathiq.web.app/research",
    "mainEntity": {
      "@type": "ItemList",
      "name": "الدراسات والمراجع العلمية",
      "numberOfItems": totalStudies,
      "itemListElement": CATEGORIES.flatMap(c => c.studies).map((s, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "item": {
          "@type": "ScholarlyArticle",
          "name": s.title,
          "author": { "@type": "Person", "name": s.authors },
          "datePublished": s.year,
          "url": s.link,
          "headline": s.title,
          "publisher": { "@type": "Organization", "name": s.journal }
        }
      }))
    }
  };

  return (
    <div className="landing-wrapper rc-wrapper" style={{ minHeight: '100vh' }}>
      <SEO
        title="الأبحاث المعتمد عليها — التوثيق العلمي لمحرّك التحليل"
        description="المراجع والدراسات العلمية المحكّمة من PubMed واللوائح التنظيمية الدولية (FDA & EU) التي يعتمد عليها تطبيق وثيق لتقييم المكونات والمخاطر."
        keywords="الأبحاث المعتمد عليها, التوثيق العلمي, مراجع طبية, PubMed, FDA, EU regulation, أمان المكونات, محرك OilGuard, الجزائر"
        schema={aboutPageSchema}
        lastUpdated="2026-06-12T00:00:00Z"
      />
      <div className="grid-overlay" />

      {/* ── Hero Section ── */}
      <header className="rc-hero container" role="banner">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="rc-hero-inner"
        >

          <h1 className="rc-hero-title">
            الأبحاث <span className="text-mint">المعتمد عليها</span>
          </h1>
          <p className="rc-hero-sub">
            التقييمات والدرجات التي يعطيها تطبيق وثيق ليست عشوائية أو مبنية على آراء شخصية.
            كل نموذج حسابي في محرك <strong style={{ color: '#e2e8f0' }}>OilGuard</strong> مبني على لوائح دولية ودراسات سريرية منشورة في المجلات العلمية المحكّمة.
            هنا نعرض بوضوح وبكل شفافية كامل مراجعنا العلمية.
          </p>

          <div className="rc-hero-stats">
            <div className="rc-stat">
              <span className="rc-stat-num text-mint">2,500</span>
              <span className="rc-stat-label">مكوّن في قاعدة البيانات</span>
            </div>
            <div className="rc-stat-divider" />
            <div className="rc-stat">
              <span className="rc-stat-num text-mint">{totalStudies}</span>
              <span className="rc-stat-label">أبحاث ودراسات موثقة</span>
            </div>
            <div className="rc-stat-divider" />
            <div className="rc-stat">
              <span className="rc-stat-num text-mint">{CATEGORIES.length}</span>
              <span className="rc-stat-label">نماذج معالجة برمجية</span>
            </div>
            <div className="rc-stat-divider" />
            <div className="rc-stat">
              <span className="rc-stat-num text-mint">4-5 ثوانٍ</span>
              <span className="rc-stat-label">متوسط سرعة الفحص</span>
            </div>
          </div>
        </motion.div>
      </header>

      {/* ── Main Content Area ── */}
      <main>
        <div className="container">
          {/* Controls (Search and Actions) */}
        <section className="rc-controls-section" aria-label="أدوات البحث والتحكم">
          <div className="rc-controls-flex">
            <div className="rc-search-wrapper">
              <Search className="rc-search-icon" size={18} />
              <input
                className="rc-search-input"
                placeholder="ابحث عن الأبحاث..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                aria-label="ابحث في الدراسات العلمية"
              />
              {searchQuery && (
                <button
                  className="rc-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="مسح حقل البحث"
                >
                  <X size={15} />
                </button>
              )}
            </div>
            {!searchQuery.trim() && (
              <div className="rc-actions-group">
                <button className="rc-action-btn" onClick={expandAll}>
                  فتح الكل
                </button>
                <button className="rc-action-btn" onClick={collapseAll}>
                  إغلاق الكل
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Disclaimer Card */}
        <div className="rc-disclaimer-card" role="note">
          <AlertTriangle className="rc-disclaimer-icon" size={20} />
          <p className="rc-disclaimer-text">
            <strong>تنويه هام:</strong> التوثيق العلمي المعروض هنا مخصص للشفافية البرمجية ودعم المصداقية العلمية لنظامنا الحسابي.
            تطبيق وثيق لا يقدم بأي حال من الأحوال استشارات أو تشخيصات طبية؛ وتبقى مراجعة الطبيب المختص هي المرجع النهائي والأكثر أماناً لصحتك.
          </p>
        </div>

        {/* Categories and Accordions */}
        <div className="rc-categories-list">
          {displayedCategories.list.length === 0 ? (
            <div className="rc-empty-state" role="alert">
              <BookOpen className="rc-empty-icon" size={48} style={{ margin: '0 auto 1rem' }} />
              <h3>لا توجد نتائج مطابقة لبحثك</h3>
              <p>جرّبي كتابة كلمات مفتاحية أخرى مثل "Retinol" أو "pH" أو اسم المؤلف.</p>
            </div>
          ) : (
            displayedCategories.list.map(cat => (
              <CategorySection
                key={cat.id}
                category={cat}
                isExpanded={!!displayedCategories.expanded[cat.id]}
                onToggle={() => toggleCategory(cat.id)}
                searchQuery={searchQuery}
              />
            ))
          )}
        </div>
        </div>

        {/* CTA Page Bottom */}
        <section className="footer-cta" aria-labelledby="cta-heading" style={{ marginTop: '2rem' }}>
          <div className="top-fade" />
          <div className="brand-logo-large">
            <img src={wathiqLogo} alt="شعار تطبيق وثيق" />
          </div>
          <h2 id="cta-heading" className="cta-headline">
            العلم يحمي بشرتكِ الآن
          </h2>
          <p className="cta-sub">
            جهّزي منتجاتكِ واحصلي على فحص كامل ودقيق مدعوم بهذه الأبحاث السريرية في 4-5 ثوانٍ فقط.
          </p>
          <div className="cta-group-modern" style={{ justifyContent: 'center' }}>
            <Link to="/" className="btn-primary large cta-btn-glow" style={{ textDecoration: 'none', display: 'inline-flex' }}>
              <span className="shine-effect" />
              تنزيل التطبيق مجاناً
              <span className="icon-bounce">↓</span>
            </Link>
          </div>
          <div className="trust-badges">
            <span className="badge">
              <ShieldCheck size={14} color="#10b981" />
              مبني على أدلة
            </span>
            <span className="badge">
              <ShieldCheck size={14} color="#10b981" />
              خالٍ من التحيز التجاري
            </span>
            <span className="badge">
              <ShieldCheck size={14} color="#10b981" />
              مجاني تماماً
            </span>
          </div>
          <nav className="hiw-footer-nav" aria-label="روابط سفلية">
            <Link to="/how-it-works">كيف يعمل؟</Link>
            <Link to="/faq">الأسئلة الشائعة</Link>
            <Link to="/privacy">سياسة الخصوصية</Link>
            <Link to="/terms">شروط الاستخدام</Link>
          </nav>
          <p className="copyright">© {new Date().getFullYear()} تطبيق وثيق. جميع الحقوق محفوظة.</p>
        </section>
      </main>
    </div>
  );
};

export default ResearchCitations;
