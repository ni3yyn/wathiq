import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords }) => {
    const defaultTitle = "وثيق | دليلك الذكي للعناية";
    const defaultDesc = "المنصة الجزائرية الأولى لتحليل مكونات مستحضرات التجميل، مقارنة المنتجات، وبناء روتين العناية المثالي بالذكاء الاصطناعي.";
    const defaultKeywords = "عناية بالبشرة, تحليل مكونات, ذكاء اصطناعي, وثيق, الجزائر, روتين شعر, بشرة";
    const themeColor = "#10b981"; // Brand Green

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{title ? `${title} | وثيق` : defaultTitle}</title>
            <meta name="description" content={description || defaultDesc} />
            <meta name="keywords" content={keywords || defaultKeywords} />
            <meta name="theme-color" content={themeColor} />

            {/* Open Graph / Facebook / WhatsApp */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={title || defaultTitle} />
            <meta property="og:description" content={description || defaultDesc} />
            <meta property="og:site_name" content="وثيق" />
            <meta property="og:url" content={window.location.href} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title || defaultTitle} />
            <meta name="twitter:description" content={description || defaultDesc} />
        </Helmet>
    );
};

export default SEO;