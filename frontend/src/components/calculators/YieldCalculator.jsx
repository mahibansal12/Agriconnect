// src/components/calculators/YieldCalculator.jsx
import { useState } from 'react';

const CROP_YIELDS = {
  Wheat:     { low: 12, avg: 20, high: 28, unit: 'qtl/acre' },
  Rice:      { low: 12, avg: 18, high: 24, unit: 'qtl/acre' },
  Maize:     { low: 15, avg: 22, high: 30, unit: 'qtl/acre' },
  Cotton:    { low: 5,  avg: 9,  high: 14, unit: 'qtl/acre' },
  Soybean:   { low: 7,  avg: 12, high: 16, unit: 'qtl/acre' },
  Sugarcane: { low: 200, avg: 300, high: 400, unit: 'qtl/acre' },
  Mustard:   { low: 4,  avg: 7,  high: 10, unit: 'qtl/acre' },
  Groundnut: { low: 5,  avg: 9,  high: 12, unit: 'qtl/acre' },
  Potato:    { low: 60, avg: 100, high: 150, unit: 'qtl/acre' },
  Onion:     { low: 50, avg: 90, high: 130, unit: 'qtl/acre' },
  Tomato:    { low: 80, avg: 140, high: 200, unit: 'qtl/acre' },
  Chickpea:  { low: 5,  avg: 9,  high: 13, unit: 'qtl/acre' },
};

const MANAGEMENT = { poor: 0.7, average: 1.0, good: 1.2, excellent: 1.4 };

const YieldCalculator = () => {
  const [form, setForm] = useState({
    crop: '', area: '', management: 'average', irrigated: 'yes',
  });
  const [result, setResult] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const calculate = (e) => {
    e.preventDefault();
    const { crop, area, management, irrigated } = form;
    if (!crop || !area || Number(area) <= 0) return;

    const base       = CROP_YIELDS[crop];
    const mgmtFactor = MANAGEMENT[management] || 1;
    const irrFactor  = irrigated === 'yes' ? 1.15 : 0.85;

    const low  = Math.round(base.low  * mgmtFactor * irrFactor * area);
    const avg  = Math.round(base.avg  * mgmtFactor * irrFactor * area);
    const high = Math.round(base.high * mgmtFactor * irrFactor * area);

    setResult({ low, avg, high, unit: 'qtl', crop, area });
  };

  const inputClass =
    'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-800">📦 Yield Estimator</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Estimate your expected harvest before the season
        </p>
      </div>

      <form onSubmit={calculate} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Crop */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Crop <span className="text-red-400">*</span>
            </label>
            <select name="crop" value={form.crop} onChange={handleChange} required className={inputClass}>
              <option value="">Select crop</option>
              {Object.keys(CROP_YIELDS).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Land Area (acres) <span className="text-red-400">*</span>
            </label>
            <input
              name="area"
              type="number"
              min="0.1"
              step="0.1"
              value={form.area}
              onChange={handleChange}
              placeholder="e.g. 2.5"
              required
              className={inputClass}
            />
          </div>

          {/* Management */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Farm Management Level
            </label>
            <select name="management" value={form.management} onChange={handleChange} className={inputClass}>
              <option value="poor">Poor (minimal inputs)</option>
              <option value="average">Average (standard)</option>
              <option value="good">Good (optimised)</option>
              <option value="excellent">Excellent (precision farming)</option>
            </select>
          </div>

          {/* Irrigated */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Irrigation
            </label>
            <select name="irrigated" value={form.irrigated} onChange={handleChange} className={inputClass}>
              <option value="yes">Irrigated</option>
              <option value="no">Rain-fed only</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg text-sm font-semibold transition"
        >
          📦 Calculate Yield
        </button>
      </form>

      {/* Result */}
      {result && (
        <div className="mt-6 border-t pt-5 space-y-4">
          <h3 className="text-sm font-bold text-gray-700">
            Estimated Yield for {result.crop} ({result.area} acres)
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Conservative',  value: result.low,  color: 'text-orange-600', bg: 'bg-orange-50'  },
              { label: 'Expected',      value: result.avg,  color: 'text-green-700',  bg: 'bg-green-50'   },
              { label: 'Optimistic',    value: result.high, color: 'text-blue-700',   bg: 'bg-blue-50'    },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">qtl</p>
                <p className="text-[10px] text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center">
            * Estimates based on average regional data. Actual yield may vary.
          </p>
        </div>
      )}
    </div>
  );
};

export default YieldCalculator;
