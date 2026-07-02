// src/pages/recommendations/WaterBasedSuggestion.jsx
import { useState } from 'react';
import WaterBasedForm from '../../components/recommendations/WaterBasedForm';
import CropResultCard from '../../components/recommendations/CropResultCard';
import axiosInstance  from '../../utils/axiosInstance';

// ── Local fallback data keyed by water availability ────────────
const LOCAL_WATER_RECS = {
  scarce: [
    { name: 'Bajra',     confidence: 94, waterNeed: 'Very Low', duration: '65–85 days',   avgYield: '10–12 qtl/acre', marketPrice: '₹2300/qtl', emoji: '🌾', tips: ['Needs only 200–350mm water', 'Best for arid zones'] },
    { name: 'Jowar',     confidence: 89, waterNeed: 'Low',      duration: '100–115 days',  avgYield: '12–15 qtl/acre', marketPrice: '₹2800/qtl', emoji: '🌾', tips: ['Drought tolerant', 'Deep rooted crop'] },
    { name: 'Moth Bean', confidence: 78, waterNeed: 'Very Low', duration: '60–75 days',    avgYield: '4–6 qtl/acre',   marketPrice: '₹6000/qtl', emoji: '🫘', tips: ['Excellent for dry Rajasthan soil', 'Fixes nitrogen'] },
  ],
  low: [
    { name: 'Mustard',   confidence: 91, waterNeed: 'Low',    duration: '110–140 days',  avgYield: '6–8 qtl/acre',   marketPrice: '₹5100/qtl', emoji: '🟡', tips: ['2–3 irrigations enough', 'High oil content'] },
    { name: 'Groundnut', confidence: 85, waterNeed: 'Low',    duration: '100–130 days',  avgYield: '8–10 qtl/acre',  marketPrice: '₹5200/qtl', emoji: '🥜', tips: ['Well-drained light soil', 'Good for Kharif'] },
    { name: 'Chickpea',  confidence: 79, waterNeed: 'Low',    duration: '90–110 days',   avgYield: '8–12 qtl/acre',  marketPrice: '₹4800/qtl', emoji: '🫘', tips: ['Residual moisture is enough', 'Rabi crop'] },
  ],
  medium: [
    { name: 'Wheat',     confidence: 93, waterNeed: 'Medium', duration: '110–150 days',  avgYield: '20–25 qtl/acre', marketPrice: '₹2200/qtl', emoji: '🌾', tips: ['4–6 irrigations for best yield', 'Crown root irrigation critical'] },
    { name: 'Maize',     confidence: 87, waterNeed: 'Medium', duration: '80–95 days',    avgYield: '20–28 qtl/acre', marketPrice: '₹1800/qtl', emoji: '🌽', tips: ['Silking stage is critical', 'Avoid waterlogging'] },
    { name: 'Soybean',   confidence: 81, waterNeed: 'Medium', duration: '90–110 days',   avgYield: '10–14 qtl/acre', marketPrice: '₹4500/qtl', emoji: '🫘', tips: ['Needs well-distributed rain', 'Pod filling stage is critical'] },
  ],
  high: [
    { name: 'Rice',      confidence: 95, waterNeed: 'High',   duration: '90–120 days',   avgYield: '18–22 qtl/acre', marketPrice: '₹1900/qtl', emoji: '🍚', tips: ['Needs standing water 5–10cm', 'Transplant at 21 days'] },
    { name: 'Sugarcane', confidence: 88, waterNeed: 'High',   duration: '10–12 months',  avgYield: '300 qtl/acre',   marketPrice: '₹350/qtl',  emoji: '🎋', tips: ['Heavy water consumer', 'Drip irrigation saves 30%'] },
    { name: 'Jute',      confidence: 76, waterNeed: 'High',   duration: '100–120 days',  avgYield: '15–25 qtl/acre', marketPrice: '₹4500/qtl', emoji: '🌿', tips: ['Needs humid climate', 'Good for West Bengal'] },
  ],
};

const toCropCards = (payload) => {
  const suggestions = payload?.suggestions ?? payload;
  if (!Array.isArray(suggestions)) return [];
  return suggestions.map((crop) => ({
    name: crop.name ?? crop.cropName,
    confidence: crop.confidence ?? 85,
    season: crop.season,
    waterNeed: crop.waterNeed ?? crop.waterRequirement,
    duration: crop.duration,
    avgYield: crop.avgYield ?? crop.yieldPerAcre,
    marketPrice: crop.marketPrice ?? crop.profitPerAcre,
    tips: crop.tips ?? [crop.why, payload?.irrigationTip].filter(Boolean),
    emoji: crop.emoji ?? '🌾',
  }));
};

// ─── Page Component ────────────────────────────────────────────
const WaterBasedSuggestion = () => {
  const [results,   setResults]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [inputSummary, setInputSummary] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');
    setSubmitted(true);
    setInputSummary(formData);

    try {
      const payload = {
        waterAvailability: formData.waterAvailability === 'scarce' ? 'low' : formData.waterAvailability,
        rainfallForecast: formData.rainfallForecast || 'moderate',
        irrigationType: formData.irrigationType || formData.waterSource || 'rain-fed',
      };
      const { data } = await axiosInstance.post('/v1/recommend/water', payload);
      setResults(toCropCards(data.data));
    } catch {
      // Backend not ready → use local logic
      const key = formData.waterAvailability || 'medium';
      setResults(LOCAL_WATER_RECS[key] || LOCAL_WATER_RECS['medium']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">💧 Water-Based Crop Suggestion</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Find crops suited to your water source and availability
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        <WaterBasedForm onSubmit={handleSubmit} loading={loading} />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Input summary badge */}
        {submitted && !loading && inputSummary && (
          <div className="flex flex-wrap gap-2 text-xs">
            {Object.entries(inputSummary)
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <span key={k} className="bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1 rounded-full capitalize">
                  {k.replace(/([A-Z])/g, ' $1')}: {v}
                </span>
              ))}
          </div>
        )}

        {/* Results */}
        {submitted && !loading && results.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-gray-700 mb-3">
              💧 {results.length} Crops Suited to Your Water Conditions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((crop, i) => (
                <CropResultCard key={crop.name} crop={crop} rank={i + 1} />
              ))}
            </div>
          </div>
        )}

        {submitted && !loading && results.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <span className="text-5xl">💧</span>
            <p className="mt-3 font-medium text-gray-500">No suggestions found</p>
            <p className="text-sm mt-1">Try different water availability settings</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaterBasedSuggestion;
