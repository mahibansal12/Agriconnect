// src/components/mandi/Highlights.jsx
import React from 'react';

const Highlights = ({
  highlights,
  reduxMandi,
  highPrice,
  highCrop,
  lowPrice,
  lowCrop,
}) => {
  return (
    <div style={{ marginBottom: '28px' }}>
      <h2 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, color: '#14532d' }}>
        Today's Market Highlights - {reduxMandi || 'Sri Madhopur Mandi'}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {[
          { title: 'Highest Price', val: `₹${highPrice?.toLocaleString()}`, desc: highCrop, change: '↑ 3.4%', isUp: true, icon: '📈' },
          { title: 'Lowest Price', val: `₹${lowPrice?.toLocaleString()}`, desc: lowCrop, change: '↓ 2.1%', isUp: false, icon: '📉' },
          { title: 'Most Arrivals', val: '520 Qtl', desc: 'Wheat', change: '—', isUp: null, icon: '🌾' },
          { title: 'Top Gainer', val: '↑ 6.8%', desc: 'Guar Seed', change: 'vs yesterday', isUp: true, icon: '🔥' },
        ].map(({ title, val, desc, change, isUp, icon }) => (
          <div key={title} style={{
            background: '#fff',
            border: '2.5px solid #d1fae5',
            borderRadius: '18px',
            padding: '16px 20px',
            boxShadow: '0 3px 12px rgba(22,163,74,0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <strong style={{ fontSize: '20px', fontWeight: 900, color: '#111827' }}>{val}</strong>
                <span style={{ fontSize: '22px' }}>{icon}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', borderTop: '1px solid #f0fdf4', paddingTop: '8px', marginTop: '4px' }}>
              <span style={{ fontWeight: 700, color: '#374151' }}>{desc}</span>
              {change !== '—' && (
                <span style={{ fontWeight: 800, color: isUp ? '#16a34a' : '#ef4444' }}>{change}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Highlights;
