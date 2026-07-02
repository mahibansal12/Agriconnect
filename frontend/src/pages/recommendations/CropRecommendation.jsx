// src/pages/recommendations/CropRecommendation.jsx
import { useState } from 'react';
import CropRecommendForm from '../../components/recommendations/CropRecommendForm';
import CropResultCard from '../../components/recommendations/CropResultCard';
import Navbar from '../../components/common/Navbar';
import axiosInstance from '../../utils/axiosInstance';

const LOCAL_RECOMMENDATIONS = {
  Alluvial: [
    { name: 'Wheat', confidence: 92, season: 'Rabi', waterNeed: 'Medium', duration: '110-150 days', avgYield: '20-25 qtl/acre', marketPrice: 'Rs 2200/qtl', emoji: '🌾', tips: ['Best in well-drained alluvial plains', 'Apply urea at tillering stage'] },
    { name: 'Rice', confidence: 88, season: 'Kharif', waterNeed: 'High', duration: '90-120 days', avgYield: '18-22 qtl/acre', marketPrice: 'Rs 1900/qtl', emoji: '🍚', tips: ['Needs standing water', 'Use SRI method to save water'] },
    { name: 'Sugarcane', confidence: 75, season: 'Zaid', waterNeed: 'High', duration: '10-12 months', avgYield: '300 qtl/acre', marketPrice: 'Rs 350/qtl', emoji: '🎋', tips: ['Deep fertile soil preferred', 'Ratoon crop possible'] },
  ],
  Black: [
    { name: 'Cotton', confidence: 90, season: 'Kharif', waterNeed: 'Medium', duration: '150-180 days', avgYield: '8-12 qtl/acre', marketPrice: 'Rs 6500/qtl', emoji: '🌿', tips: ['Deep black soil is ideal', 'Avoid waterlogging'] },
    { name: 'Soybean', confidence: 83, season: 'Kharif', waterNeed: 'Medium', duration: '90-110 days', avgYield: '10-14 qtl/acre', marketPrice: 'Rs 4500/qtl', emoji: '🫘', tips: ['Fixes atmospheric nitrogen', 'Inoculate seeds with Rhizobium'] },
    { name: 'Jowar', confidence: 78, season: 'Kharif', waterNeed: 'Low', duration: '100-115 days', avgYield: '12-15 qtl/acre', marketPrice: 'Rs 2800/qtl', emoji: '🌾', tips: ['Drought tolerant', 'Also useful as fodder'] },
  ],
  Sandy: [
    { name: 'Groundnut', confidence: 87, season: 'Kharif', waterNeed: 'Low', duration: '100-130 days', avgYield: '8-10 qtl/acre', marketPrice: 'Rs 5200/qtl', emoji: '🥜', tips: ['Light sandy loam preferred', 'Good aeration helps pod development'] },
    { name: 'Bajra', confidence: 82, season: 'Kharif', waterNeed: 'Low', duration: '65-85 days', avgYield: '10-12 qtl/acre', marketPrice: 'Rs 2300/qtl', emoji: '🌾', tips: ['Extremely drought tolerant', 'Good for arid regions'] },
    { name: 'Mustard', confidence: 74, season: 'Rabi', waterNeed: 'Low', duration: '110-140 days', avgYield: '6-8 qtl/acre', marketPrice: 'Rs 5100/qtl', emoji: '🟡', tips: ['Tolerates dry conditions', 'Apply sulphur fertilizer'] },
  ],
};

const getLocalRecommendations = ({ soilType }) => {
  const key = Object.keys(LOCAL_RECOMMENDATIONS).find((name) =>
    soilType?.toLowerCase().includes(name.toLowerCase())
  );
  return LOCAL_RECOMMENDATIONS[key] || LOCAL_RECOMMENDATIONS.Alluvial;
};

const toCropCards = (payload) => {
  const recommendations = payload?.recommendations ?? payload;
  if (!Array.isArray(recommendations)) return [];
  return recommendations.map((crop) => ({
    name: crop.name ?? crop.cropName,
    confidence: crop.confidence ?? 85,
    season: crop.season,
    waterNeed: crop.waterNeed ?? crop.waterRequirement,
    duration: crop.duration,
    avgYield: crop.avgYield ?? crop.expectedYield,
    marketPrice: crop.marketPrice ?? crop.estimatedProfit,
    tips: crop.tips ?? [crop.why, payload?.rotationReason].filter(Boolean),
    emoji: crop.emoji ?? '🌾',
  }));
};

const CropRecommendation = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');
    setSubmitted(true);

    try {
      const payload = {
        previousCrop: formData.previousCrop || 'wheat',
        soilType: formData.soilType,
        season: String(formData.season || '').split(' ')[0],
        waterAvailability: formData.waterAvailability || 'medium',
        landSize: formData.landSize || 1,
      };
      const { data } = await axiosInstance.post('/v1/recommend/crop', payload);
      const cards = toCropCards(data.data);
      setResults(cards.length ? cards : getLocalRecommendations(formData));
    } catch {
      setResults(getLocalRecommendations(formData));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="advisor-page">
      <Navbar />

      <section className="advisor-hero">
        <div className="advisor-field-lines" />
        <div className="advisor-hero-inner">
          <div className="advisor-copy">
            <div className="advisor-eyebrow">Smart crop advisor</div>
            <h1>Crop Recommendation</h1>
            <p>
              Match your soil, season, climate, and water availability with crops
              that fit Indian farming conditions.
            </p>
            <div className="advisor-actions">
              <a href="#advisor-form" className="advisor-primary">Start analysis</a>
              <span className="advisor-pill">Frontend demo ready</span>
            </div>
          </div>

          <aside className="advisor-panel">
            <div className="advisor-panel-label">Decision support</div>
            <div className="advisor-score">92%</div>
            <p>Typical match score for complete soil and season inputs.</p>
            <div className="advisor-mini-grid">
              <div><strong>7</strong><span>Soils</span></div>
              <div><strong>3</strong><span>Seasons</span></div>
              <div><strong>India</strong><span>Region</span></div>
            </div>
          </aside>
        </div>
      </section>

      <main id="advisor-form" className="advisor-main">
        <section className="advisor-stats">
          {[
            ['Soil based', 'Alluvial, black, red and more', '🌱'],
            ['Season aware', 'Kharif, Rabi and Zaid planning', '☀️'],
            ['Water wise', 'Low to high water crop fit', '💧'],
          ].map(([title, text, icon]) => (
            <div className="advisor-stat" key={title}>
              <span>{icon}</span>
              <div><strong>{title}</strong><small>{text}</small></div>
            </div>
          ))}
        </section>

        <div className="advisor-grid">
          <div className="advisor-form-card">
            <CropRecommendForm onSubmit={handleSubmit} loading={loading} />
          </div>

          <aside className="advisor-side">
            <h2>How recommendations are ranked</h2>
            <div className="advisor-steps">
              {[
                ['01', 'Soil compatibility', 'Filters crops suitable for your soil type.'],
                ['02', 'Season timing', 'Prioritises crops that match the selected season.'],
                ['03', 'Water demand', 'Keeps choices realistic for available irrigation.'],
              ].map(([num, title, desc]) => (
                <div className="advisor-step" key={num}>
                  <span>{num}</span>
                  <div><strong>{title}</strong><p>{desc}</p></div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        {error && <div className="advisor-error">{error}</div>}

        {submitted && !loading && results.length > 0 && (
          <section className="advisor-results">
            <div className="advisor-section-head">
              <h2>{results.length} Crops Recommended for You</h2>
              <p>Review fit score, season, water need, and expected value.</p>
            </div>
            <div className="advisor-result-grid">
              {results.map((crop, i) => (
                <CropResultCard key={crop.name} crop={crop} rank={i + 1} />
              ))}
            </div>
          </section>
        )}

        {submitted && !loading && results.length === 0 && (
          <div className="advisor-empty">
            <span>🌾</span>
            <p>No recommendations found</p>
            <small>Try adjusting your inputs</small>
          </div>
        )}
      </main>

      <style>{`
        .advisor-page { min-height: 100vh; background: linear-gradient(135deg, #EAF7FF 0%, #FFF8E6 46%, #EFFBEF 100%); }
        .advisor-hero { position: relative; overflow: hidden; min-height: 420px; background: linear-gradient(90deg, rgba(7,41,18,0.88), rgba(18,85,28,0.72), rgba(14,165,233,0.36)), radial-gradient(circle at 82% 16%, rgba(255,205,83,0.95) 0 8%, rgba(255,173,46,0.24) 9% 22%, transparent 34%), linear-gradient(180deg, #74C7F2 0%, #BDEBFF 31%, #FFE19A 45%, #79B54A 46%, #236E2A 100%); }
        .advisor-field-lines { position: absolute; left: -8%; right: -8%; top: 45%; bottom: -30%; opacity: 0.82; background: repeating-linear-gradient(104deg, rgba(255,255,255,0.18) 0 2px, transparent 2px 58px), repeating-linear-gradient(76deg, rgba(8,69,22,0.30) 0 3px, transparent 3px 70px); transform: perspective(520px) rotateX(58deg); transform-origin: top; }
        .advisor-hero-inner { position: relative; z-index: 1; width: min(100% - 48px, 1280px); min-height: 420px; margin: 0 auto; padding: 58px 0 66px; display: grid; grid-template-columns: minmax(0, 1fr) 420px; align-items: center; gap: 72px; }
        .advisor-copy h1 { margin: 0; color: #fff; font-size: clamp(42px, 5vw, 66px); line-height: 1.05; font-weight: 900; letter-spacing: 0; }
        .advisor-copy p { max-width: 650px; margin: 20px 0 0; color: rgba(255,255,255,0.88); font-size: 18px; line-height: 1.8; }
        .advisor-eyebrow { display: inline-flex; margin-bottom: 20px; padding: 6px 14px; border: 1px solid rgba(255,226,139,0.48); border-radius: 6px; background: rgba(255,248,220,0.16); color: #FFE7A3; font-size: 13px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
        .advisor-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 32px; }
        .advisor-primary { min-height: 46px; display: inline-flex; align-items: center; justify-content: center; padding: 0 24px; border-radius: 8px; background: linear-gradient(135deg, #F59E0B, #EF4444); color: #fff; font-weight: 900; text-decoration: none; box-shadow: 0 14px 30px rgba(239,68,68,0.24); }
        .advisor-pill { min-height: 38px; display: inline-flex; align-items: center; padding: 0 16px; border-radius: 999px; border: 1px solid rgba(255,235,167,0.72); color: #fff; background: rgba(255,255,255,0.08); font-weight: 800; font-size: 13px; }
        .advisor-panel { border: 1px solid rgba(179,229,252,0.42); border-radius: 14px; padding: 22px; color: #fff; background: rgba(9,68,76,0.42); box-shadow: 0 20px 50px rgba(10,45,30,0.22); backdrop-filter: blur(6px); }
        .advisor-panel-label { color: #B3E5FC; font-size: 12px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; }
        .advisor-score { margin-top: 18px; font-size: 54px; line-height: 1; color: #FFE082; font-weight: 900; }
        .advisor-panel p { color: rgba(255,255,255,0.76); line-height: 1.6; }
        .advisor-mini-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-top: 18px; }
        .advisor-mini-grid div { min-height: 74px; border-radius: 10px; background: rgba(255,255,255,0.12); display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .advisor-mini-grid strong { color: #fff; font-size: 19px; }
        .advisor-mini-grid span { margin-top: 4px; color: rgba(255,255,255,0.68); font-size: 12px; }
        .advisor-main { width: min(100% - 48px, 1280px); margin: 0 auto; padding: 32px 0 72px; }
        .advisor-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 22px; }
        .advisor-stat { display: flex; align-items: center; gap: 14px; border: 1px solid #D8E8C8; border-radius: 14px; background: rgba(255,255,255,0.9); padding: 18px; box-shadow: 0 18px 40px rgba(45,92,30,0.08); }
        .advisor-stat span { font-size: 28px; }
        .advisor-stat strong { display: block; color: #0A2E0C; font-size: 17px; }
        .advisor-stat small { color: #4B7A5C; font-size: 13px; }
        .advisor-grid { display: grid; grid-template-columns: minmax(0, 2fr) minmax(320px, 0.9fr); gap: 22px; align-items: start; }
        .advisor-form-card > form { border-radius: 14px !important; border: 1px solid #D8E8C8 !important; box-shadow: 0 18px 40px rgba(45,92,30,0.08) !important; }
        .advisor-side { border: 1px solid #BAE6FD; border-radius: 14px; background: linear-gradient(135deg, #F0F9FF, #FFFBEB); padding: 22px; box-shadow: 0 18px 40px rgba(45,92,30,0.08); }
        .advisor-side h2 { margin: 0 0 18px; color: #0A2E0C; font-size: 20px; font-weight: 900; }
        .advisor-steps { display: flex; flex-direction: column; gap: 14px; }
        .advisor-step { display: flex; gap: 12px; }
        .advisor-step > span { width: 34px; height: 34px; flex: 0 0 34px; border-radius: 10px; background: #16A34A; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 12px; }
        .advisor-step strong { color: #0A2E0C; font-size: 14px; }
        .advisor-step p { margin: 3px 0 0; color: #4B7A5C; font-size: 13px; line-height: 1.5; }
        .advisor-error { margin-top: 18px; border: 1px solid #FECACA; background: #FEF2F2; color: #B91C1C; border-radius: 12px; padding: 12px 14px; font-size: 14px; font-weight: 700; }
        .advisor-results { margin-top: 28px; }
        .advisor-section-head h2 { margin: 0; color: #0A2E0C; font-size: 24px; font-weight: 900; }
        .advisor-section-head p { margin: 5px 0 16px; color: #4B7A5C; font-size: 14px; }
        .advisor-result-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 18px; }
        .advisor-empty { margin-top: 22px; min-height: 220px; border: 1px dashed #BBF7D0; border-radius: 16px; background: rgba(255,255,255,0.86); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #4B7A5C; }
        .advisor-empty span { font-size: 52px; }
        .advisor-empty p { margin: 10px 0 2px; color: #0A2E0C; font-weight: 900; }
        @media (max-width: 980px) { .advisor-hero-inner, .advisor-grid { grid-template-columns: 1fr; } .advisor-panel { max-width: 520px; } .advisor-stats, .advisor-result-grid { grid-template-columns: 1fr; } }
        @media (max-width: 640px) { .advisor-hero-inner, .advisor-main { width: min(100% - 32px, 1280px); } .advisor-copy h1 { font-size: 38px; } .advisor-copy p { font-size: 16px; } .advisor-mini-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default CropRecommendation;
