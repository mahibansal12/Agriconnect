// src/components/marketplace/CropFilters.jsx

const CROP_TYPES = ['All', 'Grain', 'Vegetable', 'Fruit', 'Spice', 'Oilseed'];

const STATES = [
  'All',
  'Uttar Pradesh',
  'Punjab',
  'Haryana',
  'Madhya Pradesh',
  'Rajasthan',
  'Maharashtra',
  'Bihar',
  'Uttarakhand',
  'Gujarat',
  'Andhra Pradesh',
  'Tamil Nadu',
  'Karnataka',
  'West Bengal',
];

const CropFilters = ({ filters, onChange }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onChange({ type: 'All', minPrice: '', maxPrice: '', state: 'All', district: '' });
  };

  const hasActiveFilters =
    filters.type !== 'All' ||
    filters.state !== 'All' ||
    filters.minPrice !== '' ||
    filters.maxPrice !== '' ||
    filters.district !== '';

  return (
    <div className="bg-white rounded-2xl shadow p-4 flex flex-wrap gap-4 items-end">

      {/* Crop Type */}
      <div className="flex flex-col gap-1 min-w-[140px]">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Crop Type
        </label>
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          value={filters.type}
          onChange={(e) => handleChange('type', e.target.value)}
        >
          {CROP_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Min Price */}
      <div className="flex flex-col gap-1 min-w-[120px]">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Min Price (₹)
        </label>
        <input
          type="number"
          placeholder="0"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          value={filters.minPrice}
          onChange={(e) => handleChange('minPrice', e.target.value)}
        />
      </div>

      {/* Max Price */}
      <div className="flex flex-col gap-1 min-w-[120px]">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Max Price (₹)
        </label>
        <input
          type="number"
          placeholder="99999"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          value={filters.maxPrice}
          onChange={(e) => handleChange('maxPrice', e.target.value)}
        />
      </div>

      {/* State */}
      <div className="flex flex-col gap-1 min-w-[160px]">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          State
        </label>
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          value={filters.state}
          onChange={(e) => handleChange('state', e.target.value)}
        >
          {STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* District */}
      <div className="flex flex-col gap-1 min-w-[140px]">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          District
        </label>
        <input
          type="text"
          placeholder="e.g. Haridwar"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          value={filters.district}
          onChange={(e) => handleChange('district', e.target.value)}
        />
      </div>

      {/* Reset */}
      {hasActiveFilters && (
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

export default CropFilters;
