import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Copy, Check, FlaskConical, AlertTriangle, ScanLine, BookOpen, ChevronLeft, List } from 'lucide-react';
import { useLang } from '../../context/LangContext';
import BlockRenderer from './BlockRenderer';
import LanguageSwitcher from './LanguageSwitcher';
import wathiqLogo from '../../assets/wathiq-logo.png';
import '../../LandingPage.css';
import './Blog.css';
import WathiqHeader from '../WathiqHeader';

import articlesAr from '../../data/articles/ar/index';
import articlesFr from '../../data/articles/fr/index';
import articlesEn from '../../data/articles/en/index';

const ALL_ARTICLES = [...articlesAr, ...articlesFr, ...articlesEn];
const PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.wathiq.app';

const CAT_META = {
  audit:   { Icon: ScanLine,    labelAr: 'تدقيق المنتجات',  cls: 'cat-audit'   },
  science: { Icon: FlaskConical,labelAr: 'علم المكونات',    cls: 'cat-science' },
  claims:  { Icon: AlertTriangle,labelAr: 'كشف الادعاءات',  cls: 'cat-claims'  },
};

const BlogArticle = () => {
  const { slug } = useParams();
  const { lang, setLang, t } = useLang();
  const [copied, setCopied] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);

  const article = useMemo(() => ALL_ARTICLES.find(a => a.slug === slug), [slug]);

  // Sync lang to article's language
  useEffect(() => {
    if (article && article.lang && article.lang !== lang) {
      setLang(article.lang);
    }
  }, [article?.slug]);

  if (!article) {
    return (
      <div className="landing-wrapper" style={{ minHeight: '100vh' }}>
        <nav className="nav-fixed">
          <div className="container nav-flex">
            <Link to="/" className="brand-logo-container" style={{ textDecoration: 'none' }}>
              <img src={wathiqLogo} alt="وثيق" className="nav-logo" />
              <h2 className="brand-name">وثيق</h2>
            </Link>
          </div>
        </nav>
        <div className="blog-not-found">
          <h1>404</h1>
          <p>المقال غير موجود</p>
          <Link to="/blog">العودة إلى المدونة</Link>
        </div>
      </div>
    );
  }

  const isRTL = article.lang === 'ar';
  const articleTitle = article.seo.title.split(' | ')[0];
  const pageUrl = `https://wathiq.web.app/blog/${article.slug}`;
  const { Icon: CatIcon, cls: catCls } = CAT_META[article.category] || CAT_META.science;

  // Extract headings for TOC
  const headings = article.content
    .filter(b => b.type === 'heading')
    .map(b => ({
      text: b.data.text,
      id: b.data.text.replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, '').trim().replace(/\s+/g, '-').toLowerCase().slice(0, 60),
      level: b.data.level,
    }));

  // Related articles
  const related = ALL_ARTICLES
    .filter(a => a.lang === article.lang && a.category === article.category && a.slug !== article.slug)
    .slice(0, 2);

  const alternates = article.translations
    ? Object.entries(article.translations).map(([lc, altSlug]) => ({ lang: lc, slug: altSlug }))
    : [];

  const handleCopy = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const shareWA = () => window.open(`https://wa.me/?text=${encodeURIComponent(`${articleTitle} — ${pageUrl}`)}`);
  const shareFB = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`);

  // JSON-LD
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: articleTitle,
    description: article.seo.description,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: { '@type': 'Person', name: article.author },
    publisher: {
      '@type': 'Organization',
      name: 'Wathiq',
      url: 'https://wathiq.web.app',
      logo: { '@type': 'ImageObject', url: 'https://wathiq.web.app/og-image-compressed.jpg' },
    },
    inLanguage: article.lang,
    url: pageUrl,
    keywords: article.seo.keywords?.join(', '),
  };

  const backLabel = article.lang === 'ar' ? 'المدونة' : article.lang === 'fr' ? 'Blog' : 'Blog';

  return (
    <>
      <Helmet>
        <title>{article.seo.title}</title>
        <meta name="description" content={article.seo.description} />
        <meta name="keywords" content={article.seo.keywords?.join(', ')} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={article.seo.title} />
        <meta property="og:description" content={article.seo.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:site_name" content="وثيق | Wathiq" />
        <meta property="article:published_time" content={article.publishedAt} />
        <meta property="article:author" content={article.author} />
        {article.seo.keywords?.map(k => <meta key={k} property="article:tag" content={k} />)}
        <link rel="alternate" hreflang={article.lang} href={pageUrl} />
        {alternates.map(alt => (
          <link key={alt.lang} rel="alternate" hreflang={alt.lang} href={`https://wathiq.web.app/blog/${alt.slug}`} />
        ))}
        <link rel="alternate" hreflang="x-default" href="https://wathiq.web.app/blog" />
        <html lang={article.lang} dir={isRTL ? 'rtl' : 'ltr'} />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <div className={`blog-article-wrapper landing-wrapper ${isRTL ? '' : 'ltr'}`}>
        <div className="grid-overlay" />

        <WathiqHeader />

        {/* ── Article Header ── */}
        <motion.header
          className="blog-article-header"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <div className="blog-article-cat-row">
            <span className="blog-article-cat-badge">
              {CAT_META[article.category]?.labelAr || article.category}
            </span>
          </div>
          <h1 className="blog-article-title">{articleTitle}</h1>
          <div className="blog-article-meta">
            <Clock size={14} />
            <span>{article.readTime}&nbsp;{article.lang === 'ar' ? 'دقيقة قراءة' : 'min read'}</span>
            <span className="blog-article-meta-dot">·</span>
            <span>{article.publishedAt}</span>
            <span className="blog-article-meta-dot">·</span>
            <span>{article.author}</span>
          </div>

          {/* Tags */}
          {article.seo.keywords && article.seo.keywords.length > 0 && (
            <div className="blog-article-tags-row">
              {article.seo.keywords.map(t => (
                <span key={t} className="blog-article-tag-badge">#{t.trim()}</span>
              ))}
            </div>
          )}

          {/* Share */}
          <div className="blog-article-share">
            <button onClick={shareWA} className="blog-share-btn" title="مشاركة على واتساب">
              واتساب
            </button>
            <button onClick={shareFB} className="blog-share-btn" title="مشاركة على فيسبوك">
              فيسبوك
            </button>
            <button onClick={handleCopy} className={`blog-share-btn ${copied ? 'copied' : ''}`}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              &nbsp;{copied
                ? (article.lang === 'ar' ? 'تم النسخ' : 'Copié')
                : (article.lang === 'ar' ? 'نسخ الرابط' : 'Copier le lien')}
            </button>
          </div>

          {/* Mobile TOC */}
          {headings.length > 0 && (
            <div className="blog-toc-mobile">
              <button className="blog-toc-toggle" onClick={() => setTocOpen(o => !o)}>
                <List size={15} />
                {article.lang === 'ar' ? 'محتوى المقال' : 'Table des matières'}
                &nbsp;{tocOpen ? '▲' : '▼'}
              </button>
              {tocOpen && (
                <nav className="blog-toc-list-mobile">
                  {headings.map(h => (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      className={`blog-toc-link ${h.level === 3 ? 'h3' : ''}`}
                      onClick={() => setTocOpen(false)}
                    >
                      {h.text}
                    </a>
                  ))}
                </nav>
              )}
            </div>
          )}
        </motion.header>

        {/* ── Body Layout ── */}
        <div className="blog-article-layout">
          {/* Main */}
          <main>
            <article className="blog-article-body">
              <BlockRenderer blocks={article.content} />
            </article>

            {/* Language Alternates */}
            {alternates.length > 0 && (
              <div className="blog-article-alternates">
                <span>{article.lang === 'ar' ? 'متاح أيضاً بـ:' : 'Also available in:'}</span>
                {alternates.map(alt => (
                  <Link key={alt.lang} to={`/blog/${alt.slug}`} className="blog-alternate-link">
                    {alt.lang === 'ar' ? 'العربية' : alt.lang === 'fr' ? 'Français' : 'English'}
                  </Link>
                ))}
              </div>
            )}

            {/* Related */}
            {related.length > 0 && (
              <section className="blog-related">
                <h2 className="blog-related-title">
                  {article.lang === 'ar' ? 'مقالات ذات صلة' : article.lang === 'fr' ? 'Articles liés' : 'Related articles'}
                </h2>
                <div className="blog-related-grid">
                  {related.map(rel => {
                    return (
                      <Link key={rel.slug} to={`/blog/${rel.slug}`} className="blog-related-card">
                        <div className="blog-related-body-only">
                          <span className="blog-card-cat-badge-clean" style={{ fontSize: '0.72rem', marginBottom: '6px', display: 'block' }}>
                            {CAT_META[rel.category]?.labelAr || rel.category}
                          </span>
                          <p className="blog-related-text">{rel.seo.title.split(' | ')[0]}</p>
                          <span className="blog-related-read">
                            <Clock size={12} />&nbsp;{rel.readTime}&nbsp;
                            {rel.lang === 'ar' ? 'دقيقة' : 'min'}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Footer nav */}
            <nav className="blog-footer-nav" aria-label="روابط سريعة">
              <Link to="/">الرئيسية</Link>
              <Link to="/blog">المدونة</Link>
              <Link to="/how-it-works">كيف يعمل وثيق؟</Link>
              <Link to="/faq">الأسئلة الشائعة</Link>
            </nav>
          </main>

          {/* ── Sidebar ── */}
          {headings.length > 0 && (
            <aside className="blog-sidebar">
              <div className="blog-toc-sticky">
                <h3 className="blog-toc-sticky-title">
                  {article.lang === 'ar' ? 'محتوى المقال' : 'Contenu'}
                </h3>
                <nav className="blog-toc-nav">
                  {headings.map(h => (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      className={`blog-toc-link ${h.level === 3 ? 'h3' : ''}`}
                    >
                      {h.text}
                    </a>
                  ))}
                </nav>
                <div className="blog-toc-cta">
                  <p>{article.lang === 'ar' ? 'جرّبي التطبيق مجاناً' : "Essayez l'application"}</p>
                  <a href={PLAY_STORE} target="_blank" rel="noopener noreferrer" className="blog-toc-dl-btn">
                    Google Play
                  </a>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogArticle;
