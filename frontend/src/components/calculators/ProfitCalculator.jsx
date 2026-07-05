// src/components/calculators/ProfitCalculator.jsx
import { useState } from 'react';

const COST_PRESETS = {
  Wheat: { seeds: 1800, fertiliser: 3500, pesticide: 1200, labour: 4000, irrigation: 2000, misc: 1000 },
  Rice: { seeds: 2500, fertiliser: 4000, pesticide: 1800, labour: 6000, irrigation: 3000, misc: 1200 },
  Maize: { seeds: 3500, fertiliser: 3000, pesticide: 1000, labour: 3500, irrigation: 1500, misc: 800 },
  Cotton: { seeds: 8000, fertiliser: 5000, pesticide: 4000, labour: 7000, irrigation: 2500, misc: 1500 },
  Soybean: { seeds: 3000, fertiliser: 2500, pesticide: 1500, labour: 3000, irrigation: 1000, misc: 700 },
  Sugarcane: { seeds: 12000, fertiliser: 8000, pesticide: 2000, labour: 10000, irrigation: 5000, misc: 2000 },
  Mustard: { seeds: 1200, fertiliser: 2800, pesticide: 800, labour: 2500, irrigation: 1200, misc: 600 },
  Groundnut: { seeds: 5000, fertiliser: 2500, pesticide: 1200, labour: 4000, irrigation: 1500, misc: 800 },
  Potato: { seeds: 15000, fertiliser: 6000, pesticide: 3000, labour: 8000, irrigation: 3500, misc: 1500 },
  Tomato: { seeds: 4000, fertiliser: 5000, pesticide: 3500, labour: 10000, irrigation: 4000, misc: 2000 },
};

const COST_LABELS = {
  seeds: { label: 'Seeds / Planting Material', icon: '🌱' },
  fertiliser: { label: 'Fertilisers', icon: '🧪' },
  pesticide: { label: 'Pesticides / Herbicides', icon: '🐛' },
  labour: { label: 'Labour', icon: '👷' },
  irrigation: { label: 'Irrigation', icon: '💧' },
  misc: { label: 'Miscellaneous', icon: '📦' },
};

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  border: '2px solid #d1fae5', borderRadius: '10px',
  padding: '11px 14px', fontSize: '14px',
  outline: 'none', fontFamily: 'inherit', color: '#1f2937',
  background: '#fff', transition: 'border 0.2s',
};

const ProfitCalculator = () => {
  const [crop, setCrop] = useState('');
  const [area, setArea] = useState('');
  const [price, setPrice] = useState('');
  const [yield_, setYield] = useState('');
  const [costs, setCosts] = useState({ seeds: '', fertiliser: '', pesticide: '', labour: '', irrigation: '', misc: '' });
  const [result, setResult] = useState(null);
  const [usedPreset, setUsedPreset] = useState(false);

  const focusStyle = (e) => { e.target.style.border = '2px solid #f97316'; };
  const blurStyle = (e) => { e.target.style.border = '2px solid #d1fae5'; };

  const loadPreset = () => {
    if (!crop) return;
    const preset = COST_PRESETS[crop];
    if (!preset) return;
    const mult = Number(area) || 1;
    setCosts(Object.fromEntries(Object.entries(preset).map(([k, v]) => [k, String(Math.round(v * mult))])));
    setUsedPreset(true);
  };

  const handleCostChange = (key, val) => { setCosts({ ...costs, [key]: val }); setUsedPreset(false); };

  const calculate = (e) => {
    e.preventDefault();
    const totalCost = Object.values(costs).reduce((s, v) => s + (Number(v) || 0), 0);
    const totalRevenue = (Number(yield_) || 0) * (Number(price) || 0);
    const profit = totalRevenue - totalCost;
    const roi = totalCost > 0 ? ((profit / totalCost) * 100).toFixed(1) : 0;
    const perAcre = Number(area) > 0 ? Math.round(profit / Number(area)) : profit;
    setResult({ totalCost, totalRevenue, profit, roi, perAcre });
  };

  return (
    <div style={{ background: '#fff', borderRadius: '22px', border: '2px solid #fed7aa', boxShadow: '0 6px 28px rgba(249,115,22,0.10)', overflow: 'hidden' }}>
      {/* Card header */}
      <div style={{ background: 'linear-gradient(135deg,#fff7ed,#ffedd5)', borderBottom: '1.5px solid #fed7aa', padding: '20px 26px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '13px', background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: '0 4px 14px rgba(249,115,22,0.35)' }}>💰</div>
        <div>
          <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#7c2d12' }}>Profit Calculator</h2>
          <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#9a3412' }}>Estimate your net profit and ROI before investing in the season</p>
        </div>
      </div>

      <div style={{ padding: '26px' }}>
        <form onSubmit={calculate}>

          {/* Basic info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '22px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🌾 Crop</label>
              <select value={crop} onChange={(e) => { setCrop(e.target.value); setUsedPreset(false); setResult(null); }} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}>
                <option value="">Select crop</option>
                {Object.keys(COST_PRESETS).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📐 Land Area (acres)</label>
              <input type="number" min="0.1" step="0.1" value={area}
                onChange={(e) => { setArea(e.target.value); setUsedPreset(false); }}
                placeholder="e.g. 2" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📦 Expected Yield (qtl) <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="number" min="0" required value={yield_}
                onChange={(e) => setYield(e.target.value)}
                placeholder="e.g. 40" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💹 Market Price (₹/qtl) <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="number" min="0" required value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 2200" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
          </div>

          {/* Cost breakdown */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💸 Cost Breakdown (₹)</p>
              {crop && (
                <button type="button" onClick={loadPreset} style={{
                  fontSize: '11px', fontWeight: 700, cursor: 'pointer', outline: 'none',
                  padding: '5px 14px', borderRadius: '999px',
                  border: usedPreset ? '1.5px solid #86efac' : '1.5px solid #fdba74',
                  background: usedPreset ? '#dcfce7' : '#fff7ed',
                  color: usedPreset ? '#166534' : '#c2410c',
                  transition: 'all 0.15s',
                }}>
                  {usedPreset ? '✅ Preset loaded' : `⚡ Auto-fill for ${crop}`}
                </button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {Object.entries(COST_LABELS).map(([key, { label, icon }]) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '6px', fontWeight: 600 }}>{icon} {label}</label>
                  <input type="number" min="0" value={costs[key]}
                    onChange={(e) => handleCostChange(key, e.target.value)}
                    placeholder="₹0" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
              ))}
            </div>
          </div>

          <button type="submit" style={{
            width: '100%', padding: '14px',
            background: 'linear-gradient(135deg,#9a3412,#f97316)',
            color: '#fff', border: 'none', borderRadius: '12px',
            fontSize: '15px', fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(249,115,22,0.35)',
            fontFamily: 'inherit', transition: 'transform 0.15s, box-shadow 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(249,115,22,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(249,115,22,0.35)'; }}
          >
            💰 Calculate Profit
          </button>
        </form>

        {/* Result */}
        {result && (
          <div style={{ marginTop: '26px', paddingTop: '24px', borderTop: '1.5px solid #fff7ed' }}>
            <p style={{ margin: '0 0 14px', fontWeight: 800, fontSize: '14px', color: '#7c2d12' }}>📊 Profit & Loss Summary</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '12px' }}>
              {[
                { label: 'Total Revenue', value: result.totalRevenue, color: '#166534', bg: '#dcfce7', border: '#86efac', icon: '📈' },
                { label: 'Total Cost', value: result.totalCost, color: '#991b1b', bg: '#fee2e2', border: '#fca5a5', icon: '📉' },
                { label: 'Net Profit', value: result.profit, color: result.profit >= 0 ? '#166534' : '#991b1b', bg: result.profit >= 0 ? '#dcfce7' : '#fee2e2', border: result.profit >= 0 ? '#86efac' : '#fca5a5', icon: result.profit >= 0 ? '✅' : '❌' },
              ].map(({ label, value, color, bg, border, icon }) => (
                <div key={label} style={{ background: bg, border: `2px solid ${border}`, borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', marginBottom: '6px' }}>{icon}</div>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: 900, color }}>₹{Math.abs(value).toLocaleString('en-IN')}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '10px', color: '#6b7280' }}>{label}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div style={{ background: '#dbeafe', border: '2px solid #93c5fd', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', marginBottom: '6px' }}>📊</div>
                <p style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: Number(result.roi) >= 0 ? '#1d4ed8' : '#991b1b' }}>{result.roi}%</p>
                <p style={{ margin: '4px 0 0', fontSize: '10px', color: '#6b7280' }}>Return on Investment</p>
              </div>
              <div style={{ background: '#ede9fe', border: '2px solid #c4b5fd', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', marginBottom: '6px' }}>🌾</div>
                <p style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: result.perAcre >= 0 ? '#5b21b6' : '#991b1b' }}>₹{Math.abs(result.perAcre).toLocaleString('en-IN')}</p>
                <p style={{ margin: '4px 0 0', fontSize: '10px', color: '#6b7280' }}>{result.perAcre >= 0 ? 'Profit' : 'Loss'} per Acre</p>
              </div>
            </div>

            {/* Verdict */}
            <div style={{
              borderRadius: '14px', padding: '14px 18px', textAlign: 'center', fontSize: '13px', fontWeight: 700,
              background: result.profit >= 0 && Number(result.roi) >= 20 ? '#dcfce7' : result.profit >= 0 ? '#fef3c7' : '#fee2e2',
              color: result.profit >= 0 && Number(result.roi) >= 20 ? '#166534' : result.profit >= 0 ? '#92400e' : '#991b1b',
              border: `2px solid ${result.profit >= 0 && Number(result.roi) >= 20 ? '#86efac' : result.profit >= 0 ? '#fcd34d' : '#fca5a5'}`,
            }}>
              {result.profit >= 0 && Number(result.roi) >= 20
                ? '✅ Looks profitable! Good investment decision.'
                : result.profit >= 0
                  ? '⚠️ Marginally profitable. Try optimising costs or market price.'
                  : '❌ Currently a loss. Review your cost structure before proceeding.'}
            </div>

            <p style={{ margin: '12px 0 0', fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>
              * Calculations are estimates. Market prices may vary at harvest time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfitCalculator;
