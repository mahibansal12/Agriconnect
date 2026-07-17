// src/components/mandi/Highlights.jsx
import React from 'react';

const Card = ({ title, icon, val, desc, change, isUp }) => (
  <div style={{
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
      {change && (
        <span style={{ fontWeight: 800, color: isUp ? '#16a34a' : '#ef4444' }}>{change}</span>
      )}
    </div>
  </div>
);

/**
 * `data` is the memoized object computed in MandiRates.jsx from the *currently
 * selected mandi's* own rates (the same rows shown in the table below), so this
 * component never needs to know about mandis, prices, or trends on its own —
 * it just renders whatever it's handed, with graceful fallbacks when a figure
 * (e.g. a positive "top gainer") isn't available for the current selection.
 */
const Highlights = ({ data, reduxMandi }) => {
  const highest = data?.highest;
  const lowest = data?.lowest;
  const mostArrivals = data?.mostArrivals;
  const topGainer = data?.topGainer;

  const cards = [
    {
      title: 'Highest Price',
      icon: '📈',
      val: highest ? `₹${highest.price?.toLocaleString('en-IN')}` : '—',
      desc: highest ? highest.crop : 'No data',
      change: highest?.change ? `${highest.change.isUp ? '↑' : '↓'} ${highest.change.value}` : null,
      isUp: highest?.change?.isUp,
    },
    {
      title: 'Lowest Price',
      icon: '📉',
      val: lowest ? `₹${lowest.price?.toLocaleString('en-IN')}` : '—',
      desc: lowest ? lowest.crop : 'No data',
      change: lowest?.change ? `${lowest.change.isUp ? '↑' : '↓'} ${lowest.change.value}` : null,
      isUp: lowest?.change?.isUp,
    },
    {
      title: 'Most Arrivals',
      icon: '🌾',
      val: mostArrivals ? `${mostArrivals.qty} Qtl` : '—',
      desc: mostArrivals ? mostArrivals.crop : 'No data',
      change: null,
      isUp: null,
    },
    {
      title: 'Top Gainer',
      icon: '🔥',
      val: topGainer ? `↑ ${topGainer.change.value}` : 'No gainers',
      desc: topGainer ? topGainer.crop : 'today',
      change: topGainer ? 'vs yesterday' : null,
      isUp: true,
    },
  ];

  return (
    <div style={{ marginBottom: '28px' }}>
      <h2 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, color: '#14532d' }}>
        Today's Market Highlights - {reduxMandi || 'Sri Madhopur Mandi'}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {cards.map((c) => <Card key={c.title} {...c} />)}
      </div>
    </div>
  );
};

export default Highlights;