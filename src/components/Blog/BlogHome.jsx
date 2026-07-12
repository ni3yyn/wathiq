import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search, Clock, ArrowLeft, BookOpen, ChevronLeft, Tag } from 'lucide-react';
import { useLang } from '../../context/LangContext';
import LanguageSwitcher from './LanguageSwitcher';
import wathiqLogo from '../../assets/wathiq-logo.png';
import '../../LandingPage.css';
import './Blog.css';
import WathiqHeader from '../WathiqHeader';

// Article imports
import articlesAr from '../../data/articles/ar/index';
import articlesFr from '../../data/articles/fr/index';
import articlesEn from '../../data/articles/en/index';

const ALL_ARTICLES = { ar: articlesAr, fr: articlesFr, en: articlesEn };

const CAT_META = {
  all:     { labelAr: 'الكل',            labelFr: 'Tout',           labelEn: 'All' },
  audit:   { labelAr: 'تدقيق المنتجات',  labelFr: 'Audit produits', labelEn: 'Audits' },
  science: { labelAr: 'علم المكونات',    labelFr: 'Science INCI',   labelEn: 'Science' },
  claims:  { labelAr: 'كشف الادعاءات',   labelFr: 'Fausses promesses', labelEn: 'Claims' },
};

const getCatLabel = (catKey, lang) => {
  const m = CAT_META[catKey];
  if (!m) return catKey;
  return lang === 'fr' ? m.labelFr : lang === 'en' ? m.labelEn : m.labelAr;
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4, ease: 'easeOut' } }),
};

// ─── Article Card ──────────────────────────────────────────────────
const ArticleCard = ({ article, index, isRTL, lang, selectedTag, onSelectTag }) => {
  const title = article.seo.title.split(' | ')[0];
  const tags = useMemo(() => {
    return (article.tags || article.seo.keywords || []).map(t => t.trim());
  }, [article]);

  return (
    <motion.div custom={index} variants={fadeUp} initial="hidden" animate="visible">
      <div className="blog-card">
        <Link to={`/blog/${article.slug}`} className="blog-card-clickable-area">
          <div className="blog-card-meta-top">
            <span className="blog-card-cat-badge-clean">{getCatLabel(article.category, lang)}</span>
            <span className="blog-card-read-clean">
              <Clock size={12} />
              &nbsp;{article.readTime}&nbsp;{lang === 'ar' ? 'دقيقة' : lang === 'fr' ? 'min' : 'min'}
            </span>
          </div>
          <h2 className="blog-card-title">{title}</h2>
          <p className="blog-card-excerpt">{article.seo.description}</p>
        </Link>
        
        {/* Tags Section */}
        {tags.length > 0 && (
          <div className="blog-card-tags">
            {tags.slice(0, 3).map(t => (
              <button
                key={t}
                className={`blog-card-tag-pill ${selectedTag === t ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelectTag(selectedTag === t ? null : t);
                }}
              >
                #{t}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── Featured Card ─────────────────────────────────────────────────
const FeaturedCard = ({ article, isRTL, lang, selectedTag, onSelectTag }) => {
  const title = article.seo.title.split(' | ')[0];
  const tags = useMemo(() => {
    return (article.tags || article.seo.keywords || []).map(t => t.trim());
  }, [article]);

  return (
    <div className="blog-featured-card-clean">
      <div className="blog-featured-body-full">
        <div className="blog-card-meta-top" style={{ marginBottom: '12px' }}>
          <span className="blog-card-cat-badge-clean" style={{ fontSize: '0.8rem' }}>
            {getCatLabel(article.category, lang)}
          </span>
          <span className="blog-card-read-clean" style={{ fontSize: '0.8rem' }}>
            <Clock size={13} />
            &nbsp;{article.readTime}&nbsp;{lang === 'ar' ? 'دقيقة قراءة' : 'min read'}
          </span>
        </div>
        
        <Link to={`/blog/${article.slug}`} className="blog-featured-link-title">
          <h2 className="blog-featured-title-clean">{title}</h2>
        </Link>
        
        <p className="blog-featured-excerpt-clean">{article.seo.description}</p>
        
        {tags.length > 0 && (
          <div className="blog-card-tags" style={{ marginTop: '16px', marginBottom: '20px' }}>
            {tags.slice(0, 4).map(t => (
              <button
                key={t}
                className={`blog-card-tag-pill ${selectedTag === t ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectTag(selectedTag === t ? null : t);
                }}
              >
                #{t}
              </button>
            ))}
          </div>
        )}
        
        <div className="blog-featured-footer-clean">
          <span className="blog-featured-author">{article.author}</span>
          <Link to={`/blog/${article.slug}`} className="blog-featured-cta-clean">
            {lang === 'ar' ? 'اقرأ المقال الكامل' : lang === 'fr' ? "Lire l'article complet" : 'Read full article'}
            <ChevronLeft size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────
const BlogHome = () => {
  const { lang, t } = useLang();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const isRTL = lang === 'ar';

  const articles = ALL_ARTICLES[lang] || articlesAr;

  // Extract all tags from current language articles
  const popularTags = useMemo(() => {
    const counts = {};
    articles.forEach(a => {
      const tagsList = a.tags || a.seo.keywords || [];
      tagsList.forEach(rawTag => {
        const tag = rawTag.trim();
        if (tag) counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    // Sort by frequency and take top 8
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 8);
  }, [articles]);

  const filtered = useMemo(() => {
    let list = articles;
    if (activeCategory !== 'all') list = list.filter(a => a.category === activeCategory);
    
    if (selectedTag) {
      list = list.filter(a => {
        const tagsList = (a.tags || a.seo.keywords || []).map(t => t.trim().toLowerCase());
        return tagsList.includes(selectedTag.toLowerCase());
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a =>
        a.seo.title.toLowerCase().includes(q) ||
        a.seo.description.toLowerCase().includes(q) ||
        (a.tags || a.seo.keywords || []).some(k => k.toLowerCase().includes(q))
      );
    }
    return list;
  }, [articles, activeCategory, searchQuery, selectedTag]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'مدونة وثيق',
    url: 'https://wathiq.web.app/blog',
    description: t('blog_subtitle'),
    inLanguage: lang,
    publisher: { '@type': 'Organization', name: 'Wathiq', url: 'https://wathiq.web.app' },
  };

  const navBlogLabel = lang === 'ar' ? 'المدونة' : lang === 'fr' ? 'Blog' : 'Blog';
  const heroTitle = lang === 'ar' ? 'مقالات علمية' : lang === 'fr' ? 'Articles scientifiques' : 'Scientific Articles';
  const heroSub = lang === 'ar'
    ? 'دليلك العلمي لاكتشاف ما لا تخبرك به العلامات التجارية — تدقيق المنتجات الجزائرية، علم المكونات، وكشف الادعاءات التسويقية.'
    : lang === 'fr'
    ? "Votre guide scientifique pour découvrir ce que les marques ne vous disent pas — audits produits, science INCI, et décryptage des allégations."
    : "Your scientific guide to discovering what brands don't tell you — product audits, ingredient science, and marketing claim analysis.";

  return (
    <>
      <Helmet>
        <title>{t('blog_title')} | وثيق</title>
        <meta name="description" content={t('blog_subtitle')} />
        <meta property="og:title" content={`${t('blog_title')} | وثيق`} />
        <meta property="og:description" content={t('blog_subtitle')} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://wathiq.web.app/blog" />
        <html lang={lang} dir={isRTL ? 'rtl' : 'ltr'} />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <div className={`blog-wrapper landing-wrapper ${isRTL ? '' : 'ltr'}`}>
        <div className="grid-overlay" />

        <WathiqHeader />

        {/* ── Hero ─── */}
        <header className="blog-hero container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="hero-pill" style={{ marginBottom: '1.25rem', marginRight: 0 }}>
              <span className="pulse-dot" />
              {navBlogLabel} — وثيق
            </div>
            <h1 className="blog-hero-title">
              {lang === 'ar' ? (
                <>{heroTitle} <span className="text-mint">حصرية</span></>
              ) : lang === 'fr' ? (
                <><span className="text-mint">Articles</span> {heroTitle.replace('Articles ', '')}</>
              ) : (
                <><span className="text-mint">Scientific</span> Articles</>
              )}
            </h1>
            <p className="blog-hero-sub">{heroSub}</p>

            {/* ── Controls ── */}
            <div className="blog-controls">
              <div className="blog-search-wrap">
                <Search size={16} className="blog-search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={lang === 'ar' ? 'ابحث في المقالات...' : lang === 'fr' ? 'Rechercher...' : 'Search articles...'}
                  className="blog-search-input"
                />
              </div>
              <div className="blog-cats">
                {Object.keys(CAT_META).map(key => (
                  <button
                    key={key}
                    className={`blog-cat-pill ${activeCategory === key ? 'active' : ''}`}
                    onClick={() => {
                      setActiveCategory(key);
                      setSelectedTag(null); // Reset tag filter on category switch
                    }}
                  >
                    {getCatLabel(key, lang)}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Popular Tags System ── */}
            {popularTags.length > 0 && (
              <div className="blog-tags-filter-bar">
                <span className="blog-tags-filter-label">
                  <Tag size={12} style={{ marginLeft: '4px' }} />
                  {lang === 'ar' ? 'وسوم شائعة:' : lang === 'fr' ? 'Mots clés:' : 'Tags:'}
                </span>
                <div className="blog-tags-filter-list">
                  {popularTags.map(tag => (
                    <button
                      key={tag}
                      className={`blog-tag-filter-pill ${selectedTag === tag ? 'active' : ''}`}
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    >
                      {tag}
                    </button>
                  ))}
                  {selectedTag && (
                    <button className="blog-clear-tag-btn" onClick={() => setSelectedTag(null)}>
                      {lang === 'ar' ? 'إلغاء التصفية ×' : 'Effacer ×'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </header>

        {/* ── Content ── */}
        <main className="container" style={{ paddingBottom: '4rem' }}>
          <div className="blog-results-meta">
            <p className="blog-count">
              {filtered.length}&nbsp;
              {lang === 'ar' ? 'مقال' : lang === 'fr' ? 'article(s)' : 'article(s)'}
            </p>
            {selectedTag && (
              <span className="blog-active-tag-badge">
                {lang === 'ar' ? 'تصفية بالوسم:' : 'Filtré par:'} <strong>#{selectedTag}</strong>
              </span>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="blog-empty">
              <Search size={40} />
              <p>{lang === 'ar' ? 'لا توجد نتائج مطابقة' : lang === 'fr' ? 'Aucun résultat' : 'No results found'}</p>
            </div>
          ) : (
            <>
              {featured && (
                <section className="blog-featured-wrap" aria-label="المقال المميز">
                  <span className="blog-section-label">
                    {lang === 'ar' ? 'المقال المميز' : lang === 'fr' ? 'À la une' : 'Featured'}
                  </span>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <FeaturedCard
                      article={featured}
                      isRTL={isRTL}
                      lang={lang}
                      selectedTag={selectedTag}
                      onSelectTag={setSelectedTag}
                    />
                  </motion.div>
                </section>
              )}

              {rest.length > 0 && (
                <section aria-label="جميع المقالات">
                  <span className="blog-section-label">
                    {lang === 'ar' ? 'جميع المقالات' : lang === 'fr' ? 'Tous les articles' : 'All articles'}
                  </span>
                  <div className="blog-grid">
                    {rest.map((article, i) => (
                      <ArticleCard
                        key={article.slug}
                        article={article}
                        index={i}
                        isRTL={isRTL}
                        lang={lang}
                        selectedTag={selectedTag}
                        onSelectTag={setSelectedTag}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* ── Footer nav ── */}
          <nav className="blog-footer-nav" aria-label="روابط سريعة">
            <Link to="/">الرئيسية</Link>
            <Link to="/how-it-works">كيف يعمل وثيق؟</Link>
            <Link to="/research">الأبحاث</Link>
            <Link to="/faq">الأسئلة الشائعة</Link>
          </nav>
        </main>
      </div>
    </>
  );
};

export default BlogHome;
