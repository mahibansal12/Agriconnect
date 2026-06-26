// src/components/recommendations/SeedRecommendForm.jsx
// Recommends best seed varieties based on crop + region + conditions

const CROP_LIST = [
  'Wheat', 'Rice', 'Maize', 'Cotton', 'Soybean',
  'Sugarcane', 'Mustard', 'Groundnut', 'Potato', 'Onion', 'Tomato', 'Chilli',
];
const STATES = [
  'Uttar Pradesh', 'Punjab', 'Haryana', 'Madhya Pradesh', 'Rajasthan',
  'Maharashtra', 'Bihar', 'Uttarakhand', 'Gujarat', 'Andhra Pradesh',
  'Tamil Nadu', 'Karnataka', 'West Bengal',
];
const PURPOSES = ['High Yield', 'Disease Resistant', 'Drought Tolerant', 'Early Maturity', 'Export Quality'];

const SeedRecommendForm = ({ onSubmit, loading }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    onSubmit({
      crop:        fd.get('crop'),
      state:       fd.get('state'),
      soilType:    fd.get('soilType'),
      purpose:     fd.get('purpose'),
      irrigated:   fd.get('irrigated'),
    });
  };

  const inputClass =
    'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white';

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-800">🌿 Seed Recommendation</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Find the best seed variety for your crop and region
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Crop */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Crop <span className="text-red-400">*</span>
          </label>
          <select name="crop" required className={inputClass}>
            <option value="">Select crop</option>
            {CROP_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State <span className="text-red-400">*</span>
          </label>
          <select name="state" required className={inputClass}>
            <option value="">Select state</option>
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Soil Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
          <select name="soilType" className={inputClass}>
            <option value="">Select soil type</option>
            {['Alluvial', 'Black', 'Red', 'Laterite', 'Sandy', 'Loamy', 'Clay'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority / Purpose</label>
          <select name="purpose" className={inputClass}>
            <option value="">Any</option>
            {PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Irrigated */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Field Condition</label>
          <div className="flex gap-4">
            {[
              { value: 'irrigated',   label: '💦 Irrigated'    },
              { value: 'rainfed',     label: '🌧 Rain-fed'     },
              { value: 'both',        label: '🔀 Both / Mixed' },
            ].map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="irrigated"
                  value={value}
                  defaultChecked={value === 'irrigated'}
                  className="accent-yellow-500"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-semibold transition"
      >
        {loading ? 'Finding seeds...' : '🌿 Get Seed Recommendations'}
      </button>
    </form>
  );
};

export default SeedRecommendForm;
