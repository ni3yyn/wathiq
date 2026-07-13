import React from 'react';
import { MessageSquare, Lightbulb, FlaskConical, Beaker, CheckCircle2 } from 'lucide-react';
import { useLang } from '../../context/LangContext';
import './Blog.css';

// ─── Key Term ──────────────────────────────────────────────────────
const KeyTermBlock = ({ data }) => {
  const { lang } = useLang();
  const badgeText = lang === 'fr' ? 'Terme Clé' : lang === 'en' ? 'Key Term' : 'مصطلح رئيسي';
  return (
    <div className="block-key-term">
      <div className="key-term-header">
        <span className="key-term-badge">💡 {badgeText}</span>
        <strong className="key-term-name">{data.term}</strong>
      </div>
      <p className="key-term-def">{data.definition}</p>
    </div>
  );
};

// ─── Formula Card ──────────────────────────────────────────────────
const FormulaCardBlock = ({ data }) => {
  return (
    <div className="block-formula-card">
      <div className="formula-card-header">
        <Beaker size={18} className="formula-icon" />
        <h3 className="formula-card-title">{data.title}</h3>
      </div>
      <div className="formula-card-phases">
        {data.phases.map((phase, pi) => (
          <div key={pi} className="formula-phase">
            <div className="formula-phase-header">
              <span className="formula-phase-name">{phase.name}</span>
              <span className="formula-phase-pct">{phase.percentage}</span>
            </div>
            <div className="formula-phase-ingredients">
              {phase.ingredients.map((ing, ii) => (
                <div key={ii} className="formula-ing-row">
                  <div className="formula-ing-info">
                    <span className="formula-ing-name">{ing.name}</span>
                    <span className="formula-ing-role">{ing.role}</span>
                  </div>
                  <span className="formula-ing-pct">{ing.pct}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Step Process ──────────────────────────────────────────────────
const StepProcessBlock = ({ data }) => (
  <div className="block-step-process">
    {data.steps.map((step, si) => (
      <div key={si} className="step-process-item">
        <div className="step-process-number-wrap">
          <div className="step-process-number">{step.number || si + 1}</div>
          {si < data.steps.length - 1 && <div className="step-process-line" />}
        </div>
        <div className="step-process-content">
          <h4 className="step-process-title">{step.title}</h4>
          <p className="step-process-text">{step.text}</p>
        </div>
      </div>
    ))}
  </div>
);

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
const BubbleQABlock = ({ data }) => {
  const pairs = data.qaPairs || (data.question ? [data] : []);
  return (
    <div className="block-bubble-qa">
      {pairs.map((pair, idx) => (
        <div key={idx} className="bubble-qa-pair">
          <div className="bubble-qa-q">
            <div className="bubble-qa-icon">
              <MessageSquare size={16} strokeWidth={2} />
            </div>
            <blockquote className="bubble-qa-text">{pair.question}</blockquote>
          </div>
          {pair.answer && <div className="bubble-qa-a">{pair.answer}</div>}
        </div>
      ))}
    </div>
  );
};

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
          case 'key_term':        return <KeyTermBlock key={idx} data={block.data} />;
          case 'formula_card':    return <FormulaCardBlock key={idx} data={block.data} />;
          case 'step_process':    return <StepProcessBlock key={idx} data={block.data} />;
          default:                return null;
        }
      })}
    </div>
  );
};

export default BlockRenderer;
