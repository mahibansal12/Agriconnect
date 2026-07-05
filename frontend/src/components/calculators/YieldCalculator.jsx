// src/components/calculators/YieldCalculator.jsx
import { useState } from 'react';

const CROP_YIELDS = {
  Wheat: { low: 12, avg: 20, high: 28, unit: 'qtl/acre', icon: '🌾' },
  Rice: { low: 12, avg: 18, high: 24, unit: 'qtl/acre', icon: '🌾' },
  Maize: { low: 15, avg: 22, high: 30, unit: 'qtl/acre', icon: '🌽' },
  Cotton: { low: 5, avg: 9, high: 14, unit: 'qtl/acre', icon: '🌿' },
  Soybean: { low: 7, avg: 12, high: 16, unit: 'qtl/acre', icon: '🌱' },
  Sugarcane: { low: 200, avg: 300, high: 400, unit: 'qtl/acre', icon: '🎋' },
  Mustard: { low: 4, avg: 7, high: 10, unit: 'qtl/acre', icon: '🌻' },
  Groundnut: { low: 5, avg: 9, high: 12, unit: 'qtl/acre', icon: '🥜' },
  Potato: { low: 60, avg: 100, high: 150, unit: 'qtl/acre', icon: '🥔' },
  Onion: { low: 50, avg: 90, high: 130, unit: 'qtl/acre', icon: '🧅' },
  Tomato: { low: 80, avg: 140, high: 200, unit: 'qtl/acre', icon: '🍅' },
  Chickpea: { low: 5, avg: 9, high: 13, unit: 'qtl/acre', icon: '🫘' },
};

const MANAGEMENT = { poor: 0.7, average: 1.0, good: 1.2, excellent: 1.4 };

const managementLabels = {
  poor: { label: 'Poor', desc: 'Minimal inputs', color: '#ef4444', bg: '#fee2e2', border: '#fca5a5' },
  average: { label: 'Average', desc: 'Standard practice', color: '#f59e0b', bg: '#fef3c7', border: '#fcd34d' },
  good: { label: 'Good', desc: 'Optimised inputs', color: '#16a34a', bg: '#dcfce7', border: '#86efac' },
  excellent: { label: 'Excellent', desc: 'Precision farming', color: '#1d4ed8', bg: '#dbeafe', border: '#93c5fd' },
};

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  border: '2px solid #d1fae5', borderRadius: '10px',
  padding: '11px 14px', fontSize: '14px',
  outline: 'none', fontFamily: 'inherit', color: '#1f2937',
  background: '#fff', transition: 'border 0.2s',
};

const YieldCalculator = () => {
  const [form, setForm] = useState({ crop: '', area: '', management: 'average', irrigated: 'yes' });
  const [result, setResult] = useState(null);

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setResult(null); };

  const calculate = (e) => {
    e.preventDefault();
    const { crop, area, management, irrigated } = form;
    if (!crop || !area || Number(area) <= 0) return;
    const base = CROP_YIELDS[crop];
    const mgmt = MANAGEMENT[management] || 1;
    const irr = irrigated === 'yes' ? 1.15 : 0.85;
    setResult({
      low: Math.round(base.low * mgmt * irr * Number(area)),
      avg: Math.round(base.avg * mgmt * irr * Number(area)),
      high: Math.round(base.high * mgmt * irr * Number(area)),
      crop, area,
    });
  };

  const focusStyle = (e) => { e.target.style.border = '2px solid #16a34a'; };
  const blurStyle = (e) => { e.target.style.border = '2px solid #d1fae5'; };

  return (
    <div style={{ background: '#fff', borderRadius: '22px', border: '2px solid #bbf7d0', boxShadow: '0 6px 28px rgba(22,163,74,0.10)', overflow: 'hidden' }}>
      {/* Card header */}
      <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', borderBottom: '1.5px solid #bbf7d0', padding: '20px 26px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '13px', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: '0 4px 14px rgba(22,163,74,0.35)' }}>📦</div>
        <div>
          <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#14532d' }}>Yield Estimator</h2>
          <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#4b7a5c' }}>Estimate your expected harvest based on crop, area & management</p>
        </div>
      </div>

      <div style={{ padding: '26px' }}>
        <form onSubmit={calculate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '22px' }}>

            {/* Crop */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🌾 Crop <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select name="crop" value={form.crop} onChange={handleChange} required style={inputStyle}
                onFocus={focusStyle} onBlur={blurStyle}>
                <option value="">Select a crop</option>
                {Object.entries(CROP_YIELDS).map(([c, d]) => (
                  <option key={c} value={c}>{d.icon} {c}</option>
                ))}
              </select>
            </div>

            {/* Area */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                📐 Land Area (acres) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input name="area" type="number" min="0.1" step="0.1" value={form.area}
                onChange={handleChange} placeholder="e.g. 2.5" required style={inputStyle}
                onFocus={focusStyle} onBlur={blurStyle} />
            </div>

            {/* Management level — 4 clickable pills */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🌿 Farm Management Level
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
                {Object.entries(managementLabels).map(([key, meta]) => {
                  const active = form.management === key;
                  return (
                    <button key={key} type="button"
                      onClick={() => { setForm({ ...form, management: key }); setResult(null); }}
                      style={{
                        padding: '12px 8px', borderRadius: '12px', cursor: 'pointer', outline: 'none',
                        border: active ? `2px solid ${meta.color}` : '2px solid #e5e7eb',
                        background: active ? meta.bg : '#fff',
                        transition: 'all 0.18s',
                        boxShadow: active ? `0 4px 14px ${meta.border}66` : 'none',
                      }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '12px', color: active ? meta.color : '#374151' }}>{meta.label}</p>
                      <p style={{ margin: '3px 0 0', fontSize: '10px', color: active ? meta.color : '#9ca3af' }}>{meta.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Irrigation */}
            <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '0', gridColumn: '1 / -1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                💧 Irrigation
              </label>
              {[{ val: 'yes', label: 'Irrigated', icon: '💧', desc: '+15% yield boost' }, { val: 'no', label: 'Rain-fed Only', icon: '🌧️', desc: '-15% yield factor' }].map(opt => {
                const active = form.irrigated === opt.val;
                return (
                  <button key={opt.val} type="button"
                    onClick={() => { setForm({ ...form, irrigated: opt.val }); setResult(null); }}
                    style={{
                      padding: '13px 16px', borderRadius: '12px', cursor: 'pointer', outline: 'none',
                      border: active ? '2px solid #16a34a' : '2px solid #e5e7eb',
                      background: active ? '#dcfce7' : '#fff',
                      display: 'flex', alignItems: 'center', gap: '10px',
                      boxShadow: active ? '0 4px 14px #86efac66' : 'none',
                      transition: 'all 0.18s',
                    }}>
                    <span style={{ fontSize: '20px' }}>{opt.icon}</span>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: active ? '#14532d' : '#374151' }}>{opt.label}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '10px', color: active ? '#4b7a5c' : '#9ca3af' }}>{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button type="submit" style={{
            width: '100%', padding: '14px',
            background: 'linear-gradient(135deg,#14532d,#16a34a)',
            color: '#fff', border: 'none', borderRadius: '12px',
            fontSize: '15px', fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(22,163,74,0.35)',
            fontFamily: 'inherit', transition: 'transform 0.15s, box-shadow 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(22,163,74,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(22,163,74,0.35)'; }}
          >
            📦 Calculate Yield
          </button>
        </form>

        {/* Result */}
        {result && (
          <div style={{ marginTop: '26px', paddingTop: '24px', borderTop: '1.5px solid #f0fdf4' }}>
            <p style={{ margin: '0 0 14px', fontWeight: 800, fontSize: '14px', color: '#14532d' }}>
              📊 Estimated Yield — {result.crop} · {result.area} acres
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '16px' }}>
              {[
                { label: 'Conservative', value: result.low, color: '#c2410c', bg: '#ffedd5', border: '#fdba74', icon: '📉' },
                { label: 'Expected', value: result.avg, color: '#16a34a', bg: '#dcfce7', border: '#86efac', icon: '📊' },
                { label: 'Optimistic', value: result.high, color: '#1d4ed8', bg: '#dbeafe', border: '#93c5fd', icon: '📈' },
              ].map(({ label, value, color, bg, border, icon }) => (
                <div key={label} style={{ background: bg, border: `2px solid ${border}`, borderRadius: '16px', padding: '18px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', marginBottom: '6px' }}>{icon}</div>
                  <p style={{ margin: 0, fontSize: '26px', fontWeight: 900, color }}>{value}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6b7280' }}>quintals</p>
                  <p style={{ margin: '6px 0 0', fontSize: '11px', fontWeight: 700, color }}>{label}</p>
                </div>
              ))}
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>
              * Estimates based on average regional data. Actual yield may vary.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default YieldCalculator;
