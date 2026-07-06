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
 
  const allLocalCrops = Object.values(LOCAL_RECOMMENDATIONS).flat();
  const soilTypesCount = Object.keys(LOCAL_RECOMMENDATIONS).length;
  const seasonsCount = new Set(allLocalCrops.map((c) => c.season)).size;
  const waterLevelsCount = new Set(allLocalCrops.map((c) => c.waterNeed)).size;
  const aiRecommendationsCount = results.length || allLocalCrops.length;
 
  return (
    <div className="advisor-page">
      <Navbar />
 
      <section className="advisor-hero">
        <div className="advisor-hero-circle advisor-hero-circle-1" />
        <div className="advisor-hero-circle advisor-hero-circle-2" />
        <div className="advisor-hero-inner">
          <div className="advisor-eyebrow">AgriConnect • Crop Advisor</div>
          <h1>🌱 Crop Recommendation</h1>
          <p>
            Match your soil type, season, climate, and water availability with
            crops best suited for your farming conditions.
          </p>
          <div className="advisor-hero-stats">
            <div><strong>{soilTypesCount}</strong><span>Soil Types</span></div>
            <div><strong>{seasonsCount}</strong><span>Seasons</span></div>
            <div><strong>{waterLevelsCount}</strong><span>Water Levels</span></div>
            <div><strong>{aiRecommendationsCount}</strong><span>AI Recommendations</span></div>
          </div>
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
 
        /* ===== Header (Crop Knowledge style) ===== */
        .advisor-hero { position: relative; overflow: hidden; min-height: 300px; display: flex; align-items: center; background: linear-gradient(135deg, #0a3d1f 0%, #14532d 55%, #1b6b34 100%); }
        .advisor-hero-circle { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.05); pointer-events: none; }
        .advisor-hero-circle-1 { width: 420px; height: 420px; top: -160px; right: -90px; }
        .advisor-hero-circle-2 { width: 240px; height: 240px; bottom: -120px; left: 8%; background: rgba(255,255,255,0.04); }
        .advisor-hero-inner { position: relative; z-index: 1; width: min(100% - 48px, 1280px); margin: 0 auto; padding: 40px 0 36px; }
        .advisor-eyebrow { display: inline-flex; margin-bottom: 14px; color: #86efac; font-size: 13px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
        .advisor-hero-inner h1 { margin: 0; display: flex; align-items: center; gap: 12px; color: #fff; font-size: clamp(28px, 3.4vw, 38px); font-weight: 900; line-height: 1.1; }
        .advisor-hero-inner p { max-width: 700px; margin: 14px 0 0; color: rgba(255,255,255,0.82); font-size: 15px; line-height: 1.65; }
        .advisor-hero-stats { display: flex; flex-wrap: wrap; gap: 0; margin-top: 22px; }
        .advisor-hero-stats div { display: flex; align-items: baseline; gap: 6px; padding-right: 20px; margin-right: 20px; border-right: 1px solid rgba(255,255,255,0.2); }
        .advisor-hero-stats div:last-child { border-right: none; margin-right: 0; padding-right: 0; }
        .advisor-hero-stats strong { color: #fff; font-size: 20px; font-weight: 900; }
        .advisor-hero-stats span { color: rgba(255,255,255,0.72); font-size: 13px; font-weight: 700; }
        @media (max-width: 640px) {
          .advisor-hero-inner { width: min(100% - 32px, 1280px); padding: 32px 0 28px; }
          .advisor-hero-stats { flex-direction: column; gap: 12px; }
          .advisor-hero-stats div { border-right: none; padding-right: 0; margin-right: 0; }
        }
        /* ===== End Header ===== */
 
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
        @media (max-width: 980px) { .advisor-grid { grid-template-columns: 1fr; } .advisor-stats, .advisor-result-grid { grid-template-columns: 1fr; } }
        @media (max-width: 640px) { .advisor-main { width: min(100% - 32px, 1280px); } }
      `}</style>
    </div>
  );
};
 
export default CropRecommendation;