import React from 'react';
import { MessageSquare, Lightbulb, FlaskConical } from 'lucide-react';
import './Blog.css';

// ─── Heading ──────────────────────────────────────────────────────
const HeadingBlock = ({ data }) => {
  const Tag = `h${data.level}`;
  const id = data.text.replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, '').trim().replace(/\s+/g, '-').toLowerCase().slice(0, 60);
  return <Tag id={id} className={`block-h${data.level}`}>{data.text}</Tag>;
};

// ─── Paragraph ────────────────────────────────────────────────────
const ParagraphBlock = ({ data }) => (
  <p className="block-p">{data}</p>
);

// ─── Bubble QA ────────────────────────────────────────────────────
const BubbleQABlock = ({ data }) => (
  <div className="block-bubble-qa">
    <div className="bubble-qa-icon">
      <MessageSquare size={16} strokeWidth={2} />
    </div>
    <blockquote className="bubble-qa-text">{data.question}</blockquote>
  </div>
);

// ─── Comparison Table ──────────────────────────────────────────────
const ComparisonTableBlock = ({ data }) => (
  <div className="block-table-wrap">
    <table className="block-table">
      <thead>
        <tr>
          {data.headers.map((h, i) => <th key={i}>{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, ri) => (
          <tr key={ri}>
            {row.map((cell, ci) => <td key={ci}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Tip Box ──────────────────────────────────────────────────────
const TipBoxBlock = ({ data }) => (
  <aside className="block-tip-box">
    <div className="tip-box-header">
      <div className="tip-box-icon-wrap">
        <Lightbulb size={15} strokeWidth={2.2} />
      </div>
      <strong className="tip-box-title">{data.title}</strong>
    </div>
    <p className="tip-box-text">{data.text}</p>
  </aside>
);

// ─── CTA Wathiq ───────────────────────────────────────────────────
const CTAWathiqBlock = ({ data }) => (
  <div className="block-cta">
    <div className="block-cta-inner">
      <div className="block-cta-brand">وثيق</div>
      <p className="block-cta-msg">{data.message}</p>
      <a
        href={data.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block-cta-btn"
        onClick={() => {
          if (typeof gtag !== 'undefined') {
            gtag('event', 'blog_cta_click', { slug: window.location.pathname });
          }
        }}
      >
        {data.buttonText}
      </a>
    </div>
  </div>
);

// ─── Main renderer ────────────────────────────────────────────────
const BlockRenderer = ({ blocks }) => {
  if (!blocks || !Array.isArray(blocks)) return null;
  return (
    <div className="block-renderer">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'heading':         return <HeadingBlock key={idx} data={block.data} />;
          case 'paragraph':       return <ParagraphBlock key={idx} data={block.data} />;
          case 'bubble_qa':       return <BubbleQABlock key={idx} data={block.data} />;
          case 'comparison_table': return <ComparisonTableBlock key={idx} data={block.data} />;
          case 'tip_box':         return <TipBoxBlock key={idx} data={block.data} />;
          case 'cta_wathiq':      return <CTAWathiqBlock key={idx} data={block.data} />;
          default:                return null;
        }
      })}
    </div>
  );
};

export default BlockRenderer;
