// src/components/mandi/CompareDrawer.jsx
import React from 'react';

const CompareDrawer = ({
  compareCommodity,
  setCompareCommodity,
  comparisonList,
  availableCrops = [],
}) => {
  // Only ever offer crops that are actually sold at the selected mandi
  // (derived live from that mandi's rates table), so the dropdown can never
  // point at a crop with no data behind it. Falls back to whatever crop is
  // currently selected so the dropdown isn't blank while data is loading.
  const cropOptions = availableCrops.length
    ? availableCrops
    : (compareCommodity ? [compareCommodity] : []);
  return (
    <div style={{
      background: '#fff',
      borderRadius: '20px',
      border: '2px solid #bbf7d0',
      boxShadow: '0 4px 20px rgba(22,163,74,0.10)',
      padding: '22px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 850, color: '#14532d' }}>Compare Mandis</h3>
          <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#9ca3af' }}>Select crop to compare rates across different markets</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={compareCommodity}
            onChange={(e) => setCompareCommodity(e.target.value)}
            disabled={!cropOptions.length}
            style={{
              padding: '8px 10px',
              border: '1.5px solid #bbf7d0',
              borderRadius: '8px',
              background: '#fff',
              outline: 'none',
              fontWeight: 600,
              fontSize: '12px',
              color: '#374151',
              cursor: cropOptions.length ? 'pointer' : 'not-allowed'
            }}
          >
            {cropOptions.length ? (
              cropOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))
            ) : (
              <option value="">No crops available</option>
            )}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        {comparisonList.map(({ name, price, trend, isUp }) => (
          <div key={name} style={{
            border: '1.5px solid #d1fae5',
            borderRadius: '12px',
            padding: '14px 16px',
            background: '#fcfefd',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{name}</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <strong style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>
                {typeof price === 'number' ? `₹${price.toLocaleString()}` : price}
              </strong>
              <span style={{ fontSize: '11px', fontWeight: 800, color: isUp === null || isUp === undefined ? '#9ca3af' : (isUp ? '#16a34a' : '#ef4444') }}>
                {trend}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompareDrawer;