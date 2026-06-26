// src/components/calculators/ProfitCalculator.jsx
import { useState } from 'react';

const COST_PRESETS = {
  Wheat:     { seeds: 1800,  fertiliser: 3500,  pesticide: 1200, labour: 4000, irrigation: 2000, misc: 1000 },
  Rice:      { seeds: 2500,  fertiliser: 4000,  pesticide: 1800, labour: 6000, irrigation: 3000, misc: 1200 },
  Maize:     { seeds: 3500,  fertiliser: 3000,  pesticide: 1000, labour: 3500, irrigation: 1500, misc: 800  },
  Cotton:    { seeds: 8000,  fertiliser: 5000,  pesticide: 4000, labour: 7000, irrigation: 2500, misc: 1500 },
  Soybean:   { seeds: 3000,  fertiliser: 2500,  pesticide: 1500, labour: 3000, irrigation: 1000, misc: 700  },
  Sugarcane: { seeds: 12000, fertiliser: 8000,  pesticide: 2000, labour: 10000, irrigation: 5000, misc: 2000 },
  Mustard:   { seeds: 1200,  fertiliser: 2800,  pesticide: 800,  labour: 2500, irrigation: 1200, misc: 600  },
  Groundnut: { seeds: 5000,  fertiliser: 2500,  pesticide: 1200, labour: 4000, irrigation: 1500, misc: 800  },
  Potato:    { seeds: 15000, fertiliser: 6000,  pesticide: 3000, labour: 8000, irrigation: 3500, misc: 1500 },
  Tomato:    { seeds: 4000,  fertiliser: 5000,  pesticide: 3500, labour: 10000, irrigation: 4000, misc: 2000 },
};

const COST_LABELS = {
  seeds: '🌱 Seeds / Planting Material',
  fertiliser: '🧪 Fertilisers',
  pesticide: '🐛 Pesticides / Herbicides',
  labour: '👷 Labour',
  irrigation: '💧 Irrigation',
  misc: '📦 Miscellaneous',
};

const ProfitCalculator = () => {
  const [crop,     setCrop]     = useState('');
  const [area,     setArea]     = useState('');
  const [price,    setPrice]    = useState('');
  const [yield_,   setYield]    = useState('');
  const [costs,    setCosts]    = useState({
    seeds: '', fertiliser: '', pesticide: '', labour: '', irrigation: '', misc: '',
  });
  const [result,   setResult]   = useState(null);
  const [usedPreset, setUsedPreset] = useState(false);

  const loadPreset = () => {
    if (!crop) return;
    const preset = COST_PRESETS[crop];
    if (!preset) return;
    // Preset is per acre; multiply by area if given
    const mult = Number(area) || 1;
    setCosts(
      Object.fromEntries(
        Object.entries(preset).map(([k, v]) => [k, String(Math.round(v * mult))])
      )
    );
    setUsedPreset(true);
  };

  const handleCostChange = (key, val) => {
    setCosts({ ...costs, [key]: val });
    setUsedPreset(false);
  };

  const calculate = (e) => {
    e.preventDefault();

    const totalCost    = Object.values(costs).reduce((s, v) => s + (Number(v) || 0), 0);
    const totalRevenue = (Number(yield_) || 0) * (Number(price) || 0);
    const profit       = totalRevenue - totalCost;
    const roi          = totalCost > 0 ? ((profit / totalCost) * 100).toFixed(1) : 0;
    const perAcre      = Number(area) > 0 ? Math.round(profit / Number(area)) : profit;

    setResult({ totalCost, totalRevenue, profit, roi, perAcre });
  };

  const inputClass =
    'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-800">💰 Profit Calculator</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Estimate your net profit and ROI before investing
        </p>
      </div>

      <form onSubmit={calculate} className="space-y-5">

        {/* Basic info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
            <select
              value={crop}
              onChange={(e) => { setCrop(e.target.value); setUsedPreset(false); setResult(null); }}
              className={inputClass}
            >
              <option value="">Select crop</option>
              {Object.keys(COST_PRESETS).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Land Area (acres)</label>
            <input
              type="number" min="0.1" step="0.1"
              value={area}
              onChange={(e) => { setArea(e.target.value); setUsedPreset(false); }}
              placeholder="e.g. 2"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Yield (qtl) <span className="text-red-400">*</span>
            </label>
            <input
              type="number" min="0" required
              value={yield_}
              onChange={(e) => setYield(e.target.value)}
              placeholder="e.g. 40"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Market Price (₹/qtl) <span className="text-red-400">*</span>
            </label>
            <input
              type="number" min="0" required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 2200"
              className={inputClass}
            />
          </div>
        </div>

        {/* Cost inputs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700">Cost Breakdown (₹)</p>
            {crop && (
              <button
                type="button"
                onClick={loadPreset}
                className="text-xs text-orange-600 hover:underline font-medium"
              >
                {usedPreset ? '✅ Preset loaded' : '⚡ Auto-fill preset for ' + crop}
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(COST_LABELS).map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs text-gray-500 mb-1">{label}</label>
                <input
                  type="number"
                  min="0"
                  value={costs[key]}
                  onChange={(e) => handleCostChange(key, e.target.value)}
                  placeholder="₹0"
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg text-sm font-semibold transition"
        >
          💰 Calculate Profit
        </button>
      </form>

      {/* Result */}
      {result && (
        <div className="mt-6 border-t pt-5 space-y-4">
          {/* Main P&L */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Revenue', value: result.totalRevenue, color: 'text-green-700',  bg: 'bg-green-50'  },
              { label: 'Total Cost',    value: result.totalCost,    color: 'text-red-500',    bg: 'bg-red-50'    },
              { label: 'Net Profit',    value: result.profit,       color: result.profit >= 0 ? 'text-green-700' : 'text-red-500', bg: result.profit >= 0 ? 'bg-green-50' : 'bg-red-50' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                <p className={`text-lg font-bold ${color}`}>
                  ₹{Math.abs(value).toLocaleString('en-IN')}
                  {value < 0 && <span className="text-sm ml-0.5">loss</span>}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* ROI + Per acre */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className={`text-xl font-bold ${Number(result.roi) >= 0 ? 'text-blue-700' : 'text-red-500'}`}>
                {result.roi}%
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Return on Investment</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <p className={`text-xl font-bold ${result.perAcre >= 0 ? 'text-purple-700' : 'text-red-500'}`}>
                ₹{Math.abs(result.perAcre).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {result.perAcre >= 0 ? 'Profit' : 'Loss'} per Acre
              </p>
            </div>
          </div>

          {/* Verdict */}
          <div className={`rounded-xl px-4 py-3 text-sm font-medium text-center ${
            result.profit >= 0 && Number(result.roi) >= 20
              ? 'bg-green-100 text-green-800'
              : result.profit >= 0
              ? 'bg-yellow-50 text-yellow-800'
              : 'bg-red-50 text-red-700'
          }`}>
            {result.profit >= 0 && Number(result.roi) >= 20
              ? '✅ Looks profitable! Good investment decision.'
              : result.profit >= 0
              ? '⚠️ Marginally profitable. Optimise costs or price.'
              : '❌ Currently a loss. Review your cost structure.'}
          </div>

          <p className="text-xs text-gray-400 text-center">
            * Calculations are estimates. Market prices may vary at harvest time.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfitCalculator;
