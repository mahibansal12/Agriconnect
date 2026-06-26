// src/pages/recommendations/CropRecommendation.jsx
import { useState } from 'react';
import CropRecommendForm from '../../components/recommendations/CropRecommendForm';
import CropResultCard    from '../../components/recommendations/CropResultCard';
import axiosInstance     from '../../utils/axiosInstance';

// ── Fallback local logic if backend not ready ──────────────────
const LOCAL_RECOMMENDATIONS = {
  Alluvial: [
    { name: 'Wheat',      confidence: 92, season: 'Rabi',   waterNeed: 'Medium', duration: '110–150 days', avgYield: '20–25 qtl/acre', marketPrice: '₹2200/qtl', emoji: '🌾', tips: ['Best in well-drained alluvial plains', 'Apply urea at tillering stage'] },
    { name: 'Rice',       confidence: 88, season: 'Kharif', waterNeed: 'High',   duration: '90–120 days',  avgYield: '18–22 qtl/acre', marketPrice: '₹1900/qtl', emoji: '🍚', tips: ['Needs standing water', 'Use SRI method to save water'] },
    { name: 'Sugarcane',  confidence: 75, season: 'Zaid',   waterNeed: 'High',   duration: '10–12 months', avgYield: '300 qtl/acre',   marketPrice: '₹350/qtl',  emoji: '🎋', tips: ['Deep fertile soil preferred', 'Ratoon crop possible'] },
  ],
  Black: [
    { name: 'Cotton',     confidence: 90, season: 'Kharif', waterNeed: 'Medium', duration: '150–180 days', avgYield: '8–12 qtl/acre',  marketPrice: '₹6500/qtl', emoji: '🏵',  tips: ['Deep cracking clay ideal', 'Avoid waterlogging'] },
    { name: 'Soybean',    confidence: 83, season: 'Kharif', waterNeed: 'Medium', duration: '90–110 days',  avgYield: '10–14 qtl/acre', marketPrice: '₹4500/qtl', emoji: '🫘', tips: ['Fix atmospheric nitrogen', 'Inoculate seeds with Rhizobium'] },
    { name: 'Jowar',      confidence: 78, season: 'Kharif', waterNeed: 'Low',    duration: '100–115 days', avgYield: '12–15 qtl/acre', marketPrice: '₹2800/qtl', emoji: '🌾', tips: ['Drought tolerant', 'Also used as fodder'] },
  ],
  Sandy: [
    { name: 'Groundnut',  confidence: 87, season: 'Kharif', waterNeed: 'Low',    duration: '100–130 days', avgYield: '8–10 qtl/acre',  marketPrice: '₹5200/qtl', emoji: '🥜', tips: ['Light sandy loam preferred', 'Good aeration for pod development'] },
    { name: 'Bajra',      confidence: 82, season: 'Kharif', waterNeed: 'Low',    duration: '65–85 days',   avgYield: '10–12 qtl/acre', marketPrice: '₹2300/qtl', emoji: '🌾', tips: ['Extremely drought tolerant', 'Good for arid regions'] },
    { name: 'Mustard',    confidence: 74, season: 'Rabi',   waterNeed: 'Low',    duration: '110–140 days', avgYield: '6–8 qtl/acre',   marketPrice: '₹5100/qtl', emoji: '🟡', tips: ['Tolerates dry conditions', 'Apply sulphur fertiliser'] },
  ],
};

const getLocalRecommendations = ({ soilType }) => {
  const key = Object.keys(LOCAL_RECOMMENDATIONS).find(
    (k) => soilType?.toLowerCase().includes(k.toLowerCase())
  );
  return LOCAL_RECOMMENDATIONS[key] || LOCAL_RECOMMENDATIONS['Alluvial'];
};

// ─── Page Component ────────────────────────────────────────────
const CropRecommendation = () => {
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');
    setSubmitted(true);

    try {
      const { data } = await axiosInstance.post('/v1/recommendations/crop', formData);
      setResults(data.data);
    } catch {
      // Backend not ready → use local logic
      const local = getLocalRecommendations(formData);
      setResults(local);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">Crop Recommendation</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Get personalised crop suggestions based on your soil and climate
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        <CropRecommendForm onSubmit={handleSubmit} loading={loading} />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {submitted && !loading && results.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-gray-700 mb-3">
              ✅ {results.length} Crops Recommended for You
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
            <span className="text-5xl">🌾</span>
            <p className="mt-3 font-medium text-gray-500">No recommendations found</p>
            <p className="text-sm mt-1">Try adjusting your inputs</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropRecommendation;
