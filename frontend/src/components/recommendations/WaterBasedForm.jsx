// src/components/recommendations/WaterBasedForm.jsx
// Suggests crops based on available water source and quantity

const WATER_SOURCES  = ['Rainwater', 'Canal', 'Borewell', 'River', 'Pond', 'Drip Irrigation'];
const LAND_SIZES     = ['< 1 acre', '1–2 acres', '2–5 acres', '5–10 acres', '> 10 acres'];
const STATES         = [
  'Uttar Pradesh', 'Punjab', 'Haryana', 'Madhya Pradesh', 'Rajasthan',
  'Maharashtra', 'Bihar', 'Uttarakhand', 'Gujarat', 'Andhra Pradesh',
  'Tamil Nadu', 'Karnataka', 'West Bengal',
];

const WaterBasedForm = ({ onSubmit, loading }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    onSubmit({
      waterSource:    fd.get('waterSource'),
      waterAvailability: fd.get('waterAvailability'),
      landSize:       fd.get('landSize'),
      state:          fd.get('state'),
      season:         fd.get('season'),
    });
  };

  const inputClass =
    'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white';

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-800">💧 Water-Based Crop Suggestion</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Get crop suggestions based on your water availability
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Water Source */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Water Source <span className="text-red-400">*</span>
          </label>
          <select name="waterSource" required className={inputClass}>
            <option value="">Select water source</option>
            {WATER_SOURCES.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>

        {/* Water Availability */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Water Availability <span className="text-red-400">*</span>
          </label>
          <select name="waterAvailability" required className={inputClass}>
            <option value="">Select level</option>
            <option value="scarce">Scarce (less than 300mm)</option>
            <option value="low">Low (300–600mm)</option>
            <option value="medium">Medium (600–1000mm)</option>
            <option value="high">High (more than 1000mm)</option>
          </select>
        </div>

        {/* Land Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Land Size
          </label>
          <select name="landSize" className={inputClass}>
            <option value="">Select land size</option>
            {LAND_SIZES.map((l) => <option key={l} value={l}>{l}</option>)}
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

        {/* Season */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upcoming Season <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-3 flex-wrap">
            {['Kharif', 'Rabi', 'Zaid'].map((s) => (
              <label key={s} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="season"
                  value={s}
                  required
                  className="accent-blue-500"
                />
                <span className="text-sm text-gray-700">{s}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-semibold transition"
      >
        {loading ? 'Analysing...' : '💧 Get Water-Wise Suggestions'}
      </button>
    </form>
  );
};

export default WaterBasedForm;
