// src/components/recommendations/CropRecommendForm.jsx
// Form that collects soil, climate, and location data to recommend crops

const SOIL_TYPES = ['Alluvial', 'Black', 'Red', 'Laterite', 'Sandy', 'Loamy', 'Clay'];
const SEASONS    = ['Kharif (Jun–Oct)', 'Rabi (Nov–Mar)', 'Zaid (Mar–Jun)'];
const STATES     = [
  'Uttar Pradesh', 'Punjab', 'Haryana', 'Madhya Pradesh', 'Rajasthan',
  'Maharashtra', 'Bihar', 'Uttarakhand', 'Gujarat', 'Andhra Pradesh',
  'Tamil Nadu', 'Karnataka', 'West Bengal',
];

const CropRecommendForm = ({ onSubmit, loading }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    onSubmit({
      soilType:    fd.get('soilType'),
      season:      fd.get('season'),
      state:       fd.get('state'),
      rainfall:    fd.get('rainfall'),
      temperature: fd.get('temperature'),
      ph:          fd.get('ph'),
    });
  };

  const inputClass =
    'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white';

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-800">🌱 Crop Recommendation</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Fill in your field details to get personalised crop suggestions
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Soil Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Soil Type <span className="text-red-400">*</span>
          </label>
          <select name="soilType" required className={inputClass}>
            <option value="">Select soil type</option>
            {SOIL_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Season */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Season <span className="text-red-400">*</span>
          </label>
          <select name="season" required className={inputClass}>
            <option value="">Select season</option>
            {SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
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

        {/* Rainfall */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Annual Rainfall (mm)
          </label>
          <input
            name="rainfall"
            type="number"
            placeholder="e.g. 800"
            min="0"
            className={inputClass}
          />
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Avg Temperature (°C)
          </label>
          <input
            name="temperature"
            type="number"
            placeholder="e.g. 25"
            min="0"
            max="55"
            className={inputClass}
          />
        </div>

        {/* Soil pH */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Soil pH
          </label>
          <input
            name="ph"
            type="number"
            placeholder="e.g. 6.5"
            min="0"
            max="14"
            step="0.1"
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-semibold transition"
      >
        {loading ? 'Finding crops...' : '🔍 Get Recommendations'}
      </button>
    </form>
  );
};

export default CropRecommendForm;
