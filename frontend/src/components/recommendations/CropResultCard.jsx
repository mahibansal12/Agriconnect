// src/components/recommendations/CropResultCard.jsx

const CONFIDENCE_THEME = (score) => {
  if (score >= 85) return { tone: 'high', label: 'Strong fit' };
  if (score >= 70) return { tone: 'medium', label: 'Good fit' };
  return { tone: 'watch', label: 'Review fit' };
};

const CropResultCard = ({ crop, rank }) => {
  const {
    name,
    confidence = 0,
    season,
    waterNeed,
    duration,
    avgYield,
    marketPrice,
    tips = [],
    emoji = '🌾',
  } = crop;

  const theme = CONFIDENCE_THEME(confidence);

  return (
    <article className={`crop-result-card crc-${theme.tone}`}>
      <div className="crc-rank">#{rank}</div>

      <div className="crc-head">
        <div className="crc-emoji">{emoji}</div>
        <div>
          <div className="crc-fit">{theme.label}</div>
          <h3>{name}</h3>
          {season && <p>{season}</p>}
        </div>
      </div>

      <div className="crc-score-row">
        <span>Match Score</span>
        <strong>{confidence}%</strong>
      </div>
      <div className="crc-score-track">
        <div style={{ width: `${Math.min(100, Math.max(0, confidence))}%` }} />
      </div>

      <div className="crc-metrics">
        {[
          ['Water Need', waterNeed, '💧'],
          ['Duration', duration, '⏱'],
          ['Avg Yield', avgYield, '📦'],
          ['Market Value', marketPrice, '₹'],
        ].filter(([, value]) => value).map(([label, value, icon]) => (
          <div className="crc-metric" key={label}>
            <span>{icon}</span>
            <small>{label}</small>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      {tips.length > 0 && (
        <div className="crc-tips">
          <div className="crc-tips-title">Field notes</div>
          {tips.slice(0, 2).map((tip) => (
            <p key={tip}><span>✓</span>{tip}</p>
          ))}
        </div>
      )}

      <style>{`
        .crop-result-card {
          position: relative;
          min-height: 100%;
          overflow: hidden;
          border: 1px solid #D8E8C8;
          border-radius: 14px;
          background: rgba(255,255,255,0.94);
          box-shadow: 0 18px 40px rgba(45,92,30,0.08);
          padding: 18px;
        }
        .crop-result-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto 0;
          height: 5px;
          background: linear-gradient(90deg, #16A34A, #0EA5E9);
        }
        .crop-result-card.crc-medium::before {
          background: linear-gradient(90deg, #F59E0B, #16A34A);
        }
        .crop-result-card.crc-watch::before {
          background: linear-gradient(90deg, #F97316, #FACC15);
        }
        .crc-rank {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          border: 1px solid #E0EAD8;
          color: #166534;
          font-size: 12px;
          font-weight: 900;
          box-shadow: 0 10px 22px rgba(45,92,30,0.10);
        }
        .crc-head {
          display: flex;
          align-items: center;
          gap: 13px;
          padding-right: 42px;
          margin-bottom: 16px;
        }
        .crc-emoji {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #DCFCE7, #E0F2FE);
          border: 1px solid #BBF7D0;
          font-size: 28px;
          flex-shrink: 0;
        }
        .crc-fit {
          display: inline-flex;
          align-items: center;
          min-height: 22px;
          padding: 0 9px;
          border-radius: 999px;
          background: #DCFCE7;
          color: #166534;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .crc-medium .crc-fit {
          background: #FEF3C7;
          color: #92400E;
        }
        .crc-watch .crc-fit {
          background: #FFEDD5;
          color: #C2410C;
        }
        .crc-head h3 {
          margin: 7px 0 1px;
          color: #0A2E0C;
          font-size: 21px;
          line-height: 1.15;
          font-weight: 900;
        }
        .crc-head p {
          margin: 0;
          color: #4B7A5C;
          font-size: 13px;
          font-weight: 700;
        }
        .crc-score-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #4B7A5C;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .crc-score-row strong {
          color: #166534;
          font-size: 13px;
        }
        .crc-medium .crc-score-row strong { color: #B45309; }
        .crc-watch .crc-score-row strong { color: #C2410C; }
        .crc-score-track {
          height: 10px;
          overflow: hidden;
          border-radius: 999px;
          background: #ECFDF5;
          border: 1px solid #D8E8C8;
        }
        .crc-score-track div {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #16A34A, #22C55E);
          transition: width 0.6s ease;
        }
        .crc-medium .crc-score-track div {
          background: linear-gradient(90deg, #F59E0B, #22C55E);
        }
        .crc-watch .crc-score-track div {
          background: linear-gradient(90deg, #F97316, #FACC15);
        }
        .crc-metrics {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 16px;
        }
        .crc-metric {
          min-width: 0;
          border: 1px solid #EEF4E8;
          border-radius: 10px;
          background: #F8FBF6;
          padding: 11px;
        }
        .crc-metric span {
          display: inline-block;
          margin-bottom: 5px;
          font-size: 16px;
        }
        .crc-metric small {
          display: block;
          color: #7A8F76;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .crc-metric strong {
          display: block;
          min-width: 0;
          margin-top: 4px;
          color: #0A2E0C;
          font-size: 13px;
          line-height: 1.3;
          font-weight: 900;
          overflow-wrap: anywhere;
        }
        .crc-tips {
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid #E0EAD8;
        }
        .crc-tips-title {
          margin-bottom: 8px;
          color: #166534;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .crc-tips p {
          display: flex;
          gap: 8px;
          margin: 6px 0 0;
          color: #4B5563;
          font-size: 13px;
          line-height: 1.45;
        }
        .crc-tips p span {
          color: #16A34A;
          font-weight: 900;
          flex-shrink: 0;
        }
      `}</style>
    </article>
  );
};

export default CropResultCard;
