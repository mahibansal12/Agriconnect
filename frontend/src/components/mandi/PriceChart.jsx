// src/components/mandi/PriceChart.jsx
import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff',
      border: '1.5px solid #bbf7d0',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(22,163,74,0.08)',
      padding: '10px 14px',
      fontSize: '12px'
    }}>
      <p style={{ margin: 0, color: '#9ca3af', fontWeight: 500 }}>{label}</p>
      <p style={{ margin: '4px 0 0', fontWeight: 800, color: '#14532d' }}>
        ₹{payload[0].value?.toLocaleString('en-IN')}/qtl
      </p>
    </div>
  );
};

const PriceChart = ({ crop = '', history = [], loading = false }) => {
  const [timeframe, setTimeframe] = useState(7); // default 7 days

  if (loading) {
    return (
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        border: '2px solid #bbf7d0',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '320px',
        boxShadow: '0 4px 20px rgba(22,163,74,0.10)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#9ca3af' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #f3f4f6', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ margin: 0, fontSize: '12px', fontWeight: 600 }}>Loading trend chart...</p>
        </div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        border: '2px solid #bbf7d0',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '320px',
        color: '#9ca3af',
        boxShadow: '0 4px 20px rgba(22,163,74,0.10)'
      }}>
        <span style={{ fontSize: '40px', marginBottom: '8px' }}>📈</span>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#4b7a5c' }}>
          {crop ? `No Price History for ${crop}` : 'Select a crop to view price trend'}
        </p>
      </div>
    );
  }

  const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
  const data = sortedHistory.slice(-timeframe);

  const prices = data.map((d) => d.price);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const avgPrice = prices.length ? Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length) : 0;

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
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 850, color: '#14532d' }}>
            {crop} Price Trend
          </h3>
          <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#9ca3af' }}>Modal rate chart</p>
        </div>

        <div style={{ display: 'flex', background: '#f3f4f6', padding: '3px', borderRadius: '8px', gap: '2px' }}>
          {[
            { label: '7D', val: 7 },
            { label: '30D', val: 30 },
            { label: '90D', val: 90 },
          ].map((t) => (
            <button
              key={t.val}
              onClick={() => setTimeframe(t.val)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                background: timeframe === t.val ? '#fff' : 'transparent',
                color: timeframe === t.val ? '#14532d' : '#4b5563',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: timeframe === t.val ? '0 1px 4px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: '220px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(str) => {
                const parts = str.split('-');
                if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
                return str;
              }}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(num) => `₹${num}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPrice)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        borderTop: '1.5px solid #f3f4f6',
        paddingTop: '14px',
        textAlign: 'center'
      }}>
        <div>
          <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Min</span>
          <strong style={{ display: 'block', fontSize: '13px', color: '#374151', marginTop: '2px' }}>₹{minPrice.toLocaleString('en-IN')}</strong>
        </div>
        <div>
          <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Max</span>
          <strong style={{ display: 'block', fontSize: '13px', color: '#374151', marginTop: '2px' }}>₹{maxPrice.toLocaleString('en-IN')}</strong>
        </div>
        <div>
          <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Avg</span>
          <strong style={{ display: 'block', fontSize: '13px', color: '#14532d', marginTop: '2px' }}>₹{avgPrice.toLocaleString('en-IN')}</strong>
        </div>
      </div>
    </div>
  );
};

export default PriceChart;
