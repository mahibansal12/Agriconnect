// src/components/mandi/MandiFilters.jsx

const CROPS = [
  'All', 'Wheat', 'Rice', 'Maize', 'Soybean', 'Cotton',
  'Sugarcane', 'Mustard', 'Groundnut', 'Potato', 'Onion', 'Tomato',
];

const STATES = [
  'All',
  'Uttar Pradesh', 'Punjab', 'Haryana', 'Madhya Pradesh',
  'Rajasthan', 'Maharashtra', 'Bihar', 'Uttarakhand',
  'Gujarat', 'Andhra Pradesh', 'Tamil Nadu', 'Karnataka', 'West Bengal',
];

const MandiFilters = ({ filters, onChange }) => {
  const handleChange = (key, value) => onChange({ ...filters, [key]: value });

  const handleReset = () => onChange({ crop: 'All', state: 'All', market: '' });

  const hasActive =
    filters.crop !== 'All' || filters.state !== 'All' || filters.market !== '';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-4 items-end">

      {/* Crop */}
      <div className="flex flex-col gap-1 min-w-[140px]">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Crop</label>
        <select
          value={filters.crop}
          onChange={(e) => handleChange('crop', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
        >
          {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* State */}
      <div className="flex flex-col gap-1 min-w-[160px]">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">State</label>
        <select
          value={filters.state}
          onChange={(e) => handleChange('state', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
        >
          {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Market / Mandi name */}
      <div className="flex flex-col gap-1 min-w-[160px]">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Market / Mandi</label>
        <input
          type="text"
          placeholder="e.g. Azadpur, Haridwar"
          value={filters.market}
          onChange={(e) => handleChange('market', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      {/* Reset */}
      {hasActive && (
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition font-medium"
        >
          ✕ Reset
        </button>
      )}
    </div>
  );
};

export default MandiFilters;
