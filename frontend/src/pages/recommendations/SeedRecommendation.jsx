// src/pages/recommendations/SeedRecommendation.jsx
import { useState } from 'react';
import SeedRecommendForm from '../../components/recommendations/SeedRecommendForm';
import axiosInstance     from '../../utils/axiosInstance';

// ── Local fallback seed data ───────────────────────────────────
const LOCAL_SEEDS = {
  Wheat: [
    { variety: 'HD-2967',   type: 'High Yield',        yield: '18–22 qtl/acre', duration: '120–145 days', suitability: 'North India plains', resistance: 'Rust resistant',         price: '₹45/kg',  recommended: true  },
    { variety: 'PBW-550',   type: 'Early Maturity',    yield: '16–20 qtl/acre', duration: '110–130 days', suitability: 'Punjab, Haryana',    resistance: 'Moderate rust',          price: '₹42/kg',  recommended: false },
    { variety: 'GW-496',    type: 'Drought Tolerant',  yield: '14–18 qtl/acre', duration: '115–135 days', suitability: 'Rajasthan, Gujarat', resistance: 'Heat tolerant',          price: '₹40/kg',  recommended: false },
  ],
  Rice: [
    { variety: 'Pusa-1121', type: 'Export Quality',    yield: '14–18 qtl/acre', duration: '135–145 days', suitability: 'Punjab, Haryana',    resistance: 'Blast susceptible',      price: '₹60/kg',  recommended: true  },
    { variety: 'MTU-1010',  type: 'High Yield',        yield: '20–24 qtl/acre', duration: '115–120 days', suitability: 'Andhra, Tamil Nadu', resistance: 'BPH resistant',          price: '₹50/kg',  recommended: false },
    { variety: 'Sahbhagi',  type: 'Drought Tolerant',  yield: '12–15 qtl/acre', duration: '105–110 days', suitability: 'Bihar, Jharkhand',   resistance: 'Drought tolerant',       price: '₹45/kg',  recommended: false },
  ],
  Maize: [
    { variety: 'DKC-9144',  type: 'High Yield',        yield: '22–28 qtl/acre', duration: '85–95 days',   suitability: 'All regions',        resistance: 'Turcicum blight res.',   price: '₹280/kg', recommended: true  },
    { variety: 'Vivek-QPM', type: 'High Protein',      yield: '18–22 qtl/acre', duration: '75–85 days',   suitability: 'Hills & plains',     resistance: 'Disease tolerant',       price: '₹260/kg', recommended: false },
    { variety: 'HQPM-1',    type: 'Quality Protein',   yield: '16–20 qtl/acre', duration: '80–90 days',   suitability: 'North India',        resistance: 'Moderate resistance',    price: '₹240/kg', recommended: false },
  ],
  Cotton: [
    { variety: 'Bt RCH-2',  type: 'High Yield',        yield: '8–12 qtl/acre',  duration: '155–180 days', suitability: 'Maharashtra, Gujarat', resistance: 'Bollworm resistant',   price: '₹950/kg', recommended: true  },
    { variety: 'MRC-7017',  type: 'Disease Resistant', yield: '7–10 qtl/acre',  duration: '150–175 days', suitability: 'Deccan plateau',     resistance: 'Wilt resistant',         price: '₹900/kg', recommended: false },
  ],
};

const getFallbackSeeds = (crop) => LOCAL_SEEDS[crop] || [];

// ─── Result Card ───────────────────────────────────────────────
const SeedCard = ({ seed }) => (
  <div className={`bg-white rounded-2xl border p-4 space-y-3 relative ${
    seed.recommended ? 'border-yellow-300 shadow-md' : 'border-gray-100 shadow-sm'
  }`}>
    {seed.recommended && (
      <div className="absolute top-3 right-3 bg-yellow-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
        ⭐ TOP PICK
      </div>
    )}

    <div>
      <h3 className="text-base font-bold text-gray-800">{seed.variety}</h3>
      <span className="inline-block mt-1 bg-green-50 text-green-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
        {seed.type}
      </span>
    </div>

    <div className="grid grid-cols-2 gap-2 text-xs">
      {[
        { label: '📦 Yield',         value: seed.yield       },
        { label: '⏱ Duration',       value: seed.duration    },
        { label: '📍 Best For',      value: seed.suitability },
        { label: '🛡 Resistance',    value: seed.resistance  },
        { label: '💰 Seed Price',    value: seed.price       },
      ].map(({ label, value }) => (
        <div key={label} className="bg-gray-50 rounded-lg p-2">
          <p className="text-gray-400">{label}</p>
          <p className="font-medium text-gray-700 mt-0.5 text-[11px]">{value}</p>
        </div>
      ))}
    </div>
  </div>
);

// ─── Page Component ────────────────────────────────────────────
const SeedRecommendation = () => {
  const [seeds,     setSeeds]     = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [cropName,  setCropName]  = useState('');

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');
    setSubmitted(true);
    setCropName(formData.crop);

    try {
      const { data } = await axiosInstance.post('/v1/recommendations/seed', formData);
      setSeeds(data.data);
    } catch {
      // Backend not ready → use local logic
      setSeeds(getFallbackSeeds(formData.crop));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">🌿 Seed Recommendation</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Find the best certified seed varieties for your crop and region
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        <SeedRecommendForm onSubmit={handleSubmit} loading={loading} />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {submitted && !loading && seeds.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-gray-700 mb-3">
              🌿 {seeds.length} Seed Varieties Found for {cropName}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {seeds.map((seed) => (
                <SeedCard key={seed.variety} seed={seed} />
              ))}
            </div>
          </div>
        )}

        {submitted && !loading && seeds.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <span className="text-5xl">🌿</span>
            <p className="mt-3 font-medium text-gray-500">No seed data found for this crop</p>
            <p className="text-sm mt-1">Try a different crop or region</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeedRecommendation;
